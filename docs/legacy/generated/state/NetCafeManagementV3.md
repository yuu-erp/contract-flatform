# NetCafeManagementV3 — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/net_repo/contracts/v3/NetCafeManagementV3.sol`. Layout đầy đủ: `../../layout/NetCafeManagementV3.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `agent` | `address` | scalar | NetCafeManagementV3 |
| 1 | 0 | `branchId` | `uint256` | scalar | NetCafeManagementV3 |
| 2 | 0 | `moduleRegistry` | `contract IBranchModuleRegistryV3` | scalar | NetCafeManagementV3 |
| 3 | 0 | `accessManager` | `contract IBranchAccessManagerV3` | scalar | NetCafeManagementV3 |
| 4 | 0 | `netCafeFactory` | `address` | scalar | NetCafeManagementV3 |
| 5 | 0 | `__gap` | `uint256[44]` | gap | NetCafeManagementV3 |
| 49 | 0 | `stationIds` | `bytes32[]` | mảng | NetCafeManagementV3 |
| 50 | 0 | `stations` | `mapping(bytes32 => struct NetCafeManagementV3.StationMeta)` | mapping | NetCafeManagementV3 |
| 51 | 0 | `groupIds` | `bytes32[]` | mảng | NetCafeManagementV3 |
| 52 | 0 | `groups` | `mapping(bytes32 => struct NetCafeManagementV3.Group)` | mapping | NetCafeManagementV3 |
| 53 | 0 | `pricePolicyIds` | `bytes32[]` | mảng | NetCafeManagementV3 |
| 54 | 0 | `pricePolicies` | `mapping(bytes32 => struct NetCafeManagementV3.PricePolicy)` | mapping | NetCafeManagementV3 |
| 55 | 0 | `stationInGroup` | `mapping(bytes32 => mapping(bytes32 => bool))` | mapping | NetCafeManagementV3 |
| 56 | 0 | `coOwners` | `mapping(address => bool)` | mapping | NetCafeManagementV3 |
| 57 | 0 | `resourceRegistry` | `contract IBranchResourceRegistryV3` | scalar | NetCafeManagementV3 |
| 58 | 0 | `wifiInfo` | `struct NetCafeManagementV3.WifiInfo` | struct | NetCafeManagementV3 |
| 62 | 0 | `__gap` | `uint256[40]` | gap | NetCafeManagementV3 |
