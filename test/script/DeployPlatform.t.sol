// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {BaseTest} from "../utils/BaseTest.sol";
import {DeployPlatform} from "../../script/DeployPlatform.s.sol";
import {SetPlatformAdmin} from "../../script/SetPlatformAdmin.s.sol";
import {PlatformAccess} from "../../src/core/access/PlatformAccess.sol";
import {HistoryIndex} from "../../src/core/history/HistoryIndex.sol";
import {AgentRegistry} from "../../src/core/tenant/AgentRegistry.sol";
import {BranchRegistry} from "../../src/core/tenant/BranchRegistry.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract DeployPlatformTest is BaseTest {
    function setUp() public override {
        super.setUp();
        installMockFullDB();
    }

    function test_deploy_ownerWritersAdminAndCreateAgent() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));

        PlatformAccess access = PlatformAccess(d.accessProxy);
        HistoryIndex history = HistoryIndex(d.historyProxy);
        AgentRegistry agents = AgentRegistry(d.agentsProxy);
        BranchRegistry branches = BranchRegistry(d.branchesProxy);

        assertEq(access.owner(), platformOwner);
        assertEq(history.fullDB(), FULLDB_PRECOMPILE);
        assertTrue(history.isWriter(d.agentsProxy));
        assertTrue(history.isWriter(d.branchesProxy));
        assertTrue(access.isPlatformAdmin(platformAdmin));
        assertEq(access.platformAdminCount(), 1);
        assertEq(branches.agentRegistry(), d.agentsProxy);
        assertEq(d.admin, platformAdmin);

        vm.prank(platformAdmin);
        uint64 id = agents.createAgent(
            agentOwner,
            IAgentRegistry.AgentProfile({
                storeName: "Cyber Q1", storeAddress: "1 Le Loi, Q1", note: "", storePhone: "+84 28 1234 5678"
            })
        );
        assertEq(id, 1);
        assertEq(agents.getAgentProfile(1).profile.storePhone, "+84 28 1234 5678");
    }

    function test_deploy_zeroAdminAddsNobody() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, address(0), address(0));
        PlatformAccess access = PlatformAccess(d.accessProxy);
        assertEq(access.owner(), platformOwner);
        assertEq(access.platformAdminCount(), 0);
        assertFalse(access.isPlatformAdmin(platformAdmin));
        assertEq(d.admin, address(0));
    }

    function test_setPlatformAdmin_ownerAddsThenRemoves() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, address(0), address(0));
        SetPlatformAdmin setter = new SetPlatformAdmin();
        PlatformAccess access = PlatformAccess(d.accessProxy);

        vm.prank(platformOwner);
        setter.set(d.accessProxy, platformAdmin, true);
        assertTrue(access.isPlatformAdmin(platformAdmin));

        vm.prank(platformOwner);
        setter.set(d.accessProxy, platformAdmin, false);
        assertFalse(access.isPlatformAdmin(platformAdmin));
        assertEq(access.platformAdminCount(), 0);
    }

    function test_setPlatformAdmin_strangerReverts() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, address(0), address(0));
        SetPlatformAdmin setter = new SetPlatformAdmin();

        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        setter.set(d.accessProxy, platformAdmin, true);
    }
}
