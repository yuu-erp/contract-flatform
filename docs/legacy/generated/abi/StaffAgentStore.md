# StaffAgentStore — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (26)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `CheckAgentCreated(address)` | `a7271c77` | đọc (view) | `bool` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `checkUserAgentExist(address)` | `c3b9b8d2` | đọc (view) | `bool` |
| `enhancedAgent()` | `76bb070f` | đọc (view) | `address` |
| `getAgentsCoOwner(address)` | `02c99df4` | đọc (view) | `address[]` |
| `getBranchIdsCoOwner(address,address)` | `be344f8c` | đọc (view) | `uint256[]` |
| `getUserAgetSCs(address)` | `73dd4f97` | đọc (view) | `tuple` |
| `initialize()` | `8129fc1c` | ghi (nonpayable) | `` |
| `iqrFactory()` | `f7fbbfcb` | đọc (view) | `address` |
| `isBranchManagement(address)` | `83c314ee` | đọc (view) | `bool` |
| `isManagement(address)` | `ec0c7e28` | đọc (view) | `bool` |
| `mCoOwnerToAgent(address,uint256)` | `c21dec7f` | đọc (view) | `address` |
| `mCoOwnerToAgentToBranchIds(address,address,uint256)` | `63256367` | đọc (view) | `uint256` |
| `mUserToAgent(address)` | `cf66b408` | đọc (view) | `address` |
| `mUserToBranchId(address)` | `db324911` | đọc (view) | `uint256` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setAgent(address,address,uint256)` | `5a5943ae` | ghi (nonpayable) | `` |
| `setAgentForCoOwner(address,address,uint256[])` | `92a0d115` | ghi (nonpayable) | `` |
| `setBranchManagement(address)` | `f913829d` | ghi (nonpayable) | `` |
| `setEnhancedAgent(address)` | `4dce071d` | ghi (nonpayable) | `` |
| `setIqrFactory(address)` | `e19b182c` | ghi (nonpayable) | `` |
| `setManagement(address)` | `d4a22bde` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (3)

| Event |
|---|
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
