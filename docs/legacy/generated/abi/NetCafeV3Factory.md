# NetCafeV3Factory — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (27)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `createBranchNetCafe(address,uint256,address)` | `54bac30d` | ghi (nonpayable) | `tuple` |
| `currentImplementation()` | `d8bd5c29` | đọc (view) | `address,address,address,address,address,address,address` |
| `dashboardBeacon()` | `e9dca187` | đọc (view) | `address` |
| `dashboardFacade()` | `0e4bfff9` | đọc (view) | `address` |
| `getBranchNetCafeContracts(address,uint256)` | `397ac289` | đọc (view) | `tuple` |
| `initialize(address,tuple,tuple)` | `` | ghi (nonpayable) | `` |
| `managementBeacon()` | `d155a543` | đọc (view) | `address` |
| `moduleProvisioners(address)` | `db4f45de` | đọc (view) | `bool` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `sessionBeacon()` | `3ce544e9` | đọc (view) | `address` |
| `setDashboardFacade(address)` | `d534a94d` | ghi (nonpayable) | `` |
| `setDashboardImplementation(address)` | `3c261e57` | ghi (nonpayable) | `` |
| `setModuleProvisioner(address,bool)` | `927c26a7` | ghi (nonpayable) | `` |
| `setSharedRegistries(tuple)` | `` | ghi (nonpayable) | `` |
| `sharedRegistries()` | `e381eafc` | đọc (view) | `address,address,address,address,address` |
| `spendBeacon()` | `86e040b0` | đọc (view) | `address` |
| `stationBeacon()` | `72820046` | đọc (view) | `address` |
| `topUpBeacon()` | `61313222` | đọc (view) | `address` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeBeaconGlobal(address,address,address,address,address,address,address)` | `4c8162e8` | ghi (nonpayable) | `` |
| `upgradeOwnedBeacon(address,address)` | `d2fe56b3` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |
| `userBeacon()` | `b9cb2ff1` | đọc (view) | `address` |
| `wireLoyalty(address,uint256,address)` | `a15e4ffd` | ghi (nonpayable) | `` |

## Event (7)

| Event |
|---|
| `BeaconUpgraded(bytes32,address,address)` |
| `Initialized(uint64)` |
| `ModuleProvisionerUpdated(address,bool,address)` |
| `NetCafeBranchCreated(address,uint256,address,tuple)` |
| `OwnershipTransferred(address,address)` |
| `SharedRegistriesUpdated(tuple)` |
| `Upgraded(address)` |
