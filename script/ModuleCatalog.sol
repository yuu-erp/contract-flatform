// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Registry} from "../src/kernel/registry/Registry.sol";

/// @notice Khai báo module mặc định khi deploy (ADR 0030). Đây là nơi duy nhất ngoài module biết tên module:
///         script vận hành (T4), không phải contract nền tảng.
///         0 nền tảng; 1 NET (bán hàng, giá bắt buộc gồm thuế); 2 IQR (bán hàng); 3 Loyalty (cần NET hoặc IQR).
///         Danh mục quyền nền tảng (module 0): docs/modules/shared-permission-duty.md mục 1. NET/IQR/Loyalty = 0,
///         điền khi đặc tả từng module (`updateModule`).
library ModuleCatalog {
    uint16 internal constant NET_BIT = 1;
    uint16 internal constant IQR_BIT = 2;
    uint64 internal constant CORE_PERMS = 0x7FF; // bit 0..10
    uint64 internal constant CORE_MANAGER_ONLY = 0x700; // bit 8 hoàn tiền, 9 chặn khách, 10 điều chỉnh doanh thu

    /// @dev Người gọi phải là PLATFORM_OWNER (broadcast hoặc prank).
    function registerDefaults(Registry r) internal {
        uint16 sales = r.FLAG_SALES();
        r.registerModule(0, "platform", 0, 0, CORE_PERMS, CORE_MANAGER_ONLY);
        r.registerModule(1, "net", 0, sales | r.FLAG_TAX_INCLUSIVE_ONLY(), 0, 0);
        r.registerModule(2, "iqr", 0, sales, 0, 0);
        r.registerModule(3, "loyalty", NET_BIT | IQR_BIT, 0, 0, 0);
    }
}
