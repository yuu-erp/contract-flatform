// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {PlatformAccess} from "../src/kernel/access/PlatformAccess.sol";
import {Registry} from "../src/kernel/registry/Registry.sol";
import {ModuleCatalog} from "./ModuleCatalog.sol";
import {HistoryIndex} from "../src/kernel/history/HistoryIndex.sol";
import {AgentRegistry} from "../src/tenant/agent/AgentRegistry.sol";
import {BranchRegistry} from "../src/tenant/branch/BranchRegistry.sol";
import {AgentAccess} from "../src/tenant/access/AgentAccess.sol";
import {SalesSettings} from "../src/shared/payment/SalesSettings.sol";
import {Ledger} from "../src/shared/ledger/Ledger.sol";
import {AgentUserRegistry} from "../src/tenant/user/AgentUserRegistry.sol";
import {Permission} from "../src/shared/permission/Permission.sol";
import {Duty} from "../src/shared/duty/Duty.sol";
import {DelegateRegistry} from "../src/tenant/delegate/DelegateRegistry.sol";
import {CustomerDesk} from "../src/shared/desk/CustomerDesk.sol";

/// @notice Deploy tầng quản trị: PlatformAccess → Registry (khai báo module mặc định) → HistoryIndex → AgentRegistry → BranchRegistry → AgentAccess → SalesSettings → Ledger → AgentUserRegistry,
///         rồi đăng ký các contract ghi (registry, branches, agentAccess, salesSettings, ledger) làm writer của HistoryIndex (mỗi contract chỉ các kind của nó), nối AgentAccess vào
///         AgentRegistry và đặt AgentRegistry + AgentAccess làm nguồn vai trò agent của PlatformAccess.
///         Không đăng ký poster nào cho Ledger (poster thật là module dịch vụ, ở kế hoạch sau).
///         Hệ đã deploy trước khi có AgentAccess thì dùng `script/DeployAgentAccess.s.sol`.
///         `run()` đọc env và broadcast. `deploy()` không đọc env, để test gọi trực tiếp.
///         Không hard-code khoá. Người dùng tự chạy `make deploy` với `.env`.
contract DeployPlatform is Script {
    struct Deployed {
        address accessProxy;
        address accessImpl;
        address historyProxy;
        address historyImpl;
        address agentsProxy;
        address agentsImpl;
        address branchesProxy;
        address branchesImpl;
        address agentAccessProxy;
        address agentAccessImpl;
        address salesSettingsProxy;
        address salesSettingsImpl;
        address ledgerProxy;
        address ledgerImpl;
        address usersProxy;
        address usersImpl;
        address registryProxy;
        address registryImpl;
        address permissionProxy;
        address permissionImpl;
        address dutyProxy;
        address dutyImpl;
        address delegateProxy;
        address delegateImpl;
        address deskProxy;
        address deskImpl;
        address owner;
        address admin;
    }

    /// @dev `run()` đặt cờ này trước khi gọi `deploy` trong `startBroadcast`.
    ///      Trong broadcast không được `prank` (Foundry tự đặt msg.sender của lời gọi ngoài = signer).
    ///      Test gọi `deploy` trực tiếp thì phải `prank` vì người gọi là contract test, không phải owner.
    bool private _broadcasting;

    /// @param owner PLATFORM_OWNER. Trong `run()` là địa chỉ của `PRIVATE_KEY`.
    /// @param admin PLATFORM_ADMIN, hoặc `address(0)` nếu cấp sau (tab Proxy).
    /// @param fullDB địa chỉ FullDB; `address(0)` để HistoryIndex dùng precompile `0x…0107`.
    function deploy(address owner, address admin, address fullDB) public returns (Deployed memory deployed) {
        deployed.owner = owner;
        deployed.admin = admin;

        deployed.accessImpl = address(new PlatformAccess());
        deployed.accessProxy =
            address(new ERC1967Proxy(deployed.accessImpl, abi.encodeCall(PlatformAccess.initialize, (owner))));

        deployed.registryImpl = address(new Registry());
        deployed.registryProxy = address(
            new ERC1967Proxy(deployed.registryImpl, abi.encodeCall(Registry.initialize, (deployed.accessProxy)))
        );

        deployed.historyImpl = address(new HistoryIndex());
        deployed.historyProxy = address(
            new ERC1967Proxy(
                deployed.historyImpl, abi.encodeCall(HistoryIndex.initialize, (deployed.accessProxy, fullDB))
            )
        );

        deployed.agentsImpl = address(new AgentRegistry());
        deployed.agentsProxy = address(
            new ERC1967Proxy(
                deployed.agentsImpl,
                abi.encodeCall(AgentRegistry.initialize, (deployed.accessProxy, deployed.historyProxy))
            )
        );

        deployed.branchesImpl = address(new BranchRegistry());
        deployed.branchesProxy = address(
            new ERC1967Proxy(
                deployed.branchesImpl,
                abi.encodeCall(
                    BranchRegistry.initialize, (deployed.accessProxy, deployed.agentsProxy, deployed.historyProxy)
                )
            )
        );

        deployed.agentAccessImpl = address(new AgentAccess());
        deployed.agentAccessProxy = address(
            new ERC1967Proxy(
                deployed.agentAccessImpl,
                abi.encodeCall(
                    AgentAccess.initialize,
                    (deployed.accessProxy, deployed.agentsProxy, deployed.branchesProxy, deployed.historyProxy)
                )
            )
        );

        deployed.salesSettingsImpl = address(new SalesSettings());
        deployed.salesSettingsProxy = address(
            new ERC1967Proxy(
                deployed.salesSettingsImpl,
                abi.encodeCall(
                    SalesSettings.initialize,
                    (deployed.accessProxy, deployed.agentsProxy, deployed.branchesProxy, deployed.historyProxy)
                )
            )
        );

        deployed.ledgerImpl = address(new Ledger());
        deployed.ledgerProxy = address(
            new ERC1967Proxy(
                deployed.ledgerImpl,
                abi.encodeCall(
                    Ledger.initialize,
                    (
                        deployed.accessProxy,
                        deployed.agentsProxy,
                        deployed.branchesProxy,
                        deployed.salesSettingsProxy,
                        deployed.historyProxy
                    )
                )
            )
        );

        deployed.usersImpl = address(new AgentUserRegistry());
        deployed.usersProxy = address(
            new ERC1967Proxy(
                deployed.usersImpl,
                abi.encodeCall(
                    AgentUserRegistry.initialize,
                    (
                        deployed.accessProxy,
                        deployed.agentsProxy,
                        deployed.branchesProxy,
                        deployed.agentAccessProxy,
                        deployed.historyProxy
                    )
                )
            )
        );

        deployed.permissionImpl = address(new Permission());
        deployed.permissionProxy = address(
            new ERC1967Proxy(
                deployed.permissionImpl,
                abi.encodeCall(
                    Permission.initialize, (deployed.accessProxy, deployed.branchesProxy, deployed.agentAccessProxy)
                )
            )
        );
        deployed.dutyImpl = address(new Duty());
        deployed.dutyProxy = address(
            new ERC1967Proxy(
                deployed.dutyImpl,
                abi.encodeCall(
                    Duty.initialize,
                    (deployed.accessProxy, deployed.branchesProxy, deployed.agentAccessProxy, deployed.permissionProxy)
                )
            )
        );

        _deployAccounts(deployed);

        HistoryIndex history = HistoryIndex(deployed.historyProxy);
        PlatformAccess access = PlatformAccess(deployed.accessProxy);

        address[] memory sources = new address[](2);
        sources[0] = deployed.agentsProxy;
        sources[1] = deployed.agentAccessProxy;

        if (!_broadcasting) vm.startPrank(owner);
        history.setWriter(deployed.agentsProxy, true);
        history.setWriter(deployed.branchesProxy, true);
        history.setWriter(deployed.agentAccessProxy, true);
        history.setWriter(deployed.salesSettingsProxy, true);
        history.setWriter(deployed.ledgerProxy, true);
        history.setWriterKind(deployed.agentsProxy, "platform_agents", true);
        history.setWriterKind(deployed.agentsProxy, "platform_audit", true);
        history.setWriterKind(deployed.branchesProxy, "platform_branches", true);
        history.setWriterKind(deployed.branchesProxy, "platform_audit", true);
        history.setWriterKind(deployed.agentAccessProxy, "platform_audit", true);
        history.setWriterKind(deployed.salesSettingsProxy, "platform_audit", true);
        history.setWriterKind(deployed.ledgerProxy, "ledger", true);
        history.setWriter(deployed.usersProxy, true);
        history.setWriterKind(deployed.usersProxy, "users", true);
        history.setWriterKind(deployed.usersProxy, "platform_audit", true);
        AgentRegistry(deployed.agentsProxy).setAgentAccess(deployed.agentAccessProxy);
        ModuleCatalog.registerDefaults(Registry(deployed.registryProxy));
        AgentRegistry(deployed.agentsProxy).setRegistry(deployed.registryProxy);
        BranchRegistry(deployed.branchesProxy).setRegistry(deployed.registryProxy);
        Permission(deployed.permissionProxy).setDuty(deployed.dutyProxy);
        AgentUserRegistry(deployed.usersProxy).setOperator(deployed.deskProxy, true);
        DelegateRegistry(deployed.delegateProxy).setOperator(deployed.deskProxy, true);
        Permission(deployed.permissionProxy).setDelegate(deployed.delegateProxy);
        Duty(deployed.dutyProxy).setDelegate(deployed.delegateProxy);
        access.setAgentRoleSources(sources);
        if (admin != address(0)) access.addPlatformAdmin(admin);
        if (!_broadcasting) vm.stopPrank();
    }

    /// @dev DelegateRegistry (T1) + CustomerDesk (T2), ADR 0035.
    function _deployAccounts(Deployed memory deployed) internal {
        deployed.delegateImpl = address(new DelegateRegistry());
        deployed.delegateProxy = address(
            new ERC1967Proxy(
                deployed.delegateImpl,
                abi.encodeCall(
                    DelegateRegistry.initialize, (deployed.accessProxy, deployed.agentsProxy, deployed.usersProxy)
                )
            )
        );
        deployed.deskImpl = address(new CustomerDesk());
        deployed.deskProxy = address(
            new ERC1967Proxy(
                deployed.deskImpl,
                abi.encodeCall(
                    CustomerDesk.initialize,
                    (
                        deployed.accessProxy,
                        deployed.branchesProxy,
                        deployed.permissionProxy,
                        deployed.usersProxy,
                        deployed.delegateProxy
                    )
                )
            )
        );
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(pk);
        address admin = _envAddressOrZero("PLATFORM_ADMIN");
        address fullDB = _envAddressOrZero("FULLDB");

        _broadcasting = true;
        vm.startBroadcast(pk);
        Deployed memory deployed = deploy(owner, admin, fullDB);
        vm.stopBroadcast();
        _broadcasting = false;

        string memory path = _write(deployed);
        console2.log("owner", deployed.owner);
        console2.log("admin", deployed.admin);
        console2.log("accessProxy", deployed.accessProxy);
        console2.log("historyProxy", deployed.historyProxy);
        console2.log("agentsProxy", deployed.agentsProxy);
        console2.log("branchesProxy", deployed.branchesProxy);
        console2.log("agentAccessProxy", deployed.agentAccessProxy);
        console2.log("salesSettingsProxy", deployed.salesSettingsProxy);
        console2.log("ledgerProxy", deployed.ledgerProxy);
        console2.log("usersProxy", deployed.usersProxy);
        console2.log("registryProxy", deployed.registryProxy);
        console2.log("permissionProxy", deployed.permissionProxy);
        console2.log("dutyProxy", deployed.dutyProxy);
        console2.log("delegateProxy", deployed.delegateProxy);
        console2.log("deskProxy", deployed.deskProxy);
        console2.log("wrote", path);
    }

    /// @dev Biến không có, hoặc có mà để trống, thì `address(0)`.
    function _envAddressOrZero(string memory key) internal view returns (address) {
        if (!vm.envExists(key)) return address(0);
        string memory raw = vm.envString(key);
        if (bytes(raw).length == 0) return address(0);
        return vm.parseAddress(raw);
    }

    function _write(Deployed memory deployed) internal returns (string memory path) {
        string memory chainId = vm.toString(block.chainid);
        path = string.concat("deployments/platform-", chainId, ".json");
        vm.createDir("deployments", true);

        string memory obj = "platform";
        vm.serializeUint(obj, "chainId", block.chainid);
        vm.serializeAddress(obj, "accessProxy", deployed.accessProxy);
        vm.serializeAddress(obj, "accessImpl", deployed.accessImpl);
        vm.serializeAddress(obj, "historyProxy", deployed.historyProxy);
        vm.serializeAddress(obj, "historyImpl", deployed.historyImpl);
        vm.serializeAddress(obj, "agentsProxy", deployed.agentsProxy);
        vm.serializeAddress(obj, "agentsImpl", deployed.agentsImpl);
        vm.serializeAddress(obj, "branchesProxy", deployed.branchesProxy);
        vm.serializeAddress(obj, "branchesImpl", deployed.branchesImpl);
        vm.serializeAddress(obj, "agentAccessProxy", deployed.agentAccessProxy);
        vm.serializeAddress(obj, "agentAccessImpl", deployed.agentAccessImpl);
        vm.serializeAddress(obj, "salesSettingsProxy", deployed.salesSettingsProxy);
        vm.serializeAddress(obj, "salesSettingsImpl", deployed.salesSettingsImpl);
        vm.serializeAddress(obj, "ledgerProxy", deployed.ledgerProxy);
        vm.serializeAddress(obj, "ledgerImpl", deployed.ledgerImpl);
        vm.serializeAddress(obj, "usersProxy", deployed.usersProxy);
        vm.serializeAddress(obj, "usersImpl", deployed.usersImpl);
        vm.serializeAddress(obj, "registryProxy", deployed.registryProxy);
        vm.serializeAddress(obj, "registryImpl", deployed.registryImpl);
        vm.serializeAddress(obj, "permissionProxy", deployed.permissionProxy);
        vm.serializeAddress(obj, "permissionImpl", deployed.permissionImpl);
        vm.serializeAddress(obj, "dutyProxy", deployed.dutyProxy);
        vm.serializeAddress(obj, "dutyImpl", deployed.dutyImpl);
        vm.serializeAddress(obj, "delegateProxy", deployed.delegateProxy);
        vm.serializeAddress(obj, "delegateImpl", deployed.delegateImpl);
        vm.serializeAddress(obj, "deskProxy", deployed.deskProxy);
        vm.serializeAddress(obj, "deskImpl", deployed.deskImpl);
        vm.serializeAddress(obj, "owner", deployed.owner);
        string memory json = vm.serializeAddress(obj, "admin", deployed.admin);
        vm.writeJson(json, path);
    }
}
