# BMFactory — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (25)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `BRANCH_MANAGEMENT_IMP()` | `9114d990` | đọc (view) | `address` |
| `HISTORY_TRACKING_IMP()` | `3d924571` | đọc (view) | `address` |
| `StaffAgentStore()` | `323eab01` | đọc (view) | `address` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `addManagerMainBranch(address,address,uint256[])` | `d77c4a5a` | ghi (nonpayable) | `` |
| `agentBranchManagement(address)` | `09d63809` | đọc (view) | `address` |
| `branchManagementBeacon()` | `457888cf` | đọc (view) | `address` |
| `createBranchManagement(address)` | `eea34315` | ghi (nonpayable) | `address` |
| `currentImplementation()` | `d8bd5c29` | đọc (view) | `address` |
| `enhancedAgent()` | `76bb070f` | đọc (view) | `address` |
| `freeGasSc()` | `03434143` | đọc (view) | `address` |
| `getBranchManagement(address)` | `85b81dc1` | đọc (view) | `address` |
| `initialize()` | `8129fc1c` | ghi (nonpayable) | `` |
| `iqrFactory()` | `f7fbbfcb` | đọc (view) | `address` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `robotFactory()` | `25d8b68b` | đọc (view) | `address` |
| `setBranchManagerSC(address,address,address,address,address,address,address)` | `0837ef2a` | ghi (nonpayable) | `` |
| `setEnhancedAgent(address)` | `4dce071d` | ghi (nonpayable) | `` |
| `transferBeaconOwnership(address)` | `6095b4b0` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeBeacon(address)` | `1bce4583` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (4)

| Event |
|---|
| `BeaconUpgraded(address,address,address,uint256)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
