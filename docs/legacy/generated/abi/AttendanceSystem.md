# AttendanceSystem — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (67)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `BE()` | `d44943ba` | đọc (view) | `address` |
| `MAX_DAY_ARR()` | `6a459f40` | đọc (view) | `uint256` |
| `PERM_IQR_STAFF_MANAGE()` | `4d06e5e4` | đọc (view) | `bytes32` |
| `ReportCheckin(address,tuple)` | `` | ghi (nonpayable) | `` |
| `TIMEZONE()` | `5e628f57` | đọc (view) | `int256` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `allStaffAddresses(uint256)` | `96558e4f` | đọc (view) | `address` |
| `approveIncident(bytes32,bool)` | `89cd88ed` | ghi (nonpayable) | `` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `checkIn(address,tuple)` | `` | ghi (nonpayable) | `` |
| `checkOut(address,tuple)` | `` | ghi (nonpayable) | `` |
| `companyHolidays(uint256)` | `ddfbaefe` | đọc (view) | `bool` |
| `createSettingAddress(tuple[])` | `` | ghi (nonpayable) | `uint256[]` |
| `dailyReports(uint256)` | `e29da07b` | đọc (view) | `uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256` |
| `endNotInPosition(address)` | `dd9f2353` | ghi (nonpayable) | `` |
| `formatTime(uint256)` | `b5f5c645` | đọc (pure) | `string` |
| `getAttendanceRecord(address,uint256)` | `bcebe712` | đọc (view) | `tuple[]` |
| `getDailyReport(uint256)` | `a636c890` | đọc (view) | `tuple` |
| `getIncidentByStaffAndTime(address,uint256,uint256)` | `ae5a90f9` | đọc (view) | `tuple[]` |
| `getMonthlyReportStaffList(uint256)` | `783efb7a` | đọc (view) | `address[]` |
| `getSettingAddress()` | `905d5c40` | đọc (view) | `tuple` |
| `getStaffDailyReport(address,uint256)` | `643dcd15` | đọc (view) | `tuple[]` |
| `getStaffDayDetailsAMonth(address,uint256)` | `29ed3b38` | đọc (view) | `tuple[][]` |
| `getStaffHalfDays(uint256,address)` | `106c5968` | đọc (view) | `uint256[]` |
| `getStaffLateDays(uint256,address)` | `33813f9a` | đọc (view) | `uint256[]` |
| `getStaffMonthlyReportRealtime(address,uint256)` | `bf3ebd58` | đọc (view) | `tuple` |
| `getStaffMonthlyStats(uint256,address)` | `9dc0b563` | đọc (view) | `tuple` |
| `getStaffUnauthorizedDays(uint256,address)` | `95b4bd47` | đọc (view) | `uint256[]` |
| `getStaffVacationDays(uint256,address)` | `ac810ba2` | đọc (view) | `uint256[]` |
| `getStaffWorkingDays(uint256,address)` | `3b26abd1` | đọc (view) | `uint256[]` |
| `getTimeZone()` | `4c6e0dca` | đọc (view) | `int256` |
| `getWorkPlaceById(uint256)` | `b7b78800` | đọc (view) | `tuple` |
| `halfDayThreshold()` | `e4dbbe58` | đọc (view) | `uint256` |
| `initialize(address)` | `c4d66de8` | ghi (nonpayable) | `` |
| `isAttendanceRecorded(address,uint256)` | `d0dd729e` | đọc (view) | `bool` |
| `isStaffExists(address)` | `fc8c697f` | đọc (view) | `bool` |
| `lateThreshold()` | `0455671b` | đọc (view) | `uint256` |
| `mIdToIncident(bytes32)` | `d4bd5713` | đọc (view) | `bytes32,address,tuple,uint256,bool,uint256` |
| `mLatestCheckinShift(address,uint256)` | `bcd67032` | đọc (view) | `uint256` |
| `mLatestCheckoutShift(address,uint256)` | `8461689d` | đọc (view) | `uint256` |
| `mStaffToDateToIncidents(address,uint256)` | `fecc6337` | đọc (view) | `bytes32,address,tuple,uint256,bool,uint256` |
| `managementContract()` | `b3e5cc4a` | đọc (view) | `address` |
| `monthlyReports(uint256)` | `718de68e` | đọc (view) | `uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256` |
| `nextWorkPlaceId()` | `58411220` | đọc (view) | `uint256` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `rebuildDailyReport(uint256)` | `22d7f49f` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `reportedDates(uint256)` | `76c06113` | đọc (view) | `uint256` |
| `reportedMonths(uint256)` | `9385fd82` | đọc (view) | `uint256` |
| `setBE(address)` | `973e5d25` | ghi (nonpayable) | `` |
| `setBranchAccessManager(address,address,uint256)` | `3d27bb94` | ghi (nonpayable) | `` |
| `setBulkAttendanceData(address[],uint256[],uint8[],uint8[],string,address)` | `99766a2d` | ghi (nonpayable) | `` |
| `setCompanyHolidays(uint256[],bool[])` | `3e173b5f` | ghi (nonpayable) | `` |
| `setManagement(address)` | `d4a22bde` | ghi (nonpayable) | `` |
| `setTimeZone(int256)` | `be609198` | ghi (nonpayable) | `int256` |
| `settingAddress()` | `085d6d95` | đọc (view) | `uint256` |
| `staffDailyAttendance(address,uint256,uint256)` | `4c4609f2` | đọc (view) | `address,string,string,uint256,uint256,uint256,uint256,bool,bool,uint256,uint256,uint256,uint8,uint8,string,bool,address,uint256,tuple,uint256` |
| `standardWorkingHours()` | `91d1292a` | đọc (view) | `uint256` |
| `startNotInPosition(address)` | `24d628ef` | ghi (nonpayable) | `` |
| `totalAttendanceRecords()` | `031a7240` | đọc (view) | `uint256` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `updateManagementContract(address)` | `d1b2e56f` | ghi (nonpayable) | `` |
| `updateSettings(uint256,uint256,uint256)` | `0465c563` | ghi (nonpayable) | `` |
| `updateWorkPlace(uint256,string,string,string)` | `68998850` | ghi (nonpayable) | `bool` |
| `workplaceById(uint256)` | `5e95a117` | đọc (view) | `uint256,string,string,string` |
| `workplaceExists(uint256)` | `bac33aa2` | đọc (view) | `bool` |

## Event (10)

| Event |
|---|
| `AttendanceDataSet(address,uint256,uint8,uint8)` |
| `AttendanceStatusUpdated(address,uint256,uint8,bool,bool)` |
| `CheckInRecorded(address,uint256,uint256)` |
| `CheckOutRecorded(address,uint256,uint256)` |
| `DailyReportUpdated(uint256)` |
| `Initialized(uint64)` |
| `MonthlyReportGenerated(uint256)` |
| `NotInPositionEndRecorded(address,uint256,uint256)` |
| `NotInPositionStartRecorded(address,uint256,uint256)` |
| `OwnershipTransferred(address,address)` |
