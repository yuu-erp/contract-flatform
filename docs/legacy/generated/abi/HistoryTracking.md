# HistoryTracking — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (113)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `ADMIN_ROLE()` | `75b238fc` | đọc (view) | `bytes32` |
| `DEFAULT_ADMIN_ROLE()` | `a217fddf` | đọc (view) | `bytes32` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `WRITER_ROLE()` | `9beaab7b` | đọc (view) | `bytes32` |
| `allHistoryEntries(uint256)` | `f4c81b55` | đọc (view) | `uint8,string,uint8,uint256,address,string` |
| `areaSnapshots(uint256,uint256)` | `66551f99` | đọc (view) | `tuple,uint256` |
| `bannerSnapshots(uint256,uint256)` | `af5fd3a7` | đọc (view) | `tuple,uint256` |
| `categorySnapshots(string,uint256)` | `4dcb04ba` | đọc (view) | `tuple,uint256` |
| `discountSnapshots(string,uint256)` | `1fa5f486` | đọc (view) | `tuple,uint256` |
| `dishOptionSnapshots(bytes32,uint256)` | `066e54cf` | đọc (view) | `tuple,uint256` |
| `dishSnapshots(string,uint256)` | `46339aad` | đọc (view) | `tuple,uint256` |
| `entityExists(uint8,string)` | `044c21b6` | đọc (view) | `bool` |
| `entityHistories(uint8,string)` | `81e13612` | đọc (view) | `uint256,uint256,bool` |
| `getAllCategorySnapshots(string,uint256,uint256)` | `e147f668` | đọc (view) | `tuple[],uint256` |
| `getAllDiscountSnapshots(string,uint256,uint256)` | `b3de97b9` | đọc (view) | `tuple[],uint256` |
| `getAllDishSnapshots(string,uint256,uint256)` | `7f52f8ea` | đọc (view) | `tuple[],uint256` |
| `getAllHistory(uint256,uint256)` | `759d4b0f` | đọc (view) | `tuple[],uint256` |
| `getAllStaffSnapshots(address,uint256,uint256)` | `d64f2e6a` | đọc (view) | `tuple[],uint256` |
| `getAreaSnapshots(uint256)` | `d64fbb0f` | đọc (view) | `tuple,tuple,bool,bool` |
| `getAreaUpdateSnapshots(uint256)` | `9370e297` | đọc (view) | `tuple,tuple,bool,bool` |
| `getBannerSnapshots(uint256)` | `cd6ee0a2` | đọc (view) | `tuple,tuple,bool,bool` |
| `getBannerUpdateSnapshots(uint256)` | `30490265` | đọc (view) | `tuple,tuple,bool,bool` |
| `getCategorySnapshots(string)` | `b06c6776` | đọc (view) | `tuple,tuple,bool,bool` |
| `getCategoryUpdateSnapshots(string)` | `7c879949` | đọc (view) | `tuple,tuple,bool,bool` |
| `getDiscountSnapshots(string)` | `739fa9bc` | đọc (view) | `tuple,tuple,bool,bool` |
| `getDiscountUpdateSnapshots(string)` | `3ae6d876` | đọc (view) | `tuple,tuple,bool,bool` |
| `getDishOptionSnapshots(bytes32)` | `fbb776e0` | đọc (view) | `tuple,tuple,bool,bool` |
| `getDishOptionUpdateSnapshots(bytes32)` | `3da2d618` | đọc (view) | `tuple,tuple,bool,bool` |
| `getDishSnapshots(string)` | `fef7c8b4` | đọc (view) | `tuple,tuple,bool,bool` |
| `getDishUpdateSnapshots(string)` | `2e6c60c9` | đọc (view) | `tuple,tuple,bool,bool` |
| `getHistoryByEntity(uint8,string,uint256,uint256)` | `d643e44f` | đọc (view) | `tuple[],uint256` |
| `getHistoryByTimeRange(uint8,uint256,uint256,uint256,uint256)` | `d5ac1dc8` | đọc (view) | `tuple[],uint256` |
| `getHistoryByType(uint8,uint256,uint256)` | `3666c771` | đọc (view) | `tuple[],uint256` |
| `getHistoryStats(uint8)` | `c63025f3` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `getManagerSnapshots(address)` | `0b0603dd` | đọc (view) | `tuple,tuple,bool,bool` |
| `getPaymentInfoSnapshots(uint256)` | `3f1a4721` | đọc (view) | `tuple,tuple,bool,bool` |
| `getPositionSnapshots(string)` | `65a917c6` | đọc (view) | `tuple,tuple,bool,bool` |
| `getPositionUpdateSnapshots(string)` | `0206dbc8` | đọc (view) | `tuple,tuple,bool,bool` |
| `getRecentHistoryByEntity(uint8,string,uint256)` | `fa320b03` | đọc (view) | `tuple[]` |
| `getRoleAdmin(bytes32)` | `248a9ca3` | đọc (view) | `bytes32` |
| `getStaffSnapshots(address)` | `da89548e` | đọc (view) | `tuple,tuple,bool,bool` |
| `getStaffUpdateSnapshots(address)` | `20bac86d` | đọc (view) | `tuple,tuple,bool,bool` |
| `getTCSnapshots(uint256)` | `a13cd176` | đọc (view) | `tuple,tuple,bool,bool` |
| `getTCUpdateSnapshots(uint256)` | `81e51b4e` | đọc (view) | `tuple,tuple,bool,bool` |
| `getTableSnapshots(uint256)` | `4c74b01a` | đọc (view) | `tuple,tuple,bool,bool` |
| `getTableUpdateSnapshots(uint256)` | `8dd6ec23` | đọc (view) | `tuple,tuple,bool,bool` |
| `getUniformSnapshots(uint256)` | `eb6a7926` | đọc (view) | `tuple,tuple,bool,bool` |
| `getUniformUpdateSnapshots(uint256)` | `bb3fb147` | đọc (view) | `tuple,tuple,bool,bool` |
| `getUpdateCount(uint8,string)` | `803db45c` | đọc (view) | `uint256` |
| `getUpdateTimeline(uint8,string)` | `1f1a1dc5` | đọc (view) | `uint256[]` |
| `getUpdateTimestamps(uint8,string)` | `941511d0` | đọc (view) | `uint256,uint256,bool` |
| `getWorkingShiftSnapshots(uint256)` | `f4c90d08` | đọc (view) | `tuple,tuple,bool,bool` |
| `getWorkingShiftUpdateSnapshots(uint256)` | `75173a52` | đọc (view) | `tuple,tuple,bool,bool` |
| `grantRole(bytes32,address)` | `2f2ff15d` | ghi (nonpayable) | `` |
| `grantWriterRole(address)` | `cd07708d` | ghi (nonpayable) | `` |
| `hasRole(bytes32,address)` | `91d14854` | đọc (view) | `bool` |
| `historyByTableSnapshots(uint256,uint256)` | `f30b81b8` | đọc (view) | `tuple,uint256` |
| `historyIndicesByEntity(uint8,string,uint256)` | `4dd8bce0` | đọc (view) | `uint256` |
| `historyIndicesByType(uint8,uint256)` | `10d61134` | đọc (view) | `uint256` |
| `initialize(address,address,address)` | `c0c53b8b` | ghi (nonpayable) | `` |
| `managerSnapshots(address,uint256)` | `bb05d8c4` | đọc (view) | `tuple,uint256` |
| `paymentInfoSnapshots(uint256,uint256)` | `301c8228` | đọc (view) | `tuple,uint256` |
| `positionSnapshots(string,uint256)` | `d8716d8e` | đọc (view) | `tuple,uint256` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `recordAreaCreate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordAreaDelete(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordAreaUpdate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordBannerCreate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordBannerDelete(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordBannerUpdate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordCategoryCreate(string,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordCategoryDelete(string,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordCategoryUpdate(string,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordDiscountCreate(string,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordDiscountDelete(string,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordDiscountUpdate(string,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordDishCreate(string,tuple,tuple[],tuple[][],string)` | `` | ghi (nonpayable) | `` |
| `recordDishDelete(string,tuple,tuple[],tuple[][],string)` | `` | ghi (nonpayable) | `` |
| `recordDishOptionCreate(bytes32,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordDishOptionDelete(bytes32,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordDishOptionUpdate(bytes32,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordDishUpdate(string,tuple,tuple[],tuple[][],string)` | `` | ghi (nonpayable) | `` |
| `recordManagerCreate(address,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordManagerDelete(address,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordManagerUpdate(address,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordPaymentInfoUpdate(tuple,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordPositionCreate(string,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordPositionDelete(string,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordPositionUpdate(string,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordStaffCreate(address,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordStaffDelete(address,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordStaffUpdate(address,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordTCCreate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordTCDelete(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordTCUpdate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordTableCreate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordTableDelete(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordTableUpdate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordUniformCreate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordUniformDelete(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordUniformUpdate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordWorkingShiftCreate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordWorkingShiftDelete(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `recordWorkingShiftUpdate(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `renounceRole(bytes32,address)` | `36568abe` | ghi (nonpayable) | `` |
| `revokeRole(bytes32,address)` | `d547741f` | ghi (nonpayable) | `` |
| `revokeWriterRole(address)` | `10baf7dc` | ghi (nonpayable) | `` |
| `staffSnapshots(address,uint256)` | `5631892f` | đọc (view) | `tuple,uint256` |
| `supportsInterface(bytes4)` | `01ffc9a7` | đọc (view) | `bool` |
| `tcSnapshots(uint256,uint256)` | `57308a0e` | đọc (view) | `tuple,uint256` |
| `uniformSnapshots(uint256,uint256)` | `d496253b` | đọc (view) | `tuple,uint256` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |
| `workingShiftSnapshots(uint256,uint256)` | `77332edc` | đọc (view) | `tuple,uint256` |

## Event (7)

| Event |
|---|
| `HistoryRecorded(uint8,string,uint8,uint256,address)` |
| `Initialized(uint64)` |
| `RoleAdminChanged(bytes32,bytes32,bytes32)` |
| `RoleGranted(bytes32,address,address)` |
| `RoleRevoked(bytes32,address,address)` |
| `SnapshotSaved(uint8,string,uint256)` |
| `Upgraded(address)` |
