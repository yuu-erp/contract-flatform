// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IAgentAccess
/// @notice Vai trò cấp chi nhánh của agent: quản lý (Manager) và nhân viên (Staff).
///         - Chủ agent (`AgentRegistry.Agent.owner`) có toàn quyền trên mọi chi nhánh của agent; vai trò này
///           không lưu ở đây mà đọc từ AgentRegistry, nên đổi chủ agent là đổi quyền ngay.
///         - Chủ agent cấp/thu Manager và Staff. Manager cấp/thu Staff trong chi nhánh của mình.
///         - Tầng quản trị nền tảng (PLATFORM_OWNER/ADMIN) không cấp vai trò agent và không được nhận vai trò agent.
///         Đặc tả: docs/modules/core-access.md.
interface IAgentAccess {
    /// @dev Thứ tự là thứ bậc: so sánh `>=` để kiểm "ít nhất vai trò X". `Owner` không bao giờ lưu.
    enum Role {
        None,
        Staff,
        Manager,
        Owner
    }

    /// @notice Dữ liệu storage của một thành viên trong chi nhánh (một slot).
    struct Member {
        address grantedBy;
        uint64 grantedAt;
        uint16 indexPlusOne; // vị trí trong danh sách thành viên chi nhánh + 1; 0 = không phải thành viên
        Role role;
    }

    struct MemberView {
        address account;
        Role role;
        address grantedBy;
        uint64 grantedAt;
    }

    error ZeroAddress();
    error InvalidRole(Role role);
    error RoleUnchanged(uint64 branchId, address account, Role role);
    error NotMember(uint64 branchId, address account);
    error NotAuthorized(address caller, uint64 branchId);
    error BranchNotActive(uint64 branchId);
    error AccountIsPlatformRole(address account);
    error AccountIsAgentOwner(address account, uint64 agentId);
    error TooManyMembers(uint64 branchId);
    error TooManyBranches(address account);
    error MissingRole(uint64 branchId, address account, Role required);

    /// @notice `from` = None: cấp mới. `to` = None: thu hồi (kể cả tự rời).
    event RoleChanged(
        uint8 version,
        uint64 indexed agentId,
        uint64 indexed branchId,
        address indexed account,
        Role from,
        Role to,
        address by
    );

    // ─── Hằng ──────────────────────────────────────────────────────────
    function MAX_MEMBERS_PER_BRANCH() external view returns (uint16);
    function MAX_BRANCHES_PER_ACCOUNT() external view returns (uint16);

    // ─── Ghi ────────────────────────────────────────────────────────────
    /// @notice Cấp hoặc đổi vai trò (`Staff` | `Manager`). Chi nhánh và agent phải Active.
    ///         Chủ agent: mọi trường hợp. Manager của chi nhánh: chỉ cấp Staff cho ví chưa có vai trò.
    function grantRole(uint64 branchId, address account, Role role) external;
    /// @notice Thu vai trò. Chủ agent: mọi thành viên. Manager: chỉ Staff của chi nhánh mình.
    ///         Chạy được cả khi chi nhánh/agent đã dừng hoặc xoá, để luôn thu quyền được.
    function revokeRole(uint64 branchId, address account) external;
    /// @notice Thành viên tự rời chi nhánh (ví bị lộ, nghỉ việc).
    function renounceRole(uint64 branchId) external;

    // ─── Đọc ────────────────────────────────────────────────────────────
    function agentRegistry() external view returns (address);
    function branchRegistry() external view returns (address);
    /// @notice Vai trò đã lưu (None | Staff | Manager), không tính chủ agent.
    function roleOf(uint64 branchId, address account) external view returns (Role);
    /// @notice Vai trò hiệu lực: `Owner` nếu là chủ agent của chi nhánh, không thì vai trò đã lưu.
    function effectiveRoleOf(uint64 branchId, address account) external view returns (Role);
    function hasRole(uint64 branchId, address account, Role minRole) external view returns (bool);
    /// @notice Module gọi để kiểm quyền; revert `MissingRole` nếu vai trò hiệu lực thấp hơn `minRole`.
    ///         Không kiểm trạng thái chi nhánh/dịch vụ: module gọi thêm `BranchRegistry.requireWritable`.
    function requireRole(uint64 branchId, address account, Role minRole) external view;
    function getMember(uint64 branchId, address account) external view returns (Member memory);
    function memberCountOf(uint64 branchId) external view returns (uint256);
    function membersOf(uint64 branchId, uint256 offset, uint256 limit) external view returns (MemberView[] memory);
    function branchCountOfAccount(address account) external view returns (uint256);
    function branchesOfAccount(address account, uint256 offset, uint256 limit) external view returns (uint64[] memory);
}
