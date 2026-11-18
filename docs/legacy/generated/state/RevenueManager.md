# RevenueManager — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/system/RevenueManager.sol`. Layout đầy đủ: `../../layout/RevenueManager.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `version` | `string` | scalar | RevenueManager |
| 1 | 0 | `agentRevenues` | `mapping(address => struct AgentRevenue)` | mapping | RevenueManager |
| 2 | 0 | `agentList` | `address[]` | mảng | RevenueManager |
| 3 | 0 | `revenueRecords` | `struct RevenueRecord[]` | mảng | RevenueManager |
| 4 | 0 | `systemRevenue` | `struct Revenue` | struct | RevenueManager |
| 8 | 0 | `dailyRevenue` | `mapping(uint256 => struct Revenue)` | mapping | RevenueManager |
| 9 | 0 | `monthlyRevenue` | `mapping(uint256 => struct Revenue)` | mapping | RevenueManager |
| 10 | 0 | `yearlyRevenue` | `mapping(uint256 => struct Revenue)` | mapping | RevenueManager |
| 11 | 0 | `enhancedAgent` | `address` | scalar | RevenueManager |
| 12 | 0 | `__gap` | `uint256[50]` | gap | RevenueManager |
