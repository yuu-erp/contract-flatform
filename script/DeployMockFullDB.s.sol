// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MockFullDB} from "../test/utils/MockFullDB.sol";

/// @notice Deploy MockFullDB len mot dia chi contract that (khong dung precompile 0x...0107).
///         **Chi anvil/local** — khong dung tren chain that (MockFullDB khong kiem quyen).
///         Sau do dat FULLDB=<dia chi> trong .env roi make deploy-local (HistoryIndex gan FullDB luc initialize).
contract DeployMockFullDB is Script {
    function run() external {
        require(block.chainid == 31_337, "DeployMockFullDB chi chay tren anvil (chain 31337)");
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        MockFullDB db = new MockFullDB();
        vm.stopBroadcast();

        console2.log("MockFullDB deployed", address(db));
        console2.log("Buoc tiep: FULLDB=", address(db));
        console2.log("         make deploy (fullDB gan luc initialize - can bo platform moi)");
    }
}