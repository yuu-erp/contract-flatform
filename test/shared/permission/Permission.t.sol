// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {StaffFixture} from "../duty/StaffFixture.sol";
import {IPermission} from "../../../src/interfaces/IPermission.sol";
import {IRegistry} from "../../../src/interfaces/IRegistry.sol";

contract PermissionTest is StaffFixture {
    uint8 internal constant REGISTER = 0; // đăng ký khách
    uint8 internal constant OTP = 2;
    uint8 internal constant REFUND = 8; // chỉ Manager

    /// @dev Danh mục NET giả cho test: bit 0..5 hợp lệ, bit 5 chỉ Manager.
    function _netCatalog() internal {
        uint16 flags = modules.FLAG_SALES() | modules.FLAG_TAX_INCLUSIVE_ONLY();
        vm.prank(platformOwner);
        modules.updateModule(1, 0, flags, 0x3F, 0x20);
    }

    function _onDuty(address who, uint64 coreMask) internal returns (uint64 positionId) {
        uint64 s;
        (s, positionId) = _morning(who, coreMask);
        vm.prank(who);
        duty.checkIn(b1, s, positionId, 0);
    }

    // ─── Vị trí ─────────────────────────────────────────────────────────

    function test_createPosition_managerOnlyAndMaskRules() public {
        uint8[] memory ms = new uint8[](1);
        uint64[] memory masks = new uint64[](1);
        masks[0] = 1;
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IPermission.NotManager.selector, b1, staff));
        permission.createPosition(b1, "x", ms, masks);

        vm.startPrank(branchManager);
        masks[0] = uint64(1) << REFUND;
        vm.expectRevert(abi.encodeWithSelector(IPermission.InvalidMask.selector, uint8(0), masks[0]));
        permission.createPosition(b1, "x", ms, masks); // quyền chỉ Manager không vào vị trí
        masks[0] = uint64(1) << 20;
        vm.expectRevert(abi.encodeWithSelector(IPermission.InvalidMask.selector, uint8(0), masks[0]));
        permission.createPosition(b1, "x", ms, masks); // bit ngoài danh mục
        ms[0] = 9;
        masks[0] = 1;
        vm.expectRevert(abi.encodeWithSelector(IPermission.InvalidMask.selector, uint8(9), uint64(1)));
        permission.createPosition(b1, "x", ms, masks); // module chưa đăng ký
        vm.expectRevert(IPermission.LengthMismatch.selector);
        permission.createPosition(b1, "x", ms, new uint64[](0));
        vm.expectRevert(IPermission.InvalidName.selector);
        permission.createPosition(b1, "", new uint8[](0), new uint64[](0));

        ms[0] = 0;
        masks[0] = 0x0F;
        uint64 id = permission.createPosition(b1, "Thu ngan", ms, masks);
        vm.stopPrank();
        assertEq(permission.permsOf(id, 0), 0x0F);
        (uint64 br, bool active) = permission.positionStatus(id);
        assertEq(br, b1);
        assertTrue(active);
    }

    function test_positions_capPerBranch() public {
        vm.startPrank(branchManager);
        for (uint256 i; i < 32; ++i) {
            permission.createPosition(b1, "p", new uint8[](0), new uint64[](0));
        }
        vm.expectRevert(abi.encodeWithSelector(IPermission.TooManyPositions.selector, b1));
        permission.createPosition(b1, "p", new uint8[](0), new uint64[](0));
        vm.stopPrank();
    }

    function test_editPosition() public {
        uint64 id = _position(b1, 1);
        vm.startPrank(branchManager);
        permission.setPositionPerms(id, 0, 0xFF);
        permission.renamePosition(id, "Phuc vu");
        permission.setPositionActive(id, false);
        vm.expectRevert(abi.encodeWithSelector(IPermission.PositionInactive.selector, id));
        permission.setPositionPerms(id, 0, 1);
        vm.stopPrank();
        assertEq(permission.getPosition(id).name, "Phuc vu");
        assertEq(permission.permsOf(id, 0), 0xFF);
    }

    // ─── can() ──────────────────────────────────────────────────────────

    function test_can_ownerAndManagerWithoutShift() public view {
        assertTrue(permission.can(b1, agentOwner, 0, REFUND));
        assertTrue(permission.can(b1, branchManager, 0, REFUND));
        assertTrue(permission.can(b1, branchManager, 0, REGISTER));
        assertFalse(permission.can(b1, branchManager, 0, 20)); // bit ngoài danh mục
        assertFalse(permission.can(b2, branchManager, 0, REGISTER)); // không phải Manager ở b2
        assertFalse(permission.can(b1, stranger, 0, REGISTER));
    }

    function test_can_staffNeedsActiveSessionAndPositionBit() public {
        assertFalse(permission.can(b1, staff, 0, REGISTER)); // chưa vào ca
        _onDuty(staff, (uint64(1) << REGISTER) | (uint64(1) << OTP));
        assertTrue(permission.can(b1, staff, 0, REGISTER));
        assertTrue(permission.can(b1, staff, 0, OTP));
        assertFalse(permission.can(b1, staff, 0, 1)); // vị trí không có
        assertFalse(permission.can(b1, staff, 0, REFUND)); // chỉ Manager
        assertFalse(permission.can(b2, staff, 0, REGISTER)); // chi nhánh khác
        vm.expectRevert(abi.encodeWithSelector(IPermission.NoPermission.selector, b1, staff, uint8(0), uint8(1)));
        permission.requirePermission(b1, staff, 0, 1);
    }

    function test_can_lostImmediately() public {
        uint64 p = _onDuty(staff, 1);
        vm.prank(branchManager);
        permission.setPositionActive(p, false);
        assertFalse(permission.can(b1, staff, 0, REGISTER)); // ngừng vị trí
        vm.prank(branchManager);
        permission.setPositionActive(p, true);
        assertTrue(permission.can(b1, staff, 0, REGISTER));

        vm.warp(_at(0, 18, 0)); // quá trần tăng ca
        assertFalse(permission.can(b1, staff, 0, REGISTER));
    }

    function test_can_revokedStaff() public {
        _onDuty(staff, 1);
        vm.prank(agentOwner);
        agentAccess.revokeRole(b1, staff);
        assertFalse(permission.can(b1, staff, 0, REGISTER));
    }

    function test_can_overtimeKeepsPermission() public {
        _onDuty(staff, 1);
        vm.warp(_at(0, 16, 0)); // hết ca 14:00, người sau chưa tới
        assertTrue(permission.can(b1, staff, 0, REGISTER));
    }

    /// @dev Quyền theo module: chỉ khi chi nhánh bật module và module Active (ADR 0031).
    function test_can_moduleScoped() public {
        _netCatalog();
        uint8[] memory ms = new uint8[](2);
        uint64[] memory masks = new uint64[](2);
        ms[1] = 1;
        masks[0] = 1;
        masks[1] = 0x03; // NET: mở máy, tắt máy
        vm.prank(branchManager);
        uint64 p = permission.createPosition(b1, "Thu ngan", ms, masks);
        uint64 s = _shift(b1, 360, 840, ALL_DAYS);
        _assign(staff, s, p);
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);

        assertTrue(permission.can(b1, staff, 1, 0));
        assertFalse(permission.can(b1, staff, 1, 2));
        assertFalse(permission.can(b1, staff, 1, 5)); // chỉ Manager của NET
        assertTrue(permission.can(b1, branchManager, 1, 5));
        assertFalse(permission.can(b1, staff, 2, 0)); // IQR chưa có danh mục

        vm.prank(platformAdmin);
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Paused, "su co");
        assertFalse(permission.can(b1, staff, 1, 0)); // module chết
        assertFalse(permission.can(b1, agentOwner, 1, 0));
        assertTrue(permission.can(b1, staff, 0, 0)); // quyền nền tảng vẫn còn

        vm.prank(platformAdmin);
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Active, "xong");
        vm.prank(platformAdmin);
        branches.setBranchServices(b1, IQR); // tắt NET ở chi nhánh
        assertFalse(permission.can(b1, staff, 1, 0));
        assertFalse(permission.can(b1, agentOwner, 1, 0));
    }
}
