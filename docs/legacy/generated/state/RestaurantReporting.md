# RestaurantReporting — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/iqr/RestaurantReporting.sol`. Layout đầy đủ: `../../layout/RestaurantReporting.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `MANAGEMENT` | `contract IManagement` | scalar | RestaurantReporting |
| 1 | 0 | `branchAccessManager` | `contract IBranchAccessManager` | scalar | RestaurantReporting |
| 2 | 0 | `agent` | `address` | scalar | RestaurantReporting |
| 3 | 0 | `branchId` | `uint256` | scalar | RestaurantReporting |
| 4 | 0 | `previousPeriodData` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 5 | 0 | `dishRankingHistory` | `mapping(string => mapping(uint256 => uint256))` | mapping | RestaurantReporting |
| 6 | 0 | `dailyNewCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 7 | 0 | `dailyFemaleCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 8 | 0 | `dailyDineInOrders` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 9 | 0 | `dailyTakeAwayOrders` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 10 | 0 | `dailyDineInRevenue` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 11 | 0 | `dailyTakeAwayRevenue` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 12 | 0 | `dailySingleCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 13 | 0 | `dailyCoupleCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 14 | 0 | `dailyTripleCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 15 | 0 | `dailyGroupCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 16 | 0 | `dailyAgeGroups` | `mapping(uint256 => mapping(uint8 => uint256))` | mapping | RestaurantReporting |
| 17 | 0 | `monthlyAgeGroups` | `mapping(uint256 => mapping(uint8 => uint256))` | mapping | RestaurantReporting |
| 18 | 0 | `dailyServiceRatings` | `mapping(uint256 => mapping(uint8 => uint256))` | mapping | RestaurantReporting |
| 19 | 0 | `dailyFoodRatings` | `mapping(uint256 => mapping(uint8 => uint256))` | mapping | RestaurantReporting |
| 20 | 0 | `monthlyServiceRatings` | `mapping(uint256 => mapping(uint8 => uint256))` | mapping | RestaurantReporting |
| 21 | 0 | `monthlyFoodRatings` | `mapping(uint256 => mapping(uint8 => uint256))` | mapping | RestaurantReporting |
| 22 | 0 | `monthlyNewCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 23 | 0 | `monthlyFemaleCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 24 | 0 | `monthlyDineInOrders` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 25 | 0 | `monthlyTakeAwayOrders` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 26 | 0 | `monthlyDineInRevenue` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 27 | 0 | `monthlyTakeAwayRevenue` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 28 | 0 | `monthlySingleCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 29 | 0 | `monthlyCoupleCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 30 | 0 | `monthlyTripleCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 31 | 0 | `monthlyGroupCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 32 | 0 | `dishRanking` | `mapping(string => uint256)` | mapping | RestaurantReporting |
| 33 | 0 | `dishIsNew` | `mapping(string => bool)` | mapping | RestaurantReporting |
| 34 | 0 | `dishDailyRevenue` | `mapping(string => mapping(uint256 => uint256))` | mapping | RestaurantReporting |
| 35 | 0 | `dishDailyOrders` | `mapping(string => mapping(uint256 => uint256))` | mapping | RestaurantReporting |
| 36 | 0 | `dishMonthlyRevenue` | `mapping(string => mapping(uint256 => uint256))` | mapping | RestaurantReporting |
| 37 | 0 | `dishMonthlyOrders` | `mapping(string => mapping(uint256 => uint256))` | mapping | RestaurantReporting |
| 38 | 0 | `dailyRevenue` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 39 | 0 | `dailyOrders` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 40 | 0 | `dailyCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 41 | 0 | `monthlyRevenue` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 42 | 0 | `monthlyOrders` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 43 | 0 | `monthlyCustomers` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 44 | 0 | `dishTotalRevenue` | `mapping(string => uint256)` | mapping | RestaurantReporting |
| 45 | 0 | `dishTotalOrders` | `mapping(string => uint256)` | mapping | RestaurantReporting |
| 46 | 0 | `dishStartTime` | `mapping(string => uint256)` | mapping | RestaurantReporting |
| 47 | 0 | `totalCustomersAllTime` | `uint256` | scalar | RestaurantReporting |
| 48 | 0 | `totalOrdersAllTime` | `uint256` | scalar | RestaurantReporting |
| 49 | 0 | `totalRevenueAllTime` | `uint256` | scalar | RestaurantReporting |
| 50 | 0 | `serviceStartTime` | `uint256` | scalar | RestaurantReporting |
| 51 | 0 | `mRevenueTarget` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 52 | 0 | `revenueTargets` | `struct Target[]` | mảng | RestaurantReporting |
| 53 | 0 | `yearlyOrders` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 54 | 0 | `yearlyRevenues` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 55 | 0 | `orderCreatedTimes` | `mapping(string => uint256[])` | mapping | RestaurantReporting |
| 56 | 0 | `orderCreatedTimesSet` | `mapping(string => bool)` | mapping | RestaurantReporting |
| 57 | 0 | `dailyReturningCustomersOneTime` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 58 | 0 | `dailyReturningCustomersFromTwoTimes` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 59 | 0 | `monthlyReturningCustomersOneTime` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 60 | 0 | `monthlyReturningCustomersFromTwoTimes` | `mapping(uint256 => uint256)` | mapping | RestaurantReporting |
| 61 | 0 | `dailySoldDishCodes` | `mapping(uint256 => string[])` | mapping | RestaurantReporting |
| 62 | 0 | `dailySoldDishSeen` | `mapping(uint256 => mapping(string => bool))` | mapping | RestaurantReporting |
| 63 | 0 | `dashboardDishYearlyRevenue` | `mapping(string => mapping(uint256 => uint256))` | mapping | RestaurantReporting |
| 64 | 0 | `dashboardDishYearlyOrders` | `mapping(string => mapping(uint256 => uint256))` | mapping | RestaurantReporting |
| 65 | 0 | `dashboardDishMonthlyRevenue` | `mapping(string => mapping(uint256 => uint256))` | mapping | RestaurantReporting |
| 66 | 0 | `dashboardDishMonthlyOrders` | `mapping(string => mapping(uint256 => uint256))` | mapping | RestaurantReporting |
| 67 | 0 | `dashboardDailyTopDishCodes` | `mapping(uint256 => string[])` | mapping | RestaurantReporting |
| 68 | 0 | `dashboardWeeklyTopDishCodes` | `mapping(uint256 => string[])` | mapping | RestaurantReporting |
| 69 | 0 | `dashboardMonthlyTopDishCodes` | `mapping(uint256 => string[])` | mapping | RestaurantReporting |
| 70 | 0 | `dashboardYearlyTopDishCodes` | `mapping(uint256 => string[])` | mapping | RestaurantReporting |
| 71 | 0 | `__gap` | `uint256[42]` | gap | RestaurantReporting |
