# Management — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/iqr/Management.sol`. Layout đầy đủ: `../../layout/Management.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `restaurantInfo` | `struct RestaurantInfo` | struct | Management |
| 9 | 0 | `restaurantOrder` | `address` | scalar | Management |
| 10 | 0 | `mCodeToCat` | `mapping(string => struct Category)` | mapping | Management |
| 11 | 0 | `categories` | `struct Category[]` | mảng | Management |
| 12 | 0 | `mCodeToDish` | `mapping(string => struct Dish)` | mapping | Management |
| 13 | 0 | `mCodeCatToDishes` | `mapping(string => struct Dish[])` | mapping | Management |
| 14 | 0 | `mCodeToDiscount` | `mapping(string => struct Discount)` | mapping | Management |
| 15 | 0 | `discounts` | `struct Discount[]` | mảng | Management |
| 16 | 0 | `isCodeExist` | `mapping(string => bool)` | mapping | Management |
| 17 | 0 | `mDishVariant` | `mapping(string => bytes32[])` | mapping | Management |
| 18 | 0 | `mVariant` | `mapping(string => mapping(bytes32 => struct Variant))` | mapping | Management |
| 19 | 0 | `mVariantAttributes` | `mapping(string => mapping(bytes32 => struct Attribute[]))` | mapping | Management |
| 20 | 0 | `mAttribute` | `mapping(bytes32 => struct Attribute)` | mapping | Management |
| 21 | 0 | `mCategoryAttributes` | `mapping(string => bytes32[])` | mapping | Management |
| 22 | 0 | `allDishCodes` | `string[]` | mảng | Management |
| 23 | 0 | `dishCodeIndex` | `mapping(string => uint256)` | mapping | Management |
| 24 | 0 | `dishIsNew` | `mapping(string => bool)` | mapping | Management |
| 25 | 0 | `dishTotalRevenue` | `mapping(string => uint256)` | mapping | Management |
| 26 | 0 | `dishTotalOrders` | `mapping(string => uint256)` | mapping | Management |
| 27 | 0 | `dishStartTime` | `mapping(string => uint256)` | mapping | Management |
| 28 | 0 | `serviceStartTime` | `uint256` | scalar | Management |
| 29 | 0 | `digitalMenu` | `struct DigitalMenu[]` | mảng | Management |
| 30 | 0 | `banners` | `struct Banner[]` | mảng | Management |
| 31 | 0 | `tcs` | `struct TCInfo[]` | mảng | Management |
| 32 | 0 | `uniforms` | `struct Uniform[]` | mảng | Management |
| 33 | 0 | `linkGG` | `string` | scalar | Management |
| 34 | 0 | `dishesWithOrder` | `struct DishWithOrder[]` | mảng | Management |
| 35 | 0 | `voucherUseHistory` | `struct VoucherUse[]` | mảng | Management |
| 36 | 0 | `totalCustomersDays` | `struct ChartTotalCustomers[]` | mảng | Management |
| 37 | 0 | `totalRevenueDays` | `struct ChartTotalRevenue[]` | mảng | Management |
| 38 | 0 | `mDayToDishCode` | `mapping(uint256 => mapping(string => bool))` | mapping | Management |
| 39 | 0 | `mMonthToDishCode` | `mapping(uint256 => mapping(string => bool))` | mapping | Management |
| 40 | 0 | `mMonthToDishCodeOrder` | `mapping(uint256 => string[])` | mapping | Management |
| 41 | 0 | `mDayToDishCodeOrder` | `mapping(uint256 => string[])` | mapping | Management |
| 42 | 0 | `report` | `address` | scalar | Management |
| 43 | 0 | `mDishCodeToRankReport` | `mapping(string => struct RankReport[])` | mapping | Management |
| 44 | 0 | `dishOrderIndex` | `mapping(string => uint256)` | mapping | Management |
| 45 | 0 | `mDishRemain` | `mapping(string => uint256)` | mapping | Management |
| 46 | 0 | `mIdToOption` | `mapping(bytes32 => struct DishOption)` | mapping | Management |
| 47 | 0 | `mDishCodeToFeatureIds` | `mapping(string => mapping(string => bytes32[]))` | mapping | Management |
| 48 | 0 | `mDishCodeToOptionNames` | `mapping(string => string[])` | mapping | Management |
| 49 | 0 | `mDishCodeToOptions` | `mapping(string => struct DishOption[])` | mapping | Management |
| 50 | 0 | `mOptionIdToDishCodes` | `mapping(bytes32 => string[])` | mapping | Management |
| 51 | 0 | `allDishOptions` | `struct DishOption[]` | mảng | Management |
| 52 | 0 | `allOptionNames` | `string[]` | mảng | Management |
| 53 | 0 | `isOptionNameExist` | `mapping(string => bool)` | mapping | Management |
| 54 | 0 | `active` | `bool` | scalar | Management |
| 54 | 1 | `agentIQRSC` | `address` | scalar | Management |
| 55 | 0 | `totalOrderDays` | `struct ChartTotalOrder[]` | mảng | Management |
| 56 | 0 | `timeKeeping` | `address` | scalar | Management |
| 57 | 0 | `POINTS` | `contract IPoint` | scalar | Management |
| 58 | 0 | `agent` | `address` | scalar | Management |
| 59 | 0 | `branchId` | `uint256` | scalar | Management |
| 60 | 0 | `branchAccessManager` | `contract IBranchAccessManager` | scalar | Management |
| 61 | 0 | `branchResourceRegistry` | `contract IBranchResourceRegistry` | scalar | Management |
| 62 | 0 | `branchPaymentRegistry` | `contract IBranchPaymentRegistry` | scalar | Management |
| 63 | 0 | `historyTracking` | `contract IHistoryTracking` | scalar | Management |
| 64 | 0 | `staffAgentStore` | `address` | scalar | Management |
| 65 | 0 | `branchManagement` | `address` | scalar | Management |
| 66 | 0 | `dbWrapper` | `contract PublicfullDB` | scalar | Management |
| 67 | 0 | `dishDefaultQuantity` | `mapping(string => uint256)` | mapping | Management |
| 68 | 0 | `dishActualQuantity` | `mapping(string => uint256)` | mapping | Management |
| 69 | 0 | `dishLastResetTime` | `mapping(string => uint256)` | mapping | Management |
| 70 | 0 | `lastResetTime` | `uint256` | scalar | Management |
| 71 | 0 | `dishResetSchedule` | `struct Management.DishResetSchedule` | struct | Management |
| 74 | 0 | `__gap` | `uint256[42]` | gap | Management |
| 116 | 0 | `mIdToDiscount` | `mapping(bytes32 => struct DiscountV2)` | mapping | Management |
| 117 | 0 | `mCodeHashToDiscountId` | `mapping(bytes32 => bytes32)` | mapping | Management |
| 118 | 0 | `discountUserUsedCount` | `mapping(bytes32 => mapping(address => uint256))` | mapping | Management |
| 119 | 0 | `discountIds` | `bytes32[]` | mảng | Management |
| 120 | 0 | `categoryIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | Management |
| 121 | 0 | `categoryDishIndexPlusOne` | `mapping(bytes32 => mapping(bytes32 => uint256))` | mapping | Management |
| 122 | 0 | `discountIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | Management |
| 123 | 0 | `discountCatalogVersion` | `uint256` | scalar | Management |
| 124 | 0 | `discountIdCatalogVersion` | `mapping(bytes32 => uint256)` | mapping | Management |
| 125 | 0 | `discountCodeHashCatalogVersion` | `mapping(bytes32 => uint256)` | mapping | Management |
| 126 | 0 | `allDishOptionIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | Management |
| 127 | 0 | `allOptionNameIndexPlusOne` | `mapping(bytes32 => uint256)` | mapping | Management |
| 128 | 0 | `dishOptionIndexPlusOne` | `mapping(bytes32 => mapping(bytes32 => uint256))` | mapping | Management |
| 129 | 0 | `dishOptionNameIndexPlusOne` | `mapping(bytes32 => mapping(bytes32 => uint256))` | mapping | Management |
| 130 | 0 | `optionDishIndexPlusOne` | `mapping(bytes32 => mapping(bytes32 => uint256))` | mapping | Management |
| 131 | 0 | `orderDiscountUses` | `mapping(bytes32 => uint256)` | mapping | Management |
| 132 | 0 | `orderDiscountUserCounted` | `mapping(bytes32 => uint256)` | mapping | Management |
| 133 | 0 | `orderDiscountCountedUser` | `mapping(bytes32 => address)` | mapping | Management |
