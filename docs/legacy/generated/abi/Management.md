# Management — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (227)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `BatchAddOptionToDish(string,bytes32[])` | `1340bb3c` | ghi (nonpayable) | `` |
| `BatchUpdateTopDish(string[])` | `324a3478` | ghi (nonpayable) | `` |
| `BatchUpdateTopDishOptimal(string[])` | `49f1e7cf` | ghi (nonpayable) | `` |
| `CalculateAndValidateOptions(string,tuple[])` | `` | đọc (view) | `uint256,tuple[]` |
| `CalculateOrder(tuple[])` | `` | đọc (view) | `uint256,tuple[]` |
| `CreateBanner(string,string,string,string,bool,uint256,uint256,uint8,uint8)` | `12d095a5` | ghi (nonpayable) | `uint256` |
| `CreateCategory(tuple)` | `` | ghi (nonpayable) | `` |
| `CreateDigitalMenu(string,string)` | `d28b94d9` | ghi (nonpayable) | `` |
| `CreateDiscount(bytes32,string,string,uint256,string,uint256,uint256,bool,string,uint256,uint8,bytes32[],string,uint256,uint256)` | `666cf324` | ghi (nonpayable) | `` |
| `CreateDish(string,tuple,tuple[],bytes32[])` | `` | ghi (nonpayable) | `` |
| `CreateDishOptions(string,string[],uint256[],bool,uint256)` | `a3b5e7b0` | ghi (nonpayable) | `bytes32` |
| `CreateTC(string,string,uint8)` | `ed35ccd6` | ghi (nonpayable) | `uint256` |
| `CreateUniform(string,string,string)` | `b60e7504` | ghi (nonpayable) | `uint256` |
| `DeleteDishOption(bytes32)` | `de4ab420` | ghi (nonpayable) | `` |
| `DeleteDishOptionFromDishCode(string,bytes32)` | `a7e46379` | ghi (nonpayable) | `` |
| `Get5TopDishesByTime(uint256,bool)` | `82cf1675` | đọc (view) | `tuple[],uint256` |
| `GetAllDiscounts()` | `5860b968` | đọc (view) | `tuple[]` |
| `GetAllDiscountsPagination(uint256,uint256)` | `791629f6` | đọc (view) | `tuple[],uint256` |
| `GetAllDishCodes()` | `a6de997f` | đọc (view) | `string[]` |
| `GetAllDishInfosByCat(string)` | `9d3e1133` | đọc (view) | `tuple[]` |
| `GetAllDishOptions()` | `38f4ed92` | đọc (view) | `tuple[]` |
| `GetAllDishOptionsFromDishCode(string)` | `f339d0bf` | đọc (view) | `tuple[]` |
| `GetAllDishOptionsFromDishCodePagination(string,uint256,uint256)` | `3a0fc001` | đọc (view) | `tuple[],uint256` |
| `GetAllDishOptionsPagination(uint256,uint256)` | `071b81f3` | đọc (view) | `tuple[],uint256` |
| `GetAllDishesPagination(uint256,uint256)` | `8e5087dc` | đọc (view) | `tuple[],uint256` |
| `GetAutoDiscountsTypeAllForUser(address)` | `ee6f404a` | đọc (view) | `tuple[]` |
| `GetBannersPagination(uint256,uint256)` | `a75a7cb5` | đọc (view) | `tuple[],uint256` |
| `GetCategories()` | `4300a4d5` | đọc (view) | `tuple[]` |
| `GetCategoriesPagination(uint256,uint256)` | `0ccd3211` | đọc (view) | `tuple[],uint256[],uint256` |
| `GetCategory(string)` | `9af5f03f` | đọc (view) | `tuple` |
| `GetDiscount(bytes32)` | `28749122` | đọc (view) | `tuple` |
| `GetDiscountBasic(bytes32)` | `2ad30b69` | đọc (view) | `uint256,bool,uint256,uint256,uint256,uint256,uint8,bytes32[],uint256,uint256` |
| `GetDish(string)` | `8e0747d0` | đọc (view) | `tuple` |
| `GetDishBasic(string)` | `e713e8bd` | đọc (view) | `string,bool,bool,string` |
| `GetDishCount()` | `0ecf5d24` | đọc (view) | `uint256` |
| `GetDishInfosByCat(string,uint256,uint256)` | `dcf2a30f` | đọc (view) | `tuple[],uint256` |
| `GetDishOptionById(bytes32)` | `aa2732c7` | đọc (view) | `tuple` |
| `GetDishes(string)` | `d3dcf7d0` | đọc (view) | `tuple[]` |
| `GetNewDishes()` | `7aacbe99` | đọc (view) | `tuple[]` |
| `GetNewDishesWithLimit(uint256,uint256)` | `9ef352b6` | đọc (view) | `tuple[],uint256` |
| `GetRanksCreatedTimes(string,uint256,uint256)` | `11308cd3` | đọc (view) | `tuple[],uint256` |
| `GetRecentDishes(uint256,uint256)` | `84a8bf18` | đọc (view) | `string[]` |
| `GetRestaurantInfo()` | `6f4a3c1d` | đọc (view) | `tuple` |
| `GetTopDishesWithLimit(uint256,uint256)` | `ba03f808` | ghi (nonpayable) | `tuple[],uint256` |
| `GetUniformsPagination(uint256,uint256)` | `d7ff3002` | đọc (view) | `tuple[],uint256` |
| `GetVoucherReport(uint256,uint256)` | `ed2a3442` | đọc (view) | `tuple` |
| `GetVoucherStats()` | `ec0cea43` | đọc (view) | `uint256,uint256,uint256` |
| `GetVoucherUseHistory(uint256,uint256)` | `eb934bcf` | đọc (view) | `tuple[],uint256` |
| `MAX_ATTRIBUTES_PER_VARIANT()` | `09e11f7f` | đọc (view) | `uint256` |
| `MAX_BATCH_UPDATE_SIZE()` | `84482689` | đọc (view) | `uint256` |
| `MAX_DISHES_PER_CATEGORY()` | `fe72b4b5` | đọc (view) | `uint256` |
| `MAX_INGREDIENTS_PER_DISH()` | `663a618e` | đọc (view) | `uint256` |
| `MAX_SEARCH_RESULTS()` | `9e1fdc0a` | đọc (view) | `uint256` |
| `MAX_VARIANTS_PER_DISH()` | `40a0fef8` | đọc (view) | `uint256` |
| `POINTS()` | `7f6e4281` | đọc (view) | `address` |
| `RegisterRestaurantInfo(string,string,string,string,address,uint256,string)` | `7dbac6fe` | ghi (nonpayable) | `` |
| `ReleaseDiscountCodeUsed(bytes32,address)` | `930e465b` | ghi (nonpayable) | `bool` |
| `RemoveBanner(uint256)` | `9c15b847` | ghi (nonpayable) | `` |
| `RemoveCategory(string)` | `59063e0b` | ghi (nonpayable) | `` |
| `RemoveDigitalMenu(uint256)` | `a2b24f23` | ghi (nonpayable) | `` |
| `RemoveDiscount(bytes32)` | `03aa6ef5` | ghi (nonpayable) | `` |
| `RemoveDish(string,string)` | `56e9bcba` | ghi (nonpayable) | `` |
| `RemoveTC(uint256)` | `497c0196` | ghi (nonpayable) | `` |
| `RemoveUniform(uint256)` | `b7254033` | ghi (nonpayable) | `` |
| `ResolveDiscountByCodeHash(bytes32)` | `d005ab4e` | đọc (view) | `bytes32,uint256,bool,uint256,uint256,uint256,uint256,uint8,bytes32[],uint256,uint256` |
| `SearchCustomerByVector(int256[])` | `ace72cda` | ghi (nonpayable) | `tuple` |
| `SortDishesWithOrderRange(uint256,uint256)` | `9b5035bf` | ghi (nonpayable) | `` |
| `UpdateBanner(string,string,string,string,bool,uint256,uint256,uint8,uint256)` | `f1b305a4` | ghi (nonpayable) | `` |
| `UpdateCategory(string,string,uint256,string,bool,string,string)` | `967bbd01` | ghi (nonpayable) | `bool` |
| `UpdateDiscount(bytes32,string,uint256,string,uint256,uint256,bool,string,uint256,uint8,bytes32[],string,uint256,uint256)` | `7a8e0270` | ghi (nonpayable) | `` |
| `UpdateDiscountCodeUsed(bytes32,address)` | `62327858` | ghi (nonpayable) | `` |
| `UpdateDish(string,string,string,string,string,bool,bool,string,uint256,bool,string,tuple[],string[])` | `` | ghi (nonpayable) | `bool` |
| `UpdateDishStatus(string,string,bool)` | `8b220372` | ghi (nonpayable) | `bool` |
| `UpdateOrderNum(string,uint256,uint256)` | `7f16205a` | ghi (nonpayable) | `` |
| `UpdateProductPrice(string,bytes32,uint256)` | `3aac33c6` | ghi (nonpayable) | `` |
| `UpdateRankDishes()` | `b7fdaae0` | ghi (nonpayable) | `` |
| `UpdateRestaurantInfo(string,string,string,string,address,string,uint256)` | `db8c3e41` | ghi (nonpayable) | `` |
| `UpdateTC(string,string,uint8,uint256)` | `43e871fb` | ghi (nonpayable) | `` |
| `UpdateTopDish()` | `6117294c` | ghi (nonpayable) | `` |
| `UpdateTotalCustomerReport(uint256,uint256)` | `198b1281` | ghi (nonpayable) | `` |
| `UpdateTotalRevenueReport(uint256,uint256)` | `b2a4e630` | ghi (nonpayable) | `` |
| `UpdateUniform(string,string,string,uint256)` | `965bfd30` | ghi (nonpayable) | `` |
| `UploadCustomerInfo(tuple,int256[])` | `` | ghi (nonpayable) | `bool,uint256` |
| `VECTOR_DIM()` | `56e43fc1` | đọc (view) | `uint256` |
| `active()` | `02fb0c5e` | đọc (view) | `bool` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `agentIQRSC()` | `cb3344c4` | đọc (view) | `address` |
| `allDishCodes(uint256)` | `72757934` | đọc (view) | `string` |
| `allDishOptionIndexPlusOne(bytes32)` | `2eab9ae5` | đọc (view) | `uint256` |
| `allDishOptions(uint256)` | `747f9d98` | đọc (view) | `bytes32,string,bool,uint256` |
| `allOptionNameIndexPlusOne(bytes32)` | `a6dc2750` | đọc (view) | `uint256` |
| `allOptionNames(uint256)` | `77cd711e` | đọc (view) | `string` |
| `banners(uint256)` | `8f7695ef` | đọc (view) | `uint256,string,string,string,string,bool,uint256,uint256,uint8` |
| `batchUpdateOrderNum(string[],uint256[],uint256)` | `2f2eeb22` | ghi (nonpayable) | `` |
| `branchAccessManager()` | `1f75eab0` | đọc (view) | `address` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `branchManagement()` | `3f8bc0b9` | đọc (view) | `address` |
| `branchPaymentRegistry()` | `fae1b366` | đọc (view) | `address` |
| `branchResourceRegistry()` | `0700b7ce` | đọc (view) | `address` |
| `categories(uint256)` | `c6cdbe5e` | đọc (view) | `string,string,uint256,string,bool,string,string` |
| `categoryDishIndexPlusOne(bytes32,bytes32)` | `c64b2993` | đọc (view) | `uint256` |
| `categoryIndexPlusOne(bytes32)` | `54364c9f` | đọc (view) | `uint256` |
| `checkShowOption(string)` | `a974f225` | đọc (view) | `bool` |
| `clearDiscountCatalog()` | `48be601f` | ghi (nonpayable) | `` |
| `connectToDB(address)` | `84edb1d3` | ghi (nonpayable) | `` |
| `dbWrapper()` | `fd2f1044` | đọc (view) | `address` |
| `decreaseDishQuantity(string,uint256)` | `053abe35` | ghi (nonpayable) | `` |
| `digitalMenu(uint256)` | `ee8aaa7a` | đọc (view) | `uint256,string,string` |
| `discountCatalogVersion()` | `113c6e28` | đọc (view) | `uint256` |
| `discountCodeHashCatalogVersion(bytes32)` | `61e5403d` | đọc (view) | `uint256` |
| `discountIdCatalogVersion(bytes32)` | `496c9a66` | đọc (view) | `uint256` |
| `discountIds(uint256)` | `294c84dd` | đọc (view) | `bytes32` |
| `discountIndexPlusOne(bytes32)` | `101b1d87` | đọc (view) | `uint256` |
| `discountUserUsedCount(bytes32,address)` | `d8ac7749` | đọc (view) | `uint256` |
| `discounts(uint256)` | `bae6a690` | đọc (view) | `string,string,uint256,string,uint256,uint256,bool,string,uint256,uint256,uint256,uint8,string` |
| `dishActualQuantity(string)` | `48fc6052` | đọc (view) | `uint256` |
| `dishCodeIndex(string)` | `85ec3934` | đọc (view) | `uint256` |
| `dishDefaultQuantity(string)` | `15be5e27` | đọc (view) | `uint256` |
| `dishIsNew(string)` | `0e24e316` | đọc (view) | `bool` |
| `dishLastResetTime(string)` | `28d0580f` | đọc (view) | `uint256` |
| `dishOptionIndexPlusOne(bytes32,bytes32)` | `6c86fe44` | đọc (view) | `uint256` |
| `dishOptionNameIndexPlusOne(bytes32,bytes32)` | `495d4c7d` | đọc (view) | `uint256` |
| `dishOrderIndex(string)` | `d50d3bb2` | đọc (view) | `uint256` |
| `dishResetSchedule()` | `7f914a72` | đọc (view) | `uint8,uint256,uint256` |
| `dishStartTime(string)` | `186ea776` | đọc (view) | `uint256` |
| `dishTotalOrders(string)` | `f83f31c9` | đọc (view) | `uint256` |
| `dishTotalRevenue(string)` | `cada6084` | đọc (view) | `uint256` |
| `dishesWithOrder(uint256)` | `14453fd7` | đọc (view) | `tuple,uint256,uint256,tuple` |
| `getABanner(uint256)` | `fb3497e8` | đọc (view) | `tuple` |
| `getADigitalMenu(uint256)` | `df890d46` | đọc (view) | `tuple` |
| `getATC(uint256)` | `a2453b6e` | đọc (view) | `tuple` |
| `getAUniform(uint256)` | `ef7ed685` | đọc (view) | `tuple` |
| `getAccountBank()` | `33b167d2` | đọc (view) | `bytes` |
| `getAllDishInfo()` | `27ade1cf` | đọc (view) | `tuple[]` |
| `getAllOptionNames()` | `cb3751ce` | đọc (view) | `string[]` |
| `getBanners()` | `1270f00b` | đọc (view) | `tuple[]` |
| `getDigitalMenu()` | `1dc166f5` | đọc (view) | `tuple[]` |
| `getDiscountUserUsed(bytes32,address)` | `30ed5219` | đọc (view) | `uint256` |
| `getDishInfo(string)` | `46c6b2a6` | đọc (view) | `tuple` |
| `getDishOrderIndex(string)` | `fce25167` | đọc (view) | `uint256` |
| `getDishQuantityInfo(string)` | `9272655b` | đọc (view) | `uint256,uint256,bool` |
| `getHistoryCustomersReportByTime(uint256,uint256,uint256,uint256)` | `f869dee5` | đọc (view) | `tuple[],uint256,bool` |
| `getHistoryOrderReportByTime(uint256,uint256,uint256,uint256)` | `9e053b47` | đọc (view) | `tuple[],uint256,bool` |
| `getHistoryRevenueReportByTime(uint256,uint256,uint256,uint256)` | `824b9495` | đọc (view) | `tuple[],uint256,bool` |
| `getOptionNameFromId(bytes32)` | `00aeb974` | đọc (view) | `string` |
| `getOptionNamesFromDishCode(string)` | `88ed3efa` | đọc (view) | `string[]` |
| `getPoints()` | `f4b7095b` | đọc (view) | `address` |
| `getTcs()` | `5c24a333` | đọc (view) | `tuple[]` |
| `getTcsPagination(uint256,uint256)` | `af70319e` | đọc (view) | `tuple[],uint256` |
| `getUniforms()` | `9840a946` | đọc (view) | `tuple[]` |
| `getVariant(string,bytes32)` | `1a013bef` | đọc (view) | `tuple` |
| `historyTracking()` | `1d32c1f3` | đọc (view) | `address` |
| `increaseDishQuantity(string,uint256)` | `b231e930` | ghi (nonpayable) | `` |
| `initialize()` | `8129fc1c` | ghi (nonpayable) | `` |
| `isCodeExist(string)` | `63a0e400` | đọc (view) | `bool` |
| `isOptionNameExist(string)` | `70c24f79` | đọc (view) | `bool` |
| `lastResetTime()` | `a2177124` | đọc (view) | `uint256` |
| `linkGG()` | `cb7c7583` | đọc (view) | `string` |
| `mAttribute(bytes32)` | `b5c3a9dc` | đọc (view) | `bytes32,string,string` |
| `mCategoryAttributes(string,uint256)` | `cab3d009` | đọc (view) | `bytes32` |
| `mCodeCatToDishes(string,uint256)` | `a97d00c7` | đọc (view) | `string,string,string,string,bool,bool,string,uint256,uint256,bool,string,uint256,uint256,uint256` |
| `mCodeHashToDiscountId(bytes32)` | `aaca5b53` | đọc (view) | `bytes32` |
| `mCodeToCat(string)` | `09ce21f5` | đọc (view) | `string,string,uint256,string,bool,string,string` |
| `mCodeToDiscount(string)` | `83a5d7f2` | đọc (view) | `string,string,uint256,string,uint256,uint256,bool,string,uint256,uint256,uint256,uint8,string` |
| `mCodeToDish(string)` | `89309c23` | đọc (view) | `string,string,string,string,bool,bool,string,uint256,uint256,bool,string,uint256,uint256,uint256` |
| `mDayToDishCode(uint256,string)` | `ebad6853` | đọc (view) | `bool` |
| `mDayToDishCodeOrder(uint256,uint256)` | `db8d4f99` | đọc (view) | `string` |
| `mDishCodeToFeatureIds(string,string,uint256)` | `623d50a1` | đọc (view) | `bytes32` |
| `mDishCodeToOptionNames(string,uint256)` | `af21be37` | đọc (view) | `string` |
| `mDishCodeToOptions(string,uint256)` | `8114ae06` | đọc (view) | `bytes32,string,bool,uint256` |
| `mDishCodeToRankReport(string,uint256)` | `7a2e6211` | đọc (view) | `uint256,uint256` |
| `mDishVariant(string,uint256)` | `bb7251ae` | đọc (view) | `bytes32` |
| `mIdToOption(bytes32)` | `a7b696c2` | đọc (view) | `bytes32,string,bool,uint256` |
| `mMonthToDishCode(uint256,string)` | `973eebbd` | đọc (view) | `bool` |
| `mMonthToDishCodeOrder(uint256,uint256)` | `73796f81` | đọc (view) | `string` |
| `mOptionIdToDishCodes(bytes32,uint256)` | `c3659b2a` | đọc (view) | `string` |
| `mVariant(string,bytes32)` | `1aac07f5` | đọc (view) | `bytes32,uint256` |
| `mVariantAttributes(string,bytes32,uint256)` | `b98bb5b2` | đọc (view) | `bytes32,string,string` |
| `optionDishIndexPlusOne(bytes32,bytes32)` | `636568c9` | đọc (view) | `uint256` |
| `orderDiscountCountedUser(bytes32)` | `6d16d9a4` | đọc (view) | `address` |
| `orderDiscountUserCounted(bytes32)` | `2d5a6e00` | đọc (view) | `uint256` |
| `orderDiscountUses(bytes32)` | `aa38ef18` | đọc (view) | `uint256` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `rebuildCategoryDishIndexes(string,uint256,uint256)` | `82b006e5` | ghi (nonpayable) | `uint256,bool` |
| `rebuildCategoryIndexes(uint256,uint256)` | `953249db` | ghi (nonpayable) | `uint256,bool` |
| `rebuildDiscountIndexes(uint256,uint256)` | `c4464afd` | ghi (nonpayable) | `uint256,bool` |
| `rebuildDishOptionIndexes(string,uint256,uint256)` | `c8fb858b` | ghi (nonpayable) | `uint256,bool` |
| `rebuildGlobalOptionIndexes(uint256,uint256)` | `a1832267` | ghi (nonpayable) | `uint256,bool` |
| `rebuildOptionDishIndexes(bytes32,uint256,uint256)` | `5b28bb8b` | ghi (nonpayable) | `uint256,bool` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `report()` | `2606a10b` | đọc (view) | `address` |
| `resetDishQuantities(string[],uint256,uint256)` | `d2d23999` | ghi (nonpayable) | `uint256,uint256` |
| `resetDishQuantitiesLegacy(string[])` | `bc6a0aee` | ghi (nonpayable) | `` |
| `resetSingleDishQuantity(string)` | `31fd9dfe` | ghi (nonpayable) | `` |
| `restaurantInfo()` | `14009812` | đọc (view) | `string,string,string,string,address,uint256,string,uint256,uint256` |
| `restaurantOrder()` | `e2c2207b` | đọc (view) | `address` |
| `serviceStartTime()` | `37ffc0ca` | đọc (view) | `uint256` |
| `setAccessManager(address,address,uint256)` | `6398ede7` | ghi (nonpayable) | `` |
| `setActive(bool)` | `acec338a` | ghi (nonpayable) | `` |
| `setAgentAdd(address,uint256)` | `f11b7dac` | ghi (nonpayable) | `` |
| `setAgentIqrSC(address)` | `fd87152e` | ghi (nonpayable) | `` |
| `setBranchManagement(address)` | `f913829d` | ghi (nonpayable) | `` |
| `setBranchPaymentRegistry(address)` | `1c6601cd` | ghi (nonpayable) | `` |
| `setBranchResourceRegistry(address)` | `9cdab8ad` | ghi (nonpayable) | `` |
| `setDishQuantity(string,uint256,uint256)` | `5102b7de` | ghi (nonpayable) | `` |
| `setDishResetSchedule(uint8)` | `d283f748` | ghi (nonpayable) | `` |
| `setHistoryTracking(address)` | `ad9ea445` | ghi (nonpayable) | `` |
| `setLinkGG(string)` | `3783d3c2` | ghi (nonpayable) | `` |
| `setPoints(address)` | `9f25cde7` | ghi (nonpayable) | `` |
| `setReport(address)` | `c65cfaea` | ghi (nonpayable) | `` |
| `setRestaurantOrder(address)` | `3ef3e360` | ghi (nonpayable) | `` |
| `setServiceStartTime(uint256)` | `07ab29e0` | ghi (nonpayable) | `` |
| `setStaffAgentStore(address)` | `fa228a9d` | ghi (nonpayable) | `` |
| `setTimeKeeping(address)` | `13eeb7fc` | ghi (nonpayable) | `` |
| `staffAgentStore()` | `5b722210` | đọc (view) | `address` |
| `syncDishRankingsToReport(uint256)` | `d6f18f03` | ghi (nonpayable) | `` |
| `tcs(uint256)` | `be62d337` | đọc (view) | `uint256,string,string,uint8` |
| `timeKeeping()` | `82691ba1` | đọc (view) | `address` |
| `totalCustomersDays(uint256)` | `89b4b6a6` | đọc (view) | `uint256,uint256` |
| `totalOrderDays(uint256)` | `57e03ecd` | đọc (view) | `uint256,uint256` |
| `totalRevenueDays(uint256)` | `471f6dd0` | đọc (view) | `uint256,uint256` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `uniforms(uint256)` | `8f66ac26` | đọc (view) | `uint256,string,string,string` |
| `updateAverageStarDish(uint8,string)` | `93ad9a96` | ghi (nonpayable) | `` |
| `updateDishOption(bytes32,string,string[],uint256[],bool,uint256)` | `7239936d` | ghi (nonpayable) | `` |
| `updateLastResetTime()` | `22685cf4` | ghi (nonpayable) | `` |
| `voucherUseHistory(uint256)` | `9f7958fc` | đọc (view) | `uint256,uint256,uint256,uint256` |

## Event (12)

| Event |
|---|
| `BranchPaymentRegistryUpdated(address,address)` |
| `BranchResourceRegistryUpdated(address,address)` |
| `CategoryRemoved(string,uint256,uint256,uint256)` |
| `DiscountCodeUseReleased(bytes32,address,address)` |
| `DishQuantityReset(address,string[],uint256)` |
| `DishQuantityUpdated(address,string,uint256,uint256)` |
| `DishRemoved(string,string)` |
| `DishResetScheduleUpdated(address,uint8)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `ProductPriceUpdated(address,string,bytes32,uint256,uint256)` |
| `UpdateDishStatusEvent(address,bool)` |
