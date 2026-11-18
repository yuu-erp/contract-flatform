# BranchAccessManager — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/shared/BranchAccessManager.sol`. Layout đầy đủ: `../../layout/BranchAccessManager.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `__deprecated_agent` | `address` | scalar | BranchAccessManager |
| 1 | 0 | `__deprecated_branchId` | `uint256` | scalar | BranchAccessManager |
| 2 | 0 | `agentAdmins` | `mapping(address => mapping(address => bool))` | mapping | BranchAccessManager |
| 3 | 0 | `agentCoOwners` | `mapping(address => mapping(address => bool))` | mapping | BranchAccessManager |
| 4 | 0 | `agentCoOwnerFullAccess` | `mapping(address => mapping(address => bool))` | mapping | BranchAccessManager |
| 5 | 0 | `branchCoOwners` | `mapping(address => mapping(uint256 => mapping(address => bool)))` | mapping | BranchAccessManager |
| 6 | 0 | `branchCoOwnerFullAccess` | `mapping(address => mapping(uint256 => mapping(address => bool)))` | mapping | BranchAccessManager |
| 7 | 0 | `branchManagers` | `mapping(address => mapping(uint256 => mapping(address => bool)))` | mapping | BranchAccessManager |
| 8 | 0 | `branchStaff` | `mapping(address => mapping(uint256 => mapping(address => bool)))` | mapping | BranchAccessManager |
| 9 | 0 | `branchMembers` | `mapping(address => mapping(uint256 => mapping(address => bool)))` | mapping | BranchAccessManager |
| 10 | 0 | `_permissions` | `mapping(address => mapping(uint256 => mapping(address => mapping(bytes32 => bool))))` | mapping | BranchAccessManager |
| 11 | 0 | `principals` | `mapping(address => mapping(uint256 => mapping(address => struct BranchAccessManager.Principal)))` | mapping | BranchAccessManager |
| 12 | 0 | `mAddToStaff` | `mapping(address => struct Staff)` | mapping | BranchAccessManager |
| 13 | 0 | `staffs` | `struct Staff[]` | mảng | BranchAccessManager |
| 14 | 0 | `workingShifts` | `struct WorkingShift[]` | mảng | BranchAccessManager |
| 15 | 0 | `dailyActiveStaff` | `mapping(uint256 => address[])` | mapping | BranchAccessManager |
| 16 | 0 | `isDailyActive` | `mapping(uint256 => mapping(address => bool))` | mapping | BranchAccessManager |
| 17 | 0 | `monthlyActiveStaff` | `mapping(uint256 => address[])` | mapping | BranchAccessManager |
| 18 | 0 | `isMonthlyActive` | `mapping(uint256 => mapping(address => bool))` | mapping | BranchAccessManager |
| 19 | 0 | `staffCreatedDate` | `mapping(address => uint256)` | mapping | BranchAccessManager |
| 20 | 0 | `staffLastActiveDate` | `mapping(address => uint256)` | mapping | BranchAccessManager |
| 21 | 0 | `timeKeeping` | `address` | scalar | BranchAccessManager |
| 22 | 0 | `mPosition` | `mapping(string => struct Position)` | mapping | BranchAccessManager |
| 23 | 0 | `positions` | `struct Position[]` | mảng | BranchAccessManager |
| 24 | 0 | `branchManagement` | `address` | scalar | BranchAccessManager |
| 25 | 0 | `historyTracking` | `contract IHistoryTracking` | scalar | BranchAccessManager |
| 26 | 0 | `branchAuditTrail` | `contract IBranchAuditTrail` | scalar | BranchAccessManager |
| 27 | 0 | `staffAgentStore` | `contract IStaffAgentStore` | scalar | BranchAccessManager |
| 28 | 0 | `staffIndexPlusOne` | `mapping(address => uint256)` | mapping | BranchAccessManager |
| 29 | 0 | `staffWalletsByAgentBranch` | `mapping(address => mapping(uint256 => address[]))` | mapping | BranchAccessManager |
| 30 | 0 | `staffWalletIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | BranchAccessManager |
| 31 | 0 | `dailyActiveStaffByBranch` | `mapping(address => mapping(uint256 => mapping(uint256 => address[])))` | mapping | BranchAccessManager |
| 32 | 0 | `isDailyActiveByBranch` | `mapping(address => mapping(uint256 => mapping(uint256 => mapping(address => bool))))` | mapping | BranchAccessManager |
| 33 | 0 | `__gap` | `uint256[24]` | gap | BranchAccessManager |
| 57 | 0 | `systemOperators` | `mapping(address => bool)` | mapping | BranchAccessManager |
| 58 | 0 | `branchManagerProfiles` | `mapping(address => mapping(address => struct BranchAccessManager.BranchManagerProfile))` | mapping | BranchAccessManager |
| 59 | 0 | `branchCoOwnerProfiles` | `mapping(address => mapping(address => struct BranchAccessManager.BranchCoOwnerProfile))` | mapping | BranchAccessManager |
| 60 | 0 | `agentManagers` | `mapping(address => address[])` | mapping | BranchAccessManager |
| 61 | 0 | `agentManagerListed` | `mapping(address => mapping(address => bool))` | mapping | BranchAccessManager |
| 62 | 0 | `agentCoOwnersList` | `mapping(address => address[])` | mapping | BranchAccessManager |
| 63 | 0 | `agentCoOwnerListed` | `mapping(address => mapping(address => bool))` | mapping | BranchAccessManager |
| 64 | 0 | `_workingShiftsByAgentBranch` | `mapping(address => mapping(uint256 => struct WorkingShift[]))` | mapping | BranchAccessManager |
| 65 | 0 | `_positionByAgentBranchName` | `mapping(address => mapping(uint256 => mapping(string => struct Position)))` | mapping | BranchAccessManager |
| 66 | 0 | `_positionsByAgentBranch` | `mapping(address => mapping(uint256 => struct Position[]))` | mapping | BranchAccessManager |
| 67 | 0 | `delegations` | `mapping(address => mapping(address => struct BranchAccessManager.Delegation))` | mapping | BranchAccessManager |
| 68 | 0 | `_agentDelegateList` | `mapping(address => address[])` | mapping | BranchAccessManager |
| 69 | 0 | `_agentDelegateListed` | `mapping(address => mapping(address => bool))` | mapping | BranchAccessManager |
| 70 | 0 | `delegateToAgent` | `mapping(address => address)` | mapping | BranchAccessManager |
| 71 | 0 | `_isDelegateWallet` | `mapping(address => bool)` | mapping | BranchAccessManager |
