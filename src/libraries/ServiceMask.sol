// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title ServiceMask
/// @notice Bitmask module dùng chung: NET = 1, IQR = 2, LOYALTY = 4.
///         Một tập hợp lệ khác 0, chỉ gồm các bit đã biết, và có LOYALTY thì phải có NET hoặc IQR.
library ServiceMask {
    /// @dev Một lần migrateAllowedServices. Script nâng cấp dùng cùng hằng, vì reinitializer chỉ chạy một lần.
    uint256 internal constant MAX_MIGRATE = 200;
    uint16 internal constant NET = 1;
    uint16 internal constant IQR = 2;
    uint16 internal constant LOYALTY = 4;
    uint16 internal constant ALL = 7;

    function isValid(uint16 services) internal pure returns (bool) {
        if (services == 0 || services & ~ALL != 0) return false;
        if (services & LOYALTY != 0 && services & (NET | IQR) == 0) return false;
        return true;
    }

    /// @dev `services` không được bật bit nào nằm ngoài `allowed`.
    function within(uint16 services, uint16 allowed) internal pure returns (bool) {
        return services & ~allowed == 0;
    }
}
