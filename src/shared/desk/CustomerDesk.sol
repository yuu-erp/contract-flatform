// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../../kernel/access/PlatformAccessed.sol";
import {ICustomerDesk} from "../../interfaces/ICustomerDesk.sol";
import {IAgentUserRegistry} from "../../interfaces/IAgentUserRegistry.sol";
import {IDelegateRegistry} from "../../interfaces/IDelegateRegistry.sol";
import {IPermission} from "../../interfaces/IPermission.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";

/// @title CustomerDesk
/// @notice T2 quầy khách (ADR 0035). Người làm (`actor`) = `DelegateRegistry.resolve(msg.sender)`: nhân viên đăng nhập
///         bằng mật khẩu, ví phiên máy quầy hay ví thật đều quy về tài khoản. Quyền nền tảng (module 0) kiểm ở Permission.
///         Không giữ dữ liệu khách; mọi thay đổi nằm ở T1.
contract CustomerDesk is PlatformAccessed, ICustomerDesk {
    uint8 public constant PERM_REGISTER = 0;
    uint8 public constant PERM_PROFILE = 1;
    uint8 public constant PERM_OTP = 2;
    uint8 public constant PERM_RESET_LOGIN = 3;
    uint8 public constant PERM_BLOCK = 9;

    /// @custom:storage-location erc7201:metaplatform.shared.desk
    struct DeskStorage {
        IBranchRegistry branches;
        IPermission permission;
        IAgentUserRegistry users;
        IDelegateRegistry delegate;
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.shared.desk")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant DESK_STORAGE_SLOT = 0x46f54f09510f92d8e07ee5699734c08fe18cebf304737cafc107b4eac47cdf00;

    function _s() private pure returns (DeskStorage storage $) {
        assembly {
            $.slot := DESK_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address branches_, address permission_, address users_, address delegate_)
        external
        initializer
    {
        __PlatformAccessed_init(access_);
        if (branches_ == address(0) || permission_ == address(0) || users_ == address(0) || delegate_ == address(0)) {
            revert ZeroAddress();
        }
        DeskStorage storage $ = _s();
        $.branches = IBranchRegistry(branches_);
        $.permission = IPermission(permission_);
        $.users = IAgentUserRegistry(users_);
        $.delegate = IDelegateRegistry(delegate_);
    }

    function registerCustomer(
        uint64 branchId,
        address account,
        string calldata username,
        IAgentUserRegistry.UserProfile calldata profile
    ) external whenNotPaused {
        (uint64 agentId, address actor) = _authorize(branchId, PERM_REGISTER);
        _s().users.registerFor(agentId, branchId, actor, account, username, profile);
    }

    function updateCustomerProfile(uint64 branchId, address account, IAgentUserRegistry.UserProfile calldata profile)
        external
        whenNotPaused
    {
        (uint64 agentId, address actor) = _authorize(branchId, PERM_PROFILE);
        _s().users.updateProfileFor(agentId, branchId, actor, account, profile);
    }

    function issueOtp(uint64 branchId, address account, address otp, uint64 ttl) external whenNotPaused {
        (uint64 agentId, address actor) = _authorize(branchId, PERM_OTP);
        _s().delegate.issueOtp(agentId, account, otp, ttl, actor);
    }

    function resetCustomerLogin(uint64 branchId, address account, address newLogin) external whenNotPaused {
        (uint64 agentId, address actor) = _authorize(branchId, PERM_RESET_LOGIN);
        _s().users.resetLoginFor(agentId, branchId, actor, account, newLogin);
    }

    function setCustomerBlocked(uint64 branchId, address account, bool blocked, string calldata reason)
        external
        whenNotPaused
    {
        (uint64 agentId, address actor) = _authorize(branchId, PERM_BLOCK);
        _s().users.setBlockedFor(agentId, branchId, actor, account, blocked, reason);
    }

    /// @dev Quy người gọi về tài khoản thật rồi kiểm quyền nền tảng `perm` ở chi nhánh.
    function _authorize(uint64 branchId, uint8 perm) private view returns (uint64 agentId, address actor) {
        DeskStorage storage $ = _s();
        agentId = $.branches.getBranch(branchId).agentId;
        actor = $.delegate.resolve(agentId, msg.sender);
        $.permission.requirePermission(branchId, actor, 0, perm);
    }
}
