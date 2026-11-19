// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {BaseTest} from "../utils/BaseTest.sol";
import {DeployPlatform} from "../../script/DeployPlatform.s.sol";
import {UpgradeProxy} from "../../script/UpgradeProxy.s.sol";
import {AgentRegistry} from "../../src/core/tenant/AgentRegistry.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";
import {IPlatformAccess} from "../../src/interfaces/IPlatformAccess.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract UpgradeProxyTest is BaseTest {
    DeployPlatform.Deployed internal d;
    UpgradeProxy internal up;

    function setUp() public override {
        super.setUp();
        installMockFullDB();
        d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        up = new UpgradeProxy();
    }

    /// @dev Slot implementation ERC-1967.
    function _impl(address proxy) internal view returns (address) {
        return
            address(uint160(uint256(vm.load(proxy, bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)))));
    }

    function test_keyOf() public view {
        assertEq(up.keyOf("PlatformAccess"), "access");
        assertEq(up.keyOf("HistoryIndex"), "history");
        assertEq(up.keyOf("AgentRegistry"), "agents");
        assertEq(up.keyOf("BranchRegistry"), "branches");
        assertEq(up.keyOf("AgentAccess"), "agentAccess");
        assertEq(up.keyOf("SalesSettings"), "salesSettings");
    }

    function test_keyOf_rejectsUnknown() public {
        vm.expectRevert(bytes("CONTRACT khong hop le: Ledger"));
        up.keyOf("Ledger");
    }

    /// Nâng mọi proxy: implementation đổi, dữ liệu giữ nguyên.
    function test_upgradeAll_keepsState() public {
        vm.prank(platformAdmin);
        uint64 id = AgentRegistry(d.agentsProxy)
            .createAgent(
                agentOwner,
                1,
                IAgentRegistry.AgentProfile({storeName: "Cyber Q1", storeAddress: "", note: "", storePhone: ""})
            );

        string[6] memory names =
            ["PlatformAccess", "HistoryIndex", "AgentRegistry", "BranchRegistry", "AgentAccess", "SalesSettings"];
        address[6] memory proxies =
            [d.accessProxy, d.historyProxy, d.agentsProxy, d.branchesProxy, d.agentAccessProxy, d.salesSettingsProxy];
        for (uint256 i; i < 6; ++i) {
            address before = _impl(proxies[i]);
            address impl = up.upgrade(platformOwner, names[i], proxies[i], "");
            assertEq(_impl(proxies[i]), impl, names[i]);
            assertTrue(impl != before, names[i]);
        }

        assertEq(AgentRegistry(d.agentsProxy).getAgent(id).owner, agentOwner);
        assertEq(AgentRegistry(d.agentsProxy).getAgentProfile(id).profile.storeName, "Cyber Q1");
        assertEq(IPlatformAccess(d.accessProxy).owner(), platformOwner);
        assertTrue(IPlatformAccess(d.accessProxy).isPlatformAdmin(platformAdmin));
    }

    function test_upgrade_onlyPlatformOwner() public {
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        up.upgrade(platformAdmin, "AgentRegistry", d.agentsProxy, "");

        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        up.upgrade(platformAdmin, "PlatformAccess", d.accessProxy, "");
    }
}
