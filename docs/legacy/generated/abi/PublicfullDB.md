# PublicfullDB — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (68)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `ACT_CREDIT()` | `5668bcc7` | đọc (view) | `bytes32` |
| `ACT_DEBIT()` | `20b1a937` | đọc (view) | `bytes32` |
| `ACT_EXPIRE()` | `63db9d29` | đọc (view) | `bytes32` |
| `ACT_GRANT()` | `eb1a43cb` | đọc (view) | `bytes32` |
| `FOOD_MODULE()` | `58c5ef32` | đọc (view) | `bytes32` |
| `NET_MODULE()` | `80e260a6` | đọc (view) | `bytes32` |
| `TOKEN_A()` | `ff709ee8` | đọc (view) | `bytes32` |
| `TOKEN_B()` | `499f712e` | đọc (view) | `bytes32` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `addValueDocument(string,uint256,uint256,string,bool)` | `6b5bf7c8` | ghi (nonpayable) | `uint256` |
| `agentInitialised(address)` | `2d3e0d79` | đọc (view) | `bool` |
| `agentMaxTxId(address)` | `edb4f251` | đọc (view) | `uint256` |
| `commit(string)` | `9867db74` | ghi (nonpayable) | `bool` |
| `commitAll(address)` | `d905681d` | ghi (nonpayable) | `` |
| `decodeLoyaltyTxRecord(bytes)` | `9ab9278f` | đọc (pure) | `tuple` |
| `deleteDocument(string,uint256)` | `8792b6e2` | ghi (nonpayable) | `bool` |
| `fullDB()` | `7f8225e8` | đọc (view) | `address` |
| `getDataDocument(string,uint256)` | `3e7c7f8b` | ghi (nonpayable) | `string` |
| `getDbNames(address)` | `6f0afc12` | đọc (pure) | `string,string` |
| `getOrCreateDb(string)` | `fbdddaf0` | ghi (nonpayable) | `bool` |
| `getPointHistoryByAction(address,address,bytes32,uint64,uint64)` | `7a2148ce` | đọc (view) | `tuple` |
| `getPointHistoryByBalanceRange(address,address,string,string,uint64,uint64)` | `d6c2fe4f` | đọc (view) | `tuple` |
| `getPointHistoryByBranch(address,uint256,uint64,uint64)` | `636ac4cd` | đọc (view) | `bytes[],uint256` |
| `getPointHistoryByMember(address,address,uint64,uint64)` | `21662030` | đọc (view) | `tuple` |
| `getPointHistoryByMemberAndBranch(address,address,uint256,uint64,uint64)` | `7d149e63` | đọc (view) | `tuple` |
| `getPointHistoryByMemberAndModule(address,address,bytes32,uint64,uint64)` | `ccae300a` | đọc (view) | `tuple` |
| `getPointHistoryByTokenAndAction(address,address,bytes32,bytes32,uint64,uint64)` | `15a01a38` | đọc (view) | `tuple` |
| `getPointHistoryByTokenType(address,address,bytes32,uint64,uint64)` | `0f28e1fd` | đọc (view) | `tuple` |
| `getPointHistoryRecordByDocId(address,uint256)` | `501872c6` | ghi (nonpayable) | `bytes` |
| `getTermsDocument(string,uint256)` | `8b2cfdbe` | ghi (nonpayable) | `string[]` |
| `getTransactionByDocId(address,uint256)` | `eca36fbc` | ghi (nonpayable) | `bytes` |
| `getTxsByBranch(address,uint256,uint64,uint64)` | `5335e4bf` | đọc (view) | `tuple` |
| `getTxsByBranchAndAmountRange(address,uint256,string,string,uint64,uint64)` | `fcfcb57e` | đọc (view) | `tuple` |
| `getTxsByBranchAndModule(address,uint256,bytes32,uint64,uint64)` | `c504404a` | đọc (view) | `tuple` |
| `getTxsByBranchAndTimeRange(address,uint256,string,string,uint64,uint64)` | `66099ddb` | đọc (view) | `tuple` |
| `getTxsByMember(address,address,uint64,uint64)` | `031a82b8` | đọc (view) | `tuple` |
| `getTxsByMemberAndBranch(address,address,uint256,uint64,uint64)` | `3c655952` | đọc (view) | `tuple` |
| `getTxsByMemberAndModule(address,address,bytes32,uint64,uint64)` | `2652bb5d` | đọc (view) | `tuple` |
| `getTxsByMemberAndType(address,address,string,string,string,uint64,uint64)` | `698e7313` | đọc (view) | `tuple` |
| `getTxsByModule(address,bytes32,uint64,uint64)` | `4dc37573` | đọc (view) | `tuple` |
| `getTxsByTimeRange(address,string,string,uint64,uint64)` | `dee02d7b` | đọc (view) | `tuple` |
| `getValueDocument(string,uint256,uint256,bool)` | `71c10832` | ghi (nonpayable) | `string` |
| `indexTextForDocument(string,uint256,string,uint8,string)` | `1736f270` | ghi (nonpayable) | `uint256` |
| `initAgentDbs(address)` | `262b9a5f` | ghi (nonpayable) | `` |
| `initialize()` | `8129fc1c` | ghi (nonpayable) | `` |
| `isAllowedCaller(address)` | `a6801258` | đọc (view) | `bool` |
| `loyaltyByAgent(address)` | `bb5bebb1` | đọc (view) | `address` |
| `loyaltyContract()` | `1ed24e20` | đọc (view) | `address` |
| `newDocument(string,string)` | `1a148644` | ghi (nonpayable) | `uint256` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `pointHistoryDbName(address)` | `f883eac4` | đọc (pure) | `string` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `querySearch(string,tuple)` | `` | ghi (nonpayable) | `tuple` |
| `recordTxMeta(address,uint256,uint256,bytes32)` | `634757b1` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setAgentLoyalty(address,address)` | `ab646e01` | ghi (nonpayable) | `` |
| `setDataDocument(string,uint256,string)` | `015c2216` | ghi (nonpayable) | `uint256` |
| `setLoyaltyContract(address)` | `fbb026b8` | ghi (nonpayable) | `` |
| `syncMember(address,address,bytes32,bytes32,int256,uint256,uint256,uint256,uint256,bytes32,bytes32)` | `7f13e39a` | ghi (nonpayable) | `` |
| `syncTransaction(address,uint256,address,string,int256,uint256,bytes32,string,uint256,uint256,bytes32)` | `7fff13e5` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `txBranchId(address,uint256)` | `1f250261` | đọc (view) | `uint256` |
| `txDocId(address,uint256)` | `af35c9e0` | đọc (view) | `uint256` |
| `txIdByDocId(address,uint256)` | `943ae2c3` | đọc (view) | `uint256` |
| `txModule(address,uint256)` | `e2724e77` | đọc (view) | `bytes32` |
| `txsDbName(address)` | `62e68eff` | đọc (pure) | `string` |
| `updateFullDB(address)` | `187412d4` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (8)

| Event |
|---|
| `AgentDbsInitialised(address,string,string)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `PointHistorySynced(address,address,bytes32,bytes32,int256,uint256,uint256)` |
| `QuerySearchResults(uint256,uint256)` |
| `TransactionSyncDocConflict(address,uint256,uint256,uint256)` |
| `TransactionSynced(address,uint256,uint256,uint256,bytes32)` |
| `Upgraded(address)` |
