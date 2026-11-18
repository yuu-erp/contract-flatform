# NetCafeTopUpV3 — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (51)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MODULE_NET()` | `27a29fec` | đọc (view) | `bytes32` |
| `PERM_NET_ADMIN()` | `7e882a8e` | đọc (view) | `bytes32` |
| `PERM_NET_PAYMENT_MANAGE()` | `d209430a` | đọc (view) | `bytes32` |
| `PERM_NET_SESSION_MANAGE()` | `474e1a90` | đọc (view) | `bytes32` |
| `PERM_NET_SPEND_VIEW()` | `513f3574` | đọc (view) | `bytes32` |
| `PERM_NET_STATION_MANAGE()` | `8dd5009c` | đọc (view) | `bytes32` |
| `REASON_NET_TOPUP()` | `9c4c4a42` | đọc (view) | `bytes32` |
| `TOKEN_LOYALTY_A()` | `9dd8225b` | đọc (view) | `bytes32` |
| `TOKEN_VND()` | `3985837d` | đọc (view) | `bytes32` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `approveTopUp(bytes32)` | `47cd075f` | ghi (nonpayable) | `` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `cancelTopUpRequest(bytes32,address,address,bytes32,bytes32)` | `cba04d5c` | ghi (nonpayable) | `` |
| `createTransaction(address,uint256,uint8)` | `809f55b7` | ghi (nonpayable) | `bytes32,string` |
| `depositVND(address,uint256,uint8)` | `9d2f5fc2` | ghi (nonpayable) | `bytes32` |
| `economyVault()` | `00ae9de5` | đọc (view) | `address` |
| `getAccountBank()` | `33b167d2` | đọc (view) | `bytes` |
| `getHandledTopUpsPaged(uint256,uint256)` | `e44557b5` | đọc (view) | `tuple[]` |
| `getPendingTopUps()` | `cfee96e1` | đọc (view) | `bytes32[]` |
| `getPendingTopUpsPaged(uint256,uint256)` | `3ddcfeaf` | đọc (view) | `tuple[]` |
| `getTopUpHistory(address,uint256,uint256)` | `1e0c30fb` | đọc (view) | `tuple[],uint256` |
| `getTopUpPcIds(bytes32[])` | `36ca476d` | đọc (view) | `bytes32[]` |
| `handledTopUpIds(uint256)` | `93d018ca` | đọc (view) | `bytes32` |
| `initialize(address,address,uint256,address,address,address,address,address,address)` | `c166e1d6` | ghi (nonpayable) | `` |
| `isValidAmount(bytes32,uint256)` | `1c8eaa72` | đọc (view) | `bool` |
| `loyaltyPoints()` | `956a20ea` | đọc (view) | `address` |
| `moduleRegistry()` | `b95459e4` | đọc (view) | `address` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `paymentConfig()` | `d3992ed0` | đọc (view) | `bool,bool` |
| `paymentConfirm(string,uint256,uint256,uint8)` | `bafad3e4` | ghi (nonpayable) | `bytes32,uint256` |
| `paymentRegistry()` | `f13dfb0b` | đọc (view) | `address` |
| `pendingTopUps(uint256)` | `9d9cb012` | đọc (view) | `bytes32` |
| `refCodeToId(string)` | `b80dd9c8` | đọc (view) | `bytes32` |
| `rejectTopUp(bytes32)` | `abfd058d` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `requestTopUp(address,uint256,uint8,address,bytes32,bytes32)` | `3a33cd95` | ghi (nonpayable) | `bytes32,string` |
| `sessionContract()` | `a6d861a7` | đọc (view) | `address` |
| `setEconomyVault(address)` | `c5818c04` | ghi (nonpayable) | `` |
| `setLoyalty(address)` | `e71fb211` | ghi (nonpayable) | `` |
| `setModuleContracts(address,address)` | `531f31ed` | ghi (nonpayable) | `` |
| `setPaymentConfig(bool,bool)` | `da2aa3bc` | ghi (nonpayable) | `` |
| `setPaymentRegistry(address)` | `ae48c70c` | ghi (nonpayable) | `` |
| `setSharedRegistries(address,address)` | `a6c4d3e9` | ghi (nonpayable) | `` |
| `shortCodeCounter()` | `a4900e97` | đọc (view) | `uint256` |
| `topUpHistory(address,uint256)` | `928df1bf` | đọc (view) | `bytes32` |
| `topUpPcId(bytes32)` | `62aaccc4` | đọc (view) | `bytes32` |
| `topUpRequests(bytes32)` | `ed102424` | đọc (view) | `bytes32,address,string,uint256,uint8,uint8,uint256,uint256,bool,string,uint8,uint256,uint256` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `userContract()` | `5000596b` | đọc (view) | `address` |

## Event (13)

| Event |
|---|
| `EconomyVaultUpdated(address)` |
| `Initialized(uint64)` |
| `LoyaltyUpdated(address)` |
| `ModuleContractUpdated(bytes32,address)` |
| `OwnershipTransferred(address,address)` |
| `PaymentConfigUpdated(bool,bool)` |
| `PaymentConfirmed(bytes32,uint256,uint256,address,uint8)` |
| `PaymentRegistryUpdated(address)` |
| `SharedRegistryUpdated(address,address,address)` |
| `TopUpApproved(bytes32,address,uint256,uint256)` |
| `TopUpCancelled(bytes32,address)` |
| `TopUpRejected(bytes32,address)` |
| `TopUpRequested(bytes32,address,uint256,uint8,string,uint8)` |
