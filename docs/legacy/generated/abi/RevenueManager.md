# RevenueManager — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (40)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MAX_REVENUE_ENTRIES_PER_AGENT()` | `968f6294` | đọc (view) | `uint256` |
| `MAX_TOP_AGENTS_LIMIT()` | `eabb1765` | đọc (view) | `uint256` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `addAgent(address)` | `84e79842` | ghi (nonpayable) | `` |
| `agentList(uint256)` | `2f80c54f` | đọc (view) | `address` |
| `agentRevenues(address)` | `9d6c14f4` | đọc (view) | `address,uint256,uint256,uint256,uint256,uint256` |
| `batchRecordRevenue(address[],uint8[],uint256[],string[])` | `7f67cc68` | ghi (nonpayable) | `` |
| `dailyRevenue(uint256)` | `20a3babc` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `enhancedAgent()` | `76bb070f` | đọc (view) | `address` |
| `getAgentPerformanceSummary(address)` | `e69d0d16` | đọc (view) | `tuple,uint256,uint256,uint256,uint256` |
| `getAgentRevenue(address)` | `8ff487a1` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `getAgentRevenueGrowth(address,uint256,uint256)` | `15aabf50` | đọc (view) | `uint256,uint256,uint256,uint256,uint256` |
| `getAgentRevenueRecords(address)` | `0a063230` | đọc (view) | `tuple[]` |
| `getAllAgentsRevenue()` | `d959564e` | đọc (view) | `tuple[]` |
| `getRecentRevenueRecords(uint256)` | `382fd64a` | đọc (view) | `tuple[]` |
| `getRevenueByPeriod(string,uint256)` | `39a560b9` | đọc (view) | `tuple` |
| `getRevenueByTimeRange(uint256,uint256)` | `dbd64e59` | đọc (view) | `tuple` |
| `getRevenueRecord(uint256)` | `5f0a10e1` | đọc (view) | `tuple` |
| `getRevenueRecordsByModule(uint8)` | `546d5200` | đọc (view) | `tuple[]` |
| `getSystemPerformanceMetrics()` | `7800baa0` | đọc (view) | `tuple,uint256,uint256,uint256,uint256` |
| `getSystemRevenue()` | `f3d713cf` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `getSystemRevenueGrowth(uint256,uint256)` | `b52ccad1` | đọc (view) | `uint256,uint256,uint256,uint256,uint256,uint256` |
| `getTopAgentsByModule(uint8,uint256)` | `82255e23` | đọc (view) | `address[],uint256[]` |
| `getTopAgentsByRevenue(uint256)` | `351d0aea` | đọc (view) | `address[],uint256[]` |
| `getTotalRevenueRecords()` | `d1c86652` | đọc (view) | `uint256` |
| `getVersion()` | `0d8e6e2c` | đọc (view) | `string` |
| `initialize()` | `8129fc1c` | ghi (nonpayable) | `` |
| `monthlyRevenue(uint256)` | `64a88886` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `recordRevenue(address,uint8,uint256,string)` | `8e55af02` | ghi (nonpayable) | `` |
| `removeAgent(address)` | `97a6278e` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `revenueRecords(uint256)` | `2151ad33` | đọc (view) | `address,uint8,uint256,uint256,string` |
| `setEnhancedAgent(address)` | `4dce071d` | ghi (nonpayable) | `` |
| `systemRevenue()` | `f50effd9` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |
| `version()` | `54fd4d50` | đọc (view) | `string` |
| `yearlyRevenue(uint256)` | `6078d687` | đọc (view) | `uint256,uint256,uint256,uint256` |

## Event (7)

| Event |
|---|
| `AgentAdded(address,uint256)` |
| `ContractUpgraded(string,string,uint256)` |
| `Initialized(uint64)` |
| `OwnershipTransferred(address,address)` |
| `RevenueRecorded(address,uint8,uint256,uint256,string)` |
| `RevenueUpdated(uint256,uint256,uint256,uint256)` |
| `Upgraded(address)` |
