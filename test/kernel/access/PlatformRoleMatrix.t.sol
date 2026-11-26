// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {IPlatformAccess} from "../../../src/interfaces/IPlatformAccess.sol";
import {IAgentRegistry} from "../../../src/interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../../../src/interfaces/IBranchRegistry.sol";
import {AgentRegistry} from "../../../src/tenant/agent/AgentRegistry.sol";
import {BranchRegistry} from "../../../src/tenant/branch/BranchRegistry.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @notice Ma trận quyền tầng nền tảng:
///         - PLATFORM_OWNER cao nhất: làm được mọi việc của admin (agent, chi nhánh, pause) + việc riêng của owner.
///         - PLATFORM_ADMIN: vận hành (agent, chi nhánh, pause/unpause), KHÔNG nâng cấp contract, KHÔNG cấu hình hệ
///           (đổi owner, thêm/bớt admin, nguồn vai trò, writer HistoryIndex, poster Ledger, nối AgentAccess).
contract PlatformRoleMatrixTest is PlatformFixture {
    // ─── Owner làm trọn vòng đời agent + chi nhánh ──────────────────────

    function test_owner_fullAgentAndBranchLifecycle() public {
        vm.startPrank(platformOwner);
        uint64 agentId = registry.createAgent(agentOwner, NET | IQR, _profile("Cyber Owner"));
        registry.updateAgentProfile(agentId, _profile("Cyber Owner 2"));
        registry.setAgentServices(agentId, NET | IQR | LOYALTY);

        uint64 b1 = branches.createBranch(agentId, _branchInit("owner-a.vn", NET));
        uint64 b2 = branches.createBranch(agentId, _branchInit("owner-b.vn", NET | IQR));
        branches.updateBranchProfile(b1, _branchProfile("CN 1"));
        branches.setBranchDomain(b1, "owner-a2.vn");
        branches.setBranchServices(b1, NET | IQR);
        branches.setBranchTimezone(b1, 480);
        branches.setMainBranch(b2);
        branches.suspendBranch(b1, "sua may");
        branches.resumeBranch(b1, "xong");
        branches.deleteBranch(b1, "dong cua");

        registry.suspendAgent(agentId, "tam dung");
        registry.resumeAgent(agentId, "mo lai");
        registry.proposeAgentOwner(agentId, customer);
        registry.deleteAgent(agentId, "ket thuc");

        access.pause();
        access.unpause();
        vm.stopPrank();

        assertEq(uint8(registry.getAgent(agentId).status), uint8(IAgentRegistry.AgentStatus.Deleted));
        assertEq(uint8(branches.getBranch(b1).status), uint8(IBranchRegistry.BranchStatus.Deleted));
    }

    // ─── Admin vận hành được ────────────────────────────────────────────

    function test_admin_operations() public {
        vm.startPrank(platformAdmin);
        uint64 agentId = registry.createAgent(agentOwner, NET, _profile("Cyber Admin"));
        branches.createBranch(agentId, _branchInit("admin-a.vn", NET)); // chi nhánh chính
        uint64 b2 = branches.createBranch(agentId, _branchInit("admin-b.vn", NET));
        branches.deleteBranch(b2, "dong cua");
        registry.deleteAgent(agentId, "ket thuc");
        access.pause();
        access.unpause();
        vm.stopPrank();
        assertFalse(access.paused());
    }

    // ─── Admin bị chặn ở việc chỉ owner ─────────────────────────────────

    function test_admin_cannotUpgradeAnyContract() public {
        address regImpl = address(new AgentRegistry());
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        registry.upgradeToAndCall(regImpl, "");

        address brImpl = address(new BranchRegistry());
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        branches.upgradeToAndCall(brImpl, "");

        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        access.upgradeToAndCall(address(0xBEEF), "");
    }

    function test_admin_cannotConfigureSystem() public {
        vm.startPrank(platformAdmin);

        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        access.transferOwnership(platformAdmin);

        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        access.addPlatformAdmin(stranger);

        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        access.removePlatformAdmin(platformAdmin2);

        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        access.setAgentRoleSources(new address[](0));

        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        historyIndex.setWriter(stranger, true);

        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        historyIndex.setWriterKind(stranger, "ledger", true);

        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        ledger.setPoster(stranger, 0x02);

        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        registry.setAgentAccess(stranger);

        vm.stopPrank();
    }

    // ─── Ví ngoài không làm gì được ─────────────────────────────────────

    function test_stranger_blocked() public {
        vm.startPrank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, stranger));
        registry.createAgent(agentOwner, NET, _profile("x"));
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformAdmin.selector, stranger));
        access.pause();
        vm.stopPrank();
    }

    // ─── Owner vẫn không được làm chủ agent (tách vai giữ nguyên) ───────

    function test_owner_cannotOwnAgent() public {
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerIsPlatformRole.selector, platformOwner));
        registry.createAgent(platformOwner, NET, _profile("x"));
    }
}
