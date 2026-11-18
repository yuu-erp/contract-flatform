# BranchModuleRegistry — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/shared/BranchModuleRegistry.sol`. Layout đầy đủ: `../../layout/BranchModuleRegistry.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `agentAdmins` | `mapping(address => mapping(address => bool))` | mapping | BranchModuleRegistry |
| 1 | 0 | `moduleProvisioners` | `mapping(address => bool)` | mapping | BranchModuleRegistry |
| 2 | 0 | `_agentModules` | `mapping(address => mapping(bytes32 => enum BranchModuleRegistry.ModuleState))` | mapping | BranchModuleRegistry |
| 3 | 0 | `_branchModules` | `mapping(address => mapping(uint256 => mapping(bytes32 => enum BranchModuleRegistry.ModuleState)))` | mapping | BranchModuleRegistry |
| 4 | 0 | `__gap` | `uint256[45]` | gap | BranchModuleRegistry |
