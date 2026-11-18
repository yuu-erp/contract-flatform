# Danh mục file .sol (thô)

> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `68d1d3c`. Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.

Tổng: **114** file (bỏ `.deps/`, `artifacts/`, `.states/`, `net_repo/lib/` sao chép OZ). Contract deploy theo script: 31. File có contract > 24 KB: 16.

| File | Khai báo | Module | Trạng thái gợi ý | Script deploy | Bytecode KB | Dòng |
|---|---|---|---|---|---|---|
| `contracts/EconomyTypes.sol` | EconomyTypes (library) | root | library | — | — | 132 |
| `contracts/branch/AttendanceSystem.sol` | AttendanceSystem | system | đang deploy | `scripts/create_system.js` | AttendanceSystem 35.7 | 1488 |
| `contracts/branch/BMFactory.sol` | BMFactory | system | đang deploy | `scripts/create_system.js` | BMFactory 7.7 | 134 |
| `contracts/branch/BranchManagement.sol` | BranchManagement | system | đang deploy | `scripts/create_system.js` | BranchManagement 46.6 | 2684 |
| `contracts/branch/HistoryTracking.sol` | HistoryTracking | system | đang deploy | `scripts/create_system.js` | HistoryTracking 97.4 | 2042 |
| `contracts/interfaces/IAgent.sol` | IAgentRobot (interface), IBMFactory (interface), IIQRFactory (interface), ILoyaltyFactory (interface), IRestaurantLoyaltySystem (interface), IEconomyVaultAgent (interface), IAgentIQR (interface), IRevenueManager (interface), IMTDToken (interface), IAgentManagement (interface), IORDER (interface), IMANAGEMENT (interface), IREPORT (interface), ITIMEKEEPING (interface), IEnhancedAgent (interface), IStaffAgentStore (interface), IBranchManagement (interface), INetCafeV3Factory (interface), IRobotFactory (interface), IPublicfullDB (interface) | interfaces | interface | — | — | 508 |
| `contracts/interfaces/IBranchAccessManager.sol` | IBranchAccessManager (interface) | interfaces | interface | — | — | 290 |
| `contracts/interfaces/IBranchAuditTrail.sol` | IBranchAuditTrail (interface) | interfaces | interface | — | — | 14 |
| `contracts/interfaces/IBranchPaymentRegistry.sol` | IBranchPaymentRegistry (interface) | interfaces | interface | — | — | 24 |
| `contracts/interfaces/IBranchResourceRegistry.sol` | IBranchResourceRegistry (interface) | interfaces | interface | — | — | 96 |
| `contracts/interfaces/ICard.sol` | — | interfaces | chưa rõ | — | — | 42 |
| `contracts/interfaces/ICardTokenManager.sol` | ICardTokenManager (interface) | interfaces | interface | — | — | 11 |
| `contracts/interfaces/IEconomyVault.sol` | IEconomyVault (interface) | interfaces | interface | — | — | 33 |
| `contracts/interfaces/IFreeGas.sol` | IFreeGas (interface) | interfaces | interface | — | — | 10 |
| `contracts/interfaces/IHistoryTracking.sol` | IHistoryTracking (interface) | interfaces | interface | — | — | 378 |
| `contracts/interfaces/IManagement.sol` | IManagement (interface), ICardTokenManager (interface), IOrder (interface) | interfaces | interface | — | — | 235 |
| `contracts/interfaces/INoti.sol` | INoti (interface) | interfaces | interface | — | — | 29 |
| `contracts/interfaces/INotiService.sol` | INotiService (interface) | interfaces | interface | — | — | 9 |
| `contracts/interfaces/IOrder.sol` | IOrder (interface) | interfaces | interface | — | — | 10 |
| `contracts/interfaces/IPoint.sol` | IPoint (interface) | interfaces | interface | — | — | 456 |
| `contracts/interfaces/IReport.sol` | IRestaurantReporting (interface) | interfaces | interface | — | — | 105 |
| `contracts/interfaces/IRestaurant.sol` | — | interfaces | chưa rõ | — | — | 973 |
| `contracts/interfaces/IRobot.sol` | IStaffRobot (interface), IRobotRegistryV2 (interface), IRobotActiveV2 (interface), IRobotDataUploadTrainingV2 (interface), IRobotObservationTrainingV2 (interface), IRobotTestingV2 (interface), IRobotDashboadV2 (interface), IRobotLocationV2 (interface), IRobotQuestionV2 (interface) | interfaces | bỏ (Robot) | — | — | 49 |
| `contracts/interfaces/ITimeKeeping.sol` | ITimeKeeping (interface) | interfaces | interface | — | — | 240 |
| `contracts/iqr/AgentIQR.sol` | AgentIQR | iqr | đang deploy | `scripts/create_system.js` | AgentIQR 11.1 | 290 |
| `contracts/iqr/IQRFactory.sol` | IQRFactory | iqr | đang deploy | `scripts/create_system.js` | IQRFactory 14.1 | 327 |
| `contracts/iqr/Management.sol` | Management | iqr | đang deploy | `scripts/create_system.js` | Management 100.7 | 4187 |
| `contracts/iqr/RestaurantOrder.sol` | IIQRAgent (interface), RestaurantOrder | iqr | đang deploy | `scripts/create_system.js` | RestaurantOrder 119.7 | 7008 |
| `contracts/iqr/RestaurantReporting.sol` | RestaurantReporting | iqr | đang deploy | `scripts/create_system.js` | RestaurantReporting 36.2 | 1675 |
| `contracts/iqr/legacy/order_new.sol` | — | iqr | legacy | — | — | 3431 |
| `contracts/lib/DateTimeLibrary.sol` | DateTimeLibrary (library) | lib | library | — | — | 307 |
| `contracts/lib/DateTimeTZ.sol` | DateTimeTZ (library) | lib | library | — | — | 140 |
| `contracts/loyalty/LoyaltyFactory.sol` | LoyaltyFactory | loyalty | đang deploy | `scripts/create_system.js` | LoyaltyFactory 9.1 | 289 |
| `contracts/loyalty/LoyaltyFeature.sol` | INetCafeTopUp (interface), LoyaltyFeature | loyalty | base của contract đang deploy | — | LoyaltyFeature 158.5 | 7206 |
| `contracts/loyalty/LoyaltyStorage.sol` | LoyaltyStorage (abstract) | loyalty | base của contract đang deploy | — | — | 366 |
| `contracts/loyalty/PublicfullDB.sol` | ILoyaltyTxReader (interface), IFullDBV1 (interface), PublicfullDB | loyalty | đang deploy | `scripts/create_system.js` | PublicfullDB 25.1 | 1257 |
| `contracts/loyalty/RestaurantLoyaltySystem.sol` | RestaurantLoyaltySystem | loyalty | đang deploy | `scripts/create_system.js` | RestaurantLoyaltySystem 158.5 | 6 |
| `contracts/net_repo/contracts/v2/AuditLogUpgradeable.sol` | — | net | legacy | — | — | 190 |
| `contracts/net_repo/contracts/v2/Constant.sol` | — | net | legacy | — | — | 28 |
| `contracts/net_repo/contracts/v2/NetCafeManagementV2.sol` | NetCafeManagementV2 | net | legacy | — | NetCafeManagementV2 14.6 | 622 |
| `contracts/net_repo/contracts/v2/NetCafeSessionV2.sol` | NetCafeSessionV2 | net | legacy | — | NetCafeSessionV2 8.3 | 335 |
| `contracts/net_repo/contracts/v2/NetCafeSpendV2.sol` | NetCafeSpendV2 | net | legacy | — | NetCafeSpendV2 5.9 | 166 |
| `contracts/net_repo/contracts/v2/NetCafeStaffUpgradeable.sol` | NetCafeStaffUpgradeable (abstract) | net | legacy | — | — | 101 |
| `contracts/net_repo/contracts/v2/NetCafeStationV2.sol` | NetCafeStationV2 | net | legacy | — | NetCafeStationV2 8.5 | 253 |
| `contracts/net_repo/contracts/v2/NetCafeTopUpV2.sol` | NetCafeTopUpV2 | net | legacy | — | NetCafeTopUpV2 18.7 | 661 |
| `contracts/net_repo/contracts/v2/NetCafeUserV2.sol` | NetCafeUserV2 | net | legacy | — | NetCafeUserV2 15.4 | 463 |
| `contracts/net_repo/contracts/v2/interfaces/INetCafeManagementV2.sol` | INetCafeManagementV2 (interface) | net | legacy | — | — | 25 |
| `contracts/net_repo/contracts/v2/interfaces/INetCafeSessionV2.sol` | INetCafeSessionV2 (interface) | net | legacy | — | — | 30 |
| `contracts/net_repo/contracts/v2/interfaces/INetCafeStation.sol` | INetCafeStationV2 (interface) | net | legacy | — | — | 8 |
| `contracts/net_repo/contracts/v2/interfaces/INetCafeUserV2.sol` | INetCafeUserV2 (interface) | net | legacy | — | — | 53 |
| `contracts/net_repo/contracts/v2/interfaces/IStaffManagement.sol` | IStaffManagement (interface) | net | legacy | — | — | 10 |
| `contracts/net_repo/contracts/v3/NetCafeBaseV3.sol` | NetCafeBaseV3 (abstract) | net | base của contract đang deploy | — | — | 173 |
| `contracts/net_repo/contracts/v3/NetCafeDashboardV3.sol` | INetCafeDashboardUserReadV3 (interface), INetCafeDashboardSessionReadV3 (interface), INetCafeDashboardSpendReadV3 (interface), INetCafeDashboardStationReadV3 (interface), NetCafeDashboardV3 | net | đang deploy | `scripts/create_system.js` | NetCafeDashboardV3 24.5 | 766 |
| `contracts/net_repo/contracts/v3/NetCafeManagementV3.sol` | NetCafeManagementV3 | net | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | NetCafeManagementV3 17.7 | 562 |
| `contracts/net_repo/contracts/v3/NetCafeSessionV3.sol` | INetCafeUserReadV3 (interface), INetCafeManagementReadV3 (interface), INetCafeStationNotifyV3 (interface), NetCafeSessionV3 | net | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | NetCafeSessionV3 16.8 | 942 |
| `contracts/net_repo/contracts/v3/NetCafeSpendV3.sol` | NetCafeSpendV3 | net | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | NetCafeSpendV3 6.6 | 186 |
| `contracts/net_repo/contracts/v3/NetCafeStationV3.sol` | INetCafeUserProfileV3 (interface), INetCafeSessionReadV3 (interface), INetCafeManagementMetaV3 (interface), NetCafeStationV3 | net | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | NetCafeStationV3 10.0 | 391 |
| `contracts/net_repo/contracts/v3/NetCafeTopUpV3.sol` | INetCafeUserBasicV3 (interface), INetCafeSessionValidatorV3 (interface), NetCafeTopUpV3 | net | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | NetCafeTopUpV3 15.9 | 612 |
| `contracts/net_repo/contracts/v3/NetCafeUserV3 copy.sol` | — | net | bản sao | — | — | 835 |
| `contracts/net_repo/contracts/v3/NetCafeUserV3.sol` | INetCafeSessionOpenV3 (interface), NetCafeUserV3 | net | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | NetCafeUserV3 27.2 | 934 |
| `contracts/net_repo/contracts/v3/NetCafeV3Factory.sol` | NetCafeV3Factory | net | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | NetCafeV3Factory 13.2 | 456 |
| `contracts/net_repo/contracts/v3/interfaces/INetCafeSharedV3.sol` | IBranchModuleRegistryV3 (interface), IBranchAccessManagerV3 (interface), IEconomyVaultV3 (interface), IBranchPaymentRegistryV3 (interface), IBranchResourceRegistryV3 (interface) | net | interface | — | — | 80 |
| `contracts/net_repo/contracts/v3/mocks/NetCafeDashboardLogMocks.sol` | MockModuleRegistryV3, MockAccessManagerV3, MockResourceRegistryV3, MockEconomyVaultV3, MockPointForNet | net | mock | — | MockModuleRegistryV3 0.1; MockAccessManagerV3 0.3; MockResourceRegistryV3 0.1; MockEconomyVaultV3 0.2; MockPointForNet 0.7 | 71 |
| `contracts/robot/AgentRobot.sol` | AgentRobot | robot | bỏ (Robot) | — | AgentRobot 4.2 | 257 |
| `contracts/robot/RobotFactory.sol` | RobotFactory | robot | bỏ (Robot) | `scripts/create_system.js` | RobotFactory 23.3 | 386 |
| `contracts/robot/RobotStaffManagement.sol` | RobotStaffManagement | robot | bỏ (Robot) | `scripts/create_system.js` | RobotStaffManagement 14.5 | 684 |
| `contracts/robot/StaffRobot.sol` | — | robot | bỏ (Robot) | — | — | 788 |
| `contracts/sc-robotcontroller/contract/Constant.sol` | — | robot | bỏ (Robot) | — | — | 12 |
| `contracts/sc-robotcontroller/contract/RobotActiveV1.sol` | RobotActive | robot | bỏ (Robot) | `scripts/create_system.js` | RobotActive 9.6 | 457 |
| `contracts/sc-robotcontroller/contract/RobotDashBoardV1.sol` | RobotCheckpoint | robot | bỏ (Robot) | `scripts/create_system.js` | RobotCheckpoint 14.7 | 735 |
| `contracts/sc-robotcontroller/contract/RobotLoadDataV1.sol` | RobotDataUploadTraining | robot | bỏ (Robot) | `scripts/create_system.js` | RobotDataUploadTraining 16.1 | 516 |
| `contracts/sc-robotcontroller/contract/RobotLocationV1.sol` | RobotLocation | robot | bỏ (Robot) | `scripts/create_system.js` | RobotLocation 4.3 | 118 |
| `contracts/sc-robotcontroller/contract/RobotQuestionV1.sol` | RobotQuestion | robot | bỏ (Robot) | `scripts/create_system.js` | RobotQuestion 4.3 | 60 |
| `contracts/sc-robotcontroller/contract/RobotRegistryV1.sol` | RobotRegistry | robot | bỏ (Robot) | `scripts/create_system.js` | RobotRegistry 10.5 | 410 |
| `contracts/sc-robotcontroller/contract/RobotStaffUpgradeable.sol` | RobotStaffUpgradeable (abstract) | robot | bỏ (Robot) | — | — | 99 |
| `contracts/sc-robotcontroller/contract/RobotTestingV1.sol` | RobotTesting | robot | bỏ (Robot) | `scripts/create_system.js` | RobotTesting 16.7 | 662 |
| `contracts/sc-robotcontroller/contract/RobotTrainV1.sol` | RobotObservationTraining | robot | bỏ (Robot) | `scripts/create_system.js` | RobotObservationTraining 16.1 | 654 |
| `contracts/sc-robotcontroller/contract/interfaces/IRobotRegistry.sol` | IRobotRegistry (interface) | robot | bỏ (Robot) | — | — | 49 |
| `contracts/sc-robotcontroller/contract/interfaces/IStaffManagementV1.sol` | IStaffManagementV1 (interface) | robot | bỏ (Robot) | — | — | 11 |
| `contracts/sc-robotcontroller/contract_old/interfaces/IRobotRegistry.sol` | IRobotRegistry (interface) | robot | bỏ (Robot) | — | — | 49 |
| `contracts/sc-robotcontroller/contract_old/interfaces/IRobotRegistryV2.sol` | IRobotRegistryV2 (interface) | robot | bỏ (Robot) | — | — | 38 |
| `contracts/sc-robotcontroller/contract_old/robotV2_9.3/RobotActiveV2.sol` | RobotActiveV2 | robot | bỏ (Robot) | — | RobotActiveV2 8.6 | 437 |
| `contracts/sc-robotcontroller/contract_old/robotV2_9.3/RobotDashboardV2.sol` | RobotCheckpointV2 | robot | bỏ (Robot) | — | RobotCheckpointV2 11.2 | 681 |
| `contracts/sc-robotcontroller/contract_old/robotV2_9.3/RobotLoadDataV2.sol` | RobotDataUploadTrainingV2 | robot | bỏ (Robot) | — | RobotDataUploadTrainingV2 11.2 | 468 |
| `contracts/sc-robotcontroller/contract_old/robotV2_9.3/RobotRegistryV2.sol` | RobotRegistryV2 | robot | bỏ (Robot) | — | RobotRegistryV2 8.8 | 420 |
| `contracts/sc-robotcontroller/contract_old/robotV2_9.3/RobotTestingV2.sol` | RobotTestingV2 | robot | bỏ (Robot) | — | RobotTestingV2 12.2 | 607 |
| `contracts/sc-robotcontroller/contract_old/robotV2_9.3/RobotTrainV2.sol` | RobotObservationTrainingV2 | robot | bỏ (Robot) | — | RobotObservationTrainingV2 13.2 | 587 |
| `contracts/sc-robotcontroller/contract_old/robotV2_9.3/RobotUUPSProxy.sol` | RobotUUPSProxy | robot | bỏ (Robot) | — | RobotUUPSProxy 0.1 | 52 |
| `contracts/sc-robotcontroller/contract_old/robotV2_old/RobotActiveV2.sol` | RobotActiveV2 | robot | bỏ (Robot) | — | RobotActiveV2 8.1 | 433 |
| `contracts/sc-robotcontroller/contract_old/robotV2_old/RobotDashboardV2.sol` | RobotDashboard | robot | bỏ (Robot) | — | RobotDashboard 8.3 | 482 |
| `contracts/sc-robotcontroller/contract_old/robotV2_old/RobotLoadDataV2.sol` | RobotDataUploadTrainingV2 | robot | bỏ (Robot) | — | RobotDataUploadTrainingV2 10.3 | 412 |
| `contracts/sc-robotcontroller/contract_old/robotV2_old/RobotRegistryV2.sol` | RobotRegistryV2 | robot | bỏ (Robot) | — | RobotRegistryV2 8.3 | 416 |
| `contracts/sc-robotcontroller/contract_old/robotV2_old/RobotTrainV2.sol` | RobotObservationTrainingV2 | robot | bỏ (Robot) | — | RobotObservationTrainingV2 12.3 | 523 |
| `contracts/sc-robotcontroller/contract_old/robotV2_old/RobotUUPSProxy.sol` | RobotUUPSProxy | robot | bỏ (Robot) | — | RobotUUPSProxy 0.1 | 52 |
| `contracts/shared/AccessConstants.sol` | AccessConstants (library) | shared | library | — | — | 33 |
| `contracts/shared/AgentModuleProvisioner.sol` | AgentModuleProvisioner | shared | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | AgentModuleProvisioner 9.7 | 350 |
| `contracts/shared/BranchAccessControlled.sol` | BranchAccessControlled (abstract) | shared | base của contract đang deploy | — | — | 66 |
| `contracts/shared/BranchAccessManager.sol` | BranchAccessManager | shared | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | BranchAccessManager 54.3 | 1991 |
| `contracts/shared/BranchAuditTrail.sol` | BranchAuditTrail | shared | chưa rõ | — | BranchAuditTrail 4.4 | 142 |
| `contracts/shared/BranchDashboard copy.sol` | — | shared | bản sao | — | — | 1279 |
| `contracts/shared/BranchDashboard.sol` | IBranchDashboardUserRead (interface), IBranchDashboardSessionRead (interface), IBranchDashboardSpendRead (interface), IBranchDashboardStationRead (interface), IBranchDashboardIqrFactoryRead (interface), IBranchDashboardOrderRead (interface), IBranchDashboardGameRead (interface), IBranchDashboardReportRead (interface), BranchDashboard | shared | đang deploy | `scripts/create_system.js` | BranchDashboard 27.0 | 1478 |
| `contracts/shared/BranchModuleRegistry.sol` | BranchModuleRegistry | shared | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | BranchModuleRegistry 5.2 | 213 |
| `contracts/shared/BranchPaymentRegistry.sol` | BranchPaymentRegistry | shared | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | BranchPaymentRegistry 10.5 | 458 |
| `contracts/shared/BranchResourceRegistry.sol` | BranchResourceRegistry | shared | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | BranchResourceRegistry 26.5 | 1753 |
| `contracts/shared/EconomyVault.sol` | EconomyVault | shared | đang deploy | `script/DeployNetCafeV3.s.sol`, `scripts/create_system.js` | EconomyVault 6.3 | 278 |
| `contracts/shared/PromotionCodeLib.sol` | PromotionCodeLib (library) | shared | library | — | — | 14 |
| `contracts/shared/mocks/BranchDashboardMocks.sol` | BranchDashboardMockModuleRegistry, BranchDashboardMockAccessManager, BranchDashboardMockFactory, BranchDashboardMockUser, BranchDashboardMockSession, BranchDashboardMockSpend, BranchDashboardMockStation, BranchDashboardMockGame, BranchServiceDashboardMockIqrFactory, BranchDashboardMockManagement, BranchDashboardMockReport, BranchServiceDashboardMockOrder | shared | mock | — | BranchDashboardMockModuleRegistry 0.4; BranchDashboardMockAccessManager 0.4; BranchDashboardMockFactory 0.9; BranchDashboardMockUser 0.6; BranchDashboardMockSession 2.9; BranchDashboardMockSpend 0.1; BranchDashboardMockStation 0.2; BranchDashboardMockGame 2.6; BranchServiceDashboardMockIqrFactory 0.5; BranchDashboardMockManagement 1.4; BranchDashboardMockReport 2.2; BranchServiceDashboardMockOrder 5.1 | 577 |
| `contracts/system/AgentManagement.sol` | AgentManagement | system | base của contract đang deploy | — | AgentManagement 40.0 | 2332 |
| `contracts/system/EnhancedAgentManagement.sol` | EnhancedAgentManagement, NetCafeV3LicenseManager | system | đang deploy | `scripts/create_system.js` | EnhancedAgentManagement 85.6; NetCafeV3LicenseManager 4.5 | 3120 |
| `contracts/system/FreeGasStorage.sol` | FreeGasStorage | system | đang deploy | `scripts/create_system.js` | FreeGasStorage 2.7 | 39 |
| `contracts/system/MTDToken.sol` | MTDToken | system | chưa rõ | — | MTDToken 5.1 | 151 |
| `contracts/system/RevenueManager.sol` | RevenueManager | system | đang deploy | `scripts/create_system.js` | RevenueManager 13.2 | 790 |
| `contracts/system/StaffAgentStore.sol` | StaffAgentStore | system | đang deploy | `scripts/create_system.js` | StaffAgentStore 6.3 | 157 |
| `contracts/test/MockFullDB.sol` | MockFullDB | test | mock | — | MockFullDB 3.4 | 70 |
