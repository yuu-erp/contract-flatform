# NetCafeSpendV3 — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (34)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MODULE_NET()` | `27a29fec` | đọc (view) | `bytes32` |
| `PERM_NET_ADMIN()` | `7e882a8e` | đọc (view) | `bytes32` |
| `PERM_NET_PAYMENT_MANAGE()` | `d209430a` | đọc (view) | `bytes32` |
| `PERM_NET_SESSION_MANAGE()` | `474e1a90` | đọc (view) | `bytes32` |
| `PERM_NET_SPEND_VIEW()` | `513f3574` | đọc (view) | `bytes32` |
| `PERM_NET_STATION_MANAGE()` | `8dd5009c` | đọc (view) | `bytes32` |
| `REASON_NET_MANUAL_SPEND()` | `90b51856` | đọc (view) | `bytes32` |
| `TOKEN_VND()` | `3985837d` | đọc (view) | `bytes32` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `dailyManualRevenue(uint256)` | `a66f00a5` | đọc (view) | `uint256` |
| `economyVault()` | `00ae9de5` | đọc (view) | `address` |
| `getDashboardDay(uint256)` | `0dc4ad8e` | đọc (view) | `uint256` |
| `getDashboardMonth(uint256)` | `bcd85e82` | đọc (view) | `uint256` |
| `getDashboardYear(uint256)` | `949ecf1c` | đọc (view) | `uint256` |
| `getSpendHistoryPaged(address,uint256,uint256)` | `e36182c2` | đọc (view) | `tuple[]` |
| `initialize(address,address,uint256,address,address,address)` | `ff9935cb` | ghi (nonpayable) | `` |
| `loyaltyPoints()` | `956a20ea` | đọc (view) | `address` |
| `moduleRegistry()` | `b95459e4` | đọc (view) | `address` |
| `monthlyManualRevenue(uint256)` | `a839430e` | đọc (view) | `uint256` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `recordPlayTimeSpend(address,uint256,uint256,uint256,bytes32,uint256)` | `38208085` | ghi (nonpayable) | `uint256` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setEconomyVault(address)` | `c5818c04` | ghi (nonpayable) | `` |
| `setLoyalty(address)` | `e71fb211` | ghi (nonpayable) | `` |
| `setSharedRegistries(address,address)` | `a6c4d3e9` | ghi (nonpayable) | `` |
| `spendCounter()` | `ec623559` | đọc (view) | `uint256` |
| `spendHistories(uint256)` | `9dcf458d` | đọc (view) | `uint256,address,uint256,uint8,uint256,uint256,uint256,bytes32,uint256` |
| `spendHistoryOfUser(address,uint256)` | `67b7d9e8` | đọc (view) | `uint256` |
| `spendVND(address,uint256,bytes32)` | `42d68190` | ghi (nonpayable) | `uint256` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `yearlyManualRevenue(uint256)` | `9cf40cc9` | đọc (view) | `uint256` |

## Event (6)

| Event |
|---|
| `EconomyVaultUpdated(address)` |
| `Initialized(uint64)` |
| `LoyaltyUpdated(address)` |
| `OwnershipTransferred(address,address)` |
| `SharedRegistryUpdated(address,address,address)` |
| `SpendRecorded(uint256,address,uint256,uint8,bytes32,uint256)` |
