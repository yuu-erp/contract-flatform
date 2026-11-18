# NetCafeUserV3 — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/net_repo/contracts/v3/NetCafeUserV3.sol`. Layout đầy đủ: `../../layout/NetCafeUserV3.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `agent` | `address` | scalar | NetCafeUserV3 |
| 1 | 0 | `branchId` | `uint256` | scalar | NetCafeUserV3 |
| 2 | 0 | `moduleRegistry` | `contract IBranchModuleRegistryV3` | scalar | NetCafeUserV3 |
| 3 | 0 | `accessManager` | `contract IBranchAccessManagerV3` | scalar | NetCafeUserV3 |
| 4 | 0 | `netCafeFactory` | `address` | scalar | NetCafeUserV3 |
| 5 | 0 | `__gap` | `uint256[44]` | gap | NetCafeUserV3 |
| 49 | 0 | `userList` | `address[]` | mảng | NetCafeUserV3 |
| 50 | 0 | `users` | `mapping(address => struct NetCafeUserV3.User)` | mapping | NetCafeUserV3 |
| 51 | 0 | `walletUsed` | `mapping(address => bool)` | mapping | NetCafeUserV3 |
| 52 | 0 | `phoneUsed` | `mapping(string => bool)` | mapping | NetCafeUserV3 |
| 53 | 0 | `emailUsed` | `mapping(string => bool)` | mapping | NetCafeUserV3 |
| 54 | 0 | `cccdUsed` | `mapping(string => bool)` | mapping | NetCafeUserV3 |
| 55 | 0 | `otpOwner` | `mapping(string => address)` | mapping | NetCafeUserV3 |
| 56 | 0 | `phoneToWallet` | `mapping(string => address)` | mapping | NetCafeUserV3 |
| 57 | 0 | `emailToWallet` | `mapping(string => address)` | mapping | NetCafeUserV3 |
| 58 | 0 | `cccdToWallet` | `mapping(string => address)` | mapping | NetCafeUserV3 |
| 59 | 0 | `usernameToWallet` | `mapping(string => address)` | mapping | NetCafeUserV3 |
| 60 | 0 | `usernameUsed` | `mapping(string => bool)` | mapping | NetCafeUserV3 |
| 61 | 0 | `dailyRegisteredUsers` | `mapping(uint256 => uint256)` | mapping | NetCafeUserV3 |
| 62 | 0 | `monthlyRegisteredUsers` | `mapping(uint256 => uint256)` | mapping | NetCafeUserV3 |
| 63 | 0 | `yearlyRegisteredUsers` | `mapping(uint256 => uint256)` | mapping | NetCafeUserV3 |
| 64 | 0 | `dailyTotalUsers` | `mapping(uint256 => uint256)` | mapping | NetCafeUserV3 |
| 65 | 0 | `yearlyTotalUsers` | `mapping(uint256 => uint256)` | mapping | NetCafeUserV3 |
| 66 | 0 | `sessionContract` | `contract INetCafeSessionOpenV3` | scalar | NetCafeUserV3 |
| 67 | 0 | `economyVault` | `contract IEconomyVaultV3` | scalar | NetCafeUserV3 |
| 68 | 0 | `loyaltyPoints` | `contract IPoint` | scalar | NetCafeUserV3 |
| 69 | 0 | `cumulativeRegisteredUsers` | `mapping(uint256 => uint256)` | mapping | NetCafeUserV3 |
| 70 | 0 | `totalUserSnapshotDaySeen` | `mapping(uint256 => bool)` | mapping | NetCafeUserV3 |
| 71 | 0 | `totalUserSnapshotDays` | `uint256[]` | mảng | NetCafeUserV3 |
| 72 | 0 | `userIndexPlusOne` | `mapping(address => uint256)` | mapping | NetCafeUserV3 |
| 73 | 0 | `__gap` | `uint256[38]` | gap | NetCafeUserV3 |
