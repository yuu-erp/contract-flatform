// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IResource
/// @notice T2: thiết bị này là gì, thuộc chi nhánh nào, module nào, khoá ký nào, còn dùng không? (ADR 0036).
///         Không biết tên module. Module nghiệp vụ giữ thuộc tính riêng (khu, giá, máy trạng thái phiên).
interface IResource {
    enum Status {
        None,
        Active,
        Disabled
    }

    /// @notice Định danh on-chain. `label` 1–32 byte, chỉ để nhận ra thiết bị.
    struct Device {
        address signer;
        uint64 branchId;
        uint8 moduleId;
        Status status;
        string label;
    }

    error ZeroAddress();
    error InvalidLabel();
    error UnknownDevice(uint64 deviceId);
    error UnknownSigner(address signer);
    error UnknownModule(uint8 moduleId);
    error ModuleRetired(uint8 moduleId);
    error SignerInUse(address signer);
    error DeviceNotActive(uint64 deviceId);
    error WrongModule(uint64 deviceId, uint8 expected, uint8 actual);
    error BranchNotActive(uint64 branchId);
    error NotManager(uint64 branchId, address account);
    error TooManyDevices(uint64 branchId);
    error InvalidStatus(Status status);
    error StatusUnchanged(uint64 deviceId, Status status);

    event DeviceRegistered(
        uint8 version,
        uint64 indexed deviceId,
        uint64 indexed branchId,
        uint8 moduleId,
        address indexed signer,
        string label,
        address by
    );
    event DeviceSignerChanged(
        uint8 version, uint64 indexed deviceId, address indexed oldSigner, address indexed newSigner, address by
    );
    event DeviceStatusChanged(uint8 version, uint64 indexed deviceId, Status from, Status to, address by);

    function MAX_PER_BRANCH() external view returns (uint256);
    function MAX_LABEL() external view returns (uint256);
    function MAX_PAGE() external view returns (uint256);

    /// @notice Đăng ký thiết bị đang Active. `moduleId` phải đã đăng ký ở Registry và chưa Retired.
    ///         `signer` duy nhất toàn hệ. Manager+ của chi nhánh (sau `resolve`).
    function registerDevice(uint64 branchId, uint8 moduleId, address signer, string calldata label)
        external
        returns (uint64 deviceId);

    /// @notice Đổi khoá ký (thay máy hoặc khoá lộ). Khoá cũ được nhả.
    function setSigner(uint64 deviceId, address signer) external;

    /// @notice Active ↔ Disabled. `None` không phải trạng thái ghi được.
    function setDeviceStatus(uint64 deviceId, Status status) external;

    function getDevice(uint64 deviceId) external view returns (Device memory);
    function deviceOfSigner(address signer) external view returns (uint64 deviceId);
    function devicesOf(uint64 branchId, uint256 offset, uint256 limit) external view returns (uint64[] memory);

    /// @notice Thiết bị Active, đúng `moduleId`, chi nhánh đang Active. Trả `deviceId` và `branchId`.
    function requireActiveDevice(address signer, uint8 moduleId)
        external
        view
        returns (uint64 deviceId, uint64 branchId);
}
