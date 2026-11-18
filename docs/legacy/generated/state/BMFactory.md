# BMFactory — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/branch/BMFactory.sol`. Layout đầy đủ: `../../layout/BMFactory.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `branchManagementBeacon` | `contract UpgradeableBeacon` | scalar | BMFactory |
| 1 | 0 | `agentBranchManagement` | `mapping(address => address)` | mapping | BMFactory |
| 2 | 0 | `enhancedAgent` | `address` | scalar | BMFactory |
| 3 | 0 | `BRANCH_MANAGEMENT_IMP` | `address` | scalar | BMFactory |
| 4 | 0 | `HISTORY_TRACKING_IMP` | `address` | scalar | BMFactory |
| 5 | 0 | `freeGasSc` | `address` | scalar | BMFactory |
| 6 | 0 | `StaffAgentStore` | `address` | scalar | BMFactory |
| 7 | 0 | `iqrFactory` | `address` | scalar | BMFactory |
| 8 | 0 | `netCafeFactory` | `address` | scalar | BMFactory |
| 9 | 0 | `robotFactory` | `address` | scalar | BMFactory |
| 10 | 0 | `__gap` | `uint256[47]` | gap | BMFactory |
