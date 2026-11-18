# EconomyVault — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (23)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `TOKEN_LOYALTY_A()` | `9dd8225b` | đọc (view) | `bytes32` |
| `TOKEN_LOYALTY_B()` | `093c4765` | đọc (view) | `bytes32` |
| `TOKEN_POINT()` | `94d578bf` | đọc (view) | `bytes32` |
| `TOKEN_VND()` | `3985837d` | đọc (view) | `bytes32` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `authorizedModules(address,uint256,address)` | `c1824bd8` | đọc (view) | `bool` |
| `balanceOf(address,uint256,address,bytes32)` | `2211ab74` | đọc (view) | `uint256` |
| `credit(address,uint256,address,uint256,bytes32,bytes32,bytes32)` | `5cc4e441` | ghi (nonpayable) | `uint256` |
| `debit(address,uint256,address,uint256,bytes32,bytes32,bytes32)` | `29f6d316` | ghi (nonpayable) | `uint256` |
| `getLedgerIds(address,uint256,address)` | `a34c8109` | đọc (view) | `uint256[]` |
| `getLedgerPaged(address,uint256,address,uint256,uint256)` | `ec0f6004` | đọc (view) | `tuple[],uint256` |
| `initialize(address)` | `c4d66de8` | ghi (nonpayable) | `` |
| `ledgerCounter()` | `26415d30` | đọc (view) | `uint256` |
| `ledgerEntries(uint256)` | `f0398ede` | đọc (view) | `uint256,address,uint256,address,uint256,bytes32,bytes32,bytes32,uint8,address,uint256` |
| `moduleProvisioners(address)` | `db4f45de` | đọc (view) | `bool` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `processedRefs(address,uint256,bytes32,bytes32)` | `631f4bc3` | đọc (view) | `bool` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setAuthorizedModule(address,uint256,address,bool)` | `a528e76e` | ghi (nonpayable) | `` |
| `setModuleProvisioner(address,bool)` | `927c26a7` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (6)

| Event |
|---|
| `AuthorizedModuleUpdated(address,uint256,address,bool,address)` |
| `Initialized(uint64)` |
| `ModuleProvisionerUpdated(address,bool,address)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
| `VaultLedgerRecorded(uint256,address,uint256,address,uint256,bytes32,bytes32,bytes32,uint8,address)` |
