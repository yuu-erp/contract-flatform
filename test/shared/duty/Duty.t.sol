// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {StaffFixture} from "./StaffFixture.sol";
import {IDuty} from "../../../src/interfaces/IDuty.sol";
import {IAgentAccess} from "../../../src/interfaces/IAgentAccess.sol";

contract DutyTest is StaffFixture {
    // ─── Ca, phân công ──────────────────────────────────────────────────

    function test_shift_managerOnlyAndValidated() public {
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotManager.selector, b1, staff));
        duty.createShift(b1, "Ca", 360, 840, ALL_DAYS);

        vm.startPrank(branchManager);
        vm.expectRevert(IDuty.InvalidShift.selector);
        duty.createShift(b1, "Ca", 360, 360, ALL_DAYS);
        vm.expectRevert(IDuty.InvalidShift.selector);
        duty.createShift(b1, "Ca", 1440, 60, ALL_DAYS);
        vm.expectRevert(IDuty.InvalidShift.selector);
        duty.createShift(b1, "Ca", 360, 840, 0);
        vm.expectRevert(IDuty.InvalidName.selector);
        duty.createShift(b1, "", 360, 840, ALL_DAYS);
        uint64 id = duty.createShift(b1, "Ca sang", 360, 840, ALL_DAYS);
        for (uint256 i = 1; i < 16; ++i) {
            duty.createShift(b1, "Ca", 360, 840, ALL_DAYS);
        }
        vm.expectRevert(abi.encodeWithSelector(IDuty.TooManyShifts.selector, b1));
        duty.createShift(b1, "Ca", 360, 840, ALL_DAYS);
        vm.stopPrank();
        assertEq(duty.getShift(id).startMin, 360);
        assertEq(duty.shiftsOf(b1).length, 16);
    }

    function test_assignments_sameBranchAndStaffOnly() public {
        uint64 s1 = _shift(b1, 360, 840, ALL_DAYS);
        uint64 p1 = _position(b1, 1);
        vm.prank(agentOwner); // chủ agent quản lý mọi chi nhánh
        uint64 s2 = duty.createShift(b2, "Ca", 360, 840, ALL_DAYS);

        IDuty.Assignment[] memory list = new IDuty.Assignment[](1);
        list[0] = IDuty.Assignment(s2, p1);
        vm.startPrank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotStaff.selector, b1, stranger));
        duty.setAssignments(b1, stranger, list);
        vm.expectRevert(abi.encodeWithSelector(IDuty.WrongBranch.selector, b1, b2));
        duty.setAssignments(b1, staff, list);
        list[0] = IDuty.Assignment(s1, p1);
        duty.setAssignments(b1, staff, list);
        vm.stopPrank();
        assertEq(duty.assignmentsOf(b1, staff).length, 1);

        vm.prank(branchManager);
        duty.setAssignments(b1, staff, new IDuty.Assignment[](0));
        assertEq(duty.assignmentsOf(b1, staff).length, 0);
    }

    // ─── Vào ca ─────────────────────────────────────────────────────────

    function test_checkIn_inWindow() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.expectEmit(true, true, false, true);
        emit IDuty.CheckedIn(1, b1, staff, s, p, 0, 7, uint64(_at(0, 14, 0)), uint64(_at(0, 18, 0)), staff);
        vm.prank(staff);
        duty.checkIn(b1, s, p, 7);
        (bool on, IDuty.Session memory ss) = duty.activeSessionOf(b1, staff);
        assertTrue(on);
        assertEq(ss.scheduledEnd, _at(0, 14, 0));
        assertEq(ss.hardEnd, _at(0, 18, 0)); // trần tăng ca mặc định 4 giờ
    }

    function test_checkIn_earlyWindow15Minutes() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.warp(_at(0, 5, 44));
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotInShiftWindow.selector, s));
        duty.checkIn(b1, s, p, 0);
        vm.warp(_at(0, 5, 45));
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);
    }

    function test_checkIn_afterShiftEndRejected() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.warp(_at(0, 14, 0));
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotInShiftWindow.selector, s));
        duty.checkIn(b1, s, p, 0);
    }

    function test_checkIn_weekdayFilter() public {
        uint64 s = _shift(b1, 360, 840, 0x02); // chỉ Thứ 3
        uint64 p = _position(b1, 1);
        _assign(staff, s, p);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotInShiftWindow.selector, s));
        duty.checkIn(b1, s, p, 0); // Thứ 2
        vm.warp(_at(1, 7, 0));
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0); // Thứ 3
    }

    /// @dev Ca đêm 22:00–06:00 chỉ đặt cho Thứ 2: 01:00 sáng Thứ 3 vẫn thuộc lần ca bắt đầu tối Thứ 2.
    function test_checkIn_overnightShift() public {
        uint64 s = _shift(b1, 1320, 360, 0x01);
        uint64 p = _position(b1, 1);
        _assign(staff, s, p);
        vm.warp(_at(1, 1, 0));
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);
        (, IDuty.Session memory ss) = duty.activeSessionOf(b1, staff);
        assertEq(ss.scheduledEnd, _at(1, 6, 0));
    }

    /// @dev Vào sớm vắt qua nửa đêm: ca 00:05 Thứ 3, vào lúc 23:55 Thứ 2.
    function test_checkIn_earlyAcrossMidnight() public {
        uint64 s = _shift(b1, 5, 480, 0x02);
        uint64 p = _position(b1, 1);
        _assign(staff, s, p);
        vm.warp(_at(0, 23, 55));
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);
        (, IDuty.Session memory ss) = duty.activeSessionOf(b1, staff);
        assertEq(ss.scheduledEnd, _at(1, 8, 0));
    }

    function test_checkIn_rejects() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        uint64 p2 = _position(b1, 2);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotAssigned.selector, s, p2));
        duty.checkIn(b1, s, p2, 0);

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotStaff.selector, b1, stranger));
        duty.checkIn(b1, s, p, 0);

        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.AlreadyOnDuty.selector, b1, staff));
        duty.checkIn(b1, s, p, 0);
    }

    function test_checkIn_inactiveShiftOrPosition() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.prank(branchManager);
        permission.setPositionActive(p, false);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.PositionInactive.selector, p));
        duty.checkIn(b1, s, p, 0);
        vm.startPrank(branchManager);
        permission.setPositionActive(p, true);
        duty.setShiftActive(s, false);
        vm.stopPrank();
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.ShiftInactive.selector, s));
        duty.checkIn(b1, s, p, 0);
    }

    function test_checkInFor_byManager() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.prank(staff2);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotManager.selector, b1, staff2));
        duty.checkInFor(b1, staff, s, p, 0);
        vm.prank(branchManager);
        duty.checkInFor(b1, staff, s, p, 0);
        (, IDuty.Session memory ss) = duty.activeSessionOf(b1, staff);
        assertEq(ss.source, duty.SOURCE_MANAGER());
    }

    // ─── Tăng ca, ra ca ─────────────────────────────────────────────────

    function test_overtime_keepsSessionUntilCap() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);
        vm.warp(_at(0, 17, 59)); // quá giờ ca 3h59: vẫn trực (tăng ca)
        (bool on,) = duty.activeSessionOf(b1, staff);
        assertTrue(on);
        vm.warp(_at(0, 18, 0)); // chạm trần 4 giờ: tự hết hiệu lực, không cần giao dịch
        (on,) = duty.activeSessionOf(b1, staff);
        assertFalse(on);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotOnDuty.selector, b1, staff));
        duty.checkOut(b1);
    }

    function test_overtimeCap_ownerOnly() public {
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotAgentOwner.selector, b1, branchManager));
        duty.setOvertimeCap(b1, 60);
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IDuty.InvalidMinutes.selector, uint256(721)));
        duty.setOvertimeCap(b1, 721);
        vm.prank(agentOwner);
        duty.setOvertimeCap(b1, 0);
        assertEq(duty.overtimeCapOf(b1), 0);
        assertEq(duty.overtimeCapOf(b2), 240);

        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);
        vm.warp(_at(0, 14, 0)); // trần 0: hết giờ ca là hết phiên
        (bool on,) = duty.activeSessionOf(b1, staff);
        assertFalse(on);
    }

    function test_checkOut_reportsOvertime() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);
        vm.warp(_at(0, 14, 40));
        vm.expectEmit(true, true, false, true);
        emit IDuty.CheckedOut(1, b1, staff, 0, 40 minutes, staff);
        vm.prank(staff);
        duty.checkOut(b1);
        (bool on,) = duty.activeSessionOf(b1, staff);
        assertFalse(on);
    }

    function test_extendAndClose_byManager() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);
        vm.prank(branchManager);
        duty.extendSession(b1, staff, 60);
        (, IDuty.Session memory ss) = duty.activeSessionOf(b1, staff);
        assertEq(ss.hardEnd, _at(0, 19, 0));

        vm.prank(branchManager);
        vm.expectRevert(IDuty.InvalidReason.selector);
        duty.closeSession(b1, staff, "");
        vm.prank(branchManager);
        duty.closeSession(b1, staff, "ve som");
        (bool on,) = duty.activeSessionOf(b1, staff);
        assertFalse(on);
    }

    // ─── Giao ca ────────────────────────────────────────────────────────

    /// @dev Kịch bản người dùng: Lan hết ca 14:00, Minh tới 14:40, Lan giao ca, Minh xác nhận → phiên Lan đóng.
    function test_handover_lateSuccessor() public {
        (uint64 morning, uint64 p) = _morning(staff, 1);
        uint64 afternoon = _shift(b1, 840, 1320, ALL_DAYS);
        _assign(staff2, afternoon, p);
        vm.prank(staff);
        duty.checkIn(b1, morning, p, 0);

        vm.warp(_at(0, 14, 40));
        vm.prank(staff2);
        duty.checkIn(b1, afternoon, p, 0);

        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotOnDuty.selector, b1, stranger));
        duty.requestHandover(b1, stranger);
        vm.prank(staff);
        duty.requestHandover(b1, staff2);
        assertEq(duty.handoverOf(b1, staff), staff2);

        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NoHandover.selector, staff, branchManager));
        duty.acceptHandover(b1, staff);

        vm.expectEmit(true, true, false, true);
        emit IDuty.CheckedOut(1, b1, staff, 1, 40 minutes, staff2);
        vm.prank(staff2);
        duty.acceptHandover(b1, staff);
        (bool on,) = duty.activeSessionOf(b1, staff);
        assertFalse(on);
        (on,) = duty.activeSessionOf(b1, staff2);
        assertTrue(on);
        assertEq(duty.handoverOf(b1, staff), address(0));
    }

    function test_revokedStaffCannotCheckIn() public {
        (uint64 s, uint64 p) = _morning(staff, 1);
        vm.prank(agentOwner);
        agentAccess.revokeRole(b1, staff);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IDuty.NotStaff.selector, b1, staff));
        duty.checkIn(b1, s, p, 0);
    }

    function test_managerIsNotStaffForCheckIn() public view {
        assertEq(uint8(agentAccess.effectiveRoleOf(b1, branchManager)), uint8(IAgentAccess.Role.Manager), "fixture");
    }
}
