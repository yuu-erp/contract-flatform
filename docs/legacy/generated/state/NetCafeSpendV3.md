# NetCafeSpendV3 — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/net_repo/contracts/v3/NetCafeSpendV3.sol`. Layout đầy đủ: `../../layout/NetCafeSpendV3.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `agent` | `address` | scalar | NetCafeSpendV3 |
| 1 | 0 | `branchId` | `uint256` | scalar | NetCafeSpendV3 |
| 2 | 0 | `moduleRegistry` | `contract IBranchModuleRegistryV3` | scalar | NetCafeSpendV3 |
| 3 | 0 | `accessManager` | `contract IBranchAccessManagerV3` | scalar | NetCafeSpendV3 |
| 4 | 0 | `netCafeFactory` | `address` | scalar | NetCafeSpendV3 |
| 5 | 0 | `__gap` | `uint256[44]` | gap | NetCafeSpendV3 |
| 49 | 0 | `economyVault` | `contract IEconomyVaultV3` | scalar | NetCafeSpendV3 |
| 50 | 0 | `loyaltyPoints` | `contract IPoint` | scalar | NetCafeSpendV3 |
| 51 | 0 | `spendCounter` | `uint256` | scalar | NetCafeSpendV3 |
| 52 | 0 | `spendHistories` | `mapping(uint256 => struct NetCafeSpendV3.SpendHistory)` | mapping | NetCafeSpendV3 |
| 53 | 0 | `spendHistoryOfUser` | `mapping(address => uint256[])` | mapping | NetCafeSpendV3 |
| 54 | 0 | `dailyManualRevenue` | `mapping(uint256 => uint256)` | mapping | NetCafeSpendV3 |
| 55 | 0 | `monthlyManualRevenue` | `mapping(uint256 => uint256)` | mapping | NetCafeSpendV3 |
| 56 | 0 | `yearlyManualRevenue` | `mapping(uint256 => uint256)` | mapping | NetCafeSpendV3 |
| 57 | 0 | `__gap` | `uint256[42]` | gap | NetCafeSpendV3 |
