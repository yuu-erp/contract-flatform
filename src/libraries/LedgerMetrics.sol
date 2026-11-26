// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title LedgerMetrics
/// @notice Chỉ số bộ đếm ngày của Ledger (vị trí trong `uint256[32]`) và quy đổi ngày kinh doanh.
///         Đặc tả: docs/08-dong-tien-va-doanh-thu.md §4.
library LedgerMetrics {
    error InvalidMethod(uint8 method);

    uint256 internal constant CASH_IN = 0; // + methodIndex: 0 CASH, 1 TRANSFER, 2 CARD
    uint256 internal constant CASH_OUT = 3; // + methodIndex
    uint256 internal constant WALLET_TOPUP = 6;
    uint256 internal constant WALLET_SPEND = 7;
    uint256 internal constant WALLET_TOPUP_REFUND = 8;
    uint256 internal constant WALLET_CREDIT = 9;
    /// @dev Chỉ số 10..31 của `uint256[32]` không còn dùng (trước ADR 0031 là bộ đếm NET/IQR cố định).
    ///      Bộ đếm theo module nằm ở `uint256[9]` riêng cho từng `moduleId` (offset bên dưới).

    // Offset trong bộ đếm của mỗi module (`uint256[9]`).
    uint256 internal constant GROSS = 0;
    uint256 internal constant DISCOUNT = 1;
    uint256 internal constant REFUND = 2;
    uint256 internal constant ADJ_UP = 3;
    uint256 internal constant ADJ_DOWN = 4;
    uint256 internal constant TAX = 5;
    uint256 internal constant TAX_REFUND = 6;
    uint256 internal constant SERVED_HERE = 7; // chỉ phạm vi chi nhánh phục vụ
    uint256 internal constant SERVED_HERE_REFUND = 8; // chỉ phạm vi chi nhánh phục vụ
    uint256 internal constant MODULE_METRICS = 9;

    uint8 internal constant WALLET = 8;

    /// @notice CASH(1) → 0, TRANSFER(2) → 1, CARD(4) → 2; mọi giá trị khác revert.
    function methodIndex(uint8 method) internal pure returns (uint256) {
        if (method == 1) return 0;
        if (method == 2) return 1;
        if (method == 4) return 2;
        revert InvalidMethod(method);
    }

    /// @notice Ngày kinh doanh = floor((ts + tz·60) / 86400), tính bằng int256 để múi giờ âm an toàn.
    function day(uint256 ts, int16 tzMinutes) internal pure returns (uint32) {
        // casting to 'int256' is safe because ts is a block timestamp (far below 2^255)
        // forge-lint: disable-next-line(unsafe-typecast)
        int256 local = int256(ts) + int256(tzMinutes) * 60;
        // casting to 'uint256' is safe because local >= 0 for any timestamp after 1970-01-02
        // forge-lint: disable-next-line(unsafe-typecast)
        if (local < 0) return 0;
        // forge-lint: disable-next-line(unsafe-typecast)
        return uint32(uint256(local) / 1 days);
    }
}
