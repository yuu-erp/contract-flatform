# StaffAgentStore — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/system/StaffAgentStore.sol`. Layout đầy đủ: `../../layout/StaffAgentStore.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `isManagement` | `mapping(address => bool)` | mapping | StaffAgentStore |
| 1 | 0 | `isBranchManagement` | `mapping(address => bool)` | mapping | StaffAgentStore |
| 2 | 0 | `mUserToAgent` | `mapping(address => address)` | mapping | StaffAgentStore |
| 3 | 0 | `mUserToBranchId` | `mapping(address => uint256)` | mapping | StaffAgentStore |
| 4 | 0 | `iqrFactory` | `address` | scalar | StaffAgentStore |
| 5 | 0 | `enhancedAgent` | `address` | scalar | StaffAgentStore |
| 6 | 0 | `mCoOwnerToAgent` | `mapping(address => address[])` | mapping | StaffAgentStore |
| 7 | 0 | `mCoOwnerToAgentToBranchIds` | `mapping(address => mapping(address => uint256[]))` | mapping | StaffAgentStore |
| 8 | 0 | `__gap` | `uint256[48]` | gap | StaffAgentStore |
