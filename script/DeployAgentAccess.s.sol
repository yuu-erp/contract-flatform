// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {HistoryIndex} from "../src/core/history/HistoryIndex.sol";
import {AgentAccess} from "../src/core/access/AgentAccess.sol";

/// @notice Thêm AgentAccess vào tầng quản trị đã deploy (trước khi có AgentAccess): deploy proxy,
///         PLATFORM_OWNER đăng ký nó làm writer của HistoryIndex, rồi nối hai khoá vào
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
        if (!_broadcasting) vm.prank(owner);
        HistoryIndex(history).setWriter(proxy, true);
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
