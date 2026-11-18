# BranchAccessManager — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (133)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `AUDIT_ACCESS_UPDATED()` | `58a923b1` | đọc (view) | `bytes32` |
| `AUDIT_DELEGATION_UPDATED()` | `133e8903` | đọc (view) | `bytes32` |
| `AUDIT_POSITION_UPDATED()` | `1ed40c7b` | đọc (view) | `bytes32` |
| `AUDIT_STAFF_UPDATED()` | `e490142e` | đọc (view) | `bytes32` |
| `CreatePosition(address,uint256,string,uint8[])` | `e7a3bb9d` | ghi (nonpayable) | `` |
| `CreateStaff(address,uint256,tuple)` | `` | ghi (nonpayable) | `string` |
| `CreateWorkingShift(address,uint256,string,uint256,uint256)` | `962ccd93` | ghi (nonpayable) | `uint256` |
| `GetActiveStaffAddressesByDate(address,uint256,uint256)` | `78970f96` | đọc (view) | `address[]` |
| `GetActiveStaffAddressesByMonth(address,uint256,uint256)` | `ff6f32e6` | đọc (view) | `address[]` |
| `GetActiveStaffByDate(address,uint256,uint256)` | `d128a98c` | đọc (view) | `tuple[]` |
| `GetActiveStaffByMonth(address,uint256,uint256)` | `b553f8cf` | đọc (view) | `tuple[]` |
| `GetActiveStaffCountByDate(address,uint256,uint256)` | `3e1d007f` | đọc (view) | `uint256` |
| `GetActiveStaffCountByMonth(address,uint256,uint256)` | `ce66995d` | đọc (view) | `uint256` |
| `GetAllPositions(address,uint256)` | `95467bbe` | đọc (view) | `tuple[]` |
| `GetAllStaff(address,uint256)` | `12ccc42e` | đọc (view) | `tuple[]` |
| `GetPosition(address,uint256,string)` | `e0ed5863` | đọc (view) | `uint256,string,uint8[]` |
| `GetPositionById(address,uint256,uint256)` | `1a6736a4` | đọc (view) | `uint256,string,uint8[]` |
| `GetStaff()` | `7e5f3caf` | đọc (view) | `tuple` |
| `GetStaffInfo(address,uint256,address)` | `ded47355` | đọc (view) | `tuple` |
| `GetStaffRolePayment(address,uint256)` | `21595105` | đọc (view) | `address[]` |
| `GetStaffsPagination(address,uint256,uint256,uint256)` | `c68673f7` | đọc (view) | `tuple[],uint256` |
| `GetWorkingShiftsPagination(address,uint256,uint256,uint256)` | `f3bfe426` | đọc (view) | `tuple[],uint256` |
| `IsRoleAllowedForPosition(address,uint256,string,uint8)` | `91a76804` | đọc (view) | `bool` |
| `MAX_DELEGATES_PER_AGENT()` | `d118e814` | đọc (view) | `uint256` |
| `PERM_ACCESS_MANAGE()` | `eabf49bc` | đọc (view) | `bytes32` |
| `PERM_NET_ADMIN()` | `7e882a8e` | đọc (view) | `bytes32` |
| `PERM_NET_PAYMENT_MANAGE()` | `d209430a` | đọc (view) | `bytes32` |
| `PERM_NET_SESSION_MANAGE()` | `474e1a90` | đọc (view) | `bytes32` |
| `PERM_NET_SPEND_VIEW()` | `513f3574` | đọc (view) | `bytes32` |
| `PERM_NET_STATION_MANAGE()` | `8dd5009c` | đọc (view) | `bytes32` |
| `PERM_PAYMENT_REGISTRY_MANAGE()` | `44488c60` | đọc (view) | `bytes32` |
| `PERM_RESOURCE_MANAGE()` | `f04b9cd5` | đọc (view) | `bytes32` |
| `PositionExists(address,uint256,string)` | `03f0802c` | đọc (view) | `bool` |
| `RemovePosition(address,uint256,string)` | `c297fc34` | ghi (nonpayable) | `` |
| `RemovePositionById(address,uint256,uint256)` | `ebf8a084` | ghi (nonpayable) | `` |
| `RemoveWorkingShift(address,uint256,uint256)` | `b3ca6ce8` | ghi (nonpayable) | `` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `UpdatePosition(address,uint256,string,uint8[])` | `7dc1c79a` | ghi (nonpayable) | `` |
| `UpdateStaffInfo(address,uint256,address,string,string,string,string,uint8[],tuple[],string,string,string,bool)` | `` | ghi (nonpayable) | `bool` |
| `UpdateWorkingShift(address,uint256,string,uint256,uint256,uint256)` | `4dd50901` | ghi (nonpayable) | `` |
| `_getRoleHash(uint8)` | `8f27ed2e` | đọc (pure) | `bytes32` |
| `agentAdmins(address,address)` | `aca5b3e0` | đọc (view) | `bool` |
| `agentCoOwnerFullAccess(address,address)` | `82ca133c` | đọc (view) | `bool` |
| `agentCoOwners(address,address)` | `561fcec4` | đọc (view) | `bool` |
| `branchAuditTrail()` | `2a795848` | đọc (view) | `address` |
| `branchCoOwnerFullAccess(address,uint256,address)` | `a3bc2377` | đọc (view) | `bool` |
| `branchCoOwnerProfiles(address,address)` | `f4b23c05` | đọc (view) | `address,string,string,bool,bool,uint256,uint256` |
| `branchCoOwners(address,uint256,address)` | `0d7a5057` | đọc (view) | `bool` |
| `branchManagement()` | `3f8bc0b9` | đọc (view) | `address` |
| `branchManagerProfiles(address,address)` | `d1f1954b` | đọc (view) | `address,string,string,bool,uint256,uint256` |
| `branchManagers(address,uint256,address)` | `4e53b570` | đọc (view) | `bool` |
| `branchMembers(address,uint256,address)` | `e234e5f7` | đọc (view) | `bool` |
| `branchStaff(address,uint256,address)` | `48d4741f` | đọc (view) | `bool` |
| `canManageAccess(address,uint256,address)` | `9a719d3d` | đọc (view) | `bool` |
| `checkRole(address,uint256,uint8,address)` | `d8395a75` | đọc (view) | `bool` |
| `checkRole(uint8,address)` | `0a4033b9` | đọc (view) | `bool` |
| `createAgentDelegation(address,address)` | `8ca1aa37` | ghi (nonpayable) | `` |
| `dailyActiveStaff(uint256,uint256)` | `3f093329` | đọc (view) | `address` |
| `dailyActiveStaffByBranch(address,uint256,uint256,uint256)` | `4f78d1d8` | đọc (view) | `address` |
| `delegateManager(address,uint256,address)` | `47d3ec88` | ghi (nonpayable) | `` |
| `delegateStaff(address,uint256,address)` | `148076e5` | ghi (nonpayable) | `` |
| `delegateToAgent(address)` | `4dd218fd` | đọc (view) | `address` |
| `delegations(address,address)` | `c64814dd` | đọc (view) | `address,address,uint256,address,bool,uint256` |
| `getAWorkingShift(address,uint256,uint256)` | `9f9fd52a` | đọc (view) | `tuple` |
| `getActiveDelegations(address)` | `de314f48` | đọc (view) | `tuple[]` |
| `getAgent()` | `f551eb19` | ghi (nonpayable) | `address` |
| `getAgentCoOwnerProfiles(address)` | `b93b4e70` | đọc (view) | `tuple[]` |
| `getAgentCoOwnerWallets(address)` | `c42045e4` | đọc (view) | `address[]` |
| `getAgentManagerProfiles(address)` | `53443669` | đọc (view) | `tuple[]` |
| `getAgentManagerWallets(address)` | `59880ae7` | đọc (view) | `address[]` |
| `getAllDelegations(address)` | `08ecd5c0` | đọc (view) | `tuple[]` |
| `getBranchId()` | `5d1a9e6d` | ghi (nonpayable) | `uint256` |
| `getDelegationInfo(address,address)` | `9abd6305` | đọc (view) | `tuple` |
| `getMyRoleSummary()` | `103ab9c1` | đọc (view) | `tuple` |
| `getUserRoleSummary(address)` | `b571dd42` | đọc (view) | `tuple` |
| `getUserRoleSummary(address,uint256,address)` | `6b5c07c5` | đọc (view) | `tuple` |
| `getWorkingShifts(address,uint256)` | `78717c0c` | đọc (view) | `tuple[]` |
| `hasExplicitPermission(address,uint256,address,bytes32)` | `b9c70306` | đọc (view) | `bool` |
| `hasPermission(address,uint256,address,bytes32)` | `566a7e46` | đọc (view) | `bool` |
| `historyTracking()` | `1d32c1f3` | đọc (view) | `address` |
| `initialize(address,address,uint256)` | `1794bb3c` | ghi (nonpayable) | `` |
| `isAdmin(address,address)` | `91006745` | đọc (view) | `bool` |
| `isBranchManager(address,uint256,address)` | `bcd842ea` | đọc (view) | `bool` |
| `isBranchManagerWallet(address)` | `f05e4752` | đọc (view) | `bool` |
| `isDailyActive(uint256,address)` | `169f14e9` | đọc (view) | `bool` |
| `isDailyActiveByBranch(address,uint256,uint256,address)` | `28089e58` | đọc (view) | `bool` |
| `isDelegateActive(address,address)` | `259099f8` | đọc (view) | `bool` |
| `isDelegateAuthorized(address,uint256,address,bytes32)` | `0f888e75` | đọc (view) | `bool` |
| `isMonthlyActive(uint256,address)` | `60fccbb2` | đọc (view) | `bool` |
| `isStaff(address,uint256,address)` | `cfbe463b` | đọc (view) | `bool` |
| `mAddToStaff(address)` | `60e44566` | đọc (view) | `address,string,string,string,string,string,uint8,bool,string,string` |
| `mPosition(string)` | `ca772255` | đọc (view) | `uint256,string` |
| `monthlyActiveStaff(uint256,uint256)` | `86d3a7af` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `positions(uint256)` | `99fbab88` | đọc (view) | `uint256,string` |
| `principals(address,uint256,address)` | `93fe5c6f` | đọc (view) | `uint8,bool,uint256,uint256` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `rebuildDailyActiveStaffByBranch(address,uint256,uint256,uint256,uint256)` | `98de440f` | ghi (nonpayable) | `` |
| `rebuildStaffIndexes(uint256,uint256)` | `9f61cc9b` | ghi (nonpayable) | `uint256,bool` |
| `rebuildStaffWalletsByAgentBranchIndex(address,uint256,uint256,uint256)` | `77aebaac` | ghi (nonpayable) | `uint256,bool` |
| `removeStaff(address,uint256,address)` | `9b519ea0` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `requireStaffWithPermission(address,uint256,address,bytes32)` | `6c977423` | đọc (view) | `` |
| `revokeDelegation(address,address)` | `785f99c3` | ghi (nonpayable) | `` |
| `setAgentAdd(address,uint256)` | `f11b7dac` | ghi (nonpayable) | `` |
| `setAgentAdmin(address,address,bool)` | `2bb3c980` | ghi (nonpayable) | `` |
| `setAgentCoOwner(address,address,bool,bool)` | `494a155b` | ghi (nonpayable) | `` |
| `setBranchAuditTrail(address)` | `6b55acf2` | ghi (nonpayable) | `` |
| `setBranchCoOwner(address,uint256,address,string,string,bool,bool)` | `5ac6d8ff` | ghi (nonpayable) | `` |
| `setBranchManagement(address)` | `f913829d` | ghi (nonpayable) | `` |
| `setBranchManager(address,uint256[],address,string,string,bool)` | `ada722aa` | ghi (nonpayable) | `` |
| `setCoOwner(address,uint256,address,bool,bool)` | `79e50d8c` | ghi (nonpayable) | `` |
| `setHistoryTracking(address)` | `ad9ea445` | ghi (nonpayable) | `` |
| `setMember(address,uint256,address,bool)` | `e8457ad5` | ghi (nonpayable) | `` |
| `setPermission(address,uint256,address,bytes32,bool)` | `7e1d16ec` | ghi (nonpayable) | `` |
| `setPermissions(address,uint256,address,bytes32[],bool)` | `eea12525` | ghi (nonpayable) | `` |
| `setRoleForCoOwner(address)` | `2b74d516` | ghi (nonpayable) | `` |
| `setStaff(address,uint256,address,bool)` | `235780b4` | ghi (nonpayable) | `` |
| `setStaffAgentStore(address)` | `fa228a9d` | ghi (nonpayable) | `` |
| `setSystemOperator(address,bool)` | `fd351072` | ghi (nonpayable) | `` |
| `setTimeKeeping(address)` | `13eeb7fc` | ghi (nonpayable) | `` |
| `staffAgentStore()` | `5b722210` | đọc (view) | `address` |
| `staffCreatedDate(address)` | `bf074a7b` | đọc (view) | `uint256` |
| `staffIndexPlusOne(address)` | `7c4ed986` | đọc (view) | `uint256` |
| `staffLastActiveDate(address)` | `55df2fb9` | đọc (view) | `uint256` |
| `staffWalletIndexPlusOne(bytes32)` | `7d7c6d30` | đọc (view) | `uint256` |
| `staffWalletsByAgentBranch(address,uint256,uint256)` | `4bc2eae6` | đọc (view) | `address` |
| `staffs(uint256)` | `498d4707` | đọc (view) | `address,string,string,string,string,string,uint8,bool,string,string` |
| `systemOperators(address)` | `0059c6c8` | đọc (view) | `bool` |
| `timeKeeping()` | `82691ba1` | đọc (view) | `address` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |
| `workingShifts(uint256)` | `5f699ba6` | đọc (view) | `string,uint256,uint256,uint256` |

## Event (15)

| Event |
|---|
| `AgentAdminUpdated(address,address,bool,address)` |
| `BranchAuditTrailUpdated(address)` |
| `BranchCoOwnerProfileUpdated(address,address,string,string,uint256[],bool,bool,address)` |
| `BranchManagerProfileUpdated(address,address,string,string,uint256[],bool,address)` |
| `BranchManagerUpdated(address,uint256,address,bool,address)` |
| `CoOwnerUpdated(address,uint256,address,bool,bool,address)` |
| `DelegationCreated(address,address,uint256,uint256)` |
| `DelegationRevoked(address,address,address,uint256)` |
| `Initialized(uint64)` |
| `MemberUpdated(address,uint256,address,bool,address)` |
| `OwnershipTransferred(address,address)` |
| `PermissionUpdated(address,uint256,address,bytes32,bool,address)` |
| `StaffUpdated(address,uint256,address,bool,address)` |
| `SystemOperatorUpdated(address,bool)` |
| `Upgraded(address)` |
