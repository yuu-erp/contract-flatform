# BranchResourceRegistry — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (68)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `AUDIT_AREA_UPDATED()` | `96c3dc10` | đọc (view) | `bytes32` |
| `AUDIT_RESOURCE_UPDATED()` | `ea359631` | đọc (view) | `bytes32` |
| `AUDIT_TABLE_UPDATED()` | `f2f81fad` | đọc (view) | `bytes32` |
| `DEFAULT_ADMIN_ROLE()` | `a217fddf` | đọc (view) | `bytes32` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `addArea(address,uint256,bytes32,bytes32,string)` | `6e3f6eb0` | ghi (nonpayable) | `` |
| `addResource(address,uint256,bytes32,bytes32,uint8,string,string,bool,bool)` | `8382f02b` | ghi (nonpayable) | `` |
| `areaIndexPlusOne(address,uint256,bytes32)` | `72760bde` | đọc (view) | `uint256` |
| `branchAuditTrail()` | `2a795848` | đọc (view) | `address` |
| `checkSessionIdFromTableMerge(address,uint256,uint256)` | `48af25f1` | đọc (view) | `bytes32` |
| `childAreaCount(address,uint256,bytes32)` | `3b975ccb` | đọc (view) | `uint256` |
| `clearTable(address,uint256,uint256,bytes32)` | `38915b61` | ghi (nonpayable) | `` |
| `createTable(address,uint256,bytes32,bytes32,string,string,uint256,uint256,bool,bool)` | `86a18d60` | ghi (nonpayable) | `` |
| `deleteArea(address,uint256,bytes32)` | `a90832bf` | ghi (nonpayable) | `` |
| `getAllAreas(address,uint256)` | `ef8e0e57` | đọc (view) | `tuple[]` |
| `getAllAreasPagination(address,uint256,uint256,uint256)` | `f5731dab` | đọc (view) | `tuple[],uint256` |
| `getAllTableResources(address,uint256)` | `aa9f1779` | đọc (view) | `tuple[],tuple[]` |
| `getAllTableResourcesPagination(address,uint256,uint256,uint256)` | `199e0a73` | đọc (view) | `tuple[],tuple[],uint256` |
| `getArea(address,uint256,bytes32)` | `c129dac6` | đọc (view) | `tuple` |
| `getAreaById(address,uint256,bytes32)` | `4be96987` | đọc (view) | `tuple` |
| `getAreaIds(address,uint256)` | `7230195d` | đọc (view) | `bytes32[]` |
| `getResource(address,uint256,bytes32)` | `e5e77483` | đọc (view) | `tuple` |
| `getResourceByNumber(address,uint256,uint256)` | `733ddca9` | đọc (view) | `tuple,tuple` |
| `getResourceIds(address,uint256)` | `15dae74b` | đọc (view) | `bytes32[]` |
| `getResourceIdsByArea(address,uint256,bytes32)` | `40d75246` | đọc (view) | `bytes32[]` |
| `getResourceIdsByType(address,uint256,uint8)` | `c53e2361` | đọc (view) | `bytes32[]` |
| `getRoleAdmin(bytes32)` | `248a9ca3` | đọc (view) | `bytes32` |
| `getTableByNumber(address,uint256,uint256)` | `0af50bfc` | đọc (view) | `tuple,tuple` |
| `getTableData(address,uint256,bytes32)` | `312d7602` | đọc (view) | `tuple` |
| `getTableResourceIdByNumber(address,uint256,uint256)` | `4de79cf8` | đọc (view) | `bytes32` |
| `getTableResourcesByArea(address,uint256,bytes32)` | `6cba50dd` | đọc (view) | `tuple[],tuple[]` |
| `getTableResourcesByAreaPagination(address,uint256,bytes32,uint256,uint256)` | `908bcdd8` | đọc (view) | `tuple[],tuple[],uint256` |
| `grantRole(bytes32,address)` | `2f2ff15d` | ghi (nonpayable) | `` |
| `hasRole(bytes32,address)` | `91d14854` | đọc (view) | `bool` |
| `initialize(address,address)` | `485cc955` | ghi (nonpayable) | `` |
| `isSessionAvailable(address,uint256,uint256,uint256)` | `3eeec9f9` | đọc (view) | `bool` |
| `mergeMoreTables(address,uint256,uint256[],uint256)` | `4a856c4c` | ghi (nonpayable) | `` |
| `mergeTables(address,uint256,uint256[],bytes32,uint8)` | `6364dcd3` | ghi (nonpayable) | `` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `rebuildResourceRegistryIndexes(address,uint256,uint256,uint256,uint256)` | `1c5e883a` | ghi (nonpayable) | `uint256,uint256,bool` |
| `removeResource(address,uint256,bytes32)` | `952cc883` | ghi (nonpayable) | `` |
| `removeTablesFromMerge(address,uint256,uint256[])` | `9236c654` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `renounceRole(bytes32,address)` | `36568abe` | ghi (nonpayable) | `` |
| `resourceActive(address,uint256,bytes32)` | `7097607f` | đọc (view) | `bool` |
| `resourceCountByArea(address,uint256,bytes32)` | `7bcc4bd3` | đọc (view) | `uint256` |
| `resourceExists(address,uint256,bytes32)` | `eb1bb314` | đọc (view) | `bool` |
| `resourceIndexPlusOne(address,uint256,bytes32)` | `8593eb45` | đọc (view) | `uint256` |
| `resourceSupportsNet(address,uint256,bytes32)` | `f5c43d2f` | đọc (view) | `bool` |
| `resourceSupportsOrdering(address,uint256,bytes32)` | `5784f23d` | đọc (view) | `bool` |
| `revokeRole(bytes32,address)` | `d547741f` | ghi (nonpayable) | `` |
| `separateTables(address,uint256,uint256[])` | `a26a57cc` | ghi (nonpayable) | `` |
| `setAccessManager(address)` | `c9580804` | ghi (nonpayable) | `` |
| `setBranchAuditTrail(address)` | `6b55acf2` | ghi (nonpayable) | `` |
| `setResourceActive(address,uint256,bytes32,bool)` | `d5ceae06` | ghi (nonpayable) | `` |
| `setResourceSupportsNet(address,uint256,bytes32,bool)` | `da010223` | ghi (nonpayable) | `` |
| `setResourceSupportsOrdering(address,uint256,bytes32,bool)` | `1636b12e` | ghi (nonpayable) | `` |
| `supportsInterface(bytes4)` | `01ffc9a7` | đọc (view) | `bool` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `transferTable(address,uint256,uint256,uint256)` | `a3949337` | ghi (nonpayable) | `` |
| `updateArea(address,uint256,bytes32,bytes32,string,bool)` | `7528c9b1` | ghi (nonpayable) | `` |
| `updateResource(address,uint256,bytes32,bytes32,uint8,string,string,bool,bool,bool)` | `c558cd1a` | ghi (nonpayable) | `` |
| `updateTable(address,uint256,bytes32,bytes32,string,string,uint256,uint256,bool,bool)` | `e4918f8e` | ghi (nonpayable) | `` |
| `updateTableFromOrder(address,uint256,uint256,bytes32)` | `a3a80091` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |
| `upsertTableData(address,uint256,bytes32,uint8,uint256,uint256,uint256,uint256,bytes32[])` | `7f509683` | ghi (nonpayable) | `` |

## Event (13)

| Event |
|---|
| `AccessManagerUpdated(address)` |
| `AreaAdded(address,uint256,bytes32,string)` |
| `AreaUpdated(address,uint256,bytes32,string,bool)` |
| `BranchAuditTrailUpdated(address)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `ResourceAdded(address,uint256,bytes32,bytes32,uint8,string)` |
| `ResourceUpdated(address,uint256,bytes32,bytes32,uint8,bool,bool,bool,string,string)` |
| `RoleAdminChanged(bytes32,bytes32,bytes32)` |
| `RoleGranted(bytes32,address,address)` |
| `RoleRevoked(bytes32,address,address)` |
| `TableDataUpdated(address,uint256,bytes32,uint8,uint256,uint256,uint256,uint256)` |
| `Upgraded(address)` |
