// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {BaseTest} from "./BaseTest.sol";
import {MockFullDB} from "./MockFullDB.sol";
import {PlatformAccess} from "../../src/kernel/access/PlatformAccess.sol";
import {Registry} from "../../src/kernel/registry/Registry.sol";
import {HistoryIndex} from "../../src/kernel/history/HistoryIndex.sol";
import {AgentRegistry} from "../../src/tenant/agent/AgentRegistry.sol";
import {BranchRegistry} from "../../src/tenant/branch/BranchRegistry.sol";
import {AgentAccess} from "../../src/tenant/access/AgentAccess.sol";
import {Ledger} from "../../src/shared/ledger/Ledger.sol";
import {MockLedgerPoster} from "./MockLedgerPoster.sol";
import {LedgerMetrics as LM} from "../../src/libraries/LedgerMetrics.sol";
import {SalesSettings} from "../../src/shared/payment/SalesSettings.sol";
import {AgentUserRegistry} from "../../src/tenant/user/AgentUserRegistry.sol";
import {Permission} from "../../src/shared/permission/Permission.sol";
import {Duty} from "../../src/shared/duty/Duty.sol";
import {DelegateRegistry} from "../../src/tenant/delegate/DelegateRegistry.sol";
import {CustomerDesk} from "../../src/shared/desk/CustomerDesk.sol";
import {IBranchRegistry} from "../../src/interfaces/IBranchRegistry.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";

