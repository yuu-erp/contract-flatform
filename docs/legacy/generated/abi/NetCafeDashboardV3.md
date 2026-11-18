# NetCafeDashboardV3 — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (37)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MODULE_NET()` | `27a29fec` | đọc (view) | `bytes32` |
| `PERM_NET_ADMIN()` | `7e882a8e` | đọc (view) | `bytes32` |
| `PERM_NET_PAYMENT_MANAGE()` | `d209430a` | đọc (view) | `bytes32` |
| `PERM_NET_SESSION_MANAGE()` | `474e1a90` | đọc (view) | `bytes32` |
| `PERM_NET_SPEND_VIEW()` | `513f3574` | đọc (view) | `bytes32` |
| `PERM_NET_STATION_MANAGE()` | `8dd5009c` | đọc (view) | `bytes32` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `getDashboardMachineTrendDay(address,address,uint256)` | `5885560a` | đọc (view) | `tuple` |
| `getDashboardMachineTrendMonth(address,address,uint256)` | `d3523b22` | đọc (view) | `tuple` |
| `getDashboardMachineTrendWeek(address,address,uint256,uint256)` | `f6d7cb3d` | đọc (view) | `tuple` |
| `getDashboardMachineTrendYear(address,address,uint256)` | `81d79d62` | đọc (view) | `tuple` |
| `getDashboardMachineUsageSummaryDay(address,address,uint256)` | `b02e76c2` | đọc (view) | `tuple` |
| `getDashboardMachineUsageSummaryMonth(address,address,uint256)` | `fac9297c` | đọc (view) | `tuple` |
| `getDashboardMachineUsageSummaryWeek(address,address,uint256,uint256)` | `8b5e578d` | đọc (view) | `tuple` |
| `getDashboardMachineUsageSummaryYear(address,address,uint256)` | `47b650d1` | đọc (view) | `tuple` |
| `getDashboardMonthOverview(address,address,address,address,uint256)` | `72756e02` | đọc (view) | `tuple` |
| `getDashboardOverview(address,address,address,address,uint256)` | `ff5afe54` | đọc (view) | `tuple` |
| `getDashboardWeekOverviewByDays(address,address,address,address,uint256,uint256)` | `f827b94e` | đọc (view) | `tuple` |
| `getDashboardYearOverview(address,address,address,address,uint256)` | `dad454e1` | đọc (view) | `tuple` |
| `getGamePlayCount(string)` | `12ff2b87` | đọc (view) | `uint256` |
| `getGameUsage(bytes32)` | `c0358279` | đọc (view) | `tuple` |
| `getGameUsagesPaged(uint256,uint256)` | `0c404c7e` | đọc (view) | `tuple[],uint256` |
| `getPopularGamesByDay(uint256)` | `9a872c7f` | đọc (view) | `tuple[],uint256` |
| `getPopularGamesByMonth(uint256)` | `8249c62e` | đọc (view) | `tuple[],uint256` |
| `getPopularGamesByWeek(uint256,uint256)` | `fd5faa02` | đọc (view) | `tuple[],uint256` |
| `getPopularGamesByYear(uint256)` | `4ae7a53d` | đọc (view) | `tuple[],uint256` |
| `initialize(address,address,uint256,address,address)` | `33e1a223` | ghi (nonpayable) | `` |
| `moduleRegistry()` | `b95459e4` | đọc (view) | `address` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `recordGamePlay(string)` | `7e95567d` | ghi (nonpayable) | `uint256` |
| `recordGamePlayWithDuration(string,uint256)` | `33c7505b` | ghi (nonpayable) | `uint256` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setSharedRegistries(address,address)` | `a6c4d3e9` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |

## Event (4)

| Event |
|---|
| `GamePlayRecorded(bytes32,string,uint256,address)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `SharedRegistryUpdated(address,address,address)` |
