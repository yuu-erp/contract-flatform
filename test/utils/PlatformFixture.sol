// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {BaseTest} from "./BaseTest.sol";
import {MockFullDB} from "./MockFullDB.sol";
import {PlatformAccess} from "../../src/core/access/PlatformAccess.sol";
import {HistoryIndex} from "../../src/core/history/HistoryIndex.sol";
import {AgentRegistry} from "../../src/core/tenant/AgentRegistry.sol";
import {BranchRegistry} from "../../src/core/tenant/BranchRegistry.sol";
import {AgentAccess} from "../../src/core/access/AgentAccess.sol";
import {IBranchRegistry} from "../../src/interfaces/IBranchRegistry.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";

/// @notice Dựng tầng quản trị như khi deploy thật: PlatformAccess → HistoryIndex → AgentRegistry → BranchRegistry,
///         → AgentAccess; owner đăng ký ba contract làm writer và thêm hai admin.
abstract contract PlatformFixture is BaseTest {
    MockFullDB internal fulldb;
    PlatformAccess internal access;
    HistoryIndex internal historyIndex;
    AgentRegistry internal registry;
    BranchRegistry internal branches;
    AgentAccess internal agentAccess;

    uint16 internal constant NET = 1;
    uint16 internal constant IQR = 2;
    uint16 internal constant LOYALTY = 4;

    function setUp() public virtual override {
        super.setUp();
        fulldb = installMockFullDB();

        access = PlatformAccess(
            deployProxy(address(new PlatformAccess()), abi.encodeCall(PlatformAccess.initialize, (platformOwner)))
        );
        historyIndex = HistoryIndex(
            deployProxy(
                address(new HistoryIndex()), abi.encodeCall(HistoryIndex.initialize, (address(access), address(0)))
            )
        );
        registry = AgentRegistry(
            deployProxy(
                address(new AgentRegistry()),
                abi.encodeCall(AgentRegistry.initialize, (address(access), address(historyIndex)))
            )
        );

        branches = BranchRegistry(
            deployProxy(
                address(new BranchRegistry()),
                abi.encodeCall(BranchRegistry.initialize, (address(access), address(registry), address(historyIndex)))
            )
        );

        agentAccess = AgentAccess(
            deployProxy(
                address(new AgentAccess()),
                abi.encodeCall(
                    AgentAccess.initialize,
                    (address(access), address(registry), address(branches), address(historyIndex))
                )
            )
        );

        vm.startPrank(platformOwner);
        historyIndex.setWriter(address(registry), true);
        historyIndex.setWriter(address(branches), true);
        historyIndex.setWriter(address(agentAccess), true);
        access.addPlatformAdmin(platformAdmin);
        access.addPlatformAdmin(platformAdmin2);
        vm.stopPrank();
    }

    function _profile(string memory name) internal pure returns (IAgentRegistry.AgentProfile memory) {
        return IAgentRegistry.AgentProfile({
            storeName: name, storeAddress: "1 Le Loi, Q1", note: "", storePhone: "+84 28 1234 5678"
        });
    }

    function _createAgent(address owner) internal returns (uint64 id) {
        vm.prank(platformAdmin);
        id = registry.createAgent(owner, _profile("Cyber Q1"));
    }

    function _branchProfile(string memory name) internal pure returns (IBranchRegistry.BranchProfile memory) {
        return IBranchRegistry.BranchProfile({
            name: name, location: "12 Nguyen Hue, Q1", phone: "028 3822 0000", longlat: "10.7769,106.7009", note: ""
        });
    }

    function _branchInit(string memory domain, uint16 services)
        internal
        pure
        returns (IBranchRegistry.BranchInit memory)
    {
        return IBranchRegistry.BranchInit({
            domain: domain, services: services, tzOffsetMinutes: 420, profile: _branchProfile("Chi nhanh")
        });
    }

    function _createBranch(uint64 agentId, string memory domain, uint16 services) internal returns (uint64 id) {
        vm.prank(platformAdmin);
        id = branches.createBranch(agentId, _branchInit(domain, services));
    }
}
