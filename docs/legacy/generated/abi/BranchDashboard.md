# BranchDashboard — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (50)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `PERM_BRANCH_DASHBOARD_VIEW()` | `f8c662d3` | đọc (view) | `bytes32` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `getBranchCustomRangeOverviewByDays(address,uint256,uint256,uint256)` | `55c00cca` | đọc (view) | `tuple` |
| `getBranchDayActiveUsers(address,uint256,uint256,uint256,uint256)` | `85bd7815` | đọc (view) | `address[]` |
| `getBranchGamePlayCount(address,uint256,string)` | `3eef0de3` | đọc (view) | `uint256` |
| `getBranchGameUsage(address,uint256,bytes32)` | `ef5e57e7` | đọc (view) | `tuple` |
| `getBranchGameUsagesPaged(address,uint256,uint256,uint256)` | `0c53f7d4` | đọc (view) | `tuple[],uint256` |
| `getBranchMachineTrendDay(address,uint256,uint256)` | `a020295a` | đọc (view) | `tuple` |
| `getBranchMachineTrendMonth(address,uint256,uint256)` | `0cd8e941` | đọc (view) | `tuple` |
| `getBranchMachineTrendWeek(address,uint256,uint256,uint256)` | `b8fc3e04` | đọc (view) | `tuple` |
| `getBranchMachineTrendYear(address,uint256,uint256)` | `9e2522cc` | đọc (view) | `tuple` |
| `getBranchMachineUsageSummaryDay(address,uint256,uint256)` | `b89b43b4` | đọc (view) | `tuple` |
| `getBranchMachineUsageSummaryMonth(address,uint256,uint256)` | `2b8cb52a` | đọc (view) | `tuple` |
| `getBranchMachineUsageSummaryWeek(address,uint256,uint256,uint256)` | `8318cbb2` | đọc (view) | `tuple` |
| `getBranchMachineUsageSummaryYear(address,uint256,uint256)` | `ff590bae` | đọc (view) | `tuple` |
| `getBranchModules(address,uint256)` | `cd471ede` | đọc (view) | `tuple` |
| `getBranchMonthOverview(address,uint256,uint256)` | `57aa840a` | đọc (view) | `tuple` |
| `getBranchOverview(address,uint256,uint256)` | `17702372` | đọc (view) | `tuple` |
| `getBranchPopularGamesByDay(address,uint256,uint256)` | `38c760ab` | đọc (view) | `tuple[],uint256` |
| `getBranchPopularGamesByMonth(address,uint256,uint256)` | `f449fccd` | đọc (view) | `tuple[],uint256` |
| `getBranchPopularGamesByWeek(address,uint256,uint256,uint256)` | `567e97f9` | đọc (view) | `tuple[],uint256` |
| `getBranchPopularGamesByYear(address,uint256,uint256)` | `0397070b` | đọc (view) | `tuple[],uint256` |
| `getBranchRawMetrics(address,uint256,uint8,uint256,uint256)` | `ac9f2f59` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `getBranchServiceDayOverviewByKey(address,uint256,uint256)` | `1d13e3f6` | đọc (view) | `tuple` |
| `getBranchServiceMonthOverviewByKey(address,uint256,uint256)` | `cb7e45e2` | đọc (view) | `tuple` |
| `getBranchServiceWeekOverviewByKeys(address,uint256,uint256,uint256)` | `9ef8b6df` | đọc (view) | `tuple` |
| `getBranchServiceYearOverviewByKey(address,uint256,uint256)` | `a9a977f7` | đọc (view) | `tuple` |
| `getBranchTopDishesByDay(address,uint256,uint256)` | `c5fec6d0` | đọc (view) | `tuple[]` |
| `getBranchTopDishesByMonth(address,uint256,uint256)` | `705df2ed` | đọc (view) | `tuple[]` |
| `getBranchTopDishesByWeek(address,uint256,uint256,uint256)` | `ea2b2806` | đọc (view) | `tuple[]` |
| `getBranchTopDishesByYear(address,uint256,uint256)` | `04b9be9c` | đọc (view) | `tuple[]` |
| `getBranchUsageTrendDay(address,uint256,uint256)` | `d892a86d` | đọc (view) | `tuple` |
| `getBranchUsageTrendMonth(address,uint256,uint256)` | `2a01b1ec` | đọc (view) | `tuple` |
| `getBranchUsageTrendWeek(address,uint256,uint256,uint256)` | `7833b0a9` | đọc (view) | `tuple` |
| `getBranchUsageTrendYear(address,uint256,uint256)` | `f90ba132` | đọc (view) | `tuple` |
| `getBranchWeekOverviewByDays(address,uint256,uint256,uint256)` | `ac014564` | đọc (view) | `tuple` |
| `getBranchYearOverview(address,uint256,uint256)` | `69a742b5` | đọc (view) | `tuple` |
| `initialize(address,address,address,address,address)` | `1459457a` | ghi (nonpayable) | `` |
| `iqrFactory()` | `f7fbbfcb` | đọc (view) | `address` |
| `moduleRegistry()` | `b95459e4` | đọc (view) | `address` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `recordBranchGamePlay(address,uint256,string)` | `d499c508` | ghi (nonpayable) | `uint256` |
| `recordBranchGamePlayWithDuration(address,uint256,string,uint256)` | `4ae1f952` | ghi (nonpayable) | `uint256` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setSharedContracts(address,address,address,address)` | `3a373627` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (3)

| Event |
|---|
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
