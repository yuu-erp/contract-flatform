// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {IDelegateRegistry} from "../../../src/interfaces/IDelegateRegistry.sol";
import {IAgentUserRegistry} from "../../../src/interfaces/IAgentUserRegistry.sol";

/// @notice Ví phiên, OTP, QR (chữ ký của địa chỉ đăng nhập) → tài khoản; vô hiệu khi đổi mật khẩu / chặn / hết hạn.
contract DelegateRegistryTest is PlatformFixture {
    bytes32 internal constant OPEN_TYPEHASH = keccak256(
        "OpenSession(uint64 agentId,address account,address delegate,uint64 ttl,uint64 nonce,uint256 deadline)"
    );
    bytes32 internal constant OTP_TYPEHASH =
        keccak256("OtpLogin(uint64 agentId,address otp,address delegate,uint64 ttl,uint256 deadline)");

    uint64 internal a;
    uint64 internal b;
    uint256 internal teoKey = 0xA11CE;
    address internal teo;
    uint256 internal otpKey = 0x0777;
    address internal otp;
    address internal pc = makeAddr("pc12"); // ví phiên trên máy trạm
    address internal relayer = makeAddr("relayer");

    function setUp() public override {
        super.setUp();
        a = _createAgent(agentOwner);
        b = _createBranch(a, "a.vn", NET);
        teo = vm.addr(teoKey);
        otp = vm.addr(otpKey);
        vm.prank(agentOwner);
        desk.registerCustomer(b, teo, "teo", _p());
    }

    function _p() internal pure returns (IAgentUserRegistry.UserProfile memory) {
        return IAgentUserRegistry.UserProfile({displayName: "Teo", fullName: "", phone: "", birthday: "", note: ""});
    }

    function _sig(uint256 key, bytes32 structHash) internal view returns (bytes memory) {
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", delegate.domainSeparator(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }

    // ─── Mở phiên bằng địa chỉ đăng nhập ────────────────────────────────

    function test_openSession_byLogin_resolves() public {
        assertEq(delegate.resolve(a, pc), pc, "chua co phien");
        vm.prank(teo);
        delegate.openSession(a, pc, 2 hours);
        assertEq(delegate.resolve(a, pc), teo);
        assertEq(delegate.sessionOf(a, pc).expiresAt, block.timestamp + 2 hours);
        assertEq(delegate.resolve(a, teo), teo, "dia chi dang nhap");
        assertEq(delegate.resolve(a, stranger), stranger, "vi that");
    }

    function test_openSession_rejects() public {
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.NotLogin.selector, a, stranger));
        delegate.openSession(a, pc, 1 hours);
        vm.startPrank(teo);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.InvalidTtl.selector, uint256(24 hours)));
        delegate.openSession(a, pc, 25 hours);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.DelegateInUse.selector, a, teo));
        delegate.openSession(a, teo, 1 hours); // ví phiên không được trùng tài khoản / địa chỉ đăng nhập
        vm.stopPrank();
    }

    function test_session_expires() public {
        vm.prank(teo);
        delegate.openSession(a, pc, 1 hours);
        vm.warp(block.timestamp + 1 hours);
        assertEq(delegate.resolve(a, pc), pc);
    }

    /// @dev Đổi / đặt lại mật khẩu → loginEpoch tăng → mọi ví phiên cũ vô hiệu.
    function test_session_invalidatedByPasswordReset() public {
        vm.prank(teo);
        delegate.openSession(a, pc, 1 hours);
        address newLogin = makeAddr("teoNewLogin");
        vm.prank(agentOwner);
        desk.resetCustomerLogin(b, teo, newLogin);
        assertEq(delegate.resolve(a, pc), pc, "phien cu mat hieu luc");
        assertEq(delegate.resolve(a, newLogin), teo, "dia chi dang nhap moi");
    }

    function test_session_invalidatedByBlock() public {
        vm.prank(teo);
        delegate.openSession(a, pc, 1 hours);
        vm.prank(agentOwner);
        desk.setCustomerBlocked(b, teo, true, "gian lan");
        assertEq(delegate.resolve(a, pc), pc);
    }

    // ─── QR: điện thoại đã đăng nhập ký cho máy mới ─────────────────────

    function test_openSessionBySig_relayed_noReplay() public {
        uint256 deadline = block.timestamp + 5 minutes;
        bytes memory sig =
            _sig(teoKey, keccak256(abi.encode(OPEN_TYPEHASH, a, teo, pc, uint64(3 hours), uint64(0), deadline)));
        vm.prank(relayer);
        delegate.openSessionBySig(a, teo, pc, 3 hours, deadline, sig);
        assertEq(delegate.resolve(a, pc), teo);
        assertEq(delegate.nonceOf(a, teo), 1);
        vm.prank(relayer);
        vm.expectRevert(IDelegateRegistry.InvalidSignature.selector);
        delegate.openSessionBySig(a, teo, pc, 3 hours, deadline, sig);
    }

    function test_openSessionBySig_wrongSignerOrExpired() public {
        uint256 deadline = block.timestamp + 5 minutes;
        bytes memory bad =
            _sig(otpKey, keccak256(abi.encode(OPEN_TYPEHASH, a, teo, pc, uint64(1 hours), uint64(0), deadline)));
        vm.expectRevert(IDelegateRegistry.InvalidSignature.selector);
        delegate.openSessionBySig(a, teo, pc, 1 hours, deadline, bad);
        bytes memory ok =
            _sig(teoKey, keccak256(abi.encode(OPEN_TYPEHASH, a, teo, pc, uint64(1 hours), uint64(0), deadline)));
        vm.warp(deadline + 1);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.SignatureExpired.selector, deadline));
        delegate.openSessionBySig(a, teo, pc, 1 hours, deadline, ok);
    }

    // ─── OTP ────────────────────────────────────────────────────────────

    function _otpLogin(uint256 deadline) internal view returns (bytes memory) {
        return _sig(otpKey, keccak256(abi.encode(OTP_TYPEHASH, a, otp, pc, uint64(2 hours), deadline)));
    }

    function test_otp_issueAndUseOnce() public {
        vm.prank(agentOwner);
        desk.issueOtp(b, teo, otp, 5 minutes);
        assertEq(delegate.otpOf(a, otp).account, teo);
        uint256 deadline = block.timestamp + 5 minutes;
        bytes memory sig = _otpLogin(deadline);
        delegate.openSessionByOtp(a, otp, pc, 2 hours, deadline, sig);
        assertEq(delegate.resolve(a, pc), teo);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.OtpNotFound.selector, a, otp));
        delegate.openSessionByOtp(a, otp, pc, 2 hours, deadline, sig);
    }

    function test_otp_rules() public {
        vm.startPrank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.InvalidTtl.selector, uint256(10 minutes)));
        desk.issueOtp(b, teo, otp, 11 minutes);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.DelegateInUse.selector, a, teo));
        desk.issueOtp(b, teo, teo, 5 minutes);
        desk.issueOtp(b, teo, otp, 5 minutes);
        vm.stopPrank();

        vm.warp(block.timestamp + 5 minutes + 1);
        uint256 deadline = block.timestamp + 5 minutes;
        bytes memory sig = _otpLogin(deadline);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.OtpExpired.selector, a, otp));
        delegate.openSessionByOtp(a, otp, pc, 2 hours, deadline, sig);

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.NotOperator.selector, stranger));
        delegate.issueOtp(a, teo, otp, 5 minutes, stranger);
    }

    // ─── Thu hồi ────────────────────────────────────────────────────────

    function test_revoke_byDelegateOrOwnerOnly() public {
        vm.prank(teo);
        delegate.openSession(a, pc, 1 hours);
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(IDelegateRegistry.NotSessionOwner.selector, a, pc, stranger));
        delegate.revokeSession(a, pc);
        vm.prank(teo);
        delegate.revokeSession(a, pc);
        assertEq(delegate.resolve(a, pc), pc);

        vm.prank(teo);
        delegate.openSession(a, pc, 1 hours);
        vm.prank(pc);
        delegate.revokeSession(a, pc); // máy tự đăng xuất
        assertEq(delegate.sessionOf(a, pc).account, address(0));
    }
}
