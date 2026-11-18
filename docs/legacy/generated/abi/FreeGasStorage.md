# FreeGasStorage — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (11)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `AddSC(address,address[])` | `f74e4523` | ghi (nonpayable) | `` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `initialize(address)` | `c4d66de8` | ghi (nonpayable) | `` |
| `iqrFactory()` | `f7fbbfcb` | đọc (view) | `address` |
| `isAllowed(address)` | `babcc539` | đọc (view) | `bool` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `registerSCAdmin(address,bool)` | `4511bfa5` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (4)

| Event |
|---|
| `ContractRegistration(address,address[])` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
