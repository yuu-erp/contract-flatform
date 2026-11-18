# AgentModuleProvisioner — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (29)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `AUDIT_MODULE_STATE_SYNCED()` | `71aaf9fd` | đọc (view) | `bytes32` |
| `AUDIT_NET_MODULE_PROVISIONED()` | `80b35324` | đọc (view) | `bytes32` |
| `MAX_MODULE_STATE_BATCH()` | `b2e3bb6f` | đọc (view) | `uint256` |
| `MAX_PROVISION_BATCH()` | `2e4f54df` | đọc (view) | `uint256` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `branchAuditTrail()` | `2a795848` | đọc (view) | `address` |
| `economyVault()` | `00ae9de5` | đọc (view) | `address` |
| `initialize(address,address,address,address)` | `f8c8765e` | ghi (nonpayable) | `` |
| `moduleRegistry()` | `b95459e4` | đọc (view) | `address` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `provisionNetForBranches(address,uint256[],address)` | `1e9428fe` | ghi (nonpayable) | `tuple[]` |
| `provisioners(address)` | `865add2d` | đọc (view) | `bool` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setAccessManager(address)` | `c9580804` | ghi (nonpayable) | `` |
| `setBranchAuditTrail(address)` | `6b55acf2` | ghi (nonpayable) | `` |
| `setBranchModule(address,uint256,string,bool)` | `cf2225ec` | ghi (nonpayable) | `` |
| `setBranchModules(address,tuple[])` | `` | ghi (nonpayable) | `` |
| `setModuleActiveForBranches(address,uint256[],bytes32,bool)` | `59841df6` | ghi (nonpayable) | `` |
| `setModuleStateForBranches(address,uint256[],bytes32,uint8)` | `fdd0c83f` | ghi (nonpayable) | `` |
| `setModulesActiveForBranches(address,uint256[],bool[4])` | `55582c07` | ghi (nonpayable) | `` |
| `setPermissionModuleStates(address,uint256[],bool[4])` | `378b0ca4` | ghi (nonpayable) | `` |
| `setProvisioner(address,bool)` | `bcfc7d2b` | ghi (nonpayable) | `` |
| `setSharedContracts(address,address,address)` | `956a7550` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |
| `wireLoyaltyForBranch(address,uint256,address)` | `2437d15e` | ghi (nonpayable) | `` |

## Event (9)

| Event |
|---|
| `AccessManagerUpdated(address,address)` |
| `BranchAuditTrailUpdated(address,address)` |
| `Initialized(uint64)` |
| `ModuleStateSynced(address,uint256,bytes32,uint8,address)` |
| `NetModuleProvisioned(address,uint256,address,tuple)` |
| `OwnershipTransferred(address,address)` |
| `ProvisionerUpdated(address,bool,address)` |
| `SharedContractsUpdated(address,address,address)` |
| `Upgraded(address)` |
