# EnhancedAgentManagement — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (149)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `BatchSetAgentIQR(address,uint256[])` | `e64b269d` | ghi (nonpayable) | `` |
| `BatchSetAgentNETV3(address,uint256[])` | `273f9c79` | ghi (nonpayable) | `` |
| `BatchSetAllAgentIQR(address)` | `6ce00e1c` | ghi (nonpayable) | `` |
| `BatchSetAllAgentNETV3(address)` | `b703804a` | ghi (nonpayable) | `` |
| `BatchSetAllPointsIQR(address)` | `d225f07e` | ghi (nonpayable) | `` |
| `BatchSetFinalize(address,uint256[])` | `29d3ff86` | ghi (nonpayable) | `` |
| `BatchSetPointsIQR(address,uint256[])` | `88023bed` | ghi (nonpayable) | `` |
| `COMPANY_ADMIN_ROLE()` | `c96ea900` | đọc (view) | `bytes32` |
| `CheckAgentExisted(address)` | `e0f37739` | đọc (view) | `bool` |
| `DA_ROLE()` | `29cc499f` | đọc (view) | `bytes32` |
| `FinalizeAgentContractSet(address)` | `571cd32b` | ghi (nonpayable) | `` |
| `FinalizeBranchContractSet(address,uint256)` | `35a38304` | ghi (nonpayable) | `` |
| `MAX_BRANCHES_PER_GRANT()` | `e83f16bf` | đọc (view) | `uint256` |
| `MAX_SEARCH_RESULTS()` | `9e1fdc0a` | đọc (view) | `uint256` |
| `SUPER_ADMIN_ROLE()` | `4460bdd6` | đọc (view) | `bytes32` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `adminInitialized()` | `bda18324` | đọc (view) | `bool` |
| `agentAnalytics(address)` | `7b65e4fd` | đọc (view) | `uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256` |
| `agentBranchManagement(address)` | `09d63809` | đọc (view) | `address` |
| `agentIQRContracts(address,uint256)` | `71a771dc` | đọc (view) | `address` |
| `agentList(uint256)` | `2f80c54f` | đọc (view) | `address` |
| `agentLoyaltyContracts(address,uint256)` | `d873a54b` | đọc (view) | `address` |
| `agentModuleProvisioner()` | `bb7b494c` | đọc (view) | `address` |
| `agentNetCafeContracts(address,uint256)` | `ea90fc25` | đọc (view) | `address` |
| `agentROBOTContracts(address,uint256)` | `a4ee443f` | đọc (view) | `address` |
| `agentTaxPercent(address)` | `0a44a2db` | đọc (view) | `uint8` |
| `agentToBranchIds(address,uint256)` | `db150b07` | đọc (view) | `uint256` |
| `agents(address)` | `fd66091e` | đọc (view) | `address,string,string,string,string,uint256,uint256,bool,bool,string,string` |
| `agentsByPermissionCache(uint8,uint256)` | `c09d20e0` | đọc (view) | `address` |
| `bmFactory()` | `646ad9f9` | đọc (view) | `address` |
| `branchAccessManager()` | `1f75eab0` | đọc (view) | `address` |
| `branchIdCount()` | `8b0a9e1a` | đọc (view) | `uint256` |
| `canModifyAgent(address)` | `47bee5e8` | đọc (view) | `bool` |
| `canViewAgentData(address)` | `af89a994` | đọc (view) | `bool` |
| `companyAdminSuperAdmins(address,uint256)` | `5676ede3` | đọc (view) | `address` |
| `createAgentWithAnalytics(address,string,string,string,string,bool[4],string,string,tuple[])` | `` | ghi (nonpayable) | `bool` |
| `createAgentWithBranchModules(address,string,string,string,string,bool[4],string,string,tuple[],bool[4][])` | `` | ghi (nonpayable) | `bool` |
| `createBranchForAgent(address,tuple,bool[4])` | `` | ghi (nonpayable) | `uint256` |
| `createSuperAdmin(address)` | `b05b76a3` | ghi (nonpayable) | `` |
| `delegateAgent(address)` | `57398788` | ghi (nonpayable) | `` |
| `deleteAgent(address)` | `fdc34496` | ghi (nonpayable) | `` |
| `deletedAgents(uint256)` | `b28b967a` | đọc (view) | `address,string,string,string,string,uint256,uint256,bool,bool,string,string` |
| `disableBranchNetV3(address,uint256)` | `b88bf17c` | ghi (nonpayable) | `` |
| `economyVault()` | `00ae9de5` | đọc (view) | `address` |
| `enableBranchNetV3(address,uint256)` | `d2edec12` | ghi (nonpayable) | `` |
| `enableBranchNetV3FromBranch(address,uint256)` | `97e6c4ac` | ghi (nonpayable) | `` |
| `existsInNew(uint256)` | `f000ec2c` | đọc (view) | `bool` |
| `getActiveAgents()` | `86b909fd` | đọc (view) | `address[]` |
| `getActiveAgentsCount()` | `2469eac9` | đọc (view) | `uint256` |
| `getAgent(address)` | `fb3551ff` | đọc (view) | `tuple` |
| `getAgentAllDelegations(address)` | `4d18ef08` | đọc (view) | `tuple[]` |
| `getAgentAnalytics(address)` | `26c39e55` | đọc (view) | `tuple` |
| `getAgentBranchIds(address)` | `5e8bd0ee` | đọc (view) | `uint256[]` |
| `getAgentCoOwnerWallets(address)` | `c42045e4` | đọc (view) | `address[]` |
| `getAgentCoOwners(address)` | `70934e87` | đọc (view) | `tuple[]` |
| `getAgentDelegations(address)` | `f4c80d4b` | đọc (view) | `tuple[]` |
| `getAgentFromDomain(string)` | `d87fc49a` | đọc (view) | `address,uint256` |
| `getAgentManagerWallets(address)` | `59880ae7` | đọc (view) | `address[]` |
| `getAgentManagers(address)` | `4968f53d` | đọc (view) | `tuple[]` |
| `getAgentRevenueDetail(address)` | `cd3ce70b` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `getAgentStatusSummary(address,uint256)` | `4dda4a72` | đọc (view) | `bool,bool[4],bool,bool,bool,uint256` |
| `getAgents(address[])` | `686582c1` | đọc (view) | `tuple[]` |
| `getAgentsByPermission(uint8)` | `2b19d4cc` | đọc (view) | `address[]` |
| `getAgentsBySuperAdmin(address)` | `5a9360b9` | đọc (view) | `address[]` |
| `getAgentsByTimePeriod(string,uint256)` | `92249169` | đọc (view) | `address[]` |
| `getAgentsInfoPaginated(uint256,uint256,string,bool,uint256,uint256)` | `4b1427cb` | đọc (view) | `tuple[],uint256,uint256,uint256` |
| `getAgentsInfoPaginatedWithPemissions(uint256,uint256,string,bool,uint256,uint256,bool[4])` | `9d98fdf8` | đọc (view) | `tuple[],uint256,uint256,uint256` |
| `getAgentsInfoPaginatedWithPemissionsSearch(uint256,uint256,string,bool,uint256,uint256,bool[4],string)` | `8be560f5` | đọc (view) | `tuple[],uint256,uint256,uint256` |
| `getAgentsInfoPaginatedWithSearch(uint256,uint256,string,bool,uint256,uint256,string)` | `10bd2595` | đọc (view) | `tuple[],uint256,uint256,uint256` |
| `getAgentsSorted(string,bool,uint256)` | `aa97a03a` | đọc (view) | `address[],uint256[]` |
| `getAgentsSortedByTimeRange(uint256,uint256,string,bool,uint256)` | `23fe528d` | đọc (view) | `tuple[]` |
| `getAllAgents()` | `860e4ac6` | đọc (view) | `address[]` |
| `getAllAgentsInfo()` | `a1d74bc9` | đọc (view) | `tuple[]` |
| `getContractStatus()` | `c032846b` | đọc (view) | `string,bool,uint256,uint256` |
| `getDashboardMetrics()` | `d46fc381` | đọc (view) | `tuple,uint256[4],uint256,uint256` |
| `getDashboardMetricsByPeriod(uint256,uint256)` | `36a98dce` | đọc (view) | `uint256,uint256,uint256,uint256,uint256[4],uint256` |
| `getDeletedAgentd()` | `9c592495` | đọc (view) | `tuple[]` |
| `getDeletedAgentsPaginated(uint256,uint256,string)` | `51007795` | đọc (view) | `tuple[],uint256,uint256,uint256` |
| `getFullPermissionAgents()` | `d1f11b49` | đọc (view) | `address[]` |
| `getIQRSCByAgentFromFactory(address,uint256)` | `bb550498` | đọc (view) | `tuple` |
| `getNetCafeSCByAgentFromFactory(address,uint256)` | `a00b4af2` | đọc (view) | `tuple` |
| `getNetCafeV3License(address,uint256)` | `49daa53d` | đọc (view) | `tuple` |
| `getPerformanceLeaderboard(uint256)` | `1eaba802` | đọc (view) | `address[],uint256[]` |
| `getRobotSCByAgentFromFactory(address,uint256)` | `c96cb5de` | đọc (view) | `tuple` |
| `getSubLocationCount(address)` | `f5189cdf` | đọc (view) | `uint256` |
| `getSuperAdminsByCompanyAdmin(address)` | `f7f611ee` | đọc (view) | `address[]` |
| `getSystemAnalytics()` | `20ee87be` | đọc (view) | `uint256,uint256,uint256,uint256,uint256,uint256[4]` |
| `getUserRole(address)` | `27820851` | đọc (view) | `bool,bool,bool,address` |
| `getVersion()` | `0d8e6e2c` | đọc (view) | `string` |
| `grantPermissionsForBranchModules(address,bool[4],uint256[])` | `f7359b50` | ghi (nonpayable) | `` |
| `initialize()` | `8129fc1c` | ghi (nonpayable) | `` |
| `iqrFactory()` | `f7fbbfcb` | đọc (view) | `address` |
| `iqrTransfered(address,uint256)` | `ed7841f0` | đọc (view) | `bool` |
| `isAdmin(address)` | `24d7806c` | đọc (view) | `bool` |
| `isAgentDelegateActive(address,address)` | `8a1d91b7` | đọc (view) | `bool` |
| `isCompanyAdmin(address)` | `7816ea66` | đọc (view) | `bool` |
| `isDA(address)` | `24704895` | đọc (view) | `bool` |
| `isPaused()` | `b187bd26` | đọc (view) | `bool` |
| `loyaltyFactory()` | `7e447c67` | đọc (view) | `address` |
| `mAgentToDomain(address)` | `d0f6ed55` | đọc (view) | `string` |
| `mAgentToMainBranchId(address)` | `ddb0b8f6` | đọc (view) | `uint256` |
| `mBranchIdToBranch(uint256)` | `e1fc9511` | đọc (view) | `uint256,string,string,string,string,string,bool,bool,uint256` |
| `mDomainToBranchId(string)` | `a936982f` | đọc (view) | `uint256` |
| `mDomainToWallet(string)` | `ed0c0f3e` | đọc (view) | `address` |
| `monthlyAgents(uint256,uint256)` | `e489ec38` | đọc (view) | `address` |
| `mtdToken()` | `3761bdd4` | đọc (view) | `address` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `netCafeLicenses(address,uint256)` | `4989cfc2` | đọc (view) | `string,bool,uint256,uint256` |
| `notiAppId()` | `f55ccd9b` | đọc (view) | `bytes32` |
| `notiService()` | `e46aace1` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `pause()` | `8456cb59` | ghi (nonpayable) | `` |
| `paused()` | `5c975abb` | đọc (view) | `bool` |
| `permissionCacheValid(uint8)` | `f7926882` | đọc (view) | `bool` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `publicfullDB()` | `556453f5` | đọc (view) | `address` |
| `rebuildPermissionCache()` | `b652648b` | ghi (nonpayable) | `` |
| `recalculateAllAnalytics()` | `65935be1` | ghi (nonpayable) | `` |
| `removeAgentBranch(address,uint256)` | `55f8a128` | ghi (nonpayable) | `` |
| `removeSuperAdmin(address)` | `4902e4aa` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `rescueAdminAccess(address)` | `d1581599` | ghi (nonpayable) | `` |
| `revenueManager()` | `ff3cd61e` | đọc (view) | `address` |
| `revokeAgentDelegation(address,address)` | `f80f03f9` | ghi (nonpayable) | `` |
| `revokeUserDelegation(address)` | `c201db55` | ghi (nonpayable) | `` |
| `robotFactory()` | `25d8b68b` | đọc (view) | `address` |
| `searchAgentsAdvanced(string,bool[4],uint256,uint256,tuple)` | `` | đọc (view) | `address[]` |
| `searchAgentsByStoreName(string)` | `2fee4d27` | đọc (view) | `address[]` |
| `setAdmin(address)` | `704b6c02` | ghi (nonpayable) | `` |
| `setAgentCoOwner(address,uint256,address,string,string,bool,bool)` | `62df76d1` | ghi (nonpayable) | `` |
| `setAgentManager(address,uint256[],address,string,string,bool)` | `b7b505cd` | ghi (nonpayable) | `` |
| `setAgentModuleProvisioner(address)` | `c8e0ce6f` | ghi (nonpayable) | `` |
| `setAgentTaxPercent(address,uint8)` | `dc1172ef` | ghi (nonpayable) | `` |
| `setBranchAccessManager(address)` | `251c420c` | ghi (nonpayable) | `` |
| `setCompanyAdmin(address,bool)` | `66d0bf9b` | ghi (nonpayable) | `` |
| `setDA(address,bool)` | `05fbc319` | ghi (nonpayable) | `` |
| `setEconomyVault(address)` | `c5818c04` | ghi (nonpayable) | `` |
| `setFactoryContracts(address,address,address,address,address,address,address)` | `7f4b1f6c` | ghi (nonpayable) | `` |
| `setNotiServiceConfig(address,bytes32)` | `b8f2568a` | ghi (nonpayable) | `` |
| `setPublicfullDB(address)` | `45b8013d` | ghi (nonpayable) | `` |
| `superAdmin()` | `29575f6a` | đọc (view) | `address` |
| `superAdminToCompanyAdmin(address)` | `9facc8bc` | đọc (view) | `address` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `unpause()` | `3f4ba83a` | ghi (nonpayable) | `` |
| `updateAgent(address,string,string,string,string,bool[4],string,string,tuple[])` | `` | ghi (nonpayable) | `uint256[]` |
| `updateAgentAnalytics(address,uint256,uint256,uint256)` | `4acccbf9` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |
| `version()` | `54fd4d50` | đọc (view) | `string` |
| `yearlyAgents(uint256,uint256)` | `b46d1641` | đọc (view) | `address` |

