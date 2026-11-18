// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {PlatformAccess} from "../src/core/access/PlatformAccess.sol";

/// @notice PLATFORM_OWNER cấp hoặc thu quyền PLATFORM_ADMIN.
///         Env: `PRIVATE_KEY` (owner), `ACCESS_PROXY`, `ADMIN`, `ALLOW` (`true` thêm, `false` gỡ).
///         Người dùng tự chạy `make set-admin`. Không hard-code khoá.
contract SetPlatformAdmin is Script {
    /// @dev Xem `DeployPlatform._broadcasting`: broadcast thì Foundry đặt msg.sender = signer;
    ///      test gọi `set` trực tiếp thì phải chuyển msg.sender sang lời gọi `add/removePlatformAdmin`.
    bool private _broadcasting;

    function set(address access, address admin, bool allow) public {
        PlatformAccess a = PlatformAccess(access);
        if (!_broadcasting) vm.prank(msg.sender);
        if (allow) a.addPlatformAdmin(admin);
        else a.removePlatformAdmin(admin);
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address access = vm.envAddress("ACCESS_PROXY");
        address admin = vm.envAddress("ADMIN");
        bool allow = vm.envBool("ALLOW");

        _broadcasting = true;
        vm.startBroadcast(pk);
        set(access, admin, allow);
        vm.stopBroadcast();
        _broadcasting = false;

        console2.log("access", access);
        console2.log("admin", admin);
        console2.log("allow", allow);
    }
}
