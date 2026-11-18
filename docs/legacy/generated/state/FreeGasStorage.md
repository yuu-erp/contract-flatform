# FreeGasStorage — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/system/FreeGasStorage.sol`. Layout đầy đủ: `../../layout/FreeGasStorage.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `isAllowed` | `mapping(address => bool)` | mapping | FreeGasStorage |
| 1 | 0 | `iqrFactory` | `address` | scalar | FreeGasStorage |
| 2 | 0 | `__gap` | `uint256[48]` | gap | FreeGasStorage |
