# RestaurantOrder — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (216)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `ACCESS_MANAGEMENT()` | `abb763ef` | đọc (view) | `address` |
| `BRANCH_REGISTRY()` | `ff866627` | đọc (view) | `address` |
| `BatchUpdateCourseStatus(address,uint256,bytes32,bytes32,uint8)` | `756ca718` | ghi (nonpayable) | `` |
| `BatchUpdateHideReview(bytes32[],string)` | `38c8d33a` | ghi (nonpayable) | `` |
| `ConfirmOrder(address,uint256,bytes32,uint8)` | `2a9ad56f` | ghi (nonpayable) | `` |
| `CreateSessionForTable(address,uint256,uint256,bytes32)` | `474544ed` | ghi (nonpayable) | `bytes32,bool` |
| `GetAllOrders()` | `5a654dfb` | đọc (view) | `tuple[]` |
| `GetCoursesByOrderId(bytes32)` | `b1acec0c` | đọc (view) | `tuple[]` |
| `GetCoursesBySession(bytes32)` | `cfcc0859` | đọc (view) | `tuple[]` |
| `GetOrderById(bytes32)` | `2542a1f3` | đọc (view) | `tuple` |
| `GetOrderStatusCounts()` | `8aa571c2` | đọc (view) | `uint256[7]` |
| `GetOrders(bytes32)` | `eea90533` | đọc (view) | `tuple[]` |
| `GetOrdersAcknowlegdePaginationByStatus(address,uint256,uint256,uint8)` | `0062868f` | đọc (view) | `tuple[],uint256` |
| `GetOrdersByStatus(uint8)` | `2709cb51` | đọc (view) | `tuple[]` |
| `GetOrdersPaginationByStatus(uint256,uint256,uint8)` | `fbeb0b8a` | đọc (view) | `tuple[],uint256` |
| `ICARD_VISA()` | `fc16287c` | đọc (view) | `address` |
| `LockTableForReservation(address,uint256,uint256[],bytes32)` | `97aaf3f7` | ghi (nonpayable) | `` |
| `MANAGEMENT()` | `b53f0d00` | đọc (view) | `address` |
| `MasterPool()` | `fb7ef377` | đọc (view) | `address` |
| `MergeMoreTableByStaff(address,uint256,uint256[],bytes32)` | `b7d0d03e` | ghi (nonpayable) | `` |
| `MergeTableByStaff(address,uint256,uint256[],bytes32)` | `bbb00c39` | ghi (nonpayable) | `` |
| `PAYMENT_REGISTRY()` | `eea6b901` | đọc (view) | `address` |
| `PERM_IQR_FINANCE()` | `ea1a1ecf` | đọc (view) | `bytes32` |
| `PERM_IQR_ORDER_STATUS_UPDATE()` | `8ec469df` | đọc (view) | `bytes32` |
| `PERM_IQR_TABLE_MANAGE()` | `6618cdca` | đọc (view) | `bytes32` |
| `POINTS()` | `7f6e4281` | đọc (view) | `address` |
| `RemoveSomeTablesFromSession(address,uint256,bytes32,uint256[])` | `66ba225f` | ghi (nonpayable) | `` |
| `Report()` | `666255ab` | đọc (view) | `address` |
| `SCUsdt()` | `94284cbd` | đọc (view) | `address` |
| `SeparateTableByStaff(address,uint256,bytes32)` | `c08a2fc8` | ghi (nonpayable) | `` |
| `TransferTable(address,uint256,uint256,uint256)` | `cdf7f268` | ghi (nonpayable) | `` |
| `UpdateOrder(bytes32,bytes32,uint256[],uint256[])` | `be9e7934` | ghi (nonpayable) | `bool` |
| `acceptTransfer(address,uint256,bytes32,uint256)` | `06203059` | ghi (nonpayable) | `bool` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `allOrders(uint256)` | `eb5945e4` | đọc (view) | `bytes32,bytes32,uint256,uint8` |
| `allPaymentIds(uint256)` | `844a370d` | đọc (view) | `bytes32` |
| `autoConfirmPaymentFromTransfer(bytes32,uint256,uint256,uint256,string)` | `d94f4305` | ghi (nonpayable) | `bool` |
| `batchAcceptTransfers(address,uint256,bytes32[],uint256[])` | `aedc29b5` | ghi (nonpayable) | `` |
| `batchTransferOrders(address,uint256,address[],string)` | `0ee095a3` | ghi (nonpayable) | `uint256[]` |
| `callStaff(uint256,uint256,string,bytes32,bytes32)` | `fb23f63e` | ghi (nonpayable) | `` |
| `cancelOrder(address,uint256,bytes32)` | `c1ac6df2` | ghi (nonpayable) | `bool` |
| `cancelPayment(address,uint256,bytes32)` | `2f358dd4` | ghi (nonpayable) | `bool` |
| `cancelReservation(bytes32)` | `a2d6ca20` | ghi (nonpayable) | `` |
| `cancelTransferRequest(address,uint256,bytes32,uint256)` | `aeb146af` | ghi (nonpayable) | `bool` |
| `checkSessionAvailable(bytes32)` | `57ddab50` | đọc (view) | `bool` |
| `checkSessionTable(uint256,bytes32)` | `3c24a5fe` | đọc (view) | `bool` |
| `checkStatusTable(uint256)` | `d5dd800f` | đọc (view) | `uint8` |
| `closeSessionByStaff(address,uint256,uint256,bytes32)` | `e30b457b` | ghi (nonpayable) | `bool` |
| `confirmPayment(address,uint256,uint256,bytes32,string,address)` | `3579133b` | ghi (nonpayable) | `bool` |
| `confirmRefund(bytes32,bytes32)` | `8c56c65b` | ghi (nonpayable) | `bool` |
| `currentReservationRule()` | `5d51ead5` | đọc (view) | `uint256,uint256,uint256` |
| `customerDishCounts(address,string)` | `65722fbb` | đọc (view) | `uint256` |
| `customerProfiles(bytes32)` | `8e05ffc7` | đọc (view) | `bytes32,uint8,uint8,uint256,uint256` |
| `customerReservations(address,uint256)` | `08cf4c79` | đọc (view) | `bytes32` |
| `declineTransfer(address,uint256,bytes32,uint256)` | `d5a06b7a` | ghi (nonpayable) | `bool` |
| `enableOrderDismissBroadcast()` | `5899622d` | đọc (view) | `bool` |
| `executeOrder(bytes32,bytes32,bytes32,bytes32,uint256,uint256,uint256,string,bool,bool)` | `a596fe67` | ghi (nonpayable) | `bool` |
| `getAccountBank()` | `33b167d2` | đọc (view) | `bytes` |
| `getActiveSessionsByTable(uint256)` | `8316feff` | đọc (view) | `bytes32[]` |
| `getAllReservationsByPage(uint256,uint256)` | `e9db1213` | đọc (view) | `tuple[]` |
| `getCurrentSessionId(uint256)` | `2401f495` | đọc (view) | `bytes32` |
| `getDeclinedStaffByOrder(bytes32)` | `b0357c4f` | đọc (view) | `tuple[]` |
| `getEarnInputAmount(bytes32)` | `f9596f20` | đọc (view) | `uint256` |
| `getLatestOrderHistory(bytes32,uint256)` | `154d8759` | đọc (view) | `tuple[]` |
| `getLatestPaymentHistory(bytes32,uint256)` | `b791417d` | đọc (view) | `tuple[]` |
| `getMyReservations()` | `48b56adc` | đọc (view) | `bytes32[]` |
| `getOrderHistory(bytes32)` | `08d8c0d4` | đọc (view) | `tuple[]` |
| `getOrderHistoryPaginated(bytes32,uint256,uint256)` | `c47ad6a3` | đọc (view) | `tuple[],uint256` |
| `getOrderStaffInfo(bytes32)` | `4a16857f` | đọc (view) | `address,address[],uint8` |
| `getPayment(bytes32)` | `e66eefc8` | đọc (view) | `tuple` |
| `getPaymentByOrder(bytes32)` | `1b67fec4` | đọc (view) | `tuple` |
| `getPaymentCancelSettlement(bytes32)` | `64b85c90` | đọc (view) | `uint256,uint256,uint256,uint256,uint256,uint256,uint256` |
| `getPaymentCourses(bytes32)` | `ef898791` | đọc (view) | `tuple[]` |
| `getPaymentDashboardItem(uint256)` | `fbc5818c` | đọc (view) | `uint8,uint256,uint256,address` |
| `getPaymentDashboardSummary(uint8,uint256)` | `0054b93f` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `getPaymentHistory(bytes32)` | `16cac02a` | đọc (view) | `tuple[]` |
| `getPaymentHistoryByAction(bytes32,uint8)` | `cde1c0f7` | đọc (view) | `tuple[]` |
| `getPaymentHistoryByStaff(bytes32,address)` | `7d84d5be` | đọc (view) | `tuple[]` |
| `getPaymentHistoryCount()` | `92b5883f` | đọc (view) | `uint256` |
| `getPaymentHistoryCount(bytes32)` | `829af0ef` | đọc (view) | `uint256` |
| `getPaymentHistoryItem(uint256)` | `a630a363` | đọc (view) | `tuple` |
| `getPaymentHistoryPaginated(bytes32,uint256,uint256)` | `29aebaf3` | đọc (view) | `tuple[],uint256` |
| `getPaymentInfo(bytes32)` | `a75e9b19` | đọc (view) | `tuple` |
| `getPaymentInfoByOrder(bytes32)` | `3aeea459` | đọc (view) | `tuple` |
| `getPaymentInfoHistoryItem(uint256)` | `6b58ad4c` | đọc (view) | `tuple` |
| `getPaymentInfosWithStatus(uint256,uint256)` | `092a19c7` | đọc (view) | `tuple[],uint256` |
| `getPaymentLoyaltyUsed(bytes32)` | `99983279` | đọc (view) | `uint256,uint256` |
| `getPaymentPointsInfo(bytes32)` | `3006de1c` | đọc (view) | `uint256,uint256,string` |
| `getPaymentsPagination(uint256,uint256)` | `bbddb771` | đọc (view) | `tuple[],uint256` |
| `getPaymentsWithStatus(uint256,uint256)` | `b03ff991` | đọc (view) | `tuple[],uint256` |
| `getPendingTransfers(bytes32)` | `acdea786` | đọc (view) | `tuple[]` |
| `getPendingTransfersByStaff(bytes32,address)` | `527d0d11` | đọc (view) | `tuple[]` |
| `getReservationDetails(bytes32)` | `5be701d4` | đọc (view) | `tuple` |
| `getReview(bytes32)` | `aa58d6b2` | đọc (view) | `tuple` |
| `getReviewByDish(string)` | `5aab059b` | đọc (view) | `tuple[]` |
| `getReviewsByDate(uint256,uint256,uint256)` | `72b4ce86` | đọc (view) | `tuple[],uint256,uint256,uint256` |
| `getReviewsByMonth(uint256,uint256,uint256)` | `4bd0a93c` | đọc (view) | `tuple[],uint256,uint256,uint256` |
| `getSessionCourse(bytes32,uint256)` | `dc7256b8` | đọc (view) | `tuple` |
| `getSessionCourseCount(bytes32)` | `a065e4cc` | đọc (view) | `uint256` |
| `getSessionOrder(bytes32,uint256)` | `362e96e1` | đọc (view) | `tuple` |
| `getSessionOrderCount(bytes32)` | `d0a2cd7d` | đọc (view) | `uint256` |
| `getSessionPayment(bytes32,bytes32)` | `92e5b386` | đọc (view) | `tuple` |
| `getSessionPaymentIds(bytes32)` | `e62099af` | đọc (view) | `bytes32[]` |
| `getSessionPaymentInfo(bytes32,bytes32)` | `3d33145c` | đọc (view) | `tuple` |
| `getSessionPaymentInfoIds(bytes32)` | `3ea65905` | đọc (view) | `bytes32[]` |
| `getStaffActiveOrders(address)` | `5afcdbbf` | đọc (view) | `bytes32[]` |
| `getStaffActiveOrdersCount(address)` | `4cad07b1` | đọc (view) | `uint256` |
| `getStaffShareForOrder(bytes32,address)` | `5a7963ab` | đọc (view) | `uint8` |
| `getTableByPaymentId(bytes32)` | `5c190b7f` | đọc (view) | `uint256` |
| `getTableBySession(bytes32)` | `b3ac09fd` | đọc (view) | `uint256` |
| `getTableReservation(uint256)` | `b4a48602` | đọc (view) | `tuple,bytes32` |
| `getTaxPercent()` | `98a9cfac` | đọc (view) | `uint8` |
| `getTransferOverview(bytes32)` | `531e1263` | đọc (view) | `tuple` |
| `handleCustomerCheckIn(address,uint256,uint256[],bytes32,bytes32)` | `cc5c9531` | ghi (nonpayable) | `` |
| `handleNoShow(address,uint256,uint256[],bytes32,bytes32,bool)` | `0a1aa297` | ghi (nonpayable) | `` |
| `hasTransferRequest(bytes32,address)` | `613dadf2` | đọc (view) | `bool` |
| `initialize()` | `8129fc1c` | ghi (nonpayable) | `` |
| `iqrAgentSC()` | `5c767fcb` | đọc (view) | `address` |
| `isOrderAcknowledged(bytes32)` | `bf4be93e` | đọc (view) | `bool` |
| `isValidAmount(bytes32,uint256)` | `1c8eaa72` | đọc (view) | `bool` |
| `mDishCodeToReviews(string,uint256)` | `b3ec6f07` | đọc (view) | `string,string,uint8,string,uint256,bytes32,bool,bytes32` |
| `mIdToPayment(bytes32)` | `b1019843` | đọc (view) | `bytes32,bytes32,uint256,uint256,uint256,uint256,string,uint8,uint256,string,uint256,uint256,uint256` |
| `mIdToPaymentInformation(bytes32)` | `07193a98` | đọc (view) | `bytes32,address,uint8,address,address,string,uint256,uint256` |
| `mIdToReservations(bytes32)` | `314b271e` | đọc (view) | `bytes32,uint256,uint256,bool,string,string,uint256,uint8,uint256,uint256,uint256,uint256,bool,bool` |
| `mIdToSession(bytes32)` | `7aa6f399` | đọc (view) | `bytes32,uint256,address,uint8,address,uint8,bytes32` |
| `mOrderIdToCourses(bytes32,uint256)` | `43432cd9` | đọc (view) | `uint256,string,string,uint256,uint256,uint8,string,string` |
| `mOrderIdToOrder(bytes32)` | `ba8a10d7` | đọc (view) | `bytes32,bytes32,uint256,uint8` |
| `mOrderIdToPaymentId(bytes32)` | `7e23a98b` | đọc (view) | `bytes32` |
| `mSessionToCoursePrice(bytes32,uint256)` | `ec8a79b8` | đọc (view) | `uint256` |
| `mSessionToCourses(bytes32,uint256)` | `3d26e828` | đọc (view) | `uint256,string,string,uint256,uint256,uint8,string,string` |
| `mSessionToIdToCourse(bytes32,uint256)` | `54ecf2fc` | đọc (view) | `uint256,string,string,uint256,uint256,uint8,string,string` |
| `mSessionToOrderIds(bytes32,uint256)` | `c9a3360d` | đọc (view) | `bytes32` |
| `mSessionToPayment(bytes32,uint256)` | `74fff833` | đọc (view) | `bytes32,bytes32,uint256,uint256,uint256,uint256,string,uint8,uint256,string,uint256,uint256,uint256` |
| `mSessionToPaymentInformation(bytes32,uint256)` | `b501ee5b` | đọc (view) | `bytes32,address,uint8,address,address,string,uint256,uint256` |
| `mSessionToTableMerge(bytes32,uint256)` | `9db79ec5` | đọc (view) | `uint256` |
| `mTableToSessionIds(uint256,uint256)` | `ea68ad87` | đọc (view) | `bytes32` |
| `mTimeToGroupFeature(uint256)` | `1b30f931` | đọc (view) | `uint256,bool,uint8` |
| `makeOrder(address,uint256,tuple)` | `` | ghi (nonpayable) | `bytes32` |
| `makeReview(bytes32,uint8,string[],uint8[],string,string)` | `f4a9f6d7` | ghi (nonpayable) | `bool` |
| `merchant()` | `a5ff7651` | đọc (view) | `address` |
| `noti()` | `6fb9bbed` | đọc (view) | `address` |
| `numberOfVisit(address)` | `5ecd86e6` | đọc (view) | `uint256` |
| `orderAcknowledged(bytes32)` | `d7918cf4` | đọc (view) | `bool` |
| `orderCourseIndexPlusOne(bytes32,uint256)` | `7a52e40d` | đọc (view) | `uint256` |
| `orderCourseIndexesReady(bytes32)` | `7a8089f3` | đọc (view) | `bool` |
| `orderHistories(bytes32,uint256)` | `35edf00f` | đọc (view) | `uint256,bytes32,uint256,uint8,address,string,address` |
| `orderHistoryCounter()` | `12000055` | đọc (view) | `uint256` |
| `orderIdsByStatus(uint8,uint256)` | `0ac680e2` | đọc (view) | `bytes32` |
| `orderIndexPlusOne(bytes32)` | `821925c2` | đọc (view) | `uint256` |
| `orderPrimaryStaff(bytes32)` | `7de912f4` | đọc (view) | `address` |
| `orderStaffHistory(bytes32,uint256)` | `72beec3e` | đọc (view) | `address` |
| `orderStaffShare(bytes32,address)` | `e629b2e9` | đọc (view) | `uint8` |
| `orderStatusCount(uint8)` | `b10c1135` | đọc (view) | `uint256` |
| `orderStatusIndexPlusOne(bytes32)` | `7d1af927` | đọc (view) | `uint256` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `paused()` | `5c975abb` | đọc (view) | `bool` |
| `paymentCourseIndexPlusOne(bytes32,uint256)` | `36461a01` | đọc (view) | `uint256` |
| `paymentCourseIndexesReady(bytes32)` | `fde4ee11` | đọc (view) | `bool` |
| `paymentCourses(bytes32,uint256)` | `703f8b97` | đọc (view) | `uint256,string,string,uint256,uint256,uint8,string,string` |
| `paymentDiscountPromotionId(bytes32)` | `4b1fdf07` | đọc (view) | `bytes32` |
| `paymentDiscountReleased(bytes32)` | `62b6d2ad` | đọc (view) | `bool` |
| `paymentHistories(bytes32,uint256)` | `65fb7b44` | đọc (view) | `uint256,bytes32,uint256,uint8,address,string,address` |
| `paymentHistory(uint256)` | `a5e047b8` | đọc (view) | `bytes32,bytes32,uint256,uint256,uint256,uint256,string,uint8,uint256,string,uint256,uint256,uint256` |
| `paymentInfoHistory(uint256)` | `ad379680` | đọc (view) | `bytes32,address,uint8,address,address,string,uint256,uint256` |
| `paymentPointsRefunded(bytes32)` | `f53916cd` | đọc (view) | `uint256` |
| `paymentPointsUsed(bytes32)` | `e743cf18` | đọc (view) | `uint256` |
| `paymentPromoCustomer(bytes32)` | `e300fbc2` | đọc (view) | `address` |
| `paymentRewardVoucherCode(bytes32)` | `42a7a25c` | đọc (view) | `string` |
| `paymentRewardVoucherInstanceId(bytes32)` | `45a07f39` | đọc (view) | `uint256` |
| `paymentWalletRefunded(bytes32)` | `3fca7faf` | đọc (view) | `uint256` |
| `paymentWalletUsed(bytes32)` | `f6fe6c31` | đọc (view) | `uint256` |
| `pendingTransferIndexPlusOne(bytes32)` | `e2ac75cc` | đọc (view) | `uint256` |
| `pendingTransferIndexesReady(bytes32)` | `08bd33d7` | đọc (view) | `bool` |
| `pendingTransfers(bytes32,uint256)` | `3e6a2263` | đọc (view) | `uint256,bytes32,address,address,uint256,uint8,string` |
| `previewPointPayment(bytes32,address,bytes32)` | `b443d37e` | đọc (view) | `uint256,uint256,uint256,uint256,bool` |
| `rebuildOrderCourseIndexes(bytes32,uint256,uint256)` | `0042100d` | ghi (nonpayable) | `uint256,bool` |
| `rebuildOrderIndexes(uint256,uint256)` | `7ccaeee3` | ghi (nonpayable) | `uint256,bool` |
| `rebuildOrderStatusIndexes(uint256,uint256)` | `83bf65f2` | ghi (nonpayable) | `uint256,bool` |
| `rebuildPaymentCourseIndexes(bytes32,uint256,uint256)` | `4f5975ad` | ghi (nonpayable) | `uint256,bool` |
| `rebuildPaymentHistory(bytes32)` | `d9a0b043` | ghi (nonpayable) | `bool` |
| `rebuildPendingTransferIndexes(bytes32,uint256,uint256)` | `f800a455` | ghi (nonpayable) | `uint256,bool` |
| `rebuildSessionOrderIndexes(bytes32,uint256,uint256)` | `42cd3b06` | ghi (nonpayable) | `uint256,bool` |
| `rebuildSessionPaymentIndexes(bytes32,uint256,uint256)` | `d5599409` | ghi (nonpayable) | `uint256,bool` |
| `rebuildStaffActiveOrderIndexes(address,uint256,uint256)` | `42ff4f1f` | ghi (nonpayable) | `uint256,bool` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `reportServiceIssue(bytes32,uint256,string,string)` | `d6bb570b` | ghi (nonpayable) | `` |
| `requestTransferOrder(address,uint256,bytes32,address[],string)` | `ce296c4d` | ghi (nonpayable) | `uint256` |
| `reserveTable(uint256,uint256,string,string,uint256,bool)` | `905019a6` | ghi (nonpayable) | `` |
| `revenueSC()` | `fe54476d` | đọc (view) | `address` |
| `reviews(bytes32)` | `8475100d` | đọc (view) | `string,uint8,string,uint256,bytes32` |
| `sessionOrderIndexPlusOne(bytes32)` | `b704b018` | đọc (view) | `uint256` |
| `sessionOrders(bytes32,uint256)` | `0343ba8f` | đọc (view) | `bytes32,bytes32,uint256,uint8` |
| `sessionPaymentIndexPlusOne(bytes32,bytes32)` | `5fd5d5a4` | đọc (view) | `uint256` |
| `sessionPaymentIndexesReady(bytes32)` | `0dbad858` | đọc (view) | `bool` |
| `setBranchAccessManager(address)` | `251c420c` | ghi (nonpayable) | `` |
| `setBranchPaymentRegistry(address)` | `1c6601cd` | ghi (nonpayable) | `` |
| `setConfig(address,address,address,uint8,address,address)` | `85c06151` | ghi (nonpayable) | `` |
| `setConfigRuleNoShow(uint256,uint256,uint256)` | `8db83fc7` | ghi (nonpayable) | `` |
| `setEnableOrderDismissBroadcast(bool)` | `e02fccf4` | ghi (nonpayable) | `` |
| `setFeatureCustomers(bool,uint8,bytes32[],uint8[],uint8[],uint256)` | `6a298e62` | ghi (nonpayable) | `` |
| `setIQRAgent(address,address,address)` | `7c035028` | ghi (nonpayable) | `` |
| `setManagement(address)` | `d4a22bde` | ghi (nonpayable) | `` |
| `setPointSC(address)` | `869c5f0d` | ghi (nonpayable) | `` |
| `setSCUsdt(address)` | `32438f79` | ghi (nonpayable) | `` |
| `setTaxPercent(uint8)` | `240143b8` | ghi (nonpayable) | `` |
| `staffActiveOrderIndexPlusOne(address,bytes32)` | `4d2c4ff2` | đọc (view) | `uint256` |
| `staffActiveOrderIndexesReady(address)` | `70a400f9` | đọc (view) | `bool` |
| `staffActiveOrders(address,uint256)` | `5234a52e` | đọc (view) | `bytes32` |
| `staffCreateOrderForGuest(address,uint256,tuple)` | `` | ghi (nonpayable) | `bytes32` |
| `staffExecuteOrderCash(address,uint256,bytes32,bytes32,bytes32,bytes32,uint256,uint256,uint256,bool,bool,address)` | `c00b4bdc` | ghi (nonpayable) | `bool` |
| `staffExecuteRefund(address,uint256,bytes32,bytes32,string)` | `d8167326` | ghi (nonpayable) | `` |
| `taxPercent()` | `7541f41c` | đọc (view) | `uint8` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `updateCourseStatus(address,uint256,bytes32,bytes32,uint256,uint8,uint256)` | `5712e878` | ghi (nonpayable) | `` |
| `updateReservation(bytes32,uint256,uint256,string,string)` | `10540468` | ghi (nonpayable) | `` |
| `usedTxIds(string)` | `64f93a36` | đọc (view) | `bool` |

