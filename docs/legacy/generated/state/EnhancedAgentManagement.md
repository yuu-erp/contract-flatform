# EnhancedAgentManagement — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/system/EnhancedAgentManagement.sol`. Layout đầy đủ: `../../layout/EnhancedAgentManagement.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `_status` | `uint256` | scalar | EnhancedAgentManagement |
| 1 | 0 | `version` | `string` | scalar | EnhancedAgentManagement |
| 2 | 0 | `superAdmin` | `address` | scalar | EnhancedAgentManagement |
| 3 | 0 | `_adminInitialized` | `uint256` | scalar | EnhancedAgentManagement |
| 4 | 0 | `iqrFactory` | `address` | scalar | EnhancedAgentManagement |
| 5 | 0 | `loyaltyFactory` | `address` | scalar | EnhancedAgentManagement |
| 6 | 0 | `netCafeFactory` | `address` | scalar | EnhancedAgentManagement |
| 7 | 0 | `agentModuleProvisioner` | `address` | scalar | EnhancedAgentManagement |
| 8 | 0 | `revenueManager` | `address` | scalar | EnhancedAgentManagement |
| 9 | 0 | `mtdToken` | `address` | scalar | EnhancedAgentManagement |
| 10 | 0 | `bmFactory` | `address` | scalar | EnhancedAgentManagement |
| 11 | 0 | `robotFactory` | `address` | scalar | EnhancedAgentManagement |
| 12 | 0 | `agents` | `mapping(address => struct Agent)` | mapping | EnhancedAgentManagement |
| 13 | 0 | `agentIQRContracts` | `mapping(address => mapping(uint256 => address))` | mapping | EnhancedAgentManagement |
| 14 | 0 | `agentNetCafeContracts` | `mapping(address => mapping(uint256 => address))` | mapping | EnhancedAgentManagement |
| 15 | 0 | `agentROBOTContracts` | `mapping(address => mapping(uint256 => address))` | mapping | EnhancedAgentManagement |
| 16 | 0 | `agentLoyaltyContracts` | `mapping(address => mapping(uint256 => address))` | mapping | EnhancedAgentManagement |
| 17 | 0 | `agentBranchManagement` | `mapping(address => address)` | mapping | EnhancedAgentManagement |
| 18 | 0 | `netCafeLicenses` | `mapping(address => mapping(uint256 => struct NetCafeV3License))` | mapping | EnhancedAgentManagement |
| 19 | 0 | `branchModuleOverrides` | `mapping(address => mapping(uint256 => bool[4]))` | mapping | EnhancedAgentManagement |
| 20 | 0 | `branchModuleOverrideSet` | `mapping(address => mapping(uint256 => bool))` | mapping | EnhancedAgentManagement |
| 21 | 0 | `agentList` | `address[]` | mảng | EnhancedAgentManagement |
| 22 | 0 | `paused` | `bool` | scalar | EnhancedAgentManagement |
| 23 | 0 | `deletedAgents` | `struct Agent[]` | mảng | EnhancedAgentManagement |
| 24 | 0 | `isAdmin` | `mapping(address => bool)` | mapping | EnhancedAgentManagement |
| 25 | 0 | `mDomainToWallet` | `mapping(string => address)` | mapping | EnhancedAgentManagement |
| 26 | 0 | `mAgentToDomain` | `mapping(address => string)` | mapping | EnhancedAgentManagement |
| 27 | 0 | `iqrTransfered` | `mapping(address => mapping(uint256 => bool))` | mapping | EnhancedAgentManagement |
| 28 | 0 | `agentToBranchIds` | `mapping(address => uint256[])` | mapping | EnhancedAgentManagement |
| 29 | 0 | `mBranchIdToBranch` | `mapping(uint256 => struct BranchInfo)` | mapping | EnhancedAgentManagement |
| 30 | 0 | `mAgentToMainBranchId` | `mapping(address => uint256)` | mapping | EnhancedAgentManagement |
| 31 | 0 | `branchIdCount` | `uint256` | scalar | EnhancedAgentManagement |
| 32 | 0 | `existsInNew` | `mapping(uint256 => bool)` | mapping | EnhancedAgentManagement |
| 33 | 0 | `mDomainToBranchId` | `mapping(string => uint256)` | mapping | EnhancedAgentManagement |
| 34 | 0 | `isCompanyAdmin` | `mapping(address => bool)` | mapping | EnhancedAgentManagement |
| 35 | 0 | `isDA` | `mapping(address => bool)` | mapping | EnhancedAgentManagement |
| 36 | 0 | `agentsByPermissionCache` | `mapping(uint8 => address[])` | mapping | EnhancedAgentManagement |
| 37 | 0 | `permissionCacheValid` | `mapping(uint8 => bool)` | mapping | EnhancedAgentManagement |
| 38 | 0 | `superAdminToCompanyAdmin` | `mapping(address => address)` | mapping | EnhancedAgentManagement |
| 39 | 0 | `companyAdminSuperAdmins` | `mapping(address => address[])` | mapping | EnhancedAgentManagement |
| 40 | 0 | `publicfullDB` | `address` | scalar | EnhancedAgentManagement |
| 41 | 0 | `branchAccessManager` | `address` | scalar | EnhancedAgentManagement |
| 42 | 0 | `economyVault` | `address` | scalar | EnhancedAgentManagement |
| 43 | 0 | `__gap` | `uint256[43]` | gap | EnhancedAgentManagement |
| 86 | 0 | `agentTaxPercent` | `mapping(address => uint8)` | mapping | EnhancedAgentManagement |
| 87 | 0 | `notiService` | `address` | scalar | EnhancedAgentManagement |
| 88 | 0 | `notiAppId` | `bytes32` | scalar | EnhancedAgentManagement |
| 89 | 0 | `_notiSenderRegistered` | `mapping(address => bool)` | mapping | EnhancedAgentManagement |
| 90 | 0 | `agentAnalytics` | `mapping(address => struct AgentAnalytics)` | mapping | EnhancedAgentManagement |
| 91 | 0 | `monthlyAgents` | `mapping(uint256 => address[])` | mapping | EnhancedAgentManagement |
| 92 | 0 | `yearlyAgents` | `mapping(uint256 => address[])` | mapping | EnhancedAgentManagement |
