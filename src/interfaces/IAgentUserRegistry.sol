// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IAgentUserRegistry
/// @notice Người dùng (khách) theo agent: dùng chung mọi chi nhánh, mọi dịch vụ của agent. Không có tài khoản toàn hệ.
///         Định danh `account` không đổi (khoá ở Ledger, Loyalty, NET, IQR). Đăng nhập bằng `loginAddress`: địa chỉ ví
///         sinh từ username + mật khẩu ở client (scrypt), đổi khi đổi / đặt lại mật khẩu. Không lưu gì về mật khẩu.
///         Thao tác của khách là chữ ký EIP-712; ai cũng gửi hộ được (khách không cần gas).
///         Đặc tả: docs/modules/core-user.md.
interface IAgentUserRegistry {
    enum UserStatus {
        None,
        Active,
        Blocked
    }

    /// @notice Hồ sơ lưu trong FullDB (rõ, người dùng chốt 2026-11-26).
    struct UserProfile {
        string displayName; // 1–50 byte
        string fullName; // 0–100 byte
        string phone; // TextRules.isPhone
        string birthday; // 0 hoặc "YYYY-MM-DD"
        string note; // 0–200 byte
    }

    struct User {
        address loginAddress;
        uint64 createdAt;
        uint32 loginEpoch; // tăng mỗi lần đổi / đặt lại mật khẩu → DelegateRegistry thu hồi ví phiên cũ
        address registeredBy; // staff, hoặc chính account khi tự đăng ký
        uint64 registeredBranch;
        UserStatus status;
        uint64 nonce; // chống dùng lại chữ ký EIP-712
        uint256 profileDocId;
        string username;
    }

    struct UserView {
        address account;
        address loginAddress;
        uint64 createdAt;
        uint32 loginEpoch;
        address registeredBy;
        uint64 registeredBranch;
        UserStatus status;
        uint64 nonce;
        uint256 profileDocId;
        string username;
    }

    struct UserProfileRecord {
        uint8 version;
        uint64 agentId;
        address account;
        UserProfile profile;
        uint64 updatedAt;
    }

    /// @dev Không dùng từ ADR 0035 (OTP ở DelegateRegistry); giữ kiểu cho storage cũ.
    struct Otp {
        address account;
        uint64 expiresAt;
    }

    // ─── Lỗi ────────────────────────────────────────────────────────────
    error ZeroAddress();
    error NotOperator(address caller);
    error BranchNotInAgent(uint64 branchId, uint64 agentId);
    error BranchNotActive(uint64 branchId);
    error InvalidUsername();
    error UsernameTaken(uint64 agentId, string username);
    error AccountExists(uint64 agentId, address account);
    error UserNotFound(uint64 agentId, address account);
    error UserNotActive(uint64 agentId, address account);
    error LoginInUse(uint64 agentId, address login);
    error InvalidSignature();
    error SignatureExpired(uint256 deadline);
    error InvalidProfile();
    error EmptyReason();
    error FieldTooLong();
    error StatusUnchanged();

    // ─── Event ──────────────────────────────────────────────────────────
    event OperatorSet(uint8 version, address indexed operator, bool allowed);
    event UserRegistered(
        uint8 version,
        uint64 indexed agentId,
        address indexed account,
        string username,
        uint64 branchId,
        address registeredBy,
        uint256 profileDocId
    );
    /// @param byStaff `true` = staff đặt lại khi khách quên mật khẩu (không cần mật khẩu cũ).
    event UserLoginChanged(
        uint8 version,
        uint64 indexed agentId,
        address indexed account,
        address oldLogin,
        address newLogin,
        uint32 loginEpoch,
        bool byStaff,
        address indexed by,
        uint64 branchId
    );
    event UsernameChanged(
        uint8 version, uint64 indexed agentId, address indexed account, string oldName, string newName
    );
    event UserProfileUpdated(uint8 version, uint64 indexed agentId, address indexed account, address by);
    event UserStatusChanged(
        uint8 version,
        uint64 indexed agentId,
        address indexed account,
        UserStatus from,
        UserStatus to,
        address indexed by,
        uint64 branchId,
        string reason
    );

    // ─── Cấu hình (PLATFORM_OWNER) ──────────────────────────────────────
    /// @notice Cấp / thu quyền operator (contract T2 đã kiểm quyền nhân viên, ADR 0035).
    function setOperator(address operator, bool allowed) external;
    function isOperator(address operator) external view returns (bool);

    // ─── Khách tự làm (chữ ký EIP-712, ai gửi hộ cũng được) ─────────────
    /// @notice Khách tự đăng ký. Ký bởi chính `account` (= địa chỉ sinh từ mật khẩu lần đầu).
    function registerBySig(
        uint64 agentId,
        uint64 branchId,
        address account,
        string calldata username,
        UserProfile calldata profile,
        uint256 deadline,
        bytes calldata signature
    ) external;

    /// @notice Khách đổi mật khẩu: ký bằng khoá của `loginAddress` hiện tại.
    function changePasswordBySig(
        uint64 agentId,
        address account,
        address newLogin,
        uint256 deadline,
        bytes calldata signature
    ) external;

    function changeUsernameBySig(
        uint64 agentId,
        address account,
        string calldata username,
        uint256 deadline,
        bytes calldata signature
    ) external;

    function updateProfileBySig(
        uint64 agentId,
        address account,
        UserProfile calldata profile,
        uint256 deadline,
        bytes calldata signature
    ) external;

    // ─── Operator (CustomerDesk): thao tác của nhân viên `actor`, quyền đã kiểm ở T2 ─────
    function registerFor(
        uint64 agentId,
        uint64 branchId,
        address actor,
        address account,
        string calldata username,
        UserProfile calldata profile
    ) external;

    /// @notice Khách quên mật khẩu: đặt địa chỉ đăng nhập mới, không cần mật khẩu cũ. Ghi log người đặt lại.
    function resetLoginFor(uint64 agentId, uint64 branchId, address actor, address account, address newLogin) external;

    function updateProfileFor(
        uint64 agentId,
        uint64 branchId,
        address actor,
        address account,
        UserProfile calldata profile
    ) external;

    function setBlockedFor(
        uint64 agentId,
        uint64 branchId,
        address actor,
        address account,
        bool blocked,
        string calldata reason
    ) external;

    // ─── Đọc ────────────────────────────────────────────────────────────
    function getUser(uint64 agentId, address account) external view returns (UserView memory);
    function getProfile(uint64 agentId, address account) external view returns (UserProfileRecord memory);
    function accountOf(uint64 agentId, string calldata username) external view returns (address);
    /// @notice Địa chỉ đăng nhập → account (0 nếu không có).
    function accountOfLogin(uint64 agentId, address login) external view returns (address);
    function isActive(uint64 agentId, address account) external view returns (bool);
    function userCount(uint64 agentId) external view returns (uint256);
    function usersOf(uint64 agentId, uint256 offset, uint256 limit) external view returns (UserView[] memory);
    function userCountOfBranch(uint64 branchId) external view returns (uint256);
    function domainSeparator() external view returns (bytes32);
}
