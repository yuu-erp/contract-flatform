# NetCafeStationV3 — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/net_repo/contracts/v3/NetCafeStationV3.sol`. Layout đầy đủ: `../../layout/NetCafeStationV3.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `agent` | `address` | scalar | NetCafeStationV3 |
| 1 | 0 | `branchId` | `uint256` | scalar | NetCafeStationV3 |
| 2 | 0 | `moduleRegistry` | `contract IBranchModuleRegistryV3` | scalar | NetCafeStationV3 |
| 3 | 0 | `accessManager` | `contract IBranchAccessManagerV3` | scalar | NetCafeStationV3 |
| 4 | 0 | `netCafeFactory` | `address` | scalar | NetCafeStationV3 |
| 5 | 0 | `__gap` | `uint256[44]` | gap | NetCafeStationV3 |
| 49 | 0 | `onlineStationCount` | `uint256` | scalar | NetCafeStationV3 |
| 50 | 0 | `stations` | `mapping(bytes32 => struct NetCafeStationV3.Station)` | mapping | NetCafeStationV3 |
| 51 | 0 | `userToPcId` | `mapping(address => bytes32)` | mapping | NetCafeStationV3 |
| 52 | 0 | `userContract` | `contract INetCafeUserProfileV3` | scalar | NetCafeStationV3 |
| 53 | 0 | `sessionContract` | `contract INetCafeSessionReadV3` | scalar | NetCafeStationV3 |
| 54 | 0 | `managementContract` | `contract INetCafeManagementMetaV3` | scalar | NetCafeStationV3 |
| 55 | 0 | `economyVault` | `contract IEconomyVaultV3` | scalar | NetCafeStationV3 |
| 56 | 0 | `lastHeartbeatAt` | `mapping(bytes32 => uint256)` | mapping | NetCafeStationV3 |
| 57 | 0 | `__gap` | `uint256[41]` | gap | NetCafeStationV3 |
