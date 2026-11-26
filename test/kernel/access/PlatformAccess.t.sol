// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {BaseTest} from "../../utils/BaseTest.sol";
import {PlatformAccess} from "../../../src/kernel/access/PlatformAccess.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IPlatformAccess} from "../../../src/interfaces/IPlatformAccess.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PlatformAccessV2 is PlatformAccess {
    function version() external pure returns (uint256) {
        return 2;
    }
}

contract PlatformAccessTest is BaseTest {
    PlatformAccess internal access;

    function setUp() public override {
        super.setUp();
        access = PlatformAccess(
            deployProxy(address(new PlatformAccess()), abi.encodeCall(PlatformAccess.initialize, (platformOwner)))
        );
    }

    // ─── Khởi tạo ───────────────────────────────────────────────────────

    function test_initialize_setsOwner() public view {
        assertEq(access.owner(), platformOwner);
        assertEq(access.pendingOwner(), address(0));
        assertFalse(access.paused());
        assertEq(access.platformAdminCount(), 0);
    }

    function test_initialize_revertsTwice() public {
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        access.initialize(stranger);
    }

    function test_initialize_revertsZeroOwner() public {
        address impl = address(new PlatformAccess());
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableInvalidOwner.selector, address(0)));
        deployProxy(impl, abi.encodeCall(PlatformAccess.initialize, (address(0))));
    }

    function test_implementation_cannotBeInitialized() public {
        PlatformAccess impl = new PlatformAccess();
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        impl.initialize(stranger);
    }

    // ─── Owner hai bước ─────────────────────────────────────────────────

    function test_transferOwnership_twoStep() public {
        vm.prank(platformOwner);
        vm.expectEmit(address(access));
        emit Ownable2StepUpgradeable.OwnershipTransferStarted(platformOwner, stranger);
        access.transferOwnership(stranger);
        assertEq(access.owner(), platformOwner, "chua doi truoc khi accept");
        assertEq(access.pendingOwner(), stranger);

        vm.prank(stranger);
        vm.expectEmit(address(access));
        emit OwnableUpgradeable.OwnershipTransferred(platformOwner, stranger);
        access.acceptOwnership();
        assertEq(access.owner(), stranger);
        assertEq(access.pendingOwner(), address(0));
    }

    function test_transferOwnership_onlyOwner() public {
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, stranger));
        access.transferOwnership(stranger);
    }

    function test_transferOwnership_cancelWithZero() public {
        vm.startPrank(platformOwner);
        access.transferOwnership(stranger);
        access.transferOwnership(address(0));
        vm.stopPrank();
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, stranger));
        access.acceptOwnership();
    }

    function test_acceptOwnership_onlyPending() public {
        vm.prank(platformOwner);
        access.transferOwnership(stranger);
        vm.prank(customer);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, customer));
        access.acceptOwnership();
    }

    function test_transferOwnership_toAdminReverts() public {
        vm.startPrank(platformOwner);
        access.addPlatformAdmin(platformAdmin);
        vm.expectRevert(IPlatformAccess.OwnerCannotBeAdmin.selector);
        access.transferOwnership(platformAdmin);
        vm.stopPrank();
    }

    function test_oldOwnerLosesPowers() public {
        vm.prank(platformOwner);
        access.transferOwnership(stranger);
        vm.prank(stranger);
        access.acceptOwnership();
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformOwner));
        access.addPlatformAdmin(platformAdmin);
    }

    function test_renounceOwnership_disabled() public {
        vm.prank(platformOwner);
        vm.expectRevert(IPlatformAccess.RenounceDisabled.selector);
        access.renounceOwnership();
        assertEq(access.owner(), platformOwner);

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, stranger));
        access.renounceOwnership();
    }

    function test_pause_emitsOzEvents() public {
        vm.prank(platformOwner);
        vm.expectEmit(address(access));
        emit PausableUpgradeable.Paused(platformOwner);
        access.pause();
        vm.prank(platformOwner);
        vm.expectEmit(address(access));
        emit PausableUpgradeable.Unpaused(platformOwner);
        access.unpause();
    }

    // ─── Admin ──────────────────────────────────────────────────────────

    function test_addRemoveAdmin() public {
        vm.startPrank(platformOwner);
        vm.expectEmit(address(access));
        emit IPlatformAccess.PlatformAdminAdded(1, platformAdmin, platformOwner);
        access.addPlatformAdmin(platformAdmin);
        access.addPlatformAdmin(platformAdmin2);
        assertTrue(access.isPlatformAdmin(platformAdmin));
        assertEq(access.platformAdminCount(), 2);

        vm.expectEmit(address(access));
        emit IPlatformAccess.PlatformAdminRemoved(1, platformAdmin, platformOwner);
        access.removePlatformAdmin(platformAdmin);
        vm.stopPrank();

        assertFalse(access.isPlatformAdmin(platformAdmin));
        assertTrue(access.isPlatformAdmin(platformAdmin2));
        address[] memory list = access.platformAdmins(0, 10);
        assertEq(list.length, 1);
        assertEq(list[0], platformAdmin2);
    }

    function test_addAdmin_onlyOwner() public {
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        access.addPlatformAdmin(platformAdmin);
    }

    function test_adminCannotManageAdmins() public {
        vm.prank(platformOwner);
        access.addPlatformAdmin(platformAdmin);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        access.addPlatformAdmin(platformAdmin2);
    }

    function test_addAdmin_rejects() public {
        vm.startPrank(platformOwner);
        vm.expectRevert(IPlatformAccess.ZeroAddress.selector);
        access.addPlatformAdmin(address(0));
        vm.expectRevert(IPlatformAccess.OwnerCannotBeAdmin.selector);
        access.addPlatformAdmin(platformOwner);
        access.addPlatformAdmin(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.AlreadyAdmin.selector, platformAdmin));
        access.addPlatformAdmin(platformAdmin);
        access.transferOwnership(stranger);
        vm.expectRevert(IPlatformAccess.OwnerCannotBeAdmin.selector);
        access.addPlatformAdmin(stranger);
        vm.stopPrank();
    }

    function test_removeAdmin_notAdminReverts() public {
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotAdmin.selector, stranger));
        access.removePlatformAdmin(stranger);
    }

    function test_maxAdmins() public {
        vm.startPrank(platformOwner);
        for (uint256 i; i < access.MAX_ADMINS(); ++i) {
            access.addPlatformAdmin(address(uint160(0x1000 + i)));
        }
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.TooManyAdmins.selector, 50));
        access.addPlatformAdmin(stranger);
        vm.stopPrank();
    }

    function test_platformAdmins_pagination() public {
        vm.startPrank(platformOwner);
        for (uint256 i; i < 5; ++i) {
            access.addPlatformAdmin(address(uint160(0x1000 + i)));
        }
        vm.stopPrank();
        assertEq(access.platformAdmins(0, 2).length, 2);
        assertEq(access.platformAdmins(4, 10).length, 1);
        assertEq(access.platformAdmins(5, 10).length, 0);
        assertEq(access.platformAdmins(1, type(uint256).max).length, 4);
    }

    function test_acceptOwnership_revertsIfBecameAdmin() public {
        vm.startPrank(platformOwner);
        access.transferOwnership(stranger);
        vm.expectRevert(IPlatformAccess.OwnerCannotBeAdmin.selector);
        access.addPlatformAdmin(stranger);
        vm.stopPrank();
    }

    // ─── Pause ──────────────────────────────────────────────────────────

    function test_pauseUnpause() public {
        vm.startPrank(platformOwner);
        access.pause();
        assertTrue(access.paused());
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        access.requireNotPaused();
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        access.pause();
        access.unpause();
        assertFalse(access.paused());
        access.requireNotPaused();
        vm.expectRevert(PausableUpgradeable.ExpectedPause.selector);
        access.unpause();
        vm.stopPrank();
    }

    function test_pause_ownerOrAdmin() public {
        vm.prank(platformOwner);
        access.addPlatformAdmin(platformAdmin);

        vm.prank(platformAdmin);
        access.pause();
        assertTrue(access.paused());
        vm.prank(platformAdmin);
        access.unpause();
        assertFalse(access.paused());

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, stranger));
        access.pause();

        vm.prank(platformOwner);
        access.removePlatformAdmin(platformAdmin);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, platformAdmin));
        access.pause();
    }

    // ─── Upgrade ────────────────────────────────────────────────────────

    function test_upgrade_onlyOwner_keepsState() public {
        vm.prank(platformOwner);
        access.addPlatformAdmin(platformAdmin);
        address v2 = address(new PlatformAccessV2());

        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        access.upgradeToAndCall(v2, "");

        vm.prank(platformOwner);
        access.upgradeToAndCall(v2, "");
        assertEq(PlatformAccessV2(address(access)).version(), 2);
        assertEq(access.owner(), platformOwner);
        assertTrue(access.isPlatformAdmin(platformAdmin));
    }
}