## Event (27)

| Event |
|---|
| `AgentBranchRemoved(address,uint256,uint256)` |
| `AgentBranchesCreatedWithModules(address,uint256,string,bool[4],tuple[],uint256)` |
| `AgentContractSetCreated(address,uint256,bool,bool,bool,bool,uint256)` |
| `AgentCreated(address,string,uint256)` |
| `AgentDeleted(address,uint256)` |
| `AgentPerformanceUpdated(address,uint256,uint256)` |
| `AgentUpdated(address,uint256)` |
| `AnalyticsCalculated(address,uint256)` |
| `BranchContractSetCreated(address,uint256,address,address,address,address,address,uint256)` |
| `BulkOperationCompleted(string,uint256,uint256)` |
| `CompanyAdminAdded(address,uint256)` |
| `ContractPausedEvent(uint256)` |
| `ContractUnpaused(uint256)` |
| `ContractUpgraded(string,string,uint256)` |
| `DAAdded(address,uint256)` |
| `Initialized(uint64)` |
| `LoyaltyTokensMigrated(address,address,uint256)` |
| `LoyaltyTokensUnlocked(address,uint256)` |
| `NetCafeV3LicenseIssued(address,string,uint256)` |
| `NotiSenderWhitelisted(bytes32,address,address,uint256)` |
| `NotiServiceConfigUpdated(address,bytes32)` |
| `OwnershipTransferred(address,address)` |
| `PermissionGranted(address,uint8,uint256)` |
| `PermissionRevoked(address,uint8,uint256)` |
| `SuperAdminCreated(address,address,uint256)` |
| `SuperAdminSet(address)` |
| `Upgraded(address)` |
