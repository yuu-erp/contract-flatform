// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IDelegateRegistry
/// @notice T1: "ví này đang thay mặt tài khoản nào, tới khi nào?" (nguyên tắc 7). Ví phiên trên máy trạm / máy quầy,
///         đăng nhập bằng OTP một lần, đăng nhập bằng quét QR (điện thoại đã đăng nhập ký cho máy mới).
///         Ví phiên hết hiệu lực khi hết hạn, khi tài khoản đổi / đặt lại mật khẩu (`loginEpoch` tăng) hoặc bị chặn.
///         Đặc tả: docs/modules/tenant-delegate.md.
interface IDelegateRegistry {
    struct Session {
        address account;
        uint64 expiresAt;
        uint32 loginEpoch; // loginEpoch của tài khoản lúc mở; lệch thì phiên vô hiệu
    }

    struct Otp {
        address account;
        uint64 expiresAt;
    }

    error ZeroAddress();
    error NotOperator(address caller);
    error NotLogin(uint64 agentId, address caller);
    error UserNotActive(uint64 agentId, address account);
    error InvalidTtl(uint256 max);
    error DelegateInUse(uint64 agentId, address delegate);
    error OtpInUse(uint64 agentId, address otp);
    error OtpNotFound(uint64 agentId, address otp);
    error OtpExpired(uint64 agentId, address otp);
    error InvalidSignature();
    error SignatureExpired(uint256 deadline);
    error NotSessionOwner(uint64 agentId, address delegate, address caller);

    event OperatorSet(uint8 version, address indexed operator, bool allowed);
    event OtpIssued(
        uint8 version, uint64 indexed agentId, address indexed account, address otp, uint64 expiresAt, address by
    );
    event SessionOpened(
        uint8 version,
        uint64 indexed agentId,
        address indexed account,
        address indexed delegate,
        uint64 expiresAt,
        uint8 method,
        address by
    );
    event SessionRevoked(
        uint8 version, uint64 indexed agentId, address indexed account, address indexed delegate, address by
    );

    function MAX_SESSION_TTL() external view returns (uint64);
    function MAX_OTP_TTL() external view returns (uint64);
    function METHOD_LOGIN() external view returns (uint8);
    function METHOD_SIGNATURE() external view returns (uint8);
    function METHOD_OTP() external view returns (uint8);

    function setOperator(address operator, bool allowed) external;
    function isOperator(address operator) external view returns (bool);

    /// @notice Cấp OTP đăng nhập một lần (operator = CustomerDesk đã kiểm quyền nhân viên `actor`).
    ///         `otp` là địa chỉ sinh từ mã OTP ở client; mã đọc cho khách, không lên chain.
    function issueOtp(uint64 agentId, address account, address otp, uint64 ttl, address actor) external;

    /// @notice Người gọi là địa chỉ đăng nhập hiện tại của tài khoản: mở ví phiên `delegate` cho chính mình.
    function openSession(uint64 agentId, address delegate, uint64 ttl) external;

    /// @notice Như `openSession` nhưng bằng chữ ký EIP-712 của địa chỉ đăng nhập (ai gửi hộ cũng được — quét QR).
    function openSessionBySig(
        uint64 agentId,
        address account,
        address delegate,
        uint64 ttl,
        uint256 deadline,
        bytes calldata signature
    ) external;

    /// @notice Đăng nhập bằng OTP: chữ ký EIP-712 của khoá sinh từ OTP; OTP dùng một lần.
    function openSessionByOtp(
        uint64 agentId,
        address otp,
        address delegate,
        uint64 ttl,
        uint256 deadline,
        bytes calldata signature
    ) external;

    /// @notice Ví phiên tự đăng xuất, hoặc chủ tài khoản thu hồi.
    function revokeSession(uint64 agentId, address delegate) external;

    function sessionOf(uint64 agentId, address delegate) external view returns (Session memory);
    function otpOf(uint64 agentId, address otp) external view returns (Otp memory);
    function nonceOf(uint64 agentId, address account) external view returns (uint64);
    /// @notice Ví phiên còn hiệu lực → tài khoản; địa chỉ đăng nhập → tài khoản; còn lại → chính địa chỉ đó (ví thật).
    function resolve(uint64 agentId, address caller) external view returns (address account);
    function domainSeparator() external view returns (bytes32);
}
