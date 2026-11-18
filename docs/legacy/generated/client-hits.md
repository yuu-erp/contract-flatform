# Tên hàm/event được client nhắc tới (thô)

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Client: FE `59eabf9` — qt-core `b1802f32` — qt-widget `4f22433`. Khớp chuỗi `'tên'` hoặc `.tên(`; có thể trùng tên giữa contract, phải xác minh tay. Bỏ file ABI của FE (tên chứa `abi`). Tên ≤ 3 ký tự bị bỏ.

| Tên | Contract có tên này | FE | qt-core | qt-widget |
|---|---|---|---|---|
| `ACCESS_MANAGEMENT` | RestaurantOrder | — | — | — |
| `ACT_CREDIT` | PublicfullDB | — | — | — |
| `ACT_DEBIT` | PublicfullDB | — | — | — |
| `ACT_EXPIRE` | PublicfullDB | — | — | — |
| `ACT_GRANT` | PublicfullDB | — | — | — |
| `ADMIN_ROLE` | HistoryTracking | — | — | — |
| `AUDIT_ACCESS_UPDATED` | BranchAccessManager | — | — | — |
| `AUDIT_AREA_UPDATED` | BranchResourceRegistry | — | — | — |
| `AUDIT_BANK_ACCOUNT_ACTIVE_UPDATED` | BranchPaymentRegistry | — | — | — |
| `AUDIT_BANK_ACCOUNT_ADDED` | BranchPaymentRegistry | — | — | — |
| `AUDIT_BANK_ACCOUNT_DELETED` | BranchPaymentRegistry | — | — | — |
| `AUDIT_BANK_ACCOUNT_UPDATED` | BranchPaymentRegistry | — | — | — |
| `AUDIT_DELEGATION_UPDATED` | BranchAccessManager | — | — | — |
| `AUDIT_MODULE_STATE_SYNCED` | AgentModuleProvisioner | — | — | — |
| `AUDIT_NET_MODULE_PROVISIONED` | AgentModuleProvisioner | — | — | — |
| `AUDIT_POSITION_UPDATED` | BranchAccessManager | — | — | — |
| `AUDIT_RESOURCE_UPDATED` | BranchResourceRegistry | — | — | — |
| `AUDIT_STAFF_UPDATED` | BranchAccessManager | — | — | — |
| `AUDIT_TABLE_UPDATED` | BranchResourceRegistry | — | — | — |
| `AccessManagerUpdated` | AgentModuleProvisioner, BranchPaymentRegistry, BranchResourceRegistry | — | — | — |
| `AccountBalanceUpdated` | NetCafeStationV3 | 2: `apps/cyber/src/providers/event-provider.tsx:611`, `apps/cyber/src/providers/event-provider.tsx:649` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:145`, `projects/widget-food-order/FoodDishEventAbis.js:197` |
| `AccountCreatedWithPassword` | NetCafeUserV3 | — | — | — |
| `AccountPasswordChanged` | NetCafeUserV3 | — | — | — |
| `AccountProfileUpdated` | NetCafeUserV3 | — | — | — |
| `AccountUsernameChanged` | NetCafeUserV3 | — | — | — |
| `AddAndUpdateManager` | BranchManagement | 1: `packages/cyber-contracts/src/branch-management/branch-management.contract.ts:77` | — | — |
| `AddSC` | FreeGasStorage | — | — | — |
| `AgentAdded` | RevenueManager | — | — | — |
| `AgentAdminUpdated` | BranchAccessManager, BranchModuleRegistry | — | — | — |
| `AgentBranchRemoved` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1705` |
| `AgentBranchesCreatedWithModules` | EnhancedAgentManagement | — | — | — |
| `AgentContractSetCreated` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1754` |
| `AgentCreated` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1779` |
| `AgentDbsInitialised` | PublicfullDB | — | — | — |
| `AgentDeleted` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1798` |
| `AgentIQRCreated` | IQRFactory | — | — | — |
| `AgentIqrBeacon` | IQRFactory | — | — | — |
| `AgentLoyaltyCreated` | LoyaltyFactory | — | — | — |
| `AgentModuleStateUpdated` | BranchModuleRegistry | — | — | — |
| `AgentPerformanceUpdated` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1823` |
| `AgentUpdated` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1842` |
| `AllowedActionUpdated` | RestaurantLoyaltySystem | — | — | — |
| `AnalyticsCalculated` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1861` |
| `ApplyRewardVoucher` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:586` | — | — |
| `AreaAdded` | BranchResourceRegistry | — | — | — |
| `AreaUpdated` | BranchResourceRegistry | — | — | — |
| `AttendanceDataSet` | AttendanceSystem | — | — | — |
| `AttendanceStatusUpdated` | AttendanceSystem | — | — | — |
| `AuthorizedModuleUpdated` | EconomyVault | — | — | — |
| `AutoUpdateDishRankingsFromSortedIndex` | RestaurantReporting | — | — | — |
| `BE` | AttendanceSystem | — | — | — |
| `BRANCH_MANAGEMENT_IMP` | BMFactory | — | — | — |
| `BRANCH_REGISTRY` | RestaurantOrder | — | — | — |
| `BankAccountActiveUpdated` | BranchPaymentRegistry | — | — | — |
| `BankAccountAdded` | BranchPaymentRegistry | — | — | — |
| `BankAccountDeleted` | BranchPaymentRegistry | — | — | — |
| `BankAccountUpdated` | BranchPaymentRegistry | — | — | — |
| `BatchAddOptionToDish` | Management | — | — | — |
| `BatchCourseStatusUpdated` | RestaurantOrder | 3: `apps/cyber/src/providers/event-provider.tsx:506`, `apps/cyber/src/providers/event-provider.tsx:618`, `apps/cyber/src/providers/event-provider.tsx:657` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:96`, `projects/widget-food-order/FoodDishEventAbis.js:196` |
| `BatchSetAgentIQR` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:298` | — | 1: `projects/widget-test/src/abi.js:2248` |
| `BatchSetAgentNETV3` | EnhancedAgentManagement | 2: `apps/ops-agent/src/hooks/useUpdateAgent.ts:69`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:303` | — | 1: `projects/widget-test/src/abi.js:2266` |
| `BatchSetAllAgentIQR` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:308` | — | 1: `projects/widget-test/src/abi.js:2279` |
| `BatchSetAllAgentNETV3` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:313` | — | 1: `projects/widget-test/src/abi.js:2292` |
| `BatchSetAllPointsIQR` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:318` | — | 1: `projects/widget-test/src/abi.js:2305` |
| `BatchSetDishRankings` | RestaurantReporting | — | — | — |
| `BatchSetFinalize` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2323` |
| `BatchSetPointsIQR` | EnhancedAgentManagement | 2: `apps/ops-agent/src/hooks/useUpdateAgent.ts:72`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:323` | — | 1: `projects/widget-test/src/abi.js:2341` |
| `BatchUpdateCourseStatus` | RestaurantOrder | — | — | — |
| `BatchUpdateCustomerSegments` | RestaurantReporting | — | — | — |
| `BatchUpdateDailyData` | RestaurantReporting | — | — | — |
| `BatchUpdateDishRankings` | RestaurantReporting | — | — | — |
| `BatchUpdateDishStats` | RestaurantReporting | — | — | — |
| `BatchUpdateHideReview` | RestaurantOrder | — | — | — |
| `BatchUpdateTopDish` | Management | — | — | — |
| `BatchUpdateTopDishOptimal` | Management | — | — | — |
| `BeaconUpgraded` | AgentIQR, BMFactory, LoyaltyFactory, NetCafeV3Factory | — | — | — |
| `BranchAccessManagerUpdated` | RestaurantLoyaltySystem | — | — | — |
| `BranchAuditTrailUpdated` | AgentModuleProvisioner, BranchAccessManager, BranchPaymentRegistry, BranchResourceRegistry | — | — | — |
| `BranchCoOwnerProfileUpdated` | BranchAccessManager | — | — | — |
| `BranchContractSetCreated` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1916` |
| `BranchCreated` | BranchManagement | — | — | — |
| `BranchDeactivated` | BranchManagement | — | — | — |
| `BranchManagerProfileUpdated` | BranchAccessManager | — | — | — |
| `BranchManagerUpdated` | BranchAccessManager | — | — | — |
| `BranchModuleStateUpdated` | BranchModuleRegistry | — | — | — |
| `BranchPaymentAccountLinked` | BranchPaymentRegistry | — | — | — |
| `BranchPaymentAccountUnlinked` | BranchPaymentRegistry | — | — | — |
| `BranchPaymentRegistryUpdated` | Management, RestaurantOrder | — | — | — |
| `BranchResourceRegistryUpdated` | Management | — | — | — |
| `BranchUpdated` | BranchManagement | — | — | — |
| `BulkOperationCompleted` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1941` |
| `COMPANY_ADMIN_ROLE` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2348` |
| `CalculateAndValidateOptions` | Management | — | — | — |
| `CalculateOrder` | Management | — | — | — |
| `CallStaff` | RestaurantOrder | — | — | — |
| `CampaignCreated` | RestaurantLoyaltySystem | — | — | — |
| `CampaignExecuted` | RestaurantLoyaltySystem | — | — | — |
| `CampaignPaused` | RestaurantLoyaltySystem | — | — | — |
| `CampaignResumed` | RestaurantLoyaltySystem | — | — | — |
| `CampaignUpdated` | RestaurantLoyaltySystem | — | — | — |
| `CategoryRemoved` | Management | 2: `apps/cyber/src/providers/event-provider.tsx:628`, `apps/cyber/src/providers/event-provider.tsx:666` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:58`, `projects/widget-food-order/FoodDishEventAbis.js:193` |
| `CheckAgentCreated` | StaffAgentStore | — | — | — |
| `CheckAgentExisted` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:67` | — | 1: `projects/widget-test/src/abi.js:2367` |
| `CheckInRecorded` | AttendanceSystem | — | — | — |
| `CheckOutRecorded` | AttendanceSystem | — | — | — |
| `CloseSessionByStaff` | RestaurantOrder | — | — | — |
| `CoOwnerRoleUpdated` | NetCafeManagementV3 | — | — | — |
| `CoOwnerUpdated` | BranchAccessManager | — | — | — |
| `CompanyAdminAdded` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1960` |
| `ComparePeriods` | RestaurantReporting | — | — | — |
| `ConfirmOrder` | RestaurantOrder | — | — | — |
| `ContractDeactivated` | AgentIQR | — | — | — |
| `ContractPausedEvent` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1973` |
| `ContractRegistration` | FreeGasStorage | — | — | — |
| `ContractUnpaused` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:1986` |
| `ContractUpgraded` | EnhancedAgentManagement, IQRFactory, RevenueManager | — | — | 1: `projects/widget-test/src/abi.js:2011` |
| `CorrectDailyStats` | RestaurantReporting | — | — | — |
| `CorrectDishStats` | RestaurantReporting | — | — | — |
| `CourseStatusUpdated` | RestaurantOrder | 3: `apps/cyber/src/providers/event-provider.tsx:505`, `apps/cyber/src/providers/event-provider.tsx:619`, `apps/cyber/src/providers/event-provider.tsx:658` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:106`, `projects/widget-food-order/FoodDishEventAbis.js:196` |
| `CreateBanner` | Management | — | — | — |
| `CreateCategory` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:78` | — | — |
| `CreateDigitalMenu` | Management | — | — | — |
| `CreateDiscount` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:229` | — | — |
| `CreateDish` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:141` | — | — |
| `CreateDishOptions` | Management | — | — | — |
| `CreatePosition` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:174` | — | — |
| `CreateRewardVoucher` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/voucher/hooks/use-create-voucher.ts:33`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:569` | — | — |
| `CreateSessionForTable` | RestaurantOrder | — | — | 3: `projects/widget-dev-login/LoginService.js:196`, `projects/widget-dev-login/LoginService.js:199`, `projects/widget-dev-login/LoginAbis.qml:112` |
| `CreateSessionTable` | RestaurantOrder | 4: `apps/cyber/src/providers/event-provider.tsx:580`, `apps/cyber/src/providers/event-provider.tsx:581`, `apps/cyber/src/providers/event-provider.tsx:623`, `apps/cyber/src/providers/event-provider.tsx:662` | — | — |
| `CreateStaff` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:129` | — | — |
| `CreateTC` | Management | — | — | — |
| `CreateUniform` | Management | — | — | — |
| `CreateWorkingShift` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:89` | — | — |
| `CustomerCheckIn` | RestaurantOrder | — | — | — |
| `CustomerTierChanged` | RestaurantLoyaltySystem | 3: `apps/cyber/src/providers/event-provider.tsx:363`, `apps/cyber/src/providers/event-provider.tsx:622`, `apps/cyber/src/providers/event-provider.tsx:661` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:178`, `projects/widget-food-order/FoodDishEventAbis.js:198` |
| `DAAdded` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2030` |
| `DA_ROLE` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2380` |
| `DEFAULT_ADMIN_ROLE` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `DailyReportUpdated` | AttendanceSystem | — | — | — |
| `DebitCompleted` | RestaurantLoyaltySystem | — | — | — |
| `DebugSingleCancelRefund` | RestaurantOrder | — | — | — |
| `DelegationCreated` | BranchAccessManager | — | — | — |
| `DelegationRevoked` | BranchAccessManager | — | — | — |
| `DeleteDishOption` | Management | — | — | — |
| `DeleteDishOptionFromDishCode` | Management | — | — | — |
| `DiscountCodeUseReleased` | Management | — | — | — |
| `DiscountUseReleaseFailed` | RestaurantOrder | — | — | — |
| `DiscountUseReleased` | RestaurantOrder | — | — | — |
| `DishQuantityReset` | Management | 2: `apps/cyber/src/providers/event-provider.tsx:625`, `apps/cyber/src/providers/event-provider.tsx:664` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:27`, `projects/widget-food-order/FoodDishEventAbis.js:192` |
| `DishQuantityUpdated` | Management | 2: `apps/cyber/src/providers/event-provider.tsx:624`, `apps/cyber/src/providers/event-provider.tsx:663` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:16`, `projects/widget-food-order/FoodDishEventAbis.js:192` |
| `DishRemoved` | Management | 2: `apps/cyber/src/routes/_authenticated/user/_authenticated/order.tsx:81`, `apps/cyber/src/routes/_authenticated/user/_authenticated/order.tsx:85` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:37`, `projects/widget-food-order/FoodDishEventAbis.js:193` |
| `DishResetScheduleUpdated` | Management | — | — | — |
| `EVENT_FOOD_PAID` | RestaurantLoyaltySystem | 7: `apps/cyber/src/pages/owner/loyalty/campaign/constants.ts:6`, `apps/cyber/src/pages/owner/loyalty/history/components/history-detail.tsx:13`, `apps/cyber/src/pages/owner/loyalty/history/components/history-detail.tsx:16`, `apps/cyber/src/pages/owner/loyalty/campaign/components/campaign-form.tsx:62` … | — | — |
| `EVENT_NET_SETTLED` | RestaurantLoyaltySystem | 7: `apps/cyber/src/pages/owner/loyalty/campaign/constants.ts:9`, `apps/cyber/src/pages/owner/loyalty/history/components/history-detail.tsx:14`, `apps/cyber/src/pages/owner/loyalty/history/components/history-detail.tsx:17`, `apps/cyber/src/pages/owner/loyalty/campaign/components/campaign-form.tsx:68` … | — | — |
| `EVENT_TOPUP` | RestaurantLoyaltySystem | 8: `apps/cyber/src/pages/owner/loyalty/campaign/constants.ts:3`, `apps/cyber/src/pages/owner/loyalty/history/components/history-detail.tsx:12`, `apps/cyber/src/pages/owner/loyalty/history/components/history-detail.tsx:15`, `apps/cyber/src/pages/owner/loyalty/campaign/components/campaign-form.tsx:58` … | — | — |
| `EarnPointsConfirmed` | RestaurantLoyaltySystem | — | — | — |
| `EarnPointsDiscarded` | RestaurantLoyaltySystem | — | — | — |
| `EarnPointsFinalizeFailed` | RestaurantOrder | — | — | — |
| `EarnPointsLocked` | RestaurantLoyaltySystem | — | — | — |
| `EconomyVaultUpdated` | NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, RestaurantLoyaltySystem | — | — | — |
| `FINANCE` | RestaurantLoyaltySystem | — | — | — |
| `FOOD_MODULE` | PublicfullDB, RestaurantLoyaltySystem | 5: `apps/wedget-order/src/hooks/use-get-food-max-percent.ts:5`, `apps/wedget-order/src/hooks/query-keys.ts:22`, `apps/cyber/src/pages/owner/loyalty/point/constants.ts:52`, `apps/cyber/src/pages/owner/loyalty/history-tracking/item-transaction.tsx:139` … | — | 2: `projects/widget-food-order/SdkHash.js:22`, `projects/widget-food-order/SdkHash.js:25` |
| `FinalizeAgentContractSet` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:277` | — | 1: `projects/widget-test/src/abi.js:2399` |
| `FinalizeBranchContractSet` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2417` |
| `GROUP_DELETE_BATCH_SIZE` | RestaurantLoyaltySystem | — | — | — |
| `GamePlayRecorded` | NetCafeDashboardV3 | — | — | — |
| `Get5FavoriteDishesByDay` | RestaurantReporting | — | — | — |
| `Get5TopDishesByTime` | Management | — | — | — |
| `GetActiveStaffAddressesByDate` | BranchAccessManager | — | — | — |
| `GetActiveStaffAddressesByMonth` | BranchAccessManager | — | — | — |
| `GetActiveStaffByDate` | BranchAccessManager | — | — | — |
| `GetActiveStaffByMonth` | BranchAccessManager | — | — | — |
| `GetActiveStaffCountByDate` | BranchAccessManager | — | — | — |
| `GetActiveStaffCountByMonth` | BranchAccessManager | — | — | — |
| `GetAllDiscounts` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:275` | — | 3: `projects/widget-food-order/FoodIqrAbis.js:414`, `projects/widget-food-order/FoodIqrAbis.js:416`, `projects/widget-food-order/DiscountService.js:103` |
| `GetAllDiscountsPagination` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:283` | — | — |
| `GetAllDishCodes` | Management | — | — | — |
| `GetAllDishInfosByCat` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:108` | — | — |
| `GetAllDishOptions` | Management | — | — | — |
| `GetAllDishOptionsFromDishCode` | Management | — | — | — |
| `GetAllDishOptionsFromDishCodePagination` | Management | — | — | — |
| `GetAllDishOptionsPagination` | Management | — | — | — |
| `GetAllDishesPagination` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:132` | — | 3: `projects/widget-food-order/FoodIqrAbis.js:233`, `projects/widget-food-order/FoodIqrAbis.js:246`, `projects/widget-food-order/FoodCatalog.js:93` |
| `GetAllOrders` | RestaurantOrder | — | — | — |
| `GetAllPositions` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:205` | — | — |
| `GetAllStaff` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:209` | — | — |
| `GetAllTransactionsPagination` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:348` | — | — |
| `GetAllTransactionsPaginationByType` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:359` | — | — |
| `GetAutoDiscountsTypeAllForUser` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:299` | — | — |
| `GetBannersPagination` | Management | — | — | — |
| `GetCategories` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:63` | — | — |
| `GetCategoriesPagination` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:70` | — | 3: `projects/widget-food-order/FoodIqrAbis.js:5`, `projects/widget-food-order/FoodIqrAbis.js:18`, `projects/widget-food-order/FoodCatalog.js:68` |
| `GetCategory` | Management | — | — | — |
| `GetCoursesByOrderId` | RestaurantOrder | — | — | — |
| `GetCoursesBySession` | RestaurantOrder | — | — | — |
| `GetDailyAgeGroup` | RestaurantReporting | — | — | — |
| `GetDailyAgeGroups` | RestaurantReporting | — | — | — |
| `GetDailyComparison` | RestaurantReporting | — | — | — |
| `GetDailyCustomerSegments` | RestaurantReporting | — | — | — |
| `GetDailyDineInStats` | RestaurantReporting | — | — | — |
| `GetDailyFemaleCustomers` | RestaurantReporting | — | — | — |
| `GetDailyFoodRating` | RestaurantReporting | — | — | — |
| `GetDailyFoodRatings` | RestaurantReporting | — | — | — |
| `GetDailyNewCustomers` | RestaurantReporting | — | — | — |
| `GetDailyReport` | RestaurantReporting | — | — | — |
| `GetDailySeries` | RestaurantReporting | — | — | — |
| `GetDailyServiceRating` | RestaurantReporting | — | — | — |
| `GetDailyServiceRatings` | RestaurantReporting | — | — | — |
| `GetDailyStats` | RestaurantReporting | — | — | — |
| `GetDailyTakeAwayStats` | RestaurantReporting | — | — | — |
| `GetDiscount` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:294` | — | 3: `projects/widget-food-order/FoodIqrAbis.js:519`, `projects/widget-food-order/FoodIqrAbis.js:527`, `projects/widget-food-order/DiscountService.js:395` |
| `GetDiscountBasic` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:218` | — | — |
| `GetDish` | Management | — | — | — |
| `GetDishBasic` | Management | — | — | — |
| `GetDishCount` | Management | — | — | — |
| `GetDishDailyReport` | RestaurantReporting | — | — | — |
| `GetDishDailyStats` | RestaurantReporting | — | — | — |
| `GetDishInfosByCat` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:119` | — | 4: `projects/widget-food-order/FoodIqrAbis.js:76`, `projects/widget-food-order/FoodIqrAbis.js:94`, `projects/widget-food-order/FoodCatalog.js:92`, `projects/widget-food-order/FoodCatalog.js:99` |
| `GetDishMonthlyReport` | RestaurantReporting | — | — | — |
| `GetDishOptionById` | Management | — | — | — |
| `GetDishPerformanceSummary` | RestaurantReporting | — | — | — |
| `GetDishRankDailyComparison` | RestaurantReporting | — | — | — |
| `GetDishRankMonthlyComparison` | RestaurantReporting | — | — | — |
| `GetDishRanking` | RestaurantReporting | — | — | — |
| `GetDishRankingHistory` | RestaurantReporting | — | — | — |
| `GetDishRankingTrend` | RestaurantReporting | — | — | — |
| `GetDishReport` | RestaurantReporting | — | — | — |
| `GetDishStats` | RestaurantReporting | — | — | — |
| `GetDishes` | Management | — | — | — |
| `GetHistoricalSummary` | RestaurantReporting | — | — | — |
| `GetMonthlyComparison` | RestaurantReporting | — | — | — |
| `GetMonthlyReport` | RestaurantReporting | — | — | — |
| `GetMonthlyStats` | RestaurantReporting | — | — | — |
| `GetNewDishes` | Management | — | — | — |
| `GetNewDishesWithLimit` | Management | — | — | — |
| `GetOrderById` | RestaurantOrder | — | — | — |
| `GetOrderCreatedTimes` | RestaurantReporting | — | — | — |
| `GetOrderStatusCounts` | RestaurantOrder | — | — | — |
| `GetOrders` | RestaurantOrder | — | — | — |
| `GetOrdersAcknowlegdePaginationByStatus` | RestaurantOrder | — | — | — |
| `GetOrdersByStatus` | RestaurantOrder | — | — | — |
| `GetOrdersPaginationByStatus` | RestaurantOrder | — | — | — |
| `GetOwnerDashboard` | RestaurantReporting | — | — | — |
| `GetPosition` | BranchAccessManager | — | — | — |
| `GetPositionById` | BranchAccessManager | — | — | — |
| `GetRanksCreatedTimes` | Management | — | — | — |
| `GetRatingComparison` | RestaurantReporting | — | — | — |
| `GetRecentDishes` | Management | — | — | — |
| `GetRestaurantInfo` | Management | — | — | — |
| `GetRestaurantOverview` | RestaurantReporting | — | — | — |
| `GetStaff` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:213` | — | — |
| `GetStaffInfo` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:161` | — | — |
| `GetStaffRolePayment` | BranchAccessManager | — | — | — |
| `GetStaffsPagination` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:148` | — | — |
| `GetTopDishesByDay` | RestaurantReporting | — | — | — |
| `GetTopDishesByDayDashboard` | RestaurantReporting | — | — | — |
| `GetTopDishesByMonth` | RestaurantReporting | — | — | — |
| `GetTopDishesByWeek` | RestaurantReporting | — | — | — |
| `GetTopDishesByYear` | RestaurantReporting | — | — | — |
| `GetTopDishesWithLimit` | Management | — | — | — |
| `GetUniformsPagination` | Management | — | — | — |
| `GetVoucherComparison` | RestaurantReporting | — | — | — |
| `GetVoucherReport` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:335` | — | — |
| `GetVoucherStats` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:339` | — | — |
| `GetVoucherUseHistory` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:346` | — | — |
| `GetWorkingShiftsPagination` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:74` | — | — |
| `GetYearlyRevenueByRealYear` | RestaurantReporting | — | — | — |
| `GrantStaffRole` | RestaurantReporting | — | — | — |
| `GroupAdded` | NetCafeManagementV3 | — | — | — |
| `GroupDeleted` | NetCafeManagementV3 | — | — | — |
| `GroupUpdated` | NetCafeManagementV3 | — | — | — |
| `HISTORY_TRACKING_IMP` | BMFactory | — | — | — |
| `HistoryRecorded` | HistoryTracking | — | — | — |
| `HistoryTrackingUpdated` | BranchManagement | — | — | — |
| `ICARD_VISA` | RestaurantOrder | — | — | — |
| `Initialized` | AgentIQR, AgentModuleProvisioner, AttendanceSystem, BMFactory, BranchAccessManager, BranchDashboard, BranchManagement, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, HistoryTracking, IQRFactory, LoyaltyFactory, Management, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, NetCafeV3Factory, PublicfullDB, RestaurantLoyaltySystem, RestaurantOrder, RestaurantReporting, RevenueManager, StaffAgentStore | — | — | 2: `shared/file-transfer/src/file.abi.js:235`, `projects/widget-test/src/abi.js:2043` |
| `InvoiceRewardPercentUpdated` | RestaurantLoyaltySystem | — | — | — |
| `IsDishNew` | RestaurantReporting | — | — | — |
| `IsRoleAllowedForPosition` | BranchAccessManager | — | — | — |
| `LockTableForReservation` | RestaurantOrder | — | — | — |
| `LockTableSession` | RestaurantOrder | — | — | — |
| `LockedPointMemberSet` | RestaurantLoyaltySystem | — | — | — |
| `LoyaltyTokensMigrated` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2068` |
| `LoyaltyTokensUnlocked` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2087` |
| `LoyaltyUpdated` | NetCafeSessionV3, NetCafeSpendV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `MANAGEMENT` | AgentIQR, IQRFactory, RestaurantOrder, RestaurantReporting | — | — | — |
| `MAX_ATTRIBUTES_PER_VARIANT` | Management | — | — | — |
| `MAX_BACKFILL_TXIDS` | RestaurantLoyaltySystem | — | — | — |
| `MAX_BATCHES_PER_DEBIT` | RestaurantLoyaltySystem | — | — | — |
| `MAX_BATCH_UPDATE_SIZE` | Management | — | — | — |
| `MAX_BRANCHES_PER_GRANT` | EnhancedAgentManagement | — | — | — |
| `MAX_BRANCHES_VIEW` | BranchManagement | — | — | — |
| `MAX_DAY_ARR` | AttendanceSystem | — | — | — |
| `MAX_DELEGATES_PER_AGENT` | BranchAccessManager | — | — | — |
| `MAX_DISHES_PER_CATEGORY` | Management | — | — | — |
| `MAX_ELIGIBLE_CAMPAIGNS` | RestaurantLoyaltySystem | — | — | — |
| `MAX_INGREDIENTS_PER_DISH` | Management | — | — | — |
| `MAX_LOCKED_BATCHES_PER_LOCK` | RestaurantLoyaltySystem | — | — | — |
| `MAX_MANAGERS_VIEW` | BranchManagement | — | — | — |
| `MAX_MODULE_STATE_BATCH` | AgentModuleProvisioner | — | — | — |
| `MAX_PROVISION_BATCH` | AgentModuleProvisioner | — | — | — |
| `MAX_REVENUE_ENTRIES_PER_AGENT` | RevenueManager | — | — | — |
| `MAX_SEARCH_RESULTS` | EnhancedAgentManagement, Management | — | — | — |
| `MAX_STACKING_ELIGIBLE` | RestaurantLoyaltySystem | — | — | — |
| `MAX_TOP_AGENTS_LIMIT` | RevenueManager | — | — | — |
| `MAX_TOP_DISH_LIMIT` | RestaurantReporting | — | — | — |
| `MAX_VARIANTS_PER_DISH` | Management | — | — | — |
| `MODULE_IQR` | BranchModuleRegistry | 1: `apps/ops-agent/scratch/hashes.js:3` | — | — |
| `MODULE_LOYALTY` | BranchModuleRegistry | 1: `apps/ops-agent/scratch/hashes.js:5` | — | — |
| `MODULE_NET` | BranchModuleRegistry, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | 1: `apps/ops-agent/scratch/hashes.js:4` | — | — |
| `MODULE_ROBOT` | BranchModuleRegistry | 1: `apps/ops-agent/scratch/hashes.js:6` | — | — |
| `ManagementBeacon` | AgentIQR, IQRFactory | — | — | — |
| `ManagerAdded` | BranchManagement | — | — | — |
| `ManagerRemoved` | BranchManagement | — | — | — |
| `ManagerUpdated` | BranchManagement | — | — | — |
| `ManualGrantEnabledSet` | RestaurantLoyaltySystem | — | — | — |
| `ManualRequestCreated` | RestaurantLoyaltySystem | — | — | — |
| `ManualRequestProcessed` | RestaurantLoyaltySystem | — | — | — |
| `MasterPool` | RestaurantOrder | — | — | — |
| `MemberAssignedToGroup` | RestaurantLoyaltySystem | — | — | — |
| `MemberDeleted` | RestaurantLoyaltySystem | — | — | — |
| `MemberGroupCreated` | RestaurantLoyaltySystem | — | — | — |
| `MemberGroupDeleted` | RestaurantLoyaltySystem | — | — | — |
| `MemberGroupDeletionProgress` | RestaurantLoyaltySystem | — | — | — |
| `MemberGroupDeletionStarted` | RestaurantLoyaltySystem | — | — | — |
| `MemberGroupUpdated` | RestaurantLoyaltySystem | — | — | — |
| `MemberLocked` | RestaurantLoyaltySystem | — | — | — |
| `MemberRegistered` | RestaurantLoyaltySystem | — | — | — |
| `MemberRemovedFromGroup` | RestaurantLoyaltySystem | — | — | — |
| `MemberUnlocked` | RestaurantLoyaltySystem | — | — | — |
| `MemberUpdated` | BranchAccessManager, RestaurantLoyaltySystem | — | — | — |
| `MergeMoreTableByStaff` | RestaurantOrder | — | — | — |
| `MergeMoreTableFromStaff` | RestaurantOrder | — | — | — |
| `MergeTableByStaff` | RestaurantOrder | — | — | — |
| `MergeTableFromStaff` | RestaurantOrder | — | — | — |
| `ModuleContractUpdated` | NetCafeSessionV3, NetCafeStationV3, NetCafeTopUpV3 | — | — | — |
| `ModuleProvisionerUpdated` | BranchModuleRegistry, EconomyVault, NetCafeV3Factory | — | — | — |
| `ModuleSpendPolicyUpdated` | RestaurantLoyaltySystem | — | — | — |
| `ModuleStateSynced` | AgentModuleProvisioner | — | — | — |
| `MonthlyReportGenerated` | AttendanceSystem | — | — | — |
| `NET_MODULE` | PublicfullDB, RestaurantLoyaltySystem | 4: `apps/sidebar-cyber/src/constants/loyalty.ts:3`, `apps/cyber/src/pages/owner/loyalty/point/constants.ts:51`, `apps/cyber/src/pages/owner/loyalty/history-tracking/item-transaction.tsx:141`, `apps/cyber/src/pages/owner/loyalty/loyalty-tracking/components/ItemTransaction.tsx:197` | 4: `CyberSidebarStationModel.hpp:260`, `CyberSidebarConstants.hpp:21`, `CyberEventHub.hpp:18`, `CyberSidebarStationModel.cpp:749` | 1: `projects/widget-session-uptime/SessionStats.js:3` |
| `NetCafeBranchCreated` | NetCafeV3Factory | — | — | — |
| `NetCafeV3LicenseIssued` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2112` |
| `NetModuleProvisioned` | AgentModuleProvisioner | — | — | — |
| `NoShowHandled` | RestaurantOrder | — | — | — |
| `NotInPositionEndRecorded` | AttendanceSystem | — | — | — |
| `NotInPositionStartRecorded` | AttendanceSystem | — | — | — |
| `NotiSenderWhitelisted` | EnhancedAgentManagement | — | — | — |
| `NotiServiceConfigUpdated` | EnhancedAgentManagement | — | — | — |
| `NotificationSent` | BranchManagement | — | — | — |
| `ORDER` | AgentIQR, IQRFactory | — | — | — |
| `OTPGenerated` | NetCafeUserV3 | 3: `apps/cyber/src/pages/staff/staff-accounts/components/dialog-add-account.tsx:122`, `apps/cyber/src/pages/staff/staff-accounts/components/dialog-add-account.tsx:131`, `apps/cyber/src/pages/staff/staff-accounts/components/dialog-add-account.tsx:134` | — | — |
| `OrderAcknowledged` | RestaurantOrder | — | — | — |
| `OrderBeacon` | AgentIQR, IQRFactory | — | — | — |
| `OrderCancelled` | AgentIQR, RestaurantOrder | 9: `apps/sidebar-cyber/src/providers/event-provider.tsx:139`, `apps/sidebar-cyber/src/providers/event-provider.tsx:153`, `apps/sidebar-cyber/src/hooks/use-processing-order-count.ts:34`, `apps/sidebar-cyber/src/hooks/use-processing-order-count.ts:39` … | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:84`, `projects/widget-food-order/FoodDishEventAbis.js:194` |
| `OrderCompleted` | AgentIQR | — | — | — |
| `OrderConfirmed` | RestaurantOrder | 4: `apps/sidebar-cyber/src/providers/event-provider.tsx:138`, `apps/sidebar-cyber/src/providers/event-provider.tsx:152`, `apps/sidebar-cyber/src/hooks/use-processing-order-count.ts:33`, `apps/sidebar-cyber/src/hooks/use-processing-order-count.ts:38` | 1: `CyberSidebarEventWatcher.cpp:246` | — |
| `OrderCreated` | AgentIQR | — | — | — |
| `OrderHistoryAdded` | RestaurantOrder | — | — | — |
| `OrderMade` | RestaurantOrder | 9: `apps/sidebar-cyber/src/providers/event-provider.tsx:137`, `apps/sidebar-cyber/src/providers/event-provider.tsx:151`, `apps/sidebar-cyber/src/hooks/use-processing-order-count.ts:32`, `apps/sidebar-cyber/src/hooks/use-processing-order-count.ts:37` … | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:73`, `projects/widget-food-order/FoodDishEventAbis.js:193` |
| `OrderNotificationDismissed` | RestaurantOrder | — | — | — |
| `OrderNotificationSent` | RestaurantOrder | — | — | — |
| `OrderTransferAccepted` | RestaurantOrder | — | — | — |
| `OrderTransferCancelled` | RestaurantOrder | — | — | — |
| `OrderTransferDeclined` | RestaurantOrder | — | — | — |
| `OrderTransferRequested` | RestaurantOrder | — | — | — |
| `OwnershipTransferred` | AgentIQR, AgentModuleProvisioner, AttendanceSystem, BMFactory, BranchAccessManager, BranchDashboard, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, IQRFactory, LoyaltyFactory, Management, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, NetCafeV3Factory, PublicfullDB, RestaurantLoyaltySystem, RestaurantOrder, RestaurantReporting, RevenueManager, StaffAgentStore | — | — | 1: `projects/widget-test/src/abi.js:2131` |
| `PAYMENT_METHOD_COUNT` | BranchManagement | — | — | — |
| `PAYMENT_REGISTRY` | RestaurantOrder | — | — | — |
| `PERM_ACCESS_MANAGE` | BranchAccessManager | — | — | — |
| `PERM_BRANCH_DASHBOARD_VIEW` | BranchDashboard | — | — | — |
| `PERM_IQR_FINANCE` | RestaurantOrder, RestaurantReporting | — | — | — |
| `PERM_IQR_MENU_MANAGE` | RestaurantReporting | — | — | — |
| `PERM_IQR_ORDER_STATUS_UPDATE` | RestaurantOrder | — | — | — |
| `PERM_IQR_STAFF_MANAGE` | AttendanceSystem | — | — | — |
| `PERM_IQR_TABLE_MANAGE` | RestaurantOrder | — | — | — |
| `PERM_NET_ADMIN` | BranchAccessManager, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `PERM_NET_PAYMENT_MANAGE` | BranchAccessManager, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `PERM_NET_SESSION_MANAGE` | BranchAccessManager, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `PERM_NET_SPEND_VIEW` | BranchAccessManager, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `PERM_NET_STATION_MANAGE` | BranchAccessManager, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `PERM_PAYMENT_REGISTRY_MANAGE` | BranchAccessManager, BranchPaymentRegistry | — | — | — |
| `PERM_RESOURCE_MANAGE` | BranchAccessManager | — | — | — |
| `POINTS` | IQRFactory, Management, RestaurantOrder | — | — | — |
| `PROPOSAL_EXPIRATION` | BranchManagement | — | — | — |
| `Paused` | RestaurantLoyaltySystem, RestaurantOrder | — | — | — |
| `PaymentCancelSettlement` | RestaurantOrder | — | — | — |
| `PaymentConfigUpdated` | NetCafeTopUpV3 | — | — | — |
| `PaymentConfirmed` | NetCafeTopUpV3, RestaurantOrder | 8: `apps/cyber/src/providers/event-provider.tsx:348`, `apps/cyber/src/providers/event-provider.tsx:615`, `apps/cyber/src/providers/event-provider.tsx:654`, `apps/cyber/src/components/dialog-topup-qr.tsx:32` … | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:166`, `projects/widget-food-order/FoodDishEventAbis.js:198` |
| `PaymentMade` | RestaurantOrder | 3: `apps/cyber/src/providers/event-provider.tsx:560`, `apps/cyber/src/providers/event-provider.tsx:620`, `apps/cyber/src/providers/event-provider.tsx:659` | — | — |
| `PaymentRegistryUpdated` | NetCafeTopUpV3 | — | — | — |
| `PaymentWithPoints` | RestaurantOrder | — | — | — |
| `PermissionGranted` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2156` |
| `PermissionRevoked` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2181` |
| `PermissionUpdated` | BranchAccessManager | — | — | — |
| `PerpetualBatchesExpirySet` | RestaurantLoyaltySystem | — | — | — |
| `PointHistorySynced` | PublicfullDB | — | — | — |
| `PointsBurnConfirmed` | RestaurantLoyaltySystem | — | — | — |
| `PointsLocked` | RestaurantLoyaltySystem | — | — | — |
| `PointsUnlocked` | RestaurantLoyaltySystem | — | — | — |
| `PointsUsedForPayment` | RestaurantLoyaltySystem | — | — | — |
| `PositionExists` | BranchAccessManager | — | — | — |
| `PricePolicyAdded` | NetCafeManagementV3 | — | — | — |
| `PricePolicyDeleted` | NetCafeManagementV3 | — | — | — |
| `PricePolicyStatusChanged` | NetCafeManagementV3 | — | — | — |
| `PricePolicyUpdated` | NetCafeManagementV3 | — | — | — |
| `ProductPriceUpdated` | Management | 2: `apps/cyber/src/providers/event-provider.tsx:627`, `apps/cyber/src/providers/event-provider.tsx:665` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:46`, `projects/widget-food-order/FoodDishEventAbis.js:193` |
| `ProposalCreated` | BranchManagement | 2: `apps/cyber/src/modules/notifications/hooks/use-notifications.ts:48`, `apps/cyber/src/modules/notifications/hooks/use-notifications.ts:54` | — | — |
| `ProposalExecuted` | BranchManagement | 2: `apps/cyber/src/modules/notifications/hooks/use-notifications.ts:49`, `apps/cyber/src/modules/notifications/hooks/use-notifications.ts:55` | — | — |
| `ProposalVoted` | BranchManagement | 2: `apps/cyber/src/modules/notifications/hooks/use-notifications.ts:50`, `apps/cyber/src/modules/notifications/hooks/use-notifications.ts:56` | — | — |
| `ProvisionerUpdated` | AgentModuleProvisioner | — | — | — |
| `PublicOTPGenerated` | NetCafeUserV3 | 3: `apps/cyber/src/pages/staff/staff-accounts/hooks/use-generate-otp-test.ts:38`, `apps/cyber/src/pages/staff/staff-accounts/hooks/use-generate-otp-test.ts:43`, `apps/cyber/src/pages/staff/staff-accounts/hooks/use-generate-otp-test.ts:48` | — | — |
| `QuerySearchResults` | PublicfullDB | — | — | — |
| `REASON_LOYALTY_CREDIT_A` | RestaurantLoyaltySystem | — | — | — |
| `REASON_LOYALTY_DEBIT_A` | RestaurantLoyaltySystem | — | — | — |
| `REASON_LOYALTY_DEBIT_B` | RestaurantLoyaltySystem | — | — | — |
| `REASON_LOYALTY_EXPIRE_B` | RestaurantLoyaltySystem | — | — | — |
| `REASON_LOYALTY_GRANT_B` | RestaurantLoyaltySystem | — | — | — |
| `REASON_NET_MANUAL_SPEND` | NetCafeSpendV3 | — | — | — |
| `REASON_NET_SESSION` | NetCafeSessionV3 | — | — | — |
| `REASON_NET_TOPUP` | NetCafeTopUpV3 | — | — | — |
| `REPORT` | IQRFactory | — | — | — |
| `ROLE_ADMIN` | RestaurantLoyaltySystem | — | — | — |
| `RedeemRewardVoucher` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/user/my-voucher/hooks/use-redeem-reward-voucher.ts:18`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:573` | — | — |
| `RefundConfirmed` | RestaurantOrder | — | — | — |
| `RegisterRestaurantInfo` | Management | — | — | — |
| `ReleaseDiscountCodeUsed` | Management | — | — | — |
| `RemoveBanner` | Management | — | — | — |
| `RemoveCategory` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:102` | — | — |
| `RemoveDigitalMenu` | Management | — | — | — |
| `RemoveDiscount` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:312` | — | — |
| `RemoveDish` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:180` | — | — |
| `RemovePosition` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:201` | — | — |
| `RemovePositionById` | BranchAccessManager | — | — | — |
| `RemoveSomeTablesFromSession` | RestaurantOrder | — | — | — |
| `RemoveTC` | Management | — | — | — |
| `RemoveUniform` | Management | — | — | — |
| `RemoveWorkingShift` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:121` | — | — |
| `Report` | RestaurantOrder | — | — | 2: `shared/cyber-widget/MeosCyber/CyberAbis.qml:51`, `projects/widget-test/src/abi.js:5167` |
| `ReportBeacon` | AgentIQR, IQRFactory | — | — | — |
| `ReportCheckin` | AttendanceSystem | — | — | — |
| `RequiredLogout` | NetCafeStationV3 | 3: `apps/sidebar-cyber/src/providers/event-provider.tsx:102`, `apps/sidebar-cyber/src/providers/event-provider.tsx:134`, `apps/sidebar-cyber/src/providers/event-provider.tsx:148` | — | — |
| `ReservationCancelled` | RestaurantOrder | — | — | — |
| `ReservationRuleUpdated` | RestaurantOrder | — | — | — |
| `ReservationUpdated` | RestaurantOrder | — | — | — |
| `ResolveDiscountByCodeHash` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:304` | — | — |
| `ResourceAdded` | BranchResourceRegistry | — | — | — |
| `ResourceRegistryUpdated` | NetCafeManagementV3 | — | — | — |
| `ResourceUpdated` | BranchResourceRegistry | — | — | — |
| `RevenueRecorded` | RevenueManager | — | — | — |
| `RevenueUpdated` | RevenueManager | — | — | — |
| `RevokeStaffRole` | RestaurantReporting | — | — | — |
| `RewardVoucherConsumed` | RestaurantLoyaltySystem | — | — | — |
| `RewardVoucherRestoreFailed` | RestaurantOrder | — | — | — |
| `RewardVoucherRestored` | RestaurantLoyaltySystem, RestaurantOrder | — | — | — |
| `RoleAdminChanged` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `RoleGranted` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `RoleRevoked` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `SCUsdt` | RestaurantOrder | — | — | — |
| `SUPER_ADMIN_ROLE` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2424` |
| `SearchCustomerByVector` | Management | — | — | — |
| `SeparateTableByStaff` | RestaurantOrder | — | — | — |
| `SeparateTableFromStaff` | RestaurantOrder | — | — | — |
| `ServiceIssueReported` | RestaurantOrder | — | — | — |
| `SessionCharged` | NetCafeSessionV3 | 2: `apps/cyber/src/providers/event-provider.tsx:609`, `apps/cyber/src/providers/event-provider.tsx:645` | — | — |
| `SessionClosed` | NetCafeSessionV3 | 2: `apps/cyber/src/providers/event-provider.tsx:608`, `apps/cyber/src/providers/event-provider.tsx:644` | — | — |
| `SessionContractUpdated` | NetCafeUserV3 | — | — | — |
| `SessionCreated` | RestaurantOrder | — | — | — |
| `SessionOpened` | NetCafeSessionV3 | 2: `apps/cyber/src/providers/event-provider.tsx:607`, `apps/cyber/src/providers/event-provider.tsx:643` | — | — |
| `SessionReservationCreated` | RestaurantOrder | — | — | — |
| `SetDishAsNotNew` | RestaurantReporting | — | — | — |
| `SetManagement` | RestaurantReporting | — | — | — |
| `SetRewardVoucherActive` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:715` | — | — |
| `SetTargetRevenue` | RestaurantReporting | — | — | — |
| `SharedContractsUpdated` | AgentModuleProvisioner | — | — | — |
| `SharedRegistriesUpdated` | NetCafeV3Factory | — | — | — |
| `SharedRegistryUpdated` | NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `SnapshotSaved` | HistoryTracking | — | — | — |
| `SoftDeleteRewardVoucher` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:722` | — | — |
| `SortDishesWithOrderRange` | Management | — | — | — |
| `SpendPolicyUpdated` | RestaurantLoyaltySystem | — | — | — |
| `SpendRecorded` | NetCafeSpendV3 | — | — | — |
| `StaffAgentStore` | BMFactory, BranchManagement, IQRFactory | — | — | 4: `shared/cyber-widget/MeosCyber/CyberAbis.qml:54`, `projects/widget-test/src/abi.js:5182`, `projects/widget-test/src/abi.js:5258`, `projects/widget-test/src/abi.js:5414` |
| `StaffExecuteRefund` | RestaurantOrder | — | — | — |
| `StaffUpdated` | BranchAccessManager | — | — | — |
| `StationAdded` | NetCafeManagementV3 | — | — | — |
| `StationAssigned` | NetCafeManagementV3 | 1: `apps/launcher-lockscreen/src/routes/register.tsx:72` | — | — |
| `StationMaintenanceSet` | NetCafeStationV3 | 7: `apps/launcher-lockscreen/src/providers/initialize-container-provider.tsx:49`, `apps/launcher-lockscreen/src/providers/initialize-container-provider.tsx:69`, `apps/launcher-lockscreen/src/providers/initialize-container-provider.tsx:72`, `apps/cyber/src/providers/event-provider.tsx:393` … | — | — |
| `StationRemoteControlSet` | NetCafeStationV3 | — | — | — |
| `StationRemoved` | NetCafeManagementV3 | — | — | — |
| `StationStatusChanged` | NetCafeStationV3 | 4: `apps/cyber/src/providers/event-provider.tsx:252`, `apps/cyber/src/providers/event-provider.tsx:592`, `apps/cyber/src/providers/event-provider.tsx:606`, `apps/cyber/src/providers/event-provider.tsx:642` | — | — |
| `StationUpdated` | NetCafeManagementV3 | — | — | — |
| `SuperAdminCreated` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2206` |
| `SuperAdminSet` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2219` |
| `SystemOperatorUpdated` | BranchAccessManager | — | — | — |
| `TIMEKEEPING` | IQRFactory | — | — | — |
| `TIMEZONE` | AttendanceSystem | — | — | — |
| `TOKEN_A` | PublicfullDB | — | — | — |
| `TOKEN_B` | PublicfullDB | — | — | — |
| `TOKEN_LOYALTY_A` | EconomyVault, NetCafeStationV3, NetCafeTopUpV3, RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/economy-vault/types.ts:7` | — | — |
| `TOKEN_LOYALTY_B` | EconomyVault, RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/economy-vault/types.ts:8` | — | — |
| `TOKEN_POINT` | EconomyVault, RestaurantLoyaltySystem | — | — | — |
| `TOKEN_VND` | EconomyVault, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3 | — | — | — |
| `TableDataUpdated` | BranchResourceRegistry | — | — | — |
| `TableReserved` | RestaurantOrder | — | — | — |
| `TierDefined` | RestaurantLoyaltySystem | — | — | — |
| `TierDeleted` | RestaurantLoyaltySystem | — | — | — |
| `TierEnabledSet` | RestaurantLoyaltySystem | — | — | — |
| `TimekeepingBeacon` | AgentIQR, IQRFactory | — | — | — |
| `TokenACredited` | RestaurantLoyaltySystem | — | — | — |
| `TokenADebited` | RestaurantLoyaltySystem | — | — | — |
| `TokenAEarned` | RestaurantLoyaltySystem | — | — | — |
| `TokenBDebited` | RestaurantLoyaltySystem | — | — | — |
| `TokenBExpired` | RestaurantLoyaltySystem | — | — | — |
| `TokenBGranted` | RestaurantLoyaltySystem | — | — | — |
| `TopUp` | RestaurantLoyaltySystem | — | — | — |
| `TopUpApproved` | NetCafeTopUpV3 | 7: `apps/cyber/src/providers/event-provider.tsx:333`, `apps/cyber/src/providers/event-provider.tsx:612`, `apps/cyber/src/providers/event-provider.tsx:651`, `apps/cyber/src/components/dialog-topup-qr.tsx:86` … | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:155`, `projects/widget-food-order/FoodDishEventAbis.js:197` |
| `TopUpCancelled` | NetCafeTopUpV3 | 4: `apps/cyber/src/providers/event-provider.tsx:380`, `apps/cyber/src/providers/event-provider.tsx:614`, `apps/cyber/src/providers/event-provider.tsx:653`, `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:136` | — | — |
| `TopUpRejected` | NetCafeTopUpV3 | 4: `apps/cyber/src/providers/event-provider.tsx:380`, `apps/cyber/src/providers/event-provider.tsx:613`, `apps/cyber/src/providers/event-provider.tsx:652`, `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:137` | — | — |
| `TopUpRequested` | NetCafeTopUpV3 | 4: `apps/cyber/src/components/dialog-topup-qr.tsx:76`, `apps/cyber/src/components/dialog-topup-qr.tsx:111`, `apps/cyber/src/components/dialog-topup-qr.tsx:115`, `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:135` | — | — |
| `TopupPolicyUpdated` | RestaurantLoyaltySystem | — | — | — |
| `TransactionCreated` | RestaurantLoyaltySystem | — | — | — |
| `TransactionSyncDocConflict` | PublicfullDB | — | — | — |
| `TransactionSynced` | PublicfullDB | — | — | — |
| `Transfer` | RestaurantLoyaltySystem | — | — | — |
| `TransferTable` | RestaurantOrder | — | — | — |
| `UPGRADE_INTERFACE_VERSION` | AgentIQR, AgentModuleProvisioner, BMFactory, BranchAccessManager, BranchDashboard, BranchManagement, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, HistoryTracking, IQRFactory, LoyaltyFactory, NetCafeV3Factory, PublicfullDB, RevenueManager, StaffAgentStore | — | — | 2: `shared/file-transfer/src/file.abi.js:309`, `projects/widget-test/src/abi.js:2437` |
| `Unpaused` | RestaurantLoyaltySystem, RestaurantOrder | — | — | — |
| `UpdateAgeGroup` | RestaurantReporting | — | — | — |
| `UpdateBanner` | Management | — | — | — |
| `UpdateCategory` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:90` | — | — |
| `UpdateDailyStats` | RestaurantReporting | — | — | — |
| `UpdateDailyStatsCustomer` | RestaurantReporting | — | — | — |
| `UpdateDiscount` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:249` | — | — |
| `UpdateDiscountCodeUsed` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:316` | — | — |
| `UpdateDish` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:150` | — | — |
| `UpdateDishDailyData` | RestaurantReporting | — | — | — |
| `UpdateDishDashboardData` | RestaurantReporting | — | — | — |
| `UpdateDishRanking` | RestaurantReporting | — | — | — |
| `UpdateDishRankings` | RestaurantReporting | — | — | — |
| `UpdateDishStats` | RestaurantReporting | — | — | — |
| `UpdateDishStatus` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:172` | — | — |
| `UpdateDishStatusEvent` | Management | 2: `apps/cyber/src/routes/_authenticated/user/_authenticated/order.tsx:80`, `apps/cyber/src/routes/_authenticated/user/_authenticated/order.tsx:84` | — | 2: `projects/widget-food-order/FoodDishEventAbis.js:7`, `projects/widget-food-order/FoodDishEventAbis.js:192` |
| `UpdateFoodRating` | RestaurantReporting | — | — | — |
| `UpdateNewCustomerData` | RestaurantReporting | — | — | — |
| `UpdateOrder` | RestaurantOrder | — | — | — |
| `UpdateOrderNum` | Management | — | — | — |
| `UpdatePosition` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:188` | — | — |
| `UpdateProductPrice` | Management | — | — | — |
| `UpdateRankDishes` | Management | — | — | — |
| `UpdateRestaurantInfo` | Management | — | — | — |
| `UpdateRewardVoucherMeta` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/voucher/hooks/use-update-voucher-meta.ts:23`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:733` | — | — |
| `UpdateServiceRating` | RestaurantReporting | — | — | — |
| `UpdateStaffInfo` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:221` | — | — |
| `UpdateTC` | Management | — | — | — |
| `UpdateTopDish` | Management | — | — | — |
| `UpdateTotalCustomerReport` | Management | — | — | — |
| `UpdateTotalRevenueReport` | Management | — | — | — |
| `UpdateUniform` | Management | — | — | — |
| `UpdateWorkingShift` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:106` | — | — |
| `Upgraded` | AgentIQR, AgentModuleProvisioner, BMFactory, BranchAccessManager, BranchDashboard, BranchManagement, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, HistoryTracking, IQRFactory, LoyaltyFactory, NetCafeV3Factory, PublicfullDB, RevenueManager, StaffAgentStore | — | — | 2: `shared/file-transfer/src/file.abi.js:304`, `projects/widget-test/src/abi.js:2232` |
| `UploadCustomerInfo` | Management | — | — | — |
| `UserDeleted` | NetCafeUserV3 | — | — | — |
| `UserLogin` | NetCafeUserV3 | 2: `apps/cyber/src/providers/event-provider.tsx:604`, `apps/cyber/src/providers/event-provider.tsx:640` | — | — |
| `UserLogout` | NetCafeUserV3 | 2: `apps/cyber/src/providers/event-provider.tsx:605`, `apps/cyber/src/providers/event-provider.tsx:641` | — | — |
| `UserRegistered` | NetCafeUserV3 | — | — | 3: `projects/widget-test/abis/chatFactoryAbi.js:309`, `projects/widget-test/src/abi.js:309`, `projects/widget-chat/abis/chatFactoryAbi.js:309` |
| `UserUpdated` | NetCafeUserV3 | — | — | — |
| `VECTOR_DIM` | Management | — | — | — |
| `VaultLedgerRecorded` | EconomyVault | 7: `apps/sidebar-cyber/src/providers/event-provider.tsx:78`, `apps/sidebar-cyber/src/providers/event-provider.tsx:79`, `apps/sidebar-cyber/src/providers/event-provider.tsx:133`, `apps/sidebar-cyber/src/providers/event-provider.tsx:147` … | 2: `CyberSidebarVaultWatcher.cpp:21`, `CyberSidebarVaultWatcher.cpp:133` | 3: `shared/cyber-widget/MeosCyber/CyberAbis.qml:100`, `projects/widget-food-order/FoodDishEventAbis.js:128`, `projects/widget-food-order/FoodDishEventAbis.js:197` |
| `WRITER_ROLE` | HistoryTracking | — | — | — |
| `WifiAdded` | NetCafeManagementV3 | — | — | — |
| `WifiUpdated` | NetCafeManagementV3 | — | — | — |
| `_getRoleHash` | BranchAccessManager | — | — | — |
| `acceptTransfer` | RestaurantOrder | — | — | — |
| `accessManager` | AgentModuleProvisioner, AttendanceSystem, BranchDashboard, BranchPaymentRegistry, BranchResourceRegistry, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `accountCounter` | BranchPaymentRegistry | — | — | — |
| `active` | Management | 13: `apps/cyber/src/pages/manager/stations/pricing-table.tsx:73`, `apps/cyber/src/pages/manager/staffs/staff-table.tsx:68`, `apps/cyber/src/pages/manager/stations/components/add-price-policy-form.tsx:194`, `apps/cyber/src/pages/dashboard/components/active-idle-chart.tsx:90` … | 4: `CyberSessionGuard.cpp:57`, `CyberSidebarAbis.hpp:30`, `CyberSidebarAbis.hpp:36`, `CyberSidebarAbis.hpp:69` | 23: `projects/widget-session-uptime/SessionAbis.qml:31`, `projects/widget-session-uptime/SessionAbis.qml:48`, `projects/widget-session-uptime/SessionStats.js:168`, `projects/widget-session-uptime/SessionStats.js:177` … |
| `activeCampaignIndexPlusOne` | RestaurantLoyaltySystem | — | — | — |
| `activeCampaignIndexReady` | RestaurantLoyaltySystem | — | — | — |
| `activeSessionOfUser` | NetCafeSessionV3 | 1: `packages/cyber-contracts/src/net-cafe-session/net-cafe-session.contract.ts:94` | — | — |
| `addAccountBank` | BranchPaymentRegistry | 3: `apps/cyber/src/pages/owner/payment/hooks/use-add-account-bank.ts:34`, `packages/cyber-contracts/src/topup/topup.contract.ts:202`, `packages/cyber-contracts/src/branch-payment-registry/branch-payment-registry.contract.ts:45` | — | — |
| `addAgent` | RevenueManager | — | — | — |
| `addArea` | BranchResourceRegistry | 2: `apps/cyber/src/pages/manager/stations/hooks/use-add-group.ts:38`, `packages/cyber-contracts/src/branch-resource-registry/branch-resource-registry.contract.ts:59` | — | — |
| `addGroup` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/stations/hooks/use-add-group.ts:29`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:157` | — | — |
| `addManagerMainBranch` | BMFactory | — | — | — |
| `addPricePolicy` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/stations/hooks/use-add-price-policy.ts:37`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:204` | — | — |
| `addResource` | BranchResourceRegistry | 1: `packages/cyber-contracts/src/branch-resource-registry/branch-resource-registry.contract.ts:92` | — | — |
| `addStation` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/stations/hooks/use-add-station.ts:80`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:99` | — | — |
| `addValueDocument` | PublicfullDB | — | — | — |
| `addWifi` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/wifi/hooks/use-upsert-wifi.ts:62`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:292` | — | — |
| `adminInitialized` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2450` |
| `agent` | AgentIQR, AttendanceSystem, BranchManagement, Management, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, RestaurantLoyaltySystem, RestaurantOrder, RestaurantReporting | 4: `apps/ops-agent/src/hooks/useAgent.ts:8`, `apps/ops-agent/src/hooks/useAgent.ts:13`, `apps/ops-agent/src/hooks/useAddMerchantForm.ts:58`, `apps/ops-agent/src/hooks/useUpdateAgent.ts:77` | 3: `CyberGamePlayRecorder.cpp:83`, `CyberSidebarAbis.hpp:42`, `CyberSidebarVaultWatcher.cpp:24` | 26: `shared/cyber-widget/MeosCyber/CyberUtils.qml:278`, `shared/cyber-widget/MeosCyber/CyberContext.qml:321`, `shared/cyber-widget/MeosCyber/CyberContext.qml:353`, `shared/cyber-widget/MeosCyber/CyberAbis.qml:17` … |
| `agentAdmins` | BranchAccessManager, BranchModuleRegistry | — | — | — |
| `agentAnalytics` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2469` |
| `agentBranchManagement` | BMFactory, EnhancedAgentManagement, IQRFactory | — | — | 1: `projects/widget-test/src/abi.js:2523` |
| `agentCoOwnerFullAccess` | BranchAccessManager | — | — | — |
| `agentCoOwners` | BranchAccessManager | — | — | — |
| `agentIQRContracts` | EnhancedAgentManagement, IQRFactory | — | — | 1: `projects/widget-test/src/abi.js:2547` |
| `agentIQRSC` | Management | — | — | — |
| `agentInitialised` | PublicfullDB | — | — | — |
| `agentList` | EnhancedAgentManagement, RevenueManager | — | — | 1: `projects/widget-test/src/abi.js:2566` |
| `agentLoyaltyContracts` | EnhancedAgentManagement, LoyaltyFactory | — | — | 1: `projects/widget-test/src/abi.js:2590` |
| `agentMaxTxId` | PublicfullDB | — | — | — |
| `agentModuleProvisioner` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2603` |
| `agentNetCafeContracts` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2627` |
| `agentROBOTContracts` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2651` |
| `agentRevenues` | RevenueManager | — | — | — |
| `agentTaxPercent` | EnhancedAgentManagement | 2: `apps/cyber/src/pages/owner/payment/hooks/use-get-tax-percent.ts:12`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:73` | — | — |
| `agentToBranchIds` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2675` |
| `agents` | EnhancedAgentManagement | 5: `deployCloudRental.js:234`, `apps/ops-agent/src/hooks/useCreateAgent.ts:56`, `apps/ops-agent/src/hooks/useAgents.ts:30`, `apps/ops-agent/src/hooks/useDeleteAgent.ts:14` … | — | 6: `projects/widget-test/src/abi.js:2694`, `projects/widget-test/src/abi.js:4200`, `projects/widget-test/src/abi.js:4301`, `projects/widget-test/src/abi.js:4407` … |
| `agentsByPermissionCache` | EnhancedAgentManagement | — | — | — |
| `allDishCodes` | Management | — | — | — |
| `allDishOptionIndexPlusOne` | Management | — | — | — |
| `allDishOptions` | Management | — | — | — |
| `allExecIds` | RestaurantLoyaltySystem | — | — | — |
| `allGroupIdIndexPlusOne` | RestaurantLoyaltySystem | — | — | — |
| `allGroupIds` | RestaurantLoyaltySystem | — | — | — |
| `allHistoryEntries` | HistoryTracking | — | — | — |
| `allMemberGroupIndexPlusOne` | RestaurantLoyaltySystem | — | — | — |
| `allMemberGroups` | RestaurantLoyaltySystem | — | — | — |
| `allMemberIndexPlusOne` | RestaurantLoyaltySystem | — | — | — |
| `allMembers` | RestaurantLoyaltySystem | — | — | — |
| `allOptionNameIndexPlusOne` | Management | — | — | — |
| `allOptionNames` | Management | — | — | — |
| `allOrders` | RestaurantOrder | — | — | — |
| `allPaymentIds` | RestaurantOrder | — | — | — |
| `allStaffAddresses` | AttendanceSystem | — | — | — |
| `allTiers` | RestaurantLoyaltySystem | — | — | — |
| `allTransactions` | RestaurantLoyaltySystem | — | — | — |
| `allowedActionTypeList` | RestaurantLoyaltySystem | — | — | — |
| `allowedActionTypes` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-get-allowed-action-types.ts:19`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:484` | — | — |
| `applyRankingsFromIndices` | RestaurantReporting | — | — | — |
| `approveIncident` | AttendanceSystem | — | — | — |
| `approveManualRequest` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/required-point/hooks/use-execute-manual-requests.ts:33`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:688` | — | — |
| `approveTopUp` | NetCafeTopUpV3 | 2: `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:86`, `packages/cyber-contracts/src/topup/topup.contract.ts:132` | — | — |
| `areaIndexPlusOne` | BranchResourceRegistry | — | — | — |
| `areaSnapshots` | HistoryTracking | — | — | — |
| `assignBranchManagerDirect` | BranchManagement | — | — | — |
| `assignMemberToGroup` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/tag/hooks/use-assign-tag.ts:27`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:270` | — | — |
| `authorizeNetSession` | RestaurantLoyaltySystem | — | — | — |
| `authorizedModules` | EconomyVault | — | — | — |
| `autoConfirmPaymentFromTransfer` | RestaurantOrder | — | — | — |
| `backfillTransactionTypeIndexes` | RestaurantLoyaltySystem | — | — | — |
| `balanceA` | RestaurantLoyaltySystem | — | — | — |
| `balanceB` | RestaurantLoyaltySystem | — | — | — |
| `balanceBBranch` | RestaurantLoyaltySystem | — | — | — |
| `balanceOf` | EconomyVault, RestaurantLoyaltySystem | 9: `apps/sidebar-cyber/src/providers/event-provider.tsx:84`, `apps/sidebar-cyber/src/hooks/use-get-bonus-points.ts:10`, `apps/sidebar-cyber/src/hooks/use-get-balance.ts:14`, `apps/sidebar-cyber/src/services/station.service.ts:30` … | 2: `CyberSidebarAbis.hpp:42`, `CyberSidebarStationModel.cpp:1106` | 3: `shared/cyber-widget/MeosCyber/CyberAbis.qml:91`, `projects/widget-session-uptime/SessionStats.js:120`, `projects/widget-food-order/CheckoutData.js:28` |
| `bannerSnapshots` | HistoryTracking | — | — | — |
| `banners` | Management | — | — | — |
| `batchAcceptTransfers` | RestaurantOrder | — | — | — |
| `batchAssignMemberToGroups` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:286` | — | — |
| `batchRecordRevenue` | RevenueManager | — | — | — |
| `batchTransferOrders` | RestaurantOrder | — | — | — |
| `batchUpdateDishDailyAndDashboard` | RestaurantReporting | — | — | — |
| `batchUpdateOrderNum` | Management | — | — | — |
| `bmFactory` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2757` |
| `bootstrapOperator` | BranchManagement | — | — | — |
| `branchAccessManager` | BranchManagement, EnhancedAgentManagement, IQRFactory, Management, RestaurantReporting | 24: `apps/cyber/src/services/app-container.ts:172`, `apps/cyber/src/services/app-container.ts:213`, `apps/cyber/src/pages/staff/order-manager/hooks/use-history-orders.ts:38`, `apps/cyber/src/pages/manager/iqr/features/dishes/hooks/use-delegate-reset-service.ts:27` … | — | 4: `shared/cyber-widget/DevEnvExport.js:48`, `shared/cyber-widget/MeosCyber/CyberContext.qml:598`, `projects/widget-dev-login/Main.qml:53`, `projects/widget-test/src/abi.js:2770` |
| `branchAccessManagers` | RestaurantLoyaltySystem | — | — | — |
| `branchAuditTrail` | AgentModuleProvisioner, BranchAccessManager, BranchPaymentRegistry, BranchResourceRegistry | — | — | — |
| `branchCoOwnerFullAccess` | BranchAccessManager | — | — | — |
| `branchCoOwnerProfiles` | BranchAccessManager | — | — | — |
| `branchCoOwners` | BranchAccessManager | — | — | — |
| `branchCounter` | BranchManagement | — | — | — |
| `branchExists` | BranchManagement | — | — | — |
| `branchExpiryDays` | RestaurantLoyaltySystem | — | — | — |
| `branchId` | AgentIQR, AttendanceSystem, Management, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, RestaurantReporting | — | 6: `CyberSidebarSessionContext.cpp:51`, `CyberGamePlayRecorder.cpp:84`, `CyberSidebarAbis.hpp:42`, `CyberSidebarAbis.hpp:48` … | 25: `shared/cyber-widget/MeosCyber/CyberAbis.qml:9`, `shared/cyber-widget/MeosCyber/CyberAbis.qml:18`, `shared/cyber-widget/MeosCyber/CyberAbis.qml:87`, `shared/cyber-widget/MeosCyber/CyberAbis.qml:104` … |
| `branchIdCount` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2783` |
| `branchIds` | BranchManagement | 5: `apps/cyber/src/pages/manager/wifi/components/wifi-form.tsx:110`, `apps/cyber/src/pages/owner/payment/payment-account-table.tsx:106`, `apps/cyber/src/pages/owner/banner/components/banner-form.tsx:199`, `apps/cyber/src/pages/owner/loyalty/voucher/modal-crud-voucher.tsx:420` … | — | 5: `projects/widget-food-order/FoodIqrAbis.js:1101`, `projects/widget-food-order/FoodIqrAbis.js:1202`, `projects/widget-test/src/abi.js:3631`, `projects/widget-test/src/abi.js:3806` … |
| `branchManagement` | BranchAccessManager, Management | 7: `apps/agent-lookup/src/routes/index.tsx:119`, `apps/cyber/src/pages/owner/system/types.ts:7`, `apps/cyber/src/pages/owner/system/hooks/use-remove-manager.ts:15`, `apps/cyber/src/pages/owner/system/hooks/use-create-co-owner.ts:34` … | — | 3: `shared/cyber-widget/MeosCyber/CyberContext.qml:619`, `projects/widget-dev-login/Main.qml:58`, `projects/widget-test/src/abi.js:1882` |
| `branchManagementBeacon` | BMFactory | — | — | — |
| `branchManagerProfiles` | BranchAccessManager | — | — | — |
| `branchManagers` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:63` | — | — |
| `branchMembers` | BranchAccessManager | — | — | — |
| `branchNotifications` | BranchManagement | — | — | — |
| `branchPaymentRegistry` | AgentIQR, IQRFactory, Management | 9: `apps/cyber/src/hooks/use-get-account-bank.ts:15`, `apps/cyber/src/pages/owner/payment/hooks/use-add-account-bank.ts:18`, `apps/cyber/src/pages/owner/payment/hooks/use-update-account-bank.ts:19`, `apps/cyber/src/pages/owner/payment/hooks/use-get-account-banks-paged.ts:18` … | — | 3: `shared/cyber-widget/DevEnvExport.js:54`, `shared/cyber-widget/MeosCyber/CyberContext.qml:604`, `projects/widget-dev-login/Main.qml:54` |
| `branchResourceRegistry` | AgentIQR, IQRFactory, Management | 12: `apps/wedget-order/src/hooks/use-place-order.ts:38`, `apps/cyber/src/pages/staff/order-manager/hooks/use-history-orders.ts:39`, `apps/cyber/src/pages/staff/order-manager/hooks/use-new-orders.ts:20`, `apps/cyber/src/pages/staff/order-manager/hooks/use-processing-orders.ts:21` … | — | 7: `shared/cyber-widget/DevEnvExport.js:60`, `shared/cyber-widget/MeosCyber/CyberContext.qml:608`, `projects/widget-food-order/OrderService.js:38`, `projects/widget-dev-login/LoginService.js:187` … |
| `branchStaff` | BranchAccessManager | — | — | — |
| `branchToAccount` | BranchPaymentRegistry | — | — | — |
| `branches` | BranchManagement | 1: `apps/cyber/src/pages/owner/system/components/co-owner-form.tsx:214` | — | 5: `projects/widget-test/abis/agentAbi.js:49`, `projects/widget-test/src/abi.js:3430`, `projects/widget-test/src/abi.js:4052`, `projects/widget-test/src/abi.js:4950` … |
| `callStaff` | RestaurantOrder | — | — | — |
| `campaignExecIds` | RestaurantLoyaltySystem | — | — | — |
| `campaignExecRecords` | RestaurantLoyaltySystem | — | — | — |
| `campaignExecutionLog` | RestaurantLoyaltySystem | — | — | — |
| `campaignIds` | RestaurantLoyaltySystem | — | — | — |
| `campaigns` | RestaurantLoyaltySystem | 6: `apps/dashboard/src/constants/nav.ts:36`, `apps/cyber/src/pages/owner/loyalty/campaign/hooks/use-extend-campaign.ts:26`, `apps/cyber/src/pages/owner/loyalty/campaign/hooks/use-get-all-campaigns-pagination.ts:14`, `apps/cyber/src/pages/owner/loyalty/campaign/hooks/use-create-campaign.ts:67` … | — | — |
| `canManageAccess` | BranchAccessManager | — | — | — |
| `canModifyAgent` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2802` |
| `canPayWithPoints` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:548` | — | — |
| `canPayWithWallet` | RestaurantLoyaltySystem | — | — | — |
| `canViewAgentData` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2821` |
| `cancelOrder` | RestaurantOrder | 1: `apps/cyber/src/pages/staff/order-manager/hooks/use-order-actions.ts:69` | — | — |
| `cancelPayment` | RestaurantOrder | — | — | — |
| `cancelReservation` | RestaurantOrder | — | — | — |
| `cancelTopUpRequest` | NetCafeTopUpV3 | 2: `apps/cyber/src/pages/user/user-topup/hooks/use-cancel-topup-request.ts:20`, `packages/cyber-contracts/src/topup/topup.contract.ts:146` | — | — |
| `cancelTransferRequest` | RestaurantOrder | — | — | — |
| `cardVisa` | IQRFactory | — | — | — |
| `categories` | Management | 8: `apps/wedget-order/src/hooks/query-keys.ts:8`, `apps/cyber/src/hooks/query-keys.ts:151`, `apps/cyber/src/hooks/query-keys.ts:153`, `apps/cyber/src/routes/_authenticated/manager/_authenticated/iqr.tsx:34` … | — | — |
| `categoryDishIndexPlusOne` | Management | — | — | — |
| `categoryIndexPlusOne` | Management | — | — | — |
| `categorySnapshots` | HistoryTracking | — | — | — |
| `changeHistory` | RestaurantLoyaltySystem | — | — | — |
| `changeIdsByType` | RestaurantLoyaltySystem | — | — | — |
| `changePasswordBySession` | NetCafeUserV3 | 2: `apps/cyber/src/pages/user/change-password/hooks/use-change-password.ts:47`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:153` | — | — |
| `changeUsername` | NetCafeUserV3 | — | — | — |
| `checkIn` | AttendanceSystem | — | — | — |
| `checkOut` | AttendanceSystem | — | — | — |
| `checkPermissions` | BranchManagement | — | — | — |
| `checkRole` | BranchAccessManager | — | — | — |
| `checkSessionAvailable` | RestaurantOrder | — | — | — |
| `checkSessionIdFromTableMerge` | BranchResourceRegistry | — | — | — |
| `checkSessionTable` | RestaurantOrder | — | — | — |
| `checkShowOption` | Management | — | — | — |
| `checkStatusTable` | RestaurantOrder | — | — | — |
| `checkUserAgentExist` | StaffAgentStore | — | — | — |
| `childAreaCount` | BranchResourceRegistry | — | — | — |
| `clearDiscountCatalog` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:329` | — | — |
| `clearRewardVoucherCatalog` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:700` | — | — |
| `clearStationStatus` | NetCafeStationV3 | 3: `apps/launcher-lockscreen/src/utils/auth-storage.ts:83`, `packages/system-context/src/system-context.ts:264`, `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:68` | 2: `CyberSidebarSessionManager.cpp:188`, `CyberSidebarAbis.hpp:93` | — |
| `clearTable` | BranchResourceRegistry | — | — | — |
| `closeSession` | NetCafeSessionV3 | 8: `apps/launcher-lockscreen/src/utils/auth-storage.ts:78`, `apps/launcher-lockscreen/src/hooks/use-sync-callback.ts:50`, `apps/hidden-cloudpc/src/realtime-transport/realtime-transport/services/session-manager.service.ts:163`, `apps/hidden-cloudpc/src/realtime-transport/realtime-transport/services/session-manager.service.ts:192` … | 2: `CyberSidebarSessionManager.cpp:167`, `CyberSidebarAbis.hpp:87` | — |
| `closeSessionByModule` | NetCafeSessionV3 | — | — | — |
| `closeSessionByStaff` | RestaurantOrder | — | — | — |
| `closeSessionByStation` | NetCafeSessionV3 | — | — | — |
| `coOwners` | NetCafeManagementV3 | 1: `apps/cyber/src/pages/owner/system/hooks/use-get-all-coowner.ts:17` | — | 1: `projects/widget-test/src/abi.js:3666` |
| `commit` | PublicfullDB | — | 1: `CyberUsageLedger.cpp:98` | — |
| `commitAll` | PublicfullDB | — | — | — |
| `companyAdminSuperAdmins` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:2845` |
| `companyHolidays` | AttendanceSystem | — | — | — |
| `completedOrders` | AgentIQR | — | — | — |
| `confirmLockedEarnPoints` | RestaurantLoyaltySystem | — | — | — |
| `confirmLockedPoints` | RestaurantLoyaltySystem | — | — | — |
| `confirmPayment` | RestaurantOrder | 2: `apps/cyber/src/pages/staff/order-manager/hooks/use-order-actions.ts:22`, `apps/cyber/src/pages/staff/order-manager/hooks/use-order-actions.ts:23` | — | — |
| `confirmRefund` | RestaurantOrder | — | — | — |
| `connectToDB` | Management | — | — | — |
| `consumeRewardVoucher` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:707` | — | — |
| `continueDeleteMemberGroup` | RestaurantLoyaltySystem | — | — | — |
| `createAccountWithPassword` | NetCafeUserV3 | 2: `apps/cyber/src/pages/staff/staff-accounts/hooks/use-register-user.ts:43`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:157` | — | — |
| `createAgentDelegation` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:294` | — | — |
| `createAgentIQR` | IQRFactory | — | — | — |
| `createAgentLoyalty` | LoyaltyFactory | — | — | — |
| `createAgentWithAnalytics` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:192` | — | 1: `projects/widget-test/src/abi.js:2931` |
| `createAgentWithBranchModules` | EnhancedAgentManagement | 2: `apps/ops-agent/src/hooks/useCreateAgent.ts:42`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:222` | — | 1: `projects/widget-test/src/abi.js:3022` |
| `createBranch` | BranchManagement | — | — | — |
| `createBranchForAgent` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3078` |
| `createBranchManagement` | BMFactory | — | — | — |
| `createBranchNetCafe` | NetCafeV3Factory | — | — | — |
| `createCampaign` | RestaurantLoyaltySystem | 3: `apps/cyber/src/routes/_authenticated/owner/_authenticated/loyalty/history.tsx:40`, `apps/cyber/src/pages/owner/loyalty/campaign/hooks/use-create-campaign.ts:43`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:411` | — | — |
| `createManualRequest` | RestaurantLoyaltySystem | — | — | — |
| `createMemberGroup` | RestaurantLoyaltySystem | 3: `apps/cyber/src/pages/owner/loyalty/tag/hooks/use-upsert-tag.ts:23`, `apps/cyber/src/pages/owner/loyalty/tag/hooks/use-create-tag.ts:18`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:314` | — | — |
| `createOrder` | AgentIQR | — | — | — |
| `createProposal` | BranchManagement | — | — | — |
| `createSettingAddress` | AttendanceSystem | — | — | — |
| `createSuperAdmin` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3097` |
| `createTable` | BranchResourceRegistry | 3: `apps/cyber/src/hooks/use-get-stations.ts:88`, `apps/cyber/src/pages/manager/stations/hooks/use-add-station.ts:91`, `packages/cyber-contracts/src/branch-resource-registry/branch-resource-registry.contract.ts:76` | — | — |
| `createTier` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/member-rank/hooks/use-create-tier.ts:26`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:81` | — | — |
| `createTransaction` | NetCafeTopUpV3 | 2: `apps/cyber/src/hooks/use-create-transaction.ts:32`, `packages/cyber-contracts/src/topup/topup.contract.ts:75` | — | — |
| `credit` | EconomyVault | — | — | — |
| `creditAssist` | RestaurantLoyaltySystem | — | — | — |
| `creditTopup` | RestaurantLoyaltySystem | — | — | — |
| `cumulativeRegisteredUsers` | NetCafeUserV3 | — | — | — |
| `currency` | BranchManagement | 3: `apps/cyber/src/pages/user/user-topup/components/topup-form.tsx:212`, `apps/cyber/src/pages/owner/loyalty/history-tracking/item-transaction.tsx:249`, `apps/cyber/src/pages/owner/loyalty/loyalty-tracking/components/ItemTransaction.tsx:260` | — | — |
| `currencyDisplay` | BranchManagement | — | — | — |
| `currentImplementation` | BMFactory, IQRFactory, LoyaltyFactory, NetCafeV3Factory | 1: `packages/cyber-contracts/src/net-cafe-v3-factory/net-cafe-v3-factory.contract.ts:61` | — | — |
| `currentReservationRule` | RestaurantOrder | — | — | — |
| `customerDishCounts` | RestaurantOrder | — | — | — |
| `customerExecIds` | RestaurantLoyaltySystem | — | — | — |
| `customerProfiles` | RestaurantOrder | — | — | — |
| `customerReservations` | RestaurantOrder | — | — | — |
| `customerTier` | RestaurantLoyaltySystem | — | — | — |
| `dailyActiveStaff` | BranchAccessManager | — | — | — |
| `dailyActiveStaffByBranch` | BranchAccessManager | — | — | — |
| `dailyActiveUserSeen` | NetCafeSessionV3 | — | — | — |
| `dailyActiveUsersCount` | NetCafeSessionV3 | — | — | — |
| `dailyAgeGroups` | RestaurantReporting | — | — | — |
| `dailyCoupleCustomers` | RestaurantReporting | — | — | — |
| `dailyCustomers` | RestaurantReporting | — | — | — |
| `dailyDineInOrders` | RestaurantReporting | — | — | — |
| `dailyDineInRevenue` | RestaurantReporting | — | — | — |
| `dailyFemaleCustomers` | RestaurantReporting | — | — | — |
| `dailyFoodRatings` | RestaurantReporting | — | — | — |
| `dailyGroupCustomers` | RestaurantReporting | — | — | — |
| `dailyManualRevenue` | NetCafeSpendV3 | — | — | — |
| `dailyNewCustomers` | RestaurantReporting | — | — | — |
| `dailyOrders` | RestaurantReporting | — | — | — |
| `dailyRegisteredUsers` | NetCafeUserV3 | — | — | — |
| `dailyReports` | AttendanceSystem | — | — | — |
| `dailyRetainedUsersCount` | NetCafeSessionV3 | — | — | — |
| `dailyReturningCustomersFromTwoTimes` | RestaurantReporting | — | — | — |
| `dailyReturningCustomersOneTime` | RestaurantReporting | — | — | — |
| `dailyReturningUserSeen` | NetCafeSessionV3 | — | — | — |
| `dailyReturningUsersCount` | NetCafeSessionV3 | — | — | — |
| `dailyRevenue` | RestaurantReporting, RevenueManager | — | — | — |
| `dailyServiceRatings` | RestaurantReporting | — | — | — |
| `dailySessionCount` | NetCafeSessionV3 | — | — | — |
| `dailySingleCustomers` | RestaurantReporting | — | — | — |
| `dailyStatsByBranch` | RestaurantLoyaltySystem | — | — | — |
| `dailyTakeAwayOrders` | RestaurantReporting | — | — | — |
| `dailyTakeAwayRevenue` | RestaurantReporting | — | — | — |
| `dailyTotalUsers` | NetCafeUserV3 | — | — | — |
| `dailyTripleCustomers` | RestaurantReporting | — | — | — |
| `dailyUsageRevenue` | NetCafeSessionV3 | — | — | — |
| `dailyUsageSeconds` | NetCafeSessionV3 | — | — | — |
| `dashboardBeacon` | NetCafeV3Factory | — | — | — |
| `dashboardDishMonthlyOrders` | RestaurantReporting | — | — | — |
| `dashboardDishMonthlyRevenue` | RestaurantReporting | — | — | — |
| `dashboardDishYearlyOrders` | RestaurantReporting | — | — | — |
| `dashboardDishYearlyRevenue` | RestaurantReporting | — | — | — |
| `dashboardFacade` | NetCafeV3Factory | — | — | — |
| `dbWrapper` | Management | — | — | — |
| `deactivate` | AgentIQR | — | — | — |
| `deactivateBranch` | BranchManagement | — | — | — |
| `debit` | EconomyVault, RestaurantLoyaltySystem | — | — | — |
| `debitAAssist` | RestaurantLoyaltySystem | — | — | — |
| `debitBAssist` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:252` | — | — |
| `debitByRefId` | RestaurantLoyaltySystem | — | — | — |
| `debitRefExists` | RestaurantLoyaltySystem | — | — | — |
| `declineTransfer` | RestaurantOrder | — | — | — |
| `decodeAbiAddManager` | BranchManagement | — | — | — |
| `decodeAbiPaymentAccount` | BranchManagement | — | — | — |
| `decodeAbiRemoveManager` | BranchManagement | — | — | — |
| `decodeLoyaltyTxRecord` | PublicfullDB | — | — | — |
| `decreaseDishQuantity` | Management | — | — | — |
| `defaultExpiryDays` | RestaurantLoyaltySystem | — | — | — |
| `delegateAgent` | EnhancedAgentManagement | 2: `packages/system-context/src/system-context.ts:207`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:141` | — | 1: `projects/widget-test/src/abi.js:3110` |
| `delegateManager` | BranchAccessManager | 3: `apps/cyber/src/pages/manager/iqr/features/dishes/hooks/use-delegate-reset-service.ts:29`, `packages/system-context/src/system-context.ts:212`, `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:253` | — | — |
| `delegateStaff` | BranchAccessManager | 2: `packages/system-context/src/system-context.ts:220`, `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:265` | — | — |
| `delegateToAgent` | BranchAccessManager | — | — | — |
| `delegations` | BranchAccessManager | — | — | — |
| `deleteAccountBank` | BranchPaymentRegistry | 3: `apps/cyber/src/pages/owner/payment/hooks/use-delete-account-bank.ts:20`, `packages/cyber-contracts/src/topup/topup.contract.ts:230`, `packages/cyber-contracts/src/branch-payment-registry/branch-payment-registry.contract.ts:72` | — | — |
| `deleteAgent` | EnhancedAgentManagement | 2: `apps/ops-agent/src/hooks/useDeleteAgent.ts:11`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:270` | — | 1: `projects/widget-test/src/abi.js:3123` |
| `deleteArea` | BranchResourceRegistry | — | — | — |
| `deleteDocument` | PublicfullDB | — | — | — |
| `deleteGroup` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/stations/hooks/use-delete-group.ts:17`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:172` | — | 3: `projects/widget-test/abis/chatFactoryAbi.js:693`, `projects/widget-test/src/abi.js:693`, `projects/widget-chat/abis/chatFactoryAbi.js:693` |
| `deleteMember` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/customer/use-delete-member.ts:18`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:125` | — | — |
| `deleteMemberGroup` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/tag/hooks/use-delete-tag.ts:18`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:327` | — | — |
| `deletePricePolicy` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/stations/hooks/use-delete-price-policy.ts:17`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:220` | — | — |
| `deleteTier` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/member-rank/hooks/use-delete-tier.ts:18`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:118` | — | — |
| `deleteUser` | NetCafeUserV3 | 2: `apps/cyber/src/pages/staff/staff-accounts/hooks/use-delete-user.ts:17`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:87` | — | — |
| `deletedAgents` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3136` |
| `deployedContracts` | IQRFactory, LoyaltyFactory | — | — | — |
| `depositVND` | NetCafeTopUpV3 | 3: `apps/cyber/src/hooks/use-topup.ts:62`, `apps/cyber/src/pages/staff/staff-accounts/hooks/use-register-user.ts:58`, `packages/cyber-contracts/src/topup/topup.contract.ts:58` | — | — |
| `digitalMenu` | Management | — | — | — |
| `disableBranchNetV3` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3210` |
| `discardLockedEarnPoints` | RestaurantLoyaltySystem | — | — | — |
| `discountCatalogVersion` | Management | — | — | — |
| `discountCodeHashCatalogVersion` | Management | — | — | — |
| `discountIdCatalogVersion` | Management | — | — | — |
| `discountIds` | Management | — | — | — |
| `discountIndexPlusOne` | Management | — | — | — |
| `discountSnapshots` | HistoryTracking | — | — | — |
| `discountUserUsedCount` | Management | 1: `packages/cyber-contracts/src/management/management.contract.ts:325` | — | — |
| `discounts` | Management | — | — | — |
| `dishActualQuantity` | Management | — | — | — |
| `dishCodeIndex` | Management | — | — | — |
| `dishDailyOrders` | RestaurantReporting | — | — | — |
| `dishDailyRevenue` | RestaurantReporting | — | — | — |
| `dishDefaultQuantity` | Management | — | — | — |
| `dishIsNew` | Management, RestaurantReporting | — | — | — |
| `dishLastResetTime` | Management | — | — | — |
| `dishMonthlyOrders` | RestaurantReporting | — | — | — |
| `dishMonthlyRevenue` | RestaurantReporting | — | — | — |
| `dishOptionIndexPlusOne` | Management | — | — | — |
| `dishOptionNameIndexPlusOne` | Management | — | — | — |
| `dishOptionSnapshots` | HistoryTracking | — | — | — |
| `dishOrderIndex` | Management | — | — | — |
| `dishRanking` | RestaurantReporting | — | — | — |
| `dishRankingHistory` | RestaurantReporting | — | — | — |
| `dishResetSchedule` | Management | 4: `apps/cyber/src/hooks/query-keys.ts:159`, `apps/cyber/src/pages/manager/iqr/features/dishes/hooks/use-dish-reset-schedule.ts:21`, `apps/cyber/src/pages/manager/iqr/features/dishes/hooks/use-dish-reset-schedule.ts:36`, `packages/cyber-contracts/src/management/management.contract.ts:203` | — | — |
| `dishSnapshots` | HistoryTracking | — | — | — |
| `dishStartTime` | Management, RestaurantReporting | — | — | — |
| `dishTotalOrders` | Management, RestaurantReporting | — | — | — |
| `dishTotalRevenue` | Management, RestaurantReporting | — | — | — |
| `dishesWithOrder` | Management | — | — | — |
| `earnTokenA` | RestaurantLoyaltySystem | — | — | — |
| `economyVault` | AgentModuleProvisioner, EnhancedAgentManagement, LoyaltyFactory, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, RestaurantLoyaltySystem | 12: `apps/sidebar-cyber/src/providers/event-provider.tsx:82`, `apps/sidebar-cyber/src/hooks/use-get-bonus-points.ts:9`, `apps/sidebar-cyber/src/hooks/use-get-balance.ts:13`, `apps/sidebar-cyber/src/services/station.service.ts:9` … | 3: `CyberSidebarSessionContext.cpp:59`, `CyberSidebarVaultWatcher.cpp:120`, `CyberEventHub.hpp:42` | 7: `shared/cyber-widget/DevEnvExport.js:55`, `shared/cyber-widget/MeosCyber/CyberContext.qml:605`, `projects/widget-session-uptime/SessionStats.js:120`, `projects/widget-food-order/Main.qml:784` … |
| `editUser` | NetCafeUserV3 | 2: `apps/cyber/src/pages/staff/staff-accounts/hooks/use-update-user.ts:17`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:79` | — | — |
| `enableBranchNetV3` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3241` |
| `enableBranchNetV3FromBranch` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3259` |
| `enableNetV3ForBranch` | BranchManagement | — | — | — |
| `enableOrderDismissBroadcast` | RestaurantOrder | — | — | — |
| `endNotInPosition` | AttendanceSystem | — | — | — |
| `enhancedAgent` | AgentIQR, BMFactory, IQRFactory, LoyaltyFactory, RevenueManager, StaffAgentStore | — | — | — |
| `enhancedAgentSC` | RestaurantLoyaltySystem | — | — | — |
| `enhancedAgentSc` | BranchManagement | — | — | — |
| `entityExists` | HistoryTracking | — | — | — |
| `entityHistories` | HistoryTracking | — | — | — |
| `exchangeRate` | RestaurantLoyaltySystem | — | — | — |
| `executeOrder` | RestaurantOrder | 3: `apps/wedget-order/src/hooks/use-make-order.ts:47`, `apps/cyber/src/pages/user/order/hooks/use-execute-order-payment.ts:39`, `apps/cyber/src/components/cart/hooks/use-make-order.ts:58` | — | 4: `projects/widget-food-order/FoodIqrAbis.js:841`, `projects/widget-food-order/FoodIqrAbis.js:894`, `projects/widget-food-order/OrderService.js:255`, `projects/widget-food-order/OrderService.js:297` |
| `existsInNew` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3272` |
| `expireBatches` | RestaurantLoyaltySystem | — | — | — |
| `extendCampaign` | RestaurantLoyaltySystem | 3: `apps/cyber/src/routes/_authenticated/owner/_authenticated/loyalty/history.tsx:60`, `apps/cyber/src/pages/owner/loyalty/campaign/hooks/use-extend-campaign.ts:18`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:448` | — | — |
| `forceLogout` | NetCafeUserV3 | — | — | — |
| `forceResetReentrancyGuard` | RestaurantLoyaltySystem | — | — | — |
| `formatTime` | AttendanceSystem | — | — | 3: `projects/widget-session-uptime/Main.qml:91`, `projects/widget-session-uptime/Main.qml:481`, `projects/widget-meos-playground/Main.qml:33` |
| `freeGasSc` | BMFactory, BranchManagement, IQRFactory, LoyaltyFactory | — | — | — |
| `fullDB` | PublicfullDB | — | — | — |
| `generateOTP` | NetCafeUserV3 | 3: `apps/cyber/src/pages/staff/staff-accounts/hooks/use-generate-otp-test.ts:46`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:99`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:106` | — | — |
| `getABanner` | Management | — | — | — |
| `getADigitalMenu` | Management | — | — | — |
| `getATC` | Management | — | — | — |
| `getAUniform` | Management | — | — | — |
| `getAWorkingShift` | BranchAccessManager | — | — | — |
| `getAccount` | BranchPaymentRegistry | 2: `apps/cyber/src/pages/owner/payment/hooks/use-get-account-banks-paged.ts:26`, `packages/cyber-contracts/src/branch-payment-registry/branch-payment-registry.contract.ts:79` | — | — |
| `getAccountBank` | BranchPaymentRegistry, Management, NetCafeTopUpV3, RestaurantOrder | 3: `apps/cyber/src/hooks/use-get-account-bank.ts:16`, `packages/cyber-contracts/src/topup/topup.contract.ts:234`, `packages/cyber-contracts/src/branch-payment-registry/branch-payment-registry.contract.ts:83` | — | — |
| `getAccountBankEncoded` | BranchPaymentRegistry | 1: `packages/cyber-contracts/src/branch-payment-registry/branch-payment-registry.contract.ts:87` | — | — |
| `getActiveAgents` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3285` |
| `getActiveAgentsCount` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3298` |
| `getActiveCampaignIdsByEvent` | RestaurantLoyaltySystem | — | — | — |
| `getActiveCampaigns` | RestaurantLoyaltySystem | — | — | — |
| `getActiveDelegations` | BranchAccessManager | — | — | — |
| `getActiveRewardBatchHeapLength` | RestaurantLoyaltySystem | — | — | — |
| `getActiveRewardBatches` | RestaurantLoyaltySystem | — | — | — |
| `getActiveSessionsByTable` | RestaurantOrder | — | — | — |
| `getActivityCounters` | NetCafeSessionV3 | — | — | — |
| `getAddressByIdentity` | NetCafeUserV3 | — | — | — |
| `getAgent` | BranchAccessManager, EnhancedAgentManagement | 9: `apps/ops-agent/src/contracts/manager-contract.ts:15`, `apps/ops-agent/src/hooks/useAgent.ts:11`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:21`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:62` … | — | 2: `projects/widget-test/abis/agentAbi.js:8`, `projects/widget-test/src/abi.js:3317` |
| `getAgentAccountIds` | BranchPaymentRegistry | 2: `apps/cyber/src/pages/owner/payment/hooks/use-get-account-banks-paged.ts:21`, `packages/cyber-contracts/src/branch-payment-registry/branch-payment-registry.contract.ts:91` | — | — |
| `getAgentAllDelegations` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3450` |
| `getAgentAnalytics` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3501` |
| `getAgentBranchIds` | EnhancedAgentManagement | 3: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:147`, `apps/cyber/src/hooks/use-get-all-branch.ts:15`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:69` | — | 1: `projects/widget-test/src/abi.js:3562` |
| `getAgentCoOwnerProfiles` | BranchAccessManager | — | — | — |
| `getAgentCoOwnerWallets` | BranchAccessManager, EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3581` |
| `getAgentCoOwners` | EnhancedAgentManagement | 2: `apps/cyber/src/pages/owner/system/hooks/use-get-all-coowner.ts:16`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:95` | — | 1: `projects/widget-test/src/abi.js:3600` |
| `getAgentDelegations` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3681` |
| `getAgentFromDomain` | EnhancedAgentManagement | 4: `apps/agent-lookup/src/services/contract-lookup.ts:52`, `apps/launcher-lockscreen/src/services/contracts/contract-manager.ts:55`, `packages/system-context/src/contract-manager.ts:130`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:49` | — | 4: `shared/cyber-widget/MeosCyber/CyberAbis.qml:6`, `projects/widget-test/src/CyberTest.qml:26`, `projects/widget-test/src/CyberTest.qml:32`, `projects/widget-test/src/abi.js:3732` |
| `getAgentIQRContract` | IQRFactory | — | — | — |
| `getAgentLoyaltyContract` | LoyaltyFactory | — | — | — |
| `getAgentManagerProfiles` | BranchAccessManager | — | — | — |
| `getAgentManagerWallets` | BranchAccessManager, EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3756` |
| `getAgentManagers` | EnhancedAgentManagement | 6: `apps/cyber/src/hooks/use-get-all-branch.ts:17`, `apps/cyber/src/services/app-container.ts:174`, `apps/cyber/src/pages/manager/wifi/hooks/use-get-wifi-list.ts:17`, `apps/cyber/src/pages/owner/system/hooks/use-get-all-managers.ts:15` … | — | 1: `projects/widget-test/src/abi.js:3775` |
| `getAgentModuleState` | BranchModuleRegistry | — | — | — |
| `getAgentPerformanceSummary` | RevenueManager | — | — | — |
| `getAgentRevenue` | RevenueManager | — | — | — |
| `getAgentRevenueDetail` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3856` |
| `getAgentRevenueGrowth` | RevenueManager | — | — | — |
| `getAgentRevenueRecords` | RevenueManager | — | — | — |
| `getAgentStatusSummary` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3895` |
| `getAgentTaxPercent` | IQRFactory | — | — | — |
| `getAgents` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:3939` |
| `getAgentsByPermission` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4072` |
| `getAgentsBySuperAdmin` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4091` |
| `getAgentsByTimePeriod` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4115` |
| `getAgentsCoOwner` | StaffAgentStore | — | — | — |
| `getAgentsInfoPaginated` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:120` | — | 1: `projects/widget-test/src/abi.js:4159` |
| `getAgentsInfoPaginatedWithPemissions` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:139` | — | 1: `projects/widget-test/src/abi.js:4260` |
| `getAgentsInfoPaginatedWithPemissionsSearch` | EnhancedAgentManagement | 2: `apps/ops-agent/src/hooks/useAgents.ts:42`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:90` | — | 1: `projects/widget-test/src/abi.js:4366` |
| `getAgentsInfoPaginatedWithSearch` | EnhancedAgentManagement | 2: `apps/ops-agent/src/hooks/useAgents.ts:54`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:108` | — | 1: `projects/widget-test/src/abi.js:4467` |
| `getAgentsSorted` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4548` |
| `getAgentsSortedByTimeRange` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4592` |
| `getAllAgents` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4642` |
| `getAllAgentsInfo` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4655` |
| `getAllAgentsRevenue` | RevenueManager | — | — | — |
| `getAllAreas` | BranchResourceRegistry | — | — | — |
| `getAllAreasPagination` | BranchResourceRegistry | — | — | — |
| `getAllBranches` | BranchManagement | — | — | — |
| `getAllCampaignExecLogs` | RestaurantLoyaltySystem | — | — | — |
| `getAllCampaigns` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:379` | — | — |
| `getAllCampaignsPagination` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/campaign/hooks/use-get-all-campaigns-pagination.ts:18`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:389` | — | — |
| `getAllCategorySnapshots` | HistoryTracking | — | — | — |
| `getAllCoOwnerManagers` | BranchManagement | — | — | — |
| `getAllCoOwnerManagersPagination` | BranchManagement | — | — | — |
| `getAllDelegations` | BranchAccessManager | — | — | — |
| `getAllDeployedContracts` | IQRFactory, LoyaltyFactory | — | — | — |
| `getAllDiscountSnapshots` | HistoryTracking | — | — | — |
| `getAllDishInfo` | Management | — | — | — |
| `getAllDishSnapshots` | HistoryTracking | — | — | — |
| `getAllGroups` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:290` | — | — |
| `getAllHistory` | HistoryTracking | — | — | — |
| `getAllManagers` | BranchManagement | 1: `packages/cyber-contracts/src/branch-management/branch-management.contract.ts:41` | — | — |
| `getAllManagersByBranchPagination` | BranchManagement | — | — | — |
| `getAllManagersPagination` | BranchManagement | — | — | — |
| `getAllMemberGroupsPagination` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/tag/hooks/use-get-all-tags-pagination.ts:12`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:300` | — | — |
| `getAllMembersPagination` | RestaurantLoyaltySystem | 4: `apps/cyber/src/pages/owner/loyalty/hooks/use-loyalty-member-list.ts:14`, `apps/cyber/src/pages/owner/loyalty/customer/use-loyalty-member-list.ts:21`, `apps/cyber/src/pages/owner/member-rank/hooks/use-get-all-tiers-pagination.ts:25`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:198` | — | — |
| `getAllOptionNames` | Management | — | — | — |
| `getAllOrderIds` | AgentIQR | — | — | — |
| `getAllPaymentMethodStatus` | BranchManagement | — | — | — |
| `getAllProposalsPaginated` | BranchManagement | — | — | — |
| `getAllReservationsByPage` | RestaurantOrder | — | — | — |
| `getAllRewardVouchers` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:595` | — | — |
| `getAllRewardVouchersPagination` | RestaurantLoyaltySystem | 2: `apps/cyber/src/hooks/use-get-all-reward-vouchers-pagination.ts:16`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:620` | — | 3: `projects/widget-food-order/FoodIqrAbis.js:1012`, `projects/widget-food-order/FoodIqrAbis.js:1025`, `projects/widget-food-order/DiscountService.js:157` |
| `getAllStaffSnapshots` | HistoryTracking | — | — | — |
| `getAllTableResources` | BranchResourceRegistry | 2: `apps/cyber/src/pages/manager/stations/hooks/use-add-station.ts:41`, `packages/cyber-contracts/src/branch-resource-registry/branch-resource-registry.contract.ts:125` | — | — |
| `getAllTableResourcesPagination` | BranchResourceRegistry | — | — | — |
| `getAllTargetRevenues` | RestaurantReporting | — | — | — |
| `getAllTiers` | RestaurantLoyaltySystem | 4: `apps/sidebar-cyber/src/hooks/use-get-user-member-rank.ts:19`, `apps/cyber/src/hooks/use-get-user-member-rank.ts:20`, `apps/cyber/src/hooks/use-get-all-tiers.ts:11`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:58` | — | — |
| `getAllTiersPagination` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/member-rank/hooks/use-get-all-tiers-pagination.ts:55`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:68` | — | — |
| `getAllowedCampaignEventTypes` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:744` | — | — |
| `getArea` | BranchResourceRegistry | 2: `apps/cyber/src/pages/manager/stations/hooks/use-add-group.ts:46`, `packages/cyber-contracts/src/branch-resource-registry/branch-resource-registry.contract.ts:41` | — | — |
| `getAreaById` | BranchResourceRegistry | 2: `apps/cyber/src/pages/manager/stations/hooks/use-get-station-groups.ts:26`, `packages/cyber-contracts/src/branch-resource-registry/branch-resource-registry.contract.ts:49` | — | — |
| `getAreaIds` | BranchResourceRegistry | — | — | — |
| `getAreaSnapshots` | HistoryTracking | — | — | — |
| `getAreaUpdateSnapshots` | HistoryTracking | — | — | — |
| `getAttendanceRecord` | AttendanceSystem | — | — | — |
| `getBalances` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:367` | — | — |
| `getBannerSnapshots` | HistoryTracking | — | — | — |
| `getBannerUpdateSnapshots` | HistoryTracking | — | — | — |
| `getBanners` | Management | — | — | — |
| `getBeaconAddress` | LoyaltyFactory | — | — | — |
| `getBranchCustomRangeOverviewByDays` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:26`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:71` | — | — |
| `getBranchDayActiveUsers` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.helper.ts:202`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:86` | — | — |
| `getBranchGamePlayCount` | BranchDashboard | — | — | — |
| `getBranchGameUsage` | BranchDashboard | — | — | — |
| `getBranchGameUsagesPaged` | BranchDashboard | — | — | — |
| `getBranchId` | BranchAccessManager | — | — | — |
| `getBranchIdsCoOwner` | StaffAgentStore | — | — | — |
| `getBranchMachineTrendDay` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:45`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:178` | — | — |
| `getBranchMachineTrendMonth` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:46`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:204` | — | — |
| `getBranchMachineTrendWeek` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:48`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:191` | — | — |
| `getBranchMachineTrendYear` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:47`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:216` | — | — |
| `getBranchMachineUsageSummaryDay` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:33`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:230` | — | — |
| `getBranchMachineUsageSummaryMonth` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:34`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:256` | — | — |
| `getBranchMachineUsageSummaryWeek` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:36`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:243` | — | — |
| `getBranchMachineUsageSummaryYear` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:35`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:268` | — | — |
| `getBranchManagement` | BMFactory | 4: `apps/agent-lookup/src/services/contract-lookup.ts:72`, `apps/launcher-lockscreen/src/services/contracts/contract-manager.ts:98`, `packages/system-context/src/contract-manager.ts:170`, `packages/cyber-contracts/src/branch-manager-factory/branch-manager-factory.contract.ts:42` | — | 1: `shared/cyber-widget/MeosCyber/CyberAbis.qml:67` |
| `getBranchManagerWallets` | BranchManagement | — | — | — |
| `getBranchManagers` | BranchManagement | 1: `packages/cyber-contracts/src/branch-management/branch-management.contract.ts:45` | — | — |
| `getBranchModuleState` | BranchModuleRegistry | — | — | — |
| `getBranchModules` | BranchDashboard | — | — | — |
| `getBranchMonthOverview` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:21`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:100` | — | — |
| `getBranchNetCafeContracts` | NetCafeV3Factory | 6: `apps/agent-lookup/src/services/contract-lookup.ts:60`, `apps/launcher-lockscreen/src/services/contracts/contract-manager.ts:64`, `apps/cyber/src/pages/manager/wifi/hooks/use-get-wifi-list.ts:40`, `apps/cyber/src/pages/manager/wifi/hooks/branch-management.ts:10` … | — | 1: `shared/cyber-widget/MeosCyber/CyberAbis.qml:20` |
| `getBranchOverview` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:20`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:44` | — | — |
| `getBranchPopularGamesByDay` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:59`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:282` | — | — |
| `getBranchPopularGamesByMonth` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:60`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:308` | — | — |
| `getBranchPopularGamesByWeek` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:62`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:295` | — | — |
| `getBranchPopularGamesByYear` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:61`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:320` | — | — |
| `getBranchProposals` | BranchManagement | — | — | — |
| `getBranchProposalsByStatusPaginated` | BranchManagement | — | — | — |
| `getBranchProposalsPaginated` | BranchManagement | — | — | — |
| `getBranchRawMetrics` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.helper.ts:249`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:449` | — | — |
| `getBranchServiceDayOverviewByKey` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:140`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:386` | — | — |
| `getBranchServiceMonthOverviewByKey` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:141`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:412` | — | — |
| `getBranchServiceWeekOverviewByKeys` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:143`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:399` | — | — |
| `getBranchServiceYearOverviewByKey` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:142`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:424` | — | — |
| `getBranchTopDishesByDay` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:101`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:334` | — | — |
| `getBranchTopDishesByMonth` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:102`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:360` | — | — |
| `getBranchTopDishesByWeek` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:104`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:347` | — | — |
| `getBranchTopDishesByYear` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:103`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:372` | — | — |
| `getBranchUsageTrendDay` | BranchDashboard | 1: `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:126` | — | — |
| `getBranchUsageTrendMonth` | BranchDashboard | 1: `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:152` | — | — |
| `getBranchUsageTrendWeek` | BranchDashboard | 1: `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:139` | — | — |
| `getBranchUsageTrendYear` | BranchDashboard | 1: `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:164` | — | — |
| `getBranchWeekOverviewByDays` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:23`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:57` | — | — |
| `getBranchYearOverview` | BranchDashboard | 2: `apps/cyber/src/hooks/branch-dashboard/branch-dashboard.query.ts:22`, `packages/cyber-contracts/src/branch-dashboard/branch-dashboard.contract.ts:112` | — | — |
| `getCampaignExecLogByCampaign` | RestaurantLoyaltySystem | — | — | — |
| `getCampaignExecLogByCustomer` | RestaurantLoyaltySystem | — | — | — |
| `getCategorySnapshots` | HistoryTracking | — | — | — |
| `getCategoryUpdateSnapshots` | HistoryTracking | — | — | — |
| `getChangeHistory` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/history/hooks/use-get-loyalty-history.ts:29`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:513` | — | — |
| `getChangeHistoryByType` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/history/hooks/use-get-loyalty-history.ts:23`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:525` | — | — |
| `getContractStatus` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4705` |
| `getContractsByAgent` | LoyaltyFactory | 4: `apps/agent-lookup/src/services/contract-lookup.ts:75`, `apps/launcher-lockscreen/src/services/contracts/contract-manager.ts:99`, `packages/system-context/src/contract-manager.ts:173`, `packages/cyber-contracts/src/loyalty-factory/loyalty-factory.contract.ts:42` | — | 1: `shared/cyber-widget/MeosCyber/CyberAbis.qml:78` |
| `getCurrentDisplay` | BranchManagement | — | — | — |
| `getCurrentSessionId` | RestaurantOrder | — | — | — |
| `getCustomerInfo` | RestaurantLoyaltySystem | — | — | — |
| `getDailyReport` | AttendanceSystem | — | — | — |
| `getDailyStats` | RestaurantLoyaltySystem | — | — | — |
| `getDailyStatsRange` | RestaurantLoyaltySystem | — | — | — |
| `getDashboardDay` | NetCafeSessionV3, NetCafeSpendV3 | — | — | — |
| `getDashboardDayActiveUserListLength` | NetCafeSessionV3 | — | — | — |
| `getDashboardDayActiveUsers` | NetCafeSessionV3 | — | — | — |
| `getDashboardHourUsage` | NetCafeSessionV3 | — | — | — |
| `getDashboardHourUsageRange` | NetCafeSessionV3 | — | — | — |
| `getDashboardMachineTrendDay` | NetCafeDashboardV3 | — | — | — |
| `getDashboardMachineTrendMonth` | NetCafeDashboardV3 | — | — | — |
| `getDashboardMachineTrendWeek` | NetCafeDashboardV3 | — | — | — |
| `getDashboardMachineTrendYear` | NetCafeDashboardV3 | — | — | — |
| `getDashboardMachineUsageSummaryDay` | NetCafeDashboardV3 | — | — | — |
| `getDashboardMachineUsageSummaryMonth` | NetCafeDashboardV3 | — | — | — |
| `getDashboardMachineUsageSummaryWeek` | NetCafeDashboardV3 | — | — | — |
| `getDashboardMachineUsageSummaryYear` | NetCafeDashboardV3 | — | — | — |
| `getDashboardMetrics` | EnhancedAgentManagement | 2: `apps/ops-agent/src/hooks/useSystemMetrics.ts:9`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:154` | — | 1: `projects/widget-test/src/abi.js:4733` |
| `getDashboardMetricsByPeriod` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4799` |
| `getDashboardMonth` | NetCafeSessionV3, NetCafeSpendV3 | — | — | — |
| `getDashboardMonthOverview` | NetCafeDashboardV3 | — | — | — |
| `getDashboardOnlineStationCount` | NetCafeSessionV3 | — | — | — |
| `getDashboardOnlineStationCountRange` | NetCafeSessionV3 | — | — | — |
| `getDashboardOverview` | NetCafeDashboardV3 | — | — | — |
| `getDashboardUsageByHourOfDay` | NetCafeSessionV3 | — | — | — |
| `getDashboardWeekOverviewByDays` | NetCafeDashboardV3 | — | — | — |
| `getDashboardWeekUsers` | NetCafeSessionV3 | — | — | — |
| `getDashboardYear` | NetCafeSessionV3, NetCafeSpendV3 | — | — | — |
| `getDashboardYearOverview` | NetCafeDashboardV3 | — | — | — |
| `getDataDocument` | PublicfullDB | — | — | — |
| `getDbNames` | PublicfullDB | — | — | — |
| `getDebitByRefId` | RestaurantLoyaltySystem | — | — | — |
| `getDebitRefsByCustomer` | RestaurantLoyaltySystem | — | — | — |
| `getDebitRefsByCustomerPaging` | RestaurantLoyaltySystem | — | — | — |
| `getDeclinedStaffByOrder` | RestaurantOrder | — | — | — |
| `getDelegationInfo` | BranchAccessManager | — | — | — |
| `getDeletedAgentd` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4837` |
| `getDeletedAgentsPaginated` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:4980` |
| `getDigitalMenu` | Management | — | — | — |
| `getDiscountSnapshots` | HistoryTracking | — | — | — |
| `getDiscountUpdateSnapshots` | HistoryTracking | — | — | — |
| `getDiscountUserUsed` | Management | 3: `apps/wedget-order/src/hooks/use-get-discount-user-used.ts:14`, `apps/cyber/src/components/cart/hooks/use-get-discount-user-used.ts:14`, `packages/cyber-contracts/src/management/management.contract.ts:320` | — | 3: `projects/widget-food-order/FoodIqrAbis.js:630`, `projects/widget-food-order/FoodIqrAbis.js:643`, `projects/widget-food-order/DiscountService.js:123` |
| `getDishInfo` | Management | — | — | — |
| `getDishOptionSnapshots` | HistoryTracking | — | — | — |
| `getDishOptionUpdateSnapshots` | HistoryTracking | — | — | — |
| `getDishOrderIndex` | Management | — | — | — |
| `getDishQuantityInfo` | Management | 3: `apps/wedget-order/src/hooks/iqr/use-get-dish-quantities.ts:13`, `apps/cyber/src/hooks/iqr/use-get-dish-quantities.ts:13`, `packages/cyber-contracts/src/management/management.contract.ts:199` | — | 3: `projects/widget-food-order/FoodIqrAbis.js:385`, `projects/widget-food-order/FoodIqrAbis.js:393`, `projects/widget-food-order/FoodCatalog.js:148` |
| `getDishSnapshots` | HistoryTracking | — | — | — |
| `getDishUpdateSnapshots` | HistoryTracking | — | — | — |
| `getDisplayName` | NetCafeUserV3 | — | — | — |
| `getEarnInputAmount` | RestaurantOrder | — | — | — |
| `getEffectiveMaxPercent` | RestaurantLoyaltySystem | 4: `apps/sidebar-cyber/src/hooks/use-get-effective-max-percent.ts:10`, `apps/wedget-order/src/hooks/use-get-food-max-percent.ts:20`, `apps/cyber/src/hooks/use-get-effective-max-percent.ts:11`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:184` | 2: `CyberSidebarAbis.hpp:54`, `CyberSidebarStationModel.cpp:754` | 5: `projects/widget-session-uptime/SessionAbis.qml:72`, `projects/widget-session-uptime/SessionStats.js:201`, `projects/widget-food-order/FoodIqrAbis.js:1357`, `projects/widget-food-order/FoodIqrAbis.js:1370` … |
| `getFullPermissionAgents` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5122` |
| `getGamePlayCount` | NetCafeDashboardV3 | — | — | — |
| `getGameUsage` | NetCafeDashboardV3 | — | — | — |
| `getGameUsagesPaged` | NetCafeDashboardV3 | — | — | — |
| `getGroupIdsPaged` | NetCafeManagementV3 | 1: `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:124` | — | — |
| `getGroupsPaged` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/stations/hooks/use-get-station-groups.ts:17`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:227` | — | — |
| `getHandledTopUpsPaged` | NetCafeTopUpV3 | 2: `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:51`, `packages/cyber-contracts/src/topup/topup.contract.ts:111` | — | — |
| `getHistoryByEntity` | HistoryTracking | — | — | — |
| `getHistoryByTimeRange` | HistoryTracking | — | — | — |
| `getHistoryByType` | HistoryTracking | — | — | — |
| `getHistoryCustomersReportByTime` | Management | — | — | — |
| `getHistoryOrderReportByTime` | Management | — | — | — |
| `getHistoryRevenueReportByTime` | Management | — | — | — |
| `getHistoryStats` | HistoryTracking | — | — | — |
| `getIQRSCByAgent` | AgentIQR | — | — | — |
| `getIQRSCByAgentFromFactory` | EnhancedAgentManagement, IQRFactory | 3: `apps/launcher-lockscreen/src/services/contracts/contract-manager.ts:83`, `packages/system-context/src/contract-manager.ts:159`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:56` | — | 2: `shared/cyber-widget/MeosCyber/CyberAbis.qml:45`, `projects/widget-test/src/abi.js:5146` |
| `getIncidentByStaffAndTime` | AttendanceSystem | — | — | — |
| `getInvoiceEarnStatus` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:757` | — | — |
| `getInvoiceRewardPercent` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-get-loyalty-policies.ts:67`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:472` | — | — |
| `getLatestOrderHistory` | RestaurantOrder | — | — | — |
| `getLatestPaymentHistory` | RestaurantOrder | — | — | — |
| `getLedgerIds` | EconomyVault | — | — | — |
| `getLedgerPaged` | EconomyVault | — | — | — |
| `getMainBranchId` | BranchManagement | — | — | — |
| `getManagementAddress` | RestaurantReporting | — | — | — |
| `getManagementSCByAgentsFromFactory` | IQRFactory | — | — | — |
| `getManagerBranches` | BranchManagement | — | — | — |
| `getManagerDashboard` | BranchManagement | 1: `packages/cyber-contracts/src/branch-management/branch-management.contract.ts:49` | — | — |
| `getManagerDashboardProposal` | BranchManagement | — | — | — |
| `getManagerDashboardProposalAllBranches` | BranchManagement | 2: `apps/cyber/src/modules/notifications/hooks/use-notifications.ts:66`, `packages/cyber-contracts/src/branch-management/branch-management.contract.ts:57` | — | — |
| `getManagerDashboardProposalByBranch` | BranchManagement | — | — | — |
| `getManagerProposalStats` | BranchManagement | — | — | — |
| `getManagerSnapshots` | HistoryTracking | — | — | — |
| `getManualGrantEnabled` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-get-loyalty-policies.ts:51`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:537` | — | — |
| `getManualRequestsPagination` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/required-point/hooks/use-get-manual-requests.ts:75`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:677` | — | — |
| `getMember` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/customer/loyalty-member-search.ts:36`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:202` | — | — |
| `getMemberByMemberId` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/customer/loyalty-member-search.ts:137`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:209` | — | — |
| `getMemberBySessionWallet` | RestaurantLoyaltySystem | 3: `apps/cyber/src/pages/owner/loyalty/customer/loyalty-member-search.ts:58`, `apps/cyber/src/pages/owner/loyalty/customer/loyalty-member-search.ts:84`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:213` | — | — |
| `getMemberGroups` | RestaurantLoyaltySystem | 3: `apps/cyber/src/pages/owner/loyalty/tag/dialog-assign-tag.tsx:40`, `apps/cyber/src/pages/owner/loyalty/tag/hooks/use-get-member-groups.ts:10`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:310` | — | 3: `projects/widget-food-order/FoodIqrAbis.js:966`, `projects/widget-food-order/FoodIqrAbis.js:974`, `projects/widget-food-order/DiscountService.js:132` |
| `getMemberPaymentHistory` | RestaurantLoyaltySystem | — | — | — |
| `getMemberRewardVouchersPagination` | RestaurantLoyaltySystem | 5: `apps/wedget-order/src/hooks/use-get-member-reward-vouchers.ts:15`, `apps/cyber/src/hooks/query-keys.ts:179`, `apps/cyber/src/pages/user/my-voucher/hooks/use-redeem-reward-voucher.ts:25`, `apps/cyber/src/pages/user/my-voucher/hooks/use-get-member-reward-vouchers-pagination.ts:25` … | — | 3: `projects/widget-food-order/FoodIqrAbis.js:1133`, `projects/widget-food-order/FoodIqrAbis.js:1151`, `projects/widget-food-order/DiscountService.js:140` |
| `getMemberToGroups` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:304` | — | — |
| `getMemberTransactionsPagination` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:338` | — | — |
| `getMonthKey` | RestaurantReporting | — | — | — |
| `getMonthlyReportStaffList` | AttendanceSystem | — | — | — |
| `getMonthlyStats` | RestaurantLoyaltySystem | — | — | — |
| `getMyBalances` | RestaurantLoyaltySystem | — | — | — |
| `getMyMemberProfile` | RestaurantLoyaltySystem | — | — | — |
| `getMyReservations` | RestaurantOrder | — | — | — |
| `getMyRoleSummary` | BranchAccessManager | — | — | — |
| `getNetCafeSCByAgentFromFactory` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5212` |
| `getNetCafeV3License` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5288` |
| `getOptionNameFromId` | Management | — | — | — |
| `getOptionNamesFromDishCode` | Management | — | — | — |
| `getOrCreateDb` | PublicfullDB | — | — | — |
| `getOrder` | AgentIQR | 1: `apps/launcher-lockscreen/src/utils/auth-storage.ts:27` | — | — |
| `getOrderHistory` | RestaurantOrder | — | — | — |
| `getOrderHistoryPaginated` | RestaurantOrder | — | — | — |
| `getOrderStaffInfo` | RestaurantOrder | — | — | — |
| `getPCbyAddress` | NetCafeStationV3 | 4: `apps/cyber/src/hooks/use-topup.ts:36`, `apps/cyber/src/hooks/use-topup.ts:68`, `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:87`, `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:88` | — | — |
| `getPayment` | RestaurantOrder | — | — | — |
| `getPaymentByOrder` | RestaurantOrder | 7: `apps/wedget-order/src/hooks/use-make-order.ts:46`, `apps/cyber/src/providers/event-provider.tsx:457`, `apps/cyber/src/pages/staff/order-manager/utils/map-order.ts:109`, `apps/cyber/src/pages/staff/order-manager/hooks/use-order-actions.ts:20` … | — | 4: `projects/widget-food-order/FoodIqrAbis.js:750`, `projects/widget-food-order/FoodIqrAbis.js:758`, `projects/widget-food-order/OrderService.js:225`, `projects/widget-food-order/OrderService.js:293` |
| `getPaymentCancelSettlement` | RestaurantOrder | — | — | — |
| `getPaymentConfig` | RestaurantLoyaltySystem | 7: `apps/cyber/src/hooks/use-branch-payment-config.ts:11`, `apps/cyber/src/hooks/use-create-transaction.ts:27`, `apps/cyber/src/hooks/use-topup.ts:56`, `apps/cyber/src/pages/user/user-topup/hooks/use-request-topup.ts:26` … | — | — |
| `getPaymentCourses` | RestaurantOrder | — | — | — |
| `getPaymentDashboardItem` | RestaurantOrder | — | — | — |
| `getPaymentDashboardSummary` | RestaurantOrder | — | — | — |
| `getPaymentHistory` | RestaurantOrder | — | — | — |
| `getPaymentHistoryByAction` | RestaurantOrder | — | — | — |
| `getPaymentHistoryByStaff` | RestaurantOrder | — | — | — |
| `getPaymentHistoryCount` | RestaurantOrder | — | — | — |
| `getPaymentHistoryItem` | RestaurantOrder | — | — | — |
| `getPaymentHistoryPaginated` | RestaurantOrder | — | — | — |
| `getPaymentInfo` | RestaurantOrder | — | — | — |
| `getPaymentInfoByOrder` | RestaurantOrder | 3: `apps/cyber/src/pages/staff/order-manager/utils/map-order.ts:120`, `apps/cyber/src/pages/staff/order-manager/hooks/use-order-actions.ts:21`, `apps/cyber/src/pages/user/order/utils/map-user-order.ts:157` | — | — |
| `getPaymentInfoHistoryItem` | RestaurantOrder | — | — | — |
| `getPaymentInfoSnapshots` | HistoryTracking | — | — | — |
| `getPaymentInfosWithStatus` | RestaurantOrder | — | — | — |
| `getPaymentLoyaltyUsed` | RestaurantOrder | 2: `apps/cyber/src/pages/staff/order-manager/utils/map-order.ts:133`, `apps/cyber/src/pages/user/order/utils/map-user-order.ts:125` | — | — |
| `getPaymentPointsInfo` | RestaurantOrder | — | — | — |
| `getPaymentsPagination` | RestaurantOrder | 1: `apps/cyber/src/pages/staff/order-manager/hooks/use-history-orders.ts:44` | — | — |
| `getPaymentsWithStatus` | RestaurantOrder | — | — | — |
| `getPendingTopUps` | NetCafeTopUpV3 | 2: `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:39`, `packages/cyber-contracts/src/topup/topup.contract.ts:90` | — | — |
| `getPendingTopUpsPaged` | NetCafeTopUpV3 | 3: `apps/cyber/src/pages/user/user-topup/hooks/use-get-user-pending-topups.ts:16`, `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:20`, `packages/cyber-contracts/src/topup/topup.contract.ts:98` | — | — |
| `getPendingTransfers` | RestaurantOrder | — | — | — |
| `getPendingTransfersByStaff` | RestaurantOrder | — | — | — |
| `getPerformanceLeaderboard` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5329` |
| `getPointHistoryByAction` | PublicfullDB | — | — | — |
| `getPointHistoryByBalanceRange` | PublicfullDB | — | — | — |
| `getPointHistoryByBranch` | PublicfullDB | — | — | — |
| `getPointHistoryByMember` | PublicfullDB | — | — | — |
| `getPointHistoryByMemberAndBranch` | PublicfullDB | — | — | — |
| `getPointHistoryByMemberAndModule` | PublicfullDB | — | — | — |
| `getPointHistoryByTokenAndAction` | PublicfullDB | — | — | — |
| `getPointHistoryByTokenType` | PublicfullDB | — | — | — |
| `getPointHistoryRecordByDocId` | PublicfullDB | — | — | — |
| `getPoints` | Management | — | — | — |
| `getPopularGamesByDay` | NetCafeDashboardV3 | — | — | — |
| `getPopularGamesByMonth` | NetCafeDashboardV3 | — | — | — |
| `getPopularGamesByWeek` | NetCafeDashboardV3 | — | — | — |
| `getPopularGamesByYear` | NetCafeDashboardV3 | — | — | — |
| `getPositionSnapshots` | HistoryTracking | — | — | — |
| `getPositionUpdateSnapshots` | HistoryTracking | — | — | — |
| `getPricePoliciesPaged` | NetCafeManagementV3 | 1: `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:249` | — | — |
| `getPricePolicyIdsPaged` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/stations/hooks/use-get-price-policies.ts:19`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:179` | — | — |
| `getProposalDetails` | BranchManagement | — | — | — |
| `getProposalsByStatusPaginated` | BranchManagement | — | — | — |
| `getRecentHistoryByEntity` | HistoryTracking | — | — | — |
| `getRecentRevenueRecords` | RevenueManager | — | — | — |
| `getReservationDetails` | RestaurantOrder | — | — | — |
| `getResource` | BranchResourceRegistry | — | — | — |
| `getResourceByNumber` | BranchResourceRegistry | — | — | — |
| `getResourceIds` | BranchResourceRegistry | — | — | — |
| `getResourceIdsByArea` | BranchResourceRegistry | — | — | — |
| `getResourceIdsByType` | BranchResourceRegistry | — | — | — |
| `getRevenueByPeriod` | RevenueManager | — | — | — |
| `getRevenueByTimeRange` | RevenueManager | — | — | — |
| `getRevenueRecord` | RevenueManager | — | — | — |
| `getRevenueRecordsByModule` | RevenueManager | — | — | — |
| `getReview` | RestaurantOrder | — | — | — |
| `getReviewByDish` | RestaurantOrder | — | — | — |
| `getReviewsByDate` | RestaurantOrder | — | — | — |
| `getReviewsByMonth` | RestaurantOrder | — | — | — |
| `getRewardBatchBranchIds` | RestaurantLoyaltySystem | — | — | — |
| `getRobotSCByAgentFromFactory` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5358` |
| `getRoleAdmin` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `getSession` | NetCafeSessionV3 | 25: `apps/sidebar-cyber/src/providers/system-context.provider.tsx:37`, `apps/sidebar-cyber/src/lib/error-reporter.ts:14`, `apps/launcher-lockscreen/src/hooks/use-sync-callback.ts:36`, `apps/launcher-lockscreen/src/hooks/use-login-with-password.ts:52` … | — | 3: `projects/widget-dev-login/LoginService.js:151`, `projects/widget-dev-login/LoginService.js:163`, `projects/widget-dev-login/LoginAbis.qml:42` |
| `getSessionByUser` | NetCafeSessionV3 | 1: `packages/cyber-contracts/src/net-cafe-session/net-cafe-session.contract.ts:88` | — | — |
| `getSessionCourse` | RestaurantOrder | — | — | — |
| `getSessionCourseCount` | RestaurantOrder | — | — | — |
| `getSessionOrder` | RestaurantOrder | 2: `apps/sidebar-cyber/src/hooks/use-processing-order-count.ts:56`, `apps/cyber/src/pages/user/order/hooks/use-my-orders.ts:20` | 3: `CyberSidebarAbis.hpp:123`, `CyberSidebarBadges.cpp:184`, `CyberSidebarBadges.cpp:196` | — |
| `getSessionOrderCount` | RestaurantOrder | 2: `apps/sidebar-cyber/src/hooks/use-processing-order-count.ts:51`, `apps/cyber/src/pages/user/order/hooks/use-my-orders.ts:15` | 2: `CyberSidebarAbis.hpp:117`, `CyberSidebarBadges.cpp:150` | — |
| `getSessionPayment` | RestaurantOrder | — | — | — |
| `getSessionPaymentIds` | RestaurantOrder | — | — | — |
| `getSessionPaymentInfo` | RestaurantOrder | — | — | — |
| `getSessionPaymentInfoIds` | RestaurantOrder | — | — | — |
| `getSettingAddress` | AttendanceSystem | — | — | — |
| `getSpendHistoryPaged` | NetCafeSpendV3 | — | — | — |
| `getSpendPolicy` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:132` | — | — |
| `getSpendPolicyBranch` | RestaurantLoyaltySystem | 5: `apps/sidebar-cyber/src/hooks/use-get-spend-policy.ts:8`, `apps/wedget-order/src/hooks/use-get-spend-policy.ts:13`, `apps/cyber/src/pages/owner/policy/hooks/use-get-spend-policy.ts:12`, `apps/cyber/src/pages/owner/loyalty/point/hooks/use-get-loyalty-policies.ts:23` … | 2: `CyberSidebarAbis.hpp:48`, `CyberSidebarStationModel.cpp:737` | 5: `projects/widget-session-uptime/SessionAbis.qml:57`, `projects/widget-session-uptime/SessionStats.js:190`, `projects/widget-food-order/FoodIqrAbis.js:1328`, `projects/widget-food-order/FoodIqrAbis.js:1336` … |
| `getStaffActiveOrders` | RestaurantOrder | — | — | — |
| `getStaffActiveOrdersCount` | RestaurantOrder | — | — | — |
| `getStaffDailyReport` | AttendanceSystem | — | — | — |
| `getStaffDayDetailsAMonth` | AttendanceSystem | — | — | — |
| `getStaffHalfDays` | AttendanceSystem | — | — | — |
| `getStaffLateDays` | AttendanceSystem | — | — | — |
| `getStaffMonthlyReportRealtime` | AttendanceSystem | — | — | — |
| `getStaffMonthlyStats` | AttendanceSystem | — | — | — |
| `getStaffShareForOrder` | RestaurantOrder | — | — | — |
| `getStaffSnapshots` | HistoryTracking | — | — | — |
| `getStaffUnauthorizedDays` | AttendanceSystem | — | — | — |
| `getStaffUpdateSnapshots` | HistoryTracking | — | — | — |
| `getStaffVacationDays` | AttendanceSystem | — | — | — |
| `getStaffWorkingDays` | AttendanceSystem | — | — | — |
| `getStationCount` | NetCafeManagementV3 | — | — | — |
| `getStationIds` | NetCafeManagementV3 | 4: `apps/cyber/src/hooks/use-sync-gpu.ts:69`, `apps/cyber/src/hooks/use-get-stations.ts:125`, `apps/cyber/src/pages/manager/stations/hooks/use-get-gpu-registration-stations.ts:24`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:78` | — | — |
| `getStationIdsPaged` | NetCafeManagementV3 | 1: `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:67` | — | — |
| `getStationMeta` | NetCafeManagementV3 | 4: `apps/launcher-lockscreen/src/hooks/use-station-info.ts:20`, `apps/cyber/src/providers/event-provider.tsx:260`, `apps/cyber/src/modules/notifications/hooks/use-topup-stations.ts:31`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:54` | — | — |
| `getStationPrice` | NetCafeManagementV3 | 1: `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:266` | — | — |
| `getStationsPaged` | NetCafeStationV3 | 2: `apps/cyber/src/hooks/use-get-stations.ts:16`, `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:43` | — | — |
| `getStatistics` | AgentIQR | — | — | — |
| `getSubLocationCount` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5439` |
| `getSuperAdminsByCompanyAdmin` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5458` |
| `getSystemAnalytics` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5471` |
| `getSystemPerformanceMetrics` | RevenueManager | — | — | — |
| `getSystemRevenue` | RevenueManager | — | — | — |
| `getSystemRevenueGrowth` | RevenueManager | — | — | — |
| `getSystemStats` | BranchManagement | — | — | — |
| `getTCSnapshots` | HistoryTracking | — | — | — |
| `getTCUpdateSnapshots` | HistoryTracking | — | — | — |
| `getTableByNumber` | BranchResourceRegistry | 3: `apps/cyber/src/pages/staff/order-manager/utils/map-order.ts:200`, `apps/cyber/src/pages/staff/order-manager/hooks/use-history-orders.ts:55`, `packages/cyber-contracts/src/branch-resource-registry/branch-resource-registry.contract.ts:118` | — | — |
| `getTableByPaymentId` | RestaurantOrder | — | — | — |
| `getTableBySession` | RestaurantOrder | 3: `apps/cyber/src/pages/staff/order-manager/utils/map-order.ts:309`, `apps/cyber/src/pages/staff/order-manager/hooks/use-history-orders.ts:54`, `apps/cyber/src/pages/staff/order-manager/hooks/use-order-actions.ts:19` | — | — |
| `getTableData` | BranchResourceRegistry | 5: `apps/wedget-order/src/hooks/use-place-order.ts:39`, `apps/launcher-lockscreen/src/utils/auth-storage.ts:21`, `apps/cyber/src/components/partials/headers/header-actions.tsx:98`, `apps/cyber/src/components/partials/headers/header-actions.tsx:152` … | — | 6: `projects/widget-food-order/FoodIqrAbis.js:905`, `projects/widget-food-order/FoodIqrAbis.js:923`, `projects/widget-food-order/OrderService.js:58`, `projects/widget-dev-login/LoginAbis.qml:77` … |
| `getTableReservation` | RestaurantOrder | — | — | — |
| `getTableResourceIdByNumber` | BranchResourceRegistry | — | — | 2: `projects/widget-dev-login/LoginAbis.qml:99`, `projects/widget-dev-login/LoginTableResolve.js:25` |
| `getTableResourcesByArea` | BranchResourceRegistry | — | — | — |
| `getTableResourcesByAreaPagination` | BranchResourceRegistry | — | — | — |
| `getTableSnapshots` | HistoryTracking | — | — | — |
| `getTableUpdateSnapshots` | HistoryTracking | — | — | — |
| `getTaxPercent` | RestaurantOrder | — | — | — |
| `getTcs` | Management | — | — | — |
| `getTcsPagination` | Management | — | — | — |
| `getTermsDocument` | PublicfullDB | — | — | — |
| `getTier` | RestaurantLoyaltySystem | — | — | — |
| `getTimeZone` | AttendanceSystem | — | — | — |
| `getTopAgentsByModule` | RevenueManager | — | — | — |
| `getTopAgentsByRevenue` | RevenueManager | — | — | — |
| `getTopUpHistory` | NetCafeTopUpV3 | 2: `apps/cyber/src/pages/user/user-topup/hooks/use-get-topup-history.ts:23`, `packages/cyber-contracts/src/topup/topup.contract.ts:157` | — | — |
| `getTopUpPcIds` | NetCafeTopUpV3 | 2: `apps/cyber/src/modules/notifications/hooks/use-topup-stations.ts:20`, `packages/cyber-contracts/src/topup/topup.contract.ts:126` | — | — |
| `getTopupPolicy` | RestaurantLoyaltySystem | 3: `apps/cyber/src/hooks/use-get-topup-policy.ts:9`, `apps/cyber/src/pages/owner/loyalty/point/hooks/use-get-loyalty-policies.ts:14`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:461` | — | — |
| `getTotalOfflineStations` | NetCafeStationV3 | 1: `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:100` | — | — |
| `getTotalOnlineStations` | NetCafeStationV3 | 1: `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:96` | — | — |
| `getTotalRevenue` | AgentIQR | — | — | — |
| `getTotalRevenueRecords` | RevenueManager | — | — | — |
| `getTotalStations` | NetCafeStationV3 | — | — | — |
| `getTotalUserSnapshotDayAt` | NetCafeUserV3 | — | — | — |
| `getTotalUserSnapshotDaysLength` | NetCafeUserV3 | — | — | — |
| `getTotalUsers` | NetCafeUserV3 | — | — | 3: `projects/widget-test/abis/chatFactoryAbi.js:1095`, `projects/widget-test/src/abi.js:1095`, `projects/widget-chat/abis/chatFactoryAbi.js:1095` |
| `getTotalUsersAtDay` | NetCafeUserV3 | — | — | — |
| `getTransactionByDocId` | PublicfullDB | — | — | — |
| `getTransactionCounter` | RestaurantLoyaltySystem | — | — | — |
| `getTransferOverview` | RestaurantOrder | — | — | — |
| `getTxsByBranch` | PublicfullDB | 2: `apps/cyber/src/pages/owner/loyalty/history-tracking/hooks/use-get-txs-by-branch.ts:52`, `packages/cyber-contracts/src/public-full-db/public-full-db.contract.ts:52` | — | — |
| `getTxsByBranchAndAmountRange` | PublicfullDB | — | — | — |
| `getTxsByBranchAndModule` | PublicfullDB | — | — | — |
| `getTxsByBranchAndTimeRange` | PublicfullDB | — | — | — |
| `getTxsByMember` | PublicfullDB | — | — | — |
| `getTxsByMemberAndBranch` | PublicfullDB | — | — | — |
| `getTxsByMemberAndModule` | PublicfullDB | — | — | — |
| `getTxsByMemberAndType` | PublicfullDB | — | — | — |
| `getTxsByModule` | PublicfullDB | — | — | — |
| `getTxsByTimeRange` | PublicfullDB | — | — | — |
| `getUniformSnapshots` | HistoryTracking | — | — | — |
| `getUniformUpdateSnapshots` | HistoryTracking | — | — | — |
| `getUniforms` | Management | — | — | — |
| `getUpdateCount` | HistoryTracking | — | — | — |
| `getUpdateTimeline` | HistoryTracking | — | — | — |
| `getUpdateTimestamps` | HistoryTracking | — | — | — |
| `getUserAgetSCs` | StaffAgentStore | — | — | — |
| `getUserNotificationsByBranch` | BranchManagement | — | — | — |
| `getUserProfile` | NetCafeUserV3 | 3: `apps/cyber/src/pages/staff/staff-accounts/hooks/use-accounts.ts:80`, `apps/cyber/src/pages/staff/staff-accounts/hooks/use-accounts.ts:92`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:110` | — | 2: `projects/widget-test/abis/p2pAbi.js:1961`, `projects/widget-chat/abis/p2pAbi.js:1961` |
| `getUserRole` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5515` |
| `getUserRoleSummary` | BranchAccessManager | — | — | — |
| `getUserStationData` | NetCafeUserV3 | 1: `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:162` | — | — |
| `getUsers` | NetCafeUserV3 | 3: `apps/cyber/src/hooks/use-get-users.ts:19`, `apps/cyber/src/pages/staff/staff-accounts/hooks/use-accounts.ts:101`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:91` | — | — |
| `getValueDocument` | PublicfullDB | — | — | — |
| `getVariant` | Management | — | — | — |
| `getVersion` | EnhancedAgentManagement, IQRFactory, RevenueManager | — | — | 1: `projects/widget-test/src/abi.js:5543` |
| `getWalletByUsername` | NetCafeUserV3 | 2: `apps/cyber/src/pages/staff/staff-accounts/hooks/use-accounts.ts:89`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:142` | — | — |
| `getWeeklyStats` | RestaurantLoyaltySystem | — | — | — |
| `getWifi` | NetCafeManagementV3 | 3: `apps/cyber/src/hooks/use-get-station-wifi.ts:12`, `apps/cyber/src/pages/manager/wifi/hooks/use-get-wifi-list.ts:47`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:281` | — | — |
| `getWorkPlaceById` | AttendanceSystem | — | — | — |
| `getWorkingShiftSnapshots` | HistoryTracking | — | — | — |
| `getWorkingShiftUpdateSnapshots` | HistoryTracking | — | — | — |
| `getWorkingShifts` | BranchAccessManager | 1: `apps/cyber/src/pages/manager/staffs/hooks/use-get-working-shifts.ts:15` | — | — |
| `getYearKey` | RestaurantReporting | — | — | — |
| `grantPermissionsForBranchModules` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5572` |
| `grantRole` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `grantTokenBManual` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:262` | — | — |
| `grantWriterRole` | HistoryTracking | — | — | — |
| `groupDeleting` | RestaurantLoyaltySystem | — | — | — |
| `groupIds` | NetCafeManagementV3 | — | — | 2: `projects/widget-food-order/FoodIqrAbis.js:978`, `projects/widget-food-order/DiscountService.js:133` |
| `groupMemberIndexPlusOne` | RestaurantLoyaltySystem | — | — | — |
| `groupMembers` | RestaurantLoyaltySystem | — | — | — |
| `groups` | NetCafeManagementV3 | 11: `apps/sidebar-cyber/src/services/station.service.ts:15`, `apps/cyber/src/hooks/query-keys.ts:24`, `apps/cyber/src/hooks/use-get-stations.ts:30`, `apps/cyber/src/services/app-container.ts:77` … | 2: `CyberSidebarAbis.hpp:30`, `CyberSidebarStationModel.cpp:633` | 5: `projects/widget-session-uptime/SessionAbis.qml:27`, `projects/widget-session-uptime/SessionStats.js:166`, `projects/widget-test/abis/chatFactoryAbi.js:1198`, `projects/widget-test/src/abi.js:1198` … |
| `halfDayThreshold` | AttendanceSystem | — | — | — |
| `handleCustomerCheckIn` | RestaurantOrder | — | — | — |
| `handleNoShow` | RestaurantOrder | — | — | — |
| `handledTopUpIds` | NetCafeTopUpV3 | — | — | — |
| `hasAdminOrStaffRole` | RestaurantReporting | — | — | — |
| `hasExplicitPermission` | BranchAccessManager | — | — | — |
| `hasPermission` | BranchAccessManager | — | — | — |
| `hasRole` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `hasTransferRequest` | RestaurantOrder | — | — | — |
| `heartbeat` | NetCafeSessionV3 | 2: `apps/sidebar-cyber/src/services/session-manager/session-manager.service.ts:88`, `packages/cyber-contracts/src/net-cafe-session/net-cafe-session.contract.ts:75` | 2: `CyberSidebarSessionManager.cpp:349`, `CyberSidebarAbis.hpp:75` | — |
| `historyByTableSnapshots` | HistoryTracking | — | — | — |
| `historyIndicesByEntity` | HistoryTracking | — | — | — |
| `historyIndicesByType` | HistoryTracking | — | — | — |
| `historyTracking` | BranchAccessManager, Management | — | — | — |
| `historyTrackingIMP` | BranchManagement | — | — | — |
| `hourlyUsageRevenue` | NetCafeSessionV3 | — | — | — |
| `hourlyUsageSeconds` | NetCafeSessionV3 | — | — | — |
| `importActivityCounter` | NetCafeSessionV3 | — | — | — |
| `importActivityCounters` | NetCafeSessionV3 | — | — | — |
| `importDashboardDayActiveUsers` | NetCafeSessionV3 | — | — | — |
| `importLastActiveDays` | NetCafeSessionV3 | — | — | — |
| `importTotalUserSnapshotsRange` | NetCafeUserV3 | — | — | — |
| `increaseDishQuantity` | Management | — | — | — |
| `indexTextForDocument` | PublicfullDB | — | — | — |
| `initAgentDbs` | PublicfullDB | — | — | — |
| `initialize` | AgentIQR, AgentModuleProvisioner, AttendanceSystem, BMFactory, BranchAccessManager, BranchDashboard, BranchManagement, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, HistoryTracking, IQRFactory, LoyaltyFactory, Management, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, NetCafeV3Factory, PublicfullDB, RestaurantLoyaltySystem, RestaurantOrder, RestaurantReporting, RevenueManager, StaffAgentStore | 18: `deployCloudRental.js:54`, `apps/sidebar-cyber/src/providers/system-context.provider.tsx:36`, `apps/wedget-chat/src/providers/widget-context.tsx:19`, `apps/wedget-order/src/providers/widget-context.tsx:19` … | — | 6: `shared/file-transfer/src/file.abi.js:782`, `shared/cyber-widget/MeosCyber/CyberContext.qml:572`, `projects/widget-food-order/Main.qml:539`, `projects/widget-test/abis/p2pAbi.js:2042` … |
| `invoiceRewardPercent` | RestaurantLoyaltySystem | — | — | — |
| `iqrAgentSC` | RestaurantOrder | — | — | — |
| `iqrFactory` | AgentIQR, BMFactory, BranchDashboard, EnhancedAgentManagement, FreeGasStorage, StaffAgentStore | — | — | 1: `projects/widget-test/src/abi.js:5586` |
| `iqrFactorySc` | BranchManagement | — | — | — |
| `iqrTransfered` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5610` |
| `isActive` | AgentIQR, NetCafeUserV3 | 1: `apps/cyber/src/pages/owner/loyalty/tag/tag-table.tsx:34` | 5: `CyberSidebarStationModel.hpp:108`, `CyberSidebarHeartbeat.cpp:78`, `CyberSidebarStationModel.cpp:503`, `CyberSidebarStationModel.cpp:560` … | 34: `projects/widget-food-order/FoodIqrAbis.js:995`, `projects/widget-test/abis/p2pAbi.js:1143`, `projects/widget-test/abis/p2pAbi.js:1319`, `projects/widget-test/abis/p2pAbi.js:1351` … |
| `isAdmin` | BranchAccessManager, EnhancedAgentManagement | 3: `apps/ops-agent/src/hooks/useIsAdmin.ts:9`, `apps/ops-agent/src/hooks/useIsAdmin.ts:13`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:159` | — | 1: `projects/widget-test/src/abi.js:5629` |
| `isAdminIqr` | IQRFactory | — | — | — |
| `isAgentDelegateActive` | EnhancedAgentManagement | 2: `packages/system-context/src/system-context.ts:181`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:160` | — | 1: `projects/widget-test/src/abi.js:5653` |
| `isAllowed` | FreeGasStorage | — | — | — |
| `isAllowedCaller` | PublicfullDB | — | — | — |
| `isAttendanceRecorded` | AttendanceSystem | — | — | — |
| `isBranchManagement` | StaffAgentStore | — | — | — |
| `isBranchManager` | BranchAccessManager | 3: `apps/cyber/src/services/app-container.ts:177`, `apps/cyber/src/pages/owner/loyalty/history/hooks/use-get-staff-by-wallet.ts:33`, `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:45` | — | — |
| `isBranchManagerWallet` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:53` | — | — |
| `isCodeExist` | Management | — | — | — |
| `isCompanyAdmin` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:164` | — | 1: `projects/widget-test/src/abi.js:5672` |
| `isDA` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5691` |
| `isDailyActive` | BranchAccessManager | — | — | — |
| `isDailyActiveByBranch` | BranchAccessManager | — | — | — |
| `isDelegateActive` | BranchAccessManager | 2: `packages/system-context/src/system-context.ts:184`, `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:273` | — | — |
| `isDelegateAuthorized` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:285` | — | — |
| `isLegacyRewardVoucherInCurrentCatalog` | RestaurantLoyaltySystem | — | — | — |
| `isMainOwner` | BranchManagement | — | — | — |
| `isManagement` | StaffAgentStore | — | — | — |
| `isMember` | RestaurantLoyaltySystem | — | — | — |
| `isMemberGroupId` | RestaurantLoyaltySystem | — | — | — |
| `isMemberPointSystem` | RestaurantLoyaltySystem | — | — | — |
| `isModuleActive` | BranchModuleRegistry | 5: `apps/ops-agent/src/hooks/useAgent.ts:27`, `apps/ops-agent/src/hooks/useAgent.ts:35`, `apps/ops-agent/src/hooks/useAgent.ts:43`, `apps/ops-agent/src/hooks/useAgent.ts:51` … | — | — |
| `isModuleInstalledForAgent` | BranchModuleRegistry | — | — | — |
| `isMonthlyActive` | BranchAccessManager | — | — | — |
| `isNetSpendModule` | RestaurantLoyaltySystem | — | — | — |
| `isOnline` | NetCafeUserV3 | — | — | — |
| `isOptionNameExist` | Management | — | — | — |
| `isOrder` | RestaurantLoyaltySystem | — | — | — |
| `isOrderAcknowledged` | RestaurantOrder | — | — | — |
| `isPaused` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5704` |
| `isPolicyInUse` | NetCafeManagementV3 | 1: `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:271` | — | — |
| `isRewardVoucherInCurrentCatalog` | RestaurantLoyaltySystem | — | — | — |
| `isSessionAvailable` | BranchResourceRegistry | — | — | — |
| `isStaff` | BranchAccessManager | — | — | — |
| `isStaffExists` | AttendanceSystem | — | — | — |
| `isStationMaintenance` | NetCafeStationV3 | 2: `apps/launcher-lockscreen/src/hooks/use-station-info.ts:21`, `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:76` | — | — |
| `isStationOnline` | NetCafeStationV3 | 1: `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:80` | — | — |
| `isTokenHolder` | RestaurantLoyaltySystem | — | — | — |
| `isTopUp` | RestaurantLoyaltySystem | — | — | — |
| `isValidAmount` | NetCafeTopUpV3, RestaurantOrder | — | — | — |
| `lastActiveDay` | NetCafeSessionV3 | — | — | — |
| `lastHeartbeatAt` | NetCafeStationV3 | 2: `apps/cyber/src/hooks/use-stations-liveness.ts:37`, `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:56` | — | — |
| `lastRequestDate` | RestaurantLoyaltySystem | — | — | — |
| `lastResetTime` | Management | — | — | — |
| `lastUpdateIqr` | IQRFactory | — | — | — |
| `lateThreshold` | AttendanceSystem | — | — | — |
| `ledgerCounter` | EconomyVault | — | — | — |
| `ledgerEntries` | EconomyVault | — | — | — |
| `lifetimeTokenA` | RestaurantLoyaltySystem | — | — | — |
| `linkGG` | Management | — | — | — |
| `lockBonusPoints` | RestaurantLoyaltySystem | — | — | — |
| `lockEarnPoints` | RestaurantLoyaltySystem | — | — | — |
| `lockMember` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:230` | — | — |
| `lockPoints` | RestaurantLoyaltySystem | — | — | — |
| `lockWalletPoints` | RestaurantLoyaltySystem | — | — | — |
| `lockedBalanceOf` | RestaurantLoyaltySystem | — | — | — |
| `lockedEarnTierBPlanned` | RestaurantLoyaltySystem | — | — | — |
| `lockedEarns` | RestaurantLoyaltySystem | — | — | — |
| `lockedPointMember` | RestaurantLoyaltySystem | — | — | — |
| `lockedPoints` | RestaurantLoyaltySystem | — | — | — |
| `loginUser` | NetCafeUserV3 | 2: `apps/launcher-lockscreen/src/hooks/use-finalize-login.ts:34`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:61` | — | 2: `projects/widget-dev-login/LoginService.js:164`, `projects/widget-dev-login/LoginAbis.qml:34` |
| `loginWithOTP` | NetCafeUserV3 | 2: `apps/launcher-lockscreen/src/hooks/use-login-with-otp.ts:31`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:56` | — | — |
| `loginWithPassword` | NetCafeUserV3 | 2: `apps/launcher-lockscreen/src/hooks/use-login-with-password.ts:44`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:127` | — | 4: `shared/cyber-widget/MeosCyber/CyberSdkTransport.qml:166`, `projects/widget-dev-login/LoginService.js:145`, `projects/widget-dev-login/LoginService.js:147`, `projects/widget-dev-login/LoginAbis.qml:23` |
| `logoutUser` | NetCafeUserV3 | 3: `apps/launcher-lockscreen/src/utils/auth-storage.ts:73`, `packages/system-context/src/system-context.ts:254`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:65` | 2: `CyberSidebarSessionManager.cpp:146`, `CyberSidebarAbis.hpp:81` | — |
| `loyaltyBeacon` | LoyaltyFactory | — | — | — |
| `loyaltyByAgent` | PublicfullDB | — | — | — |
| `loyaltyContract` | PublicfullDB | — | — | — |
| `loyaltyFactory` | EnhancedAgentManagement | 4: `packages/system-context/src/contract-manager.ts:232`, `packages/system-context/src/contract-manager.ts:249`, `packages/system-context/src/contract-manager.ts:283`, `packages/system-context/src/contract-manager.ts:328` | — | 4: `shared/cyber-widget/DevEnvExport.js:49`, `shared/cyber-widget/MeosCyber/CyberContext.qml:599`, `projects/widget-dev-login/Main.qml:54`, `projects/widget-test/src/abi.js:5717` |
| `loyaltyPoints` | NetCafeSessionV3, NetCafeSpendV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `mAddToStaff` | BranchAccessManager | — | — | — |
| `mAgentToDomain` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5736` |
| `mAgentToIQR` | AgentIQR | — | — | — |
| `mAgentToMainBranchId` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5755` |
| `mAttribute` | Management | — | — | — |
| `mBranchIdToBranch` | EnhancedAgentManagement | 3: `apps/cyber/src/hooks/use-get-all-branch.ts:25`, `apps/cyber/src/pages/manager/wifi/hooks/use-get-wifi-list.ts:39`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:81` | — | 1: `projects/widget-test/src/abi.js:5774` |
| `mBranchIdToHistoryTrack` | BranchManagement | — | — | — |
| `mCategoryAttributes` | Management | — | — | — |
| `mCoOwnerToAgent` | StaffAgentStore | — | — | — |
| `mCoOwnerToAgentToBranchIds` | StaffAgentStore | — | — | — |
| `mCodeCatToDishes` | Management | — | — | — |
| `mCodeHashToDiscountId` | Management | — | — | — |
| `mCodeToCat` | Management | — | — | — |
| `mCodeToDiscount` | Management | — | — | — |
| `mCodeToDish` | Management | — | — | — |
| `mDayToDishCode` | Management | — | — | — |
| `mDayToDishCodeOrder` | Management | — | — | — |
| `mDishCodeToFeatureIds` | Management | — | — | — |
| `mDishCodeToOptionNames` | Management | — | — | — |
| `mDishCodeToOptions` | Management | — | — | — |
| `mDishCodeToRankReport` | Management | — | — | — |
| `mDishCodeToReviews` | RestaurantOrder | — | — | — |
| `mDishVariant` | Management | — | — | — |
| `mDomainToBranchId` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5833` |
| `mDomainToWallet` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5852` |
| `mIdToIncident` | AttendanceSystem | — | — | — |
| `mIdToOption` | Management | — | — | — |
| `mIdToPayment` | RestaurantOrder | — | — | — |
| `mIdToPaymentInformation` | RestaurantOrder | — | — | — |
| `mIdToReservations` | RestaurantOrder | — | — | — |
| `mIdToSession` | RestaurantOrder | — | — | — |
| `mLatestCheckinShift` | AttendanceSystem | — | — | — |
| `mLatestCheckoutShift` | AttendanceSystem | — | — | — |
| `mManagement` | RestaurantLoyaltySystem | — | — | — |
| `mMonthToDishCode` | Management | — | — | — |
| `mMonthToDishCodeOrder` | Management | — | — | — |
| `mOptionIdToDishCodes` | Management | — | — | — |
| `mOrder` | RestaurantLoyaltySystem | — | — | — |
| `mOrderIdToCourses` | RestaurantOrder | — | — | — |
| `mOrderIdToOrder` | RestaurantOrder | — | — | — |
| `mOrderIdToPaymentId` | RestaurantOrder | — | — | — |
| `mPaymentMethodActive` | BranchManagement | — | — | — |
| `mPosition` | BranchAccessManager | — | — | — |
| `mRevenueTarget` | RestaurantReporting | — | — | — |
| `mRewardVouchers` | RestaurantLoyaltySystem | — | — | — |
| `mRewardVouchersById` | RestaurantLoyaltySystem | 4: `apps/wedget-order/src/hooks/use-check-discount.ts:12`, `apps/cyber/src/pages/staff/order-manager/utils/map-order.ts:165`, `apps/cyber/src/components/cart/hooks/use-check-discount.ts:18`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:761` | — | 3: `projects/widget-food-order/FoodIqrAbis.js:1244`, `projects/widget-food-order/FoodIqrAbis.js:1252`, `projects/widget-food-order/DiscountService.js:399` |
| `mSessionToCoursePrice` | RestaurantOrder | — | — | — |
| `mSessionToCourses` | RestaurantOrder | — | — | — |
| `mSessionToIdToCourse` | RestaurantOrder | — | — | — |
| `mSessionToOrderIds` | RestaurantOrder | — | — | — |
| `mSessionToPayment` | RestaurantOrder | — | — | — |
| `mSessionToPaymentInformation` | RestaurantOrder | — | — | — |
| `mSessionToTableMerge` | RestaurantOrder | — | — | — |
| `mStaffToDateToIncidents` | AttendanceSystem | — | — | — |
| `mTableToSessionIds` | RestaurantOrder | — | — | — |
| `mTimeToGroupFeature` | RestaurantOrder | — | — | — |
| `mTopUp` | RestaurantLoyaltySystem | — | — | — |
| `mUserToAgent` | StaffAgentStore | — | — | — |
| `mUserToBranchId` | StaffAgentStore | — | — | — |
| `mVariant` | Management | — | — | — |
| `mVariantAttributes` | Management | — | — | — |
| `machineSession` | NetCafeSessionV3 | — | — | — |
| `mainBranchId` | BranchManagement | — | — | — |
| `mainMerchantId` | BranchManagement | — | — | — |
| `makeOrder` | RestaurantOrder | 4: `apps/wedget-order/src/hooks/use-make-order.ts:34`, `apps/wedget-order/src/hooks/use-make-order.ts:40`, `apps/cyber/src/components/cart/hooks/use-make-order.ts:38`, `apps/cyber/src/components/cart/hooks/use-make-order.ts:51` | — | 4: `projects/widget-food-order/FoodIqrAbis.js:667`, `projects/widget-food-order/FoodIqrAbis.js:739`, `projects/widget-food-order/OrderService.js:188`, `projects/widget-food-order/OrderService.js:199` |
| `makeReview` | RestaurantOrder | — | — | — |
| `managementBeacon` | NetCafeV3Factory | — | — | — |
| `managementContract` | AttendanceSystem, NetCafeSessionV3, NetCafeStationV3 | — | — | — |
| `managerSnapshots` | HistoryTracking | — | — | — |
| `manualGrantEnabled` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:533` | — | — |
| `manualPointOpsEnabled` | RestaurantLoyaltySystem | — | — | — |
| `manualRequests` | RestaurantLoyaltySystem | 3: `apps/cyber/src/hooks/query-keys.ts:86`, `apps/cyber/src/pages/owner/loyalty/required-point/hooks/use-get-manual-requests.ts:66`, `apps/cyber/src/pages/owner/loyalty/required-point/hooks/use-execute-manual-requests.ts:18` | — | — |
| `markNotificationAsRead` | BranchManagement | — | — | — |
| `maxPercentPerInvoice` | RestaurantLoyaltySystem | — | — | — |
| `memberActiveSessionWallet` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/customer/loyalty-member-search.ts:94`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:222` | — | — |
| `memberGroupIndexPlusOne` | RestaurantLoyaltySystem | — | — | — |
| `memberGroups` | RestaurantLoyaltySystem | 4: `apps/cyber/src/hooks/query-keys.ts:75`, `apps/cyber/src/pages/owner/loyalty/tag/dialog-assign-tag.tsx:37`, `apps/cyber/src/pages/owner/loyalty/tag/hooks/use-get-member-groups.ts:7`, `apps/cyber/src/components/cart/utils/refresh-after-order.ts:15` | — | — |
| `memberIdToAddress` | RestaurantLoyaltySystem | — | — | — |
| `memberPaymentHistory` | RestaurantLoyaltySystem | — | — | — |
| `memberRewardVoucherDetails` | RestaurantLoyaltySystem | — | — | — |
| `memberRewardVouchers` | RestaurantLoyaltySystem | — | — | — |
| `memberToGroups` | RestaurantLoyaltySystem | — | — | — |
| `memberTransactions` | RestaurantLoyaltySystem | — | — | — |
| `memberTxIds` | RestaurantLoyaltySystem | — | — | — |
| `memberVoucherInstanceIds` | RestaurantLoyaltySystem | — | — | — |
| `memberVoucherInstances` | RestaurantLoyaltySystem | — | — | — |
| `members` | RestaurantLoyaltySystem | 6: `apps/sidebar-cyber/src/hooks/use-get-user-member-rank.ts:16`, `apps/cyber/src/hooks/use-get-user-member-rank.ts:17`, `apps/cyber/src/pages/user/my-voucher/hooks/use-get-loyalty-member.ts:16`, `apps/cyber/src/pages/owner/loyalty/customer/loyalty-member-search.ts:29` … | — | — |
| `merchant` | RestaurantOrder | 6: `apps/cyber/src/pages/owner/loyalty/loyalty-manual-requests/pages/ManualRequestsApprovalPage.tsx:47`, `apps/cyber/src/pages/owner/loyalty/loyalty-manual-requests/pages/ManualRequestsApprovalPage.tsx:65`, `apps/cyber/src/pages/owner/loyalty/loyalty-manual-requests/pages/ManualRequestsApprovalPage.tsx:128`, `apps/cyber/src/pages/owner/loyalty/loyalty-tracking/components/ItemTransaction.tsx:101` … | — | — |
| `merchantName` | BranchManagement | 1: `apps/ops-agent/src/components/agent/MerchantForm.tsx:204` | — | — |
| `mergeMoreTables` | BranchResourceRegistry | — | — | — |
| `mergeTables` | BranchResourceRegistry | — | — | — |
| `moduleMaxPercent` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:173` | — | — |
| `moduleProvisioners` | BranchModuleRegistry, EconomyVault, NetCafeV3Factory | — | — | — |
| `moduleRegistry` | AgentModuleProvisioner, BranchDashboard, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `monthlyActiveStaff` | BranchAccessManager | — | — | — |
| `monthlyActiveUsersCount` | NetCafeSessionV3 | — | — | — |
| `monthlyAgeGroups` | RestaurantReporting | — | — | — |
| `monthlyAgents` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5876` |
| `monthlyCoupleCustomers` | RestaurantReporting | — | — | — |
| `monthlyCustomers` | RestaurantReporting | — | — | — |
| `monthlyDineInOrders` | RestaurantReporting | — | — | — |
| `monthlyDineInRevenue` | RestaurantReporting | — | — | — |
| `monthlyFemaleCustomers` | RestaurantReporting | — | — | — |
| `monthlyFoodRatings` | RestaurantReporting | — | — | — |
| `monthlyGroupCustomers` | RestaurantReporting | — | — | — |
| `monthlyManualRevenue` | NetCafeSpendV3 | — | — | — |
| `monthlyNewCustomers` | RestaurantReporting | — | — | — |
| `monthlyOrders` | RestaurantReporting | — | — | — |
| `monthlyRegisteredUsers` | NetCafeUserV3 | — | — | — |
| `monthlyReports` | AttendanceSystem | — | — | — |
| `monthlyRetainedUsersCount` | NetCafeSessionV3 | — | — | — |
| `monthlyReturningCustomersFromTwoTimes` | RestaurantReporting | — | — | — |
| `monthlyReturningCustomersOneTime` | RestaurantReporting | — | — | — |
| `monthlyReturningUsersCount` | NetCafeSessionV3 | — | — | — |
| `monthlyRevenue` | RestaurantReporting, RevenueManager | — | — | — |
| `monthlyServiceRatings` | RestaurantReporting | — | — | — |
| `monthlySessionCount` | NetCafeSessionV3 | — | — | — |
| `monthlySingleCustomers` | RestaurantReporting | — | — | — |
| `monthlyTakeAwayOrders` | RestaurantReporting | — | — | — |
| `monthlyTakeAwayRevenue` | RestaurantReporting | — | — | — |
| `monthlyTripleCustomers` | RestaurantReporting | — | — | — |
| `monthlyUsageRevenue` | NetCafeSessionV3 | — | — | — |
| `monthlyUsageSeconds` | NetCafeSessionV3 | — | — | — |
| `mtdToken` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5889` |
| `netCafeFactory` | AgentModuleProvisioner, BMFactory, BranchDashboard, EnhancedAgentManagement, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | 1: `projects/widget-test/src/abi.js:5902` |
| `netCafeFactorySc` | BranchManagement | — | — | — |
| `netCafeLicenses` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:5926` |
| `netSpendBranchIds` | RestaurantLoyaltySystem | — | — | — |
| `newDocument` | PublicfullDB | — | — | — |
| `nextMemberVoucherInstanceId` | RestaurantLoyaltySystem | — | — | — |
| `nextWorkPlaceId` | AttendanceSystem | — | — | — |
| `noti` | IQRFactory, RestaurantOrder | — | — | — |
| `notiAppId` | EnhancedAgentManagement | 2: `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:171`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:175` | — | — |
| `notiService` | EnhancedAgentManagement | 2: `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:167`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:175` | — | — |
| `notificationCounter` | BranchManagement | — | — | — |
| `notifications` | BranchManagement | 1: `apps/cyber/src/hooks/query-keys.ts:54` | — | — |
| `numberOfVisit` | RestaurantOrder | — | — | — |
| `openSession` | NetCafeSessionV3 | 1: `packages/cyber-contracts/src/net-cafe-session/net-cafe-session.contract.ts:66` | — | — |
| `openSessionForOtp` | NetCafeSessionV3 | 1: `packages/cyber-contracts/src/net-cafe-session/net-cafe-session.contract.ts:106` | — | — |
| `optionDishIndexPlusOne` | Management | — | — | — |
| `orderAcknowledged` | RestaurantOrder | — | — | — |
| `orderBranchIds` | RestaurantLoyaltySystem | — | — | — |
| `orderCourseIndexPlusOne` | RestaurantOrder | — | — | — |
| `orderCourseIndexesReady` | RestaurantOrder | — | — | — |
| `orderCreatedTimes` | RestaurantReporting | — | — | — |
| `orderCreatedTimesSet` | RestaurantReporting | — | — | — |
| `orderDiscountCountedUser` | Management | — | — | — |
| `orderDiscountUserCounted` | Management | — | — | — |
| `orderDiscountUses` | Management | — | — | — |
| `orderHistories` | RestaurantOrder | — | — | — |
| `orderHistoryCounter` | RestaurantOrder | — | — | — |
| `orderIds` | AgentIQR | — | — | 2: `projects/widget-food-order/FoodIqrAbis.js:774`, `projects/widget-food-order/OrderService.js:144` |
| `orderIdsByStatus` | RestaurantOrder | — | — | — |
| `orderIndexPlusOne` | RestaurantOrder | — | — | — |
| `orderPrimaryStaff` | RestaurantOrder | — | — | — |
| `orderStaffHistory` | RestaurantOrder | — | — | — |
| `orderStaffShare` | RestaurantOrder | — | — | — |
| `orderStatusCount` | RestaurantOrder | — | — | — |
| `orderStatusIndexPlusOne` | RestaurantOrder | — | — | — |
| `orders` | AgentIQR | 2: `apps/wedget-order/src/hooks/query-keys.ts:14`, `apps/cyber/src/hooks/query-keys.ts:162` | — | — |
| `otpOwner` | NetCafeUserV3 | 3: `apps/launcher-lockscreen/src/hooks/use-unlock-with-otp.ts:11`, `apps/launcher-lockscreen/src/hooks/use-login-with-otp.ts:22`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:120` | — | — |
| `owner` | AgentIQR, AgentModuleProvisioner, AttendanceSystem, BMFactory, BranchAccessManager, BranchDashboard, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, IQRFactory, LoyaltyFactory, Management, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, NetCafeV3Factory, PublicfullDB, RestaurantLoyaltySystem, RestaurantOrder, RestaurantReporting, RevenueManager, StaffAgentStore | 114: `deployCloudRental.js:191`, `apps/cyber/src/components/branch-multi-select.tsx:30`, `apps/cyber/src/components/avatar-upload.tsx:12`, `apps/cyber/src/routes/_authenticated/owner/_authenticated/banner.tsx:15` … | — | 45: `shared/file-transfer/src/file.abi.js:212`, `shared/file-transfer/src/file.abi.js:526`, `shared/file-transfer/src/file.abi.js:652`, `shared/file-transfer/src/file.abi.js:906` … |
| `pause` | EnhancedAgentManagement, RestaurantLoyaltySystem, RestaurantReporting | 1: `apps/sidebar-cyber/src/hooks/use-remaining-play-time.ts:28` | — | 1: `projects/widget-test/src/abi.js:5967` |
| `pauseCampaign` | RestaurantLoyaltySystem | 3: `apps/cyber/src/routes/_authenticated/owner/_authenticated/loyalty/history.tsx:48`, `apps/cyber/src/pages/owner/loyalty/campaign/hooks/use-toggle-campaign.ts:19`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:433` | — | — |
| `paused` | EnhancedAgentManagement, RestaurantLoyaltySystem, RestaurantOrder | — | — | 1: `projects/widget-test/src/abi.js:5974` |
| `paymentConfig` | NetCafeTopUpV3 | 8: `apps/cyber/src/pages/owner/loyalty/point/loyalty-policy.tsx:72`, `apps/cyber/src/pages/owner/loyalty/point/loyalty-policy.tsx:121`, `apps/cyber/src/pages/owner/loyalty/point/loyalty-policy.tsx:122`, `apps/cyber/src/pages/owner/loyalty/point/components/payment-config-section.tsx:12` … | — | — |
| `paymentConfirm` | NetCafeTopUpV3 | — | — | — |
| `paymentCourseIndexPlusOne` | RestaurantOrder | — | — | — |
| `paymentCourseIndexesReady` | RestaurantOrder | — | — | — |
| `paymentCourses` | RestaurantOrder | — | — | — |
| `paymentDiscountPromotionId` | RestaurantOrder | 1: `apps/cyber/src/pages/staff/order-manager/utils/map-order.ts:157` | — | — |
| `paymentDiscountReleased` | RestaurantOrder | — | — | — |
| `paymentHistories` | RestaurantOrder | — | — | — |
| `paymentHistory` | RestaurantOrder | — | — | — |
| `paymentInfo` | BranchManagement | — | — | — |
| `paymentInfoHistory` | RestaurantOrder | — | — | — |
| `paymentInfoSnapshots` | HistoryTracking | — | — | — |
| `paymentOrder` | BranchManagement | — | — | — |
| `paymentPointsRefunded` | RestaurantOrder | — | — | — |
| `paymentPointsUsed` | RestaurantOrder | — | — | — |
| `paymentPromoCustomer` | RestaurantOrder | — | — | — |
| `paymentRegistry` | NetCafeTopUpV3 | — | — | — |
| `paymentRewardVoucherCode` | RestaurantOrder | 1: `apps/cyber/src/pages/staff/order-manager/utils/map-order.ts:156` | — | — |
| `paymentRewardVoucherInstanceId` | RestaurantOrder | 1: `apps/cyber/src/pages/staff/order-manager/utils/map-order.ts:155` | — | — |
| `paymentWalletRefunded` | RestaurantOrder | — | — | — |
| `paymentWalletUsed` | RestaurantOrder | — | — | — |
| `pcHasActiveSession` | NetCafeSessionV3 | — | — | — |
| `pendingTopUps` | NetCafeTopUpV3 | — | — | — |
| `pendingTransferIndexPlusOne` | RestaurantOrder | — | — | — |
| `pendingTransferIndexesReady` | RestaurantOrder | — | — | — |
| `pendingTransfers` | RestaurantOrder | — | — | — |
| `permissionCacheValid` | EnhancedAgentManagement | — | — | — |
| `pointHistoryDbName` | PublicfullDB | — | — | — |
| `positionSnapshots` | HistoryTracking | — | — | — |
| `positions` | BranchAccessManager | 1: `apps/cyber/src/hooks/query-keys.ts:44` | — | — |
| `previewBonusSpend` | RestaurantLoyaltySystem | — | — | — |
| `previewPointPayment` | RestaurantOrder | — | — | — |
| `previousPeriodData` | RestaurantReporting | — | — | — |
| `pricePolicies` | NetCafeManagementV3 | 7: `apps/sidebar-cyber/src/services/station.service.ts:19`, `apps/cyber/src/hooks/query-keys.ts:28`, `apps/cyber/src/services/app-container.ts:80`, `apps/cyber/src/pages/manager/stations/hooks/use-get-price-policy.ts:13` … | 2: `CyberSidebarAbis.hpp:36`, `CyberSidebarStationModel.cpp:655` | 2: `projects/widget-session-uptime/SessionAbis.qml:43`, `projects/widget-session-uptime/SessionStats.js:176` |
| `pricePolicyIds` | NetCafeManagementV3 | — | — | — |
| `principals` | BranchAccessManager | — | — | — |
| `processedEarnLocks` | RestaurantLoyaltySystem | — | — | — |
| `processedInvoices` | RestaurantLoyaltySystem | — | — | — |
| `processedRefs` | EconomyVault | — | — | — |
| `proposalCounter` | BranchManagement | — | — | — |
| `proposalHasVoted` | BranchManagement | — | — | — |
| `proposalIds` | BranchManagement | — | — | — |
| `proposalVoteChoice` | BranchManagement | — | — | — |
| `proposals` | BranchManagement | — | — | — |
| `provisionNetForBranches` | AgentModuleProvisioner | — | — | — |
| `provisioners` | AgentModuleProvisioner | — | — | — |
| `proxiableUUID` | AgentIQR, AgentModuleProvisioner, BMFactory, BranchAccessManager, BranchDashboard, BranchManagement, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, HistoryTracking, IQRFactory, LoyaltyFactory, NetCafeV3Factory, PublicfullDB, RevenueManager, StaffAgentStore | — | — | 2: `shared/file-transfer/src/file.abi.js:1075`, `projects/widget-test/src/abi.js:5987` |
| `publicfullDB` | EnhancedAgentManagement, LoyaltyFactory | — | — | 1: `projects/widget-test/src/abi.js:6000` |
| `querySearch` | PublicfullDB | — | — | — |
| `reactivate` | AgentIQR | — | — | — |
| `rebuildActiveCampaignIndex` | RestaurantLoyaltySystem | — | — | — |
| `rebuildCategoryDishIndexes` | Management | — | — | — |
| `rebuildCategoryIndexes` | Management | — | — | — |
| `rebuildCumulativeFromPreviousDay` | NetCafeUserV3 | — | — | — |
| `rebuildCumulativeRange` | NetCafeUserV3 | — | — | — |
| `rebuildDailyActiveStaffByBranch` | BranchAccessManager | — | — | — |
| `rebuildDailyReport` | AttendanceSystem | — | — | — |
| `rebuildDiscountIndexes` | Management | — | — | — |
| `rebuildDishOptionIndexes` | Management | — | — | — |
| `rebuildGlobalOptionIndexes` | Management | — | — | — |
| `rebuildGroupCatalogIndexes` | RestaurantLoyaltySystem | — | — | — |
| `rebuildGroupMemberIndexes` | RestaurantLoyaltySystem | — | — | — |
| `rebuildMemberCatalogIndexes` | RestaurantLoyaltySystem | — | — | — |
| `rebuildMemberMembershipIndexes` | RestaurantLoyaltySystem | — | — | — |
| `rebuildOptionDishIndexes` | Management | — | — | — |
| `rebuildOrderCourseIndexes` | RestaurantOrder | — | — | — |
| `rebuildOrderIndexes` | RestaurantOrder | — | — | — |
| `rebuildOrderStatusIndexes` | RestaurantOrder | — | — | — |
| `rebuildPaymentCourseIndexes` | RestaurantOrder | — | — | — |
| `rebuildPaymentHistory` | RestaurantOrder | — | — | — |
| `rebuildPendingTransferIndexes` | RestaurantOrder | — | — | — |
| `rebuildPermissionCache` | EnhancedAgentManagement | — | — | — |
| `rebuildResourceRegistryIndexes` | BranchResourceRegistry | — | — | — |
| `rebuildRewardBatchHeap` | RestaurantLoyaltySystem | — | — | — |
| `rebuildRewardBatchHeaps` | RestaurantLoyaltySystem | — | — | — |
| `rebuildRewardBatchIndexes` | RestaurantLoyaltySystem | — | — | — |
| `rebuildSessionOrderIndexes` | RestaurantOrder | — | — | — |
| `rebuildSessionPaymentIndexes` | RestaurantOrder | — | — | — |
| `rebuildStaffActiveOrderIndexes` | RestaurantOrder | — | — | — |
| `rebuildStaffIndexes` | BranchAccessManager | — | — | — |
| `rebuildStaffWalletsByAgentBranchIndex` | BranchAccessManager | — | — | — |
| `rebuildUserIndexes` | NetCafeUserV3 | — | — | — |
| `recalculateAllAnalytics` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6013` |
| `recordAreaCreate` | HistoryTracking | — | — | — |
| `recordAreaDelete` | HistoryTracking | — | — | — |
| `recordAreaUpdate` | HistoryTracking | — | — | — |
| `recordBannerCreate` | HistoryTracking | — | — | — |
| `recordBannerDelete` | HistoryTracking | — | — | — |
| `recordBannerUpdate` | HistoryTracking | — | — | — |
| `recordBranchGamePlay` | BranchDashboard | — | — | — |
| `recordBranchGamePlayWithDuration` | BranchDashboard | — | — | — |
| `recordCategoryCreate` | HistoryTracking | — | — | — |
| `recordCategoryDelete` | HistoryTracking | — | — | — |
| `recordCategoryUpdate` | HistoryTracking | — | — | — |
| `recordDiscountCreate` | HistoryTracking | — | — | — |
| `recordDiscountDelete` | HistoryTracking | — | — | — |
| `recordDiscountUpdate` | HistoryTracking | — | — | — |
| `recordDishCreate` | HistoryTracking | — | — | — |
| `recordDishDelete` | HistoryTracking | — | — | — |
| `recordDishOptionCreate` | HistoryTracking | — | — | — |
| `recordDishOptionDelete` | HistoryTracking | — | — | — |
| `recordDishOptionUpdate` | HistoryTracking | — | — | — |
| `recordDishUpdate` | HistoryTracking | — | — | — |
| `recordGamePlay` | NetCafeDashboardV3 | 2: `apps/cyber/src/pages/user/user-games/hooks/use-record-game-play.ts:8`, `packages/cyber-contracts/src/net-cafe-dashboard/net-cafe-dashboard.contract.ts:27` | 6: `CyberSidebarStationModel.hpp:68`, `CyberGamePlayRecorder.cpp:49`, `CyberGamePlayRecorder.cpp:52`, `CyberSidebarAbis.hpp:57` … | — |
| `recordGamePlayWithDuration` | NetCafeDashboardV3 | — | — | — |
| `recordManagerCreate` | HistoryTracking | — | — | — |
| `recordManagerDelete` | HistoryTracking | — | — | — |
| `recordManagerUpdate` | HistoryTracking | — | — | — |
| `recordPaymentInfoUpdate` | HistoryTracking | — | — | — |
| `recordPlayTimeSpend` | NetCafeSpendV3 | — | — | — |
| `recordPositionCreate` | HistoryTracking | — | — | — |
| `recordPositionDelete` | HistoryTracking | — | — | — |
| `recordPositionUpdate` | HistoryTracking | — | — | — |
| `recordRevenue` | RevenueManager | — | — | — |
| `recordSessionCharge` | NetCafeStationV3 | — | — | — |
| `recordStaffCreate` | HistoryTracking | — | — | — |
| `recordStaffDelete` | HistoryTracking | — | — | — |
| `recordStaffUpdate` | HistoryTracking | — | — | — |
| `recordTCCreate` | HistoryTracking | — | — | — |
| `recordTCDelete` | HistoryTracking | — | — | — |
| `recordTCUpdate` | HistoryTracking | — | — | — |
| `recordTableCreate` | HistoryTracking | — | — | — |
| `recordTableDelete` | HistoryTracking | — | — | — |
| `recordTableUpdate` | HistoryTracking | — | — | — |
| `recordTxMeta` | PublicfullDB | — | — | — |
| `recordUniformCreate` | HistoryTracking | — | — | — |
| `recordUniformDelete` | HistoryTracking | — | — | — |
| `recordUniformUpdate` | HistoryTracking | — | — | — |
| `recordWorkingShiftCreate` | HistoryTracking | — | — | — |
| `recordWorkingShiftDelete` | HistoryTracking | — | — | — |
| `recordWorkingShiftUpdate` | HistoryTracking | — | — | — |
| `recordedDays` | RestaurantLoyaltySystem | — | — | — |
| `redeemVoucherPoints` | RestaurantLoyaltySystem | — | — | — |
| `reduceLockedEarnInput` | RestaurantLoyaltySystem | — | — | — |
| `refCodeToId` | NetCafeTopUpV3 | — | — | — |
| `refundExcessPaymentPoints` | RestaurantLoyaltySystem | — | — | — |
| `registerMember` | RestaurantLoyaltySystem | — | — | — |
| `registerMemberFor` | RestaurantLoyaltySystem | — | — | — |
| `registerSCAdmin` | FreeGasStorage | — | — | — |
| `registerUser` | NetCafeUserV3 | 9: `apps/wedget-chat/src/services/chat-service/chat.service.ts:73`, `apps/hidden-cloudpc/src/runtime/hidden-cloudpc.runtime.ts:123`, `apps/hidden-cloudpc/src/services/contracts/chat-factory.service.ts:126`, `apps/hidden-cloudpc/src/services/contracts/chat-factory.service.ts:156` … | — | 4: `projects/widget-test/abis/chatFactoryAbi.js:1367`, `projects/widget-test/src/abi.js:1367`, `projects/widget-chat/abis/chatFactoryAbi.js:1367`, `projects/widget-chat/src/ChatService.qml:86` |
| `rejectManualRequest` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/required-point/hooks/use-execute-manual-requests.ts:52`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:696` | — | — |
| `rejectTopUp` | NetCafeTopUpV3 | 2: `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:114`, `packages/cyber-contracts/src/topup/topup.contract.ts:136` | — | — |
| `removeAgent` | RevenueManager | — | — | — |
| `removeAgentBranch` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6031` |
| `removeManager` | BranchManagement | 2: `apps/cyber/src/pages/owner/system/hooks/use-remove-manager.ts:16`, `packages/cyber-contracts/src/branch-management/branch-management.contract.ts:95` | — | — |
| `removeMemberFromGroup` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/tag/hooks/use-assign-tag.ts:35`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:278` | — | — |
| `removeResource` | BranchResourceRegistry | — | — | — |
| `removeStaff` | BranchAccessManager | 2: `apps/cyber/src/pages/manager/staffs/hooks/use-remove-staff.ts:17`, `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:243` | — | — |
| `removeSuperAdmin` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6044` |
| `removeTablesFromMerge` | BranchResourceRegistry | — | — | — |
| `removeTargetRevenue` | RestaurantReporting | — | — | — |
| `renounceOwnership` | AgentIQR, AgentModuleProvisioner, AttendanceSystem, BMFactory, BranchAccessManager, BranchDashboard, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, IQRFactory, LoyaltyFactory, Management, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, NetCafeV3Factory, PublicfullDB, RestaurantLoyaltySystem, RestaurantOrder, RestaurantReporting, RevenueManager, StaffAgentStore | — | — | 1: `projects/widget-test/src/abi.js:6051` |
| `renounceRole` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `report` | Management | 13: `apps/sidebar-cyber/src/providers/system-context.provider.tsx:98`, `apps/sidebar-cyber/src/components/report-error-dialog.tsx:67`, `apps/sidebar-cyber/src/components/default-catch-boundary.tsx:19`, `apps/sidebar-cyber/src/services/session-manager/session-manager.service.ts:46` … | — | — |
| `reportServiceIssue` | RestaurantOrder | — | — | — |
| `reportedDates` | AttendanceSystem | — | — | — |
| `reportedMonths` | AttendanceSystem | — | — | — |
| `requestTopUp` | NetCafeTopUpV3 | 2: `apps/cyber/src/pages/user/user-topup/hooks/use-request-topup.ts:31`, `packages/cyber-contracts/src/topup/topup.contract.ts:86` | — | — |
| `requestTransferOrder` | RestaurantOrder | — | — | — |
| `requireLogout` | NetCafeStationV3 | 2: `apps/cyber/src/pages/staff/staff-stations/hooks/use-require-logout.ts:15`, `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:64` | — | — |
| `requireStaffWithPermission` | BranchAccessManager | — | — | — |
| `rescueAdminAccess` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6064` |
| `reserveTable` | RestaurantOrder | — | — | — |
| `resetDishQuantities` | Management | — | — | — |
| `resetDishQuantitiesLegacy` | Management | — | — | — |
| `resetSingleDishQuantity` | Management | — | — | — |
| `resourceActive` | BranchResourceRegistry | — | — | — |
| `resourceCountByArea` | BranchResourceRegistry | — | — | — |
| `resourceExists` | BranchResourceRegistry | — | — | — |
| `resourceIndexPlusOne` | BranchResourceRegistry | — | — | — |
| `resourceRegistry` | NetCafeManagementV3 | — | — | — |
| `resourceSupportsNet` | BranchResourceRegistry | — | — | — |
| `resourceSupportsOrdering` | BranchResourceRegistry | — | — | — |
| `restaurantInfo` | Management | — | — | — |
| `restaurantOrder` | Management | — | — | — |
| `restoreRewardVoucher` | RestaurantLoyaltySystem | — | — | — |
| `resumeCampaign` | RestaurantLoyaltySystem | 3: `apps/cyber/src/routes/_authenticated/owner/_authenticated/loyalty/history.tsx:52`, `apps/cyber/src/pages/owner/loyalty/campaign/hooks/use-toggle-campaign.ts:21`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:440` | — | — |
| `resumeStuckEarnLock` | RestaurantLoyaltySystem | — | — | — |
| `resyncTransactionToFullDB` | RestaurantLoyaltySystem | — | — | — |
| `revenueManager` | AgentIQR, EnhancedAgentManagement, IQRFactory | — | — | 1: `projects/widget-test/src/abi.js:6071` |
| `revenueRecords` | RevenueManager | — | — | — |
| `revenueSC` | RestaurantOrder | — | — | — |
| `revenueTargets` | RestaurantReporting | — | — | — |
| `reviews` | RestaurantOrder | — | — | — |
| `revokeAgentDelegation` | EnhancedAgentManagement | 1: `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:147` | — | 1: `projects/widget-test/src/abi.js:6095` |
| `revokeDelegation` | BranchAccessManager | 1: `packages/cyber-contracts/src/branch-access-manager/branch-access-manager.contract.ts:301` | — | — |
| `revokeNetSession` | RestaurantLoyaltySystem | — | — | — |
| `revokeRole` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `revokeUserDelegation` | EnhancedAgentManagement | 1: `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:154` | — | 1: `projects/widget-test/src/abi.js:6108` |
| `revokeWriterRole` | HistoryTracking | — | — | — |
| `rewardBatchBranchTracked` | RestaurantLoyaltySystem | — | — | — |
| `rewardBatchHeapDefaultReady` | RestaurantLoyaltySystem | — | — | — |
| `rewardBatchHeapIndexPlusOne` | RestaurantLoyaltySystem | — | — | — |
| `rewardBatchHeapReady` | RestaurantLoyaltySystem | — | — | — |
| `rewardBatchHeapsReady` | RestaurantLoyaltySystem | — | — | — |
| `rewardBatchIndexPlusOne` | RestaurantLoyaltySystem | — | — | — |
| `rewardMaxAbsolute` | RestaurantLoyaltySystem | — | — | — |
| `rewardMaxPercent` | RestaurantLoyaltySystem | — | — | — |
| `rewardVoucherCatalogVersion` | RestaurantLoyaltySystem | — | — | — |
| `rewardVoucherCodeCatalogVersion` | RestaurantLoyaltySystem | — | — | — |
| `rewardVoucherCodes` | RestaurantLoyaltySystem | — | — | — |
| `rewardVoucherDeleted` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:631` | — | — |
| `rewardVoucherIdCatalogVersion` | RestaurantLoyaltySystem | — | — | — |
| `rewardVoucherIds` | RestaurantLoyaltySystem | — | — | — |
| `robotFactory` | BMFactory, EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6115` |
| `robotFactorySc` | BranchManagement | — | — | — |
| `searchAgentsAdvanced` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6171` |
| `searchAgentsByStoreName` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6190` |
| `searchIndex` | RestaurantLoyaltySystem | — | — | — |
| `sendNotification` | BranchManagement | — | — | — |
| `separateTables` | BranchResourceRegistry | — | — | — |
| `serviceStartTime` | Management, RestaurantReporting | — | — | — |
| `sessionBeacon` | NetCafeV3Factory | — | — | — |
| `sessionContract` | NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `sessionOrderIndexPlusOne` | RestaurantOrder | — | — | — |
| `sessionOrders` | RestaurantOrder | — | — | — |
| `sessionPaymentIndexPlusOne` | RestaurantOrder | — | — | — |
| `sessionPaymentIndexesReady` | RestaurantOrder | — | — | — |
| `sessionWalletToMember` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/customer/loyalty-member-search.ts:64`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:217` | — | — |
| `sessions` | NetCafeSessionV3 | — | 4: `CyberSessionGuard.cpp:121`, `CyberSidebarAbis.hpp:64`, `CyberSidebarAbis.hpp:69`, `CyberSessionGuard.hpp:18` | — |
| `set` | AgentIQR | — | — | — |
| `setAccessManager` | AgentModuleProvisioner, BranchPaymentRegistry, BranchResourceRegistry, Management | — | — | — |
| `setAccountActive` | BranchPaymentRegistry | 1: `packages/cyber-contracts/src/branch-payment-registry/branch-payment-registry.contract.ts:65` | — | — |
| `setActive` | Management | — | — | — |
| `setActivePricePolicy` | NetCafeManagementV3 | 3: `apps/cyber/src/pages/manager/stations/hooks/use-set-active-price-policy.ts:17`, `apps/cyber/src/pages/manager/stations/hooks/use-add-price-policy.ts:43`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:216` | — | — |
| `setAdmin` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6209` |
| `setAdminIqr` | IQRFactory | — | — | — |
| `setAgent` | StaffAgentStore | — | — | — |
| `setAgentAdd` | BranchAccessManager, Management | — | — | — |
| `setAgentAdmin` | BranchAccessManager, BranchModuleRegistry | — | — | — |
| `setAgentCoOwner` | BranchAccessManager, EnhancedAgentManagement | 1: `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:127` | — | 1: `projects/widget-test/src/abi.js:6252` |
| `setAgentForCoOwner` | StaffAgentStore | — | — | — |
| `setAgentIQR` | IQRFactory | — | — | — |
| `setAgentIqrBeacon` | IQRFactory | — | — | — |
| `setAgentIqrSC` | Management | — | — | — |
| `setAgentLoyalty` | PublicfullDB | — | — | — |
| `setAgentManager` | EnhancedAgentManagement | 2: `apps/cyber/src/pages/owner/system/hooks/use-create-manager.ts:17`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:108` | — | 1: `projects/widget-test/src/abi.js:6290` |
| `setAgentModuleProvisioner` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6303` |
| `setAgentModuleState` | BranchModuleRegistry | — | — | — |
| `setAgentTaxPercent` | EnhancedAgentManagement | 2: `apps/cyber/src/pages/owner/payment/hooks/use-set-tax-percent.ts:17`, `packages/cyber-contracts/src/enhanced-agent-management/enhanced-agent-management.contract.ts:77` | — | — |
| `setAllowedActionTypes` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:59`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:480` | — | — |
| `setAuthorizedModule` | EconomyVault | — | — | — |
| `setBE` | AttendanceSystem | — | — | — |
| `setBranchAccessManager` | AttendanceSystem, BranchManagement, EnhancedAgentManagement, IQRFactory, RestaurantLoyaltySystem, RestaurantOrder, RestaurantReporting | — | — | 1: `projects/widget-test/src/abi.js:6316` |
| `setBranchAccessManagerForAgent` | LoyaltyFactory | — | — | — |
| `setBranchAuditTrail` | AgentModuleProvisioner, BranchAccessManager, BranchPaymentRegistry, BranchResourceRegistry | — | — | — |
| `setBranchCoOwner` | BranchAccessManager | — | — | — |
| `setBranchManagement` | BranchAccessManager, Management, StaffAgentStore | — | — | — |
| `setBranchManager` | BranchAccessManager | — | — | — |
| `setBranchManagerSC` | BMFactory | — | — | — |
| `setBranchModule` | AgentModuleProvisioner | — | — | — |
| `setBranchModuleState` | BranchModuleRegistry | — | — | — |
| `setBranchModuleStates` | BranchModuleRegistry | — | — | — |
| `setBranchModuleStatesBatch` | BranchModuleRegistry | — | — | — |
| `setBranchModules` | AgentModuleProvisioner | — | — | — |
| `setBranchPaymentRegistry` | Management, RestaurantOrder | — | — | — |
| `setBranchResourceRegistry` | Management | — | — | — |
| `setBulkAttendanceData` | AttendanceSystem | — | — | — |
| `setCoOwner` | BranchAccessManager | — | — | — |
| `setCompanyAdmin` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6334` |
| `setCompanyHolidays` | AttendanceSystem | — | — | — |
| `setConfig` | RestaurantOrder | — | — | — |
| `setConfigRuleNoShow` | RestaurantOrder | — | — | — |
| `setCumulativeRegisteredUsers` | NetCafeUserV3 | — | — | — |
| `setCurrency` | BranchManagement | — | — | — |
| `setDA` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6352` |
| `setDashboardFacade` | NetCafeV3Factory | — | — | — |
| `setDashboardImplementation` | NetCafeV3Factory | — | — | — |
| `setDataDocument` | PublicfullDB | — | — | — |
| `setDishQuantity` | Management | 4: `apps/cyber/src/pages/manager/iqr/features/dishes/hooks/use-create-dish.ts:77`, `apps/cyber/src/pages/manager/iqr/features/dishes/hooks/use-update-dish.ts:73`, `apps/cyber/src/pages/manager/iqr/features/dishes/hooks/use-update-dish.ts:83`, `packages/cyber-contracts/src/management/management.contract.ts:191` | — | — |
| `setDishResetSchedule` | Management | 2: `apps/cyber/src/pages/manager/iqr/features/dishes/hooks/use-dish-reset-schedule.ts:32`, `packages/cyber-contracts/src/management/management.contract.ts:212` | — | — |
| `setEconomyVault` | EnhancedAgentManagement, LoyaltyFactory, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, RestaurantLoyaltySystem | — | — | 1: `projects/widget-test/src/abi.js:6365` |
| `setEnableOrderDismissBroadcast` | RestaurantOrder | — | — | — |
| `setEnhancedAgent` | BMFactory, IQRFactory, LoyaltyFactory, RevenueManager, StaffAgentStore | — | — | — |
| `setExpiryForPerpetualBatches` | RestaurantLoyaltySystem | — | — | — |
| `setFactoryContracts` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6408` |
| `setFeatureCustomers` | RestaurantOrder | — | — | — |
| `setFreeGasSc` | BranchManagement, LoyaltyFactory | — | — | — |
| `setHistoryTracking` | BranchAccessManager, BranchManagement, Management | — | — | — |
| `setIQRAgent` | RestaurantOrder | — | — | — |
| `setIQRSC` | IQRFactory | — | — | — |
| `setInvoiceRewardPercent` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:133`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:468` | — | — |
| `setIqrFactory` | StaffAgentStore | — | — | — |
| `setIqrFactorySC` | BranchManagement | — | — | — |
| `setLinkGG` | Management | — | — | — |
| `setLoyalty` | NetCafeSessionV3, NetCafeSpendV3, NetCafeTopUpV3, NetCafeUserV3 | — | — | — |
| `setLoyaltyContract` | PublicfullDB | — | — | — |
| `setMainOwner` | BranchManagement | — | — | — |
| `setMaintenance` | NetCafeStationV3 | 2: `apps/cyber/src/pages/staff/staff-stations/hooks/use-lock-station.ts:15`, `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:72` | — | — |
| `setManagement` | AttendanceSystem, RestaurantOrder, StaffAgentStore | — | — | — |
| `setManagementSC` | RestaurantLoyaltySystem | — | — | — |
| `setManangement` | RestaurantReporting | — | — | — |
| `setManualGrantEnabled` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:105`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:529` | — | — |
| `setMember` | BranchAccessManager | — | — | — |
| `setModuleActiveForBranches` | AgentModuleProvisioner | — | — | — |
| `setModuleContracts` | NetCafeSessionV3, NetCafeStationV3, NetCafeTopUpV3 | — | — | — |
| `setModuleProvisioner` | BranchModuleRegistry, EconomyVault, NetCafeV3Factory | — | — | — |
| `setModuleSpendPolicy` | RestaurantLoyaltySystem | 3: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:149`, `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:156`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:161` | — | — |
| `setModuleStateForBranches` | AgentModuleProvisioner | — | — | — |
| `setModulesActiveForBranches` | AgentModuleProvisioner | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:287` | — | — |
| `setNetSpendModule` | RestaurantLoyaltySystem | — | — | — |
| `setNetSpendModules` | LoyaltyFactory | — | — | — |
| `setNotiServiceConfig` | EnhancedAgentManagement | — | — | — |
| `setOrder` | RestaurantLoyaltySystem | — | — | — |
| `setPaymentAccount` | BranchManagement | — | — | — |
| `setPaymentConfig` | NetCafeTopUpV3 | 2: `apps/cyber/src/pages/owner/payment/hooks/use-set-payment-config.ts:18`, `packages/cyber-contracts/src/topup/topup.contract.ts:195` | — | — |
| `setPaymentMethodStatuses` | BranchManagement | — | — | — |
| `setPaymentOrder` | BranchManagement | — | — | — |
| `setPaymentRegistry` | NetCafeTopUpV3 | — | — | — |
| `setPermission` | BranchAccessManager | — | — | — |
| `setPermissionModuleStates` | AgentModuleProvisioner | — | — | — |
| `setPermissions` | BranchAccessManager | — | — | — |
| `setPointSC` | AgentIQR, RestaurantOrder | — | — | — |
| `setPoints` | Management | — | — | — |
| `setPointsIQRFactory` | IQRFactory | — | — | — |
| `setPointsImp` | LoyaltyFactory | — | — | — |
| `setPointsLoyaltyFactory` | LoyaltyFactory | — | — | — |
| `setProvisioner` | AgentModuleProvisioner | — | — | — |
| `setPublicfullDB` | EnhancedAgentManagement, LoyaltyFactory | — | — | 1: `projects/widget-test/src/abi.js:6421` |
| `setRemoteControl` | NetCafeStationV3 | 1: `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:92` | — | — |
| `setReport` | Management | — | — | — |
| `setResourceActive` | BranchResourceRegistry | — | — | — |
| `setResourceRegistry` | NetCafeManagementV3 | — | — | — |
| `setResourceSupportsNet` | BranchResourceRegistry | — | — | — |
| `setResourceSupportsOrdering` | BranchResourceRegistry | — | — | — |
| `setRestaurantOrder` | Management | — | — | — |
| `setRoleForCoOwner` | BranchAccessManager, NetCafeManagementV3 | — | — | — |
| `setSCUsdt` | RestaurantOrder | — | — | — |
| `setSearchIndex` | RestaurantLoyaltySystem | — | — | — |
| `setServiceStartTime` | Management | — | — | — |
| `setSessionContract` | NetCafeUserV3 | — | — | — |
| `setSharedBranchRegistries` | IQRFactory | — | — | — |
| `setSharedContracts` | AgentModuleProvisioner, BranchDashboard | — | — | — |
| `setSharedRegistries` | NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, NetCafeV3Factory | — | — | — |
| `setSpendPolicy` | RestaurantLoyaltySystem | 3: `apps/cyber/src/pages/owner/policy/hooks/use-loyalty-policy.ts:20`, `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:39`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:146` | — | — |
| `setStaff` | BranchAccessManager | — | — | — |
| `setStaffAgentStore` | BranchAccessManager, BranchManagement, Management | — | — | — |
| `setStatus` | NetCafeStationV3 | 4: `apps/launcher-lockscreen/src/utils/auth-storage.ts:16`, `.github/scripts/bls.js:1711`, `.github/scripts/bls.js:1714`, `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:60` | — | 2: `projects/widget-dev-login/LoginService.js:168`, `projects/widget-dev-login/LoginAbis.qml:65` |
| `setSystemOperator` | BranchAccessManager | — | — | — |
| `setTaxPercent` | AgentIQR, RestaurantOrder | — | — | — |
| `setTaxPercentIQRFactory` | IQRFactory | — | — | — |
| `setTier` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:662` | — | — |
| `setTierEnabled` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:119`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:658` | — | — |
| `setTierForBatch` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:670` | — | — |
| `setTimeKeeping` | BranchAccessManager, Management | — | — | — |
| `setTimeZone` | AttendanceSystem | — | — | — |
| `setTopUp` | RestaurantLoyaltySystem | — | — | — |
| `setTopupPolicy` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:15`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:457` | — | — |
| `settingAddress` | AttendanceSystem | — | — | — |
| `sharedRegistries` | NetCafeV3Factory | — | — | — |
| `shortCodeCounter` | NetCafeTopUpV3 | — | — | — |
| `snapshotDailyTotalUsers` | NetCafeUserV3 | — | — | — |
| `snapshotYearlyTotalUsers` | NetCafeUserV3 | — | — | — |
| `spendBeacon` | NetCafeV3Factory | — | — | — |
| `spendCounter` | NetCafeSpendV3 | — | — | — |
| `spendHistories` | NetCafeSpendV3 | — | — | — |
| `spendHistoryOfUser` | NetCafeSpendV3 | — | — | — |
| `spendPriority` | RestaurantLoyaltySystem | — | — | — |
| `spendVND` | NetCafeSpendV3 | — | — | — |
| `spendWalletForNet` | RestaurantLoyaltySystem | — | — | — |
| `spendWalletWithBonusForNet` | RestaurantLoyaltySystem | — | — | — |
| `staffActiveOrderIndexPlusOne` | RestaurantOrder | — | — | — |
| `staffActiveOrderIndexesReady` | RestaurantOrder | — | — | — |
| `staffActiveOrders` | RestaurantOrder | — | — | — |
| `staffAgentStore` | BranchAccessManager, Management | — | — | — |
| `staffCreateOrderForGuest` | RestaurantOrder | 1: `packages/iqr-contracts/src/order/order.contract.ts:203` | — | — |
| `staffCreatedDate` | BranchAccessManager | — | — | — |
| `staffDailyAttendance` | AttendanceSystem | — | — | — |
| `staffDailyRequests` | RestaurantLoyaltySystem | — | — | — |
| `staffExecuteOrderCash` | RestaurantOrder | — | — | — |
| `staffExecuteRefund` | RestaurantOrder | — | — | — |
| `staffIndexPlusOne` | BranchAccessManager | — | — | — |
| `staffLastActiveDate` | BranchAccessManager | — | — | — |
| `staffSnapshots` | HistoryTracking | — | — | — |
| `staffWalletIndexPlusOne` | BranchAccessManager | — | — | — |
| `staffWalletsByAgentBranch` | BranchAccessManager | — | — | — |
| `staffs` | BranchAccessManager | 4: `apps/cyber/src/routes/_authenticated/manager/_authenticated/staffs.tsx:23`, `apps/cyber/src/routes/_authenticated/manager/_authenticated/staffs.tsx:39`, `apps/cyber/src/routes/_authenticated/manager/_authenticated/staffs.tsx:44`, `apps/cyber/src/routes/_authenticated/manager/_authenticated/staffs.tsx:61` | — | — |
| `standardWorkingHours` | AttendanceSystem | — | — | — |
| `startNotInPosition` | AttendanceSystem | — | — | — |
| `stationBeacon` | NetCafeV3Factory | — | — | — |
| `stationContract` | NetCafeSessionV3 | — | — | — |
| `stationIds` | NetCafeManagementV3 | — | — | — |
| `stations` | NetCafeManagementV3, NetCafeStationV3 | 18: `apps/sidebar-cyber/src/services/station.service.ts:11`, `apps/wedget-chat/src/services/chat-service/chat.service.ts:66`, `apps/launcher-lockscreen/src/utils/get-locked-station-user.ts:13`, `apps/cyber/src/hooks/query-keys.ts:18` … | 6: `CyberSessionGuard.cpp:129`, `CyberSidebarStationModel.hpp:236`, `CyberSidebarAbis.hpp:24`, `CyberSessionGuard.hpp:19` … | 4: `projects/widget-session-uptime/SessionAbis.qml:6`, `projects/widget-session-uptime/SessionStats.js:150`, `projects/widget-chat/abis/stationAbi.js:12`, `projects/widget-chat/src/ChatService.qml:72` |
| `superAdmin` | EnhancedAgentManagement | — | — | 2: `projects/widget-test/src/abi.js:2190`, `projects/widget-test/src/abi.js:6428` |
| `superAdminToCompanyAdmin` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6447` |
| `supportsInterface` | BranchResourceRegistry, HistoryTracking, RestaurantLoyaltySystem | — | — | — |
| `syncDishRankingsToReport` | Management | — | — | — |
| `syncMember` | PublicfullDB | — | — | — |
| `syncTotalUserSnapshotsFromExistingRange` | NetCafeUserV3 | — | — | — |
| `syncTransaction` | PublicfullDB | — | — | — |
| `systemAdminBackfillCampaignLedger` | RestaurantLoyaltySystem | — | — | — |
| `systemAdminBackfillTxMeta` | RestaurantLoyaltySystem | — | — | — |
| `systemAdminResumeStuckEarnLock` | RestaurantLoyaltySystem | — | — | — |
| `systemAdminResyncTransactionToFullDB` | RestaurantLoyaltySystem | — | — | — |
| `systemAdminSetLockedPointMember` | RestaurantLoyaltySystem | — | — | — |
| `systemOperators` | BranchAccessManager | — | — | — |
| `systemRevenue` | RevenueManager | — | — | — |
| `taxPercent` | RestaurantOrder | 7: `apps/wedget-order/src/hooks/use-tax-percent.ts:8`, `apps/cyber/src/hooks/query-keys.ts:97`, `apps/cyber/src/pages/staff/order-manager/hooks/use-history-orders.ts:42`, `apps/cyber/src/pages/staff/order-manager/hooks/use-new-orders.ts:23` … | — | 4: `projects/widget-food-order/FoodIqrAbis.js:654`, `projects/widget-food-order/FoodIqrAbis.js:656`, `projects/widget-food-order/CheckoutData.js:15`, `projects/widget-food-order/CheckoutData.js:40` |
| `tcSnapshots` | HistoryTracking | — | — | — |
| `tcs` | Management | — | — | — |
| `tierConfigs` | RestaurantLoyaltySystem | — | — | — |
| `tierEnabled` | RestaurantLoyaltySystem | 6: `apps/cyber/src/pages/owner/loyalty/point/loyalty-policy.tsx:143`, `apps/cyber/src/pages/owner/loyalty/point/loyalty-policy.tsx:144`, `apps/cyber/src/pages/owner/loyalty/point/hooks/use-get-loyalty-policies.ts:59`, `apps/cyber/src/pages/owner/loyalty/point/hooks/use-loyalty-policy-form.ts:55` … | — | — |
| `tierIdByName` | RestaurantLoyaltySystem | — | — | — |
| `timeKeeping` | BranchAccessManager, Management | — | — | — |
| `tokenHolders` | RestaurantLoyaltySystem | — | — | — |
| `topUpBeacon` | NetCafeV3Factory | — | — | — |
| `topUpHistory` | NetCafeTopUpV3 | — | — | — |
| `topUpPcId` | NetCafeTopUpV3 | — | — | — |
| `topUpRequests` | NetCafeTopUpV3 | 1: `packages/cyber-contracts/src/topup/topup.contract.ts:170` | — | — |
| `topupMax` | RestaurantLoyaltySystem | — | — | — |
| `topupMin` | RestaurantLoyaltySystem | — | — | — |
| `topupRate` | RestaurantLoyaltySystem | — | — | — |
| `totalACredited` | RestaurantLoyaltySystem | — | — | — |
| `totalADebited` | RestaurantLoyaltySystem | — | — | — |
| `totalAttendanceRecords` | AttendanceSystem | — | — | — |
| `totalBDebited` | RestaurantLoyaltySystem | — | — | — |
| `totalBExpired` | RestaurantLoyaltySystem | — | — | — |
| `totalBGranted` | RestaurantLoyaltySystem | — | — | — |
| `totalCustomersAllTime` | RestaurantReporting | — | — | — |
| `totalCustomersDays` | Management | — | — | — |
| `totalOrderDays` | Management | — | — | — |
| `totalOrders` | AgentIQR | — | — | 4: `projects/widget-test/src/abi.js:2473`, `projects/widget-test/src/abi.js:3507`, `projects/widget-test/src/abi.js:4818`, `projects/widget-test/src/abi.js:5490` |
| `totalOrdersAllTime` | RestaurantReporting | — | — | — |
| `totalRevenue` | AgentIQR | — | — | 4: `projects/widget-test/src/abi.js:2478`, `projects/widget-test/src/abi.js:3512`, `projects/widget-test/src/abi.js:4813`, `projects/widget-test/src/abi.js:5485` |
| `totalRevenueAllTime` | RestaurantReporting | — | — | — |
| `totalRevenueDays` | Management | — | — | — |
| `totalSessionsByUser` | NetCafeSessionV3 | — | — | — |
| `totalUserSnapshotDaySeen` | NetCafeUserV3 | — | — | — |
| `transactionIdByRefId` | RestaurantLoyaltySystem | — | — | — |
| `transactionTypeBackfillCursor` | RestaurantLoyaltySystem | — | — | — |
| `transactionTypeIndexReady` | RestaurantLoyaltySystem | — | — | — |
| `transactionTypeIndexed` | RestaurantLoyaltySystem | — | — | — |
| `transactions` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:363` | — | — |
| `transferBeaconOwnership` | BMFactory, IQRFactory, LoyaltyFactory | — | — | — |
| `transferOwnerIQR` | AgentIQR | — | — | — |
| `transferOwnerIQRContracts` | IQRFactory | — | — | — |
| `transferOwnerPointSC` | LoyaltyFactory | — | — | — |
| `transferOwnership` | AgentIQR, AgentModuleProvisioner, AttendanceSystem, BMFactory, BranchAccessManager, BranchDashboard, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, IQRFactory, LoyaltyFactory, Management, NetCafeDashboardV3, NetCafeManagementV3, NetCafeSessionV3, NetCafeSpendV3, NetCafeStationV3, NetCafeTopUpV3, NetCafeUserV3, NetCafeV3Factory, PublicfullDB, RestaurantLoyaltySystem, RestaurantOrder, RestaurantReporting, RevenueManager, StaffAgentStore | — | — | 1: `projects/widget-test/src/abi.js:6466` |
| `transferTable` | BranchResourceRegistry | — | — | — |
| `txBranchId` | PublicfullDB | — | — | — |
| `txDocId` | PublicfullDB | — | — | — |
| `txIdByDocId` | PublicfullDB | — | — | — |
| `txModule` | PublicfullDB | — | — | — |
| `txsDbName` | PublicfullDB | — | — | — |
| `uniformSnapshots` | HistoryTracking | — | — | — |
| `uniforms` | Management | — | — | — |
| `unlockMember` | RestaurantLoyaltySystem | 1: `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:238` | — | — |
| `unlockPoints` | RestaurantLoyaltySystem | — | — | — |
| `unpause` | EnhancedAgentManagement, RestaurantLoyaltySystem, RestaurantReporting | — | — | 1: `projects/widget-test/src/abi.js:6473` |
| `updateAccountBalance` | NetCafeStationV3 | 4: `apps/cyber/src/hooks/use-topup.ts:38`, `apps/cyber/src/hooks/use-topup.ts:74`, `apps/cyber/src/modules/notifications/hooks/use-staff-notifications.tsx:93`, `packages/cyber-contracts/src/net-cafe-station/net-cafe-station.contract.ts:84` | — | — |
| `updateAccountBank` | BranchPaymentRegistry | 3: `apps/cyber/src/pages/owner/payment/hooks/use-update-account-bank.ts:35`, `packages/cyber-contracts/src/topup/topup.contract.ts:226`, `packages/cyber-contracts/src/branch-payment-registry/branch-payment-registry.contract.ts:57` | — | — |
| `updateAgent` | EnhancedAgentManagement | 2: `apps/ops-agent/src/hooks/useUpdateAgent.ts:32`, `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:247` | — | 1: `projects/widget-test/src/abi.js:6573` |
| `updateAgentAnalytics` | EnhancedAgentManagement | 1: `apps/ops-agent/src/contracts/contract-enhanced-agent/enhanced-agent-management.contract.ts:260` | — | 1: `projects/widget-test/src/abi.js:6607` |
| `updateArea` | BranchResourceRegistry | — | — | — |
| `updateAverageStarDish` | Management | — | — | — |
| `updateBranch` | BranchManagement | — | — | — |
| `updateCampaign` | RestaurantLoyaltySystem | 3: `apps/cyber/src/routes/_authenticated/owner/_authenticated/loyalty/history.tsx:44`, `apps/cyber/src/pages/owner/loyalty/campaign/hooks/use-update-campaign.ts:39`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:426` | — | — |
| `updateCourseStatus` | RestaurantOrder | — | — | — |
| `updateDishOption` | Management | — | — | — |
| `updateDishStartTime` | RestaurantReporting | — | — | — |
| `updateExchangeRate` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:77`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:495` | — | — |
| `updateFullDB` | PublicfullDB | — | — | — |
| `updateGroup` | NetCafeManagementV3 | 3: `apps/cyber/src/pages/manager/stations/hooks/use-update-group.ts:25`, `apps/cyber/src/pages/manager/stations/hooks/use-change-stations-group.ts:28`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:168` | — | — |
| `updateLastBuyActivityAt` | RestaurantLoyaltySystem | — | — | — |
| `updateLastResetTime` | Management | — | — | — |
| `updateManagementContract` | AttendanceSystem | — | — | — |
| `updateMember` | RestaurantLoyaltySystem | — | — | — |
| `updateMemberGroup` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/tag/hooks/use-upsert-tag.ts:15`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:323` | — | — |
| `updatePricePolicy` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/stations/hooks/use-update-price-policy.ts:37`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:212` | — | — |
| `updateReservation` | RestaurantOrder | — | — | — |
| `updateResource` | BranchResourceRegistry | — | — | — |
| `updateSettings` | AttendanceSystem | — | — | — |
| `updateStation` | NetCafeManagementV3 | 1: `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:114` | — | — |
| `updateTable` | BranchResourceRegistry | — | — | — |
| `updateTableFromOrder` | BranchResourceRegistry | — | — | — |
| `updateTargetRevenue` | RestaurantReporting | — | — | — |
| `updateTier` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/member-rank/hooks/use-update-tier.ts:27`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:104` | — | — |
| `updateVotingThreshold` | BranchManagement | — | — | — |
| `updateWifi` | NetCafeManagementV3 | 2: `apps/cyber/src/pages/manager/wifi/hooks/use-upsert-wifi.ts:56`, `packages/cyber-contracts/src/net-cafe-management/net-cafe-management.contract.ts:296` | — | — |
| `updateWorkPlace` | AttendanceSystem | — | — | — |
| `updatemaxPercentPerInvoice` | RestaurantLoyaltySystem | 2: `apps/cyber/src/pages/owner/loyalty/point/hooks/use-execute-loyalty-policies.ts:91`, `packages/cyber-contracts/src/loyalty-system/loyalty-system.contract.ts:502` | — | — |
| `upgradeBeacon` | BMFactory, LoyaltyFactory | — | — | — |
| `upgradeBeaconAgentIqr` | IQRFactory | — | — | — |
| `upgradeBeaconGlobal` | IQRFactory, NetCafeV3Factory | — | — | — |
| `upgradeOwnedBeacon` | NetCafeV3Factory | — | — | — |
| `upgradeToAndCall` | AgentIQR, AgentModuleProvisioner, BMFactory, BranchAccessManager, BranchDashboard, BranchManagement, BranchModuleRegistry, BranchPaymentRegistry, BranchResourceRegistry, EconomyVault, EnhancedAgentManagement, FreeGasStorage, HistoryTracking, IQRFactory, LoyaltyFactory, NetCafeV3Factory, PublicfullDB, RevenueManager, StaffAgentStore | — | — | 2: `shared/file-transfer/src/file.abi.js:1341`, `projects/widget-test/src/abi.js:6625` |
| `upsertTableData` | BranchResourceRegistry | 1: `packages/cyber-contracts/src/branch-resource-registry/branch-resource-registry.contract.ts:108` | — | — |
| `useBonusForPayment` | RestaurantLoyaltySystem | — | — | — |
| `usePointsForPayment` | RestaurantLoyaltySystem | — | — | — |
| `useWalletForPayment` | RestaurantLoyaltySystem | — | — | — |
| `usedTxIds` | RestaurantOrder | — | — | — |
| `userBeacon` | NetCafeV3Factory | — | — | — |
| `userContract` | NetCafeSessionV3, NetCafeStationV3, NetCafeTopUpV3 | — | — | 1: `shared/cyber-widget/MeosCyber/CyberAbis.qml:23` |
| `userIndexPlusOne` | NetCafeUserV3 | — | — | — |
| `userList` | NetCafeUserV3 | — | — | — |
| `userNotifications` | BranchManagement | — | — | — |
| `userRedeemedCount` | RestaurantLoyaltySystem | — | — | — |
| `userRedeemedCountById` | RestaurantLoyaltySystem | — | — | — |
| `userToPcId` | NetCafeStationV3 | — | — | — |
| `users` | NetCafeUserV3 | 6: `apps/cyber/src/hooks/use-get-user.ts:11`, `apps/cyber/src/hooks/query-keys.ts:105`, `apps/cyber/src/hooks/use-user-detail.ts:13`, `apps/cyber/src/pages/user/change-password/hooks/use-change-password.ts:25` … | — | 7: `shared/file-transfer/src/file.abi.js:368`, `projects/widget-test/abis/chatFactoryAbi.js:856`, `projects/widget-test/abis/chatFactoryAbi.js:1562`, `projects/widget-test/src/abi.js:856` … |
| `validateRewardVoucher` | RestaurantLoyaltySystem | — | — | — |
| `validateSession` | NetCafeSessionV3 | 2: `apps/launcher-lockscreen/src/hooks/use-finalize-login.ts:25`, `packages/cyber-contracts/src/net-cafe-session/net-cafe-session.contract.ts:47` | — | — |
| `vaultBranchIds` | RestaurantLoyaltySystem | — | — | — |
| `vaultBranchRegistered` | RestaurantLoyaltySystem | — | — | — |
| `verifyPassword` | NetCafeUserV3 | 3: `apps/launcher-lockscreen/src/hooks/use-unlock-with-password.ts:22`, `apps/launcher-lockscreen/src/hooks/use-login-with-password.ts:35`, `packages/cyber-contracts/src/net-cafe-user/net-cafe-user.contract.ts:135` | — | 3: `projects/widget-dev-login/LoginService.js:136`, `projects/widget-dev-login/LoginService.js:141`, `projects/widget-dev-login/LoginAbis.qml:9` |
| `version` | EnhancedAgentManagement, IQRFactory, RevenueManager | 2: `apps/wedget-order/src/services/file-cache.service.ts:21`, `apps/cyber/src/services/file-cache.service.ts:26` | — | 3: `shared/file-transfer/src/file.abi.js:231`, `projects/widget-test/src/abi.js:2039`, `projects/widget-test/src/abi.js:6632` |
| `voteProposal` | BranchManagement | 2: `apps/cyber/src/modules/notifications/hooks/use-vote-proposal.ts:21`, `packages/cyber-contracts/src/branch-management/branch-management.contract.ts:88` | — | — |
| `votingThreshold` | BranchManagement | — | — | — |
| `voucherUseHistory` | Management | — | — | — |
| `walletUsed` | NetCafeUserV3 | — | — | — |
| `weeklyActiveUsersCount` | NetCafeSessionV3 | — | — | — |
| `weeklyRetainedUsersCount` | NetCafeSessionV3 | — | — | — |
| `weeklyReturningUsersCount` | NetCafeSessionV3 | — | — | — |
| `wireLoyalty` | NetCafeV3Factory | — | — | — |
| `wireLoyaltyForBranch` | AgentModuleProvisioner | — | — | — |
| `workingShiftSnapshots` | HistoryTracking | — | — | — |
| `workingShifts` | BranchAccessManager | 1: `apps/cyber/src/hooks/query-keys.ts:45` | — | — |
| `workplaceById` | AttendanceSystem | — | — | — |
| `workplaceExists` | AttendanceSystem | — | — | — |
| `yearlyActiveUsersCount` | NetCafeSessionV3 | — | — | — |
| `yearlyAgents` | EnhancedAgentManagement | — | — | 1: `projects/widget-test/src/abi.js:6656` |
| `yearlyManualRevenue` | NetCafeSpendV3 | — | — | — |
| `yearlyOrders` | RestaurantReporting | — | — | — |
| `yearlyRegisteredUsers` | NetCafeUserV3 | — | — | — |
| `yearlyRetainedUsersCount` | NetCafeSessionV3 | — | — | — |
| `yearlyReturningUsersCount` | NetCafeSessionV3 | — | — | — |
| `yearlyRevenue` | RevenueManager | — | — | — |
| `yearlyRevenues` | RestaurantReporting | — | — | — |
| `yearlySessionCount` | NetCafeSessionV3 | — | — | — |
| `yearlyTotalUsers` | NetCafeUserV3 | — | — | — |
| `yearlyUsageRevenue` | NetCafeSessionV3 | — | — | — |
| `yearlyUsageSeconds` | NetCafeSessionV3 | — | — | — |
