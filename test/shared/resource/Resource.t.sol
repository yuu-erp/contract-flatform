// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {StaffFixture} from "../duty/StaffFixture.sol";
import {IResource} from "../../../src/interfaces/IResource.sol";
import {IRegistry} from "../../../src/interfaces/IRegistry.sol";
import {IAgentUserRegistry} from "../../../src/interfaces/IAgentUserRegistry.sol";

/// @notice Định danh thiết bị (ADR 0036): Manager+ đăng ký, khoá ký duy nhất, module lấy từ Registry.
contract ResourceTest is StaffFixture {
    address internal pc = makeAddr("pc");
    address internal pc2 = makeAddr("pc2");

    function test_register_managerAndOwner() public {
        vm.prank(branchManager);
        uint64 id = resource.registerDevice(b1, 1, pc, "VIP-01");
        assertEq(id, 1);

        IResource.Device memory d = resource.getDevice(id);
        assertEq(d.signer, pc);
        assertEq(d.branchId, b1);
        assertEq(d.moduleId, 1);
        assertEq(uint8(d.status), uint8(IResource.Status.Active));
        assertEq(d.label, "VIP-01");
        assertEq(resource.deviceOfSigner(pc), id);

        (uint64 got, uint64 branchId) = resource.requireActiveDevice(pc, 1);
        assertEq(got, id);
        assertEq(branchId, b1);

        vm.prank(agentOwner);
        uint64 id2 = resource.registerDevice(b2, 1, pc2, "B");
        assertEq(id2, 2);
        assertEq(resource.getDevice(id2).branchId, b2);
    }

    function test_staffAndStrangerCannotRegister() public {
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IResource.NotManager.selector, b1, staff));
        resource.registerDevice(b1, 1, pc, "A");

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IResource.NotManager.selector, b1, stranger));
        resource.registerDevice(b1, 1, pc, "A");
    }

    function test_sessionWalletResolvesToManager() public {
        vm.prank(agentOwner);
        desk.registerCustomer(
            b1,
            branchManager,
            "quanly",
            IAgentUserRegistry.UserProfile({displayName: "QL", fullName: "", phone: "", birthday: "", note: ""})
        );
        address counter = makeAddr("counter");
        vm.prank(branchManager);
        delegate.openSession(a, counter, 1 hours);

        vm.prank(counter);
        uint64 id = resource.registerDevice(b1, 1, pc, "May quay");
        assertEq(resource.getDevice(id).signer, pc);
    }

    function test_signerUniqueAcrossBranches_andReleasedOnChange() public {
        vm.prank(branchManager);
        uint64 id = resource.registerDevice(b1, 1, pc, "A");
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IResource.SignerInUse.selector, pc));
        resource.registerDevice(b2, 1, pc, "B");

        vm.prank(branchManager);
        resource.setSigner(id, pc2);
        assertEq(resource.deviceOfSigner(pc), 0);
        assertEq(resource.deviceOfSigner(pc2), id);
        assertEq(resource.getDevice(id).signer, pc2);

        vm.prank(agentOwner);
        resource.registerDevice(b2, 1, pc, "B");
    }

    function test_setSigner_rejectsZeroTakenAndUnknown() public {
        vm.prank(branchManager);
        uint64 id = resource.registerDevice(b1, 1, pc, "A");
        vm.prank(branchManager);
        resource.registerDevice(b1, 1, pc2, "B");

        vm.prank(branchManager);
        vm.expectRevert(IResource.ZeroAddress.selector);
        resource.setSigner(id, address(0));

        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IResource.SignerInUse.selector, pc2));
        resource.setSigner(id, pc2);

        vm.prank(branchManager);
        resource.setSigner(id, pc); // cùng khoá: không đổi, không revert
        assertEq(resource.getDevice(id).signer, pc);

        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IResource.UnknownDevice.selector, uint64(9)));
        resource.setSigner(9, makeAddr("fresh"));
    }

    function test_status_disableBlocksRequire_andRejectsNone() public {
        vm.prank(branchManager);
        uint64 id = resource.registerDevice(b1, 1, pc, "A");

        vm.prank(branchManager);
        resource.setDeviceStatus(id, IResource.Status.Disabled);
        vm.expectRevert(abi.encodeWithSelector(IResource.DeviceNotActive.selector, id));
        resource.requireActiveDevice(pc, 1);
        assertEq(resource.deviceOfSigner(pc), id, "vo hieu khong nha khoa");

        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IResource.StatusUnchanged.selector, id, IResource.Status.Disabled));
        resource.setDeviceStatus(id, IResource.Status.Disabled);

        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IResource.InvalidStatus.selector, IResource.Status.None));
        resource.setDeviceStatus(id, IResource.Status.None);

        vm.prank(branchManager);
        resource.setDeviceStatus(id, IResource.Status.Active);
        (uint64 got,) = resource.requireActiveDevice(pc, 1);
        assertEq(got, id);
    }

    function test_requireActiveDevice_wrongModuleAndUnknownSigner() public {
        vm.prank(branchManager);
        uint64 id = resource.registerDevice(b1, 1, pc, "A");
        vm.expectRevert(abi.encodeWithSelector(IResource.WrongModule.selector, id, uint8(2), uint8(1)));
        resource.requireActiveDevice(pc, 2);
        vm.expectRevert(abi.encodeWithSelector(IResource.UnknownSigner.selector, pc2));
        resource.requireActiveDevice(pc2, 1);
    }

    function test_branchSuspended_blocksUseAndRegister() public {
        vm.prank(branchManager);
        resource.registerDevice(b1, 1, pc, "A");
        vm.prank(platformAdmin);
        branches.suspendBranch(b1, "dung");

        vm.expectRevert(abi.encodeWithSelector(IResource.BranchNotActive.selector, b1));
        resource.requireActiveDevice(pc, 1);

        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IResource.BranchNotActive.selector, b1));
        resource.registerDevice(b1, 1, pc2, "B");
    }

    function test_moduleNotEnabledOnBranch() public {
        vm.prank(agentOwner);
        resource.registerDevice(b2, 1, pc, "NET");

        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IResource.ModuleNotEnabled.selector, b2, uint8(2)));
        resource.registerDevice(b2, 2, pc2, "IQR");

        vm.prank(branchManager);
        resource.registerDevice(b1, 2, pc2, "IQR");
        assertEq(resource.getDevice(2).moduleId, 2);
    }

    function test_moduleMustBeRegistered_pausedStillOk() public {
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IResource.UnknownModule.selector, uint8(9)));
        resource.registerDevice(b1, 9, pc, "A");

        vm.prank(platformAdmin);
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Paused, "bao tri");
        vm.prank(branchManager);
        uint64 id = resource.registerDevice(b1, 1, pc, "A");
        (uint64 got,) = resource.requireActiveDevice(pc, 1);
        assertEq(got, id);

        vm.prank(platformOwner);
        modules.setModuleStatus(2, IRegistry.ModuleStatus.Retired, "bo");
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IResource.ModuleRetired.selector, uint8(2)));
        resource.registerDevice(b1, 2, pc2, "B");
    }

    function test_labelRules() public {
        vm.prank(branchManager);
        vm.expectRevert(IResource.InvalidLabel.selector);
        resource.registerDevice(b1, 1, pc, "");

        vm.prank(branchManager);
        vm.expectRevert(IResource.InvalidLabel.selector);
        resource.registerDevice(b1, 1, pc, "123456789012345678901234567890123"); // 33

        vm.prank(branchManager);
        resource.registerDevice(b1, 1, pc, "12345678901234567890123456789012"); // 32
    }

    function test_zeroSignerAndPaused() public {
        vm.prank(branchManager);
        vm.expectRevert(IResource.ZeroAddress.selector);
        resource.registerDevice(b1, 1, address(0), "A");

        vm.prank(platformOwner);
        access.pause();
        vm.prank(branchManager);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        resource.registerDevice(b1, 1, pc, "A");
    }

    function test_paginationAndCap() public {
        for (uint256 i; i < 3; ++i) {
            vm.prank(branchManager);
            resource.registerDevice(b1, 1, address(uint160(0xA100 + i)), "M");
        }
        uint64[] memory page = resource.devicesOf(b1, 1, 1);
        assertEq(page.length, 1);
        assertEq(page[0], 2);
        assertEq(resource.devicesOf(b1, 0, 1000).length, 3);
        assertEq(resource.devicesOf(b1, 5, 1).length, 0);

        for (uint256 i = 3; i < 512; ++i) {
            vm.prank(branchManager);
            resource.registerDevice(b1, 1, address(uint160(0xB000 + i)), "M");
        }
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IResource.TooManyDevices.selector, b1));
        resource.registerDevice(b1, 1, makeAddr("overflow"), "M");
        assertEq(resource.devicesOf(b1, 0, 1000).length, 100);
    }

    function test_unknownDeviceIsEmpty() public view {
        IResource.Device memory d = resource.getDevice(0);
        assertEq(uint8(d.status), uint8(IResource.Status.None));
        assertEq(d.branchId, 0);
    }
}
