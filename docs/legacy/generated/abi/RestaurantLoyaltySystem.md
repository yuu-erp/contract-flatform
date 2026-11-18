# RestaurantLoyaltySystem — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (314)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `ApplyRewardVoucher(address,uint256,uint256,uint256,string[])` | `4e58568f` | ghi (nonpayable) | `uint256,uint8` |
| `CreateRewardVoucher(bytes32,string,string,string,uint8,uint256,uint256,uint256,uint256,uint256,uint256,bool,uint256[],string[],uint256,uint256)` | `10edbbed` | ghi (nonpayable) | `` |
| `DEFAULT_ADMIN_ROLE()` | `a217fddf` | đọc (view) | `bytes32` |
| `EVENT_FOOD_PAID()` | `5ec4d72b` | đọc (view) | `bytes32` |
| `EVENT_NET_SETTLED()` | `9bad51f1` | đọc (view) | `bytes32` |
| `EVENT_TOPUP()` | `6ea7bf1d` | đọc (view) | `bytes32` |
| `FINANCE()` | `8486902d` | đọc (view) | `bytes32` |
| `FOOD_MODULE()` | `58c5ef32` | đọc (view) | `bytes32` |
| `GROUP_DELETE_BATCH_SIZE()` | `46077d0c` | đọc (view) | `uint256` |
| `GetAllTransactionsPagination(uint256,uint256)` | `cf9c08b2` | đọc (view) | `tuple[],uint256` |
| `GetAllTransactionsPaginationByType(uint256,uint256,uint8)` | `ea4ab0b9` | đọc (view) | `tuple[],uint256` |
| `MAX_BACKFILL_TXIDS()` | `465d17f2` | đọc (view) | `uint256` |
| `MAX_BATCHES_PER_DEBIT()` | `65f81fbc` | đọc (view) | `uint256` |
| `MAX_ELIGIBLE_CAMPAIGNS()` | `bc25d319` | đọc (view) | `uint256` |
| `MAX_LOCKED_BATCHES_PER_LOCK()` | `22e7a143` | đọc (view) | `uint256` |
| `MAX_STACKING_ELIGIBLE()` | `6fa24186` | đọc (view) | `uint256` |
| `NET_MODULE()` | `80e260a6` | đọc (view) | `bytes32` |
| `REASON_LOYALTY_CREDIT_A()` | `7c7a8ec8` | đọc (view) | `bytes32` |
| `REASON_LOYALTY_DEBIT_A()` | `9586059c` | đọc (view) | `bytes32` |
| `REASON_LOYALTY_DEBIT_B()` | `074dec13` | đọc (view) | `bytes32` |
| `REASON_LOYALTY_EXPIRE_B()` | `ffe0e6c5` | đọc (view) | `bytes32` |
| `REASON_LOYALTY_GRANT_B()` | `0f2b0c36` | đọc (view) | `bytes32` |
| `ROLE_ADMIN()` | `d391014b` | đọc (view) | `bytes32` |
| `RedeemRewardVoucher(bytes32,uint256)` | `a0f93266` | ghi (nonpayable) | `uint256` |
| `SetRewardVoucherActive(bytes32,bool,uint256)` | `69811871` | ghi (nonpayable) | `` |
| `SoftDeleteRewardVoucher(bytes32,uint256)` | `12c018d5` | ghi (nonpayable) | `` |
| `TOKEN_LOYALTY_A()` | `9dd8225b` | đọc (view) | `bytes32` |
| `TOKEN_LOYALTY_B()` | `093c4765` | đọc (view) | `bytes32` |
| `TOKEN_POINT()` | `94d578bf` | đọc (view) | `bytes32` |
| `TopUp()` | `c8866605` | đọc (view) | `address` |
| `UpdateRewardVoucherMeta(bytes32,string,string,string,uint256,uint256)` | `8ab26427` | ghi (nonpayable) | `` |
| `activeCampaignIndexPlusOne(uint256)` | `71f850d8` | đọc (view) | `uint256` |
| `activeCampaignIndexReady(bytes32)` | `79303bab` | đọc (view) | `bool` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `allExecIds(uint256)` | `5611640d` | đọc (view) | `uint256` |
| `allGroupIdIndexPlusOne(bytes32)` | `442f302d` | đọc (view) | `uint256` |
| `allGroupIds(uint256)` | `c36c4677` | đọc (view) | `bytes32` |
| `allMemberGroupIndexPlusOne(bytes32)` | `4279d10f` | đọc (view) | `uint256` |
| `allMemberGroups(uint256)` | `ae3ffa30` | đọc (view) | `bytes32,string,bool,uint256` |
| `allMemberIndexPlusOne(address)` | `9300cb1e` | đọc (view) | `uint256` |
| `allMembers(uint256)` | `fd0717bd` | đọc (view) | `string,address,uint256,uint256,uint256,bytes32,uint256,bool,bool,string,string,string,string,string,string` |
| `allTiers(uint256)` | `d60f8f3f` | đọc (view) | `bytes32,string,uint256,uint256,uint256,uint256,uint256,uint256,string` |
| `allTransactions(uint256)` | `d7ff0714` | đọc (view) | `uint256,address,uint8,int256,uint256,bytes32,address,uint256,string,uint256,uint8` |
| `allowedActionTypeList(uint256)` | `d21428b9` | đọc (view) | `bytes32` |
| `allowedActionTypes(bytes32)` | `4dc09476` | đọc (view) | `bool` |
| `approveManualRequest(uint256,uint256)` | `8d08a951` | ghi (nonpayable) | `` |
| `assignMemberToGroup(address,bytes32,uint256)` | `57ca973e` | ghi (nonpayable) | `` |
| `authorizeNetSession(address,address)` | `8c0a73a2` | ghi (nonpayable) | `` |
| `backfillTransactionTypeIndexes(uint256)` | `f66c14a5` | ghi (nonpayable) | `uint256,bool` |
| `balanceA(address)` | `1cad2cac` | đọc (view) | `uint256` |
| `balanceB(address)` | `20297e97` | đọc (view) | `uint256` |
| `balanceBBranch(address,uint256)` | `cbbb695a` | đọc (view) | `uint256` |
| `balanceOf(address)` | `70a08231` | đọc (view) | `uint256` |
| `batchAssignMemberToGroups(address,bytes32[],uint256)` | `28b85e04` | ghi (nonpayable) | `` |
| `branchAccessManagers(uint256)` | `029d340c` | đọc (view) | `address` |
| `branchExpiryDays(uint256)` | `87e86546` | đọc (view) | `uint256` |
| `campaignExecIds(uint256,uint256)` | `2d1a237d` | đọc (view) | `uint256` |
| `campaignExecRecords(uint256)` | `9d1dc3aa` | đọc (view) | `uint256,address,bytes32,uint256,uint256,uint256,uint256` |
| `campaignExecutionLog(bytes32)` | `390ce512` | đọc (view) | `bool` |
| `campaignIds(uint256)` | `b369359d` | đọc (view) | `uint256` |
| `campaigns(uint256)` | `141961bc` | đọc (view) | `uint256,string,bytes32,uint256,uint256,bool,uint256,uint256,uint256,bool,bool,uint256,bytes32,uint256,uint256` |
| `canPayWithPoints(address,uint256)` | `9e7571d9` | đọc (view) | `bool,uint256,uint256,uint256` |
| `canPayWithWallet(address,uint256)` | `f21f45a3` | đọc (view) | `bool,uint256` |
| `changeHistory(uint256)` | `ada1542a` | đọc (view) | `uint256,uint8,address,bytes,uint256` |
| `changeIdsByType(uint8,uint256)` | `ea748eb9` | đọc (view) | `uint256` |
| `clearRewardVoucherCatalog(uint256)` | `ab2e822f` | ghi (nonpayable) | `` |
| `confirmLockedEarnPoints(bytes32)` | `367d7c28` | ghi (nonpayable) | `` |
| `confirmLockedPoints(address,bytes32,uint256,uint256)` | `fe5aab11` | ghi (nonpayable) | `` |
| `consumeRewardVoucher(address,uint256)` | `9d7a9b2c` | ghi (nonpayable) | `uint8,uint256` |
| `continueDeleteMemberGroup(bytes32,uint256,uint256)` | `fc2c2715` | ghi (nonpayable) | `uint256` |
| `createCampaign(tuple,uint256)` | `` | ghi (nonpayable) | `uint256` |
| `createManualRequest(string,bytes32,uint8,string,uint256)` | `947b1a55` | ghi (nonpayable) | `uint256` |
| `createMemberGroup(string,uint256)` | `ebf2f71d` | ghi (nonpayable) | `bytes32` |
| `createTier(string,uint256,uint256,uint256,uint256,uint256,string,uint256)` | `a228cf4e` | ghi (nonpayable) | `` |
| `creditAssist(address,uint256,bytes32,bytes32,uint256,bytes32)` | `653ed220` | ghi (nonpayable) | `` |
| `creditTopup(address,uint256,bytes32,bytes32,uint256)` | `f27a11e8` | ghi (nonpayable) | `` |
| `customerExecIds(address,uint256)` | `7a2f44e7` | đọc (view) | `uint256` |
| `customerTier(address)` | `bccbbacd` | đọc (view) | `bytes32` |
| `dailyStatsByBranch(uint256,uint256)` | `0c90397d` | đọc (view) | `uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256` |
| `debit(address,uint256,bytes32,bytes32,uint256,bytes32)` | `236b9585` | ghi (nonpayable) | `uint256,uint256` |
| `debitAAssist(address,uint256,bytes32,bytes32,uint256,bytes32)` | `5f9605a5` | ghi (nonpayable) | `` |
| `debitBAssist(address,uint256,bytes32,bytes32,uint256,bytes32)` | `88c2a9d1` | ghi (nonpayable) | `` |
| `debitByRefId(bytes32)` | `a0877ec3` | đọc (view) | `address,bytes32,bytes32,uint256,uint256,uint256,uint256` |
| `debitRefExists(bytes32)` | `ce535286` | đọc (view) | `bool` |
| `defaultExpiryDays()` | `b0908c42` | đọc (view) | `uint256` |
| `deleteMember(address,uint256)` | `8d3b54e0` | ghi (nonpayable) | `` |
| `deleteMemberGroup(bytes32,uint256)` | `3f9ce0c8` | ghi (nonpayable) | `` |
| `deleteTier(bytes32,uint256)` | `2587e4ad` | ghi (nonpayable) | `` |
| `discardLockedEarnPoints(bytes32)` | `fc5a866a` | ghi (nonpayable) | `` |
| `earnTokenA(address,uint256,bytes32,bytes32,bytes32,uint256,bool)` | `35117f0b` | ghi (nonpayable) | `` |
| `economyVault()` | `00ae9de5` | đọc (view) | `address` |
| `enhancedAgentSC()` | `197be8cf` | đọc (view) | `address` |
| `exchangeRate()` | `3ba0b9a9` | đọc (view) | `uint256` |
| `expireBatches(address)` | `5a7360ba` | ghi (nonpayable) | `` |
| `expireBatches(address,uint256)` | `bb610099` | ghi (nonpayable) | `` |
| `extendCampaign(uint256,uint256,uint256)` | `0421200d` | ghi (nonpayable) | `` |
| `forceResetReentrancyGuard()` | `89592f72` | ghi (nonpayable) | `` |
| `getActiveCampaignIdsByEvent(bytes32)` | `1b03536e` | đọc (view) | `uint256[]` |
| `getActiveCampaigns()` | `c362b156` | đọc (view) | `tuple[]` |
| `getActiveRewardBatchHeapLength(address,uint256)` | `b4ca003b` | đọc (view) | `uint256` |
| `getActiveRewardBatches(address)` | `3e39f76d` | đọc (view) | `tuple[]` |
| `getAllCampaignExecLogs(uint256,uint256,uint256)` | `f0cb5f67` | đọc (view) | `tuple[],uint256` |
| `getAllCampaigns()` | `86cdf604` | đọc (view) | `tuple[]` |
| `getAllCampaignsPagination(uint256,uint256)` | `4cf0db47` | đọc (view) | `tuple[],uint256` |
| `getAllGroups()` | `21cd3cae` | đọc (view) | `tuple[]` |
| `getAllMemberGroupsPagination(uint256,uint256)` | `d11d616a` | đọc (view) | `tuple[],uint256` |
| `getAllMembersPagination(uint256,uint256,uint256)` | `794f766c` | đọc (view) | `tuple[],uint256` |
| `getAllRewardVouchers()` | `04ab3495` | đọc (view) | `bytes32[],tuple[],bool[]` |
| `getAllRewardVouchersPagination(uint256,uint256)` | `efac02c8` | đọc (view) | `bytes32[],tuple[],bool[],uint256` |
| `getAllTiers()` | `6471af83` | đọc (view) | `tuple[]` |
| `getAllTiersPagination(uint256,uint256)` | `2532741f` | đọc (view) | `tuple[],uint256` |
| `getAllowedCampaignEventTypes()` | `50442494` | đọc (pure) | `bytes32[],string[]` |
| `getBalances(address)` | `c84aae17` | đọc (view) | `uint256,uint256` |
| `getCampaignExecLogByCampaign(uint256,uint256,uint256)` | `2aab9cbb` | đọc (view) | `tuple[],uint256` |
| `getCampaignExecLogByCustomer(address,uint256,uint256,uint256)` | `1d247610` | đọc (view) | `tuple[],uint256` |
| `getChangeHistory(uint256,uint256,uint256)` | `b58bc1f5` | đọc (view) | `tuple[],uint256` |
| `getChangeHistoryByType(uint256,uint8,uint256,uint256)` | `5f0a86cd` | đọc (view) | `tuple[],uint256` |
| `getCustomerInfo(address)` | `b3205410` | đọc (view) | `uint256,uint256,bytes32,string,uint256,uint256,uint256,uint256,uint256,uint256` |
| `getDailyStats(uint256,uint256)` | `69546224` | đọc (view) | `tuple` |
| `getDailyStatsRange(uint256,uint256,uint256)` | `214393d3` | đọc (view) | `tuple[],uint256[]` |
| `getDebitByRefId(bytes32)` | `8c8fe50f` | đọc (view) | `tuple` |
| `getDebitRefsByCustomer(address,uint256)` | `817fb9c2` | đọc (view) | `bytes32[]` |
| `getDebitRefsByCustomerPaging(address,uint256,uint256,uint256)` | `5d7e37ab` | đọc (view) | `bytes32[],uint256` |
| `getEffectiveMaxPercent(uint256,bytes32)` | `c6ef78e9` | đọc (view) | `uint256` |
| `getInvoiceEarnStatus(bytes32,uint256)` | `82f850e7` | đọc (view) | `uint256,uint256,bool,bool,bool` |
| `getInvoiceRewardPercent()` | `ec4ac72a` | đọc (view) | `uint256` |
| `getManualGrantEnabled(uint256)` | `f10d5761` | đọc (view) | `bool` |
| `getManualRequestsPagination(uint256,uint256)` | `dca261cf` | đọc (view) | `tuple[],uint256` |
| `getMember(address,uint256)` | `b0904882` | đọc (view) | `tuple` |
| `getMemberByMemberId(string)` | `9e1b6238` | đọc (view) | `tuple` |
| `getMemberBySessionWallet(address)` | `2d1387fe` | đọc (view) | `address` |
| `getMemberGroups(address)` | `05d1a274` | đọc (view) | `bytes32[],tuple[]` |
| `getMemberPaymentHistory(address,uint256,uint256)` | `accec8c9` | đọc (view) | `tuple[],uint256` |
| `getMemberRewardVouchersPagination(address,uint256,uint256)` | `ee875554` | đọc (view) | `tuple[],uint256[],uint256` |
| `getMemberToGroups(address)` | `76c394a4` | đọc (view) | `bytes32[]` |
| `getMemberTransactionsPagination(address,uint256,uint256)` | `de587be4` | đọc (view) | `tuple[],uint256` |
| `getMonthlyStats(uint256,uint256,uint256)` | `03985e6b` | đọc (view) | `tuple` |
| `getMyBalances()` | `a98048df` | đọc (view) | `uint256,uint256` |
| `getMyMemberProfile()` | `561b1f2e` | đọc (view) | `tuple` |
| `getPaymentConfig()` | `1fad9100` | đọc (view) | `uint256,uint256` |
| `getRewardBatchBranchIds(address)` | `1161e68c` | đọc (view) | `uint256[]` |
| `getRoleAdmin(bytes32)` | `248a9ca3` | đọc (view) | `bytes32` |
| `getSpendPolicy()` | `d44f2067` | đọc (view) | `uint256,uint256,uint256` |
| `getSpendPolicyBranch(uint256)` | `bb04e834` | đọc (view) | `uint256,uint256,uint256` |
| `getTier(address)` | `b45aae52` | đọc (view) | `bytes32` |
| `getTopupPolicy()` | `abf744ac` | đọc (view) | `uint256,uint256,uint256` |
| `getTransactionCounter()` | `2dd1b86b` | đọc (view) | `uint256` |
| `getWeeklyStats(uint256,uint256)` | `def8372a` | đọc (view) | `tuple` |
| `grantRole(bytes32,address)` | `2f2ff15d` | ghi (nonpayable) | `` |
| `grantTokenBManual(address,uint256,bytes32,uint256,bytes32)` | `2b687efc` | ghi (nonpayable) | `` |
| `groupDeleting(bytes32)` | `8dcd0732` | đọc (view) | `bool` |
| `groupMemberIndexPlusOne(bytes32,address)` | `4c3c7dbc` | đọc (view) | `uint256` |
| `groupMembers(bytes32,uint256)` | `6454fab9` | đọc (view) | `address` |
| `hasRole(bytes32,address)` | `91d14854` | đọc (view) | `bool` |
| `initialize(address,address)` | `485cc955` | ghi (nonpayable) | `` |
| `invoiceRewardPercent()` | `2171c300` | đọc (view) | `uint256` |
| `isLegacyRewardVoucherInCurrentCatalog(string)` | `7dd9ff17` | đọc (view) | `bool` |
| `isMember(address)` | `a230c524` | đọc (view) | `bool` |
| `isMemberGroupId(bytes32)` | `7665a08d` | đọc (view) | `bool` |
| `isMemberPointSystem(address)` | `ce0ca210` | đọc (view) | `bool` |
| `isNetSpendModule(address)` | `dddc30b6` | đọc (view) | `bool` |
| `isOrder(address)` | `5cc714fd` | đọc (view) | `bool` |
| `isRewardVoucherInCurrentCatalog(bytes32)` | `b766c853` | đọc (view) | `bool` |
| `isTokenHolder(address)` | `65731fe9` | đọc (view) | `bool` |
| `isTopUp(address)` | `3f8467d9` | đọc (view) | `bool` |
| `lastRequestDate(address)` | `cfabf44b` | đọc (view) | `uint256` |
| `lifetimeTokenA(address)` | `c45a3008` | đọc (view) | `uint256` |
| `lockBonusPoints(address,uint256,bytes32,uint256)` | `d255c71b` | ghi (nonpayable) | `uint256` |
| `lockEarnPoints(address,uint256,bytes32,bytes32,bytes32,uint256,bool)` | `f2299cac` | ghi (nonpayable) | `` |
| `lockMember(address,string,uint256)` | `07b79506` | ghi (nonpayable) | `` |
| `lockPoints(address,uint256,bytes32)` | `2653e57c` | ghi (nonpayable) | `` |
| `lockWalletPoints(address,uint256,bytes32)` | `a27917b7` | ghi (nonpayable) | `` |
| `lockedBalanceOf(address)` | `59355736` | đọc (view) | `uint256` |
| `lockedEarnTierBPlanned(bytes32)` | `bec24d4b` | đọc (view) | `uint256` |
| `lockedEarns(bytes32)` | `117bf1e7` | đọc (view) | `address,uint256,bytes32,bytes32,bytes32,uint256,bytes32,uint256,uint256,uint256,uint256,bool,uint256` |
| `lockedPointMember(bytes32)` | `b007b410` | đọc (view) | `address` |
| `lockedPoints(bytes32)` | `7cea3145` | đọc (view) | `uint256,uint256,uint256,bytes32,uint256,bool` |
| `mManagement(uint256)` | `4802c393` | đọc (view) | `address` |
| `mOrder(uint256)` | `2d8206fe` | đọc (view) | `address` |
| `mRewardVouchers(string)` | `e242900f` | đọc (view) | `string,string,string,string,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,uint256` |
| `mRewardVouchersById(bytes32)` | `d02de646` | đọc (view) | `string,string,string,string,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,uint256` |
| `mTopUp(uint256)` | `ff1e3356` | đọc (view) | `address` |
| `manualGrantEnabled()` | `b3a2749b` | đọc (view) | `bool` |
| `manualPointOpsEnabled(uint256)` | `d5d146dd` | đọc (view) | `bool` |
| `manualRequests(uint256)` | `6412d5db` | đọc (view) | `uint256,address,bytes32,uint256,uint256,address,uint256,uint8,address,uint256,string,uint8,string` |
| `maxPercentPerInvoice()` | `c64881fe` | đọc (view) | `uint256` |
| `memberActiveSessionWallet(address)` | `960e8f41` | đọc (view) | `address` |
| `memberGroupIndexPlusOne(address,bytes32)` | `2477f25d` | đọc (view) | `uint256` |
| `memberGroups(bytes32)` | `1a113a49` | đọc (view) | `bytes32,string,bool,uint256` |
| `memberIdToAddress(string)` | `5b90d1ea` | đọc (view) | `address` |
| `memberPaymentHistory(address,uint256)` | `5685960a` | đọc (view) | `bytes32,uint256,uint256,uint256` |
| `memberRewardVoucherDetails(address,string,uint256)` | `8390418b` | đọc (view) | `string,uint256,bool,uint256,tuple` |
| `memberRewardVouchers(address,uint256)` | `d1ccdb64` | đọc (view) | `string` |
| `memberToGroups(address,uint256)` | `b21a5f41` | đọc (view) | `bytes32` |
| `memberTransactions(address,uint256)` | `b6492c9d` | đọc (view) | `uint256` |
| `memberTxIds(address,uint256)` | `5ff6768f` | đọc (view) | `uint256` |
| `memberVoucherInstanceIds(address,uint256)` | `86498352` | đọc (view) | `uint256` |
| `memberVoucherInstances(address,uint256)` | `2c53d3da` | đọc (view) | `bytes32,uint256,bool,uint256,uint8,uint256,uint256,uint256,bool,string,string,uint256` |
| `members(address)` | `08ae4b0c` | đọc (view) | `string,address,uint256,uint256,uint256,bytes32,uint256,bool,bool,string,string,string,string,string,string` |
| `moduleMaxPercent(uint256,bytes32)` | `a9e8c2bc` | đọc (view) | `uint256` |
| `netSpendBranchIds(address)` | `1c694fb4` | đọc (view) | `uint256` |
| `nextMemberVoucherInstanceId(address)` | `60a7a632` | đọc (view) | `uint256` |
| `orderBranchIds(address)` | `596cfafa` | đọc (view) | `uint256` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `pause(uint256)` | `136439dd` | ghi (nonpayable) | `` |
| `pauseCampaign(uint256,uint256)` | `3c84899c` | ghi (nonpayable) | `` |
| `paused()` | `5c975abb` | đọc (view) | `bool` |
| `previewBonusSpend(address,uint256)` | `e6e023ae` | đọc (view) | `uint256,uint256` |
| `previewBonusSpend(address,uint256,uint256)` | `62c3d6e4` | đọc (view) | `uint256,uint256` |
| `processedEarnLocks(bytes32)` | `578504dd` | đọc (view) | `bool` |
| `processedInvoices(bytes32)` | `4ff0c087` | đọc (view) | `bool` |
| `rebuildActiveCampaignIndex(uint256,uint256,uint256)` | `734ef694` | ghi (nonpayable) | `uint256,bool` |
| `rebuildGroupCatalogIndexes(uint256,uint256)` | `45fea2ec` | ghi (nonpayable) | `uint256,bool` |
| `rebuildGroupMemberIndexes(bytes32,uint256,uint256)` | `0b62d4d4` | ghi (nonpayable) | `uint256,bool` |
| `rebuildMemberCatalogIndexes(uint256,uint256)` | `60c6f0c4` | ghi (nonpayable) | `uint256,bool` |
| `rebuildMemberMembershipIndexes(address,uint256,uint256)` | `771ea4af` | ghi (nonpayable) | `uint256,bool` |
| `rebuildRewardBatchHeap(address,uint256,uint256,uint256)` | `cd78adbc` | ghi (nonpayable) | `uint256,bool` |
| `rebuildRewardBatchHeaps(address,uint256,uint256)` | `8b667616` | ghi (nonpayable) | `uint256,bool` |
| `rebuildRewardBatchIndexes(address,uint256,uint256)` | `1fde576e` | ghi (nonpayable) | `uint256,bool` |
| `recordedDays(uint256)` | `9f03529d` | đọc (view) | `uint256` |
| `redeemVoucherPoints(address,uint256,uint256)` | `02a84cf2` | ghi (nonpayable) | `` |
| `reduceLockedEarnInput(bytes32,uint256)` | `a6487730` | ghi (nonpayable) | `` |
| `refundExcessPaymentPoints(address,bytes32,uint256,uint256,uint256,uint256)` | `40b2b6d4` | ghi (nonpayable) | `uint256,uint256` |
| `registerMember(tuple)` | `` | ghi (nonpayable) | `` |
| `registerMemberFor(address,tuple)` | `` | ghi (nonpayable) | `` |
| `rejectManualRequest(uint256,string,uint256)` | `a12bf407` | ghi (nonpayable) | `` |
| `removeMemberFromGroup(address,bytes32,uint256)` | `b72382ef` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `renounceRole(bytes32,address)` | `36568abe` | ghi (nonpayable) | `` |
| `restoreRewardVoucher(address,uint256)` | `a7562e2f` | ghi (nonpayable) | `bool` |
| `resumeCampaign(uint256,uint256)` | `3657ad3c` | ghi (nonpayable) | `` |
| `resumeStuckEarnLock(bytes32)` | `d4af2653` | ghi (nonpayable) | `` |
| `resyncTransactionToFullDB(uint256,uint256,bytes32)` | `b7f259e5` | ghi (nonpayable) | `` |
| `revokeNetSession(address)` | `90f3e227` | ghi (nonpayable) | `` |
| `revokeRole(bytes32,address)` | `d547741f` | ghi (nonpayable) | `` |
| `rewardBatchBranchTracked(address,uint256)` | `6f59f591` | đọc (view) | `bool` |
| `rewardBatchHeapDefaultReady()` | `298f1bfd` | đọc (view) | `bool` |
| `rewardBatchHeapIndexPlusOne(address,uint256,uint256)` | `8ec6bd07` | đọc (view) | `uint256` |
| `rewardBatchHeapReady(address,uint256)` | `39e087b7` | đọc (view) | `bool` |
| `rewardBatchHeapsReady(address)` | `60de14d4` | đọc (view) | `bool` |
| `rewardBatchIndexPlusOne(address,uint256)` | `6314272b` | đọc (view) | `uint256` |
| `rewardMaxAbsolute()` | `61c7ae2c` | đọc (view) | `uint256` |
| `rewardMaxPercent()` | `16af7ce8` | đọc (view) | `uint256` |
| `rewardVoucherCatalogVersion()` | `eb780552` | đọc (view) | `uint256` |
| `rewardVoucherCodeCatalogVersion(bytes32)` | `9e84036b` | đọc (view) | `uint256` |
| `rewardVoucherCodes(uint256)` | `3aaaeca6` | đọc (view) | `string` |
| `rewardVoucherDeleted(bytes32)` | `23be70b0` | đọc (view) | `bool` |
| `rewardVoucherIdCatalogVersion(bytes32)` | `171d4fca` | đọc (view) | `uint256` |
| `rewardVoucherIds(uint256)` | `6faed5bd` | đọc (view) | `bytes32` |
| `searchIndex()` | `6da37bf5` | đọc (view) | `address` |
| `sessionWalletToMember(address)` | `fee0d724` | đọc (view) | `address` |
| `setAllowedActionTypes(bytes32[],bool[],uint256)` | `5a208d7e` | ghi (nonpayable) | `` |
| `setBranchAccessManager(address,uint256)` | `45596c26` | ghi (nonpayable) | `` |
| `setEconomyVault(address)` | `c5818c04` | ghi (nonpayable) | `` |
| `setExpiryForPerpetualBatches(address,uint256,uint256)` | `492210d2` | ghi (nonpayable) | `uint256` |
| `setInvoiceRewardPercent(uint256,uint256)` | `391c05d0` | ghi (nonpayable) | `` |
| `setManagementSC(address,uint256)` | `1221c77e` | ghi (nonpayable) | `` |
| `setManualGrantEnabled(bool,uint256)` | `6b2bf439` | ghi (nonpayable) | `` |
| `setModuleSpendPolicy(bytes32,uint256,uint256)` | `2aa6fcfa` | ghi (nonpayable) | `` |
| `setNetSpendModule(address,uint256,bool)` | `d3c4372c` | ghi (nonpayable) | `` |
| `setOrder(address,uint256)` | `9244f1f0` | ghi (nonpayable) | `` |
| `setSearchIndex(address)` | `d7788a04` | ghi (nonpayable) | `` |
| `setSpendPolicy(uint256,uint256,uint256,uint256)` | `62239725` | ghi (nonpayable) | `` |
| `setTier(address,bytes32,bytes32,uint256)` | `476485c9` | ghi (nonpayable) | `` |
| `setTierEnabled(bool,uint256)` | `5d00cb13` | ghi (nonpayable) | `` |
| `setTierForBatch(address[],bytes32,bytes32,uint256)` | `ca92b618` | ghi (nonpayable) | `` |
| `setTopUp(address,uint256)` | `da2aaaa1` | ghi (nonpayable) | `` |
| `setTopupPolicy(uint256,uint256,uint256,uint256)` | `19603f5d` | ghi (nonpayable) | `` |
| `spendPriority()` | `c87df118` | đọc (view) | `uint8` |
| `spendWalletForNet(address,uint256,bytes32,uint256)` | `c89a58f5` | ghi (nonpayable) | `uint256` |
| `spendWalletWithBonusForNet(address,uint256,bytes32,uint256,uint256)` | `ec12c7d2` | ghi (nonpayable) | `uint256,uint256` |
| `staffDailyRequests(address)` | `1b0bffd7` | đọc (view) | `uint256` |
| `supportsInterface(bytes4)` | `01ffc9a7` | đọc (view) | `bool` |
| `systemAdminBackfillCampaignLedger(bytes32,address,uint256,uint256,uint256,bytes32)` | `729c6b13` | ghi (nonpayable) | `` |
| `systemAdminBackfillTxMeta(uint256,uint256,uint256,bytes32)` | `1639bb2e` | ghi (nonpayable) | `` |
| `systemAdminResumeStuckEarnLock(bytes32)` | `d908c764` | ghi (nonpayable) | `` |
| `systemAdminResyncTransactionToFullDB(uint256,uint256,bytes32)` | `d52379ad` | ghi (nonpayable) | `` |
| `systemAdminSetLockedPointMember(bytes32,address)` | `f57a5a18` | ghi (nonpayable) | `` |
| `tierConfigs(bytes32)` | `c4e71436` | đọc (view) | `bytes32,string,uint256,uint256,uint256,uint256,uint256,uint256,string` |
| `tierEnabled()` | `5e962e05` | đọc (view) | `bool` |
| `tierIdByName(string)` | `b83f7fe9` | đọc (view) | `bytes32` |
| `tokenHolders(uint256)` | `923108d9` | đọc (view) | `address` |
| `topupMax()` | `6d078de5` | đọc (view) | `uint256` |
| `topupMin()` | `97108908` | đọc (view) | `uint256` |
| `topupRate()` | `c30bb677` | đọc (view) | `uint256` |
| `totalACredited()` | `ab711f04` | đọc (view) | `uint256` |
| `totalADebited()` | `fde53114` | đọc (view) | `uint256` |
| `totalBDebited()` | `2616ceb5` | đọc (view) | `uint256` |
| `totalBExpired()` | `963ceb73` | đọc (view) | `uint256` |
| `totalBGranted()` | `300228d4` | đọc (view) | `uint256` |
| `transactionIdByRefId(bytes32)` | `8ed45955` | đọc (view) | `uint256` |
| `transactionTypeBackfillCursor()` | `6bc6b52d` | đọc (view) | `uint256` |
| `transactionTypeIndexReady()` | `dfc3b56f` | đọc (view) | `bool` |
| `transactionTypeIndexed(uint256)` | `665c1b23` | đọc (view) | `bool` |
| `transactions(uint256)` | `9ace38c2` | đọc (view) | `uint256,address,uint8,int256,uint256,bytes32,address,uint256,string,uint256,uint8` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `unlockMember(address,uint256)` | `f2bc4cd3` | ghi (nonpayable) | `` |
| `unlockPoints(address,bytes32,uint256)` | `0dcfbe3c` | ghi (nonpayable) | `` |
| `unpause(uint256)` | `fabc1cbc` | ghi (nonpayable) | `` |
| `updateCampaign(uint256,uint256,uint256,bool,uint256,bytes32,bytes32[],uint256,uint256,uint256)` | `8c35e4cd` | ghi (nonpayable) | `` |
| `updateExchangeRate(uint256,uint256)` | `fcc73637` | ghi (nonpayable) | `` |
| `updateLastBuyActivityAt(address)` | `3ababf4b` | ghi (nonpayable) | `` |
| `updateMember(tuple)` | `` | ghi (nonpayable) | `` |
| `updateMemberGroup(bytes32,string,bool,uint256)` | `9e3084bc` | ghi (nonpayable) | `` |
| `updateTier(bytes32,string,uint256,uint256,uint256,uint256,uint256,string,uint256)` | `c2054020` | ghi (nonpayable) | `` |
| `updatemaxPercentPerInvoice(uint256,uint256)` | `bf1d189e` | ghi (nonpayable) | `` |
| `useBonusForPayment(address,uint256,bytes32,uint256)` | `626ba865` | ghi (nonpayable) | `uint256` |
| `usePointsForPayment(address,uint256,uint256,bytes32,uint256)` | `c6fd8c9f` | ghi (nonpayable) | `uint256` |
| `useWalletForPayment(address,uint256,bytes32,uint256)` | `d8dca8b7` | ghi (nonpayable) | `uint256` |
| `userRedeemedCount(string,address)` | `97dfbbca` | đọc (view) | `uint256` |
| `userRedeemedCountById(bytes32,address)` | `591af0b5` | đọc (view) | `uint256` |
| `validateRewardVoucher(address,uint256,uint256,uint256,string[])` | `61fa638a` | đọc (view) | `bool,string,uint8,uint256,tuple` |
| `vaultBranchIds(uint256)` | `9e592793` | đọc (view) | `uint256` |
| `vaultBranchRegistered(uint256)` | `a5b91520` | đọc (view) | `bool` |

