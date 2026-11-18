# AgentModuleProvisioner — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/shared/AgentModuleProvisioner.sol`. Layout đầy đủ: `../../layout/AgentModuleProvisioner.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `moduleRegistry` | `contract BranchModuleRegistry` | scalar | AgentModuleProvisioner |
| 1 | 0 | `economyVault` | `contract EconomyVault` | scalar | AgentModuleProvisioner |
| 2 | 0 | `netCafeFactory` | `contract NetCafeV3Factory` | scalar | AgentModuleProvisioner |
| 3 | 0 | `accessManager` | `contract IBranchAccessManager` | scalar | AgentModuleProvisioner |
| 4 | 0 | `branchAuditTrail` | `contract IBranchAuditTrail` | scalar | AgentModuleProvisioner |
| 5 | 0 | `provisioners` | `mapping(address => bool)` | mapping | AgentModuleProvisioner |
| 6 | 0 | `__gap` | `uint256[43]` | gap | AgentModuleProvisioner |
