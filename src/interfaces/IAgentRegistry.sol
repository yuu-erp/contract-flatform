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

    event AgentCreated(uint8 version, uint64 indexed agentId, address indexed owner, uint256 profileDocId);
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
    function createAgent(address owner, AgentProfile calldata profile) external returns (uint64 agentId);
    function updateAgentProfile(uint64 agentId, AgentProfile calldata profile) external;
    function suspendAgent(uint64 agentId, string calldata reason) external;
    function resumeAgent(uint64 agentId, string calldata reason) external;
    /// @notice Xoá mềm: chuyển Deleted (vĩnh viễn), giữ toàn bộ dữ liệu, giải phóng ví chủ.
    function deleteAgent(uint64 agentId, string calldata reason) external;
    /// @notice Đổi ví chủ bước 1 (admin). address(0) để huỷ đề xuất.
    function proposeAgentOwner(uint64 agentId, address newOwner) external;
    /// @notice Đổi ví chủ bước 2: ví mới gọi.
    function acceptAgentOwner(uint64 agentId) external;

    // ─── Đọc ────────────────────────────────────────────────────────────
    function getAgent(uint64 agentId) external view returns (Agent memory);
    function agentIdOf(address owner) external view returns (uint64);
    function agentCount() external view returns (uint64);
    function isAgentActive(uint64 agentId) external view returns (bool);
    /// @notice Revert nếu agent không Active hoặc hệ đang pause. Module gọi trước mọi hàm ghi (luật R5).
    function requireAgentWritable(uint64 agentId) external view;
    function getAgentProfile(uint64 agentId) external view returns (AgentProfileRecord memory);
}
