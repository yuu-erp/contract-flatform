// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title FullDBCodec
/// @notice Mã hoá giá trị cho FullDB: term `prefix++value`, chuỗi truy vấn `P:value`, số đệm 0 đủ 20 ký tự
///         (để so sánh chuỗi = so sánh số), địa chỉ dạng hex thường có `0x`.
library FullDBCodec {
    uint256 internal constant PADDED_DIGITS = 20;
    uint256 internal constant MAX_PADDED = 10 ** PADDED_DIGITS - 1;

    error ValueTooLarge(uint256 value);
    error InvalidTermPart();

    /// @notice Term lưu trong document: `prefix ++ value` (không có ":").
    function term(string memory prefix, string memory value) internal pure returns (string memory) {
        checkPart(prefix, true);
        checkPart(value, false);
        return string.concat(prefix, value);
    }

    /// @notice Một mệnh đề trong chuỗi truy vấn: `prefix:value`.
    function queryTerm(string memory prefix, string memory value) internal pure returns (string memory) {
        checkPart(prefix, true);
        checkPart(value, false);
        return string.concat(prefix, ":", value);
    }

    /// @notice Prefix: 1–8 chữ in hoa A–Z. Value: 1–64 ký tự in được, không có dấu cách, ':' hay '"'.
    function checkPart(string memory s, bool isPrefix) internal pure {
        bytes memory b = bytes(s);
        uint256 maxLen = isPrefix ? 8 : 64;
        if (b.length == 0 || b.length > maxLen) revert InvalidTermPart();
        for (uint256 i; i < b.length; ++i) {
            bytes1 c = b[i];
            if (isPrefix) {
                if (c < 0x41 || c > 0x5A) revert InvalidTermPart();
            } else if (c <= 0x20 || c >= 0x7F || c == 0x3A || c == 0x22) {
                revert InvalidTermPart();
            }
        }
    }

    /// @notice Số thập phân đệm 0 đủ 20 ký tự. Revert nếu ≥ 10^20.
    function toPadded(uint256 v) internal pure returns (string memory) {
        if (v > MAX_PADDED) revert ValueTooLarge(v);
        bytes memory out = new bytes(PADDED_DIGITS);
        for (uint256 i = PADDED_DIGITS; i > 0; --i) {
            out[i - 1] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }
        return string(out);
    }

    /// @notice Số thập phân không đệm (dùng làm giá trị term, ví dụ agentId).
    function toDecimal(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 len;
        for (uint256 t = v; t != 0; t /= 10) {
            ++len;
        }
        bytes memory out = new bytes(len);
        for (uint256 i = len; i > 0; --i) {
            out[i - 1] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }
        return string(out);
    }

    /// @notice Địa chỉ dạng `0x` + 40 ký tự hex thường.
    function toHex(address a) internal pure returns (string memory) {
        bytes memory out = new bytes(42);
        out[0] = "0";
        out[1] = "x";
        uint160 v = uint160(a);
        for (uint256 i = 41; i > 1; --i) {
            // casting to 'uint8' is safe because the value is masked to 4 bits
            // forge-lint: disable-next-line(unsafe-typecast)
            uint8 nib = uint8(v & 0xf);
            out[i] = bytes1(nib < 10 ? 48 + nib : 87 + nib);
            v >>= 4;
        }
        return string(out);
    }
}
