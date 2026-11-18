# BranchModuleRegistry — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (23)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MODULE_IQR()` | `78218f54` | đọc (view) | `bytes32` |
| `MODULE_LOYALTY()` | `af5ca0c6` | đọc (view) | `bytes32` |
| `MODULE_NET()` | `27a29fec` | đọc (view) | `bytes32` |
| `MODULE_ROBOT()` | `54480dbe` | đọc (view) | `bytes32` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `agentAdmins(address,address)` | `aca5b3e0` | đọc (view) | `bool` |
| `getAgentModuleState(address,bytes32)` | `2601f548` | đọc (view) | `uint8` |
| `getBranchModuleState(address,uint256,bytes32)` | `ccd91440` | đọc (view) | `uint8` |
| `initialize(address)` | `c4d66de8` | ghi (nonpayable) | `` |
| `isModuleActive(address,uint256,bytes32)` | `ec18139e` | đọc (view) | `bool` |
| `isModuleInstalledForAgent(address,bytes32)` | `d32e3bc4` | đọc (view) | `bool` |
| `moduleProvisioners(address)` | `db4f45de` | đọc (view) | `bool` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setAgentAdmin(address,address,bool)` | `2bb3c980` | ghi (nonpayable) | `` |
| `setAgentModuleState(address,bytes32,uint8)` | `1a306250` | ghi (nonpayable) | `` |
| `setBranchModuleState(address,uint256,bytes32,uint8)` | `990dc959` | ghi (nonpayable) | `` |
| `setBranchModuleStates(address,uint256[],bytes32,uint8)` | `2463b91c` | ghi (nonpayable) | `` |
| `setBranchModuleStatesBatch(address,uint256[],bytes32[],uint8[])` | `c1520ac5` | ghi (nonpayable) | `` |
| `setModuleProvisioner(address,bool)` | `927c26a7` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (7)

| Event |
|---|
| `AgentAdminUpdated(address,address,bool,address)` |
| `AgentModuleStateUpdated(address,bytes32,uint8,uint8,address)` |
| `BranchModuleStateUpdated(address,uint256,bytes32,uint8,uint8,address)` |
| `Initialized(uint64)` |
| `ModuleProvisionerUpdated(address,bool,address)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
