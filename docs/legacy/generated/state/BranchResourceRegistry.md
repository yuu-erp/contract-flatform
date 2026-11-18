# BranchResourceRegistry — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/shared/BranchResourceRegistry.sol`. Layout đầy đủ: `../../layout/BranchResourceRegistry.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `accessManager` | `contract IBranchAccessManager` | scalar | BranchResourceRegistry |
| 1 | 0 | `_areas` | `mapping(address => mapping(uint256 => mapping(bytes32 => struct BranchResourceRegistry.Area)))` | mapping | BranchResourceRegistry |
| 2 | 0 | `_areaIds` | `mapping(address => mapping(uint256 => bytes32[]))` | mapping | BranchResourceRegistry |
| 3 | 0 | `_resources` | `mapping(address => mapping(uint256 => mapping(bytes32 => struct BranchResourceRegistry.Resource)))` | mapping | BranchResourceRegistry |
| 4 | 0 | `_tableData` | `mapping(address => mapping(uint256 => mapping(bytes32 => struct BranchResourceRegistry.TableData)))` | mapping | BranchResourceRegistry |
| 5 | 0 | `_tableResourceIdsByNumber` | `mapping(address => mapping(uint256 => mapping(uint256 => bytes32)))` | mapping | BranchResourceRegistry |
| 6 | 0 | `_resourceIds` | `mapping(address => mapping(uint256 => bytes32[]))` | mapping | BranchResourceRegistry |
| 7 | 0 | `branchAuditTrail` | `contract IBranchAuditTrail` | scalar | BranchResourceRegistry |
| 8 | 0 | `__gap` | `uint256[49]` | gap | BranchResourceRegistry |
| 57 | 0 | `areaIndexPlusOne` | `mapping(address => mapping(uint256 => mapping(bytes32 => uint256)))` | mapping | BranchResourceRegistry |
| 58 | 0 | `resourceIndexPlusOne` | `mapping(address => mapping(uint256 => mapping(bytes32 => uint256)))` | mapping | BranchResourceRegistry |
| 59 | 0 | `childAreaCount` | `mapping(address => mapping(uint256 => mapping(bytes32 => uint256)))` | mapping | BranchResourceRegistry |
| 60 | 0 | `resourceCountByArea` | `mapping(address => mapping(uint256 => mapping(bytes32 => uint256)))` | mapping | BranchResourceRegistry |
