# EconomyVault — storage

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Nguồn: `contracts/shared/EconomyVault.sol`. Layout đầy đủ: `../../layout/EconomyVault.json`.

| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |
|---|---|---|---|---|---|
| 0 | 0 | `ledgerCounter` | `uint256` | scalar | EconomyVault |
| 1 | 0 | `_balances` | `mapping(address => mapping(uint256 => mapping(address => mapping(bytes32 => uint256))))` | mapping | EconomyVault |
| 2 | 0 | `ledgerEntries` | `mapping(uint256 => struct EconomyVault.LedgerEntry)` | mapping | EconomyVault |
| 3 | 0 | `_accountLedgerIds` | `mapping(address => mapping(uint256 => mapping(address => uint256[])))` | mapping | EconomyVault |
| 4 | 0 | `authorizedModules` | `mapping(address => mapping(uint256 => mapping(address => bool)))` | mapping | EconomyVault |
| 5 | 0 | `moduleProvisioners` | `mapping(address => bool)` | mapping | EconomyVault |
| 6 | 0 | `processedRefs` | `mapping(address => mapping(uint256 => mapping(bytes32 => mapping(bytes32 => bool))))` | mapping | EconomyVault |
| 7 | 0 | `__gap` | `uint256[43]` | gap | EconomyVault |
