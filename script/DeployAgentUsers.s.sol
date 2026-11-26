// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {HistoryIndex} from "../src/kernel/history/HistoryIndex.sol";
import {AgentUserRegistry} from "../src/tenant/user/AgentUserRegistry.sol";
import {DelegateRegistry} from "../src/tenant/delegate/DelegateRegistry.sol";
import {CustomerDesk} from "../src/shared/desk/CustomerDesk.sol";
import {Permission} from "../src/shared/permission/Permission.sol";
import {Duty} from "../src/shared/duty/Duty.sol";

/// @notice Thêm tài khoản theo agent vào hệ đã deploy (ADR 0035): AgentUserRegistry (T1) + DelegateRegistry (T1) +
///         CustomerDesk (T2). Đăng ký AgentUserRegistry làm writer HistoryIndex (kind `users`, `platform_audit`),
///         CustomerDesk làm operator của hai contract T1, nối DelegateRegistry vào Permission + Duty.
///         **Chạy sau** `make deploy-staff`. Ghi `usersProxy/Impl`, `delegateProxy/Impl`, `deskProxy/Impl`.
///         Env: `PRIVATE_KEY` (owner). Người dùng tự chạy `make deploy-users`. Không hard-code khoá.
contract DeployAgentUsers is Script {
    struct Deployed {
        address usersProxy;
        address usersImpl;
        address delegateProxy;
        address delegateImpl;
        address deskProxy;
        address deskImpl;
    }

    struct Inputs {
        address owner;
        address access;
        address agents;
        address branches;
        address agentAccess;
        address history;
        address permission;
        address duty;
    }

    /// @dev Xem `DeployPlatform._broadcasting`.
    bool private _broadcasting;

    function deploy(Inputs memory i) public returns (Deployed memory d) {
        d.usersImpl = address(new AgentUserRegistry());
        d.usersProxy = address(
            new ERC1967Proxy(
                d.usersImpl,
                abi.encodeCall(AgentUserRegistry.initialize, (i.access, i.agents, i.branches, i.agentAccess, i.history))
            )
        );
        d.delegateImpl = address(new DelegateRegistry());
        d.delegateProxy = address(
            new ERC1967Proxy(
                d.delegateImpl, abi.encodeCall(DelegateRegistry.initialize, (i.access, i.agents, d.usersProxy))
            )
        );
        d.deskImpl = address(new CustomerDesk());
        d.deskProxy = address(
            new ERC1967Proxy(
                d.deskImpl,
                abi.encodeCall(
                    CustomerDesk.initialize, (i.access, i.branches, i.permission, d.usersProxy, d.delegateProxy)
                )
            )
        );
        if (!_broadcasting) vm.startPrank(i.owner);
        HistoryIndex(i.history).setWriter(d.usersProxy, true);
        HistoryIndex(i.history).setWriterKind(d.usersProxy, "users", true);
        HistoryIndex(i.history).setWriterKind(d.usersProxy, "platform_audit", true);
        AgentUserRegistry(d.usersProxy).setOperator(d.deskProxy, true);
        DelegateRegistry(d.delegateProxy).setOperator(d.deskProxy, true);
        Permission(i.permission).setDelegate(d.delegateProxy);
        Duty(i.duty).setDelegate(d.delegateProxy);
        if (!_broadcasting) vm.stopPrank();
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory path = string.concat("deployments/platform-", vm.toString(block.chainid), ".json");
        string memory json = vm.readFile(path);
        if (vm.keyExistsJson(json, ".usersProxy")) revert("usersProxy da co trong file deploy");
        if (!vm.keyExistsJson(json, ".permissionProxy")) revert("chay make deploy-staff truoc");
        Inputs memory i = Inputs({
            owner: vm.addr(pk),
            access: vm.parseJsonAddress(json, ".accessProxy"),
            agents: vm.parseJsonAddress(json, ".agentsProxy"),
            branches: vm.parseJsonAddress(json, ".branchesProxy"),
            agentAccess: vm.parseJsonAddress(json, ".agentAccessProxy"),
            history: vm.parseJsonAddress(json, ".historyProxy"),
            permission: vm.parseJsonAddress(json, ".permissionProxy"),
            duty: vm.parseJsonAddress(json, ".dutyProxy")
        });

        _broadcasting = true;
        vm.startBroadcast(pk);
        Deployed memory d = deploy(i);
        vm.stopBroadcast();
        _broadcasting = false;

        vm.writeJson(vm.toString(d.usersProxy), path, ".usersProxy");
        vm.writeJson(vm.toString(d.usersImpl), path, ".usersImpl");
        vm.writeJson(vm.toString(d.delegateProxy), path, ".delegateProxy");
        vm.writeJson(vm.toString(d.delegateImpl), path, ".delegateImpl");
        vm.writeJson(vm.toString(d.deskProxy), path, ".deskProxy");
        vm.writeJson(vm.toString(d.deskImpl), path, ".deskImpl");
        console2.log("usersProxy", d.usersProxy);
        console2.log("delegateProxy", d.delegateProxy);
        console2.log("deskProxy", d.deskProxy);
        console2.log("wrote", path);
    }
}
