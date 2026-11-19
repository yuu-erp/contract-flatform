// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ILedger} from "../../src/interfaces/ILedger.sol";

/// @notice Poster giả cho test: chuyển tiếp nguyên văn mọi hàm ghi của Ledger, nên `msg.sender` tại Ledger là
///         contract này. `Ctx.actor` do test truyền vào. Task sau thêm hàm chuyển tiếp khi Ledger có hàm mới.
contract MockLedgerPoster {
    ILedger public immutable LEDGER;

    constructor(address ledger_) {
        LEDGER = ILedger(ledger_);
    }

    function topup(ILedger.Ctx calldata ctx, address customer, uint8 method, uint128 amount) external {
        LEDGER.topup(ctx, customer, method, amount);
    }
}
