// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IDuty
/// @notice T2: ca làm (lặp theo thứ trong tuần), phân công (ca, vị trí), phiên trực (vào ca, tăng ca, ra ca, giao ca).
///         Trả lời "ai đang trực ca nào, vị trí nào, đến khi nào?". ADR 0033, đặc tả docs/modules/shared-permission-duty.md.
interface IDuty {
    struct Shift {
        uint64 branchId;
        uint16 startMin; // phút trong ngày, giờ địa phương chi nhánh
        uint16 endMin; // <= startMin: ca qua đêm
        uint8 weekdays; // bit 0 = Thứ 2 … bit 6 = Chủ nhật
        bool active;
        string name;
    }

    struct Assignment {
        uint64 shiftId;
        uint64 positionId;
    }

    /// @notice Phiên trực. Còn hiệu lực khi `now < hardEnd`; tăng ca khi `now >= scheduledEnd`.
    struct Session {
        uint64 shiftId;
        uint64 positionId;
        uint64 startedAt;
        uint64 scheduledEnd;
        uint64 hardEnd;
        uint8 source; // SOURCE_*
        uint64 deviceId;
    }

    error ZeroAddress();
    error NotManager(uint64 branchId, address account);
    error NotAgentOwner(uint64 branchId, address account);
    error NotStaff(uint64 branchId, address account);
    error BranchNotActive(uint64 branchId);
    error InvalidName();
    error InvalidShift();
    error UnknownShift(uint64 shiftId);
    error ShiftInactive(uint64 shiftId);
    error WrongBranch(uint64 expected, uint64 actual);
    error PositionInactive(uint64 positionId);
    error TooManyShifts(uint64 branchId);
    error TooManyAssignments();
    error NotAssigned(uint64 shiftId, uint64 positionId);
    error NotInShiftWindow(uint64 shiftId);
    error AlreadyOnDuty(uint64 branchId, address account);
    error NotOnDuty(uint64 branchId, address account);
    error NoHandover(address from, address to);
    error InvalidMinutes(uint256 minutes_);
    error InvalidReason();

    event ShiftSet(
        uint8 version,
        uint64 indexed branchId,
        uint64 indexed shiftId,
        uint16 startMin,
        uint16 endMin,
        uint8 weekdays,
        bool active,
        string name,
        address by
    );
    event AssignmentsSet(
        uint8 version, uint64 indexed branchId, address indexed account, Assignment[] list, address by
    );
    event CheckedIn(
        uint8 version,
        uint64 indexed branchId,
        address indexed account,
        uint64 shiftId,
        uint64 positionId,
        uint8 source,
        uint64 deviceId,
        uint64 scheduledEnd,
        uint64 hardEnd,
        address by
    );
    event CheckedOut(
        uint8 version,
        uint64 indexed branchId,
        address indexed account,
        uint8 reason,
        uint64 overtimeSeconds,
        address by
    );
    event HandoverRequested(uint8 version, uint64 indexed branchId, address indexed from, address indexed to);
    event HandedOver(uint8 version, uint64 indexed branchId, address indexed from, address indexed to);
    event SessionExtended(uint8 version, uint64 indexed branchId, address indexed account, uint64 hardEnd, address by);
    event OvertimeCapSet(uint8 version, uint64 indexed branchId, uint16 minutes_, address by);

    function SOURCE_SELF() external view returns (uint8);
    function SOURCE_MANAGER() external view returns (uint8);
    function OUT_SELF() external view returns (uint8);
    function OUT_HANDOVER() external view returns (uint8);
    function OUT_MANAGER() external view returns (uint8);

    function createShift(uint64 branchId, string calldata name, uint16 startMin, uint16 endMin, uint8 weekdays)
        external
        returns (uint64 shiftId);
    function updateShift(uint64 shiftId, string calldata name, uint16 startMin, uint16 endMin, uint8 weekdays) external;
    function setShiftActive(uint64 shiftId, bool active) external;
    function setAssignments(uint64 branchId, address account, Assignment[] calldata list) external;
    function setOvertimeCap(uint64 branchId, uint16 minutes_) external;

    function checkIn(uint64 branchId, uint64 shiftId, uint64 positionId, uint64 deviceId) external;
    function checkInFor(uint64 branchId, address account, uint64 shiftId, uint64 positionId, uint64 deviceId) external;
    function checkOut(uint64 branchId) external;
    function requestHandover(uint64 branchId, address to) external;
    function acceptHandover(uint64 branchId, address from) external;
    function closeSession(uint64 branchId, address account, string calldata reason) external;
    function extendSession(uint64 branchId, address account, uint16 minutes_) external;

    function getShift(uint64 shiftId) external view returns (Shift memory);
    function shiftsOf(uint64 branchId) external view returns (uint64[] memory);
    function assignmentsOf(uint64 branchId, address account) external view returns (Assignment[] memory);
    function overtimeCapOf(uint64 branchId) external view returns (uint16);
    function handoverOf(uint64 branchId, address from) external view returns (address);
    /// @notice Phiên còn hiệu lực (`now < hardEnd`); `active = false` nếu không có hoặc đã hết hạn.
    function activeSessionOf(uint64 branchId, address account) external view returns (bool active, Session memory s);
}
