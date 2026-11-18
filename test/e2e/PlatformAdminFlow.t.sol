// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../utils/PlatformFixture.sol";
import {PlatformAuditRecord} from "../../src/interfaces/IPlatformAudit.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../../src/interfaces/IBranchRegistry.sol";
import {MockServiceModule} from "../utils/MockServiceModule.sol";
import {IHistoryIndex} from "../../src/interfaces/IHistoryIndex.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IPlatformAccess} from "../../src/interfaces/IPlatformAccess.sol";

/// @notice Kịch bản vận hành tầng quản trị từ đầu đến cuối.
contract PlatformAdminFlowTest is PlatformFixture {
    function test_e2e_adminLifecycle() public {
        // 1. Admin tạo hai agent
        uint64 a1 = _createAgent(agentOwner);
        vm.prank(platformAdmin2);
        uint64 a2 = registry.createAgent(customer, _profile("Cyber Thu Duc"));
        assertEq(registry.agentCount(), 2);

        // 2. Owner gỡ một admin → admin đó mất quyền ngay
        vm.prank(platformOwner);
        access.removePlatformAdmin(platformAdmin2);
        vm.prank(platformAdmin2);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, platformAdmin2));
        registry.suspendAgent(a2, "x");

        // 3. Admin gỡ xong có thể làm chủ agent (không còn là ví nền tảng)
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(a2, platformAdmin2);
        vm.prank(platformAdmin2);
        registry.acceptAgentOwner(a2);
        assertEq(registry.agentIdOf(platformAdmin2), a2);

        // 4. Dừng hệ: mọi ghi bị chặn, đọc vẫn chạy
        vm.prank(platformOwner);
        access.pause();
        vm.prank(platformAdmin);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        registry.suspendAgent(a1, "x");
        assertEq(registry.getAgentProfile(a1).profile.storeName, "Cyber Q1");
        vm.prank(platformOwner);
        access.unpause();

        // 5. Dừng, mở lại, xoá agent 1
        vm.startPrank(platformAdmin);
        registry.suspendAgent(a1, "no phi");
        registry.resumeAgent(a1, "da dong");
        registry.deleteAgent(a1, "het hop dong");
        vm.stopPrank();

        // 6. Nhật ký audit của agent 1 đủ 4 dòng, mới nhất trước
        IHistoryIndex.Query memory q;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("G", "1");
        q.sortSlot = 0;
        q.ascending = false;
        q.limit = 10;
        IHistoryIndex.Page memory p = historyIndex.search(0, "platform_audit", q);
        assertEq(p.total, 4); // create, suspend, resume, delete
        assertEq(abi.decode(p.data[0], (PlatformAuditRecord)).action, "agent_create"); // cùng timestamp → thứ tự chèn

        // 7. Đổi owner nền tảng; owner cũ mất quyền nâng cấp
        vm.prank(platformOwner);
        access.transferOwnership(stranger);
        vm.prank(stranger);
        access.acceptOwnership();
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformOwner));
        historyIndex.setWriter(platformOwner, true);
    }

    function test_gas_createAgent() public {
        vm.prank(platformAdmin);
        uint256 g = gasleft();
        registry.createAgent(agentOwner, _profile("Cyber Q1"));
        g -= gasleft();
        // MockFullDB đắt hơn precompile thật; con số chỉ để theo dõi xu hướng (gas snapshot).
        emit log_named_uint("createAgent gas (mock FullDB)", g);
    }

    /// Admin dựng agent + 2 chi nhánh, chủ agent đặt thuế, module ghi được; dừng/xoá thì chỉ còn đọc.
    function test_e2e_branchLifecycle() public {
        uint64 a = _createAgent(agentOwner);
        uint64 q1 = _createBranch(a, "q1.cyber.vn", NET | LOYALTY);
        uint64 q3 = _createBranch(a, "q3.cyber.vn", NET | IQR);
        assertEq(branches.mainBranchOf(a), q1);

        // Chủ agent: thuế mặc định IQR 8 %, riêng Q3 10 %
        vm.startPrank(agentOwner);
        branches.setAgentTax(a, IQR, 800);
        branches.setBranchTax(q3, IQR, 1000);
        vm.stopPrank();
        assertEq(branches.taxOf(q1, IQR), 800);
        assertEq(branches.taxOf(q3, IQR), 1000);

        // Module ghi ở cả hai chi nhánh
        MockServiceModule net = new MockServiceModule(branches, NET);
        net.write(q1);
        net.write(q3);

        // Đổi chi nhánh chính rồi đóng Q1 (xoá mềm), Q1 chỉ còn đọc, domain dùng lại được
        vm.startPrank(platformAdmin);
        branches.setMainBranch(q3);
        branches.deleteBranch(q1, "dong cua");
        vm.stopPrank();
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.BranchNotActive.selector, q1));
        net.write(q1);
        assertEq(net.read(q1), 1);
        uint64 q1b = _createBranch(a, "q1.cyber.vn", NET);
        assertEq(branches.branchByDomain("q1.cyber.vn"), q1b);

        // Danh sách chi nhánh của agent đọc từ FullDB
        IHistoryIndex.Query memory q;
        q.sortSlot = 0;
        q.ascending = true;
        q.limit = 10;
        assertEq(historyIndex.search(a, "platform_branches", q).total, 3);

        // Xoá agent: mọi chi nhánh chỉ đọc, chi nhánh chính xoá được để nhả domain
        vm.startPrank(platformAdmin);
        registry.deleteAgent(a, "het hop dong");
        branches.deleteBranch(q3, "nha domain");
        vm.stopPrank();
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotActive.selector, a));
        net.write(q1b);
        assertEq(branches.branchByDomain("q3.cyber.vn"), 0);
    }

    function test_gas_createBranch() public {
        uint64 a = _createAgent(agentOwner);
        IBranchRegistry.BranchInit memory init = _branchInit("q1.cyber.vn", NET | IQR | LOYALTY);
        vm.prank(platformAdmin);
        uint256 g = gasleft();
        branches.createBranch(a, init);
        g -= gasleft();
        emit log_named_uint("createBranch gas (mock FullDB)", g);
    }

    function test_gas_requireWritable() public {
        uint64 a = _createAgent(agentOwner);
        uint64 b = _createBranch(a, "q1.cyber.vn", NET);
        uint256 g = gasleft();
        branches.requireWritable(b, NET);
        g -= gasleft();
        emit log_named_uint("requireWritable gas", g);
    }
}
