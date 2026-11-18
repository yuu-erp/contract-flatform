# NetCafeSessionV3 — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/net_repo/contracts/v3/NetCafeSessionV3.sol`. Layout đầy đủ: `../../layout/NetCafeSessionV3.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `agent` | `address` | scalar | NetCafeSessionV3 |
| 1 | 0 | `branchId` | `uint256` | scalar | NetCafeSessionV3 |
| 2 | 0 | `moduleRegistry` | `contract IBranchModuleRegistryV3` | scalar | NetCafeSessionV3 |
| 3 | 0 | `accessManager` | `contract IBranchAccessManagerV3` | scalar | NetCafeSessionV3 |
| 4 | 0 | `netCafeFactory` | `address` | scalar | NetCafeSessionV3 |
| 5 | 0 | `__gap` | `uint256[44]` | gap | NetCafeSessionV3 |
| 49 | 0 | `sessions` | `mapping(address => struct NetCafeSessionV3.Session)` | mapping | NetCafeSessionV3 |
| 50 | 0 | `activeSessionOfUser` | `mapping(address => address)` | mapping | NetCafeSessionV3 |
| 51 | 0 | `pcHasActiveSession` | `mapping(bytes32 => bool)` | mapping | NetCafeSessionV3 |
| 52 | 0 | `machineSession` | `mapping(bytes32 => address)` | mapping | NetCafeSessionV3 |
| 53 | 0 | `totalSessionsByUser` | `mapping(address => uint256)` | mapping | NetCafeSessionV3 |
| 54 | 0 | `dailyUsageSeconds` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 55 | 0 | `dailyUsageRevenue` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 56 | 0 | `dailySessionCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 57 | 0 | `dailyActiveUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 58 | 0 | `dailyReturningUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 59 | 0 | `dailyActiveUserSeen` | `mapping(uint256 => mapping(address => bool))` | mapping | NetCafeSessionV3 |
| 60 | 0 | `dailyReturningUserSeen` | `mapping(uint256 => mapping(address => bool))` | mapping | NetCafeSessionV3 |
| 61 | 0 | `monthlyUsageSeconds` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 62 | 0 | `monthlyUsageRevenue` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 63 | 0 | `monthlySessionCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 64 | 0 | `monthlyActiveUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 65 | 0 | `monthlyReturningUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 66 | 0 | `monthlyActiveUserSeen` | `mapping(uint256 => mapping(address => bool))` | mapping | NetCafeSessionV3 |
| 67 | 0 | `monthlyReturningUserSeen` | `mapping(uint256 => mapping(address => bool))` | mapping | NetCafeSessionV3 |
| 68 | 0 | `yearlyUsageSeconds` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 69 | 0 | `yearlyUsageRevenue` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 70 | 0 | `yearlySessionCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 71 | 0 | `yearlyActiveUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 72 | 0 | `yearlyReturningUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 73 | 0 | `yearlyActiveUserSeen` | `mapping(uint256 => mapping(address => bool))` | mapping | NetCafeSessionV3 |
| 74 | 0 | `yearlyReturningUserSeen` | `mapping(uint256 => mapping(address => bool))` | mapping | NetCafeSessionV3 |
| 75 | 0 | `userContract` | `contract INetCafeUserReadV3` | scalar | NetCafeSessionV3 |
| 76 | 0 | `managementContract` | `contract INetCafeManagementReadV3` | scalar | NetCafeSessionV3 |
| 77 | 0 | `stationContract` | `contract INetCafeStationNotifyV3` | scalar | NetCafeSessionV3 |
| 78 | 0 | `economyVault` | `contract IEconomyVaultV3` | scalar | NetCafeSessionV3 |
| 79 | 0 | `loyaltyPoints` | `contract IPoint` | scalar | NetCafeSessionV3 |
| 80 | 0 | `dailyActiveUserList` | `mapping(uint256 => address[])` | mapping | NetCafeSessionV3 |
| 81 | 0 | `hourlyUsageSeconds` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 82 | 0 | `hourlyUsageRevenue` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 83 | 0 | `dashboardOnlineStationSeen` | `mapping(bytes32 => mapping(bytes32 => bool))` | mapping | NetCafeSessionV3 |
| 84 | 0 | `dashboardOnlineStationCount` | `mapping(bytes32 => uint256)` | mapping | NetCafeSessionV3 |
| 85 | 0 | `dailyUsageByHour` | `mapping(uint256 => mapping(uint8 => uint256))` | mapping | NetCafeSessionV3 |
| 86 | 0 | `monthlyUsageByHour` | `mapping(uint256 => mapping(uint8 => uint256))` | mapping | NetCafeSessionV3 |
| 87 | 0 | `yearlyUsageByHour` | `mapping(uint256 => mapping(uint8 => uint256))` | mapping | NetCafeSessionV3 |
| 88 | 0 | `weeklyActiveUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 89 | 0 | `weeklyReturningUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 90 | 0 | `weeklyUserCacheReady` | `mapping(uint256 => bool)` | mapping | NetCafeSessionV3 |
| 91 | 0 | `weeklyActiveUserSeen` | `mapping(uint256 => mapping(address => bool))` | mapping | NetCafeSessionV3 |
| 92 | 0 | `weeklyReturningUserSeen` | `mapping(uint256 => mapping(address => bool))` | mapping | NetCafeSessionV3 |
| 93 | 0 | `lastActiveDay` | `mapping(address => uint256)` | mapping | NetCafeSessionV3 |
| 94 | 0 | `dailyRetainedUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 95 | 0 | `weeklyRetainedUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 96 | 0 | `monthlyRetainedUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 97 | 0 | `yearlyRetainedUsersCount` | `mapping(uint256 => uint256)` | mapping | NetCafeSessionV3 |
| 98 | 0 | `__gap` | `uint256[50]` | gap | NetCafeSessionV3 |
