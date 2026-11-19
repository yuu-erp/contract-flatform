// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";

/// @notice Hằng slot viết tay trong contract phải đúng công thức ERC-7201 của namespace khai báo.
contract Erc7201SlotsTest is PlatformFixture {
    function _slot(string memory ns) internal pure returns (bytes32) {
        return keccak256(abi.encode(uint256(keccak256(bytes(ns))) - 1)) & ~bytes32(uint256(0xff));
    }

    function test_accessSlot() public view {
        // trường đầu tiên của AccessStorage là độ dài mảng admins (fixture thêm 2 admin)
        bytes32 v = vm.load(address(access), _slot("metaplatform.core.access"));
        assertEq(uint256(v), 2);
        // owner nằm ở namespace của OZ
        v = vm.load(address(access), _slot("openzeppelin.storage.Ownable"));
        assertEq(address(uint160(uint256(v))), platformOwner);
    }

    function test_accessedSlot() public view {
        bytes32 v = vm.load(address(registry), _slot("metaplatform.core.accessed"));
        assertEq(address(uint160(uint256(v))), address(access));
        v = vm.load(address(historyIndex), _slot("metaplatform.core.accessed"));
        assertEq(address(uint160(uint256(v))), address(access));
    }

    function test_historySlot() public view {
        bytes32 v = vm.load(address(historyIndex), _slot("metaplatform.core.history"));
        assertEq(address(uint160(uint256(v))), FULLDB_PRECOMPILE);
    }

    function test_agentsSlot() public view {
        bytes32 v = vm.load(address(registry), _slot("metaplatform.core.tenant.agents"));
        assertEq(address(uint160(uint256(v))), address(historyIndex));
    }

    function test_branchesSlot() public view {
        bytes32 v = vm.load(address(branches), _slot("metaplatform.core.tenant.branches"));
        assertEq(address(uint160(uint256(v))), address(registry));
    }

    function test_agentAccessSlot() public view {
        bytes32 v = vm.load(address(agentAccess), _slot("metaplatform.core.access.agent"));
        assertEq(address(uint160(uint256(v))), address(registry));
    }

    function test_salesSettingsSlot() public view {
        bytes32 v = vm.load(address(sales), _slot("metaplatform.core.payment.settings"));
        assertEq(address(uint160(uint256(v))), address(registry));
    }

    function test_ledgerSlot() public view {
        bytes32 v = vm.load(address(ledger), _slot("metaplatform.core.ledger"));
        assertEq(address(uint160(uint256(v))), address(registry));
    }
}
