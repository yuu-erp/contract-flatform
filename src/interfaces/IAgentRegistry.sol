// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IAgentRegistry
/// @notice Agent (chủ cửa hàng thuê dịch vụ) ở tầng quản trị: chỉ PLATFORM_ADMIN tạo, sửa, dừng, xoá.
///         Dữ liệu nghiệp vụ của agent không bị đụng tới: "xoá" là xoá mềm, mọi thứ vẫn đọc được.
///         Đặc tả: docs/modules/core-operator.md.
interface IAgentRegistry {
    /// @dev None: chưa tồn tại. Active: hoạt động. Suspended: tạm dừng, chỉ đọc, mở lại được.
    ///      Deleted: đã xoá mềm, chỉ đọc vĩnh viễn, không mở lại.
    enum AgentStatus {
        None,
        Active,
        Suspended,
        Deleted
    }

    /// @notice Dữ liệu storage của agent (dùng cho quyết định on-chain).
    struct Agent {
        uint64 id;
        address owner;
        address pendingOwner;
        AgentStatus status;
        uint64 createdAt;
        uint64 updatedAt;
        uint256 profileDocId; // docId hồ sơ trong FullDB `mp1_platform_agents`
        uint16 allowedServices; // module được cấp: NET = 1, IQR = 2, LOYALTY = 4. Chi nhánh chỉ bật tập con.
    }

    /// @notice Hồ sơ hiển thị, lưu FullDB. **Công khai, không xoá được**: `storePhone` là số liên hệ của cửa hàng,
    ///         lưu rõ theo quyết định người dùng (2026-11-18). Chỉ nối thêm trường mới vào cuối.
    struct AgentProfile {
        string storeName;
        string storeAddress;
        string note;
        string storePhone; // 0–20 ký tự: chữ số, '+', '-', '.', ' ', '(', ')'; có thể rỗng
    }

    /// @notice Bản ghi FullDB của hồ sơ: `abi.encode(AgentProfileRecord)`.
    struct AgentProfileRecord {
        uint8 version;
        uint64 agentId;
        address owner;
        AgentProfile profile;
        uint64 updatedAt;
    }

    error ZeroAddress();
    error AgentNotFound(uint64 agentId);
    error OwnerAlreadyHasAgent(address owner, uint64 agentId);
    error OwnerIsPlatformRole(address owner);
    error InvalidStoreName();
    error FieldTooLong();
    error InvalidPhone();
    error InvalidStatusTransition(AgentStatus from, AgentStatus to);
    error AgentDeleted(uint64 agentId);
    error AgentNotActive(uint64 agentId);
    error NotPendingOwner(address caller);
    error NoPendingOwner(uint64 agentId);
    error EmptyReason();
    error InvalidServices(uint16 services);
    /// @notice `ids` và `masks` lệch độ dài, hoặc dài hơn `MAX_MIGRATE`.
    error MigrateBatchInvalid();

    event AgentCreated(
        uint8 version, uint64 indexed agentId, address indexed owner, uint256 profileDocId, uint16 allowedServices
    );
    event AgentServicesChanged(uint8 version, uint64 indexed agentId, uint16 oldServices, uint16 newServices);
    event AgentProfileUpdated(uint8 version, uint64 indexed agentId, uint256 profileDocId);
    event AgentStatusChanged(
        uint8 version, uint64 indexed agentId, AgentStatus from, AgentStatus to, address indexed by, string reason
    );
    event AgentOwnerProposed(
        uint8 version, uint64 indexed agentId, address indexed currentOwner, address indexed newOwner
    );
    event AgentOwnerTransferred(
        uint8 version, uint64 indexed agentId, address indexed previousOwner, address indexed newOwner
    );

    // Tên kind FullDB
    function KIND_AGENTS() external pure returns (string memory);
    function KIND_AUDIT() external pure returns (string memory);

    // ─── Ghi (PLATFORM_ADMIN) ───────────────────────────────────────────
    /// @notice `allowedServices` là trần module của agent. Chi nhánh chỉ được bật một tập con hợp lệ.
    function createAgent(address owner, uint16 allowedServices, AgentProfile calldata profile)
        external
        returns (uint64 agentId);
    /// @notice Đổi trần module. Thu hẹp không xoá bit trên chi nhánh đã có; bit ngoài trần ngừng ghi được.
    function setAgentServices(uint64 agentId, uint16 allowedServices) external;
    function updateAgentProfile(uint64 agentId, AgentProfile calldata profile) external;
    function suspendAgent(uint64 agentId, string calldata reason) external;
    function resumeAgent(uint64 agentId, string calldata reason) external;
    /// @notice Xoá mềm: chuyển Deleted (vĩnh viễn), giữ toàn bộ dữ liệu, giải phóng ví chủ.
    function deleteAgent(uint64 agentId, string calldata reason) external;
    /// @notice Đổi ví chủ bước 1 (admin). address(0) để huỷ đề xuất.
    function proposeAgentOwner(uint64 agentId, address newOwner) external;
    /// @notice Đổi ví chủ bước 2: ví mới gọi. Hồ sơ FullDB đổi `owner` trong cùng giao dịch.
    function acceptAgentOwner(uint64 agentId) external;
    /// @notice Điền trần cho agent đang có `allowedServices == 0`, trong cùng giao dịch nâng cấp. Chỉ chạy một lần (`reinitializer(2)`).
    function migrateAllowedServices(uint64[] calldata ids, uint16[] calldata masks) external;

    // ─── Đọc ────────────────────────────────────────────────────────────
    function getAgent(uint64 agentId) external view returns (Agent memory);
    function agentIdOf(address owner) external view returns (uint64);
    function agentCount() external view returns (uint64);
    function isAgentActive(uint64 agentId) external view returns (bool);
    /// @notice Revert nếu agent không Active hoặc hệ đang pause. Trả về trần module. Module gọi trước mọi hàm ghi (luật R5).
    function requireAgentWritable(uint64 agentId) external view returns (uint16 allowedServices);
    function getAgentProfile(uint64 agentId) external view returns (AgentProfileRecord memory);
}
