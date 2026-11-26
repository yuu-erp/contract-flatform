// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IRegistry
/// @notice T0: danh sách module (Module Contract, ADR 0030), cầu dao từng module (ADR 0031) và sổ địa chỉ.
///         Nền tảng hỏi Registry "module nào tồn tại, đang sống, phụ thuộc gì" thay vì biết sẵn tên module.
///         `moduleId` 0 = nền tảng (chỉ có danh mục quyền, không có bit dịch vụ); 1..16 ↔ bit `1 << (id-1)`
///         của `Branch.services`. Đặc tả: docs/modules/kernel-registry.md.
interface IRegistry {
    enum ModuleStatus {
        None,
        Active,
        Paused,
        Retired
    }

    struct Module {
        ModuleStatus status;
        uint16 requiresAny; // chi nhánh bật module này phải bật ít nhất một module trong mặt nạ (0 = không cần)
        uint16 flags; // cờ chính sách do module khai báo (FLAG_*)
        uint32 version; // tăng mỗi lần sửa khai báo
        uint64 permValid; // bit quyền có nghĩa (ADR 0033)
        uint64 permManagerOnly; // bit quyền chỉ Manager (⊆ permValid)
        string name; // tên kỹ thuật, chỉ để hiển thị — không dùng để rẽ nhánh logic
    }

    error InvalidModuleId(uint8 id);
    error ModuleExists(uint8 id);
    error UnknownModule(uint8 id);
    error ModuleIsRetired(uint8 id);
    error ModuleNotActive(uint8 id, ModuleStatus status);
    error InvalidModuleStatus(ModuleStatus from, ModuleStatus to);
    error InvalidModuleName();
    error InvalidRequires(uint16 requiresAny);
    error InvalidPermissions();
    error InvalidServices(uint16 services);
    error ZeroAddress();
    error InvalidReason();

    event ModuleRegistered(uint8 version, uint8 indexed id, string name, uint16 requiresAny, uint16 flags);
    event ModuleUpdated(
        uint8 version,
        uint8 indexed id,
        uint32 moduleVersion,
        uint16 requiresAny,
        uint16 flags,
        uint64 permValid,
        uint64 permManagerOnly
    );
    event ModuleStatusChanged(
        uint8 version, uint8 indexed id, ModuleStatus from, ModuleStatus to, address indexed by, string reason
    );
    event ModuleContractSet(uint8 version, address indexed contractAddr, uint8 indexed id, bool allowed);
    event AddressSet(uint8 version, bytes32 indexed key, address addr);

    /// @notice Cờ: giá của module bắt buộc đã gồm thuế (không cho chế độ "chưa gồm thuế").
    function FLAG_TAX_INCLUSIVE_ONLY() external view returns (uint16);
    /// @notice Cờ: module bán hàng (có doanh thu, thuế, được trừ ví). Module không có cờ này không ghi doanh thu ở Ledger.
    function FLAG_SALES() external view returns (uint16);
    function MAX_MODULE_ID() external view returns (uint8);

    // ─── Ghi ────────────────────────────────────────────────────────────
    /// @notice Đăng ký module mới (trạng thái Active). Chỉ PLATFORM_OWNER.
    function registerModule(
        uint8 id,
        string calldata name,
        uint16 requiresAny,
        uint16 flags,
        uint64 permValid,
        uint64 permManagerOnly
    ) external;
    /// @notice Sửa khai báo (không đổi tên, không đổi trạng thái). Chỉ PLATFORM_OWNER; module chưa Retired.
    function updateModule(uint8 id, uint16 requiresAny, uint16 flags, uint64 permValid, uint64 permManagerOnly) external;
    /// @notice Active ⇄ Paused: PLATFORM_ADMIN. → Retired (một chiều): PLATFORM_OWNER. `reason` 1–200 byte.
    function setModuleStatus(uint8 id, ModuleStatus status, string calldata reason) external;
    /// @notice Gắn/gỡ một contract với module (Ledger, HistoryIndex… dùng để biết lệnh đến từ module nào). Chỉ PLATFORM_OWNER.
    function setModuleContract(address contractAddr, uint8 id, bool allowed) external;
    /// @notice Sổ địa chỉ dùng chung (hook, contract nền tảng). Chỉ PLATFORM_OWNER.
    function setAddress(bytes32 key, address addr) external;

    // ─── Đọc ────────────────────────────────────────────────────────────
    function getModule(uint8 id) external view returns (Module memory);
    function moduleIds() external view returns (uint8[] memory);
    function isActive(uint8 id) external view returns (bool);
    function requireActive(uint8 id) external view;
    /// @notice Module của một contract; `known = false` nếu contract không thuộc module nào.
    function moduleOf(address contractAddr) external view returns (bool known, uint8 id);
    /// @notice `moduleOf` + `requireActive`: revert nếu contract không thuộc module nào hoặc module không Active.
    function requireActiveModuleOf(address contractAddr) external view returns (uint8 id);
    /// @notice Bit dịch vụ của module (1..16); id khác → InvalidModuleId.
    function serviceBit(uint8 id) external pure returns (uint16);
    /// @notice Revert `InvalidServices` nếu `services` = 0, có bit chưa đăng ký / đã Retired, hoặc thiếu module phụ thuộc.
    function checkServices(uint16 services) external view;
    /// @notice Kiểm `checkServices` nhưng cho phép giữ lại bit đã Retired có sẵn trong `previous`.
    function checkServicesChange(uint16 services, uint16 previous) external view;
    function addressOf(bytes32 key) external view returns (address);
}
