# Contract đang deploy (theo script)

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Suy từ `scripts/create_system.js`, `script/DeployNetCafeV3.s.sol` (tên contract trong `deployImpl`/`deployProxy`/`getContractFactory`/`new`). Đối chiếu với danh sách agent/chi nhánh thật khi người dùng gửi.

| Contract | File | KB | Biến storage (trừ gap) | mapping / mảng / struct / scalar | Hàm / event |
|---|---|---|---|---|---|
| AgentIQR | `contracts/iqr/AgentIQR.sol` | 11.1 | 20 | 2 / 1 / 0 / 17 | 39 / 8 |
| AgentModuleProvisioner | `contracts/shared/AgentModuleProvisioner.sol` | 9.7 | 6 | 1 / 0 / 0 / 5 | 29 / 9 |
| AttendanceSystem | `contracts/branch/AttendanceSystem.sol` | 35.7 | 28 | 12 / 3 / 1 / 12 | 67 / 10 |
| BMFactory | `contracts/branch/BMFactory.sol` | 7.7 | 10 | 1 / 0 / 0 / 9 | 25 / 4 |
| BranchAccessManager | `contracts/shared/BranchAccessManager.sol` | 54.3 | 48 | 38 / 3 / 0 / 7 | 133 / 15 |
| BranchDashboard | `contracts/shared/BranchDashboard.sol` | 27.0 | 4 | 0 / 0 / 0 / 4 | 50 / 3 |
| BranchManagement | `contracts/branch/BranchManagement.sol` | 46.6 | 33 | 10 / 2 / 1 / 20 | 93 / 13 |
| BranchModuleRegistry | `contracts/shared/BranchModuleRegistry.sol` | 5.2 | 4 | 4 / 0 / 0 / 0 | 23 / 7 |
| BranchPaymentRegistry | `contracts/shared/BranchPaymentRegistry.sol` | 10.5 | 6 | 3 / 0 / 0 / 3 | 26 / 11 |
| BranchResourceRegistry | `contracts/shared/BranchResourceRegistry.sol` | 26.5 | 12 | 10 / 0 / 0 / 2 | 68 / 13 |
| EconomyVault | `contracts/shared/EconomyVault.sol` | 6.3 | 7 | 6 / 0 / 0 / 1 | 23 / 6 |
| EnhancedAgentManagement | `contracts/system/EnhancedAgentManagement.sol` | 85.6 | 50 | 29 / 2 / 0 / 19 | 149 / 27 |
| FreeGasStorage | `contracts/system/FreeGasStorage.sol` | 2.7 | 2 | 1 / 0 / 0 / 1 | 11 / 4 |
| HistoryTracking | `contracts/branch/HistoryTracking.sol` | 97.4 | 18 | 17 / 1 / 0 / 0 | 113 / 7 |
| IQRFactory | `contracts/iqr/IQRFactory.sol` | 14.1 | 25 | 3 / 1 / 1 / 20 | 53 / 5 |
| LoyaltyFactory | `contracts/loyalty/LoyaltyFactory.sol` | 9.1 | 7 | 1 / 1 / 0 / 5 | 31 / 5 |
| Management | `contracts/iqr/Management.sol` | 100.7 | 83 | 47 / 15 / 2 / 19 | 227 / 12 |
| NetCafeDashboardV3 | `contracts/net_repo/contracts/v3/NetCafeDashboardV3.sol` | 24.5 | 19 | 12 / 1 / 0 / 6 | 37 / 4 |
| NetCafeManagementV3 | `contracts/net_repo/contracts/v3/NetCafeManagementV3.sol` | 17.7 | 15 | 5 / 3 / 1 / 6 | 48 / 18 |
| NetCafeSessionV3 | `contracts/net_repo/contracts/v3/NetCafeSessionV3.sol` | 16.8 | 54 | 44 / 0 / 0 / 10 | 82 / 9 |
| NetCafeSpendV3 | `contracts/net_repo/contracts/v3/NetCafeSpendV3.sol` | 6.6 | 13 | 5 / 0 / 0 / 8 | 34 / 6 |
| NetCafeStationV3 | `contracts/net_repo/contracts/v3/NetCafeStationV3.sol` | 10.0 | 13 | 3 / 0 / 0 / 10 | 41 / 10 |
| NetCafeTopUpV3 | `contracts/net_repo/contracts/v3/NetCafeTopUpV3.sol` | 15.9 | 18 | 4 / 2 / 1 / 11 | 51 / 13 |
| NetCafeUserV3 | `contracts/net_repo/contracts/v3/NetCafeUserV3.sol` | 27.2 | 29 | 19 / 2 / 0 / 8 | 67 / 17 |
| NetCafeV3Factory | `contracts/net_repo/contracts/v3/NetCafeV3Factory.sol` | 13.2 | 11 | 2 / 0 / 1 / 8 | 27 / 7 |
| PublicfullDB | `contracts/loyalty/PublicfullDB.sol` | 25.1 | 10 | 8 / 0 / 0 / 2 | 68 / 8 |
| RestaurantLoyaltySystem | `contracts/loyalty/RestaurantLoyaltySystem.sol` | 158.5 | 145 | 92 / 17 / 0 / 36 | 314 / 58 |
| RestaurantOrder | `contracts/iqr/RestaurantOrder.sol` | 119.7 | 89 | 65 / 5 / 1 / 18 | 216 / 46 |
| RestaurantReporting | `contracts/iqr/RestaurantReporting.sol` | 36.2 | 71 | 62 / 1 / 0 / 8 | 154 / 2 |
| RevenueManager | `contracts/system/RevenueManager.sol` | 13.2 | 9 | 4 / 2 / 1 / 2 | 40 / 7 |
| StaffAgentStore | `contracts/system/StaffAgentStore.sol` | 6.3 | 8 | 6 / 0 / 0 / 2 | 26 / 3 |
