# AgentIQR — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/iqr/AgentIQR.sol`. Layout đầy đủ: `../../layout/AgentIQR.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `ManagementBeacon` | `contract UpgradeableBeacon` | scalar | AgentIQR |
| 1 | 0 | `OrderBeacon` | `contract UpgradeableBeacon` | scalar | AgentIQR |
| 2 | 0 | `ReportBeacon` | `contract UpgradeableBeacon` | scalar | AgentIQR |
| 3 | 0 | `TimekeepingBeacon` | `contract UpgradeableBeacon` | scalar | AgentIQR |
| 4 | 0 | `agent` | `address` | scalar | AgentIQR |
| 5 | 0 | `branchId` | `uint256` | scalar | AgentIQR |
| 6 | 0 | `totalOrders` | `uint256` | scalar | AgentIQR |
| 7 | 0 | `totalRevenue` | `uint256` | scalar | AgentIQR |
| 8 | 0 | `completedOrders` | `uint256` | scalar | AgentIQR |
| 9 | 0 | `isActive` | `bool` | scalar | AgentIQR |
| 9 | 1 | `branchResourceRegistry` | `address` | scalar | AgentIQR |
| 10 | 0 | `branchPaymentRegistry` | `address` | scalar | AgentIQR |
| 11 | 0 | `orders` | `mapping(bytes32 => struct AgentOrder)` | mapping | AgentIQR |
| 12 | 0 | `orderIds` | `bytes32[]` | mảng | AgentIQR |
| 13 | 0 | `ORDER` | `address` | scalar | AgentIQR |
| 14 | 0 | `MANAGEMENT` | `address` | scalar | AgentIQR |
| 15 | 0 | `mAgentToIQR` | `mapping(address => mapping(uint256 => struct IQRContracts))` | mapping | AgentIQR |
| 16 | 0 | `enhancedAgent` | `address` | scalar | AgentIQR |
| 17 | 0 | `iqrFactory` | `address` | scalar | AgentIQR |
| 18 | 0 | `revenueManager` | `address` | scalar | AgentIQR |
| 19 | 0 | `__gap` | `uint256[47]` | gap | AgentIQR |
