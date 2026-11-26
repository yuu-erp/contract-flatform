// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ILedger} from "../../interfaces/ILedger.sol";

/// @title LedgerWallet
/// @notice Library liên kết ngoài của Ledger: thao tác túi ví (theo chi nhánh nạp) trên storage của Ledger.
///         Gọi bằng DELEGATECALL với con trỏ storage do Ledger truyền vào; không giữ state riêng.
///         Tách ra chỉ để Ledger dưới trần kích thước (luật L5, nợ N3). Đặc tả túi: docs/modules/core-ledger.md §3.
library LedgerWallet {
    uint256 internal constant MAX_BUCKETS = 16;

    /// @notice Cộng vào túi của chi nhánh; túi mới ở cuối, quá `MAX_BUCKETS` → TooManyBuckets.
    function add(ILedger.Portion[] storage list, uint64 agentId, address customer, uint64 branchId, uint128 amount)
        external
    {
        uint256 n = list.length;
        for (uint256 i; i < n; ++i) {
            if (list[i].branchId == branchId) {
                list[i].amount += amount;
                return;
            }
        }
        if (n >= MAX_BUCKETS) revert ILedger.TooManyBuckets(agentId, customer);
        list.push(ILedger.Portion(branchId, amount));
    }

    /// @notice Trừ `amount` khỏi túi ở `branchId`; vượt số dư túi (hoặc không có túi) → InsufficientBalance.
    function take(ILedger.Portion[] storage list, uint64 branchId, uint128 amount) external {
        uint256 n = list.length;
        uint256 i;
        while (i < n && list[i].branchId != branchId) ++i;
        uint128 have = i < n ? list[i].amount : 0;
        if (amount > have) revert ILedger.InsufficientBalance(have, amount);
        _sub(list, i, amount);
    }

    function sum(ILedger.Portion[] storage list) external view returns (uint128 total) {
        for (uint256 i; i < list.length; ++i) {
            total += list[i].amount;
        }
    }

    /// @notice Trừ `amount` (người gọi đã kiểm <= tổng số dư): túi của `servedBranch` trước, rồi theo thứ tự mảng.
    ///         Trả các phần theo đúng thứ tự trừ. Túi về 0 bị gỡ.
    function drain(ILedger.Portion[] storage list, uint64 servedBranch, uint128 amount)
        external
        returns (ILedger.Portion[] memory parts)
    {
        parts = new ILedger.Portion[](list.length);
        uint256 n;
        uint128 left = amount;
        for (uint256 i; i < list.length; ++i) {
            if (list[i].branchId != servedBranch) continue;
            uint128 got = list[i].amount < left ? list[i].amount : left;
            parts[n++] = ILedger.Portion(servedBranch, got);
            left -= got;
            _sub(list, i, got);
            break;
        }
        while (left != 0) {
            uint128 have = list[0].amount;
            uint128 got = have < left ? have : left;
            parts[n++] = ILedger.Portion(list[0].branchId, got);
            left -= got;
            _sub(list, 0, got);
        }
        assembly {
            mstore(parts, n)
        }
    }

    /// @dev Trừ `amount` khỏi túi ở vị trí `i`; túi về 0 thì gỡ bằng dịch trái (giữ thứ tự nạp).
    function _sub(ILedger.Portion[] storage list, uint256 i, uint128 amount) private {
        uint128 left = list[i].amount - amount;
        if (left != 0) {
            list[i].amount = left;
            return;
        }
        uint256 n = list.length;
        for (uint256 j = i; j + 1 < n; ++j) {
            list[j] = list[j + 1];
        }
        list.pop();
    }
}