## Event (46)

| Event |
|---|
| `BatchCourseStatusUpdated(bytes32,bytes32,uint8)` |
| `BranchPaymentRegistryUpdated(address,address)` |
| `CallStaff(uint256,uint256,string,bytes32,bytes32)` |
| `CloseSessionByStaff(uint256,bytes32,address)` |
| `CourseStatusUpdated(bytes32,bytes32,uint256,uint8)` |
| `CreateSessionTable(bytes32,bool)` |
| `CustomerCheckIn(uint256[],bytes32,bytes32,uint256)` |
| `DebugSingleCancelRefund(bytes32,uint256,uint256,uint256,uint256,uint256)` |
| `DiscountUseReleaseFailed(bytes32,bytes32,bytes)` |
| `DiscountUseReleased(bytes32,bytes32)` |
| `EarnPointsFinalizeFailed(bytes32,address,bytes)` |
| `Initialized(uint64)` |
| `LockTableSession(uint256[],bytes32,uint256)` |
| `MergeMoreTableFromStaff(uint256[],uint256,bytes32,uint256)` |
| `MergeTableFromStaff(uint256[],bytes32,uint256)` |
| `NoShowHandled(uint256[],bytes32,bytes32,bool,uint256)` |
| `OrderAcknowledged(bytes32,address,uint256)` |
| `OrderCancelled(bytes32,address,bool)` |
| `OrderConfirmed(bytes32,bytes32)` |
| `OrderHistoryAdded(bytes32,uint256,uint8,address)` |
| `OrderMade(uint256,bytes32,bytes32,uint256)` |
| `OrderNotificationDismissed(bytes32,address[])` |
| `OrderNotificationSent(bytes32,uint256,address[])` |
| `OrderTransferAccepted(bytes32,address,address,string,uint256)` |
| `OrderTransferCancelled(bytes32,address,uint256)` |
| `OrderTransferDeclined(bytes32,address,uint256)` |
| `OrderTransferRequested(bytes32,address,string,address[],string,uint256)` |
| `OwnershipTransferred(address,address)` |
| `Paused(address)` |
| `PaymentCancelSettlement(bytes32,address,uint256,uint256,uint256,uint256,uint256)` |
| `PaymentConfirmed(bytes32,address)` |
| `PaymentMade(bytes32,bytes32,uint256)` |
| `PaymentWithPoints(bytes32,address,uint256,uint256,uint256)` |
| `RefundConfirmed(bytes32,address)` |
| `ReservationCancelled(bytes32,uint256)` |
| `ReservationRuleUpdated(uint256,uint256,uint256)` |
| `ReservationUpdated(bytes32,uint256,uint256)` |
| `RewardVoucherRestoreFailed(bytes32,uint256,bytes)` |
| `RewardVoucherRestored(bytes32,uint256)` |
| `SeparateTableFromStaff(uint256[],bytes32,uint256)` |
| `ServiceIssueReported(bytes32,uint256,string,string,address,uint256)` |
| `SessionCreated(uint256,bytes32,bytes32,address)` |
| `SessionReservationCreated(uint256[],bytes32,bytes32,address)` |
| `StaffExecuteRefund(bytes32,address)` |
| `TableReserved(bytes32,uint256,uint256)` |
| `Unpaused(address)` |
