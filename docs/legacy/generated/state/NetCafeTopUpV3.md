# NetCafeTopUpV3 — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/net_repo/contracts/v3/NetCafeTopUpV3.sol`. Layout đầy đủ: `../../layout/NetCafeTopUpV3.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `agent` | `address` | scalar | NetCafeTopUpV3 |
| 1 | 0 | `branchId` | `uint256` | scalar | NetCafeTopUpV3 |
| 2 | 0 | `moduleRegistry` | `contract IBranchModuleRegistryV3` | scalar | NetCafeTopUpV3 |
| 3 | 0 | `accessManager` | `contract IBranchAccessManagerV3` | scalar | NetCafeTopUpV3 |
| 4 | 0 | `netCafeFactory` | `address` | scalar | NetCafeTopUpV3 |
| 5 | 0 | `__gap` | `uint256[44]` | gap | NetCafeTopUpV3 |
| 49 | 0 | `userContract` | `contract INetCafeUserBasicV3` | scalar | NetCafeTopUpV3 |
| 50 | 0 | `sessionContract` | `contract INetCafeSessionValidatorV3` | scalar | NetCafeTopUpV3 |
| 51 | 0 | `economyVault` | `contract IEconomyVaultV3` | scalar | NetCafeTopUpV3 |
| 52 | 0 | `paymentRegistry` | `contract IBranchPaymentRegistryV3` | scalar | NetCafeTopUpV3 |
| 53 | 0 | `loyaltyPoints` | `contract IPoint` | scalar | NetCafeTopUpV3 |
| 54 | 0 | `paymentConfig` | `struct NetCafeTopUpV3.PaymentConfig` | struct | NetCafeTopUpV3 |
| 55 | 0 | `topUpRequests` | `mapping(bytes32 => struct NetCafeTopUpV3.TopUpRequest)` | mapping | NetCafeTopUpV3 |
| 56 | 0 | `pendingTopUps` | `bytes32[]` | mảng | NetCafeTopUpV3 |
| 57 | 0 | `handledTopUpIds` | `bytes32[]` | mảng | NetCafeTopUpV3 |
| 58 | 0 | `topUpHistory` | `mapping(address => bytes32[])` | mapping | NetCafeTopUpV3 |
| 59 | 0 | `refCodeToId` | `mapping(string => bytes32)` | mapping | NetCafeTopUpV3 |
| 60 | 0 | `shortCodeCounter` | `uint256` | scalar | NetCafeTopUpV3 |
| 61 | 0 | `topUpPcId` | `mapping(bytes32 => bytes32)` | mapping | NetCafeTopUpV3 |
| 62 | 0 | `__gap` | `uint256[41]` | gap | NetCafeTopUpV3 |
