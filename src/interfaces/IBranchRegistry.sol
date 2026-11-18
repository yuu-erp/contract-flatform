// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IBranchRegistry
/// @notice Chi nhánh của agent: PLATFORM_ADMIN tạo, sửa, dừng, mở lại, xoá mềm, bật/tắt dịch vụ, đổi domain.
///         Chủ agent (không phải admin) đặt thuế. Module gọi `requireWritable(branchId, service)` trước mọi hàm ghi.
///         Đặc tả: docs/modules/core-operator.md.
interface IBranchRegistry {
    /// @dev None: chưa tồn tại. Active: hoạt động. Suspended: chỉ đọc, mở lại được.
    ///      Deleted: xoá mềm, chỉ đọc vĩnh viễn, domain được nhả.
    enum BranchStatus {
        None,
        Active,
        Suspended,
        Deleted
    }

    /// @notice Dữ liệu storage của chi nhánh (dùng cho quyết định on-chain).
    struct Branch {
        uint64 id;
        uint64 agentId;
        BranchStatus status;
        uint16 services; // bitmask SERVICE_*
        bool isMain;
        int16 tzOffsetMinutes; // múi giờ so với UTC, -720..840
        bytes32 domainHash; // keccak256(bytes(domain)); 0 khi đã xoá
        uint64 createdAt;
        uint64 updatedAt;
        uint256 profileDocId; // docId trong FullDB `mp1_platform_branches_<agentId>`
    }

    /// @notice Hồ sơ hiển thị, lưu FullDB (công khai, không xoá được). Chỉ nối thêm trường vào cuối.
    struct BranchProfile {
        string name; // 1–100 byte
        string location; // ≤ 200 byte
        string phone; // số liên hệ chi nhánh, lưu rõ (TextRules.isPhone)
        string longlat; // "lat,long" (TextRules.isLonglat)
        string note; // ≤ 500 byte
    }

    struct BranchInit {
        string domain; // bắt buộc, chữ thường, duy nhất toàn hệ
        uint16 services;
        int16 tzOffsetMinutes;
        BranchProfile profile;
    }

    /// @notice Bản ghi FullDB của hồ sơ: `abi.encode(BranchProfileRecord)`.
    struct BranchProfileRecord {
        uint8 version;
        uint64 branchId;
        uint64 agentId;
        string domain;
        BranchProfile profile;
        uint64 updatedAt;
    }

    error ZeroAddress();
    error BranchNotFound(uint64 branchId);
    error BranchDeleted(uint64 branchId);
    error BranchNotActive(uint64 branchId);
    error ServiceNotEnabled(uint64 branchId, uint16 service);
    error InvalidServices(uint16 services);
    error InvalidService(uint16 service);
    error InvalidDomain();
    error DomainTaken(bytes32 domainHash, uint64 branchId);
    error InvalidTimezone(int16 tzOffsetMinutes);
    error InvalidBranchName();
    error InvalidPhone();
    error InvalidLonglat();
    error FieldTooLong();
    error EmptyReason();
    error InvalidStatusTransition(BranchStatus from, BranchStatus to);
    error AgentNotActive(uint64 agentId);
    error AgentDeleted(uint64 agentId);
    error CannotDeleteMainBranch(uint64 branchId);
    error AlreadyMainBranch(uint64 branchId);
    error NotAgentOwner(address caller, uint64 agentId);
    error TaxTooHigh(uint16 bps);

