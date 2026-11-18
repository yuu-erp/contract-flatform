# NetCafeManagementV3 — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (48)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MODULE_NET()` | `27a29fec` | đọc (view) | `bytes32` |
| `PERM_NET_ADMIN()` | `7e882a8e` | đọc (view) | `bytes32` |
| `PERM_NET_PAYMENT_MANAGE()` | `d209430a` | đọc (view) | `bytes32` |
| `PERM_NET_SESSION_MANAGE()` | `474e1a90` | đọc (view) | `bytes32` |
| `PERM_NET_SPEND_VIEW()` | `513f3574` | đọc (view) | `bytes32` |
| `PERM_NET_STATION_MANAGE()` | `8dd5009c` | đọc (view) | `bytes32` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `addGroup(bytes32,string,bytes32,bytes32[],string)` | `4f8d3d93` | ghi (nonpayable) | `` |
| `addPricePolicy(bytes32,uint256,string)` | `70d4258a` | ghi (nonpayable) | `` |
| `addStation(bytes32,bytes32,string,bytes32,string,string,string)` | `879cf3ff` | ghi (nonpayable) | `` |
| `addWifi(bytes32,string,string)` | `2ca09a56` | ghi (nonpayable) | `` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `coOwners(address)` | `a1429b02` | đọc (view) | `bool` |
| `deleteGroup(bytes32)` | `e57097c9` | ghi (nonpayable) | `` |
| `deletePricePolicy(bytes32)` | `019656ad` | ghi (nonpayable) | `` |
| `getGroupIdsPaged(uint256,uint256)` | `2c4f6145` | đọc (view) | `bytes32[],uint256` |
| `getGroupsPaged(uint256,uint256)` | `ce2988d9` | đọc (view) | `tuple[],uint256` |
| `getPricePoliciesPaged(uint256,uint256)` | `cfa25ed0` | đọc (view) | `tuple[],uint256` |
| `getPricePolicyIdsPaged(uint256,uint256)` | `b8503b70` | đọc (view) | `bytes32[],uint256` |
| `getStationCount()` | `4dcf743b` | đọc (view) | `uint256` |
| `getStationIds()` | `ffaf8514` | đọc (view) | `bytes32[]` |
| `getStationIdsPaged(uint256,uint256)` | `9fc16435` | đọc (view) | `bytes32[]` |
| `getStationMeta(bytes32)` | `28a8cd8b` | đọc (view) | `tuple` |
| `getStationPrice(bytes32)` | `752b5bd1` | đọc (view) | `uint256` |
| `getWifi()` | `85437625` | đọc (view) | `tuple` |
| `groupIds(uint256)` | `4093d7a1` | đọc (view) | `bytes32` |
| `groups(bytes32)` | `ef161bcb` | đọc (view) | `bytes32,string,bool,bytes32,uint256,string,bool` |
| `initialize(address,address,uint256,address,address,address)` | `ff9935cb` | ghi (nonpayable) | `` |
| `isPolicyInUse(bytes32)` | `e0dee0f6` | đọc (view) | `bool,string` |
| `moduleRegistry()` | `b95459e4` | đọc (view) | `address` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `pricePolicies(bytes32)` | `d4a5a372` | đọc (view) | `bytes32,uint256,string,bool,bool` |
| `pricePolicyIds(uint256)` | `7dab1780` | đọc (view) | `bytes32` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `resourceRegistry()` | `e1ed5124` | đọc (view) | `address` |
| `setActivePricePolicy(bytes32,bool)` | `25547bc3` | ghi (nonpayable) | `` |
| `setResourceRegistry(address)` | `67a51855` | ghi (nonpayable) | `` |
| `setRoleForCoOwner(address)` | `2b74d516` | ghi (nonpayable) | `` |
| `setSharedRegistries(address,address)` | `a6c4d3e9` | ghi (nonpayable) | `` |
| `stationIds(uint256)` | `e391daf9` | đọc (view) | `bytes32` |
| `stations(bytes32)` | `f5777cec` | đọc (view) | `bytes32,bytes32,string,bytes32,string,string,string,bool,bool` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `updateGroup(bytes32,string,bool,bytes32,bytes32[],string)` | `2cfbcf58` | ghi (nonpayable) | `` |
| `updatePricePolicy(bytes32,uint256,bool)` | `e63673a3` | ghi (nonpayable) | `` |
| `updateStation(bytes32,bytes32,string,bool,string,string,string)` | `6b11e8f5` | ghi (nonpayable) | `` |
| `updateWifi(bytes32,string,string)` | `2af6d652` | ghi (nonpayable) | `` |

## Event (18)

| Event |
|---|
| `CoOwnerRoleUpdated(address,bool)` |
| `GroupAdded(bytes32,string)` |
| `GroupDeleted(bytes32,string)` |
| `GroupUpdated(bytes32,string,bool)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `PricePolicyAdded(bytes32,uint256)` |
| `PricePolicyDeleted(bytes32)` |
| `PricePolicyStatusChanged(bytes32,bool)` |
| `PricePolicyUpdated(bytes32,uint256,bool)` |
| `ResourceRegistryUpdated(address)` |
| `SharedRegistryUpdated(address,address,address)` |
| `StationAdded(bytes32,bytes32,string)` |
| `StationAssigned(bytes32,bytes32)` |
| `StationRemoved(bytes32,bytes32)` |
| `StationUpdated(bytes32,bytes32,bool)` |
| `WifiAdded(bytes32,string)` |
| `WifiUpdated(bytes32,string)` |
