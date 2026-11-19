// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {BaseTest} from "../utils/BaseTest.sol";
import {DeployPlatform} from "../../script/DeployPlatform.s.sol";
import {UpgradeAllowedServices} from "../../script/UpgradeAllowedServices.s.sol";
import {AgentRegistry} from "../../src/core/tenant/AgentRegistry.sol";
import {BranchRegistry} from "../../src/core/tenant/BranchRegistry.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../../src/interfaces/IBranchRegistry.sol";
import {IPlatformAccess} from "../../src/interfaces/IPlatformAccess.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ServiceMask} from "../../src/libraries/ServiceMask.sol";

/// @notice Nâng cấp điền trần module. Slot `allowedServices` bị xoá để giả agent tạo trước khi có trường này.
contract UpgradeAllowedServicesTest is BaseTest {
    // storage-layouts/AgentRegistryLayout.json: `agents` ở slot 1 của namespace (history và agentCount chung slot 0).
    // `allowedServices` là trường thứ 5 của struct Agent, tức +4 so với slot gốc của phần tử mapping.
    bytes32 internal constant AGENTS_SLOT = 0xedf803923c55a0f16904cf3e37d276888338928655d01abb49352257aa4c9f00;

    uint16 internal constant NET = 1;
    uint16 internal constant IQR = 2;
    uint16 internal constant LOYALTY = 4;

    function setUp() public override {
        super.setUp();
        installMockFullDB();
    }

    function test_upgrade_maskFromBranches_thenRequireWritable() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        AgentRegistry agents = AgentRegistry(d.agentsProxy);
        BranchRegistry branches = BranchRegistry(d.branchesProxy);

        uint64 withBranches = _agent(agents, agentOwner, NET | IQR | LOYALTY);
        uint64 bare = _agent(agents, customer, NET | IQR | LOYALTY);
        uint64 kept = _agent(agents, coOwner, NET | LOYALTY);
        uint64 branchAll = _branch(branches, withBranches, "chi-nhanh-chinh", NET | IQR | LOYALTY);
        uint64 branchNetLoyalty = _branch(branches, withBranches, "chi-nhanh-phu", NET | LOYALTY);
        uint64 onlyNet = _agent(agents, stranger, NET | IQR);
        uint64 liveNet = _branch(branches, onlyNet, "chi-nhanh-net", NET);
        uint64 dropped = _branch(branches, onlyNet, "chi-nhanh-iqr", IQR);
        vm.prank(platformAdmin);
        branches.deleteBranch(dropped, "bo");

        _zeroAllowed(d.agentsProxy, withBranches);
        _zeroAllowed(d.agentsProxy, bare);
        _zeroAllowed(d.agentsProxy, onlyNet);
        assertEq(agents.getAgent(withBranches).allowedServices, 0);
        assertEq(agents.getAgent(kept).allowedServices, NET | LOYALTY);

        UpgradeAllowedServices.Result memory result =
            new UpgradeAllowedServices().upgrade(platformOwner, d.agentsProxy, d.branchesProxy);

        assertEq(agents.getAgent(withBranches).allowedServices, NET | IQR | LOYALTY);
        assertEq(agents.getAgent(bare).allowedServices, NET | IQR);
        assertEq(agents.getAgent(onlyNet).allowedServices, NET);
        assertEq(agents.getAgent(kept).allowedServices, NET | LOYALTY);
        assertTrue(result.agentsImpl.code.length > 0);
        assertTrue(result.branchesImpl.code.length > 0);

        branches.requireWritable(branchAll, NET);
        branches.requireWritable(branchAll, IQR);
        branches.requireWritable(branchAll, LOYALTY);
        branches.requireWritable(branchNetLoyalty, NET);
        branches.requireWritable(branchNetLoyalty, LOYALTY);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotEnabled.selector, branchNetLoyalty, IQR));
        branches.requireWritable(branchNetLoyalty, IQR);
        branches.requireWritable(liveNet, NET);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotEnabled.selector, liveNet, IQR));
        branches.requireWritable(liveNet, IQR);
    }

    function test_upgrade_secondMigrateRevertsInvalidInitialization() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        new UpgradeAllowedServices().upgrade(platformOwner, d.agentsProxy, d.branchesProxy);

        uint64[] memory ids = new uint64[](0);
        uint16[] memory masks = new uint16[](0);
        vm.prank(stranger);
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        AgentRegistry(d.agentsProxy).migrateAllowedServices(ids, masks);
    }

    function test_upgrade_strangerReverts() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        UpgradeAllowedServices upgrader = new UpgradeAllowedServices();
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, stranger));
        upgrader.upgrade(stranger, d.agentsProxy, d.branchesProxy);
    }

    /// @dev U2: AgentRegistry trên chain 991 chưa trả `uint16`. Nâng BranchRegistry trước thì `requireWritable` không giải mã được.
    ///      Bản impl hiện tại đã trả `uint16`, nên test etch impl agent bằng bản không trả dữ liệu (đúng ABI cũ) rồi mới nâng chi nhánh.
    function test_upgrade_branchesFirst_requireWritableReverts() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        AgentRegistry agents = AgentRegistry(d.agentsProxy);
        BranchRegistry branches = BranchRegistry(d.branchesProxy);
        uint64 agentId = _agent(agents, agentOwner, NET | IQR | LOYALTY);
        uint64 branchId = _branch(branches, agentId, "chi-nhanh-chinh", NET);

        address agentImpl = address(uint160(uint256(vm.load(d.agentsProxy, _implSlot()))));
        vm.etch(agentImpl, address(new AgentRegistryNoReturn()).code);

        address branchesImpl = address(new BranchRegistry());
        vm.prank(platformOwner);
        branches.upgradeToAndCall(branchesImpl, "");

        vm.expectRevert();
        branches.requireWritable(branchId, NET);
    }

    function test_upgrade_tooManyAgents_revertsBeforeUpgrade() public {
        DeployPlatform.Deployed memory d = new DeployPlatform().deploy(platformOwner, platformAdmin, address(0));
        AgentRegistry agents = AgentRegistry(d.agentsProxy);
        bytes32 implBefore = vm.load(d.agentsProxy, _implSlot());
        for (uint256 i = 1; i <= ServiceMask.MAX_MIGRATE + 1; ++i) {
            _agent(agents, address(uint160(i + 1000)), NET);
        }
        UpgradeAllowedServices upgrader = new UpgradeAllowedServices();
        vm.expectRevert(
            abi.encodeWithSelector(UpgradeAllowedServices.TooManyAgents.selector, ServiceMask.MAX_MIGRATE + 1)
        );
        upgrader.upgrade(platformOwner, d.agentsProxy, d.branchesProxy);
        assertEq(vm.load(d.agentsProxy, _implSlot()), implBefore);
    }

    function _agent(AgentRegistry agents, address owner, uint16 mask) internal returns (uint64 id) {
        vm.prank(platformAdmin);
        id = agents.createAgent(
            owner,
            mask,
            IAgentRegistry.AgentProfile({storeName: "Cua hang", storeAddress: "", note: "", storePhone: ""})
        );
    }

    function _branch(BranchRegistry branches, uint64 agentId, string memory domain, uint16 services)
        internal
        returns (uint64 id)
    {
        vm.prank(platformAdmin);
        id = branches.createBranch(
            agentId,
            IBranchRegistry.BranchInit({
                domain: domain,
                services: services,
                tzOffsetMinutes: 420,
                profile: IBranchRegistry.BranchProfile({
                    name: "Chi nhanh", location: "", phone: "", longlat: "", note: ""
                })
            })
        );
    }

    /// @dev Trường `uint16` chiếm trọn slot, nên ghi 0 cả slot không đụng trường khác.
    function _zeroAllowed(address proxy, uint64 agentId) internal {
        bytes32 base = keccak256(abi.encode(uint256(agentId), uint256(AGENTS_SLOT) + 1));
        vm.store(proxy, bytes32(uint256(base) + 4), bytes32(0));
    }

    function _implSlot() internal pure returns (bytes32) {
        return 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    }
}

/// @dev ABI `requireAgentWritable` của AgentRegistry trước khi có giá trị trả về.
contract AgentRegistryNoReturn {
    function requireAgentWritable(uint64) external pure {}
}
