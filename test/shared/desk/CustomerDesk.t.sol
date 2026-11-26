// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {StaffFixture} from "../duty/StaffFixture.sol";
import {IPermission} from "../../../src/interfaces/IPermission.sol";
import {IAgentUserRegistry} from "../../../src/interfaces/IAgentUserRegistry.sol";

/// @notice Quầy khách (ADR 0035): nhân viên chỉ thao tác khi đang trực và vị trí có quyền; chặn khách chỉ Manager.
contract CustomerDeskTest is StaffFixture {
    address internal teo = makeAddr("teo");
    address internal otp = makeAddr("otp");
    address internal counter = makeAddr("counterPc"); // ví phiên máy quầy

    function _p() internal pure returns (IAgentUserRegistry.UserProfile memory) {
        return IAgentUserRegistry.UserProfile({displayName: "Teo", fullName: "", phone: "", birthday: "", note: ""});
    }

    function _onDuty(uint64 coreMask) internal {
        (uint64 s, uint64 p) = _morning(staff, coreMask);
        vm.prank(staff);
        duty.checkIn(b1, s, p, 0);
    }

    function test_staffNeedsShiftAndPositionBit() public {
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IPermission.NoPermission.selector, b1, staff, uint8(0), uint8(0)));
        desk.registerCustomer(b1, teo, "teo", _p()); // chưa vào ca

        _onDuty(1); // chỉ quyền đăng ký khách
        vm.prank(staff);
        desk.registerCustomer(b1, teo, "teo", _p());
        assertEq(users.getUser(a, teo).registeredBy, staff);

        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IPermission.NoPermission.selector, b1, staff, uint8(0), uint8(2)));
        desk.issueOtp(b1, teo, otp, 5 minutes); // vị trí không có quyền cấp OTP
    }

    function test_blockIsManagerOnly() public {
        _onDuty(0xFF);
        vm.prank(staff);
        desk.registerCustomer(b1, teo, "teo", _p());
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IPermission.NoPermission.selector, b1, staff, uint8(0), uint8(9)));
        desk.setCustomerBlocked(b1, teo, true, "gian lan");
        vm.prank(branchManager);
        desk.setCustomerBlocked(b1, teo, true, "gian lan");
        assertFalse(users.isActive(a, teo));
    }

    function test_staffViaCounterSessionWallet() public {
        // Nhân viên cũng là tài khoản của agent (đăng nhập bằng mật khẩu, không cần ví).
        vm.prank(agentOwner);
        desk.registerCustomer(b1, staff, "nhanvien.lan", _p());
        _onDuty(0xFF);
        vm.prank(staff);
        delegate.openSession(a, counter, 8 hours); // máy quầy nhận ví phiên của nhân viên
        vm.prank(counter);
        desk.registerCustomer(b1, teo, "teo", _p());
        assertEq(users.getUser(a, teo).registeredBy, staff, "nguoi lam la nhan vien that");
        vm.prank(counter);
        desk.issueOtp(b1, teo, otp, 5 minutes);
        assertEq(delegate.otpOf(a, otp).account, teo);
    }

    function test_resetAndProfile() public {
        _onDuty(0xFF);
        vm.startPrank(staff);
        desk.registerCustomer(b1, teo, "teo", _p());
        address newLogin = makeAddr("newLogin");
        desk.resetCustomerLogin(b1, teo, newLogin);
        desk.updateCustomerProfile(
            b1,
            teo,
            IAgentUserRegistry.UserProfile({displayName: "Teo Pro", fullName: "", phone: "", birthday: "", note: ""})
        );
        vm.stopPrank();
        assertEq(users.accountOfLogin(a, newLogin), teo);
        assertEq(users.getProfile(a, teo).profile.displayName, "Teo Pro");
    }

    function test_whenPaused() public {
        vm.prank(platformOwner);
        access.pause();
        vm.prank(agentOwner);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        desk.registerCustomer(b1, teo, "teo", _p());
    }
}
