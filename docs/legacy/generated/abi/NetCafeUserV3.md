# NetCafeUserV3 — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (67)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `MODULE_NET()` | `27a29fec` | đọc (view) | `bytes32` |
| `PERM_NET_ADMIN()` | `7e882a8e` | đọc (view) | `bytes32` |
| `PERM_NET_PAYMENT_MANAGE()` | `d209430a` | đọc (view) | `bytes32` |
| `PERM_NET_SESSION_MANAGE()` | `474e1a90` | đọc (view) | `bytes32` |
| `PERM_NET_SPEND_VIEW()` | `513f3574` | đọc (view) | `bytes32` |
| `PERM_NET_STATION_MANAGE()` | `8dd5009c` | đọc (view) | `bytes32` |
| `accessManager()` | `fdcb6068` | đọc (view) | `address` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `branchId()` | `9e4ba5ca` | đọc (view) | `uint256` |
| `changePasswordBySession(bytes32,bytes32)` | `49c737d1` | ghi (nonpayable) | `` |
| `changeUsername(address,string)` | `d0cc47bb` | ghi (nonpayable) | `` |
| `createAccountWithPassword(address,string,bytes32,string,string,string,string)` | `a949c5a7` | ghi (nonpayable) | `` |
| `cumulativeRegisteredUsers(uint256)` | `4d37a2be` | đọc (view) | `uint256` |
| `dailyRegisteredUsers(uint256)` | `874c3e9c` | đọc (view) | `uint256` |
| `dailyTotalUsers(uint256)` | `665f2ef3` | đọc (view) | `uint256` |
| `deleteUser(address)` | `5c60f226` | ghi (nonpayable) | `` |
| `economyVault()` | `00ae9de5` | đọc (view) | `address` |
| `editUser(address,string,string,string,string,bytes32)` | `4e8edec8` | ghi (nonpayable) | `` |
| `forceLogout(address)` | `8423d443` | ghi (nonpayable) | `` |
| `generateOTP(address)` | `3b4abc32` | ghi (nonpayable) | `string` |
| `getAddressByIdentity(uint8,string)` | `3fe32c72` | đọc (view) | `address` |
| `getDisplayName(address)` | `1042876d` | đọc (view) | `string` |
| `getTotalUserSnapshotDayAt(uint256)` | `6a1a612a` | đọc (view) | `uint256` |
| `getTotalUserSnapshotDaysLength()` | `19705e8f` | đọc (view) | `uint256` |
| `getTotalUsers()` | `9be572f6` | đọc (view) | `uint256` |
| `getTotalUsersAtDay(uint256)` | `0668ce3c` | đọc (view) | `uint256` |
| `getUserProfile(address)` | `987ee156` | đọc (view) | `tuple` |
| `getUserStationData(address,address,bytes32,bytes32)` | `de1ced58` | đọc (view) | `bool,uint256,uint256,string,string,string` |
| `getUsers(uint256,uint256)` | `45982a66` | đọc (view) | `tuple[]` |
| `getWalletByUsername(string)` | `5e43a145` | đọc (view) | `address` |
| `importTotalUserSnapshotsRange(uint256,uint256)` | `f6ab86eb` | ghi (nonpayable) | `` |
| `initialize(address,address,uint256,address,address)` | `33e1a223` | ghi (nonpayable) | `` |
| `isActive(address)` | `9f8a13d7` | đọc (view) | `bool` |
| `isOnline(address)` | `03e69146` | đọc (view) | `bool` |
| `loginUser(address,string)` | `03bdb46b` | ghi (nonpayable) | `` |
| `loginWithOTP(string,bytes32,uint64,string)` | `9007581f` | ghi (nonpayable) | `address` |
| `loginWithPassword(string,bytes32,bytes32,uint64,string)` | `85e50dda` | ghi (nonpayable) | `address` |
| `logoutUser(address)` | `09df5060` | ghi (nonpayable) | `` |
| `loyaltyPoints()` | `956a20ea` | đọc (view) | `address` |
| `moduleRegistry()` | `b95459e4` | đọc (view) | `address` |
| `monthlyRegisteredUsers(uint256)` | `71212071` | đọc (view) | `uint256` |
| `netCafeFactory()` | `3036fa74` | đọc (view) | `address` |
| `otpOwner(string)` | `f041de09` | đọc (view) | `address` |
| `owner()` | `8da5cb5b` | đọc (view) | `address` |
| `rebuildCumulativeFromPreviousDay(uint256)` | `2e9db9fa` | ghi (nonpayable) | `` |
| `rebuildCumulativeRange(uint256,uint256)` | `36abfc39` | ghi (nonpayable) | `` |
| `rebuildUserIndexes(uint256,uint256)` | `d1050bbc` | ghi (nonpayable) | `uint256,bool` |
| `registerUser(address,string,string,string,string)` | `999eab2b` | ghi (nonpayable) | `` |
| `renounceOwnership()` | `715018a6` | ghi (nonpayable) | `` |
| `sessionContract()` | `a6d861a7` | đọc (view) | `address` |
| `setCumulativeRegisteredUsers(uint256,uint256)` | `e899555f` | ghi (nonpayable) | `` |
| `setEconomyVault(address)` | `c5818c04` | ghi (nonpayable) | `` |
| `setLoyalty(address)` | `e71fb211` | ghi (nonpayable) | `` |
| `setSessionContract(address)` | `d8ac34ee` | ghi (nonpayable) | `` |
| `setSharedRegistries(address,address)` | `a6c4d3e9` | ghi (nonpayable) | `` |
| `snapshotDailyTotalUsers(uint256,uint256)` | `1670bf5f` | ghi (nonpayable) | `` |
| `snapshotYearlyTotalUsers(uint256,uint256)` | `96d2d30a` | ghi (nonpayable) | `` |
| `syncTotalUserSnapshotsFromExistingRange(uint256,uint256)` | `ee1e3d66` | ghi (nonpayable) | `` |
| `totalUserSnapshotDaySeen(uint256)` | `f63a35c9` | đọc (view) | `bool` |
| `transferOwnership(address)` | `f2fde38b` | ghi (nonpayable) | `` |
| `userIndexPlusOne(address)` | `80e33479` | đọc (view) | `uint256` |
| `userList(uint256)` | `9f4216e8` | đọc (view) | `address` |
| `users(address)` | `a87430ba` | đọc (view) | `address,string,string,string,string,string,uint256,bool,bool,uint256,string,string,bytes32` |
| `verifyPassword(string,bytes32)` | `4586cf71` | đọc (view) | `address` |
| `walletUsed(address)` | `b631d5c0` | đọc (view) | `bool` |
| `yearlyRegisteredUsers(uint256)` | `776abe16` | đọc (view) | `uint256` |
| `yearlyTotalUsers(uint256)` | `1f64f846` | đọc (view) | `uint256` |

## Event (17)

| Event |
|---|
| `AccountCreatedWithPassword(address,string)` |
| `AccountPasswordChanged(address)` |
| `AccountProfileUpdated(address,string,string,string,string)` |
| `AccountUsernameChanged(address,string,string)` |
| `EconomyVaultUpdated(address)` |
| `Initialized(uint64)` |
| `LoyaltyUpdated(address)` |
| `OTPGenerated(address,string,uint256)` |
| `OwnershipTransferred(address,address)` |
| `PublicOTPGenerated(address,address,string,uint256)` |
| `SessionContractUpdated(address)` |
| `SharedRegistryUpdated(address,address,address)` |
| `UserDeleted(address)` |
| `UserLogin(address,string,uint256)` |
| `UserLogout(address,uint256)` |
| `UserRegistered(address)` |
| `UserUpdated(address,string,string,string,string)` |
