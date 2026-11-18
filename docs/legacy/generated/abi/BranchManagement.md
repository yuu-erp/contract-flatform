# BranchManagement — ABI

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

## Hàm (93)

| Chữ ký | Selector | Đọc/ghi | Trả về |
|---|---|---|---|
| `AddAndUpdateManager(address,string,string,string,bool,uint256[],bool,bool,bool,bool)` | `ceb52816` | ghi (nonpayable) | `` |
| `MAX_BRANCHES_VIEW()` | `3ccd1a67` | đọc (view) | `uint256` |
| `MAX_MANAGERS_VIEW()` | `79dcfbff` | đọc (view) | `uint256` |
| `PAYMENT_METHOD_COUNT()` | `c6e3f8ea` | đọc (view) | `uint8` |
| `PROPOSAL_EXPIRATION()` | `cc604412` | đọc (view) | `uint256` |
| `StaffAgentStore()` | `323eab01` | đọc (view) | `address` |
| `UPGRADE_INTERFACE_VERSION()` | `ad3cb1cc` | đọc (view) | `string` |
| `agent()` | `f5ff5c76` | đọc (view) | `address` |
| `assignBranchManagerDirect(address,string,string,string,uint256[],bool,bool,bool,bool)` | `e4722556` | ghi (nonpayable) | `` |
| `bootstrapOperator()` | `9060e3a9` | đọc (view) | `address` |
| `branchAccessManager()` | `1f75eab0` | đọc (view) | `address` |
| `branchCounter()` | `1d5b1750` | đọc (view) | `uint256` |
| `branchExists(uint256)` | `82db35a3` | đọc (view) | `bool` |
| `branchIds(uint256)` | `7581fcd0` | đọc (view) | `uint256` |
| `branchNotifications(uint256,uint256)` | `ef6f2b4f` | đọc (view) | `uint256` |
| `branches(uint256)` | `83cc7660` | đọc (view) | `uint256,string,bool,bool` |
| `checkPermissions(address,uint256)` | `b8cc6a42` | đọc (view) | `bool,bool,bool,bool` |
| `createBranch(uint256,string,bool,bool,bool,bool)` | `a4985ad0` | ghi (nonpayable) | `uint256` |
| `createProposal(uint8,uint256,bytes,bytes)` | `b4dbe57e` | ghi (nonpayable) | `uint256` |
| `currency()` | `e5a6b10f` | đọc (view) | `uint8` |
| `currencyDisplay()` | `bcc9f083` | đọc (view) | `uint8` |
| `deactivateBranch(uint256)` | `56c8d80b` | ghi (nonpayable) | `` |
| `decodeAbiAddManager(bytes)` | `bd87d4fb` | đọc (view) | `address,string,string,string,uint256[],bool,bool,bool,bool` |
| `decodeAbiPaymentAccount(bytes)` | `ac7d2ca9` | đọc (view) | `string,string,string,string,string` |
| `decodeAbiRemoveManager(bytes)` | `8434ed61` | đọc (view) | `address` |
| `enableNetV3ForBranch(uint256)` | `26cf0c0d` | ghi (nonpayable) | `` |
| `enhancedAgentSc()` | `8629c417` | đọc (view) | `address` |
| `freeGasSc()` | `03434143` | đọc (view) | `address` |
| `getAllBranches()` | `3c0eadb0` | đọc (view) | `tuple[]` |
| `getAllCoOwnerManagers()` | `8e5c3932` | đọc (view) | `tuple[]` |
| `getAllCoOwnerManagersPagination(uint256,uint256)` | `8e00e216` | đọc (view) | `tuple[],uint256,uint256` |
| `getAllManagers()` | `e6671871` | đọc (view) | `tuple[]` |
| `getAllManagersByBranchPagination(uint256,uint256,uint256)` | `48f4cf8c` | đọc (view) | `tuple[],uint256,uint256` |
| `getAllManagersPagination(uint256,uint256)` | `97b4dfa2` | đọc (view) | `tuple[],uint256,uint256` |
| `getAllPaymentMethodStatus()` | `d4929df1` | đọc (view) | `bool[]` |
| `getAllProposalsPaginated(uint256,uint256)` | `9d5eb893` | đọc (view) | `tuple` |
| `getBranchManagerWallets(uint256)` | `5dd903ca` | đọc (view) | `address[]` |
| `getBranchManagers(uint256)` | `0b34bf96` | đọc (view) | `tuple[]` |
| `getBranchProposals(uint256)` | `0fd95456` | đọc (view) | `uint256[]` |
| `getBranchProposalsByStatusPaginated(uint256,uint8,uint256,uint256)` | `7f355a28` | đọc (view) | `tuple` |
| `getBranchProposalsPaginated(uint256,uint256,uint256)` | `ce40bc06` | đọc (view) | `tuple` |
| `getCurrentDisplay()` | `1dbdd5d5` | đọc (view) | `uint8,uint8` |
| `getMainBranchId()` | `bc9f316e` | đọc (view) | `uint256` |
| `getManagerBranches(address)` | `2f51f7ac` | đọc (view) | `tuple[]` |
| `getManagerDashboard(address)` | `49428af2` | đọc (view) | `tuple,tuple[],uint256[],uint256` |
| `getManagerDashboardProposal(address,uint256,uint256)` | `be6c00af` | đọc (view) | `tuple` |
| `getManagerDashboardProposalAllBranches(address,uint256,uint256)` | `ebedcc8d` | đọc (view) | `tuple[]` |
| `getManagerDashboardProposalByBranch(address,uint256,uint256,uint256)` | `5d378ab3` | đọc (view) | `tuple` |
| `getManagerProposalStats(address)` | `05e75a59` | đọc (view) | `uint256,uint256,uint256,uint256` |
| `getProposalDetails(uint256)` | `3b4d01a7` | đọc (view) | `address,uint8,uint256,uint8,uint256,uint256,uint256,uint256` |
| `getProposalsByStatusPaginated(uint8,uint256,uint256)` | `21fb3671` | đọc (view) | `tuple` |
| `getSystemStats()` | `d1ce59a7` | đọc (view) | `uint256,uint256,uint256,uint256,uint256,uint256` |
| `getUserNotificationsByBranch(address,uint256)` | `94e8f3b8` | đọc (view) | `tuple[]` |
| `historyTrackingIMP()` | `a4d34838` | đọc (view) | `address` |
| `initialize(address,address,address)` | `c0c53b8b` | ghi (nonpayable) | `` |
| `iqrFactorySc()` | `32647764` | đọc (view) | `address` |
| `isMainOwner(address)` | `2b53caa6` | đọc (view) | `bool` |
| `mBranchIdToHistoryTrack(uint256)` | `b9f585f2` | đọc (view) | `address` |
| `mPaymentMethodActive(uint8)` | `a9d4034a` | đọc (view) | `bool` |
| `mainBranchId()` | `d5402e26` | đọc (view) | `uint256` |
| `mainMerchantId()` | `df4f8df4` | đọc (view) | `uint256` |
| `markNotificationAsRead(uint256)` | `99f9b888` | ghi (nonpayable) | `` |
| `merchantName()` | `d9c973e2` | đọc (view) | `string` |
| `netCafeFactorySc()` | `7d1020d7` | đọc (view) | `address` |
| `notificationCounter()` | `a6ad15fb` | đọc (view) | `uint256` |
| `notifications(uint256)` | `34c1f944` | đọc (view) | `uint256,uint256,address,string,string,uint256,bool,uint256` |
| `paymentInfo()` | `4af1b0b5` | đọc (view) | `string,string,string,string,string` |
| `paymentOrder()` | `f2581681` | đọc (view) | `uint8` |
| `proposalCounter()` | `0c0512e9` | đọc (view) | `uint256` |
| `proposalHasVoted(uint256,address)` | `57c70c04` | đọc (view) | `bool` |
| `proposalIds(uint256)` | `9b644a23` | đọc (view) | `uint256` |
| `proposalVoteChoice(uint256,address)` | `40c4f17f` | đọc (view) | `bool` |
| `proposals(uint256)` | `013cf08b` | đọc (view) | `uint256,address,uint8,uint256,bytes,bytes,uint8,uint256,uint256,uint256,uint256,uint256` |
| `proxiableUUID()` | `52d1902d` | đọc (view) | `bytes32` |
| `removeManager(address)` | `ac18de43` | ghi (nonpayable) | `` |
| `robotFactorySc()` | `fe1bb62b` | đọc (view) | `address` |
| `sendNotification(address,uint256,string,string,uint256)` | `7e8084b2` | ghi (nonpayable) | `uint256` |
| `setBranchAccessManager(address)` | `251c420c` | ghi (nonpayable) | `` |
| `setCurrency(uint8,uint8)` | `728a49eb` | ghi (nonpayable) | `` |
| `setFreeGasSc(address)` | `27ce6505` | ghi (nonpayable) | `` |
| `setHistoryTracking(address)` | `ad9ea445` | ghi (nonpayable) | `` |
| `setIqrFactorySC(address,address,address,address)` | `c9d70de4` | ghi (nonpayable) | `` |
| `setMainOwner(address)` | `0c9d4601` | ghi (nonpayable) | `` |
| `setPaymentAccount(string,string,string,string,string)` | `7e75786d` | ghi (nonpayable) | `` |
| `setPaymentMethodStatuses(uint8[],bool[])` | `3c1f58b6` | ghi (nonpayable) | `` |
| `setPaymentOrder(uint8)` | `502ac60c` | ghi (nonpayable) | `` |
| `setStaffAgentStore(address)` | `fa228a9d` | ghi (nonpayable) | `` |
| `updateBranch(uint256,string)` | `ec29699c` | ghi (nonpayable) | `` |
| `updateVotingThreshold(uint256)` | `6e3cfd42` | ghi (nonpayable) | `` |
| `upgradeToAndCall(address,bytes)` | `4f1ef286` | ghi (payable) | `` |
| `userNotifications(address,uint256)` | `38c91910` | đọc (view) | `uint256` |
| `voteProposal(uint256,bool)` | `bcfb9b61` | ghi (nonpayable) | `` |
| `votingThreshold()` | `62827733` | đọc (view) | `uint256` |

## Event (13)

| Event |
|---|
| `BranchCreated(uint256,string)` |
| `BranchDeactivated(uint256)` |
| `BranchUpdated(uint256,string)` |
| `HistoryTrackingUpdated(address)` |
| `Initialized(uint64)` |
| `ManagerAdded(address,bool,uint256[])` |
| `ManagerRemoved(address)` |
| `ManagerUpdated(address)` |
| `NotificationSent(uint256,address,uint256)` |
| `ProposalCreated(uint256,address,uint8,uint256)` |
| `ProposalExecuted(uint256,uint8)` |
| `ProposalVoted(uint256,address,bool)` |
| `Upgraded(address)` |
