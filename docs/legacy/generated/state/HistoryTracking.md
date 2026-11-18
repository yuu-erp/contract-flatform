# HistoryTracking — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/branch/HistoryTracking.sol`. Layout đầy đủ: `../../layout/HistoryTracking.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `entityHistories` | `mapping(enum EntityType => mapping(string => struct EntityHistory))` | mapping | HistoryTracking |
| 1 | 0 | `allHistoryEntries` | `struct HistoryEntry[]` | mảng | HistoryTracking |
| 2 | 0 | `historyIndicesByType` | `mapping(enum EntityType => uint256[])` | mapping | HistoryTracking |
| 3 | 0 | `historyIndicesByEntity` | `mapping(enum EntityType => mapping(string => uint256[]))` | mapping | HistoryTracking |
| 4 | 0 | `dishSnapshots` | `mapping(string => struct DishSnapshot[])` | mapping | HistoryTracking |
| 5 | 0 | `categorySnapshots` | `mapping(string => struct CategorySnapshot[])` | mapping | HistoryTracking |
| 6 | 0 | `discountSnapshots` | `mapping(string => struct DiscountSnapshot[])` | mapping | HistoryTracking |
| 7 | 0 | `staffSnapshots` | `mapping(address => struct StaffSnapshot[])` | mapping | HistoryTracking |
| 8 | 0 | `historyByTableSnapshots` | `mapping(uint256 => struct TableSnapshot[])` | mapping | HistoryTracking |
| 9 | 0 | `bannerSnapshots` | `mapping(uint256 => struct BannerSnapshot[])` | mapping | HistoryTracking |
| 10 | 0 | `tcSnapshots` | `mapping(uint256 => struct TCSnapshot[])` | mapping | HistoryTracking |
| 11 | 0 | `workingShiftSnapshots` | `mapping(uint256 => struct WorkingShiftSnapshot[])` | mapping | HistoryTracking |
| 12 | 0 | `uniformSnapshots` | `mapping(uint256 => struct UniformSnapshot[])` | mapping | HistoryTracking |
| 13 | 0 | `areaSnapshots` | `mapping(uint256 => struct AreaSnapshot[])` | mapping | HistoryTracking |
| 14 | 0 | `positionSnapshots` | `mapping(string => struct PositionSnapshot[])` | mapping | HistoryTracking |
| 15 | 0 | `dishOptionSnapshots` | `mapping(bytes32 => struct DishOptionSnapshot[])` | mapping | HistoryTracking |
| 16 | 0 | `managerSnapshots` | `mapping(address => struct ManagerSnapshot[])` | mapping | HistoryTracking |
| 17 | 0 | `paymentInfoSnapshots` | `mapping(uint256 => struct PaymentInfoSnapshot[])` | mapping | HistoryTracking |
| 18 | 0 | `__gap` | `uint256[50]` | gap | HistoryTracking |
