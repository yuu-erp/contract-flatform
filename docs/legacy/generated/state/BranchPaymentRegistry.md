# BranchPaymentRegistry — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/shared/BranchPaymentRegistry.sol`. Layout đầy đủ: `../../layout/BranchPaymentRegistry.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `accessManager` | `contract IBranchAccessManager` | scalar | BranchPaymentRegistry |
| 1 | 0 | `accountCounter` | `uint256` | scalar | BranchPaymentRegistry |
| 2 | 0 | `branchAuditTrail` | `contract IBranchAuditTrail` | scalar | BranchPaymentRegistry |
| 3 | 0 | `_accounts` | `mapping(uint256 => struct BranchPaymentRegistry.BankAccount)` | mapping | BranchPaymentRegistry |
| 4 | 0 | `_agentAccountIds` | `mapping(address => uint256[])` | mapping | BranchPaymentRegistry |
| 5 | 0 | `branchToAccount` | `mapping(address => mapping(uint256 => uint256))` | mapping | BranchPaymentRegistry |
| 6 | 0 | `__gap` | `uint256[45]` | gap | BranchPaymentRegistry |
