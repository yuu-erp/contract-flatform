# NetCafeSessionV3 — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (82)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MODULE_NET()` | `27a29fec` | đọc (view) | `bytes32` |
| `PERM_NET_ADMIN()` | `7e882a8e` | đọc (view) | `bytes32` |
| `PERM_NET_PAYMENT_MANAGE()` | `d209430a` | đọc (view) | `bytes32` |
| `PERM_NET_SESSION_MANAGE()` | `474e1a90` | đọc (view) | `bytes32` |
| `PERM_NET_SPEND_VIEW()` | `513f3574` | đọc (view) | `bytes32` |
| `PERM_NET_STATION_MANAGE()` | `8dd5009c` | đọc (view) | `bytes32` |
| `REASON_NET_SESSION()` | `f735dab2` | đọc (view) | `bytes32` |
| `TOKEN_VND()` | `3985837d` | đọc (view) | `bytes32` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `activeSessionOfUser(address)` | `0a4d78b5` | đọc (view) | `address` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `closeSession(address)` | `27be24ee` | ghi (nonpayable) | `` |
| `closeSessionByModule(address)` | `fe49ef77` | ghi (nonpayable) | `` |
| `closeSessionByStation(address)` | `fb8c7ccc` | ghi (nonpayable) | `` |
| `dailyActiveUserSeen(uint256,address)` | `cd9f7978` | đọc (view) | `bool` |
| `dailyActiveUsersCount(uint256)` | `4e07c33b` | đọc (view) | `uint256` |
| `dailyRetainedUsersCount(uint256)` | `3859299e` | đọc (view) | `uint256` |
| `dailyReturningUserSeen(uint256,address)` | `08ed88c0` | đọc (view) | `bool` |
| `dailyReturningUsersCount(uint256)` | `6938b3a2` | đọc (view) | `uint256` |
| `dailySessionCount(uint256)` | `e6aba12c` | đọc (view) | `uint256` |
| `dailyUsageRevenue(uint256)` | `e9aa042d` | đọc (view) | `uint256` |
| `dailyUsageSeconds(uint256)` | `b04f8240` | đọc (view) | `uint256` |
| `economyVault()` | `00ae9de5` | đọc (view) | `address` |
| `getActivityCounters(uint8,uint256)` | `e4d4ab09` | đọc (view) | `uint256,uint256` |
| `getDashboardDay(uint256)` | `0dc4ad8e` | đọc (view) | `uint256,uint256,uint256,uint256,uint256` |
| `getDashboardDayActiveUserListLength(uint256)` | `a794daf5` | đọc (view) | `uint256` |
| `getDashboardDayActiveUsers(uint256,uint256,uint256)` | `bf1f415a` | đọc (view) | `address[]` |
| `getDashboardHourUsage(uint256)` | `2987fe52` | đọc (view) | `uint256` |
| `getDashboardHourUsageRange(uint256)` | `821ef845` | đọc (view) | `uint256[]` |
| `getDashboardMonth(uint256)` | `bcd85e82` | đọc (view) | `uint256,uint256,uint256,uint256,uint256` |
| `getDashboardOnlineStationCount(uint8,uint256)` | `330c4624` | đọc (view) | `uint256` |
| `getDashboardOnlineStationCountRange(uint8,uint256)` | `0c505b7e` | đọc (view) | `uint256[]` |
| `getDashboardUsageByHourOfDay(uint256,uint256)` | `b428a4fb` | đọc (view) | `uint256[]` |
| `getDashboardWeekUsers(uint256)` | `231b66ed` | đọc (view) | `uint256,uint256,bool` |
| `getDashboardYear(uint256)` | `949ecf1c` | đọc (view) | `uint256,uint256,uint256,uint256,uint256` |
| `getSession(address)` | `8c8e13b9` | đọc (view) | `tuple` |
| `getSessionByUser(address)` | `aecfae5e` | đọc (view) | `tuple` |
| `heartbeat(address,uint64)` | `d6fe0dad` | ghi (nonpayable) | `` |
| `hourlyUsageRevenue(uint256)` | `3986d844` | đọc (view) | `uint256` |
| `hourlyUsageSeconds(uint256)` | `85d8f7e4` | đọc (view) | `uint256` |
| `importActivityCounter(uint8,uint256,uint256,uint256)` | `dedfb4e6` | ghi (nonpayable) | `` |
| `importActivityCounters(uint8,uint256[],uint256[],uint256[])` | `23b5cc90` | ghi (nonpayable) | `` |
| `importDashboardDayActiveUsers(uint256,address[])` | `894edf20` | ghi (nonpayable) | `` |
| `importLastActiveDays(address[],uint256[])` | `b5af4f07` | ghi (nonpayable) | `` |
| `initialize(address,address,uint256,address,address,address,address,address)` | `83a94322` | ghi (nonpayable) | `` |
| `lastActiveDay(address)` | `dc1ab379` | đọc (view) | `uint256` |
| `loyaltyPoints()` | `956a20ea` | đọc (view) | `address` |
| `machineSession(bytes32)` | `7d8883f8` | đọc (view) | `address` |
| `managementContract()` | `b3e5cc4a` | đọc (view) | `address` |
| `moduleRegistry()` | `b95459e4` | đọc (view) | `address` |
| `monthlyActiveUsersCount(uint256)` | `188069e0` | đọc (view) | `uint256` |
| `monthlyRetainedUsersCount(uint256)` | `a9b502e4` | đọc (view) | `uint256` |
| `monthlyReturningUsersCount(uint256)` | `97ce98c4` | đọc (view) | `uint256` |
| `monthlySessionCount(uint256)` | `f2e7c65d` | đọc (view) | `uint256` |
| `monthlyUsageRevenue(uint256)` | `cfd6f367` | đọc (view) | `uint256` |
| `monthlyUsageSeconds(uint256)` | `132c3213` | đọc (view) | `uint256` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `openSession(address,bytes32,bytes32,uint64)` | `ad221e7a` | ghi (nonpayable) | `` |
| `openSessionForOtp(address,address,bytes32,bytes32,uint64)` | `74ca909f` | ghi (nonpayable) | `` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `pcHasActiveSession(bytes32)` | `3d6ebfec` | đọc (view) | `bool` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `sessions(address)` | `431a1b97` | đọc (view) | `address,address,bytes32,bytes32,uint64,bool` |
| `setEconomyVault(address)` | `c5818c04` | ghi (nonpayable) | `` |
| `setLoyalty(address)` | `e71fb211` | ghi (nonpayable) | `` |
| `setModuleContracts(address,address,address)` | `0c36ad14` | ghi (nonpayable) | `` |
| `setSharedRegistries(address,address)` | `a6c4d3e9` | ghi (nonpayable) | `` |
| `stationContract()` | `408375d1` | đọc (view) | `address` |
| `totalSessionsByUser(address)` | `fd0486db` | đọc (view) | `uint256` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `userContract()` | `5000596b` | đọc (view) | `address` |
| `validateSession(address,bytes32,bytes32)` | `485ab2c8` | đọc (view) | `bool` |
| `weeklyActiveUsersCount(uint256)` | `6d9bd477` | đọc (view) | `uint256` |
| `weeklyRetainedUsersCount(uint256)` | `c595ade7` | đọc (view) | `uint256` |
| `weeklyReturningUsersCount(uint256)` | `2a9368d6` | đọc (view) | `uint256` |
| `yearlyActiveUsersCount(uint256)` | `1f5b5fef` | đọc (view) | `uint256` |
| `yearlyRetainedUsersCount(uint256)` | `652e5079` | đọc (view) | `uint256` |
| `yearlyReturningUsersCount(uint256)` | `fe5719d6` | đọc (view) | `uint256` |
| `yearlySessionCount(uint256)` | `67b16833` | đọc (view) | `uint256` |
| `yearlyUsageRevenue(uint256)` | `4aae3258` | đọc (view) | `uint256` |
| `yearlyUsageSeconds(uint256)` | `39eac34a` | đọc (view) | `uint256` |

## Event (9)

| Event |
|---|
| `EconomyVaultUpdated(address)` |
| `Initialized(uint64)` |
| `LoyaltyUpdated(address)` |
| `ModuleContractUpdated(bytes32,address)` |
| `OwnershipTransferred(address,address)` |
| `SessionCharged(address,address,bytes32,uint256,uint64,bytes32,uint256)` |
| `SessionClosed(address,bytes32,address)` |
| `SessionOpened(address,address,bytes32,uint64)` |
| `SharedRegistryUpdated(address,address,address)` |
