# RestaurantLoyaltySystem — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/loyalty/RestaurantLoyaltySystem.sol`. Layout đầy đủ: `../../layout/RestaurantLoyaltySystem.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `_status` | `uint256` | scalar | RestaurantLoyaltySystem |
| 1 | 0 | `members` | `mapping(address => struct Member)` | mapping | RestaurantLoyaltySystem |
| 2 | 0 | `memberIdToAddress` | `mapping(string => address)` | mapping | RestaurantLoyaltySystem |
| 3 | 0 | `memberTxIds` | `mapping(address => uint256[])` | mapping | RestaurantLoyaltySystem |
| 4 | 0 | `memberToGroups` | `mapping(address => bytes32[])` | mapping | RestaurantLoyaltySystem |
| 5 | 0 | `memberGroups` | `mapping(bytes32 => struct MemberGroup)` | mapping | RestaurantLoyaltySystem |
| 6 | 0 | `groupMembers` | `mapping(bytes32 => address[])` | mapping | RestaurantLoyaltySystem |
| 7 | 0 | `manualRequests` | `mapping(uint256 => struct ManualRequest)` | mapping | RestaurantLoyaltySystem |
| 8 | 0 | `processedInvoices` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 9 | 0 | `lastRequestDate` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 10 | 0 | `staffDailyRequests` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 11 | 0 | `isTokenHolder` | `mapping(address => bool)` | mapping | RestaurantLoyaltySystem |
| 12 | 0 | `allMembers` | `struct Member[]` | mảng | RestaurantLoyaltySystem |
| 13 | 0 | `allMemberGroups` | `struct MemberGroup[]` | mảng | RestaurantLoyaltySystem |
| 14 | 0 | `allGroupIds` | `bytes32[]` | mảng | RestaurantLoyaltySystem |
| 15 | 0 | `allTransactions` | `struct Transaction[]` | mảng | RestaurantLoyaltySystem |
| 16 | 0 | `tokenHolders` | `address[]` | mảng | RestaurantLoyaltySystem |
| 17 | 0 | `_txCounter` | `uint256` | scalar | RestaurantLoyaltySystem |
| 18 | 0 | `_requestCounter` | `uint256` | scalar | RestaurantLoyaltySystem |
| 19 | 0 | `_balanceA` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 20 | 0 | `_processedTopups` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 21 | 0 | `_ledgerA` | `struct LoyaltyStorage.LedgerEntryA[]` | mảng | RestaurantLoyaltySystem |
| 22 | 0 | `_ledgerAIdx` | `mapping(address => uint256[])` | mapping | RestaurantLoyaltySystem |
| 23 | 0 | `totalACredited` | `uint256` | scalar | RestaurantLoyaltySystem |
| 24 | 0 | `totalADebited` | `uint256` | scalar | RestaurantLoyaltySystem |
| 25 | 0 | `_rewardBatches` | `mapping(address => struct LoyaltyStorage.RewardBatch[])` | mapping | RestaurantLoyaltySystem |
| 26 | 0 | `_balanceB` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 27 | 0 | `_processedGrants` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 28 | 0 | `_ledgerB` | `struct LoyaltyStorage.LedgerEntryB[]` | mảng | RestaurantLoyaltySystem |
| 29 | 0 | `_ledgerBIdx` | `mapping(address => uint256[])` | mapping | RestaurantLoyaltySystem |
| 30 | 0 | `totalBGranted` | `uint256` | scalar | RestaurantLoyaltySystem |
| 31 | 0 | `totalBDebited` | `uint256` | scalar | RestaurantLoyaltySystem |
| 32 | 0 | `totalBExpired` | `uint256` | scalar | RestaurantLoyaltySystem |
| 33 | 0 | `_batchCounter` | `uint256` | scalar | RestaurantLoyaltySystem |
| 34 | 0 | `allowedActionTypeList` | `bytes32[]` | mảng | RestaurantLoyaltySystem |
| 35 | 0 | `allowedActionTypes` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 36 | 0 | `__layoutGapBeforeBranchAccessManagers` | `address` | scalar | RestaurantLoyaltySystem |
| 37 | 0 | `branchAccessManagers` | `mapping(uint256 => contract IBranchAccessManager)` | mapping | RestaurantLoyaltySystem |
| 38 | 0 | `topupRate` | `uint256` | scalar | RestaurantLoyaltySystem |
| 39 | 0 | `topupMin` | `uint256` | scalar | RestaurantLoyaltySystem |
| 40 | 0 | `topupMax` | `uint256` | scalar | RestaurantLoyaltySystem |
| 41 | 0 | `spendPriority` | `enum EconomyTypes.SpendPriority` | scalar | RestaurantLoyaltySystem |
| 42 | 0 | `rewardMaxPercent` | `uint256` | scalar | RestaurantLoyaltySystem |
| 43 | 0 | `rewardMaxAbsolute` | `uint256` | scalar | RestaurantLoyaltySystem |
| 44 | 0 | `defaultExpiryDays` | `uint256` | scalar | RestaurantLoyaltySystem |
| 45 | 0 | `tierEnabled` | `bool` | scalar | RestaurantLoyaltySystem |
| 46 | 0 | `customerTier` | `mapping(address => bytes32)` | mapping | RestaurantLoyaltySystem |
| 47 | 0 | `lifetimeTokenA` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 48 | 0 | `tierConfigs` | `mapping(bytes32 => struct EconomyTypes.TierConfig)` | mapping | RestaurantLoyaltySystem |
| 49 | 0 | `allTiers` | `struct EconomyTypes.TierConfig[]` | mảng | RestaurantLoyaltySystem |
| 50 | 0 | `tierIdByName` | `mapping(string => bytes32)` | mapping | RestaurantLoyaltySystem |
| 51 | 0 | `_campaignCounter` | `uint256` | scalar | RestaurantLoyaltySystem |
| 52 | 0 | `campaigns` | `mapping(uint256 => struct EconomyTypes.Campaign)` | mapping | RestaurantLoyaltySystem |
| 53 | 0 | `campaignIds` | `uint256[]` | mảng | RestaurantLoyaltySystem |
| 54 | 0 | `campaignExecutionLog` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 55 | 0 | `__layoutGapBeforeTopUp` | `address` | scalar | RestaurantLoyaltySystem |
| 56 | 0 | `TopUp` | `address` | scalar | RestaurantLoyaltySystem |
| 57 | 0 | `agent` | `address` | scalar | RestaurantLoyaltySystem |
| 58 | 0 | `mOrder` | `mapping(uint256 => address)` | mapping | RestaurantLoyaltySystem |
| 59 | 0 | `mTopUp` | `mapping(uint256 => address)` | mapping | RestaurantLoyaltySystem |
| 60 | 0 | `isOrder` | `mapping(address => bool)` | mapping | RestaurantLoyaltySystem |
| 61 | 0 | `isTopUp` | `mapping(address => bool)` | mapping | RestaurantLoyaltySystem |
| 62 | 0 | `orderBranchIds` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 63 | 0 | `vaultBranchRegistered` | `mapping(uint256 => bool)` | mapping | RestaurantLoyaltySystem |
| 64 | 0 | `vaultBranchIds` | `uint256[]` | mảng | RestaurantLoyaltySystem |
| 65 | 0 | `exchangeRate` | `uint256` | scalar | RestaurantLoyaltySystem |
| 66 | 0 | `enhancedAgentSC` | `address` | scalar | RestaurantLoyaltySystem |
| 67 | 0 | `maxPercentPerInvoice` | `uint256` | scalar | RestaurantLoyaltySystem |
| 68 | 0 | `transactionCounter` | `uint256` | scalar | RestaurantLoyaltySystem |
| 69 | 0 | `transactions` | `mapping(uint256 => struct Transaction)` | mapping | RestaurantLoyaltySystem |
| 70 | 0 | `memberTransactions` | `mapping(address => uint256[])` | mapping | RestaurantLoyaltySystem |
| 71 | 0 | `memberPaymentHistory` | `mapping(address => struct PaymentTransaction[])` | mapping | RestaurantLoyaltySystem |
| 72 | 0 | `manualGrantEnabled` | `bool` | scalar | RestaurantLoyaltySystem |
| 73 | 0 | `debitByRefId` | `mapping(bytes32 => struct DebitRecord)` | mapping | RestaurantLoyaltySystem |
| 74 | 0 | `debitRefExists` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 75 | 0 | `customerDebitRefs` | `mapping(address => bytes32[])` | mapping | RestaurantLoyaltySystem |
| 76 | 0 | `dailyStatsByBranch` | `mapping(uint256 => mapping(uint256 => struct DailyStats))` | mapping | RestaurantLoyaltySystem |
| 77 | 0 | `recordedDays` | `uint256[]` | mảng | RestaurantLoyaltySystem |
| 78 | 0 | `_dayRecorded` | `mapping(uint256 => bool)` | mapping | RestaurantLoyaltySystem |
| 79 | 0 | `_execLogCounter` | `uint256` | scalar | RestaurantLoyaltySystem |
| 80 | 0 | `campaignExecRecords` | `mapping(uint256 => struct CampaignExecRecord)` | mapping | RestaurantLoyaltySystem |
| 81 | 0 | `campaignExecIds` | `mapping(uint256 => uint256[])` | mapping | RestaurantLoyaltySystem |
| 82 | 0 | `customerExecIds` | `mapping(address => uint256[])` | mapping | RestaurantLoyaltySystem |
| 83 | 0 | `allExecIds` | `uint256[]` | mảng | RestaurantLoyaltySystem |
| 84 | 0 | `_changeCounter` | `uint256` | scalar | RestaurantLoyaltySystem |
| 85 | 0 | `changeHistory` | `struct ChangeRecord[]` | mảng | RestaurantLoyaltySystem |
| 86 | 0 | `changeIdsByType` | `mapping(uint8 => uint256[])` | mapping | RestaurantLoyaltySystem |
| 87 | 0 | `searchIndex` | `address` | scalar | RestaurantLoyaltySystem |
| 88 | 0 | `lockedBalanceOf` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 89 | 0 | `lockedPoints` | `mapping(bytes32 => struct LoyaltyStorage.LockedPoint)` | mapping | RestaurantLoyaltySystem |
| 90 | 0 | `mManagement` | `mapping(uint256 => address)` | mapping | RestaurantLoyaltySystem |
| 91 | 0 | `economyVault` | `contract IEconomyVault` | scalar | RestaurantLoyaltySystem |
| 92 | 0 | `transactionIdByRefId` | `mapping(bytes32 => uint256)` | mapping | RestaurantLoyaltySystem |
| 93 | 0 | `lockedEarns` | `mapping(bytes32 => struct LoyaltyStorage.LockedEarn)` | mapping | RestaurantLoyaltySystem |
| 94 | 0 | `processedEarnLocks` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 95 | 0 | `mRewardVouchers` | `mapping(string => struct RewardVoucher)` | mapping | RestaurantLoyaltySystem |
| 96 | 0 | `rewardVoucherCodes` | `string[]` | mảng | RestaurantLoyaltySystem |
| 97 | 0 | `userRedeemedCount` | `mapping(string => mapping(address => uint256))` | mapping | RestaurantLoyaltySystem |
| 98 | 0 | `memberRewardVouchers` | `mapping(address => string[])` | mapping | RestaurantLoyaltySystem |
| 99 | 0 | `memberRewardVoucherDetails` | `mapping(address => mapping(string => struct MemberRewardVoucher[]))` | mapping | RestaurantLoyaltySystem |
| 100 | 0 | `invoiceRewardPercent` | `uint256` | scalar | RestaurantLoyaltySystem |
| 101 | 0 | `isNetSpendModule` | `mapping(address => bool)` | mapping | RestaurantLoyaltySystem |
| 102 | 0 | `netSpendBranchIds` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 103 | 0 | `lockedEarnTierBPlanned` | `mapping(bytes32 => uint256)` | mapping | RestaurantLoyaltySystem |
| 104 | 0 | `mRewardVouchersById` | `mapping(bytes32 => struct RewardVoucher)` | mapping | RestaurantLoyaltySystem |
| 105 | 0 | `rewardVoucherIds` | `bytes32[]` | mảng | RestaurantLoyaltySystem |
| 106 | 0 | `userRedeemedCountById` | `mapping(bytes32 => mapping(address => uint256))` | mapping | RestaurantLoyaltySystem |
| 107 | 0 | `nextMemberVoucherInstanceId` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 108 | 0 | `memberVoucherInstances` | `mapping(address => mapping(uint256 => struct MemberRewardVoucherInstance))` | mapping | RestaurantLoyaltySystem |
| 109 | 0 | `memberVoucherInstanceIds` | `mapping(address => uint256[])` | mapping | RestaurantLoyaltySystem |
| 110 | 0 | `rewardVoucherDeleted` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 111 | 0 | `sessionWalletToMember` | `mapping(address => address)` | mapping | RestaurantLoyaltySystem |
| 112 | 0 | `memberActiveSessionWallet` | `mapping(address => address)` | mapping | RestaurantLoyaltySystem |
| 113 | 0 | `manualPointOpsEnabled` | `mapping(uint256 => bool)` | mapping | RestaurantLoyaltySystem |
| 114 | 0 | `branchExpiryDays` | `mapping(uint256 => uint256)` | mapping | RestaurantLoyaltySystem |
| 115 | 0 | `moduleMaxPercent` | `mapping(uint256 => mapping(bytes32 => uint256))` | mapping | RestaurantLoyaltySystem |
| 116 | 0 | `activeCampaignIdsByEvent` | `mapping(bytes32 => uint256[])` | mapping | RestaurantLoyaltySystem |
| 117 | 0 | `activeCampaignIndexPlusOne` | `mapping(uint256 => uint256)` | mapping | RestaurantLoyaltySystem |
| 118 | 0 | `activeCampaignIndexReady` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 119 | 0 | `_allActiveCampaignIds` | `uint256[]` | mảng | RestaurantLoyaltySystem |
| 120 | 0 | `_allActiveCampaignIndexPlusOne` | `mapping(uint256 => uint256)` | mapping | RestaurantLoyaltySystem |
| 121 | 0 | `allMemberIndexPlusOne` | `mapping(address => uint256)` | mapping | RestaurantLoyaltySystem |
| 122 | 0 | `allMemberGroupIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | RestaurantLoyaltySystem |
| 123 | 0 | `allGroupIdIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | RestaurantLoyaltySystem |
| 124 | 0 | `groupMemberIndexPlusOne` | `mapping(bytes32 => mapping(address => uint256))` | mapping | RestaurantLoyaltySystem |
| 125 | 0 | `memberGroupIndexPlusOne` | `mapping(address => mapping(bytes32 => uint256))` | mapping | RestaurantLoyaltySystem |
| 126 | 0 | `groupDeleting` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 127 | 0 | `transactionIdsByType` | `mapping(uint8 => uint256[])` | mapping | RestaurantLoyaltySystem |
| 128 | 0 | `transactionTypeIndexed` | `mapping(uint256 => bool)` | mapping | RestaurantLoyaltySystem |
| 129 | 0 | `transactionTypeBackfillCursor` | `uint256` | scalar | RestaurantLoyaltySystem |
| 130 | 0 | `transactionTypeIndexReady` | `bool` | scalar | RestaurantLoyaltySystem |
| 131 | 0 | `rewardVoucherCatalogVersion` | `uint256` | scalar | RestaurantLoyaltySystem |
| 132 | 0 | `rewardVoucherIdCatalogVersion` | `mapping(bytes32 => uint256)` | mapping | RestaurantLoyaltySystem |
| 133 | 0 | `rewardVoucherCodeCatalogVersion` | `mapping(bytes32 => uint256)` | mapping | RestaurantLoyaltySystem |
| 134 | 0 | `rewardBatchIndexPlusOne` | `mapping(address => mapping(uint256 => uint256))` | mapping | RestaurantLoyaltySystem |
| 135 | 0 | `activeRewardBatchHeap` | `mapping(address => mapping(uint256 => uint256[]))` | mapping | RestaurantLoyaltySystem |
| 136 | 0 | `rewardBatchHeapIndexPlusOne` | `mapping(address => mapping(uint256 => mapping(uint256 => uint256)))` | mapping | RestaurantLoyaltySystem |
| 137 | 0 | `rewardBatchHeapReady` | `mapping(address => mapping(uint256 => bool))` | mapping | RestaurantLoyaltySystem |
| 138 | 0 | `rewardBatchHeapDefaultReady` | `bool` | scalar | RestaurantLoyaltySystem |
| 139 | 0 | `rewardBatchBranchIds` | `mapping(address => uint256[])` | mapping | RestaurantLoyaltySystem |
| 140 | 0 | `rewardBatchBranchTracked` | `mapping(address => mapping(uint256 => bool))` | mapping | RestaurantLoyaltySystem |
| 141 | 0 | `rewardBatchHeapsReady` | `mapping(address => bool)` | mapping | RestaurantLoyaltySystem |
| 142 | 0 | `lockedPointMember` | `mapping(bytes32 => address)` | mapping | RestaurantLoyaltySystem |
| 143 | 0 | `rewardVoucherAppliedOwner` | `mapping(bytes32 => address)` | mapping | RestaurantLoyaltySystem |
| 144 | 0 | `rewardVoucherRestored` | `mapping(bytes32 => bool)` | mapping | RestaurantLoyaltySystem |
| 145 | 0 | `__gap` | `uint256[24]` | gap | RestaurantLoyaltySystem |
