// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {MockServiceModule} from "../../utils/MockServiceModule.sol";
import {BranchRegistry} from "../../../src/core/tenant/BranchRegistry.sol";
import {IBranchRegistry} from "../../../src/interfaces/IBranchRegistry.sol";
import {IAgentRegistry} from "../../../src/interfaces/IAgentRegistry.sol";
import {IHistoryIndex} from "../../../src/interfaces/IHistoryIndex.sol";
import {IPlatformAccess} from "../../../src/interfaces/IPlatformAccess.sol";
import {PlatformAuditRecord} from "../../../src/interfaces/IPlatformAudit.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract BranchRegistryTest is PlatformFixture {
    uint64 internal agentId;

    function setUp() public override {
        super.setUp();
        agentId = _createAgent(agentOwner);
    }

    function _status(uint64 id) internal view returns (IBranchRegistry.BranchStatus) {
        return branches.getBranch(id).status;
    }

    // ─── tạo ────────────────────────────────────────────────────────────

    function test_createBranch_firstIsMain() public {
        vm.prank(platformAdmin);
        vm.expectEmit(address(branches));
        emit IBranchRegistry.BranchCreated(1, agentId, 1, NET | LOYALTY, keccak256("q1.cyber.vn"), true);
        uint64 b1 = branches.createBranch(agentId, _branchInit("q1.cyber.vn", NET | LOYALTY));
        uint64 b2 = _createBranch(agentId, "q3.cyber.vn", IQR);

        IBranchRegistry.Branch memory br = branches.getBranch(b1);
        assertEq(br.agentId, agentId);
        assertTrue(br.isMain);
        assertEq(br.services, NET | LOYALTY);
        assertEq(br.tzOffsetMinutes, 420);
        assertEq(br.domainHash, keccak256("q1.cyber.vn"));
        assertFalse(branches.getBranch(b2).isMain);

        assertEq(branches.mainBranchOf(agentId), b1);
        assertEq(branches.branchCountOf(agentId), 2);
        assertEq(branches.branchCount(), 2);
        assertEq(branches.agentOf(b2), agentId);
        assertEq(branches.branchByDomain("q3.cyber.vn"), b2);
        assertEq(branches.branchByDomainHash(keccak256("q1.cyber.vn")), b1);

        IBranchRegistry.BranchProfileRecord memory r = branches.getBranchProfile(b1);
        assertEq(r.domain, "q1.cyber.vn");
        assertEq(r.profile.phone, "028 3822 0000");
        assertEq(r.profile.longlat, "10.7769,106.7009");
    }

    function test_createBranch_onlyAdmin() public {
        vm.prank(agentOwner); // agent không được tạo chi nhánh
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, agentOwner));
        branches.createBranch(agentId, _branchInit("a.vn", NET));
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, platformOwner));
        branches.createBranch(agentId, _branchInit("a.vn", NET));
    }

    function test_createBranch_agentMustBeActive() public {
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.AgentNotActive.selector, 9));
        branches.createBranch(9, _branchInit("a.vn", NET));

        vm.prank(platformAdmin);
        registry.suspendAgent(agentId, "x");
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.AgentNotActive.selector, agentId));
        branches.createBranch(agentId, _branchInit("a.vn", NET));
    }

    /// R1: tổ hợp dịch vụ hợp lệ.
    function testFuzz_services(uint16 s) public {
        bool valid = s != 0 && s & ~uint16(7) == 0 && !(s & LOYALTY != 0 && s & (NET | IQR) == 0);
        vm.prank(platformAdmin);
        if (!valid) vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.InvalidServices.selector, s));
        branches.createBranch(agentId, _branchInit("a.vn", s));
    }

    /// Agent chỉ được cấp NET và Loyalty thì chi nhánh không bật được IQR.
    function test_branchServices_stayInsideAgentGrant() public {
        uint64 limited = _createAgent(customer, NET | LOYALTY);
        uint64 b = _createBranch(limited, "net.vn", NET | LOYALTY);

        vm.startPrank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotAllowed.selector, limited, IQR));
        branches.createBranch(limited, _branchInit("iqr.vn", IQR));
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotAllowed.selector, limited, NET | IQR));
        branches.setBranchServices(b, NET | IQR);
        vm.stopPrank();

        assertTrue(branches.isServiceEnabled(b, NET));
        assertTrue(branches.isServiceEnabled(b, LOYALTY));
        assertFalse(branches.isServiceEnabled(b, IQR));

        MockServiceModule net = new MockServiceModule(branches, NET);
        net.write(b);
        MockServiceModule iqr = new MockServiceModule(branches, IQR);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotEnabled.selector, b, IQR));
        iqr.write(b);
    }

    /// Thu hẹp trần sau khi chi nhánh đã bật module: bit còn trên chi nhánh nhưng không ghi được nữa.
    function test_branchServices_shrinkGrantBlocksModule() public {
        uint64 b = _createBranch(agentId, "a.vn", NET | IQR);
        vm.prank(platformAdmin);
        registry.setAgentServices(agentId, NET);

        assertTrue(branches.isServiceEnabled(b, NET));
        assertFalse(branches.isServiceEnabled(b, IQR));
        MockServiceModule net = new MockServiceModule(branches, NET);
        net.write(b);
        MockServiceModule iqr = new MockServiceModule(branches, IQR);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotAllowed.selector, agentId, IQR));
        iqr.write(b);
    }

    /// R3: domain bắt buộc, chữ thường, duy nhất.
    function test_domain_rules() public {
        _createBranch(agentId, "q1.cyber.vn", NET);
        vm.startPrank(platformAdmin);
        vm.expectRevert(
            abi.encodeWithSelector(IBranchRegistry.DomainTaken.selector, keccak256("q1.cyber.vn"), uint64(1))
        );
        branches.createBranch(agentId, _branchInit("q1.cyber.vn", NET));
        string[5] memory bad = ["", "ab", "Q1.cyber.vn", "-a.vn", "a_b.vn"];
        for (uint256 i; i < bad.length; ++i) {
            vm.expectRevert(IBranchRegistry.InvalidDomain.selector);
            branches.createBranch(agentId, _branchInit(bad[i], NET));
        }
        vm.stopPrank();
    }

    function test_createBranch_validatesProfileAndTz() public {
        IBranchRegistry.BranchInit memory init = _branchInit("a.vn", NET);
        vm.startPrank(platformAdmin);
        init.tzOffsetMinutes = 841;
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.InvalidTimezone.selector, int16(841)));
        branches.createBranch(agentId, init);
        init.tzOffsetMinutes = 0;
        init.profile.name = "";
        vm.expectRevert(IBranchRegistry.InvalidBranchName.selector);
        branches.createBranch(agentId, init);
        init.profile.name = "x";
        init.profile.phone = "abc";
        vm.expectRevert(IBranchRegistry.InvalidPhone.selector);
        branches.createBranch(agentId, init);
        init.profile.phone = "";
        init.profile.longlat = "10.7;106.7";
        vm.expectRevert(IBranchRegistry.InvalidLonglat.selector);
        branches.createBranch(agentId, init);
        vm.stopPrank();
    }

    function test_createBranch_whenPaused() public {
        vm.prank(platformOwner);
        access.pause();
        vm.prank(platformAdmin);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        branches.createBranch(agentId, _branchInit("a.vn", NET));
    }

    function test_createBranch_writesToAgentDb() public {
        uint64 b = _createBranch(agentId, "a.vn", NET);
        IHistoryIndex.Query memory q;
        q.sortSlot = -1;
        q.limit = 10;
        IHistoryIndex.Page memory p = historyIndex.search(agentId, "platform_branches", q);
        assertEq(p.total, 1);
        assertEq(abi.decode(p.data[0], (IBranchRegistry.BranchProfileRecord)).branchId, b);
        // audit có nhãn chi nhánh
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("B", "1");
        p = historyIndex.search(0, "platform_audit", q);
        assertEq(p.total, 1);
        assertEq(abi.decode(p.data[0], (PlatformAuditRecord)).action, "branch_create");
    }

    // ─── sửa ────────────────────────────────────────────────────────────

    function test_updateBranchProfile_keepsDomain() public {
        uint64 b = _createBranch(agentId, "a.vn", NET);
        vm.prank(platformAdmin);
        branches.updateBranchProfile(b, _branchProfile("Ten moi"));
        IBranchRegistry.BranchProfileRecord memory r = branches.getBranchProfile(b);
        assertEq(r.profile.name, "Ten moi");
        assertEq(r.domain, "a.vn");
    }

    function test_setBranchDomain() public {
        uint64 b = _createBranch(agentId, "a.vn", NET);
        vm.prank(platformAdmin);
        branches.setBranchDomain(b, "b.vn");
        assertEq(branches.branchByDomain("a.vn"), 0, "nha domain cu");
        assertEq(branches.branchByDomain("b.vn"), b);
        assertEq(branches.getBranchProfile(b).domain, "b.vn");
        // domain cũ dùng lại được
        uint64 b2 = _createBranch(agentId, "a.vn", NET);
        assertEq(branches.branchByDomain("a.vn"), b2);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.DomainTaken.selector, keccak256("a.vn"), b2));
        branches.setBranchDomain(b, "a.vn");
    }

    function test_setBranchServices_andTimezone() public {
        uint64 b = _createBranch(agentId, "a.vn", NET);
        vm.startPrank(platformAdmin);
        branches.setBranchServices(b, IQR | LOYALTY);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.InvalidServices.selector, LOYALTY));
        branches.setBranchServices(b, LOYALTY);
        branches.setBranchTimezone(b, -300);
        vm.stopPrank();
        assertEq(branches.getBranch(b).services, IQR | LOYALTY);
        assertEq(branches.getBranch(b).tzOffsetMinutes, -300);
        assertTrue(branches.isServiceEnabled(b, IQR));
        assertFalse(branches.isServiceEnabled(b, NET));
        assertFalse(branches.isServiceEnabled(b, IQR | LOYALTY), "chi hoi tung dich vu");
    }

    function test_setMainBranch() public {
        uint64 b1 = _createBranch(agentId, "a.vn", NET);
        uint64 b2 = _createBranch(agentId, "b.vn", NET);
        vm.startPrank(platformAdmin);
        branches.setMainBranch(b2);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.AlreadyMainBranch.selector, b2));
        branches.setMainBranch(b2);
        branches.suspendBranch(b1, "x");
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.BranchNotActive.selector, b1));
        branches.setMainBranch(b1);
        vm.stopPrank();
        assertEq(branches.mainBranchOf(agentId), b2);
        assertFalse(branches.getBranch(b1).isMain);
        assertTrue(branches.getBranch(b2).isMain);
    }

    // ─── trạng thái ─────────────────────────────────────────────────────

    function test_suspendResume() public {
        uint64 b = _createBranch(agentId, "a.vn", NET);
        vm.startPrank(platformAdmin);
        branches.suspendBranch(b, "sua may");
        assertEq(uint8(_status(b)), uint8(IBranchRegistry.BranchStatus.Suspended));
        vm.expectRevert(
            abi.encodeWithSelector(
                IBranchRegistry.InvalidStatusTransition.selector,
                IBranchRegistry.BranchStatus.Suspended,
                IBranchRegistry.BranchStatus.Suspended
            )
        );
        branches.suspendBranch(b, "x");
        vm.expectRevert(IBranchRegistry.EmptyReason.selector);
        branches.resumeBranch(b, "");
        branches.resumeBranch(b, "xong");
        vm.stopPrank();
        assertEq(uint8(_status(b)), uint8(IBranchRegistry.BranchStatus.Active));
    }

    function test_deleteBranch_softAndReleasesDomain() public {
        _createBranch(agentId, "main.vn", NET);
        uint64 b = _createBranch(agentId, "a.vn", NET);
        vm.prank(platformAdmin);
        branches.deleteBranch(b, "dong cua");
        IBranchRegistry.Branch memory br = branches.getBranch(b);
        assertEq(uint8(br.status), uint8(IBranchRegistry.BranchStatus.Deleted));
        assertEq(br.domainHash, bytes32(0));
        assertEq(branches.branchByDomain("a.vn"), 0);
        assertEq(branches.getBranchProfile(b).domain, "a.vn", "du lieu con doc duoc");

        vm.startPrank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.BranchDeleted.selector, b));
        branches.resumeBranch(b, "x");
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.BranchDeleted.selector, b));
        branches.updateBranchProfile(b, _branchProfile("x"));
        vm.expectRevert(
            abi.encodeWithSelector(
                IBranchRegistry.InvalidStatusTransition.selector,
                IBranchRegistry.BranchStatus.Deleted,
                IBranchRegistry.BranchStatus.Deleted
            )
        );
        branches.deleteBranch(b, "x");
        vm.stopPrank();
    }

    function test_deleteMainBranch_onlyAfterAgentDeleted() public {
        uint64 main = _createBranch(agentId, "main.vn", NET);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.CannotDeleteMainBranch.selector, main));
        branches.deleteBranch(main, "x");

        vm.startPrank(platformAdmin);
        registry.deleteAgent(agentId, "het hop dong");
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.AgentDeleted.selector, agentId));
        branches.updateBranchProfile(main, _branchProfile("x"));
        branches.deleteBranch(main, "nha domain");
        vm.stopPrank();
        assertEq(branches.mainBranchOf(agentId), 0);
        assertEq(branches.branchByDomain("main.vn"), 0);
    }

    // ─── R5: chỉ đọc khi dừng ───────────────────────────────────────────

    function test_requireWritable_R5() public {
        uint64 b = _createBranch(agentId, "a.vn", NET | LOYALTY);
        MockServiceModule net = new MockServiceModule(branches, NET);
        MockServiceModule iqr = new MockServiceModule(branches, IQR);

        net.write(b);
        assertEq(net.read(b), 1);

        // dịch vụ không bật
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotEnabled.selector, b, IQR));
        iqr.write(b);

        // chi nhánh dừng
        vm.prank(platformAdmin);
        branches.suspendBranch(b, "x");
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.BranchNotActive.selector, b));
        net.write(b);
        assertEq(net.read(b), 1, "view van chay");
        vm.prank(platformAdmin);
        branches.resumeBranch(b, "x");

        // agent dừng
        vm.prank(platformAdmin);
        registry.suspendAgent(agentId, "x");
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotActive.selector, agentId));
        net.write(b);
        vm.prank(platformAdmin);
        registry.resumeAgent(agentId, "x");

        // hệ pause
        vm.prank(platformOwner);
        access.pause();
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        net.write(b);
        vm.prank(platformOwner);
        access.unpause();

        // tắt dịch vụ: dữ liệu còn, chỉ đọc (R8)
        vm.prank(platformAdmin);
        branches.setBranchServices(b, IQR);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotEnabled.selector, b, NET));
        net.write(b);
        assertEq(net.read(b), 1);
        iqr.write(b);
    }

    function test_requireWritable_rejectsMultiServiceQuery() public {
        uint64 b = _createBranch(agentId, "a.vn", NET | IQR);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotEnabled.selector, b, NET | IQR));
        branches.requireWritable(b, NET | IQR);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.BranchNotActive.selector, 99));
        branches.requireWritable(99, NET);
    }

    // ─── thuế (mục 6.2) ─────────────────────────────────────────────────

    function test_tax_fourCases() public {
        uint64 b = _createBranch(agentId, "a.vn", NET | IQR);
        vm.startPrank(agentOwner);
        // 1. chỉ mặc định
        branches.setAgentTax(agentId, IQR, 800);
        assertEq(branches.taxOf(b, IQR), 800);
        // 2. có mức riêng
        branches.setBranchTax(b, IQR, 1000);
        assertEq(branches.taxOf(b, IQR), 1000);
        // 3. mức riêng 0 %
        branches.setBranchTax(b, IQR, 0);
        assertEq(branches.taxOf(b, IQR), 0);
        (bool isSet, uint16 bps) = branches.branchTaxOf(b, IQR);
        assertTrue(isSet);
        assertEq(bps, 0);
        // 4. xoá mức riêng → về mặc định
        branches.clearBranchTax(b, IQR);
        assertEq(branches.taxOf(b, IQR), 800);
        vm.stopPrank();
        // dịch vụ khác độc lập
        assertEq(branches.taxOf(b, NET), 0);
    }

    function test_tax_onlyAgentOwner() public {
        uint64 b = _createBranch(agentId, "a.vn", NET);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.NotAgentOwner.selector, platformAdmin, agentId));
        branches.setAgentTax(agentId, NET, 100);
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.NotAgentOwner.selector, platformOwner, agentId));
        branches.setBranchTax(b, NET, 100);
        // chủ agent khác
        uint64 other = _createAgent(customer);
        vm.prank(customer);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.NotAgentOwner.selector, customer, agentId));
        branches.setBranchTax(b, NET, 100);
        assertTrue(other != agentId);
    }

    function test_tax_rules() public {
        uint64 b = _createBranch(agentId, "a.vn", NET);
        vm.startPrank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.TaxTooHigh.selector, uint16(10_001)));
        branches.setAgentTax(agentId, NET, 10_001);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.InvalidService.selector, LOYALTY));
        branches.setAgentTax(agentId, LOYALTY, 100);
        branches.setAgentTax(agentId, NET, 10_000);
        vm.stopPrank();

        // agent hoặc chi nhánh dừng → không đổi thuế (R5)
        vm.prank(platformAdmin);
        branches.suspendBranch(b, "x");
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.BranchNotActive.selector, b));
        branches.setBranchTax(b, NET, 1);
        vm.prank(platformAdmin);
        registry.suspendAgent(agentId, "x");
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotActive.selector, agentId));
        branches.setAgentTax(agentId, NET, 1);
    }

    function test_tax_emits() public {
        uint64 b = _createBranch(agentId, "a.vn", NET);
        vm.startPrank(agentOwner);
        branches.setAgentTax(agentId, NET, 500);
        vm.expectEmit(address(branches));
        emit IBranchRegistry.TaxChanged(1, agentId, b, NET, 500, 700, true, agentOwner);
        branches.setBranchTax(b, NET, 700);
        vm.expectEmit(address(branches));
        emit IBranchRegistry.TaxChanged(1, agentId, b, NET, 700, 500, false, agentOwner);
        branches.clearBranchTax(b, NET);
        vm.stopPrank();
    }

    function test_tax_followsOwnerChange() public {
        _createBranch(agentId, "a.vn", NET);
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(agentId, coOwner);
        vm.prank(coOwner);
        registry.acceptAgentOwner(agentId);
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.NotAgentOwner.selector, agentOwner, agentId));
        branches.setAgentTax(agentId, NET, 1);
        vm.prank(coOwner);
        branches.setAgentTax(agentId, NET, 1);
    }

    // ─── nâng cấp, view ─────────────────────────────────────────────────

    function test_upgrade_onlyPlatformOwner() public {
        address impl = address(new BranchRegistry());
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        branches.upgradeToAndCall(impl, "");
        vm.prank(platformOwner);
        branches.upgradeToAndCall(impl, "");
    }

    function test_view_unknownBranch() public {
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.BranchNotFound.selector, 1));
        branches.getBranch(1);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.BranchNotFound.selector, 1));
        branches.taxOf(1, NET);
        assertFalse(branches.isServiceEnabled(1, NET));
    }

    // ─── review 2026-11-19 ──────────────────────────────────────────────

    function _lastAudit(string memory action) internal view returns (PlatformAuditRecord memory) {
        IHistoryIndex.Query memory q;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("X", action);
        q.sortSlot = -1;
        q.limit = 100;
        IHistoryIndex.Page memory p = historyIndex.search(0, "platform_audit", q);
        return abi.decode(p.data[p.data.length - 1], (PlatformAuditRecord));
    }

    /// isServiceEnabled là view cấu hình: `false` khi chi nhánh hoặc agent đã xoá; Suspended vẫn `true`.
    function test_isServiceEnabled_falseWhenDeleted() public {
        uint64 main = _createBranch(agentId, "main.vn", NET);
        uint64 b = _createBranch(agentId, "b.vn", NET | IQR);

        vm.prank(platformAdmin);
        branches.suspendBranch(b, "sua");
        assertTrue(branches.isServiceEnabled(b, NET), "Suspended van la cau hinh bat");
        vm.prank(platformAdmin);
        branches.deleteBranch(b, "dong");
        assertFalse(branches.isServiceEnabled(b, NET));

        assertTrue(branches.isServiceEnabled(main, NET));
        vm.prank(platformAdmin);
        registry.suspendAgent(agentId, "no");
        assertTrue(branches.isServiceEnabled(main, NET), "agent Suspended van la cau hinh bat");
        vm.prank(platformAdmin);
        registry.deleteAgent(agentId, "dong");
        assertFalse(branches.isServiceEnabled(main, NET));
    }

    function test_setBranchServices_unchangedIsNoop() public {
        uint64 b = _createBranch(agentId, "b.vn", NET | IQR);
        uint64 updatedAt = branches.getBranch(b).updatedAt;
        vm.warp(block.timestamp + 100);
        vm.recordLogs();
        vm.prank(platformAdmin);
        branches.setBranchServices(b, NET | IQR);
        assertEq(vm.getRecordedLogs().length, 0, "khong event, khong audit");
        assertEq(branches.getBranch(b).updatedAt, updatedAt);
    }

    /// Audit thuế chi nhánh ghi `(service, isSet, bps)` với bps thật, không phải giá trị cộng 1 nội bộ.
    function test_tax_branchAuditEncoding() public {
        uint64 b = _createBranch(agentId, "b.vn", NET | IQR);
        vm.startPrank(agentOwner);
        branches.setBranchTax(b, IQR, 1000);
        PlatformAuditRecord memory r = _lastAudit("branch_tax");
        (uint16 s0, bool set0, uint16 bps0) = abi.decode(r.before, (uint16, bool, uint16));
        (uint16 s1, bool set1, uint16 bps1) = abi.decode(r.after_, (uint16, bool, uint16));
        assertEq(s0, IQR);
        assertFalse(set0);
        assertEq(bps0, 0);
        assertEq(s1, IQR);
        assertTrue(set1);
        assertEq(bps1, 1000);

        branches.clearBranchTax(b, IQR);
        vm.stopPrank();
        r = _lastAudit("branch_tax");
        (, set0, bps0) = abi.decode(r.before, (uint16, bool, uint16));
        (, set1, bps1) = abi.decode(r.after_, (uint16, bool, uint16));
        assertTrue(set0);
        assertEq(bps0, 1000);
        assertFalse(set1);
        assertEq(bps1, 0);
    }

    /// Audit sửa hồ sơ: `before` và `after_` cùng là `BranchProfileRecord` đã mã hoá.
    function test_updateBranchProfile_auditIsFullRecord() public {
        uint64 b = _createBranch(agentId, "b.vn", NET);
        vm.prank(platformAdmin);
        branches.updateBranchProfile(b, _branchProfile("Ten moi"));
        PlatformAuditRecord memory r = _lastAudit("branch_update");
        IBranchRegistry.BranchProfileRecord memory before_ = abi.decode(r.before, (IBranchRegistry.BranchProfileRecord));
        IBranchRegistry.BranchProfileRecord memory after_ = abi.decode(r.after_, (IBranchRegistry.BranchProfileRecord));
        assertEq(before_.profile.name, "Chi nhanh");
        assertEq(after_.profile.name, "Ten moi");
        assertEq(after_.domain, "b.vn");
        assertEq(after_.branchId, b);
    }
}
