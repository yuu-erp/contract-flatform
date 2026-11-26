// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {HistoryIndex} from "../src/kernel/history/HistoryIndex.sol";
import {AgentUserRegistry} from "../src/tenant/user/AgentUserRegistry.sol";

/// @notice Thêm AgentUserRegistry vào hệ đã deploy (trước khi có người dùng theo agent): deploy proxy,
///         PLATFORM_OWNER đăng ký nó làm writer của HistoryIndex (kind `users`, `platform_audit`), rồi nối hai khoá
///         `usersProxy` / `usersImpl` vào `deployments/platform-<chainid>.json`. Địa chỉ cũ đọc từ chính file đó.
///         Env: `PRIVATE_KEY` (owner). Người dùng tự chạy `make deploy-users`. Không hard-code khoá.
contract DeployAgentUsers is Script {
    /// @dev Xem `DeployPlatform._broadcasting`.
    bool private _broadcasting;

    function deploy(
        address owner,
        address access,
        address agents,
        address branches,
        address agentAccess,
        address history
    ) public returns (address proxy, address impl) {
        impl = address(new AgentUserRegistry());
        proxy = address(
            new ERC1967Proxy(
                impl, abi.encodeCall(AgentUserRegistry.initialize, (access, agents, branches, agentAccess, history))
            )
        );
        if (!_broadcasting) vm.startPrank(owner);
        HistoryIndex(history).setWriter(proxy, true);
        HistoryIndex(history).setWriterKind(proxy, "users", true);
        HistoryIndex(history).setWriterKind(proxy, "platform_audit", true);
        if (!_broadcasting) vm.stopPrank();
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory path = string.concat("deployments/platform-", vm.toString(block.chainid), ".json");
        string memory json = vm.readFile(path);
        if (vm.keyExistsJson(json, ".usersProxy")) revert("usersProxy da co trong file deploy");
        address access = vm.parseJsonAddress(json, ".accessProxy");
        address agents = vm.parseJsonAddress(json, ".agentsProxy");
        address branches = vm.parseJsonAddress(json, ".branchesProxy");
        address agentAccess = vm.parseJsonAddress(json, ".agentAccessProxy");
        address history = vm.parseJsonAddress(json, ".historyProxy");

        _broadcasting = true;
        vm.startBroadcast(pk);
        (address proxy, address impl) = deploy(vm.addr(pk), access, agents, branches, agentAccess, history);
        vm.stopBroadcast();
        _broadcasting = false;

        vm.writeJson(vm.toString(proxy), path, ".usersProxy");
        vm.writeJson(vm.toString(impl), path, ".usersImpl");
        console2.log("usersProxy", proxy);
        console2.log("usersImpl", impl);
        console2.log("wrote", path);
    }
}
