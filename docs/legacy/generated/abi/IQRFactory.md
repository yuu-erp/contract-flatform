# IQRFactory — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (53)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `AgentIqrBeacon()` | `73621971` | đọc (view) | `address` |
| `MANAGEMENT()` | `b53f0d00` | đọc (view) | `address` |
| `ManagementBeacon()` | `1baeacf7` | đọc (view) | `address` |
| `ORDER()` | `4d5e07fb` | đọc (view) | `address` |
| `OrderBeacon()` | `88da4895` | đọc (view) | `address` |
| `POINTS()` | `7f6e4281` | đọc (view) | `address` |
| `REPORT()` | `6c81fae6` | đọc (view) | `address` |
| `ReportBeacon()` | `268cffe9` | đọc (view) | `address` |
| `StaffAgentStore()` | `323eab01` | đọc (view) | `address` |
| `TIMEKEEPING()` | `71343516` | đọc (view) | `address` |
| `TimekeepingBeacon()` | `f6bb5698` | đọc (view) | `address` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `agentBranchManagement(address)` | `09d63809` | đọc (view) | `address` |
| `agentIQRContracts(address,uint256)` | `71a771dc` | đọc (view) | `address` |
| `branchAccessManager()` | `1f75eab0` | đọc (view) | `address` |
| `branchPaymentRegistry()` | `fae1b366` | đọc (view) | `address` |
| `branchResourceRegistry()` | `0700b7ce` | đọc (view) | `address` |
| `cardVisa()` | `d005b03e` | đọc (view) | `address` |
| `createAgentIQR(address,uint256)` | `3ef38634` | ghi (nonpayable) | `address` |
| `currentImplementation()` | `d8bd5c29` | đọc (view) | `address,address,address,address` |
| `deployedContracts(uint256)` | `9ad1ee10` | đọc (view) | `address` |
| `enhancedAgent()` | `76bb070f` | đọc (view) | `address` |
| `freeGasSc()` | `03434143` | đọc (view) | `address` |
| `getAgentIQRContract(address,uint256)` | `be83f881` | đọc (view) | `address` |
| `getAgentTaxPercent(address)` | `31c8d590` | đọc (view) | `uint8` |
| `getAllDeployedContracts()` | `6c9364b2` | đọc (view) | `address[]` |
| `getIQRSCByAgentFromFactory(address,uint256)` | `bb550498` | đọc (view) | `tuple` |
| `getManagementSCByAgentsFromFactory(address,uint256[])` | `eeb88373` | đọc (view) | `address[],uint256` |
| `getVersion()` | `0d8e6e2c` | đọc (view) | `string` |
| `initialize()` | `8129fc1c` | ghi (nonpayable) | `` |
| `isAdminIqr(address)` | `f9e40bf2` | đọc (view) | `bool` |
| `lastUpdateIqr()` | `213af561` | đọc (view) | `address,uint256` |
| `noti()` | `6fb9bbed` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `revenueManager()` | `ff3cd61e` | đọc (view) | `address` |
| `setAdminIqr(address,bool)` | `36ac754a` | ghi (nonpayable) | `` |
| `setAgentIQR(address,uint256,address)` | `aced7767` | ghi (nonpayable) | `` |
| `setAgentIqrBeacon(address)` | `40bd52eb` | ghi (nonpayable) | `` |
| `setBranchAccessManager(address)` | `251c420c` | ghi (nonpayable) | `` |
| `setEnhancedAgent(address)` | `4dce071d` | ghi (nonpayable) | `` |
| `setIQRSC(address,address,address,address,address,address,address,address,address)` | `2dfcd5c8` | ghi (nonpayable) | `` |
| `setPointsIQRFactory(address,address,uint256)` | `7a2cc43f` | ghi (nonpayable) | `` |
| `setSharedBranchRegistries(address,address)` | `3c7e2739` | ghi (nonpayable) | `` |
| `setTaxPercentIQRFactory(address,uint8,uint256)` | `c8182f80` | ghi (nonpayable) | `` |
| `transferBeaconOwnership(address)` | `6095b4b0` | ghi (nonpayable) | `` |
| `transferOwnerIQRContracts(address,uint256)` | `ed61f9fa` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeBeaconAgentIqr(address)` | `92442dbd` | ghi (nonpayable) | `` |
| `upgradeBeaconGlobal(address,address,address,address)` | `7dc1a998` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |
| `version()` | `54fd4d50` | đọc (view) | `string` |

## Event (5)

| Event |
|---|
| `AgentIQRCreated(address,uint256,address,uint256)` |
| `ContractUpgraded(string,string,uint256)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
