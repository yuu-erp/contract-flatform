// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {PlatformAccess} from "../src/core/access/PlatformAccess.sol";
import {HistoryIndex} from "../src/core/history/HistoryIndex.sol";
import {AgentRegistry} from "../src/core/tenant/AgentRegistry.sol";
import {BranchRegistry} from "../src/core/tenant/BranchRegistry.sol";

/// @notice Deploy tầng quản trị: PlatformAccess → HistoryIndex → AgentRegistry → BranchRegistry,
///         rồi đăng ký hai registry làm writer của HistoryIndex.
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

        HistoryIndex history = HistoryIndex(deployed.historyProxy);
        PlatformAccess access = PlatformAccess(deployed.accessProxy);

        if (!_broadcasting) vm.startPrank(owner);
        history.setWriter(deployed.agentsProxy, true);
        history.setWriter(deployed.branchesProxy, true);
        if (admin != address(0)) access.addPlatformAdmin(admin);
        if (!_broadcasting) vm.stopPrank();
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
        vm.serializeAddress(obj, "owner", deployed.owner);
        string memory json = vm.serializeAddress(obj, "admin", deployed.admin);
        vm.writeJson(json, path);
    }
}
