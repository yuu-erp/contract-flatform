// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IPlatformAccess
/// @notice Tầng quản trị hệ thống: chỉ có PLATFORM_OWNER (một ví) và PLATFORM_ADMIN (nhiều ví).
///         Vai trò trong agent (chủ agent, quản lý, nhân viên) KHÔNG nằm ở đây.
///         Phần owner và pause dùng OpenZeppelin (`Ownable2StepUpgradeable`, `PausableUpgradeable`), nên lỗi và event
///         của hai phần này là của OZ: `OwnableUnauthorizedAccount`, `OwnershipTransferStarted`, `OwnershipTransferred`,
///         `EnforcedPause`, `ExpectedPause`, `Paused`, `Unpaused`.
interface IPlatformAccess {
    // ─── Errors ─────────────────────────────────────────────────────────
    error ZeroAddress();
    /// @notice Contract kế thừa `PlatformAccessed` dùng lỗi này khi người gọi không phải owner.
    error NotPlatformOwner(address caller);
    error NotPlatformAdmin(address caller);
    error AlreadyAdmin(address account);
    error NotAdmin(address account);
    error OwnerCannotBeAdmin();
    error TooManyAdmins(uint256 max);
    error RenounceDisabled();
    /// @notice Ví đang là chủ agent hoặc thành viên chi nhánh nên không nhận được vai trò nền tảng.
    error AccountHasAgentRole(address account);
    error TooManyRoleSources(uint256 max);

    // ─── Events ─────────────────────────────────────────────────────────
    event PlatformAdminAdded(uint8 version, address indexed account, address indexed by);
    event PlatformAdminRemoved(uint8 version, address indexed account, address indexed by);
    event AgentRoleSourcesSet(uint8 version, address[] sources, address indexed by);

    // ─── Owner (OZ Ownable2Step) ────────────────────────────────────────
    function owner() external view returns (address);
    function pendingOwner() external view returns (address);
    /// @notice Bước 1 đổi owner (chỉ owner). Gọi lại với ví khác để thay; address(0) để huỷ.
    function transferOwnership(address newOwner) external;
    /// @notice Bước 2: ví mới nhận quyền owner.
    function acceptOwnership() external;

    // ─── Admin ──────────────────────────────────────────────────────────
    function MAX_ADMINS() external view returns (uint256);
    function addPlatformAdmin(address account) external;
    function removePlatformAdmin(address account) external;
    function isPlatformAdmin(address account) external view returns (bool);
    function platformAdminCount() external view returns (uint256);
    /// @notice Danh sách admin, phân trang.
    function platformAdmins(uint256 offset, uint256 limit) external view returns (address[] memory);

    // ─── Nguồn vai trò agent ────────────────────────────────────────────
    function MAX_ROLE_SOURCES() external view returns (uint256);
    /// @notice Contract (`IAgentRoleSource`) được hỏi trước khi thêm admin hoặc đổi owner. Chỉ owner; thay cả danh sách.
    function setAgentRoleSources(address[] calldata sources) external;
    function agentRoleSources() external view returns (address[] memory);

    // ─── Pause (OZ Pausable) ────────────────────────────────────────────
    function pause() external;
    function unpause() external;
    function paused() external view returns (bool);
    /// @notice Revert `EnforcedPause` nếu hệ đang dừng. Contract khác gọi trước khi ghi.
    function requireNotPaused() external view;
}
