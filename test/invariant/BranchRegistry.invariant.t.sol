// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {PlatformFixture} from "../utils/PlatformFixture.sol";
import {BranchRegistry} from "../../src/tenant/branch/BranchRegistry.sol";
import {AgentRegistry} from "../../src/tenant/agent/AgentRegistry.sol";
import {IBranchRegistry} from "../../src/interfaces/IBranchRegistry.sol";

/// @notice Gọi ngẫu nhiên các hàm admin của BranchRegistry trên 2 agent, 4 domain để hay va nhau.
contract BranchHandler is Test {
    BranchRegistry internal branches;
    AgentRegistry internal agents;
    address internal admin;
    string[4] internal domains = ["a.vn", "b.vn", "c.vn", "d.vn"];

    constructor(BranchRegistry b, AgentRegistry a, address admin_) {
        branches = b;
        agents = a;
        admin = admin_;
    }

    function _branch(uint256 seed) internal view returns (uint64) {
        uint64 n = branches.branchCount();
        return n == 0 ? 1 : uint64(seed % n) + 1;
    }

    function create(uint256 agentSeed, uint256 d) external {
        IBranchRegistry.BranchInit memory init = IBranchRegistry.BranchInit({
            domain: domains[d % 4],
            services: 1,
            tzOffsetMinutes: 420,
            profile: IBranchRegistry.BranchProfile("B", "", "", "", "")
        });
        vm.prank(admin);
        try branches.createBranch(uint64(agentSeed % 2) + 1, init) {} catch {}
    }

    function setDomain(uint256 b, uint256 d) external {
        vm.prank(admin);
        try branches.setBranchDomain(_branch(b), domains[d % 4]) {} catch {}
    }

    function suspend(uint256 b) external {
        vm.prank(admin);
        try branches.suspendBranch(_branch(b), "r") {} catch {}
    }

    function resume(uint256 b) external {
        vm.prank(admin);
        try branches.resumeBranch(_branch(b), "r") {} catch {}
    }

    function remove(uint256 b) external {
        vm.prank(admin);
        try branches.deleteBranch(_branch(b), "r") {} catch {}
    }

    function setMain(uint256 b) external {
        vm.prank(admin);
        try branches.setMainBranch(_branch(b)) {} catch {}
    }

    function deleteAgent(uint256 a) external {
        vm.prank(admin);
        try agents.deleteAgent(uint64(a % 2) + 1, "r") {} catch {}
    }
}

contract BranchRegistryInvariantTest is PlatformFixture {
    BranchHandler internal handler;
    string[4] internal domains = ["a.vn", "b.vn", "c.vn", "d.vn"];

    function setUp() public override {
        super.setUp();
        _createAgent(agentOwner);
        _createAgent(customer);
        handler = new BranchHandler(branches, registry, platformAdmin);
        targetContract(address(handler));
    }

    /// Mỗi domain trỏ tới đúng một chi nhánh chưa xoá đang giữ domain đó.
    function invariant_domainIndexConsistent() public view {
        for (uint256 i; i < 4; ++i) {
            bytes32 h = keccak256(bytes(domains[i]));
            uint64 id = branches.branchByDomainHash(h);
            if (id == 0) continue;
            IBranchRegistry.Branch memory br = branches.getBranch(id);
            assertEq(br.domainHash, h);
            assertTrue(br.status != IBranchRegistry.BranchStatus.Deleted);
        }
    }

    /// Chi nhánh chưa xoá luôn có domain và được chỉ mục ngược; chi nhánh đã xoá không giữ domain.
    function invariant_everyLiveBranchIndexed() public view {
        uint64 n = branches.branchCount();
        for (uint64 id = 1; id <= n; ++id) {
            IBranchRegistry.Branch memory br = branches.getBranch(id);
            if (br.status == IBranchRegistry.BranchStatus.Deleted) {
                assertEq(br.domainHash, bytes32(0));
                assertFalse(br.isMain);
            } else {
                assertEq(branches.branchByDomainHash(br.domainHash), id);
            }
        }
    }

    /// Mỗi agent tối đa một chi nhánh chính, và `mainBranchOf` khớp cờ `isMain`.
    function invariant_singleMainBranch() public view {
        uint64 n = branches.branchCount();
        for (uint64 a = 1; a <= 2; ++a) {
            uint256 mains;
            for (uint64 id = 1; id <= n; ++id) {
                IBranchRegistry.Branch memory br = branches.getBranch(id);
                if (br.agentId == a && br.isMain) {
                    ++mains;
                    assertEq(branches.mainBranchOf(a), id);
                }
            }
            assertLe(mains, 1);
            if (mains == 0) assertEq(branches.mainBranchOf(a), 0);
        }
    }

    /// Handler thật sự tạo được chi nhánh (try/catch không che lỗi cấu hình).
    function test_handlerCanCreate() public {
        handler.create(0, 0);
        handler.create(1, 1);
        assertEq(branches.branchCount(), 2);
        assertEq(branches.mainBranchOf(1), 1);
        assertEq(branches.mainBranchOf(2), 2);
    }

    function invariant_countsAddUp() public view {
        assertEq(uint256(branches.branchCountOf(1)) + branches.branchCountOf(2), branches.branchCount());
    }
}