## Event (58)

| Event |
|---|
| `AllowedActionUpdated(bytes32,bool)` |
| `BranchAccessManagerUpdated(uint256,address,address)` |
| `CampaignCreated(uint256,string,bytes32,uint256,bool,bytes32)` |
| `CampaignExecuted(uint256,address,bytes32,uint256,uint256,uint256)` |
| `CampaignPaused(uint256)` |
| `CampaignResumed(uint256)` |
| `CampaignUpdated(uint256,uint256,bool,uint256,bytes32)` |
| `CustomerTierChanged(address,bytes32,bytes32,address,bytes32,uint256)` |
| `DebitCompleted(address,uint256,uint256,uint256,bytes32,bytes32)` |
| `EarnPointsConfirmed(address,bytes32,uint256,uint256)` |
| `EarnPointsDiscarded(address,bytes32)` |
| `EarnPointsLocked(address,bytes32,uint256,uint256)` |
| `EconomyVaultUpdated(address,address)` |
| `Initialized(uint64)` |
| `InvoiceRewardPercentUpdated(uint256)` |
| `LockedPointMemberSet(bytes32,address)` |
| `ManualGrantEnabledSet(uint256,bool,address,uint256)` |
| `ManualRequestCreated(uint256,address,address,uint256)` |
| `ManualRequestProcessed(uint256,bool,address,uint256)` |
| `MemberAssignedToGroup(address,bytes32,uint256)` |
| `MemberDeleted(address,uint256)` |
| `MemberGroupCreated(bytes32,string,uint256)` |
| `MemberGroupDeleted(bytes32,uint256)` |
| `MemberGroupDeletionProgress(bytes32,uint256,uint256,uint256)` |
| `MemberGroupDeletionStarted(bytes32,uint256,uint256)` |
| `MemberGroupUpdated(bytes32,string,uint256)` |
| `MemberLocked(address,address,string,uint256)` |
| `MemberRegistered(address,string,uint256)` |
| `MemberRemovedFromGroup(address,bytes32,uint256)` |
| `MemberUnlocked(address,address,uint256)` |
| `MemberUpdated(address,string,uint256)` |
| `ModuleSpendPolicyUpdated(uint256,bytes32,uint256)` |
| `OwnershipTransferred(address,address)` |
| `Paused(address)` |
| `PerpetualBatchesExpirySet(address,uint256,uint256,uint256,uint256)` |
| `PointsBurnConfirmed(address,uint256,bytes32)` |
| `PointsLocked(address,uint256,bytes32)` |
| `PointsUnlocked(address,uint256,bytes32)` |
| `PointsUsedForPayment(address,bytes32,uint256,uint256,uint256)` |
| `RewardVoucherConsumed(address,string,uint8,address)` |
| `RewardVoucherRestored(address,uint256,address)` |
| `RoleAdminChanged(bytes32,bytes32,bytes32)` |
| `RoleGranted(bytes32,address,address)` |
| `RoleRevoked(bytes32,address,address)` |
| `SpendPolicyUpdated(uint256,uint256,uint256)` |
| `TierDefined(bytes32,string,uint256,uint256,uint256,uint256,uint256,address,uint256)` |
| `TierDeleted(bytes32,address,uint256)` |
| `TierEnabledSet(address,bool,uint256)` |
| `TokenACredited(uint256,address,uint256,bytes32,bytes32,bytes32,uint256)` |
| `TokenADebited(uint256,address,uint256,bytes32,bytes32,uint256)` |
| `TokenAEarned(address,uint256,uint256,uint256,bytes32,bytes32,bytes32)` |
| `TokenBDebited(uint256,address,uint256,bytes32,bytes32,uint256)` |
| `TokenBExpired(address,uint256,uint256)` |
| `TokenBGranted(address,uint256,uint256,bytes32,uint256,uint256)` |
| `TopupPolicyUpdated(uint256,uint256,uint256)` |
| `TransactionCreated(uint256,address,uint8,int256)` |
| `Transfer(address,address,uint256)` |
| `Unpaused(address)` |
