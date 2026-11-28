// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {BaseTest} from "../utils/BaseTest.sol";
import {DeployPlatform} from "../../script/DeployPlatform.s.sol";
import {DeployStaff} from "../../script/DeployStaff.s.sol";
import {Permission} from "../../src/shared/permission/Permission.sol";
import {Registry} from "../../src/kernel/registry/Registry.sol";
import {AgentRegistry} from "../../src/tenant/agent/AgentRegistry.sol";
import {BranchRegistry} from "../../src/tenant/branch/BranchRegistry.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../../src/interfaces/IBranchRegistry.sol";

/// @notice Deploy mới có sẵn Registry (danh mục quyền nền tảng) + Permission + Duty; DeployStaff nối đúng trên hệ đã có.
contract DeployStaffTest is BaseTest {
    function setUp() public override {
        super.setUp();
        installMockFullDB();
    }

    function _agentBranch(DeployPlatform.Deployed memory d) internal returns (uint64 b) {
        vm.startPrank(platformAdmin);
        uint64 agentId = AgentRegistry(d.agentsProxy)
            .createAgent(
                agentOwner,
                3,
                IAgentRegistry.AgentProfile({storeName: "Q1", storeAddress: "", note: "", storePhone: ""})
            );
        b = BranchRegistry(d.branchesProxy)
            .createBranch(
                agentId,
                IBranchRegistry.BranchInit({
                domain: "q1.vn",
                services: 1,
                tzOffsetMinutes: 420,
                profile: IBranchRegistry.BranchProfile("Q1", "", "", "", "")
            })
            );
        vm.stopPrank();
    }

    function test_deployPlatform_wiresPermissionAndDuty() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        assertEq(Permission(d.permissionProxy).duty(), d.dutyProxy);
        assertEq(Registry(d.registryProxy).getModule(0).permValid, 0x7FF);
        uint64 b = _agentBranch(d);
        assertTrue(Permission(d.permissionProxy).can(b, agentOwner, 0, 8)); // chủ agent: hoàn tiền
        assertFalse(Permission(d.permissionProxy).can(b, stranger, 0, 0));
    }

    function test_deployStaff_onExistingPlatform() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        (address pp,, address dp,) =
            new DeployStaff().deploy(platformOwner, d.accessProxy, d.branchesProxy, d.agentAccessProxy);
        assertEq(Permission(pp).duty(), dp);
        uint64 b = _agentBranch(d);
        assertTrue(Permission(pp).can(b, agentOwner, 0, 0));
    }
}
