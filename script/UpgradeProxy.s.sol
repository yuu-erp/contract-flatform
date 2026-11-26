// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {PlatformAccess} from "../src/kernel/access/PlatformAccess.sol";
import {HistoryIndex} from "../src/kernel/history/HistoryIndex.sol";
import {AgentRegistry} from "../src/tenant/agent/AgentRegistry.sol";
import {BranchRegistry} from "../src/tenant/branch/BranchRegistry.sol";
import {AgentAccess} from "../src/tenant/access/AgentAccess.sol";
import {SalesSettings} from "../src/shared/payment/SalesSettings.sol";
import {Ledger} from "../src/shared/ledger/Ledger.sol";
import {AgentUserRegistry} from "../src/tenant/user/AgentUserRegistry.sol";
import {Registry} from "../src/kernel/registry/Registry.sol";

/// @notice Nâng cấp một proxy UUPS của tầng quản trị lên implementation mới (build từ mã hiện tại).
///         Env: `PRIVATE_KEY` (PLATFORM_OWNER), `CONTRACT` (PlatformAccess | HistoryIndex | AgentRegistry |
///         BranchRegistry | AgentAccess | SalesSettings | Ledger | AgentUserRegistry | Registry), tuỳ chọn `UPGRADE_CALL` (calldata hex gọi kèm, ví dụ một `reinitializer`),
///         tuỳ chọn `DRY_RUN=true` (mô phỏng, không ghi file deployments; dùng với lệnh không `--broadcast`).
///         Địa chỉ proxy đọc từ `deployments/platform-<chainid>.json`; sau khi nâng, ghi đè khoá `<key>Impl`.
///         Người dùng tự chạy `make upgrade CONTRACT=...` sau `make layout`. Không hard-code khoá.
///         Hướng dẫn: docs/07-deploy-va-nang-cap.md.
contract UpgradeProxy is Script {
    /// @dev Xem `DeployPlatform._broadcasting`.
    bool private _broadcasting;

    /// @notice Khoá trong file deployments: `<key>Proxy` / `<key>Impl`.
    function keyOf(string memory name) public pure returns (string memory) {
        bytes32 h = keccak256(bytes(name));
        if (h == keccak256("PlatformAccess")) return "access";
        if (h == keccak256("HistoryIndex")) return "history";
        if (h == keccak256("AgentRegistry")) return "agents";
        if (h == keccak256("BranchRegistry")) return "branches";
        if (h == keccak256("AgentAccess")) return "agentAccess";
        if (h == keccak256("SalesSettings")) return "salesSettings";
        if (h == keccak256("Ledger")) return "ledger";
        if (h == keccak256("AgentUserRegistry")) return "users";
        if (h == keccak256("Registry")) return "registry";
        revert(string.concat("CONTRACT khong hop le: ", name));
    }

    function newImpl(string memory name) public returns (address impl) {
        bytes32 h = keccak256(bytes(name));
        if (h == keccak256("PlatformAccess")) return address(new PlatformAccess());
        if (h == keccak256("HistoryIndex")) return address(new HistoryIndex());
        if (h == keccak256("AgentRegistry")) return address(new AgentRegistry());
        if (h == keccak256("BranchRegistry")) return address(new BranchRegistry());
        if (h == keccak256("AgentAccess")) return address(new AgentAccess());
        if (h == keccak256("SalesSettings")) return address(new SalesSettings());
        if (h == keccak256("Ledger")) return address(new Ledger());
        if (h == keccak256("AgentUserRegistry")) return address(new AgentUserRegistry());
        if (h == keccak256("Registry")) return address(new Registry());
        revert(string.concat("CONTRACT khong hop le: ", name));
    }

    /// @param owner PLATFORM_OWNER (chỉ dùng để `prank` khi test gọi trực tiếp).
    function upgrade(address owner, string memory name, address proxy, bytes memory data)
        public
        returns (address impl)
    {
        keyOf(name); // kiểm tên trước khi deploy
        impl = newImpl(name);
        if (!_broadcasting) vm.prank(owner);
        UUPSUpgradeable(proxy).upgradeToAndCall(impl, data);
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory name = vm.envString("CONTRACT");
        bytes memory data;
        if (vm.envExists("UPGRADE_CALL") && bytes(vm.envString("UPGRADE_CALL")).length != 0) {
            data = vm.envBytes("UPGRADE_CALL");
        }
        string memory key = keyOf(name);

        string memory path = string.concat("deployments/platform-", vm.toString(block.chainid), ".json");
        string memory json = vm.readFile(path);
        address proxy = vm.parseJsonAddress(json, string.concat(".", key, "Proxy"));

        _broadcasting = true;
        vm.startBroadcast(pk);
        address impl = upgrade(vm.addr(pk), name, proxy, data);
        vm.stopBroadcast();
        _broadcasting = false;

        if (!vm.envOr("DRY_RUN", false)) vm.writeJson(vm.toString(impl), path, string.concat(".", key, "Impl"));
        console2.log("contract", name);
        console2.log("proxy", proxy);
        console2.log("newImpl", impl);
        console2.log("wrote", path);
    }
}
