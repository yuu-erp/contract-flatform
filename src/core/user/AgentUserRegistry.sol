// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {PlatformAccessed} from "../access/PlatformAccessed.sol";
import {PlatformAuditing} from "../history/PlatformAuditing.sol";
import {IAgentUserRegistry} from "../../interfaces/IAgentUserRegistry.sol";
import {IAgentAccess} from "../../interfaces/IAgentAccess.sol";
import {IAgentRegistry} from "../../interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";
import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";
import {FullDBCodec} from "../../libraries/FullDBCodec.sol";
import {LedgerMetrics} from "../../libraries/LedgerMetrics.sol";
import {TextRules} from "../../libraries/TextRules.sol";

/// @title AgentUserRegistry
/// @notice Người dùng theo agent (docs/modules/core-user.md). Storage giữ những gì hàm ghi cần (username, địa chỉ
///         đăng nhập, trạng thái, nonce); hồ sơ hiển thị (tên, SĐT…) ở FullDB kind `users`, db theo agent.
///         Không lưu gì về mật khẩu: client sinh `loginAddress` từ username + mật khẩu (scrypt) và chỉ gửi chữ ký.
contract AgentUserRegistry is PlatformAccessed, PlatformAuditing, EIP712Upgradeable, IAgentUserRegistry {
    uint8 public constant EVENT_VERSION = 1;
    uint8 internal constant RECORD_VERSION = 1;
    uint256 internal constant MAX_PAGE = 100;
    uint256 internal constant MAX_RANGE_DAYS = 93;
    uint64 public constant MAX_OTP_TTL = 10 minutes;
    uint256 internal constant MAX_DISPLAY_NAME = 50;
    uint256 internal constant MAX_FULL_NAME = 100;
    uint256 internal constant MAX_NOTE = 200;
    uint256 internal constant MAX_REASON = 200;
    string public constant KIND_USERS = "users";
    string internal constant P_USER = "U";

    bytes32 internal constant REGISTER_TYPEHASH = keccak256(
        "Register(uint64 agentId,uint64 branchId,address account,string username,bytes32 profileHash,uint256 deadline)"
    );
    bytes32 internal constant CHANGE_PASSWORD_TYPEHASH =
        keccak256("ChangePassword(uint64 agentId,address account,address newLogin,uint64 nonce,uint256 deadline)");
    bytes32 internal constant CHANGE_USERNAME_TYPEHASH =
        keccak256("ChangeUsername(uint64 agentId,address account,string username,uint64 nonce,uint256 deadline)");
    bytes32 internal constant UPDATE_PROFILE_TYPEHASH =
        keccak256("UpdateProfile(uint64 agentId,address account,bytes32 profileHash,uint64 nonce,uint256 deadline)");

    /// @custom:storage-location erc7201:metaplatform.core.user.agentusers
    struct UsersStorage {
        IAgentRegistry agents;
        IBranchRegistry branches;
        IAgentAccess agentAccess;
        IHistoryIndex history;
        address delegateRegistry;
        mapping(uint64 => mapping(address => User)) users; // agentId → account
        mapping(uint64 => mapping(bytes32 => address)) accountByUsername; // agentId → keccak(username)
        mapping(uint64 => mapping(address => address)) accountByLogin; // agentId → loginAddress → account
        mapping(uint64 => address[]) userList; // agentId → account (chỉ thêm, không xoá)
        mapping(uint64 => mapping(address => Otp)) otps; // agentId → otpAddress
        mapping(uint64 => uint256) branchUserCount; // branchId → số người đăng ký tại đó
        mapping(uint64 => mapping(uint32 => uint32)) newByAgentDay; // agentId → ngày → số đăng ký
        mapping(uint64 => mapping(uint32 => uint32)) newByBranchDay; // branchId → ngày → số đăng ký
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.core.user.agentusers")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant USERS_STORAGE_SLOT = 0x0f4c13af02798ca4480374e76036a545c21f104040e8488a82e6296a706aac00;

    function _s() private pure returns (UsersStorage storage $) {
        assembly {
            $.slot := USERS_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address agents_, address branches_, address agentAccess_, address history_)
        external
        initializer
    {
        __PlatformAccessed_init(access_);
        __EIP712_init("MetaNetUsers", "1");
        if (agents_ == address(0) || branches_ == address(0) || agentAccess_ == address(0) || history_ == address(0)) {
            revert ZeroAddress();
        }
        UsersStorage storage $ = _s();
        $.agents = IAgentRegistry(agents_);
        $.branches = IBranchRegistry(branches_);
        $.agentAccess = IAgentAccess(agentAccess_);
        $.history = IHistoryIndex(history_);
    }

    // ─── Cấu hình ───────────────────────────────────────────────────────

    function setDelegateRegistry(address delegateRegistry_) external onlyPlatformOwner {
        if (delegateRegistry_ == address(0)) revert ZeroAddress();
        _s().delegateRegistry = delegateRegistry_;
        emit DelegateRegistrySet(EVENT_VERSION, delegateRegistry_);
    }

    // ─── Khách tự làm (EIP-712) ─────────────────────────────────────────

    function registerBySig(
        uint64 agentId,
        uint64 branchId,
        address account,
        string calldata username,
        UserProfile calldata profile,
        uint256 deadline,
        bytes calldata signature
    ) external {
        _checkBranch(agentId, branchId);
        bytes32 structHash = keccak256(
            abi.encode(
                REGISTER_TYPEHASH,
                agentId,
                branchId,
                account,
                keccak256(bytes(username)),
                _profileHash(profile),
                deadline
            )
        );
        _verify(structHash, deadline, account, signature);
        _register(agentId, branchId, account, username, profile, account);
    }

    function changePasswordBySig(
        uint64 agentId,
        address account,
        address newLogin,
        uint256 deadline,
        bytes calldata signature
    ) external {
        _s().agents.requireAgentWritable(agentId);
        User storage u = _active(agentId, account);
        _verify(
            keccak256(abi.encode(CHANGE_PASSWORD_TYPEHASH, agentId, account, newLogin, u.nonce, deadline)),
            deadline,
            u.loginAddress,
            signature
        );
        ++u.nonce;
        _setLogin(agentId, account, u, newLogin, false, 0);
    }

    function changeUsernameBySig(
        uint64 agentId,
        address account,
        string calldata username,
        uint256 deadline,
        bytes calldata signature
    ) external {
        _s().agents.requireAgentWritable(agentId);
        User storage u = _active(agentId, account);
        _verify(
            keccak256(
                abi.encode(CHANGE_USERNAME_TYPEHASH, agentId, account, keccak256(bytes(username)), u.nonce, deadline)
            ),
            deadline,
            u.loginAddress,
            signature
        );
        ++u.nonce;
        UsersStorage storage $ = _s();
        string memory old = u.username;
        bytes32 newKey = _claimUsername(agentId, username);
        delete $.accountByUsername[agentId][keccak256(bytes(old))];
        $.accountByUsername[agentId][newKey] = account;
        u.username = username;
        emit UsernameChanged(EVENT_VERSION, agentId, account, old, username);
    }

    function updateProfileBySig(
        uint64 agentId,
        address account,
        UserProfile calldata profile,
        uint256 deadline,
        bytes calldata signature
    ) external {
        _s().agents.requireAgentWritable(agentId);
        User storage u = _active(agentId, account);
        _verify(
            keccak256(abi.encode(UPDATE_PROFILE_TYPEHASH, agentId, account, _profileHash(profile), u.nonce, deadline)),
            deadline,
            u.loginAddress,
            signature
        );
        ++u.nonce;
        _writeProfile(agentId, account, u, profile, false, 0);
    }

    // ─── Staff ──────────────────────────────────────────────────────────

    function registerByStaff(
        uint64 agentId,
        uint64 branchId,
        address account,
        string calldata username,
        UserProfile calldata profile
    ) external {
        _requireBranchRole(agentId, branchId, IAgentAccess.Role.Staff);
        _register(agentId, branchId, account, username, profile, msg.sender);
        _audit("user_register", agentId, branchId, "", abi.encode(account, username), "");
    }

    function resetPassword(uint64 agentId, uint64 branchId, address account, address newLogin) external {
        _requireBranchRole(agentId, branchId, IAgentAccess.Role.Staff);
        User storage u = _active(agentId, account);
        address old = u.loginAddress;
        _setLogin(agentId, account, u, newLogin, true, branchId);
        _audit("user_password_reset", agentId, branchId, abi.encode(account, old), abi.encode(account, newLogin), "");
    }

    function updateProfileByStaff(uint64 agentId, uint64 branchId, address account, UserProfile calldata profile)
        external
    {
        _requireBranchRole(agentId, branchId, IAgentAccess.Role.Staff);
        _writeProfile(agentId, account, _active(agentId, account), profile, true, branchId);
    }

    function issueOtp(uint64 agentId, uint64 branchId, address account, address otpAddress, uint64 ttl) external {
        _requireBranchRole(agentId, branchId, IAgentAccess.Role.Staff);
        _active(agentId, account);
        if (otpAddress == address(0)) revert ZeroAddress();
        if (ttl == 0 || ttl > MAX_OTP_TTL) revert InvalidOtpTtl(MAX_OTP_TTL);
        UsersStorage storage $ = _s();
        // OTP và địa chỉ đăng nhập không được trùng nhau (cùng là khoá sinh ở client).
        if ($.accountByLogin[agentId][otpAddress] != address(0) || $.users[agentId][otpAddress].createdAt != 0) {
            revert LoginInUse(agentId, otpAddress);
        }
        uint64 expiresAt = uint64(block.timestamp) + ttl;
        $.otps[agentId][otpAddress] = Otp({account: account, expiresAt: expiresAt});
        emit OtpIssued(EVENT_VERSION, agentId, account, otpAddress, expiresAt, msg.sender, branchId);
        _audit("user_otp", agentId, branchId, "", abi.encode(account, otpAddress, expiresAt), "");
    }

    // ─── Manager ────────────────────────────────────────────────────────

    function setBlocked(uint64 agentId, uint64 branchId, address account, bool blocked, string calldata reason)
        external
    {
        _requireBranchRole(agentId, branchId, IAgentAccess.Role.Manager);
        uint256 n = bytes(reason).length;
        if (n == 0) revert EmptyReason();
        if (n > MAX_REASON) revert FieldTooLong();
        User storage u = _existing(agentId, account);
        UserStatus from = u.status;
        UserStatus to = blocked ? UserStatus.Blocked : UserStatus.Active;
        if (from == to) revert StatusUnchanged();
        u.status = to;
        emit UserStatusChanged(EVENT_VERSION, agentId, account, from, to, msg.sender, branchId, reason);
        _audit(
            blocked ? "user_block" : "user_unblock",
            agentId,
            branchId,
            abi.encode(account, from),
            abi.encode(account, to),
            reason
        );
    }

    // ─── DelegateRegistry ───────────────────────────────────────────────

    function consumeOtp(uint64 agentId, address otpAddress) external whenNotPaused returns (address account) {
        UsersStorage storage $ = _s();
        if (msg.sender != $.delegateRegistry) revert NotDelegateRegistry(msg.sender);
        Otp memory otp = $.otps[agentId][otpAddress];
        if (otp.account == address(0)) revert OtpNotFound(agentId, otpAddress);
        delete $.otps[agentId][otpAddress];
        if (block.timestamp > otp.expiresAt) revert OtpExpired(agentId, otpAddress);
        account = otp.account;
        _active(agentId, account);
        emit OtpConsumed(EVENT_VERSION, agentId, account, otpAddress);
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function delegateRegistry() external view returns (address) {
        return _s().delegateRegistry;
    }

    function getUser(uint64 agentId, address account) external view returns (UserView memory) {
        return _view(account, _existing(agentId, account));
    }

    function getProfile(uint64 agentId, address account) external view returns (UserProfileRecord memory) {
        User storage u = _existing(agentId, account);
        return abi.decode(_s().history.get(agentId, KIND_USERS, u.profileDocId), (UserProfileRecord));
    }

    function accountOf(uint64 agentId, string calldata username) external view returns (address) {
        return _s().accountByUsername[agentId][keccak256(bytes(username))];
    }

    function accountOfLogin(uint64 agentId, address login) external view returns (address) {
        return _s().accountByLogin[agentId][login];
    }

    function isActive(uint64 agentId, address account) external view returns (bool) {
        return _s().users[agentId][account].status == UserStatus.Active;
    }

    function otpOf(uint64 agentId, address otpAddress) external view returns (Otp memory) {
        return _s().otps[agentId][otpAddress];
    }

    function userCount(uint64 agentId) external view returns (uint256) {
        return _s().userList[agentId].length;
    }

    function usersOf(uint64 agentId, uint256 offset, uint256 limit) external view returns (UserView[] memory out) {
        UsersStorage storage $ = _s();
        address[] storage list = $.userList[agentId];
        uint256 len = list.length;
        if (limit > MAX_PAGE) limit = MAX_PAGE;
        uint256 start = offset > len ? len : offset;
        uint256 end = limit > len - start ? len : start + limit;
        out = new UserView[](end - start);
        for (uint256 i = start; i < end; ++i) {
            address a = list[i];
            out[i - start] = _view(a, $.users[agentId][a]);
        }
    }

    function userCountOfBranch(uint64 branchId) external view returns (uint256) {
        return _s().branchUserCount[branchId];
    }

    function newUsersByDay(uint64 agentId, uint32 fromDay, uint32 toDay) external view returns (uint32[] memory) {
        return _days(_s().newByAgentDay[agentId], fromDay, toDay);
    }

    function newUsersByBranchDay(uint64 branchId, uint32 fromDay, uint32 toDay)
        external
        view
        returns (uint32[] memory)
    {
        return _days(_s().newByBranchDay[branchId], fromDay, toDay);
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _register(
        uint64 agentId,
        uint64 branchId,
        address account,
        string calldata username,
        UserProfile calldata profile,
        address registeredBy
    ) private {
        if (account == address(0)) revert ZeroAddress();
        UsersStorage storage $ = _s();
        if ($.users[agentId][account].createdAt != 0) revert AccountExists(agentId, account);
        if ($.accountByLogin[agentId][account] != address(0) || $.otps[agentId][account].account != address(0)) {
            revert LoginInUse(agentId, account);
        }
        _checkProfile(profile);
        bytes32 key = _claimUsername(agentId, username);

        uint256 docId = _appendProfile(agentId, branchId, account, profile);

        User storage u = $.users[agentId][account];
        u.loginAddress = account;
        u.createdAt = uint64(block.timestamp);
        u.registeredBy = registeredBy;
        u.registeredBranch = branchId;
        u.status = UserStatus.Active;
        u.profileDocId = docId;
        u.username = username;
        $.accountByUsername[agentId][key] = account;
        $.accountByLogin[agentId][account] = account;
        $.userList[agentId].push(account);
        _countNew(agentId, branchId);

        emit UserRegistered(EVENT_VERSION, agentId, account, username, branchId, registeredBy, docId);
    }

    function _appendProfile(uint64 agentId, uint64 branchId, address account, UserProfile calldata profile)
        private
        returns (uint256 docId)
    {
        IHistoryIndex.Term[] memory terms = new IHistoryIndex.Term[](2);
        terms[0] = IHistoryIndex.Term(P_BRANCH, FullDBCodec.toDecimal(branchId));
        terms[1] = IHistoryIndex.Term(P_USER, FullDBCodec.toHex(account));
        IHistoryIndex.Value[] memory values = new IHistoryIndex.Value[](1);
        values[0] = IHistoryIndex.Value(SLOT_TIME, block.timestamp);
        docId = _s().history.append(agentId, KIND_USERS, _record(agentId, account, profile), terms, values);
    }

    function _countNew(uint64 agentId, uint64 branchId) private {
        UsersStorage storage $ = _s();
        ++$.branchUserCount[branchId];
        uint32 d = LedgerMetrics.day(block.timestamp, $.branches.getBranch(branchId).tzOffsetMinutes);
        ++$.newByAgentDay[agentId][d];
        ++$.newByBranchDay[branchId][d];
    }

    function _setLogin(uint64 agentId, address account, User storage u, address newLogin, bool byStaff, uint64 branchId)
        private
    {
        if (newLogin == address(0)) revert ZeroAddress();
        UsersStorage storage $ = _s();
        // Địa chỉ mới không được đang là đăng nhập, định danh của người khác hay một OTP còn chờ.
        if (
            $.accountByLogin[agentId][newLogin] != address(0)
                || (newLogin != account && $.users[agentId][newLogin].createdAt != 0)
                || $.otps[agentId][newLogin].account != address(0)
        ) revert LoginInUse(agentId, newLogin);
        address old = u.loginAddress;
        delete $.accountByLogin[agentId][old];
        $.accountByLogin[agentId][newLogin] = account;
        u.loginAddress = newLogin;
        uint32 epoch = ++u.loginEpoch;
        emit UserLoginChanged(EVENT_VERSION, agentId, account, old, newLogin, epoch, byStaff, msg.sender, branchId);
    }

    function _writeProfile(
        uint64 agentId,
        address account,
        User storage u,
        UserProfile calldata profile,
        bool byStaff,
        uint64 branchId
    ) private {
        _checkProfile(profile);
        IHistoryIndex history = _s().history;
        bytes memory before = history.get(agentId, KIND_USERS, u.profileDocId);
        bytes memory after_ = _record(agentId, account, profile);
        history.replace(agentId, KIND_USERS, u.profileDocId, after_);
        emit UserProfileUpdated(EVENT_VERSION, agentId, account, msg.sender);
        if (byStaff) _audit("user_profile", agentId, branchId, before, after_, "");
    }

    function _claimUsername(uint64 agentId, string calldata username) private view returns (bytes32 key) {
        if (!TextRules.isUsername(string(username))) revert InvalidUsername();
        key = keccak256(bytes(username));
        if (_s().accountByUsername[agentId][key] != address(0)) revert UsernameTaken(agentId, username);
    }

    function _checkBranch(uint64 agentId, uint64 branchId) private view {
        UsersStorage storage $ = _s();
        $.agents.requireAgentWritable(agentId); // gồm kiểm hệ không pause
        IBranchRegistry.Branch memory br = $.branches.getBranch(branchId);
        if (br.agentId != agentId) revert BranchNotInAgent(branchId, agentId);
        if (br.status != IBranchRegistry.BranchStatus.Active) revert BranchNotActive(branchId);
    }

    function _requireBranchRole(uint64 agentId, uint64 branchId, IAgentAccess.Role minRole) private view {
        _checkBranch(agentId, branchId);
        if (!_s().agentAccess.hasRole(branchId, msg.sender, minRole)) {
            revert MissingRole(branchId, msg.sender, uint8(minRole));
        }
    }

    function _existing(uint64 agentId, address account) private view returns (User storage u) {
        u = _s().users[agentId][account];
        if (u.createdAt == 0) revert UserNotFound(agentId, account);
    }

    function _active(uint64 agentId, address account) private view returns (User storage u) {
        u = _existing(agentId, account);
        if (u.status != UserStatus.Active) revert UserNotActive(agentId, account);
    }

    function _verify(bytes32 structHash, uint256 deadline, address expected, bytes calldata signature) private view {
        if (block.timestamp > deadline) revert SignatureExpired(deadline);
        (address signer, ECDSA.RecoverError err,) = ECDSA.tryRecover(_hashTypedDataV4(structHash), signature);
        if (err != ECDSA.RecoverError.NoError || signer != expected || signer == address(0)) {
            revert InvalidSignature();
        }
    }

    function _checkProfile(UserProfile calldata p) private pure {
        uint256 n = bytes(p.displayName).length;
        if (n == 0 || n > MAX_DISPLAY_NAME) revert InvalidProfile();
        if (bytes(p.fullName).length > MAX_FULL_NAME || bytes(p.note).length > MAX_NOTE) revert FieldTooLong();
        if (!TextRules.isPhone(p.phone) || !TextRules.isDate(p.birthday)) revert InvalidProfile();
    }

    function _profileHash(UserProfile calldata p) private pure returns (bytes32) {
        return keccak256(abi.encode(p));
    }

    function _record(uint64 agentId, address account, UserProfile calldata profile)
        private
        view
        returns (bytes memory)
    {
        return abi.encode(
            UserProfileRecord({
                version: RECORD_VERSION,
                agentId: agentId,
                account: account,
                profile: profile,
                updatedAt: uint64(block.timestamp)
            })
        );
    }

    function _view(address account, User storage u) private view returns (UserView memory) {
        return UserView({
            account: account,
            loginAddress: u.loginAddress,
            createdAt: u.createdAt,
            loginEpoch: u.loginEpoch,
            registeredBy: u.registeredBy,
            registeredBranch: u.registeredBranch,
            status: u.status,
            nonce: u.nonce,
            profileDocId: u.profileDocId,
            username: u.username
        });
    }

    function _days(mapping(uint32 => uint32) storage m, uint32 fromDay, uint32 toDay)
        private
        view
        returns (uint32[] memory out)
    {
        if (fromDay > toDay || toDay - fromDay >= MAX_RANGE_DAYS) revert InvalidRange();
        out = new uint32[](toDay - fromDay + 1);
        for (uint32 d = fromDay; d <= toDay; ++d) {
            out[d - fromDay] = m[d];
        }
    }

    function _audit(
        string memory action,
        uint64 agentId,
        uint64 branchId,
        bytes memory before,
        bytes memory after_,
        string memory reason
    ) private {
        _writeAudit(_s().history, action, agentId, branchId, before, after_, reason);
    }
}
