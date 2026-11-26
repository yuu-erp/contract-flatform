// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {HistoryIndex} from "../src/kernel/history/HistoryIndex.sol";
import {AgentAccess} from "../src/tenant/access/AgentAccess.sol";
import {AgentRegistry} from "../src/tenant/agent/AgentRegistry.sol";
import {PlatformAccess} from "../src/kernel/access/PlatformAccess.sol";

/// @notice Thêm AgentAccess vào tầng quản trị đã deploy (trước khi có AgentAccess): deploy proxy,
///         PLATFORM_OWNER đăng ký nó làm writer của HistoryIndex (kind `platform_audit`), nối nó vào AgentRegistry,
///         đặt AgentRegistry + AgentAccess làm nguồn vai trò agent của PlatformAccess, rồi nối hai khoá vào
///         `deployments/platform-<chainid>.json`. Địa chỉ các proxy cũ đọc từ chính file đó.
///         Env: `PRIVATE_KEY` (owner). Người dùng tự chạy `make deploy-agent-access`. Không hard-code khoá.
contract DeployAgentAccess is Script {
    /// @dev Xem `DeployPlatform._broadcasting`.
    bool private _broadcasting;

    function deploy(address owner, address access, address agents, address branches, address history)
        public
        returns (address proxy, address impl)
    {
        impl = address(new AgentAccess());
        proxy = address(
            new ERC1967Proxy(impl, abi.encodeCall(AgentAccess.initialize, (access, agents, branches, history)))
        );
        address[] memory sources = new address[](2);
        sources[0] = agents;
        sources[1] = proxy;
        if (!_broadcasting) vm.startPrank(owner);
        HistoryIndex(history).setWriter(proxy, true);
        HistoryIndex(history).setWriterKind(proxy, "platform_audit", true);
        AgentRegistry(agents).setAgentAccess(proxy);
        PlatformAccess(access).setAgentRoleSources(sources);
        if (!_broadcasting) vm.stopPrank();
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory path = string.concat("deployments/platform-", vm.toString(block.chainid), ".json");
        string memory json = vm.readFile(path);
        if (vm.keyExistsJson(json, ".agentAccessProxy")) revert("agentAccessProxy da co trong file deploy");
        address access = vm.parseJsonAddress(json, ".accessProxy");
        address agents = vm.parseJsonAddress(json, ".agentsProxy");
        address branches = vm.parseJsonAddress(json, ".branchesProxy");
        address history = vm.parseJsonAddress(json, ".historyProxy");

        _broadcasting = true;
        vm.startBroadcast(pk);
        (address proxy, address impl) = deploy(vm.addr(pk), access, agents, branches, history);
        vm.stopBroadcast();
        _broadcasting = false;

        vm.writeJson(vm.toString(proxy), path, ".agentAccessProxy");
        vm.writeJson(vm.toString(impl), path, ".agentAccessImpl");
        console2.log("agentAccessProxy", proxy);
        console2.log("agentAccessImpl", impl);
        console2.log("wrote", path);
    }
}
