// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {IRegistry} from "../../../src/interfaces/IRegistry.sol";
import {IPlatformAccess} from "../../../src/interfaces/IPlatformAccess.sol";
import {IBranchRegistry} from "../../../src/interfaces/IBranchRegistry.sol";

/// @notice Registry (T0, ADR 0030/0031): khai báo module, cầu dao, kiểm tập dịch vụ, sổ địa chỉ.
///         Fixture đã đăng ký 0 platform, 1 net, 2 iqr, 3 loyalty (cần net|iqr).
contract RegistryTest is PlatformFixture {
    function test_defaults_registeredByFixture() public view {
        uint8[] memory ids = modules.moduleIds();
        assertEq(ids.length, 4);
        IRegistry.Module memory l = modules.getModule(3);
        assertEq(uint8(l.status), uint8(IRegistry.ModuleStatus.Active));
        assertEq(l.requiresAny, NET | IQR);
        assertEq(l.name, "loyalty");
        assertEq(l.version, 1);
        assertTrue(modules.isActive(1));
        assertEq(modules.serviceBit(3), 4);
    }

    function test_register_newModuleWithoutUpgrade() public {
        vm.prank(platformOwner);
        modules.registerModule(4, "enterprise", 0, 0, 0xFF, 0x0F);
        assertEq(modules.getModule(4).permValid, 0xFF);
        modules.checkServices(8); // bit của module 4 hợp lệ ngay, không nâng cấp gì
        assertEq(modules.moduleIds().length, 5);
    }

    function test_register_rejects() public {
        vm.startPrank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IRegistry.ModuleExists.selector, uint8(1)));
        modules.registerModule(1, "x", 0, 0, 0, 0);
        vm.expectRevert(abi.encodeWithSelector(IRegistry.InvalidModuleId.selector, uint8(17)));
        modules.registerModule(17, "x", 0, 0, 0, 0);
        vm.expectRevert(IRegistry.InvalidModuleName.selector);
        modules.registerModule(5, "", 0, 0, 0, 0);
        vm.expectRevert(abi.encodeWithSelector(IRegistry.InvalidRequires.selector, uint16(16)));
        modules.registerModule(5, "x", 16, 0, 0, 0); // phụ thuộc chính nó
        vm.expectRevert(IRegistry.InvalidPermissions.selector);
        modules.registerModule(5, "x", 0, 0, 0x01, 0x02); // chỉ-Manager ngoài danh mục
        vm.stopPrank();
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        modules.registerModule(5, "x", 0, 0, 0, 0);
    }

    function test_update_bumpsVersion() public {
        vm.prank(platformOwner);
        modules.updateModule(1, 0, 0, 0x3F, 0x20);
        IRegistry.Module memory m = modules.getModule(1);
        assertEq(m.version, 2);
        assertEq(m.permManagerOnly, 0x20);
        assertEq(m.name, "net");
    }

    function test_status_adminPausesOwnerRetires() public {
        vm.prank(platformAdmin);
        modules.setModuleStatus(2, IRegistry.ModuleStatus.Paused, "su co");
        assertFalse(modules.isActive(2));
        vm.expectRevert(
            abi.encodeWithSelector(IRegistry.ModuleNotActive.selector, uint8(2), IRegistry.ModuleStatus.Paused)
        );
        modules.requireActive(2);
        vm.prank(platformAdmin);
        modules.setModuleStatus(2, IRegistry.ModuleStatus.Active, "xong");

        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        modules.setModuleStatus(2, IRegistry.ModuleStatus.Retired, "bo");

        vm.startPrank(platformOwner);
        modules.setModuleStatus(2, IRegistry.ModuleStatus.Retired, "bo");
        vm.expectRevert(
            abi.encodeWithSelector(
                IRegistry.InvalidModuleStatus.selector, IRegistry.ModuleStatus.Retired, IRegistry.ModuleStatus.Active
            )
        );
        modules.setModuleStatus(2, IRegistry.ModuleStatus.Active, "lai");
        vm.expectRevert(abi.encodeWithSelector(IRegistry.ModuleIsRetired.selector, uint8(2)));
        modules.updateModule(2, 0, 0, 0, 0);
        vm.stopPrank();
    }

    function test_status_rejects() public {
        vm.startPrank(platformAdmin);
        vm.expectRevert(IRegistry.InvalidReason.selector);
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Paused, "");
        vm.expectRevert(abi.encodeWithSelector(IRegistry.UnknownModule.selector, uint8(9)));
        modules.setModuleStatus(9, IRegistry.ModuleStatus.Paused, "x");
        vm.expectRevert(
            abi.encodeWithSelector(
                IRegistry.InvalidModuleStatus.selector, IRegistry.ModuleStatus.Active, IRegistry.ModuleStatus.Active
            )
        );
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Active, "x");
        vm.stopPrank();
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, stranger));
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Paused, "x");
    }

    /// @dev Cầu dao vẫn dùng được khi cả hệ đang pause.
    function test_status_worksWhileGloballyPaused() public {
        vm.prank(platformOwner);
        access.pause();
        vm.prank(platformAdmin);
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Paused, "su co");
        assertFalse(modules.isActive(1));
    }

    function test_moduleContracts() public {
        address c = makeAddr("netContract");
        (bool known,) = modules.moduleOf(c);
        assertFalse(known);
        vm.expectRevert(
            abi.encodeWithSelector(IRegistry.ModuleNotActive.selector, uint8(0), IRegistry.ModuleStatus.None)
        );
        modules.requireActiveModuleOf(c);

        vm.prank(platformOwner);
        modules.setModuleContract(c, 1, true);
        uint8 id;
        (known, id) = modules.moduleOf(c);
        assertTrue(known);
        assertEq(id, 1);
        assertEq(modules.requireActiveModuleOf(c), 1);

        vm.prank(platformAdmin);
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Paused, "x");
        vm.expectRevert(
            abi.encodeWithSelector(IRegistry.ModuleNotActive.selector, uint8(1), IRegistry.ModuleStatus.Paused)
        );
        modules.requireActiveModuleOf(c);

        vm.prank(platformOwner);
        modules.setModuleContract(c, 1, false);
        (known,) = modules.moduleOf(c);
        assertFalse(known);
    }

    function test_checkServices() public {
        modules.checkServices(NET | IQR | LOYALTY);
        vm.expectRevert(abi.encodeWithSelector(IRegistry.InvalidServices.selector, uint16(0)));
        modules.checkServices(0);
        vm.expectRevert(abi.encodeWithSelector(IRegistry.InvalidServices.selector, uint16(LOYALTY)));
        modules.checkServices(LOYALTY); // thiếu NET|IQR
        vm.expectRevert(abi.encodeWithSelector(IRegistry.InvalidServices.selector, uint16(8)));
        modules.checkServices(8); // module 4 chưa đăng ký

        vm.prank(platformOwner);
        modules.setModuleStatus(2, IRegistry.ModuleStatus.Retired, "bo iqr");
        vm.expectRevert(abi.encodeWithSelector(IRegistry.InvalidServices.selector, uint16(NET | IQR)));
        modules.checkServices(NET | IQR); // không bật mới module đã Retired
        modules.checkServicesChange(NET | IQR, NET | IQR); // giữ lại bit có sẵn thì được
    }

    function test_addressBook() public {
        bytes32 key = keccak256("hook.loyalty");
        address h = makeAddr("hook");
        vm.prank(platformOwner);
        modules.setAddress(key, h);
        assertEq(modules.addressOf(key), h);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        modules.setAddress(key, h);
    }

    /// @dev Cầu dao chặn ở BranchRegistry.requireWritable — mọi module và Ledger đều đi qua đây.
    function test_branchWritable_respectsModuleStatus() public {
        uint64 a = _createAgent(agentOwner);
        uint64 b = _createBranch(a, "a.vn", NET | IQR);
        branches.requireWritable(b, NET);
        vm.prank(platformAdmin);
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Paused, "x");
        vm.expectRevert(
            abi.encodeWithSelector(IRegistry.ModuleNotActive.selector, uint8(1), IRegistry.ModuleStatus.Paused)
        );
        branches.requireWritable(b, NET);
        branches.requireWritable(b, IQR);
    }

    function test_tenantRejectsUnregisteredService() public {
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IRegistry.InvalidServices.selector, uint16(8)));
        registry.createAgent(agentOwner, 8, _profile("A"));
        uint64 a = _createAgent(agentOwner);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.InvalidServices.selector, uint16(LOYALTY)));
        branches.createBranch(
            a,
            IBranchRegistry.BranchInit({
                domain: "z.vn",
                services: LOYALTY,
                tzOffsetMinutes: 420,
                profile: IBranchRegistry.BranchProfile("Z", "", "", "", "")
            })
        );
    }
}
