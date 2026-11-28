// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title SafeHook
/// @notice Gọi hook module bổ trợ với trần gas; không copy returndata; không revert giao dịch chính (ADR 0031 C4).
///         Không đọc Registry / BranchRegistry — điều kiện bật module do caller tự kiểm.
library SafeHook {
    /// @dev Gas dự phòng cho logic sau `CALL` (emit `HookFailed`, v.v.).
    uint256 private constant POST_CALL_RESERVE = 5000;

    /// @param hook `address(0)` → `false`, không gọi.
    /// @param data Calldata đã encode (ví dụ `abi.encodeCall(ILoyaltyHook.onSpend, (...))`).
    /// @param gasLimit Trần gas gửi vào `CALL` (EIP-150: callee nhận tối đa 63/64 gas còn lại tại điểm CALL).
    /// @return ok `true` khi CALL thành công; `false` khi thiếu gas nền, revert, hoặc hết gas trong hook.
    function call(address hook, bytes memory data, uint256 gasLimit) internal returns (bool ok) {
        if (hook == address(0) || hook.code.length == 0) return false;
        if (!_hasEnoughGas(gasLimit)) return false;
        return _callDiscardReturndata(hook, data, gasLimit);
    }

    /// @dev Để hook nhận đủ trần `gasLimit`, cần `gasleft()` ≥ `gasLimit + gasLimit/63 + POST_CALL_RESERVE` (trần 63/64).
    function _hasEnoughGas(uint256 gasLimit) private view returns (bool) {
        uint256 minGas = gasLimit + gasLimit / 63 + POST_CALL_RESERVE;
        return gasleft() >= minGas;
    }

    function _callDiscardReturndata(address target, bytes memory data, uint256 gasLimit)
        private
        returns (bool success)
    {
        assembly {
            success := call(gasLimit, target, 0, add(data, 0x20), mload(data), 0, 0)
        }
    }
}