/// @notice Dựng tầng quản trị như khi deploy thật: PlatformAccess → HistoryIndex → AgentRegistry → BranchRegistry,
///         → AgentAccess; owner đăng ký ba contract làm writer (kèm kind được ghi), nối AgentAccess vào AgentRegistry,
///         đặt nguồn vai trò agent cho PlatformAccess và thêm hai admin.
abstract contract PlatformFixture is BaseTest {
    MockFullDB internal fulldb;
    PlatformAccess internal access;
    HistoryIndex internal historyIndex;
    AgentRegistry internal registry;
    BranchRegistry internal branches;
    AgentAccess internal agentAccess;
    SalesSettings internal sales;
    Ledger internal ledger;
    MockLedgerPoster internal poster;
    AgentUserRegistry internal users;
    /// @dev Registry T0 (danh sách module). Lưu ý: `registry` ở fixture là AgentRegistry (tên cũ).
    Registry internal modules;
    Permission internal permission;
    Duty internal duty;
    DelegateRegistry internal delegate;
    CustomerDesk internal desk;

    uint16 internal constant NET = 1;
    uint16 internal constant IQR = 2;
    uint16 internal constant LOYALTY = 4;

    function setUp() public virtual override {
        super.setUp();
        fulldb = installMockFullDB();

        access = PlatformAccess(
            deployProxy(address(new PlatformAccess()), abi.encodeCall(PlatformAccess.initialize, (platformOwner)))
        );
        modules = Registry(deployProxy(address(new Registry()), abi.encodeCall(Registry.initialize, (address(access)))));
        historyIndex = HistoryIndex(
            deployProxy(
                address(new HistoryIndex()), abi.encodeCall(HistoryIndex.initialize, (address(access), address(0)))
            )
        );
        registry = AgentRegistry(
            deployProxy(
                address(new AgentRegistry()),
                abi.encodeCall(AgentRegistry.initialize, (address(access), address(historyIndex)))
            )
        );

        branches = BranchRegistry(
            deployProxy(
                address(new BranchRegistry()),
                abi.encodeCall(BranchRegistry.initialize, (address(access), address(registry), address(historyIndex)))
            )
        );

        agentAccess = AgentAccess(
            deployProxy(
                address(new AgentAccess()),
                abi.encodeCall(
                    AgentAccess.initialize,
                    (address(access), address(registry), address(branches), address(historyIndex))
                )
            )
        );

        sales = SalesSettings(
            deployProxy(
                address(new SalesSettings()),
                abi.encodeCall(
                    SalesSettings.initialize,
                    (address(access), address(registry), address(branches), address(historyIndex))
                )
            )
        );

        ledger = Ledger(
            deployProxy(
                address(new Ledger()),
                abi.encodeCall(
                    Ledger.initialize,
                    (address(access), address(registry), address(branches), address(sales), address(historyIndex))
                )
            )
        );
        poster = new MockLedgerPoster(address(ledger));
        permission = Permission(
            deployProxy(
                address(new Permission()),
                abi.encodeCall(Permission.initialize, (address(access), address(branches), address(agentAccess)))
            )
        );
        duty = Duty(
            deployProxy(
                address(new Duty()),
                abi.encodeCall(
                    Duty.initialize, (address(access), address(branches), address(agentAccess), address(permission))
                )
            )
        );
        users = AgentUserRegistry(
            deployProxy(
                address(new AgentUserRegistry()),
                abi.encodeCall(
                    AgentUserRegistry.initialize,
                    (address(access), address(registry), address(branches), address(agentAccess), address(historyIndex))
                )
            )
        );

        delegate = DelegateRegistry(
            deployProxy(
                address(new DelegateRegistry()),
                abi.encodeCall(DelegateRegistry.initialize, (address(access), address(registry), address(users)))
            )
        );
        desk = CustomerDesk(
            deployProxy(
                address(new CustomerDesk()),
                abi.encodeCall(
                    CustomerDesk.initialize,
                    (address(access), address(branches), address(permission), address(users), address(delegate))
                )
            )
        );

        vm.startPrank(platformOwner);
        historyIndex.setWriter(address(registry), true);
        historyIndex.setWriter(address(branches), true);
        historyIndex.setWriter(address(agentAccess), true);
        historyIndex.setWriter(address(sales), true);
        historyIndex.setWriterKind(address(sales), "platform_audit", true);
        historyIndex.setWriter(address(ledger), true);
        historyIndex.setWriterKind(address(ledger), "ledger", true);
        historyIndex.setWriterKind(address(registry), "platform_agents", true);
        historyIndex.setWriterKind(address(registry), "platform_audit", true);
        historyIndex.setWriterKind(address(branches), "platform_branches", true);
        historyIndex.setWriterKind(address(branches), "platform_audit", true);
        historyIndex.setWriterKind(address(agentAccess), "platform_audit", true);
        historyIndex.setWriter(address(users), true);
        historyIndex.setWriterKind(address(users), "users", true);
        historyIndex.setWriterKind(address(users), "platform_audit", true);
        registry.setAgentAccess(address(agentAccess));
        address[] memory sources = new address[](2);
        sources[0] = address(registry);
        sources[1] = address(agentAccess);
        access.setAgentRoleSources(sources);
        access.addPlatformAdmin(platformAdmin);
        access.addPlatformAdmin(platformAdmin2);
        _registerModules();
        registry.setRegistry(address(modules));
        branches.setRegistry(address(modules));
        _licensePosters();
        permission.setDuty(address(duty));
        users.setOperator(address(desk), true);
        delegate.setOperator(address(desk), true);
        permission.setDelegate(address(delegate));
        duty.setDelegate(address(delegate));
        vm.stopPrank();
    }

    /// @dev Danh mục quyền nền tảng (docs/modules/shared-permission-duty.md mục 1): bit 0..7 Staff, 8..10 chỉ Manager.
    uint64 internal constant CORE_PERMS = 0x7FF;
    uint64 internal constant CORE_MANAGER_ONLY = 0x700;

    uint8 internal constant TOPUP_KINDS = 0x12; // Topup | TopupRefund
    uint8 internal constant SALE_KINDS = 0x6C; // WalletSpend | DirectSale | SaleRefund | Adjust

    /// @dev Giấy phép poster (ADR 0031): thanh toán nền tảng nạp/hoàn nạp; NET, IQR bán hàng. Trong prank owner.
    function _licensePosters() internal {
        ledger.setPoster(address(poster.pay()), 0, TOPUP_KINDS, type(uint128).max);
        ledger.setPoster(address(poster.net()), 1, SALE_KINDS, type(uint128).max);
        ledger.setPoster(address(poster.iqr()), 2, SALE_KINDS, type(uint128).max);
    }

    /// @dev Chỉ số "ảo" cho test đọc bộ đếm Ledger: < 1000 là chỉ số chung trong `rollup`;
    ///      1000·moduleId + offset là bộ đếm module trong `moduleRollup`.
    function _svc(uint16 service, uint256 offset) internal pure returns (uint256) {
        uint256 id = 1;
        while (service > 1) {
            service >>= 1;
            ++id;
        }
        return 1000 * id + offset;
    }

    function _svcRefund(uint16 service) internal pure returns (uint256) {
        return _svc(service, LM.SERVED_HERE_REFUND);
    }

    function _rollCell(uint8 scope, uint64 id, uint32 d, uint256 metric) internal view returns (uint256) {
        if (metric < 1000) return ledger.rollup(scope, id, d, d)[0][metric];
        return ledger.moduleRollup(scope, id, uint8(metric / 1000), d, d)[0][metric % 1000];
    }

    /// @dev Khai báo module như lúc deploy thật (ADR 0030): 0 nền tảng, 1 NET (bán hàng, giá gồm thuế), 2 IQR (bán hàng), 3 Loyalty (cần NET|IQR, không bán hàng).
    ///      Gọi trong prank của platformOwner.
    function _registerModules() internal {
        modules.registerModule(0, "platform", 0, 0, CORE_PERMS, CORE_MANAGER_ONLY);
        uint16 sales_ = modules.FLAG_SALES();
        modules.registerModule(1, "net", 0, sales_ | modules.FLAG_TAX_INCLUSIVE_ONLY(), 0, 0);
        modules.registerModule(2, "iqr", 0, sales_, 0, 0);
        modules.registerModule(3, "loyalty", NET | IQR, 0, 0, 0);
    }

    function _profile(string memory name) internal pure returns (IAgentRegistry.AgentProfile memory) {
        return IAgentRegistry.AgentProfile({
            storeName: name, storeAddress: "1 Le Loi, Q1", note: "", storePhone: "+84 28 1234 5678"
        });
    }

    /// @dev Trần đủ cả ba module, để test cũ tạo chi nhánh NET, IQR hoặc Loyalty được.
    function _createAgent(address owner) internal returns (uint64 id) {
        id = _createAgent(owner, NET | IQR | LOYALTY);
    }

    function _createAgent(address owner, uint16 allowedServices) internal returns (uint64 id) {
        vm.prank(platformAdmin);
        id = registry.createAgent(owner, allowedServices, _profile("Cyber Q1"));
    }

    function _branchProfile(string memory name) internal pure returns (IBranchRegistry.BranchProfile memory) {
        return IBranchRegistry.BranchProfile({
            name: name, location: "12 Nguyen Hue, Q1", phone: "028 3822 0000", longlat: "10.7769,106.7009", note: ""
        });
    }

    function _branchInit(string memory domain, uint16 services)
        internal
        pure
        returns (IBranchRegistry.BranchInit memory)
    {
        return IBranchRegistry.BranchInit({
            domain: domain, services: services, tzOffsetMinutes: 420, profile: _branchProfile("Chi nhanh")
        });
    }

    function _createBranch(uint64 agentId, string memory domain, uint16 services) internal returns (uint64 id) {
        vm.prank(platformAdmin);
        id = branches.createBranch(agentId, _branchInit(domain, services));
    }
}
