# PublicfullDB — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/loyalty/PublicfullDB.sol`. Layout đầy đủ: `../../layout/PublicfullDB.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `fullDB` | `contract IFullDBV1` | scalar | PublicfullDB |
| 1 | 0 | `isAllowedCaller` | `mapping(address => bool)` | mapping | PublicfullDB |
| 2 | 0 | `agentInitialised` | `mapping(address => bool)` | mapping | PublicfullDB |
| 3 | 0 | `txDocId` | `mapping(address => mapping(uint256 => uint256))` | mapping | PublicfullDB |
| 4 | 0 | `agentMaxTxId` | `mapping(address => uint256)` | mapping | PublicfullDB |
| 5 | 0 | `loyaltyContract` | `address` | scalar | PublicfullDB |
| 6 | 0 | `txBranchId` | `mapping(address => mapping(uint256 => uint256))` | mapping | PublicfullDB |
| 7 | 0 | `txModule` | `mapping(address => mapping(uint256 => bytes32))` | mapping | PublicfullDB |
| 8 | 0 | `loyaltyByAgent` | `mapping(address => address)` | mapping | PublicfullDB |
| 9 | 0 | `txIdByDocId` | `mapping(address => mapping(uint256 => uint256))` | mapping | PublicfullDB |
| 10 | 0 | `__gap` | `uint256[44]` | gap | PublicfullDB |
