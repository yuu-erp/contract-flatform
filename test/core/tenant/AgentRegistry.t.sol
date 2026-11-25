// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {AgentRegistry} from "../../../src/core/tenant/AgentRegistry.sol";
import {PlatformAuditRecord} from "../../../src/interfaces/IPlatformAudit.sol";
import {IAgentRegistry} from "../../../src/interfaces/IAgentRegistry.sol";
import {IHistoryIndex} from "../../../src/interfaces/IHistoryIndex.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IPlatformAccess} from "../../../src/interfaces/IPlatformAccess.sol";

contract AgentRegistryTest is PlatformFixture {
    // ─── tạo ────────────────────────────────────────────────────────────

    function test_createAgent() public {
        vm.prank(platformAdmin);
        vm.expectEmit(address(registry));
        emit IAgentRegistry.AgentCreated(1, 1, agentOwner, 1, NET | IQR | LOYALTY);
        uint64 id = registry.createAgent(agentOwner, NET | IQR | LOYALTY, _profile("Cyber Q1"));

        assertEq(id, 1);
        assertEq(registry.agentCount(), 1);
        assertEq(registry.agentIdOf(agentOwner), 1);
        assertTrue(registry.isAgentActive(1));
        registry.requireAgentWritable(1);

        IAgentRegistry.Agent memory a = registry.getAgent(1);
        assertEq(a.id, 1);
        assertEq(a.owner, agentOwner);
        assertEq(uint8(a.status), uint8(IAgentRegistry.AgentStatus.Active));
        assertEq(a.createdAt, block.timestamp);
        assertEq(a.allowedServices, NET | IQR | LOYALTY);

        IAgentRegistry.AgentProfileRecord memory r = registry.getAgentProfile(1);
        assertEq(r.agentId, 1);
        assertEq(r.owner, agentOwner);
        assertEq(r.profile.storeName, "Cyber Q1");
        assertEq(r.profile.storePhone, "+84 28 1234 5678");
    }

    function test_createAgent_rejectsInvalidGrant() public {
        vm.startPrank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.InvalidServices.selector, uint16(0)));
        registry.createAgent(agentOwner, 0, _profile("x"));
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.InvalidServices.selector, LOYALTY));
        registry.createAgent(agentOwner, LOYALTY, _profile("x"));
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.InvalidServices.selector, uint16(8)));
        registry.createAgent(agentOwner, 8, _profile("x"));
        vm.stopPrank();
    }

    function test_setAgentServices() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(platformAdmin);
        registry.setAgentServices(id, NET | LOYALTY);
        assertEq(registry.getAgent(id).allowedServices, NET | LOYALTY);
        assertEq(registry.requireAgentWritable(id), NET | LOYALTY);

        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, agentOwner));
        registry.setAgentServices(id, NET);

        vm.startPrank(platformAdmin);
        registry.deleteAgent(id, "x");
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentDeleted.selector, id));
        registry.setAgentServices(id, NET);
        vm.stopPrank();
    }

    function test_setAgentServices_sameValueEmitsNothing() public {
        uint64 id = _createAgent(agentOwner);
        vm.recordLogs();
        vm.prank(platformAdmin);
        registry.setAgentServices(id, NET | IQR | LOYALTY);
        assertEq(vm.getRecordedLogs().length, 0);
        assertEq(registry.getAgent(id).allowedServices, NET | IQR | LOYALTY);
    }

    function test_createAgent_ownerOrAdmin() public {
        vm.prank(platformOwner); // owner là vai cao nhất: làm được việc của admin
        uint64 id = registry.createAgent(agentOwner, NET | IQR | LOYALTY, _profile("x"));
        assertEq(registry.getAgent(id).owner, agentOwner);

        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, agentOwner));
        registry.createAgent(agentOwner, NET | IQR | LOYALTY, _profile("x"));
    }

    function test_createAgent_oneWalletOneAgent() public {
        _createAgent(agentOwner);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerAlreadyHasAgent.selector, agentOwner, 1));
        registry.createAgent(agentOwner, NET | IQR | LOYALTY, _profile("Cyber Q2"));
    }

    /// Vai trò agent không trùng tầng quản trị: ví owner/admin nền tảng không làm chủ agent.
    function test_createAgent_rejectsPlatformRoles() public {
        vm.startPrank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerIsPlatformRole.selector, platformOwner));
        registry.createAgent(platformOwner, NET | IQR | LOYALTY, _profile("x"));
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerIsPlatformRole.selector, platformAdmin2));
        registry.createAgent(platformAdmin2, NET | IQR | LOYALTY, _profile("x"));
        vm.stopPrank();
    }

    function test_createAgent_validatesProfile() public {
        vm.startPrank(platformAdmin);
        vm.expectRevert(IAgentRegistry.ZeroAddress.selector);
        registry.createAgent(address(0), NET | IQR | LOYALTY, _profile("x"));
        vm.expectRevert(IAgentRegistry.InvalidStoreName.selector);
        registry.createAgent(agentOwner, NET | IQR | LOYALTY, _profile(""));
        vm.expectRevert(IAgentRegistry.InvalidStoreName.selector);
        registry.createAgent(agentOwner, NET | IQR | LOYALTY, _profile(string(new bytes(101))));
        IAgentRegistry.AgentProfile memory p = _profile("x");
        p.note = string(new bytes(501));
        vm.expectRevert(IAgentRegistry.FieldTooLong.selector);
        registry.createAgent(agentOwner, NET | IQR | LOYALTY, p);
        vm.stopPrank();
    }

    function test_createAgent_phone() public {
        IAgentRegistry.AgentProfile memory p = _profile("x");
        vm.startPrank(platformAdmin);
        p.storePhone = "0901-234.567";
        uint64 id = registry.createAgent(agentOwner, NET | IQR | LOYALTY, p);
        assertEq(registry.getAgentProfile(id).profile.storePhone, "0901-234.567");

        p.storePhone = ""; // không bắt buộc
        registry.createAgent(customer, NET | IQR | LOYALTY, p);

        p.storePhone = "0901abc";
        vm.expectRevert(IAgentRegistry.InvalidPhone.selector);
        registry.createAgent(customer2, NET | IQR | LOYALTY, p);
        p.storePhone = "+84 (28) 1234 5678 99"; // 21 ký tự
        vm.expectRevert(IAgentRegistry.InvalidPhone.selector);
        registry.createAgent(customer2, NET | IQR | LOYALTY, p);
        vm.stopPrank();
    }

    function test_updateAgentProfile_phone() public {
        uint64 id = _createAgent(agentOwner);
        IAgentRegistry.AgentProfile memory p = _profile("Cyber Q1");
        p.storePhone = "0283 999 888";
        vm.prank(platformAdmin);
        registry.updateAgentProfile(id, p);
        assertEq(registry.getAgentProfile(id).profile.storePhone, "0283 999 888");
    }

    function test_createAgent_whenPausedReverts() public {
        vm.prank(platformOwner);
        access.pause();
        vm.prank(platformAdmin);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        registry.createAgent(agentOwner, NET | IQR | LOYALTY, _profile("x"));
    }

    function test_createAgent_writesAudit() public {
        _createAgent(agentOwner);
        IHistoryIndex.Query memory q;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("X", "agent_create");
        q.sortSlot = 0;
        q.limit = 10;
        IHistoryIndex.Page memory p = historyIndex.search(0, "platform_audit", q);
        assertEq(p.total, 1);
        PlatformAuditRecord memory r = abi.decode(p.data[0], (PlatformAuditRecord));
        assertEq(r.actor, platformAdmin);
        assertEq(r.agentId, 1);
        assertEq(r.action, "agent_create");
    }

    function test_createAgent_fullDBFailureReverts() public {
        fulldb.setFailWrites(true);
        vm.prank(platformAdmin);
        vm.expectRevert();
        registry.createAgent(agentOwner, NET | IQR | LOYALTY, _profile("x"));
        assertEq(registry.agentCount(), 0);
    }

    // ─── sửa ────────────────────────────────────────────────────────────

    function test_updateAgentProfile() public {
        uint64 id = _createAgent(agentOwner);
        vm.warp(block.timestamp + 1 days);
        vm.prank(platformAdmin2);
        registry.updateAgentProfile(id, _profile("Cyber Q1 moi"));
        assertEq(registry.getAgentProfile(id).profile.storeName, "Cyber Q1 moi");
        assertEq(registry.getAgent(id).updatedAt, block.timestamp);
        assertEq(registry.getAgent(id).profileDocId, 1, "ghi de cung document");
    }

    function test_updateAgentProfile_rejects() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(agentOwner); // chủ agent không tự sửa hồ sơ ở tầng quản trị
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, agentOwner));
        registry.updateAgentProfile(id, _profile("x"));

        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotFound.selector, 9));
        registry.updateAgentProfile(9, _profile("x"));
    }

    // ─── dừng / mở lại ──────────────────────────────────────────────────

    function test_suspendResume() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(platformAdmin);
        vm.expectEmit(address(registry));
        emit IAgentRegistry.AgentStatusChanged(
            1, id, IAgentRegistry.AgentStatus.Active, IAgentRegistry.AgentStatus.Suspended, platformAdmin, "no phi"
        );
        registry.suspendAgent(id, "no phi");
        assertFalse(registry.isAgentActive(id));
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotActive.selector, id));
        registry.requireAgentWritable(id);
        // dữ liệu vẫn đọc được
        assertEq(registry.getAgentProfile(id).profile.storeName, "Cyber Q1");

        vm.prank(platformAdmin);
        registry.resumeAgent(id, "da dong phi");
        assertTrue(registry.isAgentActive(id));
    }

    function test_suspend_invalidTransitions() public {
        uint64 id = _createAgent(agentOwner);
        vm.startPrank(platformAdmin);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAgentRegistry.InvalidStatusTransition.selector,
                IAgentRegistry.AgentStatus.Active,
                IAgentRegistry.AgentStatus.Active
            )
        );
        registry.resumeAgent(id, "x");
        registry.suspendAgent(id, "x");
        vm.expectRevert(
            abi.encodeWithSelector(
                IAgentRegistry.InvalidStatusTransition.selector,
                IAgentRegistry.AgentStatus.Suspended,
                IAgentRegistry.AgentStatus.Suspended
            )
        );
        registry.suspendAgent(id, "x");
        vm.stopPrank();
    }

    function test_suspend_requiresReason() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(platformAdmin);
        vm.expectRevert(IAgentRegistry.EmptyReason.selector);
        registry.suspendAgent(id, "");
    }

    function test_requireAgentWritable_whenSystemPaused() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(platformOwner);
        access.pause();
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        registry.requireAgentWritable(id);
    }

    // ─── xoá mềm ────────────────────────────────────────────────────────

    function test_deleteAgent_softDelete() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(platformAdmin);
        registry.deleteAgent(id, "dung hop dong");

        IAgentRegistry.Agent memory a = registry.getAgent(id);
        assertEq(uint8(a.status), uint8(IAgentRegistry.AgentStatus.Deleted));
        assertEq(a.owner, agentOwner, "giu lich su chu cu");
        assertEq(registry.agentIdOf(agentOwner), 0, "nha vi chu");
        assertEq(registry.getAgentProfile(id).profile.storeName, "Cyber Q1", "du lieu con doc duoc");
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotActive.selector, id));
        registry.requireAgentWritable(id);
    }

    function test_deleteAgent_isFinal() public {
        uint64 id = _createAgent(agentOwner);
        vm.startPrank(platformAdmin);
        registry.deleteAgent(id, "x");
        vm.expectRevert(
            abi.encodeWithSelector(
                IAgentRegistry.InvalidStatusTransition.selector,
                IAgentRegistry.AgentStatus.Deleted,
                IAgentRegistry.AgentStatus.Active
            )
        );
        registry.resumeAgent(id, "x");
        vm.expectRevert(
            abi.encodeWithSelector(
                IAgentRegistry.InvalidStatusTransition.selector,
                IAgentRegistry.AgentStatus.Deleted,
                IAgentRegistry.AgentStatus.Deleted
            )
        );
        registry.deleteAgent(id, "x");
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentDeleted.selector, id));
        registry.updateAgentProfile(id, _profile("x"));
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentDeleted.selector, id));
        registry.proposeAgentOwner(id, customer);
        vm.stopPrank();
    }

    function test_deleteAgent_fromSuspended_andOwnerCanGetNewAgent() public {
        uint64 id = _createAgent(agentOwner);
        vm.startPrank(platformAdmin);
        registry.suspendAgent(id, "x");
        registry.deleteAgent(id, "x");
        uint64 id2 = registry.createAgent(agentOwner, NET | IQR | LOYALTY, _profile("Cyber moi"));
        vm.stopPrank();
        assertEq(id2, 2);
        assertEq(registry.agentIdOf(agentOwner), 2);
    }

    function test_deleteAgent_clearsPendingOwner() public {
        uint64 id = _createAgent(agentOwner);
        vm.startPrank(platformAdmin);
        registry.proposeAgentOwner(id, coOwner);
        registry.deleteAgent(id, "x");
        vm.stopPrank();
        vm.prank(coOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentDeleted.selector, id));
        registry.acceptAgentOwner(id);
    }

    // ─── đổi ví chủ ─────────────────────────────────────────────────────

    function test_changeOwner_twoStep() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(id, coOwner);
        assertEq(registry.getAgent(id).owner, agentOwner);
        assertEq(registry.getAgent(id).pendingOwner, coOwner);

        vm.prank(coOwner);
        vm.expectEmit(address(registry));
        emit IAgentRegistry.AgentOwnerTransferred(1, id, agentOwner, coOwner);
        registry.acceptAgentOwner(id);

        assertEq(registry.getAgent(id).owner, coOwner);
        assertEq(registry.getAgentProfile(id).owner, coOwner);
        assertEq(registry.getAgent(id).pendingOwner, address(0));
        assertEq(registry.agentIdOf(coOwner), id);
        assertEq(registry.agentIdOf(agentOwner), 0);
    }

    function test_changeOwner_rejects() public {
        uint64 id = _createAgent(agentOwner);
        uint64 other = _createAgent(customer);
        vm.startPrank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerAlreadyHasAgent.selector, customer, other));
        registry.proposeAgentOwner(id, customer);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerIsPlatformRole.selector, platformAdmin2));
        registry.proposeAgentOwner(id, platformAdmin2);
        registry.proposeAgentOwner(id, coOwner);
        vm.stopPrank();

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.NotPendingOwner.selector, stranger));
        registry.acceptAgentOwner(id);

        vm.prank(agentOwner); // chủ hiện tại không tự đề xuất
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, agentOwner));
        registry.proposeAgentOwner(id, stranger);
    }

    function test_changeOwner_cancel() public {
        uint64 id = _createAgent(agentOwner);
        vm.startPrank(platformAdmin);
        registry.proposeAgentOwner(id, coOwner);
        registry.proposeAgentOwner(id, address(0));
        vm.stopPrank();
        vm.prank(coOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.NoPendingOwner.selector, id));
        registry.acceptAgentOwner(id);
    }

    /// Ví mới nhận agent khác (hoặc thành admin) sau khi được đề xuất → accept phải revert.
    function test_acceptOwner_rechecksAtAccept() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(id, coOwner);
        uint64 other = _createAgent(coOwner);
        vm.prank(coOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerAlreadyHasAgent.selector, coOwner, other));
        registry.acceptAgentOwner(id);
    }

    function test_acceptOwner_whenPausedReverts() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(id, coOwner);
        vm.prank(platformOwner);
        access.pause();
        vm.prank(coOwner);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        registry.acceptAgentOwner(id);
    }

    // ─── nâng cấp ───────────────────────────────────────────────────────

    function test_upgrade_onlyPlatformOwner() public {
        address impl = address(new AgentRegistry());
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        registry.upgradeToAndCall(impl, "");
        vm.prank(platformOwner);
        registry.upgradeToAndCall(impl, "");
    }

    function test_view_unknownAgent() public {
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotFound.selector, 1));
        registry.getAgent(1);
        assertFalse(registry.isAgentActive(1));
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotActive.selector, 1));
        registry.requireAgentWritable(1);
    }

    /// Audit sửa hồ sơ: `before` và `after_` cùng là `AgentProfileRecord` đã mã hoá.
    function test_updateAgentProfile_auditIsFullRecord() public {
        uint64 id = _createAgent(agentOwner);
        vm.prank(platformAdmin);
        registry.updateAgentProfile(id, _profile("Ten moi"));

        IHistoryIndex.Query memory q;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("X", "agent_update");
        q.sortSlot = -1;
        q.limit = 10;
        IHistoryIndex.Page memory p = historyIndex.search(0, "platform_audit", q);
        assertEq(p.total, 1);
        PlatformAuditRecord memory r = abi.decode(p.data[0], (PlatformAuditRecord));
        IAgentRegistry.AgentProfileRecord memory b = abi.decode(r.before, (IAgentRegistry.AgentProfileRecord));
        IAgentRegistry.AgentProfileRecord memory a = abi.decode(r.after_, (IAgentRegistry.AgentProfileRecord));
        assertEq(b.profile.storeName, "Cyber Q1");
        assertEq(a.profile.storeName, "Ten moi");
        assertEq(a.owner, agentOwner);
        assertEq(a.agentId, id);
    }

    function test_noMigrateAllowedServices() public {
        (bool ok,) = address(registry)
            .call(
                abi.encodeWithSignature("migrateAllowedServices(uint64[],uint16[])", new uint64[](0), new uint16[](0))
            );
        assertFalse(ok);
    }
}
