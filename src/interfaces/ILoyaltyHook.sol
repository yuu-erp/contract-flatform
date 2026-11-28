// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @notice Sự kiện chung khi gọi hook module bổ trợ thất bại (ADR 0031 C4). Module gọi hook khai báo `emit` này.
interface IHookEvents {
    event HookFailed(uint8 version, uint8 moduleId, address hook, bytes32 refId, bytes data);
}

/// @title ILoyaltyHook
/// @notice Báo Loyalty khi dịch vụ chính đã trừ tiền (ví dụ NET đóng phiên). Module gọi qua `SafeHook`.
interface ILoyaltyHook {
    /// @notice `moduleId` là module dịch vụ nguồn (NET, IQR, …), không phải id của Loyalty.
    function onSpend(
        uint8 version,
        uint64 agentId,
        uint64 branchId,
        address account,
        uint8 moduleId,
        bytes32 refId,
        uint128 amount
    ) external;
}
