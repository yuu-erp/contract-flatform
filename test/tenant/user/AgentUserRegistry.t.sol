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
        users.setDelegateRegistry(address(this)); // test đóng vai DelegateRegistry
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
        vm.prank(staff);
        users.registerByStaff(agentId, b1, account, username, _p());
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

    function test_registerByStaff_writesAuditWithStaffAsActor() public {
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

    function test_registerByStaff_needsStaffOfBranchInAgent() public {
        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAgentUserRegistry.MissingRole.selector, b1, stranger, uint8(IAgentAccess.Role.Staff)
            )
        );
        users.registerByStaff(agentId, b1, teo, "teo", _p());

        // Staff của b1 không được đăng ký ở b2 (không có vai trò ở b2).
        vm.prank(staff);
        vm.expectRevert(
            abi.encodeWithSelector(IAgentUserRegistry.MissingRole.selector, b2, staff, uint8(IAgentAccess.Role.Staff))
        );
        users.registerByStaff(agentId, b2, teo, "teo", _p());

        // Chi nhánh của agent khác.
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.BranchNotInAgent.selector, otherBranch, agentId));
        users.registerByStaff(agentId, otherBranch, teo, "teo", _p());

        // Chủ agent làm được (vai trò Owner ≥ Staff).
        vm.prank(agentOwner);
        users.registerByStaff(agentId, b2, teo, "teo", _p());
    }

    function test_register_agentSuspendedOrPaused_reverts() public {
        vm.prank(platformAdmin);
        registry.suspendAgent(agentId, "kiem tra");
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentRegistry.AgentNotActive.selector, agentId));
        users.registerByStaff(agentId, b1, teo, "teo", _p());

        vm.prank(platformAdmin);
        registry.resumeAgent(agentId, "xong");
        vm.prank(platformAdmin);
        access.pause();
        vm.prank(staff);
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        users.registerByStaff(agentId, b1, teo, "teo", _p());
    }

    function test_username_rules() public {
        string[6] memory bad = ["ab", "Teo", "teo!", "_teo", ".teo", "abcdefghijklmnopqrstuvwxy"];
        for (uint256 i; i < bad.length; ++i) {
            vm.prank(staff);
            vm.expectRevert(IAgentUserRegistry.InvalidUsername.selector);
            users.registerByStaff(agentId, b1, teo, bad[i], _p());
        }
        _registerByStaff(teo, "teo.99_x");
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.UsernameTaken.selector, agentId, "teo.99_x"));
        users.registerByStaff(agentId, b1, teoNew, "teo.99_x", _p());
    }

    function test_sameUsernameAndAddress_inOtherAgent_isSeparateAccount() public {
        _registerByStaff(teo, "teo");
        vm.startPrank(coOwner);
        users.registerByStaff(otherAgent, otherBranch, teo, "teo", _profile("Teo B", ""));
        vm.stopPrank();
        assertEq(users.userCount(agentId), 1);
        assertEq(users.userCount(otherAgent), 1);
        assertEq(users.getProfile(otherAgent, teo).profile.displayName, "Teo B");
    }

    function test_register_rejectsExistingAccountOrLogin() public {
        _registerByStaff(teo, "teo");
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.AccountExists.selector, agentId, teo));
        users.registerByStaff(agentId, b1, teo, "teo2", _p());

        // teoNew đang là địa chỉ đăng nhập của teo → không được đăng ký làm tài khoản khác.
        vm.prank(staff);
        users.resetPassword(agentId, b1, teo, teoNew);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.LoginInUse.selector, agentId, teoNew));
        users.registerByStaff(agentId, b1, teoNew, "khac", _p());
    }

    function test_profile_rules() public {
        IAgentUserRegistry.UserProfile memory p = _p();
        p.displayName = "";
        vm.prank(staff);
        vm.expectRevert(IAgentUserRegistry.InvalidProfile.selector);
        users.registerByStaff(agentId, b1, teo, "teo", p);

        p = _p();
        p.phone = "abc";
        vm.prank(staff);
        vm.expectRevert(IAgentUserRegistry.InvalidProfile.selector);
        users.registerByStaff(agentId, b1, teo, "teo", p);

        p = _p();
        p.birthday = "2004-13-01";
        vm.prank(staff);
        vm.expectRevert(IAgentUserRegistry.InvalidProfile.selector);
        users.registerByStaff(agentId, b1, teo, "teo", p);
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
        emit IAgentUserRegistry.UserLoginChanged(1, agentId, teo, teo, teoNew, 1, false, relayer, 0);
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

    function test_resetPassword_byStaff_noOldPassword_logged() public {
        _registerByStaff(teo, "teo");
        vm.expectEmit(address(users));
        emit IAgentUserRegistry.UserLoginChanged(1, agentId, teo, teo, teoNew, 1, true, staff, b1);
        vm.prank(staff);
        users.resetPassword(agentId, b1, teo, teoNew);
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

    function test_resetPassword_rejectsLoginOfOtherUserOrStranger() public {
        _registerByStaff(teo, "teo");
        address bo = makeAddr("bo");
        _registerByStaff(bo, "bo.sua");
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.LoginInUse.selector, agentId, bo));
        users.resetPassword(agentId, b1, teo, bo);

        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAgentUserRegistry.MissingRole.selector, b1, stranger, uint8(IAgentAccess.Role.Staff)
            )
        );
        users.resetPassword(agentId, b1, teo, teoNew);
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

        vm.prank(staff);
        users.updateProfileByStaff(agentId, b1, teo, _profile("Teo Staff", ""));
        assertEq(users.getProfile(agentId, teo).profile.displayName, "Teo Staff");
        assertEq(users.getUser(agentId, teo).profileDocId, 1, "cung document");
    }

    // ─── Chặn ───────────────────────────────────────────────────────────

    function test_setBlocked_managerOnly_andBlocksActions() public {
        _registerByStaff(teo, "teo");
        vm.prank(staff);
        vm.expectRevert(
            abi.encodeWithSelector(IAgentUserRegistry.MissingRole.selector, b1, staff, uint8(IAgentAccess.Role.Manager))
        );
        users.setBlocked(agentId, b1, teo, true, "gian lan");

        vm.prank(branchManager);
        vm.expectRevert(IAgentUserRegistry.EmptyReason.selector);
        users.setBlocked(agentId, b1, teo, true, "");

        vm.prank(branchManager);
        users.setBlocked(agentId, b1, teo, true, "gian lan");
        assertFalse(users.isActive(agentId, teo));

        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.UserNotActive.selector, agentId, teo));
        users.resetPassword(agentId, b1, teo, teoNew);
        vm.prank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.UserNotActive.selector, agentId, teo));
        users.issueOtp(agentId, b1, teo, otpAddr, 5 minutes);

        vm.prank(branchManager);
        vm.expectRevert(IAgentUserRegistry.StatusUnchanged.selector);
        users.setBlocked(agentId, b1, teo, true, "lan nua");

        vm.prank(agentOwner);
        users.setBlocked(agentId, b1, teo, false, "da xac minh");
        assertTrue(users.isActive(agentId, teo));
    }

    // ─── OTP ────────────────────────────────────────────────────────────

    function test_otp_issueConsumeOnce() public {
        _registerByStaff(teo, "teo");
        vm.prank(staff);
        users.issueOtp(agentId, b1, teo, otpAddr, 5 minutes);
        assertEq(users.otpOf(agentId, otpAddr).account, teo);

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.NotDelegateRegistry.selector, stranger));
        users.consumeOtp(agentId, otpAddr);

        assertEq(users.consumeOtp(agentId, otpAddr), teo);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.OtpNotFound.selector, agentId, otpAddr));
        users.consumeOtp(agentId, otpAddr);
    }

    function test_otp_ttlAndExpiry() public {
        _registerByStaff(teo, "teo");
        vm.startPrank(staff);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.InvalidOtpTtl.selector, uint256(10 minutes)));
        users.issueOtp(agentId, b1, teo, otpAddr, 11 minutes);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.LoginInUse.selector, agentId, teo));
        users.issueOtp(agentId, b1, teo, teo, 5 minutes);
        users.issueOtp(agentId, b1, teo, otpAddr, 5 minutes);
        vm.stopPrank();

        vm.warp(block.timestamp + 5 minutes + 1);
        vm.expectRevert(abi.encodeWithSelector(IAgentUserRegistry.OtpExpired.selector, agentId, otpAddr));
        this.consumeExternal(otpAddr);
    }

    function consumeExternal(address otp) external returns (address) {
        return users.consumeOtp(agentId, otp);
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

    function test_setDelegateRegistry_ownerOnly() public {
        vm.prank(platformAdmin);
        vm.expectRevert();
        users.setDelegateRegistry(stranger);
    }
}
