// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Permission} from "../src/shared/permission/Permission.sol";
import {Duty} from "../src/shared/duty/Duty.sol";

/// @notice Thêm Permission + Duty (T2, ADR 0033) vào hệ đã deploy: deploy hai proxy, nối Permission → Duty,
///         ghi `permissionProxy/Impl`, `dutyProxy/Impl` vào `deployments/platform-<chainid>.json`.
///         **Chạy sau** `make deploy-registry` (Permission đọc danh mục quyền ở Registry qua BranchRegistry).
///         Env: `PRIVATE_KEY` (owner). Người dùng tự chạy `make deploy-staff`. Không hard-code khoá.
contract DeployStaff is Script {
    /// @dev Xem `DeployPlatform._broadcasting`.
    bool private _broadcasting;

    function deploy(address owner, address access, address branches, address agentAccess)
        public
        returns (address permissionProxy, address permissionImpl, address dutyProxy, address dutyImpl)
    {
        permissionImpl = address(new Permission());
        permissionProxy = address(
            new ERC1967Proxy(permissionImpl, abi.encodeCall(Permission.initialize, (access, branches, agentAccess)))
        );
        dutyImpl = address(new Duty());
        dutyProxy = address(
            new ERC1967Proxy(
                dutyImpl, abi.encodeCall(Duty.initialize, (access, branches, agentAccess, permissionProxy))
            )
        );
        if (!_broadcasting) vm.startPrank(owner);
        Permission(permissionProxy).setDuty(dutyProxy);
        if (!_broadcasting) vm.stopPrank();
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory path = string.concat("deployments/platform-", vm.toString(block.chainid), ".json");
        string memory json = vm.readFile(path);
        if (vm.keyExistsJson(json, ".permissionProxy")) revert("permissionProxy da co trong file deploy");
        if (!vm.keyExistsJson(json, ".registryProxy")) revert("chay make deploy-registry truoc");
        address access = vm.parseJsonAddress(json, ".accessProxy");
        address branches = vm.parseJsonAddress(json, ".branchesProxy");
        address agentAccess = vm.parseJsonAddress(json, ".agentAccessProxy");

        _broadcasting = true;
        vm.startBroadcast(pk);
        (address pp, address pi, address dp, address di) = deploy(vm.addr(pk), access, branches, agentAccess);
        vm.stopBroadcast();
        _broadcasting = false;

        vm.writeJson(vm.toString(pp), path, ".permissionProxy");
        vm.writeJson(vm.toString(pi), path, ".permissionImpl");
        vm.writeJson(vm.toString(dp), path, ".dutyProxy");
        vm.writeJson(vm.toString(di), path, ".dutyImpl");
        console2.log("permissionProxy", pp);
        console2.log("dutyProxy", dp);
        console2.log("wrote", path);
    }
}
