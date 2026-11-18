# LoyaltyFactory — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/loyalty/LoyaltyFactory.sol`. Layout đầy đủ: `../../layout/LoyaltyFactory.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `loyaltyBeacon` | `contract UpgradeableBeacon` | scalar | LoyaltyFactory |
| 1 | 0 | `agentLoyaltyContracts` | `mapping(address => mapping(uint256 => address))` | mapping | LoyaltyFactory |
| 2 | 0 | `deployedContracts` | `address[]` | mảng | LoyaltyFactory |
| 3 | 0 | `enhancedAgent` | `address` | scalar | LoyaltyFactory |
| 4 | 0 | `freeGasSc` | `address` | scalar | LoyaltyFactory |
| 5 | 0 | `publicfullDB` | `address` | scalar | LoyaltyFactory |
| 6 | 0 | `economyVault` | `address` | scalar | LoyaltyFactory |
| 7 | 0 | `__gap` | `uint256[49]` | gap | LoyaltyFactory |
