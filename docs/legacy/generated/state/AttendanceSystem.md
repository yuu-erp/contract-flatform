# AttendanceSystem — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/branch/AttendanceSystem.sol`. Layout đầy đủ: `../../layout/AttendanceSystem.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `_status` | `uint256` | scalar | AttendanceSystem |
| 1 | 0 | `managementContract` | `contract IManagement` | scalar | AttendanceSystem |
| 2 | 0 | `accessManager` | `contract IBranchAccessManager` | scalar | AttendanceSystem |
| 3 | 0 | `agent` | `address` | scalar | AttendanceSystem |
| 4 | 0 | `branchId` | `uint256` | scalar | AttendanceSystem |
| 5 | 0 | `staffDailyAttendance` | `mapping(address => mapping(uint256 => struct AttendanceRecord[]))` | mapping | AttendanceSystem |
| 6 | 0 | `dailyReports` | `mapping(uint256 => struct DailyReportHR)` | mapping | AttendanceSystem |
| 7 | 0 | `monthlyReports` | `mapping(uint256 => struct MonthlyReportHR)` | mapping | AttendanceSystem |
| 8 | 0 | `isStaffExists` | `mapping(address => bool)` | mapping | AttendanceSystem |
| 9 | 0 | `isAttendanceRecorded` | `mapping(address => mapping(uint256 => bool))` | mapping | AttendanceSystem |
| 10 | 0 | `mLatestCheckinShift` | `mapping(address => mapping(uint256 => uint256))` | mapping | AttendanceSystem |
| 11 | 0 | `mLatestCheckoutShift` | `mapping(address => mapping(uint256 => uint256))` | mapping | AttendanceSystem |
| 12 | 0 | `reportedDates` | `uint256[]` | mảng | AttendanceSystem |
| 13 | 0 | `reportedMonths` | `uint256[]` | mảng | AttendanceSystem |
| 14 | 0 | `allStaffAddresses` | `address[]` | mảng | AttendanceSystem |
| 15 | 0 | `TIMEZONE` | `int256` | scalar | AttendanceSystem |
| 16 | 0 | `totalAttendanceRecords` | `uint256` | scalar | AttendanceSystem |
| 17 | 0 | `standardWorkingHours` | `uint256` | scalar | AttendanceSystem |
| 18 | 0 | `lateThreshold` | `uint256` | scalar | AttendanceSystem |
| 19 | 0 | `halfDayThreshold` | `uint256` | scalar | AttendanceSystem |
| 20 | 0 | `BE` | `address` | scalar | AttendanceSystem |
| 21 | 0 | `settingAddress` | `struct SettingAddress` | struct | AttendanceSystem |
| 23 | 0 | `nextWorkPlaceId` | `uint256` | scalar | AttendanceSystem |
| 24 | 0 | `mStaffToDateToIncidents` | `mapping(address => struct ReportCheckinAccident[])` | mapping | AttendanceSystem |
| 25 | 0 | `mIdToIncident` | `mapping(bytes32 => struct ReportCheckinAccident)` | mapping | AttendanceSystem |
| 26 | 0 | `workplaceById` | `mapping(uint256 => struct WorkPlace)` | mapping | AttendanceSystem |
| 27 | 0 | `workplaceExists` | `mapping(uint256 => bool)` | mapping | AttendanceSystem |
| 28 | 0 | `__gap` | `uint256[50]` | gap | AttendanceSystem |
| 78 | 0 | `companyHolidays` | `mapping(uint256 => bool)` | mapping | AttendanceSystem |