    event BranchCreated(
        uint8 version, uint64 indexed agentId, uint64 indexed branchId, uint16 services, bytes32 domainHash, bool isMain
    );
    event BranchProfileUpdated(uint8 version, uint64 indexed agentId, uint64 indexed branchId, uint256 profileDocId);
    event BranchDomainChanged(uint8 version, uint64 indexed branchId, bytes32 oldDomainHash, bytes32 newDomainHash);
    event BranchServicesChanged(uint8 version, uint64 indexed branchId, uint16 oldServices, uint16 newServices);
    event BranchTimezoneChanged(uint8 version, uint64 indexed branchId, int16 oldOffset, int16 newOffset);
    event BranchStatusChanged(
        uint8 version, uint64 indexed branchId, BranchStatus from, BranchStatus to, address indexed by, string reason
    );
    event MainBranchChanged(uint8 version, uint64 indexed agentId, uint64 oldBranchId, uint64 newBranchId);
    /// @notice branchId = 0: mức mặc định của agent. isSet = false: mức riêng chi nhánh bị xoá (về mặc định).
    event TaxChanged(
        uint8 version,
        uint64 indexed agentId,
        uint64 indexed branchId,
        uint16 service,
        uint16 oldBps,
        uint16 newBps,
        bool isSet,
        address by
    );

    // ─── Hằng ──────────────────────────────────────────────────────────
    function SERVICE_NET() external view returns (uint16);
    function SERVICE_IQR() external view returns (uint16);
    function SERVICE_LOYALTY() external view returns (uint16);
    function MAX_TAX_BPS() external view returns (uint16);
    function KIND_BRANCHES() external pure returns (string memory);

    // ─── Ghi (PLATFORM_ADMIN) ───────────────────────────────────────────
    /// @notice Chi nhánh đầu tiên của agent tự thành chi nhánh chính. Agent phải Active.
    function createBranch(uint64 agentId, BranchInit calldata init) external returns (uint64 branchId);
    function updateBranchProfile(uint64 branchId, BranchProfile calldata profile) external;
    function setBranchDomain(uint64 branchId, string calldata domain) external;
    function setBranchServices(uint64 branchId, uint16 services) external;
    function setBranchTimezone(uint64 branchId, int16 tzOffsetMinutes) external;
    function setMainBranch(uint64 branchId) external;
    function suspendBranch(uint64 branchId, string calldata reason) external;
    function resumeBranch(uint64 branchId, string calldata reason) external;
    /// @notice Xoá mềm: Deleted (vĩnh viễn), giữ dữ liệu, nhả domain. Không xoá chi nhánh chính khi agent chưa bị xoá.
    function deleteBranch(uint64 branchId, string calldata reason) external;

    // ─── Ghi (chủ agent) ────────────────────────────────────────────────
    function setAgentTax(uint64 agentId, uint16 service, uint16 bps) external;
    function setBranchTax(uint64 branchId, uint16 service, uint16 bps) external;
    function clearBranchTax(uint64 branchId, uint16 service) external;

    // ─── Đọc ────────────────────────────────────────────────────────────
    function agentRegistry() external view returns (address);
    function getBranch(uint64 branchId) external view returns (Branch memory);
    function getBranchProfile(uint64 branchId) external view returns (BranchProfileRecord memory);
    function branchCount() external view returns (uint64);
    function branchCountOf(uint64 agentId) external view returns (uint32);
    function mainBranchOf(uint64 agentId) external view returns (uint64);
    function agentOf(uint64 branchId) external view returns (uint64);
    function branchByDomainHash(bytes32 domainHash) external view returns (uint64);
    function branchByDomain(string calldata domain) external view returns (uint64);
    function isServiceEnabled(uint64 branchId, uint16 service) external view returns (bool);
    /// @notice Revert nếu hệ pause, agent không Active, chi nhánh không Active hoặc dịch vụ không bật (R5).
    function requireWritable(uint64 branchId, uint16 service) external view;
    /// @notice Mức thuế hiệu lực: riêng chi nhánh nếu đã đặt, không thì mặc định của agent.
    function taxOf(uint64 branchId, uint16 service) external view returns (uint16 bps);
    function agentTaxOf(uint64 agentId, uint16 service) external view returns (uint16 bps);
    function branchTaxOf(uint64 branchId, uint16 service) external view returns (bool isSet, uint16 bps);
}
