# RestaurantOrder — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/iqr/RestaurantOrder.sol`. Layout đầy đủ: `../../layout/RestaurantOrder.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `_status` | `uint256` | scalar | RestaurantOrder |
| 1 | 0 | `__gap_oz_v4_storage` | `uint256` | gap | RestaurantOrder |
| 2 | 0 | `ACCESS_MANAGEMENT` | `contract IBranchAccessManager` | scalar | RestaurantOrder |
| 3 | 0 | `BRANCH_REGISTRY` | `contract IBranchResourceRegistry` | scalar | RestaurantOrder |
| 4 | 0 | `PAYMENT_REGISTRY` | `contract IBranchPaymentRegistry` | scalar | RestaurantOrder |
| 5 | 0 | `MANAGEMENT` | `contract IManagement` | scalar | RestaurantOrder |
| 6 | 0 | `SCUsdt` | `contract IERC20` | scalar | RestaurantOrder |
| 7 | 0 | `merchant` | `address` | scalar | RestaurantOrder |
| 8 | 0 | `MasterPool` | `address` | scalar | RestaurantOrder |
| 8 | 20 | `_taxPercent` | `uint8` | scalar | RestaurantOrder |
| 9 | 0 | `currentReservationRule` | `struct ReservationRule` | struct | RestaurantOrder |
| 12 | 0 | `mIdToReservations` | `mapping(bytes32 => struct Reservation)` | mapping | RestaurantOrder |
| 13 | 0 | `mTableToSessionIds` | `mapping(uint256 => bytes32[])` | mapping | RestaurantOrder |
| 14 | 0 | `mSessionToTableMerge` | `mapping(bytes32 => uint256[])` | mapping | RestaurantOrder |
| 15 | 0 | `mSessionToOrderIds` | `mapping(bytes32 => bytes32[])` | mapping | RestaurantOrder |
| 16 | 0 | `sessionOrders` | `mapping(bytes32 => struct Order[])` | mapping | RestaurantOrder |
| 17 | 0 | `mSessionToCourses` | `mapping(bytes32 => struct SimpleCourse[])` | mapping | RestaurantOrder |
| 18 | 0 | `mSessionToIdToCourse` | `mapping(bytes32 => mapping(uint256 => struct SimpleCourse))` | mapping | RestaurantOrder |
| 19 | 0 | `mSessionToCoursePrice` | `mapping(bytes32 => mapping(uint256 => uint256))` | mapping | RestaurantOrder |
| 20 | 0 | `mOrderIdToPaymentId` | `mapping(bytes32 => bytes32)` | mapping | RestaurantOrder |
| 21 | 0 | `mIdToSession` | `mapping(bytes32 => struct Session)` | mapping | RestaurantOrder |
| 22 | 0 | `mSessionToPayment` | `mapping(bytes32 => struct Payment[])` | mapping | RestaurantOrder |
| 23 | 0 | `mSessionToPaymentInformation` | `mapping(bytes32 => struct PaymentInformation[])` | mapping | RestaurantOrder |
| 24 | 0 | `customerReservations` | `mapping(address => bytes32[])` | mapping | RestaurantOrder |
| 25 | 0 | `allReservationIds` | `bytes32[]` | mảng | RestaurantOrder |
| 26 | 0 | `mIdToPayment` | `mapping(bytes32 => struct Payment)` | mapping | RestaurantOrder |
| 27 | 0 | `mIdToPaymentInformation` | `mapping(bytes32 => struct PaymentInformation)` | mapping | RestaurantOrder |
| 28 | 0 | `paymentCourses` | `mapping(bytes32 => struct SimpleCourse[])` | mapping | RestaurantOrder |
| 29 | 0 | `reviews` | `mapping(bytes32 => struct Review)` | mapping | RestaurantOrder |
| 30 | 0 | `mDishCodeToReviews` | `mapping(string => struct DishReview[])` | mapping | RestaurantOrder |
| 31 | 0 | `customerDishCounts` | `mapping(address => mapping(string => uint256))` | mapping | RestaurantOrder |
| 32 | 0 | `usedTxIds` | `mapping(string => bool)` | mapping | RestaurantOrder |
| 33 | 0 | `mOrderIdToCourses` | `mapping(bytes32 => struct SimpleCourse[])` | mapping | RestaurantOrder |
| 34 | 0 | `orderPrimaryStaff` | `mapping(bytes32 => address)` | mapping | RestaurantOrder |
| 35 | 0 | `orderStaffHistory` | `mapping(bytes32 => address[])` | mapping | RestaurantOrder |
| 36 | 0 | `orderStaffShare` | `mapping(bytes32 => mapping(address => uint8))` | mapping | RestaurantOrder |
| 37 | 0 | `pendingTransfers` | `mapping(bytes32 => struct TransferRequest[])` | mapping | RestaurantOrder |
| 38 | 0 | `hasTransferRequest` | `mapping(bytes32 => mapping(address => bool))` | mapping | RestaurantOrder |
| 39 | 0 | `staffActiveOrders` | `mapping(address => bytes32[])` | mapping | RestaurantOrder |
| 40 | 0 | `orderAcknowledged` | `mapping(bytes32 => bool)` | mapping | RestaurantOrder |
| 41 | 0 | `orderHistories` | `mapping(bytes32 => struct OrderHistory[])` | mapping | RestaurantOrder |
| 42 | 0 | `orderHistoryCounter` | `uint256` | scalar | RestaurantOrder |
| 43 | 0 | `allPaymentIds` | `bytes32[]` | mảng | RestaurantOrder |
| 44 | 0 | `paymentHistory` | `struct Payment[]` | mảng | RestaurantOrder |
| 45 | 0 | `paymentInfoHistory` | `struct PaymentInformation[]` | mảng | RestaurantOrder |
| 46 | 0 | `customerProfiles` | `mapping(bytes32 => struct CustomerProfile)` | mapping | RestaurantOrder |
| 47 | 0 | `mTimeToGroupFeature` | `mapping(uint256 => struct RestaurantOrder.GroupFeature)` | mapping | RestaurantOrder |
| 48 | 0 | `allOrders` | `struct Order[]` | mảng | RestaurantOrder |
| 49 | 0 | `noti` | `contract INoti` | scalar | RestaurantOrder |
| 50 | 0 | `mDishReviewIndex` | `mapping(string => mapping(bytes32 => uint256))` | mapping | RestaurantOrder |
| 51 | 0 | `Report` | `contract IRestaurantReporting` | scalar | RestaurantOrder |
| 52 | 0 | `reviewsByDate` | `mapping(uint256 => struct Review[])` | mapping | RestaurantOrder |
| 53 | 0 | `mOrderIdToOrder` | `mapping(bytes32 => struct Order)` | mapping | RestaurantOrder |
| 54 | 0 | `iqrAgentSC` | `address` | scalar | RestaurantOrder |
| 55 | 0 | `agent` | `address` | scalar | RestaurantOrder |
| 56 | 0 | `revenueSC` | `address` | scalar | RestaurantOrder |
| 57 | 0 | `POINTS` | `contract IPoint` | scalar | RestaurantOrder |
| 58 | 0 | `paymentPointsUsed` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 59 | 0 | `reviewsByMonth` | `mapping(uint256 => struct Review[])` | mapping | RestaurantOrder |
| 60 | 0 | `numberOfVisit` | `mapping(address => uint256)` | mapping | RestaurantOrder |
| 61 | 0 | `paymentHistories` | `mapping(bytes32 => struct OrderHistory[])` | mapping | RestaurantOrder |
| 62 | 0 | `ICARD_VISA` | `contract ICardTokenManager` | scalar | RestaurantOrder |
| 63 | 0 | `paymentWalletUsed` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 64 | 0 | `paymentPointsRefunded` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 65 | 0 | `paymentWalletRefunded` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 66 | 0 | `paymentRewardVoucherCode` | `mapping(bytes32 => string)` | mapping | RestaurantOrder |
| 67 | 0 | `paymentDiscountPromotionId` | `mapping(bytes32 => bytes32)` | mapping | RestaurantOrder |
| 68 | 0 | `paymentRewardVoucherInstanceId` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 69 | 0 | `orderStatusCount` | `mapping(uint8 => uint256)` | mapping | RestaurantOrder |
| 70 | 0 | `dashboardPaymentBuckets` | `mapping(uint8 => mapping(uint256 => struct RestaurantOrder.DashboardPaymentBucket))` | mapping | RestaurantOrder |
| 71 | 0 | `dashboardPaymentHistoryIndex` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 72 | 0 | `dashboardPaymentHistoryKnown` | `mapping(bytes32 => bool)` | mapping | RestaurantOrder |
| 73 | 0 | `dashboardPaymentIndexedStatus` | `mapping(bytes32 => uint8)` | mapping | RestaurantOrder |
| 74 | 0 | `orderIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 75 | 0 | `sessionOrderIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 76 | 0 | `orderIdsByStatus` | `mapping(uint8 => bytes32[])` | mapping | RestaurantOrder |
| 77 | 0 | `orderStatusIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 78 | 0 | `pendingTransferIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | RestaurantOrder |
| 79 | 0 | `staffActiveOrderIndexPlusOne` | `mapping(address => mapping(bytes32 => uint256))` | mapping | RestaurantOrder |
| 80 | 0 | `orderCourseIndexPlusOne` | `mapping(bytes32 => mapping(uint256 => uint256))` | mapping | RestaurantOrder |
| 81 | 0 | `paymentCourseIndexPlusOne` | `mapping(bytes32 => mapping(uint256 => uint256))` | mapping | RestaurantOrder |
| 82 | 0 | `sessionPaymentIndexPlusOne` | `mapping(bytes32 => mapping(bytes32 => uint256))` | mapping | RestaurantOrder |
| 83 | 0 | `pendingTransferIndexesReady` | `mapping(bytes32 => bool)` | mapping | RestaurantOrder |
| 84 | 0 | `staffActiveOrderIndexesReady` | `mapping(address => bool)` | mapping | RestaurantOrder |
| 85 | 0 | `orderCourseIndexesReady` | `mapping(bytes32 => bool)` | mapping | RestaurantOrder |
| 86 | 0 | `paymentCourseIndexesReady` | `mapping(bytes32 => bool)` | mapping | RestaurantOrder |
| 87 | 0 | `sessionPaymentIndexesReady` | `mapping(bytes32 => bool)` | mapping | RestaurantOrder |
| 88 | 0 | `enableOrderDismissBroadcast` | `bool` | scalar | RestaurantOrder |
| 89 | 0 | `paymentPromoCustomer` | `mapping(bytes32 => address)` | mapping | RestaurantOrder |
| 90 | 0 | `paymentDiscountReleased` | `mapping(bytes32 => bool)` | mapping | RestaurantOrder |
