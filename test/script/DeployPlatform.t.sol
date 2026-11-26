// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {BaseTest} from "../utils/BaseTest.sol";
import {DeployPlatform} from "../../script/DeployPlatform.s.sol";
import {SetPlatformAdmin} from "../../script/SetPlatformAdmin.s.sol";
import {DeployAgentAccess} from "../../script/DeployAgentAccess.s.sol";
import {DeployAgentUsers} from "../../script/DeployAgentUsers.s.sol";
import {AgentUserRegistry} from "../../src/core/user/AgentUserRegistry.sol";
import {IAgentUserRegistry} from "../../src/interfaces/IAgentUserRegistry.sol";
import {AgentAccess} from "../../src/core/access/AgentAccess.sol";
import {SalesSettings} from "../../src/core/payment/SalesSettings.sol";
import {Ledger} from "../../src/core/ledger/Ledger.sol";
import {IAgentAccess} from "../../src/interfaces/IAgentAccess.sol";
import {IBranchRegistry} from "../../src/interfaces/IBranchRegistry.sol";
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
        assertTrue(history.isWriter(d.agentAccessProxy));
        // Mỗi writer chỉ được các kind của nó
        assertTrue(history.canWrite(d.agentsProxy, "platform_agents"));
        assertTrue(history.canWrite(d.agentsProxy, "platform_audit"));
        assertFalse(history.canWrite(d.agentsProxy, "platform_branches"));
        assertTrue(history.canWrite(d.branchesProxy, "platform_branches"));
        assertTrue(history.canWrite(d.branchesProxy, "platform_audit"));
        assertFalse(history.canWrite(d.branchesProxy, "platform_agents"));
        assertTrue(history.canWrite(d.agentAccessProxy, "platform_audit"));
        assertFalse(history.canWrite(d.agentAccessProxy, "platform_agents"));
        assertFalse(history.canWrite(d.agentAccessProxy, "platform_branches"));
        assertTrue(history.isWriter(d.salesSettingsProxy));
        assertTrue(history.canWrite(d.salesSettingsProxy, "platform_audit"));
        assertFalse(history.canWrite(d.salesSettingsProxy, "platform_agents"));
        assertTrue(history.isWriter(d.ledgerProxy));
        assertTrue(history.canWrite(d.ledgerProxy, "ledger"));
        assertFalse(history.canWrite(d.ledgerProxy, "platform_audit"));
        assertEq(Ledger(d.ledgerProxy).KIND_LEDGER(), "ledger");
        assertTrue(history.canWrite(d.usersProxy, "users"));
        assertTrue(history.canWrite(d.usersProxy, "platform_audit"));
        assertFalse(history.canWrite(d.usersProxy, "ledger"));
        // Nối AgentAccess và nguồn vai trò agent
        assertEq(agents.agentAccess(), d.agentAccessProxy);
        address[] memory sources = access.agentRoleSources();
        assertEq(sources.length, 2);
        assertEq(sources[0], d.agentsProxy);
        assertEq(sources[1], d.agentAccessProxy);
        assertEq(AgentAccess(d.agentAccessProxy).branchRegistry(), d.branchesProxy);
        assertTrue(access.isPlatformAdmin(platformAdmin));
        assertEq(access.platformAdminCount(), 1);
        assertEq(branches.agentRegistry(), d.agentsProxy);
        assertEq(d.admin, platformAdmin);

        vm.prank(platformAdmin);
        uint64 id = agents.createAgent(
            agentOwner,
            7,
            IAgentRegistry.AgentProfile({
                storeName: "Cyber Q1", storeAddress: "1 Le Loi, Q1", note: "", storePhone: "+84 28 1234 5678"
            })
        );
        assertEq(id, 1);
        assertEq(agents.getAgentProfile(1).profile.storePhone, "+84 28 1234 5678");
        vm.prank(platformAdmin);
        uint64 b = branches.createBranch(
            id,
            IBranchRegistry.BranchInit({
                domain: "q1.cyber.vn",
                services: 1,
                tzOffsetMinutes: 420,
                profile: IBranchRegistry.BranchProfile({name: "Q1", location: "", longlat: "", phone: "", note: ""})
            })
        );
        assertEq(SalesSettings(d.salesSettingsProxy).paymentMethodsOf(b), 9);
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

    function test_deployAgentAccess_onExistingPlatform() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        (address proxy,) =
            new DeployAgentAccess().deploy(platformOwner, d.accessProxy, d.agentsProxy, d.branchesProxy, d.historyProxy);
        AgentAccess acl = AgentAccess(proxy);
        assertTrue(HistoryIndex(d.historyProxy).isWriter(proxy));
        assertTrue(HistoryIndex(d.historyProxy).canWrite(proxy, "platform_audit"));
        assertFalse(HistoryIndex(d.historyProxy).canWrite(proxy, "platform_agents"));
        assertEq(AgentRegistry(d.agentsProxy).agentAccess(), proxy);
        assertEq(PlatformAccess(d.accessProxy).agentRoleSources()[1], proxy);
        assertEq(acl.agentRegistry(), d.agentsProxy);

        // luồng đầy đủ: admin tạo agent + chi nhánh, chủ agent cấp quản lý, quản lý cấp nhân viên
        vm.startPrank(platformAdmin);
        uint64 agentId = AgentRegistry(d.agentsProxy)
            .createAgent(
                agentOwner,
                7,
                IAgentRegistry.AgentProfile({storeName: "Cyber Q1", storeAddress: "", note: "", storePhone: ""})
            );
        uint64 b = BranchRegistry(d.branchesProxy)
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
        vm.prank(agentOwner);
        acl.grantRole(b, branchManager, IAgentAccess.Role.Manager);
        vm.prank(branchManager);
        acl.grantRole(b, staff, IAgentAccess.Role.Staff);
        assertTrue(acl.hasRole(b, staff, IAgentAccess.Role.Staff));
    }

    function test_deployAgentAccess_strangerCannotSetWriter() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, address(0), address(0));
        DeployAgentAccess s = new DeployAgentAccess();
        vm.expectRevert();
        s.deploy(stranger, d.accessProxy, d.agentsProxy, d.branchesProxy, d.historyProxy);
    }

    function test_deployAgentUsers_onExistingPlatform() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        (address proxy,) = new DeployAgentUsers()
            .deploy(platformOwner, d.accessProxy, d.agentsProxy, d.branchesProxy, d.agentAccessProxy, d.historyProxy);
        assertTrue(HistoryIndex(d.historyProxy).canWrite(proxy, "users"));
        assertTrue(HistoryIndex(d.historyProxy).canWrite(proxy, "platform_audit"));

        vm.startPrank(platformAdmin);
        uint64 agentId = AgentRegistry(d.agentsProxy)
            .createAgent(
                agentOwner,
                1,
                IAgentRegistry.AgentProfile({storeName: "Cyber Q1", storeAddress: "", note: "", storePhone: ""})
            );
        uint64 b = BranchRegistry(d.branchesProxy)
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
        vm.prank(agentOwner);
        AgentUserRegistry(proxy)
            .registerByStaff(
                agentId,
                b,
                customer,
                "teo",
                IAgentUserRegistry.UserProfile({displayName: "Teo", fullName: "", phone: "", birthday: "", note: ""})
            );
        assertEq(AgentUserRegistry(proxy).accountOf(agentId, "teo"), customer);
    }

    function test_deployAgentUsers_strangerCannotSetWriter() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, address(0), address(0));
        DeployAgentUsers s = new DeployAgentUsers();
        vm.expectRevert();
        s.deploy(stranger, d.accessProxy, d.agentsProxy, d.branchesProxy, d.agentAccessProxy, d.historyProxy);
    }
}
