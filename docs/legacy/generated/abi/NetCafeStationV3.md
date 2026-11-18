# NetCafeStationV3 — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (41)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MODULE_NET()` | `27a29fec` | đọc (view) | `bytes32` |
| `PERM_NET_ADMIN()` | `7e882a8e` | đọc (view) | `bytes32` |
| `PERM_NET_PAYMENT_MANAGE()` | `d209430a` | đọc (view) | `bytes32` |
| `PERM_NET_SESSION_MANAGE()` | `474e1a90` | đọc (view) | `bytes32` |
| `PERM_NET_SPEND_VIEW()` | `513f3574` | đọc (view) | `bytes32` |
| `PERM_NET_STATION_MANAGE()` | `8dd5009c` | đọc (view) | `bytes32` |
| `TOKEN_LOYALTY_A()` | `9dd8225b` | đọc (view) | `bytes32` |
| `TOKEN_VND()` | `3985837d` | đọc (view) | `bytes32` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `clearStationStatus(bytes32)` | `8f6aafdd` | ghi (nonpayable) | `` |
| `economyVault()` | `00ae9de5` | đọc (view) | `address` |
| `getPCbyAddress(address)` | `ada0e0b4` | đọc (view) | `bytes32` |
| `getStationsPaged(uint256,uint256)` | `e67e23cf` | đọc (view) | `tuple[]` |
| `getTotalOfflineStations()` | `fb8c8c9c` | đọc (view) | `uint256` |
| `getTotalOnlineStations()` | `5a9e1872` | đọc (view) | `uint256` |
| `getTotalStations()` | `cacea3b7` | đọc (view) | `uint256` |
| `initialize(address,address,uint256,address,address,address,address,address,address)` | `c166e1d6` | ghi (nonpayable) | `` |
| `isStationMaintenance(bytes32)` | `f92ee299` | đọc (view) | `bool` |
| `isStationOnline(bytes32)` | `8dbc1089` | đọc (view) | `bool` |
| `lastHeartbeatAt(bytes32)` | `a8e31ae9` | đọc (view) | `uint256` |
| `managementContract()` | `b3e5cc4a` | đọc (view) | `address` |
| `moduleRegistry()` | `b95459e4` | đọc (view) | `address` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `recordSessionCharge(bytes32,address)` | `38d167a3` | ghi (nonpayable) | `uint256` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `requireLogout(bytes32)` | `d474a6dc` | ghi (nonpayable) | `` |
| `sessionContract()` | `a6d861a7` | đọc (view) | `address` |
| `setEconomyVault(address)` | `c5818c04` | ghi (nonpayable) | `` |
| `setMaintenance(bytes32,bool)` | `2a203f24` | ghi (nonpayable) | `` |
| `setModuleContracts(address,address,address)` | `0c36ad14` | ghi (nonpayable) | `` |
| `setRemoteControl(bytes32,bool)` | `d763fb2e` | ghi (nonpayable) | `` |
| `setSharedRegistries(address,address)` | `a6c4d3e9` | ghi (nonpayable) | `` |
| `setStatus(address,bytes32)` | `542f59b5` | ghi (nonpayable) | `` |
| `stations(bytes32)` | `f5777cec` | đọc (view) | `bytes32,bytes32,string,bytes32,uint256,address,address,string,bool,uint256,bool,bool` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `updateAccountBalance(bytes32,address)` | `9a8153a2` | ghi (nonpayable) | `uint256` |
| `userContract()` | `5000596b` | đọc (view) | `address` |
| `userToPcId(address)` | `37bd4c1c` | đọc (view) | `bytes32` |

## Event (10)

| Event |
|---|
| `AccountBalanceUpdated(bytes32,address,uint256)` |
| `EconomyVaultUpdated(address)` |
| `Initialized(uint64)` |
| `ModuleContractUpdated(bytes32,address)` |
| `OwnershipTransferred(address,address)` |
| `RequiredLogout(address,bytes32)` |
| `SharedRegistryUpdated(address,address,address)` |
| `StationMaintenanceSet(bytes32,bool)` |
| `StationRemoteControlSet(bytes32,bool)` |
| `StationStatusChanged(address,bytes32,bool)` |
