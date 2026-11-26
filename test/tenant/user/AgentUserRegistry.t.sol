// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {IAgentUserRegistry} from "../../../src/interfaces/IAgentUserRegistry.sol";
import {IAgentAccess} from "../../../src/interfaces/IAgentAccess.sol";
import {IAgentRegistry} from "../../../src/interfaces/IAgentRegistry.sol";
import {IHistoryIndex} from "../../../src/interfaces/IHistoryIndex.sol";
import {PlatformAuditRecord} from "../../../src/interfaces/IPlatformAudit.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/// @notice Người dùng theo agent: đăng ký (staff / tự ký), đổi & đặt lại mật khẩu, username, hồ sơ, chặn, OTP.
contract AgentUserRegistryTest is PlatformFixture {
    bytes32 internal constant REGISTER_TYPEHASH = keccak256(
        "Register(uint64 agentId,uint64 branchId,address account,string username,bytes32 profileHash,uint256 deadline)"
    );
    bytes32 internal constant CHANGE_PASSWORD_TYPEHASH =
        keccak256("ChangePassword(uint64 agentId,address account,address newLogin,uint64 nonce,uint256 deadline)");
    bytes32 internal constant CHANGE_USERNAME_TYPEHASH =
        keccak256("ChangeUsername(uint64 agentId,address account,string username,uint64 nonce,uint256 deadline)");
    bytes32 internal constant UPDATE_PROFILE_TYPEHASH =
        keccak256("UpdateProfile(uint64 agentId,address account,bytes32 profileHash,uint64 nonce,uint256 deadline)");

    uint64 internal agentId;
    uint64 internal b1;
    uint64 internal b2;
    uint64 internal otherAgent;
    uint64 internal otherBranch;

    // "Ví sinh từ mật khẩu" giả lập bằng khoá cố định: client thật dùng scrypt(mật khẩu, salt).
    uint256 internal teoKey = 0xA11CE;
    address internal teo;
    uint256 internal teoNewKey = 0xB0B;
    address internal teoNew;
    uint256 internal otpKey = 0x0777;
    address internal otpAddr;
    address internal relayer = makeAddr("relayer");

    function setUp() public override {
        super.setUp();
        agentId = _createAgent(agentOwner);
        b1 = _createBranch(agentId, "a.vn", NET);
        b2 = _createBranch(agentId, "b.vn", NET);
        otherAgent = _createAgent(coOwner);
        otherBranch = _createBranch(otherAgent, "c.vn", NET);
        vm.startPrank(agentOwner);
        agentAccess.grantRole(b1, staff, IAgentAccess.Role.Staff);
        agentAccess.grantRole(b1, branchManager, IAgentAccess.Role.Manager);
        vm.stopPrank();
        teo = vm.addr(teoKey);
        teoNew = vm.addr(teoNewKey);
        otpAddr = vm.addr(otpKey);
        vm.prank(platformOwner);
        users.setOperator(address(this), true); // test đóng vai CustomerDesk (quyền đã kiểm ở T2)
    }

    // ─── Tiện ích ───────────────────────────────────────────────────────

    function _profile(string memory name, string memory phone)
        internal
        pure
        returns (IAgentUserRegistry.UserProfile memory)
    {
        return IAgentUserRegistry.UserProfile({
            displayName: name, fullName: "Tran Van Teo", phone: phone, birthday: "2004-05-17", note: ""
        });
    }

    function _p() internal pure returns (IAgentUserRegistry.UserProfile memory) {
        return _profile("Teo", "0912 345 678");
    }

    function _sign(uint256 key, bytes32 structHash) internal view returns (bytes memory) {
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", users.domainSeparator(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }

    function _registerByStaff(address account, string memory username) internal {
        users.registerFor(agentId, b1, staff, account, username, _p());
    }

    function _registerSig(
        uint256 key,
        string memory username,
        IAgentUserRegistry.UserProfile memory p,
        uint256 deadline
    ) internal view returns (bytes memory) {
        address account = vm.addr(key);
        return _sign(
            key,
            keccak256(
                abi.encode(
                    REGISTER_TYPEHASH,
                    agentId,
                    b1,
                    account,
                    keccak256(bytes(username)),
                    keccak256(abi.encode(p)),
                    deadline
                )
            )
        );
    }

    function _changePasswordSig(uint256 key, address account, address newLogin, uint256 deadline)
        internal
        view
        returns (bytes memory)
    {
        uint64 nonce = users.getUser(agentId, account).nonce;
        return _sign(key, keccak256(abi.encode(CHANGE_PASSWORD_TYPEHASH, agentId, account, newLogin, nonce, deadline)));
    }

    // ─── Đăng ký ────────────────────────────────────────────────────────

    function test_registerByStaff() public {
        vm.expectEmit(address(users));
        emit IAgentUserRegistry.UserRegistered(1, agentId, teo, "teo", b1, staff, 1);
        _registerByStaff(teo, "teo");

        IAgentUserRegistry.UserView memory u = users.getUser(agentId, teo);
        assertEq(u.loginAddress, teo);
        assertEq(u.registeredBy, staff);
        assertEq(u.registeredBranch, b1);
        assertEq(uint8(u.status), uint8(IAgentUserRegistry.UserStatus.Active));
        assertEq(u.username, "teo");
        assertEq(users.accountOf(agentId, "teo"), teo);
        assertEq(users.accountOfLogin(agentId, teo), teo);
        assertEq(users.userCount(agentId), 1);
        assertEq(users.userCountOfBranch(b1), 1);
        assertTrue(users.isActive(agentId, teo));

        IAgentUserRegistry.UserProfileRecord memory rec = users.getProfile(agentId, teo);
        assertEq(rec.profile.phone, "0912 345 678");
        assertEq(rec.profile.fullName, "Tran Van Teo");
        assertEq(rec.account, teo);
    }

    function test_registerFor_writesAuditWithStaffAsActor() public {
        _registerByStaff(teo, "teo");
        IHistoryIndex.Term[] memory filters = new IHistoryIndex.Term[](1);
        filters[0] = IHistoryIndex.Term("X", "user_register");
        IHistoryIndex.Page memory page = historyIndex.search(
            0,
            "platform_audit",
            IHistoryIndex.Query({
                filters: filters,
                ranges: new IHistoryIndex.Range[](0),
                sortSlot: 0,
                ascending: false,
                offset: 0,
                limit: 5
            })
        );
        assertEq(page.total, 1);
        PlatformAuditRecord memory a = abi.decode(page.data[0], (PlatformAuditRecord));
        assertEq(a.actor, staff);
        assertEq(a.agentId, agentId);
        assertEq(a.branchId, b1);
    }

    /// @dev Chỉ operator (CustomerDesk) gọi được cổng nhân viên; quyền nhân viên kiểm ở CustomerDesk (ADR 0035).
    function test_operatorOnly_andBranchMustBelongToAgent() public {
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.NotOperator.selector, staff));
        users.registerFor(agentId, b1, staff, teo, "teo", _p());

        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.BranchNotInAgent.selector, otherBranch, agentId));
        users.registerFor(agentId, otherBranch, staff, teo, "teo", _p());

        vm.prank(platformOwner);
        users.setOperator(address(this), false);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.NotOperator.selector, address(this)));
        users.registerFor(agentId, b2, agentOwner, teo, "teo", _p());
        assertFalse(users.isOperator(address(this)));
    }

    function test_register_agentSuspendedOrPaused_reverts() public {
        vm.prank(platformAdmin);
        registry.suspendAgent(agentId, "kiem tra");
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotActive.selector, agentId));
        users.registerFor(agentId, b1, staff, teo, "teo", _p());

        vm.prank(platformAdmin);
        registry.resumeAgent(agentId, "xong");
        vm.prank(platformAdmin);
        access.pause();
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        users.registerFor(agentId, b1, staff, teo, "teo", _p());
    }

    function test_username_rules() public {
        string[6] memory bad = ["ab", "Teo", "teo!", "_teo", ".teo", "abcdefghijklmnopqrstuvwxy"];
        for (uint256 i; i < bad.length; ++i) {
            vm.expectRevert(IAgentUserRegistry.InvalidUsername.selector);
            users.registerFor(agentId, b1, staff, teo, bad[i], _p());
        }
        _registerByStaff(teo, "teo.99_x");
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.UsernameTaken.selector, agentId, "teo.99_x"));
        users.registerFor(agentId, b1, staff, teoNew, "teo.99_x", _p());
    }

    function test_sameUsernameAndAddress_inOtherAgent_isSeparateAccount() public {
        _registerByStaff(teo, "teo");
        users.registerFor(otherAgent, otherBranch, coOwner, teo, "teo", _profile("Teo B", ""));
        assertEq(users.userCount(agentId), 1);
        assertEq(users.userCount(otherAgent), 1);
        assertEq(users.getProfile(otherAgent, teo).profile.displayName, "Teo B");
    }

    function test_register_rejectsExistingAccountOrLogin() public {
        _registerByStaff(teo, "teo");
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.AccountExists.selector, agentId, teo));
        users.registerFor(agentId, b1, staff, teo, "teo2", _p());

        // teoNew đang là địa chỉ đăng nhập của teo → không được đăng ký làm tài khoản khác.
        users.resetLoginFor(agentId, b1, staff, teo, teoNew);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.LoginInUse.selector, agentId, teoNew));
        users.registerFor(agentId, b1, staff, teoNew, "khac", _p());
    }

    function test_profile_rules() public {
        IAgentUserRegistry.UserProfile memory p = _p();
        p.displayName = "";
        vm.expectRevert(IAgentUserRegistry.InvalidProfile.selector);
        users.registerFor(agentId, b1, staff, teo, "teo", p);

        p = _p();
        p.phone = "abc";
        vm.expectRevert(IAgentUserRegistry.InvalidProfile.selector);
        users.registerFor(agentId, b1, staff, teo, "teo", p);

        p = _p();
        p.birthday = "2004-13-01";
        vm.expectRevert(IAgentUserRegistry.InvalidProfile.selector);
        users.registerFor(agentId, b1, staff, teo, "teo", p);
    }

    function test_registerBySig_relayedByAnyone() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _registerSig(teoKey, "teo", _p(), deadline);
        vm.prank(relayer);
        users.registerBySig(agentId, b1, teo, "teo", _p(), deadline, sig);
        IAgentUserRegistry.UserView memory u = users.getUser(agentId, teo);
        assertEq(u.registeredBy, teo);
        assertEq(u.loginAddress, teo);
    }

    function test_registerBySig_rejectsTamperWrongSignerExpired() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _registerSig(teoKey, "teo", _p(), deadline);

        // Người gửi hộ sửa hồ sơ
        vm.expectRevert(IAgentUserRegistry.InvalidSignature.selector);
        users.registerBySig(agentId, b1, teo, "teo", _profile("Hacker", ""), deadline, sig);
        // Người gửi hộ đổi username
        vm.expectRevert(IAgentUserRegistry.InvalidSignature.selector);
        users.registerBySig(agentId, b1, teo, "teo2", _p(), deadline, sig);
        // Ký bằng khoá khác
        bytes memory other = _registerSig(teoNewKey, "teo", _p(), deadline);
        vm.expectRevert(IAgentUserRegistry.InvalidSignature.selector);
        users.registerBySig(agentId, b1, teo, "teo", _p(), deadline, other);
        // Hết hạn
        vm.warp(deadline + 1);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.SignatureExpired.selector, deadline));
        users.registerBySig(agentId, b1, teo, "teo", _p(), deadline, sig);
    }

    // ─── Mật khẩu ───────────────────────────────────────────────────────

    function test_changePasswordBySig() public {
        _registerByStaff(teo, "teo");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _changePasswordSig(teoKey, teo, teoNew, deadline);

        vm.expectEmit(address(users));
        // `by` = chính khách (người gửi hộ chỉ trả gas)
        emit IAgentUserRegistry.UserLoginChanged(1, agentId, teo, teo, teoNew, 1, false, teo, 0);
        vm.prank(relayer);
        users.changePasswordBySig(agentId, teo, teoNew, deadline, sig);

        IAgentUserRegistry.UserView memory u = users.getUser(agentId, teo);
        assertEq(u.loginAddress, teoNew);
        assertEq(u.loginEpoch, 1);
        assertEq(u.nonce, 1);
        assertEq(users.accountOfLogin(agentId, teoNew), teo);
        assertEq(users.accountOfLogin(agentId, teo), address(0), "dia chi cu het hieu luc");

        // Dùng lại chữ ký cũ: nonce đã tăng và người ký không còn là địa chỉ đăng nhập.
        vm.expectRevert(IAgentUserRegistry.InvalidSignature.selector);
        users.changePasswordBySig(agentId, teo, teoNew, deadline, sig);

        // Mật khẩu cũ không đổi được nữa; mật khẩu mới đổi được.
        address third = makeAddr("third");
        bytes memory oldKeySig = _changePasswordSig(teoKey, teo, third, deadline);
        vm.expectRevert(IAgentUserRegistry.InvalidSignature.selector);
        users.changePasswordBySig(agentId, teo, third, deadline, oldKeySig);
        users.changePasswordBySig(agentId, teo, third, deadline, _changePasswordSig(teoNewKey, teo, third, deadline));
        assertEq(users.getUser(agentId, teo).loginAddress, third);
    }

    function test_resetLogin_byStaff_noOldPassword_logged() public {
        _registerByStaff(teo, "teo");
        vm.expectEmit(address(users));
        emit IAgentUserRegistry.UserLoginChanged(1, agentId, teo, teo, teoNew, 1, true, staff, b1);
        users.resetLoginFor(agentId, b1, staff, teo, teoNew);
        assertEq(users.getUser(agentId, teo).loginAddress, teoNew);

        IHistoryIndex.Term[] memory filters = new IHistoryIndex.Term[](1);
        filters[0] = IHistoryIndex.Term("X", "user_password_reset");
        IHistoryIndex.Page memory page = historyIndex.search(
            0,
            "platform_audit",
            IHistoryIndex.Query({
                filters: filters,
                ranges: new IHistoryIndex.Range[](0),
                sortSlot: 0,
                ascending: false,
                offset: 0,
                limit: 5
            })
        );
        assertEq(page.total, 1);
        PlatformAuditRecord memory a = abi.decode(page.data[0], (PlatformAuditRecord));
        assertEq(a.actor, staff);
        (address acc, address newLogin) = abi.decode(a.after_, (address, address));
        assertEq(acc, teo);
        assertEq(newLogin, teoNew);
    }

    function test_resetLogin_rejectsLoginOfOtherUser() public {
        _registerByStaff(teo, "teo");
        address bo = makeAddr("bo");
        _registerByStaff(bo, "bo.sua");
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.LoginInUse.selector, agentId, bo));
        users.resetLoginFor(agentId, b1, staff, teo, bo);
    }

    // ─── Username, hồ sơ ────────────────────────────────────────────────

    function test_changeUsernameBySig() public {
        _registerByStaff(teo, "teo");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(
            teoKey,
            keccak256(
                abi.encode(CHANGE_USERNAME_TYPEHASH, agentId, teo, keccak256(bytes("teo.pro")), uint64(0), deadline)
            )
        );
        users.changeUsernameBySig(agentId, teo, "teo.pro", deadline, sig);
        assertEq(users.accountOf(agentId, "teo.pro"), teo);
        assertEq(users.accountOf(agentId, "teo"), address(0));
        assertEq(users.getUser(agentId, teo).username, "teo.pro");
        // Tên cũ người khác dùng được.
        _registerByStaff(teoNew, "teo");
        assertEq(users.accountOf(agentId, "teo"), teoNew);
    }

    function test_updateProfile_bySigAndByStaff() public {
        _registerByStaff(teo, "teo");
        IAgentUserRegistry.UserProfile memory p = _profile("Teo Pro", "0988 000 111");
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(
            teoKey,
            keccak256(abi.encode(UPDATE_PROFILE_TYPEHASH, agentId, teo, keccak256(abi.encode(p)), uint64(0), deadline))
        );
        users.updateProfileBySig(agentId, teo, p, deadline, sig);
        assertEq(users.getProfile(agentId, teo).profile.displayName, "Teo Pro");

        users.updateProfileFor(agentId, b1, staff, teo, _profile("Teo Staff", ""));
        assertEq(users.getProfile(agentId, teo).profile.displayName, "Teo Staff");
        assertEq(users.getUser(agentId, teo).profileDocId, 1, "cung document");
    }

    // ─── Chặn ───────────────────────────────────────────────────────────

    function test_setBlocked_reasonAndBlocksActions() public {
        _registerByStaff(teo, "teo");
        vm.expectRevert(IAgentUserRegistry.EmptyReason.selector);
        users.setBlockedFor(agentId, b1, branchManager, teo, true, "");

        users.setBlockedFor(agentId, b1, branchManager, teo, true, "gian lan");
        assertFalse(users.isActive(agentId, teo));

        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.UserNotActive.selector, agentId, teo));
        users.resetLoginFor(agentId, b1, staff, teo, teoNew);

        vm.expectRevert(IAgentUserRegistry.StatusUnchanged.selector);
        users.setBlockedFor(agentId, b1, branchManager, teo, true, "lan nua");

        users.setBlockedFor(agentId, b1, agentOwner, teo, false, "da xac minh");
        assertTrue(users.isActive(agentId, teo));
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function test_usersOf_paginationAndBranchCount() public {
        for (uint256 i; i < 5; ++i) {
            _registerByStaff(makeAddr(string.concat("u", vm.toString(i))), string.concat("user", vm.toString(i)));
        }
        IAgentUserRegistry.UserView[] memory page = users.usersOf(agentId, 3, 10);
        assertEq(page.length, 2);
        assertEq(page[0].username, "user3");
        assertEq(users.usersOf(agentId, 9, 10).length, 0);
        assertEq(users.userCountOfBranch(b1), 5);
    }

    /// @dev Nhân viên vẫn làm khách được tại agent mình (docs/modules/core-user.md §9.6).
    function test_staffCanBeUser() public {
        _registerByStaff(staff, "nhanvien");
        assertTrue(users.isActive(agentId, staff));
    }

    function test_setOperator_ownerOnly() public {
        vm.prank(platformAdmin);
        vm.expectRevert();
        users.setOperator(stranger, true);
    }
}
