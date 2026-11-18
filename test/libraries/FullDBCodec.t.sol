// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {FullDBCodec} from "../../src/libraries/FullDBCodec.sol";

contract CodecHarness {
    function term(string memory p, string memory v) external pure returns (string memory) {
        return FullDBCodec.term(p, v);
    }

    function queryTerm(string memory p, string memory v) external pure returns (string memory) {
        return FullDBCodec.queryTerm(p, v);
    }

    function toPadded(uint256 v) external pure returns (string memory) {
        return FullDBCodec.toPadded(v);
    }

    function toDecimal(uint256 v) external pure returns (string memory) {
        return FullDBCodec.toDecimal(v);
    }

    function toHex(address a) external pure returns (string memory) {
        return FullDBCodec.toHex(a);
    }
}

contract FullDBCodecTest is Test {
    CodecHarness internal c = new CodecHarness();

    function test_term_and_query() public view {
        assertEq(c.term("G", "12"), "G12");
        assertEq(c.queryTerm("G", "12"), "G:12");
    }

    function test_term_rejectsBadParts() public {
        vm.expectRevert(FullDBCodec.InvalidTermPart.selector);
        c.term("g", "1"); // prefix phải in hoa
        vm.expectRevert(FullDBCodec.InvalidTermPart.selector);
        c.term("", "1");
        vm.expectRevert(FullDBCodec.InvalidTermPart.selector);
        c.term("ABCDEFGHI", "1"); // > 8
        vm.expectRevert(FullDBCodec.InvalidTermPart.selector);
        c.term("G", "");
        vm.expectRevert(FullDBCodec.InvalidTermPart.selector);
        c.term("G", "a b"); // dấu cách phá chuỗi truy vấn
        vm.expectRevert(FullDBCodec.InvalidTermPart.selector);
        c.term("G", "a:b");
        vm.expectRevert(FullDBCodec.InvalidTermPart.selector);
        c.queryTerm("G", "a\"b");
    }

    function test_toPadded() public view {
        assertEq(c.toPadded(0), "00000000000000000000");
        assertEq(c.toPadded(1_767_225_600), "00000000001767225600");
        assertEq(c.toPadded(1e20 - 1), "99999999999999999999");
    }

    function test_toPadded_tooLarge() public {
        vm.expectRevert(abi.encodeWithSelector(FullDBCodec.ValueTooLarge.selector, 1e20));
        c.toPadded(1e20);
    }

    /// Thứ tự chuỗi của số đã đệm = thứ tự số (điều kiện để FullDB sắp xếp/lọc khoảng đúng).
    function testFuzz_toPadded_preservesOrder(uint256 a, uint256 b) public view {
        a = bound(a, 0, 1e20 - 1);
        b = bound(b, 0, 1e20 - 1);
        bytes memory sa = bytes(c.toPadded(a));
        bytes memory sb = bytes(c.toPadded(b));
        assertEq(sa.length, 20);
        int256 cmp;
        for (uint256 i; i < 20 && cmp == 0; ++i) {
            if (sa[i] < sb[i]) cmp = -1;
            else if (sa[i] > sb[i]) cmp = 1;
        }
        assertEq(cmp, a < b ? int256(-1) : a > b ? int256(1) : int256(0));
    }

    function testFuzz_toDecimal(uint256 v) public view {
        assertEq(c.toDecimal(v), vm.toString(v));
    }

    function testFuzz_toHex(address a) public view {
        assertEq(c.toHex(a), vm.toLowercase(vm.toString(a)));
    }
}
