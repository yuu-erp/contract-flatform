// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title TextRules
/// @notice Kiểm định dạng chuỗi hồ sơ (thuần, không revert; contract gọi tự revert lỗi của mình).
library TextRules {
    uint256 internal constant MAX_PHONE = 20;
    uint256 internal constant MAX_LONGLAT = 40;
    uint256 internal constant MIN_DOMAIN = 3;
    uint256 internal constant MAX_DOMAIN = 253;

    /// @notice 0–20 ký tự: chữ số, '+', '-', '.', ' ', '(', ')'. Rỗng hợp lệ.
    function isPhone(string memory s) internal pure returns (bool) {
        bytes memory b = bytes(s);
        if (b.length > MAX_PHONE) return false;
        for (uint256 i; i < b.length; ++i) {
            bytes1 c = b[i];
            if (!(_digit(c) || c == "+" || c == "-" || c == "." || c == " " || c == "(" || c == ")")) return false;
        }
        return true;
    }

    /// @notice Toạ độ "lat,long": 0–40 ký tự gồm chữ số, '.', '-', ',', ' '. Rỗng hợp lệ.
    function isLonglat(string memory s) internal pure returns (bool) {
        bytes memory b = bytes(s);
        if (b.length > MAX_LONGLAT) return false;
        for (uint256 i; i < b.length; ++i) {
            bytes1 c = b[i];
            if (!(_digit(c) || c == "." || c == "-" || c == "," || c == " ")) return false;
        }
        return true;
    }

    /// @notice Domain chữ thường: 3–253 ký tự a–z, 0–9, '-', '.'; không mở đầu/kết thúc bằng '-' hoặc '.'.
    ///         Bắt buộc chữ thường để một domain chỉ có một hash.
    function isDomain(string memory s) internal pure returns (bool) {
        bytes memory b = bytes(s);
        if (b.length < MIN_DOMAIN || b.length > MAX_DOMAIN) return false;
        if (_edge(b[0]) || _edge(b[b.length - 1])) return false;
        for (uint256 i; i < b.length; ++i) {
            bytes1 c = b[i];
            if (!(_digit(c) || (c >= 0x61 && c <= 0x7A) || _edge(c))) return false;
        }
        return true;
    }

    function _digit(bytes1 c) private pure returns (bool) {
        return c >= 0x30 && c <= 0x39;
    }

    function _edge(bytes1 c) private pure returns (bool) {
        return c == "-" || c == ".";
    }
}
