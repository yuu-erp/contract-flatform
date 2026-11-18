# NetCafeDashboardV3 — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/net_repo/contracts/v3/NetCafeDashboardV3.sol`. Layout đầy đủ: `../../layout/NetCafeDashboardV3.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `agent` | `address` | scalar | NetCafeDashboardV3 |
| 1 | 0 | `branchId` | `uint256` | scalar | NetCafeDashboardV3 |
| 2 | 0 | `moduleRegistry` | `contract IBranchModuleRegistryV3` | scalar | NetCafeDashboardV3 |
| 3 | 0 | `accessManager` | `contract IBranchAccessManagerV3` | scalar | NetCafeDashboardV3 |
| 4 | 0 | `netCafeFactory` | `address` | scalar | NetCafeDashboardV3 |
| 5 | 0 | `__gap` | `uint256[44]` | gap | NetCafeDashboardV3 |
| 49 | 0 | `gameUsages` | `mapping(bytes32 => struct NetCafeDashboardV3.GameUsage)` | mapping | NetCafeDashboardV3 |
| 50 | 0 | `gameUsageIds` | `bytes32[]` | mảng | NetCafeDashboardV3 |
| 51 | 0 | `dailyGamePlayCounts` | `mapping(uint256 => mapping(bytes32 => uint256))` | mapping | NetCafeDashboardV3 |
| 52 | 0 | `monthlyGamePlayCounts` | `mapping(uint256 => mapping(bytes32 => uint256))` | mapping | NetCafeDashboardV3 |
| 53 | 0 | `yearlyGamePlayCounts` | `mapping(uint256 => mapping(bytes32 => uint256))` | mapping | NetCafeDashboardV3 |
| 54 | 0 | `dailyGamePlaySeconds` | `mapping(uint256 => mapping(bytes32 => uint256))` | mapping | NetCafeDashboardV3 |
| 55 | 0 | `monthlyGamePlaySeconds` | `mapping(uint256 => mapping(bytes32 => uint256))` | mapping | NetCafeDashboardV3 |
| 56 | 0 | `yearlyGamePlaySeconds` | `mapping(uint256 => mapping(bytes32 => uint256))` | mapping | NetCafeDashboardV3 |
| 57 | 0 | `weeklyGamePlayCounts` | `mapping(uint256 => mapping(bytes32 => uint256))` | mapping | NetCafeDashboardV3 |
| 58 | 0 | `weeklyGamePlaySeconds` | `mapping(uint256 => mapping(bytes32 => uint256))` | mapping | NetCafeDashboardV3 |
| 59 | 0 | `periodGameCounts` | `mapping(uint8 => mapping(uint256 => uint256))` | mapping | NetCafeDashboardV3 |
| 60 | 0 | `popularGameIds` | `mapping(uint8 => mapping(uint256 => bytes32[]))` | mapping | NetCafeDashboardV3 |
| 61 | 0 | `popularGameCacheReady` | `mapping(uint8 => mapping(uint256 => bool))` | mapping | NetCafeDashboardV3 |
| 62 | 0 | `popularCacheInitialized` | `bool` | scalar | NetCafeDashboardV3 |
| 63 | 0 | `__gap` | `uint256[40]` | gap | NetCafeDashboardV3 |
