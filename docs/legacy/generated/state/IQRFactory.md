# IQRFactory — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/iqr/IQRFactory.sol`. Layout đầy đủ: `../../layout/IQRFactory.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `version` | `string` | scalar | IQRFactory |
| 1 | 0 | `agentIQRContracts` | `mapping(address => mapping(uint256 => address))` | mapping | IQRFactory |
| 2 | 0 | `agentBranchManagement` | `mapping(address => address)` | mapping | IQRFactory |
| 3 | 0 | `deployedContracts` | `address[]` | mảng | IQRFactory |
| 4 | 0 | `enhancedAgent` | `address` | scalar | IQRFactory |
| 5 | 0 | `MANAGEMENT` | `address` | scalar | IQRFactory |
| 6 | 0 | `ORDER` | `address` | scalar | IQRFactory |
| 7 | 0 | `REPORT` | `address` | scalar | IQRFactory |
| 8 | 0 | `TIMEKEEPING` | `address` | scalar | IQRFactory |
| 9 | 0 | `cardVisa` | `address` | scalar | IQRFactory |
| 10 | 0 | `noti` | `address` | scalar | IQRFactory |
| 11 | 0 | `revenueManager` | `address` | scalar | IQRFactory |
| 12 | 0 | `StaffAgentStore` | `address` | scalar | IQRFactory |
| 13 | 0 | `POINTS` | `address` | scalar | IQRFactory |
| 14 | 0 | `branchAccessManager` | `address` | scalar | IQRFactory |
| 15 | 0 | `branchResourceRegistry` | `address` | scalar | IQRFactory |
| 16 | 0 | `branchPaymentRegistry` | `address` | scalar | IQRFactory |
| 17 | 0 | `freeGasSc` | `address` | scalar | IQRFactory |
| 18 | 0 | `ManagementBeacon` | `contract UpgradeableBeacon` | scalar | IQRFactory |
| 19 | 0 | `OrderBeacon` | `contract UpgradeableBeacon` | scalar | IQRFactory |
| 20 | 0 | `ReportBeacon` | `contract UpgradeableBeacon` | scalar | IQRFactory |
| 21 | 0 | `TimekeepingBeacon` | `contract UpgradeableBeacon` | scalar | IQRFactory |
| 22 | 0 | `isAdminIqr` | `mapping(address => bool)` | mapping | IQRFactory |
| 23 | 0 | `lastUpdateIqr` | `struct LastUpdateData` | struct | IQRFactory |
| 25 | 0 | `AgentIqrBeacon` | `contract UpgradeableBeacon` | scalar | IQRFactory |
| 26 | 0 | `__gap` | `uint256[45]` | gap | IQRFactory |
