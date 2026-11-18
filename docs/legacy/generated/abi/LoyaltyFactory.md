# LoyaltyFactory — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (31)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `agentLoyaltyContracts(address,uint256)` | `d873a54b` | đọc (view) | `address` |
| `createAgentLoyalty(address,uint256)` | `ba47f933` | ghi (nonpayable) | `address` |
| `currentImplementation()` | `d8bd5c29` | đọc (view) | `address` |
| `deployedContracts(uint256)` | `9ad1ee10` | đọc (view) | `address` |
| `economyVault()` | `00ae9de5` | đọc (view) | `address` |
| `enhancedAgent()` | `76bb070f` | đọc (view) | `address` |
| `freeGasSc()` | `03434143` | đọc (view) | `address` |
| `getAgentLoyaltyContract(address,uint256)` | `5bd8b740` | đọc (view) | `address` |
| `getAllDeployedContracts()` | `6c9364b2` | đọc (view) | `address[]` |
| `getBeaconAddress()` | `009d4d7a` | đọc (view) | `address` |
| `getContractsByAgent(address,uint256)` | `96d36039` | đọc (view) | `address` |
| `initialize()` | `8129fc1c` | ghi (nonpayable) | `` |
| `loyaltyBeacon()` | `55956ea6` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `publicfullDB()` | `556453f5` | đọc (view) | `address` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `setBranchAccessManagerForAgent(address,address,uint256)` | `d253893a` | ghi (nonpayable) | `address` |
| `setEconomyVault(address)` | `c5818c04` | ghi (nonpayable) | `` |
| `setEnhancedAgent(address)` | `4dce071d` | ghi (nonpayable) | `` |
| `setFreeGasSc(address)` | `27ce6505` | ghi (nonpayable) | `` |
| `setNetSpendModules(address,uint256,address,address,address,bool)` | `9431dc98` | ghi (nonpayable) | `` |
| `setPointsImp(address)` | `b8eb6aac` | ghi (nonpayable) | `` |
| `setPointsLoyaltyFactory(address,address,address,address,uint256)` | `8dd1f121` | ghi (nonpayable) | `address` |
| `setPublicfullDB(address)` | `45b8013d` | ghi (nonpayable) | `` |
| `transferBeaconOwnership(address)` | `6095b4b0` | ghi (nonpayable) | `` |
| `transferOwnerPointSC(address,uint256,address)` | `ca3f9e62` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeBeacon(address)` | `1bce4583` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (5)

| Event |
|---|
| `AgentLoyaltyCreated(address,uint256,address,address,uint256)` |
| `BeaconUpgraded(address,address,address,uint256)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
