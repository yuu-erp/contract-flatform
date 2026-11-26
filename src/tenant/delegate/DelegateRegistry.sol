// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {PlatformAccessed} from "../../kernel/access/PlatformAccessed.sol";
import {IDelegateRegistry} from "../../interfaces/IDelegateRegistry.sol";
import {IAgentUserRegistry} from "../../interfaces/IAgentUserRegistry.sol";
import {IAgentRegistry} from "../../interfaces/IAgentRegistry.sol";

/// @title DelegateRegistry
/// @notice T1: ví phiên / OTP / QR → tài khoản. Xem `IDelegateRegistry`, nguyên tắc 7, ADR 0035.
///         Mọi contract hỏi "người gọi là ai" bằng `resolve(agentId, msg.sender)`; không nơi nào khác giữ ví phiên.
contract DelegateRegistry is PlatformAccessed, EIP712Upgradeable, IDelegateRegistry {
    uint8 public constant EVENT_VERSION = 1;
    uint64 public constant MAX_SESSION_TTL = 24 hours;
    uint64 public constant MAX_OTP_TTL = 10 minutes;
    uint8 public constant METHOD_LOGIN = 0;
    uint8 public constant METHOD_SIGNATURE = 1;
    uint8 public constant METHOD_OTP = 2;

    bytes32 private constant OPEN_TYPEHASH = keccak256(
        "OpenSession(uint64 agentId,address account,address delegate,uint64 ttl,uint64 nonce,uint256 deadline)"
    );
    bytes32 private constant OTP_TYPEHASH =
        keccak256("OtpLogin(uint64 agentId,address otp,address delegate,uint64 ttl,uint256 deadline)");

    /// @custom:storage-location erc7201:metaplatform.tenant.delegate
    struct DelegateStorage {
        IAgentUserRegistry users;
        IAgentRegistry agents;
        mapping(address => bool) operators;
        mapping(uint64 => mapping(address => Session)) sessions; // agentId → ví phiên
        mapping(uint64 => mapping(address => Otp)) otps; // agentId → địa chỉ OTP
        mapping(uint64 => mapping(address => uint64)) nonces; // agentId → tài khoản → nonce chữ ký mở phiên
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.tenant.delegate")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant DELEGATE_STORAGE_SLOT = 0xf9832c0ac2075fd878c74a80333c56625e6c1cf535ca31b6492ece9720bce400;

    function _s() private pure returns (DelegateStorage storage $) {
        assembly {
            $.slot := DELEGATE_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address agents_, address users_) external initializer {
        __PlatformAccessed_init(access_);
        __EIP712_init("MetaNetDelegate", "1");
        if (agents_ == address(0) || users_ == address(0)) revert ZeroAddress();
        _s().agents = IAgentRegistry(agents_);
        _s().users = IAgentUserRegistry(users_);
    }

    function setOperator(address operator, bool allowed) external onlyPlatformOwner {
        if (operator == address(0)) revert ZeroAddress();
        _s().operators[operator] = allowed;
        emit OperatorSet(EVENT_VERSION, operator, allowed);
    }

    function isOperator(address operator) external view returns (bool) {
        return _s().operators[operator];
    }

    // ─── OTP ────────────────────────────────────────────────────────────

    function issueOtp(uint64 agentId, address account, address otp, uint64 ttl, address actor) external whenNotPaused {
        DelegateStorage storage $ = _s();
        if (!$.operators[msg.sender]) revert NotOperator(msg.sender);
        $.agents.requireAgentWritable(agentId);
        if (otp == address(0)) revert ZeroAddress();
        if (ttl == 0 || ttl > MAX_OTP_TTL) revert InvalidTtl(MAX_OTP_TTL);
        _requireActive(agentId, account);
        _requireFreeKey(agentId, otp);
        if ($.otps[agentId][otp].expiresAt > block.timestamp) revert OtpInUse(agentId, otp);
        uint64 expiresAt = uint64(block.timestamp) + ttl;
        $.otps[agentId][otp] = Otp({account: account, expiresAt: expiresAt});
        emit OtpIssued(EVENT_VERSION, agentId, account, otp, expiresAt, actor);
    }

    // ─── Mở / thu hồi ví phiên ──────────────────────────────────────────

    function openSession(uint64 agentId, address delegate, uint64 ttl) external whenNotPaused {
        address account = _s().users.accountOfLogin(agentId, msg.sender);
        if (account == address(0)) revert NotLogin(agentId, msg.sender);
        _open(agentId, account, delegate, ttl, METHOD_LOGIN);
    }

    function openSessionBySig(
        uint64 agentId,
        address account,
        address delegate,
        uint64 ttl,
        uint256 deadline,
        bytes calldata signature
    ) external whenNotPaused {
        DelegateStorage storage $ = _s();
        address login = $.users.getUser(agentId, account).loginAddress;
        if (login == address(0)) revert UserNotActive(agentId, account);
        uint64 nonce = $.nonces[agentId][account]++;
        _verify(
            keccak256(abi.encode(OPEN_TYPEHASH, agentId, account, delegate, ttl, nonce, deadline)),
            deadline,
            login,
            signature
        );
        _open(agentId, account, delegate, ttl, METHOD_SIGNATURE);
    }

    function openSessionByOtp(
        uint64 agentId,
        address otp,
        address delegate,
        uint64 ttl,
        uint256 deadline,
        bytes calldata signature
    ) external whenNotPaused {
        DelegateStorage storage $ = _s();
        Otp memory o = $.otps[agentId][otp];
        if (o.account == address(0)) revert OtpNotFound(agentId, otp);
        if (block.timestamp > o.expiresAt) revert OtpExpired(agentId, otp);
        _verify(keccak256(abi.encode(OTP_TYPEHASH, agentId, otp, delegate, ttl, deadline)), deadline, otp, signature);
        delete $.otps[agentId][otp]; // dùng một lần
        _open(agentId, o.account, delegate, ttl, METHOD_OTP);
    }

    function revokeSession(uint64 agentId, address delegate) external {
        Session storage s = _s().sessions[agentId][delegate];
        address account = s.account;
        if (account == address(0)) revert NotSessionOwner(agentId, delegate, msg.sender);
        if (msg.sender != delegate && resolve(agentId, msg.sender) != account) {
            revert NotSessionOwner(agentId, delegate, msg.sender);
        }
        delete _s().sessions[agentId][delegate];
        emit SessionRevoked(EVENT_VERSION, agentId, account, delegate, msg.sender);
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function sessionOf(uint64 agentId, address delegate) external view returns (Session memory) {
        return _s().sessions[agentId][delegate];
    }

    function otpOf(uint64 agentId, address otp) external view returns (Otp memory) {
        return _s().otps[agentId][otp];
    }

    function nonceOf(uint64 agentId, address account) external view returns (uint64) {
        return _s().nonces[agentId][account];
    }

    function resolve(uint64 agentId, address caller) public view returns (address) {
        DelegateStorage storage $ = _s();
        Session storage s = $.sessions[agentId][caller];
        if (s.account != address(0) && s.expiresAt > block.timestamp) {
            IAgentUserRegistry.UserView memory u = $.users.getUser(agentId, s.account);
            if (u.status == IAgentUserRegistry.UserStatus.Active && u.loginEpoch == s.loginEpoch) return s.account;
        }
        address account = $.users.accountOfLogin(agentId, caller);
        return account != address(0) ? account : caller;
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _open(uint64 agentId, address account, address delegate, uint64 ttl, uint8 method) private {
        DelegateStorage storage $ = _s();
        $.agents.requireAgentWritable(agentId);
        if (delegate == address(0)) revert ZeroAddress();
        if (ttl == 0 || ttl > MAX_SESSION_TTL) revert InvalidTtl(MAX_SESSION_TTL);
        IAgentUserRegistry.UserView memory u = $.users.getUser(agentId, account);
        if (u.status != IAgentUserRegistry.UserStatus.Active) revert UserNotActive(agentId, account);
        _requireFreeKey(agentId, delegate);
        Session storage cur = $.sessions[agentId][delegate];
        if (cur.account != address(0) && cur.account != account && cur.expiresAt > block.timestamp) {
            revert DelegateInUse(agentId, delegate);
        }
        uint64 expiresAt = uint64(block.timestamp) + ttl;
        $.sessions[agentId][delegate] = Session({account: account, expiresAt: expiresAt, loginEpoch: u.loginEpoch});
        emit SessionOpened(EVENT_VERSION, agentId, account, delegate, expiresAt, method, msg.sender);
    }

    /// @dev Khoá (ví phiên, OTP) không được trùng địa chỉ đăng nhập hay định danh của một tài khoản.
    function _requireFreeKey(uint64 agentId, address key) private view {
        IAgentUserRegistry users = _s().users;
        if (users.accountOfLogin(agentId, key) != address(0)) revert DelegateInUse(agentId, key);
        try users.getUser(agentId, key) returns (IAgentUserRegistry.UserView memory) {
            revert DelegateInUse(agentId, key); // là định danh của một tài khoản
        } catch {}
    }

    function _requireActive(uint64 agentId, address account) private view {
        if (!_s().users.isActive(agentId, account)) revert UserNotActive(agentId, account);
    }

    function _verify(bytes32 structHash, uint256 deadline, address expected, bytes calldata signature) private view {
        if (block.timestamp > deadline) revert SignatureExpired(deadline);
        (address signer, ECDSA.RecoverError err,) = ECDSA.tryRecover(_hashTypedDataV4(structHash), signature);
        if (err != ECDSA.RecoverError.NoError || signer != expected || signer == address(0)) revert InvalidSignature();
    }
}
