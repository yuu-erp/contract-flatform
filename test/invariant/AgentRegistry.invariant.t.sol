// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {PlatformFixture} from "../utils/PlatformFixture.sol";
import {AgentRegistry} from "../../src/tenant/agent/AgentRegistry.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";

/// @notice Gọi ngẫu nhiên mọi hàm ghi của AgentRegistry bằng ví admin, với một tập ví chủ nhỏ để hay va nhau.
contract AgentHandler is Test {
    AgentRegistry internal registry;
    address internal admin;
    address[] public wallets;
    mapping(uint64 => bool) public everDeleted;
    uint64 public created;

    constructor(AgentRegistry registry_, address admin_) {
        registry = registry_;
        admin = admin_;
        for (uint256 i; i < 6; ++i) {
            wallets.push(address(uint160(0xA000 + i)));
        }
    }

    function walletCount() external view returns (uint256) {
        return wallets.length;
    }

    function _wallet(uint256 seed) internal view returns (address) {
        return wallets[seed % wallets.length];
    }

    function _agent(uint256 seed) internal view returns (uint64) {
        uint64 n = registry.agentCount();
        return n == 0 ? 1 : uint64(seed % n) + 1;
    }

    function create(uint256 w) external {
        vm.prank(admin);
        try registry.createAgent(_wallet(w), 7, IAgentRegistry.AgentProfile("Shop", "", "", "")) {
            ++created;
        } catch {}
    }

    function suspend(uint256 a) external {
        vm.prank(admin);
        try registry.suspendAgent(_agent(a), "r") {} catch {}
    }

    function resume(uint256 a) external {
        uint64 id = _agent(a);
        vm.prank(admin);
        try registry.resumeAgent(id, "r") {} catch {}
    }

    function remove(uint256 a) external {
        uint64 id = _agent(a);
        vm.prank(admin);
        try registry.deleteAgent(id, "r") {
            everDeleted[id] = true;
        } catch {}
    }

    function propose(uint256 a, uint256 w) external {
        vm.prank(admin);
        try registry.proposeAgentOwner(_agent(a), _wallet(w)) {} catch {}
    }

    function accept(uint256 a, uint256 w) external {
        vm.prank(_wallet(w));
        try registry.acceptAgentOwner(_agent(a)) {} catch {}
    }
}

contract AgentRegistryInvariantTest is PlatformFixture {
    AgentHandler internal handler;

    function setUp() public override {
        super.setUp();
        handler = new AgentHandler(registry, platformAdmin);
        targetContract(address(handler));
    }

    /// Mỗi ví đang trỏ tới agent thì agent đó đúng là của ví và chưa bị xoá; một ví một agent.
    function invariant_ownerIndexConsistent() public view {
        for (uint256 i; i < handler.walletCount(); ++i) {
            address w = handler.wallets(i);
            uint64 id = registry.agentIdOf(w);
            if (id == 0) continue;
            IAgentRegistry.Agent memory a = registry.getAgent(id);
            assertEq(a.owner, w);
            assertTrue(a.status != IAgentRegistry.AgentStatus.Deleted);
        }
    }

    /// Mọi agent chưa xoá đều được chỉ mục ngược bởi ví chủ; agent đã xoá thì không còn pending owner.
    function invariant_everyLiveAgentIndexed() public view {
        uint64 n = registry.agentCount();
        for (uint64 id = 1; id <= n; ++id) {
            IAgentRegistry.Agent memory a = registry.getAgent(id);
            assertEq(a.id, id);
            if (a.status == IAgentRegistry.AgentStatus.Deleted) {
                assertEq(a.pendingOwner, address(0));
            } else {
                assertEq(registry.agentIdOf(a.owner), id);
            }
        }
    }

    /// Xoá là trạng thái cuối.
    function invariant_deletedIsFinal() public view {
        uint64 n = registry.agentCount();
        for (uint64 id = 1; id <= n; ++id) {
            if (handler.everDeleted(id)) {
                assertEq(uint8(registry.getAgent(id).status), uint8(IAgentRegistry.AgentStatus.Deleted));
            }
        }
    }

    /// Không ví nền tảng nào làm chủ agent.
    function invariant_noPlatformRoleOwnsAgent() public view {
        assertEq(registry.agentIdOf(platformOwner), 0);
        assertEq(registry.agentIdOf(platformAdmin), 0);
        assertEq(registry.agentIdOf(platformAdmin2), 0);
    }

    function invariant_countMatchesCreates() public view {
        assertEq(registry.agentCount(), handler.created());
    }
}
