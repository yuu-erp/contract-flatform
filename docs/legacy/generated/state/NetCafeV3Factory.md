# NetCafeV3Factory — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/net_repo/contracts/v3/NetCafeV3Factory.sol`. Layout đầy đủ: `../../layout/NetCafeV3Factory.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `sharedRegistries` | `struct NetCafeV3Factory.SharedRegistries` | struct | NetCafeV3Factory |
| 5 | 0 | `userBeacon` | `contract UpgradeableBeacon` | scalar | NetCafeV3Factory |
| 6 | 0 | `managementBeacon` | `contract UpgradeableBeacon` | scalar | NetCafeV3Factory |
| 7 | 0 | `sessionBeacon` | `contract UpgradeableBeacon` | scalar | NetCafeV3Factory |
| 8 | 0 | `topUpBeacon` | `contract UpgradeableBeacon` | scalar | NetCafeV3Factory |
| 9 | 0 | `spendBeacon` | `contract UpgradeableBeacon` | scalar | NetCafeV3Factory |
| 10 | 0 | `stationBeacon` | `contract UpgradeableBeacon` | scalar | NetCafeV3Factory |
| 11 | 0 | `moduleProvisioners` | `mapping(address => bool)` | mapping | NetCafeV3Factory |
| 12 | 0 | `_branchContracts` | `mapping(address => mapping(uint256 => struct NetCafeV3Factory.NetCafeV3BranchContracts))` | mapping | NetCafeV3Factory |
| 13 | 0 | `dashboardBeacon` | `contract UpgradeableBeacon` | scalar | NetCafeV3Factory |
| 14 | 0 | `dashboardFacade` | `address` | scalar | NetCafeV3Factory |
| 15 | 0 | `__gap` | `uint256[37]` | gap | NetCafeV3Factory |
