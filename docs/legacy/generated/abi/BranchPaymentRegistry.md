# BranchPaymentRegistry — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (26)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `AUDIT_BANK_ACCOUNT_ACTIVE_UPDATED()` | `2d72aba4` | đọc (view) | `bytes32` |
| `AUDIT_BANK_ACCOUNT_ADDED()` | `f5a69aaa` | đọc (view) | `bytes32` |
| `AUDIT_BANK_ACCOUNT_DELETED()` | `370aac2f` | đọc (view) | `bytes32` |
| `AUDIT_BANK_ACCOUNT_UPDATED()` | `83640f10` | đọc (view) | `bytes32` |
| `PERM_PAYMENT_REGISTRY_MANAGE()` | `44488c60` | đọc (view) | `bytes32` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `accountCounter()` | `a6e79975` | đọc (view) | `uint256` |
| `addAccountBank(address,tuple,string)` | `` | ghi (nonpayable) | `uint256` |
| `branchAuditTrail()` | `2a795848` | đọc (view) | `address` |
| `branchToAccount(address,uint256)` | `3d8adb13` | đọc (view) | `uint256` |
| `deleteAccountBank(uint256,string)` | `3d567cf5` | ghi (nonpayable) | `` |
| `getAccount(uint256)` | `ce88b145` | đọc (view) | `tuple` |
| `getAccountBank(address,uint256)` | `94b387c4` | đọc (view) | `tuple` |
| `getAccountBankEncoded(address,uint256)` | `759dea1d` | đọc (view) | `bytes` |
| `getAgentAccountIds(address)` | `a55e9428` | đọc (view) | `uint256[]` |
| `initialize(address,address)` | `485cc955` | ghi (nonpayable) | `` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setAccessManager(address)` | `c9580804` | ghi (nonpayable) | `` |
| `setAccountActive(uint256,bool)` | `6f1a2fb7` | ghi (nonpayable) | `` |
| `setBranchAuditTrail(address)` | `6b55acf2` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `updateAccountBank(uint256,tuple,string)` | `` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (11)

| Event |
|---|
| `AccessManagerUpdated(address)` |
| `BankAccountActiveUpdated(address,uint256,bool,address)` |
| `BankAccountAdded(address,uint256,uint256[],tuple,string,address)` |
| `BankAccountDeleted(address,uint256,tuple,uint256[],string,address)` |
| `BankAccountUpdated(address,uint256,uint256[],tuple,string,address)` |
| `BranchAuditTrailUpdated(address)` |
| `BranchPaymentAccountLinked(address,uint256,uint256)` |
| `BranchPaymentAccountUnlinked(address,uint256,uint256)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
