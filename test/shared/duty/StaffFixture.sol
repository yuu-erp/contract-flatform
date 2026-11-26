// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {IAgentAccess} from "../../../src/interfaces/IAgentAccess.sol";
import {IDuty} from "../../../src/interfaces/IDuty.sol";

/// @notice Bối cảnh chung cho Permission/Duty: agent `a`, chi nhánh `b1` (NET|IQR, UTC+7), `b2` (NET),
///         Manager `branchManager`, Staff `staff`, `staff2` ở b1. Đồng hồ: Thứ 2 2026-01-05 07:00 giờ địa phương.
abstract contract StaffFixture is PlatformFixture {
    uint64 internal a;
    uint64 internal b1;
    uint64 internal b2;
    address internal staff2;

    /// @dev 2026-01-05 00:00 UTC = 07:00 Thứ 2 tại UTC+7.
    uint256 internal constant MON_0700 = 1_767_571_200;
    uint8 internal constant ALL_DAYS = 0x7F;

    function setUp() public virtual override {
        super.setUp();
        staff2 = makeAddr("staff2");
        a = _createAgent(agentOwner);
        b1 = _createBranch(a, "a.vn", NET | IQR);
        b2 = _createBranch(a, "b.vn", NET);
        vm.startPrank(agentOwner);
        agentAccess.grantRole(b1, branchManager, IAgentAccess.Role.Manager);
        agentAccess.grantRole(b1, staff, IAgentAccess.Role.Staff);
        agentAccess.grantRole(b1, staff2, IAgentAccess.Role.Staff);
        vm.stopPrank();
        vm.warp(MON_0700);
    }

    /// @dev Giờ UTC của `hh:mm` giờ địa phương (UTC+7) vào ngày thứ `dayOffset` kể từ Thứ 2 2026-01-05.
    function _at(uint256 dayOffset, uint256 hh, uint256 mm) internal pure returns (uint256) {
        return MON_0700 - 7 hours + dayOffset * 1 days + hh * 1 hours + mm * 1 minutes;
    }

    function _shift(uint64 branchId, uint16 startMin, uint16 endMin, uint8 weekdays) internal returns (uint64 id) {
        vm.prank(branchManager);
        id = duty.createShift(branchId, "Ca", startMin, endMin, weekdays);
    }

    function _position(uint64 branchId, uint64 coreMask) internal returns (uint64 id) {
        uint8[] memory ms = new uint8[](1);
        uint64[] memory masks = new uint64[](1);
        masks[0] = coreMask;
        vm.prank(branchManager);
        id = permission.createPosition(branchId, "Thu ngan", ms, masks);
    }

    function _assign(address who, uint64 shiftId, uint64 positionId) internal {
        IDuty.Assignment[] memory list = new IDuty.Assignment[](1);
        list[0] = IDuty.Assignment(shiftId, positionId);
        vm.prank(branchManager);
        duty.setAssignments(b1, who, list);
    }

    /// @dev Ca sáng 06:00–14:00 mọi ngày, vị trí quyền nền tảng `coreMask`, phân công cho `who`.
    function _morning(address who, uint64 coreMask) internal returns (uint64 shiftId, uint64 positionId) {
        shiftId = _shift(b1, 360, 840, ALL_DAYS);
        positionId = _position(b1, coreMask);
        _assign(who, shiftId, positionId);
    }
}
