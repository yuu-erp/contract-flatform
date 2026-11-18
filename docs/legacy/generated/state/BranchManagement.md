# BranchManagement — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/branch/BranchManagement.sol`. Layout đầy đủ: `../../layout/BranchManagement.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `mainMerchantId` | `uint256` | scalar | BranchManagement |
| 1 | 0 | `merchantName` | `string` | scalar | BranchManagement |
| 2 | 0 | `branchCounter` | `uint256` | scalar | BranchManagement |
| 3 | 0 | `branches` | `mapping(uint256 => struct Branch)` | mapping | BranchManagement |
| 4 | 0 | `branchIds` | `uint256[]` | mảng | BranchManagement |
| 5 | 0 | `proposalCounter` | `uint256` | scalar | BranchManagement |
| 6 | 0 | `proposals` | `mapping(uint256 => struct Proposal)` | mapping | BranchManagement |
| 7 | 0 | `proposalIds` | `uint256[]` | mảng | BranchManagement |
| 8 | 0 | `notificationCounter` | `uint256` | scalar | BranchManagement |
| 9 | 0 | `userNotifications` | `mapping(address => uint256[])` | mapping | BranchManagement |
| 10 | 0 | `notifications` | `mapping(uint256 => struct Notification)` | mapping | BranchManagement |
| 11 | 0 | `branchNotifications` | `mapping(uint256 => uint256[])` | mapping | BranchManagement |
| 12 | 0 | `votingThreshold` | `uint256` | scalar | BranchManagement |
| 13 | 0 | `paymentInfo` | `struct PaymentInfo` | struct | BranchManagement |
| 18 | 0 | `mPaymentMethodActive` | `mapping(enum PaymentMethod => bool)` | mapping | BranchManagement |
| 19 | 0 | `paymentOrder` | `enum PaymentOrder` | scalar | BranchManagement |
| 19 | 1 | `currency` | `enum Currency` | scalar | BranchManagement |
| 19 | 2 | `currencyDisplay` | `enum CurrencyDisplay` | scalar | BranchManagement |
| 20 | 0 | `proposalHasVoted` | `mapping(uint256 => mapping(address => bool))` | mapping | BranchManagement |
| 21 | 0 | `proposalVoteChoice` | `mapping(uint256 => mapping(address => bool))` | mapping | BranchManagement |
| 22 | 0 | `isMainOwner` | `mapping(address => bool)` | mapping | BranchManagement |
| 23 | 0 | `mainBranchId` | `uint256` | scalar | BranchManagement |
| 24 | 0 | `StaffAgentStore` | `contract IStaffAgentStore` | scalar | BranchManagement |
| 25 | 0 | `agent` | `address` | scalar | BranchManagement |
| 26 | 0 | `iqrFactorySc` | `address` | scalar | BranchManagement |
| 27 | 0 | `netCafeFactorySc` | `address` | scalar | BranchManagement |
| 28 | 0 | `robotFactorySc` | `address` | scalar | BranchManagement |
| 29 | 0 | `enhancedAgentSc` | `address` | scalar | BranchManagement |
| 30 | 0 | `bootstrapOperator` | `address` | scalar | BranchManagement |
| 31 | 0 | `mBranchIdToHistoryTrack` | `mapping(uint256 => address)` | mapping | BranchManagement |
| 32 | 0 | `historyTrackingIMP` | `address` | scalar | BranchManagement |
| 33 | 0 | `freeGasSc` | `address` | scalar | BranchManagement |
| 34 | 0 | `branchAccessManager` | `address` | scalar | BranchManagement |
| 35 | 0 | `__gap` | `uint256[49]` | gap | BranchManagement |
