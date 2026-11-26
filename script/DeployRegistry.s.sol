// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Registry} from "../src/kernel/registry/Registry.sol";
import {AgentRegistry} from "../src/tenant/agent/AgentRegistry.sol";
import {BranchRegistry} from "../src/tenant/branch/BranchRegistry.sol";
import {ModuleCatalog} from "./ModuleCatalog.sol";

/// @notice Thêm Registry (T0, ADR 0030) vào hệ đã deploy: deploy proxy, khai báo module mặc định, gắn vào
///         AgentRegistry + BranchRegistry, rồi nối `registryProxy` / `registryImpl` vào `deployments/platform-<chainid>.json`.
///         **Chạy sau** khi đã nâng cấp AgentRegistry, BranchRegistry (bản có `setRegistry`). Env: `PRIVATE_KEY` (owner).
///         Người dùng tự chạy `make deploy-registry`. Không hard-code khoá.
contract DeployRegistry is Script {
    /// @dev Xem `DeployPlatform._broadcasting`.
    bool private _broadcasting;

    function deploy(address owner, address access, address agents, address branches)
        public
        returns (address proxy, address impl)
    {
        impl = address(new Registry());
        proxy = address(new ERC1967Proxy(impl, abi.encodeCall(Registry.initialize, (access))));
        if (!_broadcasting) vm.startPrank(owner);
        ModuleCatalog.registerDefaults(Registry(proxy));
        AgentRegistry(agents).setRegistry(proxy);
        BranchRegistry(branches).setRegistry(proxy);
        if (!_broadcasting) vm.stopPrank();
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory path = string.concat("deployments/platform-", vm.toString(block.chainid), ".json");
        string memory json = vm.readFile(path);
        if (vm.keyExistsJson(json, ".registryProxy")) revert("registryProxy da co trong file deploy");
        address access = vm.parseJsonAddress(json, ".accessProxy");
        address agents = vm.parseJsonAddress(json, ".agentsProxy");
        address branches = vm.parseJsonAddress(json, ".branchesProxy");

        _broadcasting = true;
        vm.startBroadcast(pk);
        (address proxy, address impl) = deploy(vm.addr(pk), access, agents, branches);
        vm.stopBroadcast();
        _broadcasting = false;

        vm.writeJson(vm.toString(proxy), path, ".registryProxy");
        vm.writeJson(vm.toString(impl), path, ".registryImpl");
        console2.log("registryProxy", proxy);
        console2.log("registryImpl", impl);
        console2.log("wrote", path);
    }
}
