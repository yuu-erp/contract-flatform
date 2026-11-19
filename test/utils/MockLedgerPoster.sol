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

    function walletSpend(ILedger.Ctx calldata ctx, address customer, uint16 service, uint128 amount, uint128 discount)
        external
    {
        LEDGER.walletSpend(ctx, customer, service, amount, discount);
    }

    function directSale(
        ILedger.Ctx calldata ctx,
        address customer,
        uint16 service,
        uint8 method,
        uint128 amount,
        uint128 discount
    ) external {
        LEDGER.directSale(ctx, customer, service, method, amount, discount);
    }

    function adjust(ILedger.Ctx calldata ctx, uint16 service, bool increase, uint128 amount, string calldata reason)
        external
    {
        LEDGER.adjust(ctx, service, increase, amount, reason);
    }

    function refundTopup(ILedger.Ctx calldata ctx, address customer, uint8 method, uint128 amount) external {
        LEDGER.refundTopup(ctx, customer, method, amount);
    }

    function refundSale(ILedger.Ctx calldata ctx, bytes32 originalRefId, uint128 amount) external {
        LEDGER.refundSale(ctx, originalRefId, amount);
    }
}
