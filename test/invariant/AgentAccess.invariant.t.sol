// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {PlatformFixture} from "../utils/PlatformFixture.sol";
import {AgentAccess} from "../../src/core/access/AgentAccess.sol";
import {IAgentAccess} from "../../src/interfaces/IAgentAccess.sol";

/// @notice Gọi ngẫu nhiên grant/revoke/renounce trên 2 chi nhánh, 5 ví, người gọi là chủ agent hoặc một ví bất kỳ.
contract AgentAccessHandler is Test {
    AgentAccess internal acl;
    address internal owner;
    address[5] internal accounts;
    uint64[2] internal branchIds;

    constructor(AgentAccess acl_, address owner_, uint64 b1, uint64 b2) {
        acl = acl_;
        owner = owner_;
        branchIds = [b1, b2];
        for (uint256 i; i < 5; ++i) {
            accounts[i] = address(uint160(0xA000 + i));
        }
    }

    function _caller(uint256 seed) internal view returns (address) {
        return seed % 3 == 0 ? owner : accounts[seed % 5];
    }

    function grant(uint256 c, uint256 b, uint256 a, bool manager) external {
        vm.prank(_caller(c));
        try acl.grantRole(
            branchIds[b % 2], accounts[a % 5], manager ? IAgentAccess.Role.Manager : IAgentAccess.Role.Staff
        ) {}
            catch {}
    }

    function revoke(uint256 c, uint256 b, uint256 a) external {
        vm.prank(_caller(c));
        try acl.revokeRole(branchIds[b % 2], accounts[a % 5]) {} catch {}
    }

    function renounce(uint256 b, uint256 a) external {
        vm.prank(accounts[a % 5]);
        try acl.renounceRole(branchIds[b % 2]) {} catch {}
    }

    function account(uint256 i) external view returns (address) {
        return accounts[i];
    }

    function branch(uint256 i) external view returns (uint64) {
        return branchIds[i];
    }
}

contract AgentAccessInvariantTest is PlatformFixture {
    AgentAccessHandler internal handler;

    function setUp() public override {
        super.setUp();
        uint64 agentId = _createAgent(agentOwner);
        uint64 b1 = _createBranch(agentId, "a.vn", NET);
        uint64 b2 = _createBranch(agentId, "b.vn", NET);
        handler = new AgentAccessHandler(agentAccess, agentOwner, b1, b2);
        targetContract(address(handler));
    }

    /// @dev Danh sách thành viên chi nhánh và danh sách chi nhánh của ví luôn khớp mapping vai trò.
    function invariant_listsMatchRoles() public view {
        for (uint256 bi; bi < 2; ++bi) {
            uint64 b = handler.branch(bi);
            uint256 members;
            for (uint256 ai; ai < 5; ++ai) {
                address a = handler.account(ai);
                IAgentAccess.Member memory m = agentAccess.getMember(b, a);
                if (m.role == IAgentAccess.Role.None) {
                    assertEq(m.indexPlusOne, 0);
                    continue;
                }
                ++members;
                assertTrue(m.role == IAgentAccess.Role.Staff || m.role == IAgentAccess.Role.Manager);
                assertEq(agentAccess.membersOf(b, m.indexPlusOne - 1, 1)[0].account, a);
            }
            assertEq(agentAccess.memberCountOf(b), members);
        }
        for (uint256 ai; ai < 5; ++ai) {
            address a = handler.account(ai);
            uint64[] memory mine = agentAccess.branchesOfAccount(a, 0, 100);
            uint256 expected;
            for (uint256 bi; bi < 2; ++bi) {
                if (agentAccess.roleOf(handler.branch(bi), a) != IAgentAccess.Role.None) ++expected;
            }
            assertEq(mine.length, expected);
            for (uint256 k; k < mine.length; ++k) {
                assertTrue(agentAccess.roleOf(mine[k], a) != IAgentAccess.Role.None);
            }
        }
    }

    /// @dev Chủ agent không bao giờ nằm trong danh sách thành viên.
    function invariant_ownerNeverStored() public view {
        for (uint256 bi; bi < 2; ++bi) {
            assertEq(uint8(agentAccess.roleOf(handler.branch(bi), agentOwner)), 0);
        }
    }
}
