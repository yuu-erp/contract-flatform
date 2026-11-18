# AgentIQR — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (39)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MANAGEMENT()` | `b53f0d00` | đọc (view) | `address` |
| `ManagementBeacon()` | `1baeacf7` | đọc (view) | `address` |
| `ORDER()` | `4d5e07fb` | đọc (view) | `address` |
| `OrderBeacon()` | `88da4895` | đọc (view) | `address` |
| `ReportBeacon()` | `268cffe9` | đọc (view) | `address` |
| `TimekeepingBeacon()` | `f6bb5698` | đọc (view) | `address` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `branchPaymentRegistry()` | `fae1b366` | đọc (view) | `address` |
| `branchResourceRegistry()` | `0700b7ce` | đọc (view) | `address` |
| `completedOrders()` | `c46abb4a` | đọc (view) | `uint256` |
| `createOrder(bytes32,uint256)` | `be89c593` | ghi (nonpayable) | `` |
| `deactivate()` | `51b42b00` | ghi (nonpayable) | `` |
| `enhancedAgent()` | `76bb070f` | đọc (view) | `address` |
| `getAllOrderIds()` | `4b2b612a` | đọc (view) | `bytes32[]` |
| `getIQRSCByAgent(address,uint256)` | `b7e78558` | đọc (view) | `tuple` |
| `getOrder(bytes32)` | `5778472a` | đọc (view) | `tuple` |
| `getStatistics()` | `372d6b27` | đọc (view) | `uint256,uint256,uint256,uint256,bool` |
| `getTotalRevenue()` | `957fae96` | đọc (view) | `uint256` |
| `initialize(address,address,address,address,address,address,address,address,uint256)` | `344dd6e4` | ghi (nonpayable) | `` |
| `iqrFactory()` | `f7fbbfcb` | đọc (view) | `address` |
| `isActive()` | `22f3e2d4` | đọc (view) | `bool` |
| `mAgentToIQR(address,uint256)` | `3e54ac91` | đọc (view) | `address,address,address,address,address,address,address,address` |
| `orderIds(uint256)` | `23722084` | đọc (view) | `bytes32` |
| `orders(bytes32)` | `9c3f1e90` | đọc (view) | `bytes32,uint256,uint256` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `reactivate()` | `d18611d6` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `revenueManager()` | `ff3cd61e` | đọc (view) | `address` |
| `set(address,address,address,address,address,address,address,address,address,address,address,address)` | `4339efbd` | ghi (nonpayable) | `` |
| `setPointSC(address,address,uint256)` | `f6d12916` | ghi (nonpayable) | `` |
| `setTaxPercent(address,uint256,uint8)` | `f6249a5a` | ghi (nonpayable) | `` |
| `totalOrders()` | `1d834409` | đọc (view) | `uint256` |
| `totalRevenue()` | `bf2d9e0b` | đọc (view) | `uint256` |
| `transferOwnerIQR(address,address,address,address,address)` | `1b7371a0` | ghi (nonpayable) | `` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |

## Event (8)

| Event |
|---|
| `BeaconUpgraded(address,address,address,uint256)` |
| `ContractDeactivated(uint256)` |
| `Initialized(uint64)` |
| `OrderCancelled(uint256,uint256)` |
| `OrderCompleted(uint256,uint256)` |
| `OrderCreated(uint256,address,uint256,uint256)` |
| `OwnershipTransferred(address,address)` |
| `Upgraded(address)` |
