// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {LedgerMetrics as M} from "../../src/libraries/LedgerMetrics.sol";

contract LedgerMetricsTest is Test {
    function day(uint256 ts, int16 tz) external pure returns (uint32) {
        return M.day(ts, tz);
    }

    function serviceMetric(uint16 s, uint256 o) external pure returns (uint256) {
        return M.serviceMetric(s, o);
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

    function test_serviceMetric() public {
        assertEq(this.serviceMetric(1, M.TAX), 15);
        assertEq(this.serviceMetric(2, M.SERVED_HERE), 25);
        vm.expectRevert(abi.encodeWithSelector(M.InvalidService.selector, uint16(4)));
        this.serviceMetric(4, 0);
    }

    function test_methodIndex() public {
        assertEq(this.methodIndex(1), 0);
        assertEq(this.methodIndex(2), 1);
        assertEq(this.methodIndex(4), 2);
        vm.expectRevert(abi.encodeWithSelector(M.InvalidMethod.selector, uint8(8)));
        this.methodIndex(8);
    }
}
