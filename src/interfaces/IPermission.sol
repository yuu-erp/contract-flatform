// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IPermission
/// @notice T2: vị trí của chi nhánh (mặt nạ quyền theo module) và câu hỏi "ví này có quyền P của module M ở chi nhánh B
///         lúc này không?". ADR 0033, đặc tả docs/modules/shared-permission-duty.md.
interface IPermission {
    struct Position {
        uint64 branchId;
        bool active;
        string name;
    }

    error ZeroAddress();
    error NotManager(uint64 branchId, address account);
    error BranchNotActive(uint64 branchId);
    error InvalidName();
    error InvalidMask(uint8 moduleId, uint64 mask);
    error UnknownPosition(uint64 positionId);
    error PositionInactive(uint64 positionId);
    error TooManyPositions(uint64 branchId);
    error LengthMismatch();
    error NoPermission(uint64 branchId, address account, uint8 moduleId, uint8 perm);

    event PositionCreated(uint8 version, uint64 indexed branchId, uint64 indexed positionId, string name, address by);
    event PositionPermsSet(
        uint8 version, uint64 indexed branchId, uint64 indexed positionId, uint8 moduleId, uint64 mask, address by
    );
    event PositionRenamed(uint8 version, uint64 indexed branchId, uint64 indexed positionId, string name, address by);
    event PositionActiveSet(uint8 version, uint64 indexed branchId, uint64 indexed positionId, bool active, address by);
    event DutySet(uint8 version, address indexed duty);

    function MAX_POSITIONS_PER_BRANCH() external view returns (uint256);

    function setDuty(address duty_) external;
    function createPosition(uint64 branchId, string calldata name, uint8[] calldata moduleIds, uint64[] calldata masks)
        external
        returns (uint64 positionId);
    function setPositionPerms(uint64 positionId, uint8 moduleId, uint64 mask) external;
    function renamePosition(uint64 positionId, string calldata name) external;
    function setPositionActive(uint64 positionId, bool active) external;

    function getPosition(uint64 positionId) external view returns (Position memory);
    function permsOf(uint64 positionId, uint8 moduleId) external view returns (uint64);
    function positionsOf(uint64 branchId) external view returns (uint64[] memory);
    /// @notice Vị trí thuộc chi nhánh nào, còn dùng không (Duty kiểm khi phân công / vào ca).
    function positionStatus(uint64 positionId) external view returns (uint64 branchId, bool active);
    function can(uint64 branchId, address account, uint8 moduleId, uint8 perm) external view returns (bool);
    function requirePermission(uint64 branchId, address account, uint8 moduleId, uint8 perm) external view;
}
