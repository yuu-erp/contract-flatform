// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {IAgentUserRegistry} from "./IAgentUserRegistry.sol";

/// @title ICustomerDesk
/// @notice T2 "quầy khách" (ADR 0035): thao tác của nhân viên trên tài khoản khách. Kiểm `Permission.can()` (đang trực,
///         vị trí có quyền) rồi gọi cổng operator của AgentUserRegistry / DelegateRegistry (T1). T1 không gọi lên T2.
interface ICustomerDesk {
    error ZeroAddress();

    function PERM_REGISTER() external view returns (uint8);
    function PERM_PROFILE() external view returns (uint8);
    function PERM_OTP() external view returns (uint8);
    function PERM_RESET_LOGIN() external view returns (uint8);
    function PERM_BLOCK() external view returns (uint8);

    function registerCustomer(
        uint64 branchId,
        address account,
        string calldata username,
        IAgentUserRegistry.UserProfile calldata profile
    ) external;
    function updateCustomerProfile(uint64 branchId, address account, IAgentUserRegistry.UserProfile calldata profile)
        external;
    /// @notice `otp` = địa chỉ sinh từ mã OTP ở client; nhân viên đọc mã cho khách.
    function issueOtp(uint64 branchId, address account, address otp, uint64 ttl) external;
    /// @notice Khách quên mật khẩu: đặt địa chỉ đăng nhập mới (sinh từ mật khẩu mới), không cần mật khẩu cũ.
    function resetCustomerLogin(uint64 branchId, address account, address newLogin) external;
    /// @notice Chặn / mở khách. Quyền chỉ Manager (bit 9).
    function setCustomerBlocked(uint64 branchId, address account, bool blocked, string calldata reason) external;
}
