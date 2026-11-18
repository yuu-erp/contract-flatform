// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {AgentAccess} from "../../../src/core/access/AgentAccess.sol";
import {IAgentAccess} from "../../../src/interfaces/IAgentAccess.sol";
import {IAgentRegistry} from "../../../src/interfaces/IAgentRegistry.sol";
import {IHistoryIndex} from "../../../src/interfaces/IHistoryIndex.sol";
import {IPlatformAccess} from "../../../src/interfaces/IPlatformAccess.sol";
import {PlatformAuditRecord} from "../../../src/interfaces/IPlatformAudit.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract AgentAccessTest is PlatformFixture {
    uint64 internal agentId;
    uint64 internal b1;
    uint64 internal b2;
    address internal staff2;
    address internal manager2;

    IAgentAccess.Role internal constant NONE = IAgentAccess.Role.None;
    IAgentAccess.Role internal constant STAFF = IAgentAccess.Role.Staff;
    IAgentAccess.Role internal constant MANAGER = IAgentAccess.Role.Manager;
    IAgentAccess.Role internal constant OWNER = IAgentAccess.Role.Owner;

    function setUp() public override {
        super.setUp();
        agentId = _createAgent(agentOwner);
        b1 = _createBranch(agentId, "a.vn", NET);
        b2 = _createBranch(agentId, "b.vn", NET | IQR);
        staff2 = makeAddr("staff2");
        manager2 = makeAddr("manager2");
    }

    function _grant(address by, uint64 branchId, address account, IAgentAccess.Role role) internal {
        vm.prank(by);
        agentAccess.grantRole(branchId, account, role);
    }

    // ─── khởi tạo ───────────────────────────────────────────────────────

    function test_initialize_wiring() public view {
        assertEq(agentAccess.agentRegistry(), address(registry));
        assertEq(agentAccess.branchRegistry(), address(branches));
        assertEq(address(agentAccess.platformAccess()), address(access));
    }

    function test_initialize_onlyOnce() public {
        vm.expectRevert(Initializable.InvalidInitialization.selector);
        agentAccess.initialize(address(access), address(registry), address(branches), address(historyIndex));
    }

    function test_initialize_zeroAddress() public {
        AgentAccess impl = new AgentAccess();
        vm.expectRevert(IAgentAccess.ZeroAddress.selector);
        deployProxy(
            address(impl),
            abi.encodeCall(AgentAccess.initialize, (address(access), address(0), address(branches), address(1)))
        );
    }

    // ─── luồng chính: chủ agent → quản lý → nhân viên ───────────────────

    function test_ownerGrantsManager_managerGrantsStaff() public {
        vm.expectEmit(address(agentAccess));
        emit IAgentAccess.RoleChanged(1, agentId, b1, branchManager, NONE, MANAGER, agentOwner);
        _grant(agentOwner, b1, branchManager, MANAGER);

        vm.expectEmit(address(agentAccess));
        emit IAgentAccess.RoleChanged(1, agentId, b1, staff, NONE, STAFF, branchManager);
        _grant(branchManager, b1, staff, STAFF);

        assertEq(uint8(agentAccess.roleOf(b1, branchManager)), uint8(MANAGER));
        assertEq(uint8(agentAccess.roleOf(b1, staff)), uint8(STAFF));
        assertEq(agentAccess.memberCountOf(b1), 2);
        IAgentAccess.Member memory m = agentAccess.getMember(b1, staff);
        assertEq(m.grantedBy, branchManager);
        assertEq(m.grantedAt, uint64(block.timestamp));
        assertEq(m.indexPlusOne, 2);
    }

    function test_ownerGrantsStaffDirectly() public {
        _grant(agentOwner, b2, staff, STAFF);
        assertEq(uint8(agentAccess.effectiveRoleOf(b2, staff)), uint8(STAFF));
        assertEq(agentAccess.getMember(b2, staff).grantedBy, agentOwner);
    }

    function test_ownerChangesRole_upAndDown() public {
        _grant(agentOwner, b1, staff, STAFF);
        _grant(agentOwner, b1, staff, MANAGER);
        assertEq(uint8(agentAccess.roleOf(b1, staff)), uint8(MANAGER));
        _grant(agentOwner, b1, staff, STAFF);
        assertEq(uint8(agentAccess.roleOf(b1, staff)), uint8(STAFF));
        // đổi vai trò không thêm dòng mới
        assertEq(agentAccess.memberCountOf(b1), 1);
        assertEq(agentAccess.branchCountOfAccount(staff), 1);
    }

    function test_sameAccountInTwoBranches() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        _grant(agentOwner, b2, branchManager, STAFF);
        assertEq(agentAccess.branchCountOfAccount(branchManager), 2);
        uint64[] memory list = agentAccess.branchesOfAccount(branchManager, 0, 10);
        assertEq(list.length, 2);
        assertEq(list[0], b1);
        assertEq(list[1], b2);
        // quản lý ở b1 không có quyền quản lý ở b2
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, branchManager, b2));
        agentAccess.grantRole(b2, staff, STAFF);
    }

    // ─── chặn quyền khi cấp ─────────────────────────────────────────────

    function test_grant_managerCannotGrantManager() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, branchManager, b1));
        agentAccess.grantRole(b1, manager2, MANAGER);
    }

    function test_grant_managerCannotPromoteStaff() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        _grant(branchManager, b1, staff, STAFF);
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, branchManager, b1));
        agentAccess.grantRole(b1, staff, MANAGER);
    }

    function test_grant_managerCannotDemoteManager() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        _grant(agentOwner, b1, manager2, MANAGER);
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, branchManager, b1));
        agentAccess.grantRole(b1, manager2, STAFF);
    }

    function test_grant_staffCannotGrant() public {
        _grant(agentOwner, b1, staff, STAFF);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, staff, b1));
        agentAccess.grantRole(b1, staff2, STAFF);
    }

    function test_grant_strangerAndPlatformRolesCannotGrant() public {
        address[3] memory callers = [stranger, platformAdmin, platformOwner];
        for (uint256 i; i < callers.length; ++i) {
            vm.prank(callers[i]);
            vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, callers[i], b1));
            agentAccess.grantRole(b1, staff, STAFF);
        }
    }

    function test_grant_otherAgentOwnerCannotGrant() public {
        address owner2 = makeAddr("owner2");
        _createAgent(owner2);
        vm.prank(owner2);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, owner2, b1));
        agentAccess.grantRole(b1, staff, STAFF);
    }

    function test_grant_invalidRole() public {
        vm.startPrank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.InvalidRole.selector, NONE));
        agentAccess.grantRole(b1, staff, NONE);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.InvalidRole.selector, OWNER));
        agentAccess.grantRole(b1, staff, OWNER);
        vm.stopPrank();
    }

    function test_grant_invalidAccounts() public {
        vm.startPrank(agentOwner);
        vm.expectRevert(IAgentAccess.ZeroAddress.selector);
        agentAccess.grantRole(b1, address(0), STAFF);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.AccountIsAgentOwner.selector, agentOwner, agentId));
        agentAccess.grantRole(b1, agentOwner, MANAGER);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.AccountIsPlatformRole.selector, platformAdmin));
        agentAccess.grantRole(b1, platformAdmin, STAFF);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.AccountIsPlatformRole.selector, platformOwner));
        agentAccess.grantRole(b1, platformOwner, STAFF);
        vm.stopPrank();
    }

    function test_grant_roleUnchanged() public {
        _grant(agentOwner, b1, staff, STAFF);
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.RoleUnchanged.selector, b1, staff, STAFF));
        agentAccess.grantRole(b1, staff, STAFF);
    }

    function test_grant_unknownBranch() public {
        vm.prank(agentOwner);
        vm.expectRevert();
        agentAccess.grantRole(99, staff, STAFF);
    }

    function test_grant_branchSuspended() public {
        vm.prank(platformAdmin);
        branches.suspendBranch(b1, "x");
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.BranchNotActive.selector, b1));
        agentAccess.grantRole(b1, staff, STAFF);
    }

    function test_grant_agentSuspended() public {
        vm.prank(platformAdmin);
        registry.suspendAgent(agentId, "x");
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotActive.selector, agentId));
        agentAccess.grantRole(b1, staff, STAFF);
    }

    function test_grant_whenPaused() public {
        vm.prank(platformOwner);
        access.pause();
        vm.prank(agentOwner);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        agentAccess.grantRole(b1, staff, STAFF);
    }

    // ─── thu hồi ────────────────────────────────────────────────────────

    function test_revoke_ownerRevokesManager() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        vm.expectEmit(address(agentAccess));
        emit IAgentAccess.RoleChanged(1, agentId, b1, branchManager, MANAGER, NONE, agentOwner);
        vm.prank(agentOwner);
        agentAccess.revokeRole(b1, branchManager);
        assertEq(uint8(agentAccess.roleOf(b1, branchManager)), uint8(NONE));
        assertEq(agentAccess.memberCountOf(b1), 0);
        assertEq(agentAccess.branchCountOfAccount(branchManager), 0);
    }

    function test_revoke_managerRevokesStaff() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        _grant(agentOwner, b1, staff, STAFF); // staff do chủ cấp, quản lý vẫn thu được
        vm.prank(branchManager);
        agentAccess.revokeRole(b1, staff);
        assertEq(uint8(agentAccess.roleOf(b1, staff)), uint8(NONE));
    }

    function test_revoke_managerCannotRevokeManager() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        _grant(agentOwner, b1, manager2, MANAGER);
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, branchManager, b1));
        agentAccess.revokeRole(b1, manager2);
    }

    function test_revoke_managerCannotRevokeOtherBranch() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        _grant(agentOwner, b2, staff, STAFF);
        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, branchManager, b2));
        agentAccess.revokeRole(b2, staff);
    }

    function test_revoke_staffCannotRevoke() public {
        _grant(agentOwner, b1, staff, STAFF);
        _grant(agentOwner, b1, staff2, STAFF);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, staff, b1));
        agentAccess.revokeRole(b1, staff2);
    }

    function test_revoke_notMember() public {
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotMember.selector, b1, staff));
        agentAccess.revokeRole(b1, staff);
    }

    function test_revoke_worksWhenBranchSuspendedOrDeleted() public {
        _grant(agentOwner, b2, branchManager, MANAGER);
        _grant(branchManager, b2, staff, STAFF);
        vm.prank(platformAdmin);
        branches.suspendBranch(b2, "x");
        vm.prank(branchManager);
        agentAccess.revokeRole(b2, staff);

        vm.prank(platformAdmin);
        branches.deleteBranch(b2, "dong cua");
        vm.prank(agentOwner);
        agentAccess.revokeRole(b2, branchManager);
        assertEq(agentAccess.memberCountOf(b2), 0);
    }

    function test_revoke_worksWhenAgentSuspended() public {
        _grant(agentOwner, b1, staff, STAFF);
        vm.prank(platformAdmin);
        registry.suspendAgent(agentId, "x");
        vm.prank(agentOwner);
        agentAccess.revokeRole(b1, staff);
        assertEq(agentAccess.memberCountOf(b1), 0);
    }

    function test_renounce() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        vm.expectEmit(address(agentAccess));
        emit IAgentAccess.RoleChanged(1, agentId, b1, branchManager, MANAGER, NONE, branchManager);
        vm.prank(branchManager);
        agentAccess.renounceRole(b1);
        assertEq(agentAccess.memberCountOf(b1), 0);

        vm.prank(branchManager);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotMember.selector, b1, branchManager));
        agentAccess.renounceRole(b1);
    }

    function test_revoke_whenPaused() public {
        _grant(agentOwner, b1, staff, STAFF);
        vm.prank(platformOwner);
        access.pause();
        vm.prank(agentOwner);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        agentAccess.revokeRole(b1, staff);
    }

    // ─── danh sách swap-pop ─────────────────────────────────────────────

    function test_swapPop_keepsIndexes() public {
        address[4] memory accs = [staff, staff2, branchManager, manager2];
        for (uint256 i; i < accs.length; ++i) {
            _grant(agentOwner, b1, accs[i], STAFF);
        }
        vm.prank(agentOwner);
        agentAccess.revokeRole(b1, staff2); // giữa danh sách

        IAgentAccess.MemberView[] memory list = agentAccess.membersOf(b1, 0, 10);
        assertEq(list.length, 3);
        assertEq(list[0].account, staff);
        assertEq(list[1].account, manager2); // phần tử cuối dời lên
        assertEq(list[2].account, branchManager);
        for (uint256 i; i < list.length; ++i) {
            assertEq(agentAccess.getMember(b1, list[i].account).indexPlusOne, i + 1);
        }

        vm.prank(agentOwner);
        agentAccess.revokeRole(b1, branchManager); // cuối danh sách
        assertEq(agentAccess.memberCountOf(b1), 2);
    }

    function test_swapPop_accountBranches() public {
        _grant(agentOwner, b1, staff, STAFF);
        _grant(agentOwner, b2, staff, STAFF);
        vm.prank(agentOwner);
        agentAccess.revokeRole(b1, staff);
        uint64[] memory list = agentAccess.branchesOfAccount(staff, 0, 10);
        assertEq(list.length, 1);
        assertEq(list[0], b2);
        // cấp lại b1 thêm vào cuối
        _grant(agentOwner, b1, staff, STAFF);
        list = agentAccess.branchesOfAccount(staff, 0, 10);
        assertEq(list[1], b1);
    }

    function test_pagination() public {
        for (uint256 i; i < 5; ++i) {
            _grant(agentOwner, b1, address(uint160(0x1000 + i)), STAFF);
        }
        assertEq(agentAccess.membersOf(b1, 0, 2).length, 2);
        assertEq(agentAccess.membersOf(b1, 4, 2).length, 1);
        assertEq(agentAccess.membersOf(b1, 5, 2).length, 0);
        assertEq(agentAccess.membersOf(b1, 99, 2).length, 0);
        assertEq(agentAccess.membersOf(b1, 3, type(uint256).max).length, 2);
        assertEq(agentAccess.branchesOfAccount(staff, 7, type(uint256).max).length, 0);
    }

    function test_cap_membersPerBranch() public {
        uint16 max = agentAccess.MAX_MEMBERS_PER_BRANCH();
        for (uint256 i; i < max; ++i) {
            _grant(agentOwner, b1, address(uint160(0x1000 + i)), STAFF);
        }
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.TooManyMembers.selector, b1));
        agentAccess.grantRole(b1, staff, STAFF);
        // đổi vai trò của thành viên có sẵn vẫn được
        _grant(agentOwner, b1, address(uint160(0x1000)), MANAGER);
    }

    function test_cap_branchesPerAccount() public {
        uint16 max = agentAccess.MAX_BRANCHES_PER_ACCOUNT();
        _grant(agentOwner, b1, staff, STAFF);
        _grant(agentOwner, b2, staff, STAFF);
        for (uint256 i = 2; i < max; ++i) {
            uint64 b = _createBranch(agentId, string.concat("x", vm.toString(i), ".vn"), NET);
            _grant(agentOwner, b, staff, STAFF);
        }
        uint64 extra = _createBranch(agentId, "extra.vn", NET);
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.TooManyBranches.selector, staff));
        agentAccess.grantRole(extra, staff, STAFF);
    }

    // ─── vai trò hiệu lực ───────────────────────────────────────────────

    function test_effectiveRole_ownerHasFullAccess() public view {
        assertEq(uint8(agentAccess.effectiveRoleOf(b1, agentOwner)), uint8(OWNER));
        assertTrue(agentAccess.hasRole(b1, agentOwner, MANAGER));
        assertTrue(agentAccess.hasRole(b2, agentOwner, STAFF));
        agentAccess.requireRole(b1, agentOwner, OWNER);
    }

    function test_effectiveRole_hierarchy() public {
        _grant(agentOwner, b1, branchManager, MANAGER);
        _grant(branchManager, b1, staff, STAFF);
        assertTrue(agentAccess.hasRole(b1, branchManager, STAFF));
        assertTrue(agentAccess.hasRole(b1, branchManager, MANAGER));
        assertFalse(agentAccess.hasRole(b1, branchManager, OWNER));
        assertTrue(agentAccess.hasRole(b1, staff, STAFF));
        assertFalse(agentAccess.hasRole(b1, staff, MANAGER));
        assertFalse(agentAccess.hasRole(b2, staff, STAFF));
        assertTrue(agentAccess.hasRole(b2, stranger, NONE));

        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.MissingRole.selector, b1, staff, MANAGER));
        agentAccess.requireRole(b1, staff, MANAGER);
    }

    function test_effectiveRole_unknownInputs() public view {
        assertEq(uint8(agentAccess.effectiveRoleOf(0, agentOwner)), uint8(NONE));
        assertEq(uint8(agentAccess.effectiveRoleOf(99, agentOwner)), uint8(NONE));
        assertEq(uint8(agentAccess.effectiveRoleOf(b1, address(0))), uint8(NONE));
    }

    function test_effectiveRole_followsAgentOwnerTransfer() public {
        address newOwner = makeAddr("newOwner");
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(agentId, newOwner);
        vm.prank(newOwner);
        registry.acceptAgentOwner(agentId);

        assertEq(uint8(agentAccess.effectiveRoleOf(b1, newOwner)), uint8(OWNER));
        assertEq(uint8(agentAccess.effectiveRoleOf(b1, agentOwner)), uint8(NONE));
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IAgentAccess.NotAuthorized.selector, agentOwner, b1));
        agentAccess.grantRole(b1, staff, STAFF);
        _grant(newOwner, b1, staff, MANAGER);
    }

    function test_effectiveRole_noneWhenBranchOrAgentDeleted() public {
        _grant(agentOwner, b2, staff, STAFF);
        vm.prank(platformAdmin);
        branches.deleteBranch(b2, "dong cua");
        assertEq(uint8(agentAccess.effectiveRoleOf(b2, staff)), uint8(NONE));
        assertEq(uint8(agentAccess.effectiveRoleOf(b2, agentOwner)), uint8(NONE));
        // vai trò đã lưu vẫn còn để thu hồi
        assertEq(uint8(agentAccess.roleOf(b2, staff)), uint8(STAFF));

        _grant(agentOwner, b1, staff, STAFF);
        vm.prank(platformAdmin);
        registry.deleteAgent(agentId, "huy");
        assertEq(uint8(agentAccess.effectiveRoleOf(b1, staff)), uint8(NONE));
        assertEq(uint8(agentAccess.effectiveRoleOf(b1, agentOwner)), uint8(NONE));
    }

    // ─── audit ──────────────────────────────────────────────────────────

    function test_audit_written() public {
        _grant(agentOwner, b1, staff, STAFF);
        vm.prank(agentOwner);
        agentAccess.revokeRole(b1, staff);

        IHistoryIndex.Query memory q;
        q.sortSlot = -1;
        q.limit = 10;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("X", "access_grant");
        IHistoryIndex.Page memory p = historyIndex.search(0, "platform_audit", q);
        assertEq(p.total, 1);
        PlatformAuditRecord memory rec = abi.decode(p.data[0], (PlatformAuditRecord));
        assertEq(rec.agentId, agentId);
        assertEq(rec.branchId, b1);
        assertEq(rec.actor, agentOwner);
        (address acc, IAgentAccess.Role role) = abi.decode(rec.after_, (address, IAgentAccess.Role));
        assertEq(acc, staff);
        assertEq(uint8(role), uint8(STAFF));

        q.filters[0] = IHistoryIndex.Term("X", "access_revoke");
        assertEq(historyIndex.search(0, "platform_audit", q).total, 1);
    }

    // ─── nâng cấp ───────────────────────────────────────────────────────

    function test_upgrade_onlyPlatformOwner() public {
        address impl = address(new AgentAccess());
        vm.prank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, agentOwner));
        agentAccess.upgradeToAndCall(impl, "");
        vm.prank(platformOwner);
        agentAccess.upgradeToAndCall(impl, "");
    }
}
