# BranchDashboard — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/shared/BranchDashboard.sol`. Layout đầy đủ: `../../layout/BranchDashboard.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `moduleRegistry` | `contract BranchModuleRegistry` | scalar | BranchDashboard |
| 1 | 0 | `accessManager` | `contract IBranchAccessManager` | scalar | BranchDashboard |
| 2 | 0 | `netCafeFactory` | `contract NetCafeV3Factory` | scalar | BranchDashboard |
| 3 | 0 | `iqrFactory` | `contract IBranchDashboardIqrFactoryRead` | scalar | BranchDashboard |
| 4 | 0 | `__gap` | `uint256[44]` | gap | BranchDashboard |
