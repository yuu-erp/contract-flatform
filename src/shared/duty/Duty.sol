// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../../kernel/access/PlatformAccessed.sol";
import {IDuty} from "../../interfaces/IDuty.sol";
import {IPermission} from "../../interfaces/IPermission.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";
import {IDelegateRegistry} from "../../interfaces/IDelegateRegistry.sol";
import {IAgentAccess} from "../../interfaces/IAgentAccess.sol";

/// @title Duty
/// @notice T2: ca làm, phân công (ca, vị trí), phiên trực với tăng ca và giao ca. Xem `IDuty`, ADR 0033.
///         Quyền gắn với phiên trực đang mở, không cắt cứng ở giờ kết thúc ca: quá giờ là tăng ca (suy theo giờ),
///         phiên tự hết hiệu lực ở `hardEnd` = kết thúc ca + trần tăng ca của chi nhánh (mặc định 4 giờ).
contract Duty is PlatformAccessed, IDuty {
    uint8 public constant EVENT_VERSION = 1;
    uint256 public constant MAX_SHIFTS_PER_BRANCH = 16;
    uint256 public constant MAX_ASSIGNMENTS = 16;
    uint256 public constant MAX_NAME = 50;
    uint256 public constant MAX_REASON = 200;
    uint16 public constant DEFAULT_OVERTIME_CAP = 240; // phút (người dùng chốt 2026-11-26)
    uint16 public constant MAX_MINUTES = 720;
    uint64 public constant EARLY_CHECKIN = 15 minutes;
    uint8 public constant SOURCE_SELF = 0;
    uint8 public constant SOURCE_MANAGER = 1;
    uint8 public constant OUT_SELF = 0;
    uint8 public constant OUT_HANDOVER = 1;
    uint8 public constant OUT_MANAGER = 2;

    /// @custom:storage-location erc7201:metaplatform.shared.duty
    struct DutyStorage {
        IBranchRegistry branches;
        IAgentAccess agentAccess;
        IPermission permission;
        uint64 shiftCount;
        mapping(uint64 => Shift) shifts;
        mapping(uint64 => uint64[]) shiftsOf; // branchId → shiftIds (kể cả đã ngừng)
        mapping(uint64 => mapping(address => Assignment[])) assignments;
        mapping(uint64 => mapping(address => Session)) sessions;
        mapping(uint64 => uint16) overtimeCapPlusOne; // 0 = chưa đặt (mặc định)
        mapping(uint64 => mapping(address => address)) handoverTo; // branchId → người giao → người nhận
        IDelegateRegistry delegate; // quy ví phiên / địa chỉ đăng nhập về tài khoản (nguyên tắc 7)
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.shared.duty")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant DUTY_STORAGE_SLOT = 0x3e5afbb5ce7842ea69042a7cd24313f3f6d7e65c90b7e30f237d769b2dd96f00;

    function _s() private pure returns (DutyStorage storage $) {
        assembly {
            $.slot := DUTY_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address branches_, address agentAccess_, address permission_)
        external
        initializer
    {
        __PlatformAccessed_init(access_);
        if (branches_ == address(0) || agentAccess_ == address(0) || permission_ == address(0)) revert ZeroAddress();
        DutyStorage storage $ = _s();
        $.branches = IBranchRegistry(branches_);
        $.agentAccess = IAgentAccess(agentAccess_);
        $.permission = IPermission(permission_);
    }

    /// @notice Nối DelegateRegistry: nhân viên đăng nhập bằng mật khẩu / ví phiên máy quầy được quy về tài khoản. Chỉ owner.
    function setDelegate(address delegate_) external onlyPlatformOwner {
        if (delegate_ == address(0)) revert ZeroAddress();
        _s().delegate = IDelegateRegistry(delegate_);
    }

    // ─── Ca (Manager+) ──────────────────────────────────────────────────

    function createShift(uint64 branchId, string calldata name, uint16 startMin, uint16 endMin, uint8 weekdays)
        external
        whenNotPaused
        returns (uint64 shiftId)
    {
        _requireRole(branchId, _me(branchId), IAgentAccess.Role.Manager);
        _checkShift(name, startMin, endMin, weekdays);
        DutyStorage storage $ = _s();
        uint64[] storage list = $.shiftsOf[branchId];
        if (list.length >= MAX_SHIFTS_PER_BRANCH) revert TooManyShifts(branchId);
        shiftId = ++$.shiftCount;
        $.shifts[shiftId] = Shift({
            branchId: branchId, startMin: startMin, endMin: endMin, weekdays: weekdays, active: true, name: name
        });
        list.push(shiftId);
        _emitShift(shiftId);
    }

    /// @notice Sửa giờ / thứ / tên. Phiên đang mở giữ nguyên giờ kết thúc đã tính lúc vào ca.
    function updateShift(uint64 shiftId, string calldata name, uint16 startMin, uint16 endMin, uint8 weekdays)
        external
        whenNotPaused
    {
        Shift storage sh = _shift(shiftId);
        _requireRole(sh.branchId, _me(sh.branchId), IAgentAccess.Role.Manager);
        _checkShift(name, startMin, endMin, weekdays);
        sh.name = name;
        sh.startMin = startMin;
        sh.endMin = endMin;
        sh.weekdays = weekdays;
        _emitShift(shiftId);
    }

    function setShiftActive(uint64 shiftId, bool active) external whenNotPaused {
        Shift storage sh = _shift(shiftId);
        _requireRole(sh.branchId, _me(sh.branchId), IAgentAccess.Role.Manager);
        sh.active = active;
        _emitShift(shiftId);
    }

    /// @notice Thay toàn bộ phân công của một nhân viên ở chi nhánh. Ca và vị trí phải cùng chi nhánh, đang dùng.
    function setAssignments(uint64 branchId, address account, Assignment[] calldata list) external whenNotPaused {
        _requireRole(branchId, _me(branchId), IAgentAccess.Role.Manager);
        if (list.length > MAX_ASSIGNMENTS) revert TooManyAssignments();
        if (list.length != 0 && _s().agentAccess.effectiveRoleOf(branchId, account) != IAgentAccess.Role.Staff) {
            revert NotStaff(branchId, account);
        }
        Assignment[] storage dst = _s().assignments[branchId][account];
        while (dst.length != 0) dst.pop();
        for (uint256 i; i < list.length; ++i) {
            _checkPair(branchId, list[i].shiftId, list[i].positionId);
            dst.push(list[i]);
        }
        emit AssignmentsSet(EVENT_VERSION, branchId, account, list, _me(branchId));
    }

    /// @notice Trần tăng ca của chi nhánh (phút, 0..720). Chỉ chủ agent.
    function setOvertimeCap(uint64 branchId, uint16 minutes_) external whenNotPaused {
        address me = _me(branchId);
        if (_s().agentAccess.effectiveRoleOf(branchId, me) != IAgentAccess.Role.Owner) {
            revert NotAgentOwner(branchId, me);
        }
        if (minutes_ > MAX_MINUTES) revert InvalidMinutes(minutes_);
        _s().overtimeCapPlusOne[branchId] = minutes_ + 1;
        emit OvertimeCapSet(EVENT_VERSION, branchId, minutes_, me);
    }

    // ─── Phiên trực ─────────────────────────────────────────────────────

    function checkIn(uint64 branchId, uint64 shiftId, uint64 positionId, uint64 deviceId) external whenNotPaused {
        address me = _me(branchId);
        _open(branchId, me, shiftId, positionId, deviceId, SOURCE_SELF, me);
    }

    /// @notice Manager vào ca hộ nhân viên (máy chấm công hỏng, quên điện thoại…). Ghi `source = SOURCE_MANAGER`.
    function checkInFor(uint64 branchId, address account, uint64 shiftId, uint64 positionId, uint64 deviceId)
        external
        whenNotPaused
    {
        address me = _me(branchId);
        _requireRole(branchId, me, IAgentAccess.Role.Manager);
        _open(branchId, account, shiftId, positionId, deviceId, SOURCE_MANAGER, me);
    }

    function checkOut(uint64 branchId) external whenNotPaused {
        _close(branchId, _me(branchId), OUT_SELF);
    }

    /// @notice Người đang trực đề nghị giao ca cho `to` (đang trực ở cùng chi nhánh). `to` xác nhận bằng `acceptHandover`.
    function requestHandover(uint64 branchId, address to) external whenNotPaused {
        address me = _me(branchId);
        _requireOnDuty(branchId, me);
        if (to == me) revert NoHandover(me, to);
        _requireOnDuty(branchId, to);
        _s().handoverTo[branchId][me] = to;
        emit HandoverRequested(EVENT_VERSION, branchId, me, to);
    }

    /// @notice Người nhận xác nhận (két xác nhận ở PaymentAccounts khi có) → phiên của `from` đóng.
    function acceptHandover(uint64 branchId, address from) external whenNotPaused {
        DutyStorage storage $ = _s();
        address me = _me(branchId);
        if ($.handoverTo[branchId][from] != me) revert NoHandover(from, me);
        _requireOnDuty(branchId, me);
        _close(branchId, from, OUT_HANDOVER);
        emit HandedOver(EVENT_VERSION, branchId, from, me);
    }

    function closeSession(uint64 branchId, address account, string calldata reason) external whenNotPaused {
        _requireRole(branchId, _me(branchId), IAgentAccess.Role.Manager);
        uint256 n = bytes(reason).length;
        if (n == 0 || n > MAX_REASON) revert InvalidReason();
        _close(branchId, account, OUT_MANAGER);
    }

    function extendSession(uint64 branchId, address account, uint16 minutes_) external whenNotPaused {
        _requireRole(branchId, _me(branchId), IAgentAccess.Role.Manager);
        if (minutes_ == 0 || minutes_ > MAX_MINUTES) revert InvalidMinutes(minutes_);
        Session storage s = _requireOnDuty(branchId, account);
        s.hardEnd += uint64(minutes_) * 60;
        emit SessionExtended(EVENT_VERSION, branchId, account, s.hardEnd, _me(branchId));
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function getShift(uint64 shiftId) external view returns (Shift memory) {
        return _s().shifts[shiftId];
    }

    function shiftsOf(uint64 branchId) external view returns (uint64[] memory) {
        return _s().shiftsOf[branchId];
    }

    function assignmentsOf(uint64 branchId, address account) external view returns (Assignment[] memory) {
        return _s().assignments[branchId][account];
    }

    function overtimeCapOf(uint64 branchId) public view returns (uint16) {
        uint16 v = _s().overtimeCapPlusOne[branchId];
        return v == 0 ? DEFAULT_OVERTIME_CAP : v - 1;
    }

    function handoverOf(uint64 branchId, address from) external view returns (address) {
        return _s().handoverTo[branchId][from];
    }

    function activeSessionOf(uint64 branchId, address account) external view returns (bool active, Session memory s) {
        s = _s().sessions[branchId][account];
        active = s.hardEnd > block.timestamp;
        if (!active) delete s;
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _open(
        uint64 branchId,
        address account,
        uint64 shiftId,
        uint64 positionId,
        uint64 deviceId,
        uint8 source,
        address by
    ) private {
        DutyStorage storage $ = _s();
        IBranchRegistry.Branch memory br = $.branches.getBranch(branchId);
        if (br.status != IBranchRegistry.BranchStatus.Active) revert BranchNotActive(branchId);
        if ($.agentAccess.effectiveRoleOf(branchId, account) != IAgentAccess.Role.Staff) {
            revert NotStaff(branchId, account);
        }
        Session storage s = $.sessions[branchId][account];
        if (s.hardEnd > block.timestamp) revert AlreadyOnDuty(branchId, account);
        _requireAssigned(branchId, account, shiftId, positionId);
        _checkPair(branchId, shiftId, positionId);

        (, uint64 end) = _occurrence($.shifts[shiftId], br.tzOffsetMinutes);
        if (end == 0) revert NotInShiftWindow(shiftId);
        uint64 hardEnd = end + uint64(overtimeCapOf(branchId)) * 60;
        $.sessions[branchId][account] = Session({
            shiftId: shiftId,
            positionId: positionId,
            startedAt: uint64(block.timestamp),
            scheduledEnd: end,
            hardEnd: hardEnd,
            source: source,
            deviceId: deviceId
        });
        delete $.handoverTo[branchId][account];
        _emitCheckedIn(branchId, account, by);
    }

    function _emitCheckedIn(uint64 branchId, address account, address by) private {
        Session storage x = _s().sessions[branchId][account];
        emit CheckedIn(
            EVENT_VERSION,
            branchId,
            account,
            x.shiftId,
            x.positionId,
            x.source,
            x.deviceId,
            x.scheduledEnd,
            x.hardEnd,
            by
        );
    }

    function _close(uint64 branchId, address account, uint8 reason) private {
        Session storage s = _requireOnDuty(branchId, account);
        uint64 over = block.timestamp > s.scheduledEnd ? uint64(block.timestamp) - s.scheduledEnd : 0;
        delete _s().sessions[branchId][account];
        delete _s().handoverTo[branchId][account];
        emit CheckedOut(EVENT_VERSION, branchId, account, reason, over, _me(branchId));
    }

    /// @dev Người gọi quy về tài khoản (ví phiên, địa chỉ đăng nhập); chưa nối DelegateRegistry thì là `msg.sender`.
    function _me(uint64 branchId) private view returns (address) {
        IDelegateRegistry d = _s().delegate;
        if (address(d) == address(0)) return msg.sender;
        return d.resolve(_s().branches.getBranch(branchId).agentId, msg.sender);
    }

    function _requireOnDuty(uint64 branchId, address account) private view returns (Session storage s) {
        s = _s().sessions[branchId][account];
        if (s.hardEnd <= block.timestamp) revert NotOnDuty(branchId, account);
    }

    function _requireRole(uint64 branchId, address account, IAgentAccess.Role minRole) private view {
        if (_s().agentAccess.effectiveRoleOf(branchId, account) < minRole) revert NotManager(branchId, account);
    }

    function _requireAssigned(uint64 branchId, address account, uint64 shiftId, uint64 positionId) private view {
        Assignment[] storage list = _s().assignments[branchId][account];
        for (uint256 i; i < list.length; ++i) {
            if (list[i].shiftId == shiftId && list[i].positionId == positionId) return;
        }
        revert NotAssigned(shiftId, positionId);
    }

    /// @dev Ca và vị trí cùng chi nhánh `branchId`, đang dùng.
    function _checkPair(uint64 branchId, uint64 shiftId, uint64 positionId) private view {
        Shift storage sh = _shift(shiftId);
        if (sh.branchId != branchId) revert WrongBranch(branchId, sh.branchId);
        if (!sh.active) revert ShiftInactive(shiftId);
        (uint64 pb, bool pActive) = _s().permission.positionStatus(positionId);
        if (pb != branchId) revert WrongBranch(branchId, pb);
        if (!pActive) revert PositionInactive(positionId);
    }

    /// @dev Lần ca (bắt đầu hôm qua / hôm nay / ngày mai theo giờ địa phương, đúng thứ trong tuần) chứa thời điểm
    ///      hiện tại trong cửa sổ `[bắt đầu − 15 phút, kết thúc)`. Trả (bắt đầu, kết thúc) theo UTC; không có → (0, 0).
    ///      1970-01-01 là Thứ 5 → thứ trong tuần (0 = Thứ 2) = (ngày + 3) % 7.
    function _occurrence(Shift storage sh, int16 tzMinutes) private view returns (uint64, uint64) {
        int256 tz = int256(tzMinutes) * 60;
        // forge-lint: disable-next-line(unsafe-typecast)
        int256 nowTs = int256(block.timestamp);
        int256 today = (nowTs + tz) / 1 days;
        uint256 dur = sh.endMin > sh.startMin ? sh.endMin - sh.startMin : uint256(sh.endMin) + 1440 - sh.startMin;
        for (int256 k = -1; k <= 1; ++k) {
            int256 day = today + k;
            // casting to 'uint256' is safe because day >= 0 for any timestamp after 1970-01-02
            // forge-lint: disable-next-line(unsafe-typecast)
            uint256 dow = (uint256(day) + 3) % 7;
            if (sh.weekdays & (uint8(1) << uint8(dow)) == 0) continue;
            int256 start = day * 1 days + int256(uint256(sh.startMin)) * 60 - tz;
            // forge-lint: disable-next-line(unsafe-typecast)
            int256 end = start + int256(dur * 60);
            if (nowTs + int256(uint256(EARLY_CHECKIN)) >= start && nowTs < end) {
                // forge-lint: disable-next-line(unsafe-typecast)
                return (uint64(uint256(start)), uint64(uint256(end)));
            }
        }
        return (0, 0);
    }

    function _shift(uint64 shiftId) private view returns (Shift storage sh) {
        sh = _s().shifts[shiftId];
        if (sh.branchId == 0) revert UnknownShift(shiftId);
    }

    function _checkShift(string calldata name, uint16 startMin, uint16 endMin, uint8 weekdays) private pure {
        uint256 n = bytes(name).length;
        if (n == 0 || n > MAX_NAME) revert InvalidName();
        if (startMin >= 1440 || endMin >= 1440 || startMin == endMin || weekdays == 0 || weekdays >= 128) {
            revert InvalidShift();
        }
    }

    function _emitShift(uint64 shiftId) private {
        Shift storage sh = _s().shifts[shiftId];
        emit ShiftSet(
            EVENT_VERSION,
            sh.branchId,
            shiftId,
            sh.startMin,
            sh.endMin,
            sh.weekdays,
            sh.active,
            sh.name,
            _me(sh.branchId)
        );
    }
}
