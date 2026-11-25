// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {PlatformFixture} from "../utils/PlatformFixture.sol";
import {AgentUserRegistry} from "../../src/core/user/AgentUserRegistry.sol";
import {IAgentUserRegistry} from "../../src/interfaces/IAgentUserRegistry.sol";
import {IAgentAccess} from "../../src/interfaces/IAgentAccess.sol";

/// @notice Staff đăng ký / đặt lại mật khẩu / chặn ngẫu nhiên trên tập 6 địa chỉ và 4 username.
contract AgentUserHandler is Test {
    AgentUserRegistry internal users;
    address internal staff;
    address internal manager;
    uint64 internal agentId;
    uint64 internal branchId;
    address[6] internal addrs;
    string[4] internal names = ["teo", "ti", "bo.sua", "na_na"];

    constructor(AgentUserRegistry users_, address staff_, address manager_, uint64 agentId_, uint64 branchId_) {
        users = users_;
        staff = staff_;
        manager = manager_;
        agentId = agentId_;
        branchId = branchId_;
        for (uint256 i; i < 6; ++i) {
            addrs[i] = address(uint160(0xC000 + i));
        }
    }

    function register(uint256 a, uint256 n) external {
        vm.prank(staff);
        try users.registerByStaff(
            agentId,
            branchId,
            addrs[a % 6],
            names[n % 4],
            IAgentUserRegistry.UserProfile({displayName: "x", fullName: "", phone: "", birthday: "", note: ""})
        ) {}
            catch {}
    }

    function reset(uint256 a, uint256 l) external {
        vm.prank(staff);
        try users.resetPassword(agentId, branchId, addrs[a % 6], addrs[l % 6]) {} catch {}
    }

    function block_(uint256 a, bool b) external {
        vm.prank(manager);
        try users.setBlocked(agentId, branchId, addrs[a % 6], b, "r") {} catch {}
    }

    function addr(uint256 i) external view returns (address) {
        return addrs[i];
    }

    function name(uint256 i) external view returns (string memory) {
        return names[i];
    }
}

contract AgentUserRegistryInvariantTest is PlatformFixture {
    AgentUserHandler internal handler;
    uint64 internal agentId;

    function setUp() public override {
        super.setUp();
        agentId = _createAgent(agentOwner);
        uint64 b1 = _createBranch(agentId, "a.vn", NET);
        vm.startPrank(agentOwner);
        agentAccess.grantRole(b1, staff, IAgentAccess.Role.Staff);
        agentAccess.grantRole(b1, branchManager, IAgentAccess.Role.Manager);
        vm.stopPrank();
        handler = new AgentUserHandler(users, staff, branchManager, agentId, b1);
        targetContract(address(handler));
    }

    /// @dev Username ↔ account 1-1; mỗi tài khoản có đúng một địa chỉ đăng nhập trỏ ngược về nó;
    ///      số tài khoản = số phần tử danh sách.
    function invariant_usernameAndLoginConsistent() public view {
        uint256 count = users.userCount(agentId);
        IAgentUserRegistry.UserView[] memory all = users.usersOf(agentId, 0, 100);
        assertEq(all.length, count);
        for (uint256 i; i < all.length; ++i) {
            assertEq(users.accountOf(agentId, all[i].username), all[i].account, "username tro dung account");
            assertEq(users.accountOfLogin(agentId, all[i].loginAddress), all[i].account, "login tro dung account");
        }
        uint256 named;
        for (uint256 n; n < 4; ++n) {
            address holder = users.accountOf(agentId, handler.name(n));
            if (holder != address(0)) {
                ++named;
                assertEq(keccak256(bytes(users.getUser(agentId, holder).username)), keccak256(bytes(handler.name(n))));
            }
        }
        assertEq(named, count, "moi username mot tai khoan");
        // Không địa chỉ đăng nhập nào trỏ về tài khoản mà tài khoản đó không dùng địa chỉ ấy.
        for (uint256 a; a < 6; ++a) {
            address acc = users.accountOfLogin(agentId, handler.addr(a));
            if (acc != address(0)) assertEq(users.getUser(agentId, acc).loginAddress, handler.addr(a));
        }
    }
}
