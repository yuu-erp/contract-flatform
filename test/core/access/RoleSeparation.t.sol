// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {IAgentAccess} from "../../../src/interfaces/IAgentAccess.sol";
import {IAgentRegistry} from "../../../src/interfaces/IAgentRegistry.sol";
import {IPlatformAccess} from "../../../src/interfaces/IPlatformAccess.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @notice Luật "một ví không giữ cả vai nền tảng lẫn vai agent", kiểm cả hai chiều, và luật đổi chủ agent
///         không được rơi vào thành viên của chính agent đó (vai trò cũ "sống lại" khi quyền chủ chuyển đi).
contract RoleSeparationTest is PlatformFixture {
    uint64 internal agentId;
    uint64 internal b1;
    uint64 internal b2;

    function setUp() public override {
        super.setUp();
        agentId = _createAgent(agentOwner);
        b1 = _createBranch(agentId, "a.vn", NET);
        b2 = _createBranch(agentId, "b.vn", NET);
    }

    function _grant(address by, uint64 branchId, address account, IAgentAccess.Role role) internal {
        vm.prank(by);
        agentAccess.grantRole(branchId, account, role);
    }

    // ─── Nối dây ────────────────────────────────────────────────────────

    function test_wiring() public view {
        address[] memory s = access.agentRoleSources();
        assertEq(s.length, 2);
        assertEq(s[0], address(registry));
        assertEq(s[1], address(agentAccess));
        assertEq(registry.agentAccess(), address(agentAccess));
    }

    function test_holdsAgentRole() public {
        assertTrue(registry.holdsAgentRole(agentOwner));
        assertFalse(registry.holdsAgentRole(staff));
        assertFalse(agentAccess.holdsAgentRole(staff));
        _grant(agentOwner, b1, staff, IAgentAccess.Role.Staff);
        assertTrue(agentAccess.holdsAgentRole(staff));
        vm.prank(staff);
        agentAccess.renounceRole(b1);
        assertFalse(agentAccess.holdsAgentRole(staff));

        vm.prank(platformAdmin);
        registry.deleteAgent(agentId, "dong cua");
        assertFalse(registry.holdsAgentRole(agentOwner), "agent da xoa thi nha vi chu");
    }

    function test_setAgentRoleSources_onlyOwner() public {
        address[] memory s = new address[](0);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, platformAdmin));
        access.setAgentRoleSources(s);
    }

    function test_setAgentRoleSources_validatesAndReplaces() public {
        address[] memory tooMany = new address[](5);
        vm.startPrank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.TooManyRoleSources.selector, uint256(4)));
        access.setAgentRoleSources(tooMany);

        address[] memory withZero = new address[](1);
        vm.expectRevert(IPlatformAccess.ZeroAddress.selector);
        access.setAgentRoleSources(withZero);

        address[] memory one = new address[](1);
        one[0] = address(registry);
        vm.expectEmit(address(access));
        emit IPlatformAccess.AgentRoleSourcesSet(1, one, platformOwner);
        access.setAgentRoleSources(one);
        vm.stopPrank();
        assertEq(access.agentRoleSources().length, 1);
        assertEq(access.agentRoleSources()[0], address(registry));
    }

    function test_setAgentAccess_onlyOwner_nonZero() public {
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        registry.setAgentAccess(stranger);

        vm.startPrank(platformOwner);
        vm.expectRevert(IAgentRegistry.ZeroAddress.selector);
        registry.setAgentAccess(address(0));
        vm.expectEmit(address(registry));
        emit IAgentRegistry.AgentAccessSet(1, address(agentAccess));
        registry.setAgentAccess(address(agentAccess));
        vm.stopPrank();
    }

    // ─── Chiều nền tảng → agent (mới) ───────────────────────────────────

    function test_addPlatformAdmin_rejectsAgentOwner() public {
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.AccountHasAgentRole.selector, agentOwner));
        access.addPlatformAdmin(agentOwner);
    }

    function test_addPlatformAdmin_rejectsBranchMember() public {
        _grant(agentOwner, b1, staff, IAgentAccess.Role.Staff);
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.AccountHasAgentRole.selector, staff));
        access.addPlatformAdmin(staff);

        // Rời chi nhánh rồi thì nhận được
        vm.prank(staff);
        agentAccess.renounceRole(b1);
        vm.prank(platformOwner);
        access.addPlatformAdmin(staff);
        assertTrue(access.isPlatformAdmin(staff));
    }

    /// Thành viên của chi nhánh đã xoá vẫn tính: vai trò lưu vẫn còn cho tới khi thu hồi.
    function test_addPlatformAdmin_rejectsMemberOfDeletedBranch() public {
        _grant(agentOwner, b2, staff, IAgentAccess.Role.Staff);
        vm.prank(platformAdmin);
        branches.deleteBranch(b2, "dong");
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.AccountHasAgentRole.selector, staff));
        access.addPlatformAdmin(staff);
    }

    function test_addPlatformAdmin_afterAgentDeleted() public {
        vm.prank(platformAdmin);
        registry.deleteAgent(agentId, "dong cua");
        vm.prank(platformOwner);
        access.addPlatformAdmin(agentOwner);
        assertTrue(access.isPlatformAdmin(agentOwner));
    }

    function test_transferOwnership_rejectsAgentRole() public {
        _grant(agentOwner, b1, branchManager, IAgentAccess.Role.Manager);
        vm.startPrank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.AccountHasAgentRole.selector, agentOwner));
        access.transferOwnership(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.AccountHasAgentRole.selector, branchManager));
        access.transferOwnership(branchManager);
        access.transferOwnership(address(0)); // huỷ đề xuất vẫn được
        vm.stopPrank();
    }

    /// Pending owner nền tảng không nhận được vai agent (chiều cũ, AgentRegistry kiểm `_isPlatformRole`).
    function test_pendingOwner_cannotBecomeAgentOwner() public {
        vm.prank(platformOwner);
        access.transferOwnership(coOwner);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerIsPlatformRole.selector, coOwner));
        registry.createAgent(coOwner, NET, _profile("x"));
    }

    /// Đề xuất lọt qua (nguồn chưa đủ), nguồn được bổ sung sau: lúc nhận phải kiểm lại.
    function test_acceptOwnership_rechecksWhenSourceAddedLater() public {
        // Nguồn chỉ có AgentRegistry; staff thành viên chi nhánh lọt qua bước đề xuất.
        address[] memory one = new address[](1);
        one[0] = address(registry);
        vm.prank(platformOwner);
        access.setAgentRoleSources(one);
        _grant(agentOwner, b1, staff, IAgentAccess.Role.Staff);
        vm.prank(platformOwner);
        access.transferOwnership(staff);

        // Owner bổ sung AgentAccess làm nguồn; staff nhận owner bị chặn.
        address[] memory two = new address[](2);
        two[0] = address(registry);
        two[1] = address(agentAccess);
        vm.prank(platformOwner);
        access.setAgentRoleSources(two);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.AccountHasAgentRole.selector, staff));
        access.acceptOwnership();
        assertEq(access.owner(), platformOwner);
    }

    // ─── Đổi chủ agent sang thành viên của chính agent ──────────────────

    function test_proposeAgentOwner_rejectsMemberOfSameAgent() public {
        _grant(agentOwner, b2, branchManager, IAgentAccess.Role.Manager);
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerIsAgentMember.selector, branchManager, agentId));
        registry.proposeAgentOwner(agentId, branchManager);
    }

    function test_proposeAgentOwner_allowsMemberOfOtherAgent() public {
        uint64 other = _createAgent(coOwner);
        uint64 ob = _createBranch(other, "other.vn", NET);
        _grant(coOwner, ob, staff, IAgentAccess.Role.Staff);

        vm.prank(platformAdmin);
        registry.proposeAgentOwner(agentId, staff);
        vm.prank(staff);
        registry.acceptAgentOwner(agentId);
        assertEq(registry.getAgent(agentId).owner, staff);
        // Vai trò ở agent khác vẫn giữ (A4)
        assertEq(uint8(agentAccess.roleOf(ob, staff)), uint8(IAgentAccess.Role.Staff));
    }

    /// Kịch bản lỗi gốc: X được đề xuất, sau đó được cấp Manager; nếu cho nhận chủ thì Manager bị che
    /// rồi "sống lại" khi quyền chủ chuyển đi. Nay acceptAgentOwner từ chối cho tới khi X rời chi nhánh.
    function test_acceptAgentOwner_rejectsMemberUntilRenounce() public {
        address x = branchManager;
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(agentId, x);
        _grant(agentOwner, b1, x, IAgentAccess.Role.Manager);

        vm.prank(x);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerIsAgentMember.selector, x, agentId));
        registry.acceptAgentOwner(agentId);

        vm.prank(x);
        agentAccess.renounceRole(b1);
        vm.prank(x);
        registry.acceptAgentOwner(agentId);
        assertEq(registry.getAgent(agentId).owner, x);

        // Chuyển quyền chủ đi: X không còn vai trò nào sót lại
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(agentId, coOwner);
        vm.prank(coOwner);
        registry.acceptAgentOwner(agentId);
        assertEq(uint8(agentAccess.effectiveRoleOf(b1, x)), uint8(IAgentAccess.Role.None));
        assertEq(agentAccess.branchCountOfAccount(x), 0);
    }

    /// Thành viên chi nhánh đã xoá của agent vẫn tính (vai trò lưu còn, phải thu hồi trước).
    function test_acceptAgentOwner_countsDeletedBranchMembership() public {
        _grant(agentOwner, b2, staff, IAgentAccess.Role.Staff);
        vm.prank(platformAdmin);
        branches.deleteBranch(b2, "dong");
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.OwnerIsAgentMember.selector, staff, agentId));
        registry.proposeAgentOwner(agentId, staff);

        vm.prank(agentOwner);
        agentAccess.revokeRole(b2, staff);
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(agentId, staff);
    }

    /// Chưa nối AgentAccess (hệ deploy dở) thì bỏ qua kiểm thành viên, không revert.
    function test_acceptAgentOwner_withoutAgentAccessWired() public {
        // Xoá slot `agentAccess` (namespace slot 3) để giả trạng thái chưa nối.
        bytes32 slot = bytes32(uint256(0xedf803923c55a0f16904cf3e37d276888338928655d01abb49352257aa4c9f00) + 3);
        vm.store(address(registry), slot, bytes32(0));
        assertEq(registry.agentAccess(), address(0));
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(agentId, coOwner);
        vm.prank(coOwner);
        registry.acceptAgentOwner(agentId);
        assertEq(registry.getAgent(agentId).owner, coOwner);
    }
}
