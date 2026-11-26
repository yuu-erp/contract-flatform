// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {LedgerMetrics as M} from "../../src/libraries/LedgerMetrics.sol";

contract LedgerMetricsTest is Test {
    function day(uint256 ts, int16 tz) external pure returns (uint32) {
        return M.day(ts, tz);
    }

    function methodIndex(uint8 m) external pure returns (uint256) {
        return M.methodIndex(m);
    }

    function test_day_utc7Boundary() public view {
        assertEq(this.day(1_767_200_399, 420), 20_453); // 2025-12-31 23:59:59 +07
        assertEq(this.day(1_767_200_400, 420), 20_454); // 2026-01-01 00:00:00 +07
    }

    function test_day_negativeTz() public view {
        assertEq(this.day(86_399 + 3600, -60), 0);
        assertEq(this.day(86_400 + 3600, -60), 1);
    }

    function test_moduleOffsets() public pure {
        assertEq(M.SERVED_HERE_REFUND, 8);
        assertEq(M.MODULE_METRICS, 9);
    }

    function test_methodIndex() public {
        assertEq(this.methodIndex(1), 0);
        assertEq(this.methodIndex(2), 1);
        assertEq(this.methodIndex(4), 2);
        vm.expectRevert(abi.encodeWithSelector(M.InvalidMethod.selector, uint8(8)));
        this.methodIndex(8);
    }
}
