// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ILedger} from "../../src/interfaces/ILedger.sol";

/// @notice Một poster có giấy phép (ADR 0031): chuyển tiếp nguyên văn API mới của Ledger, nên `msg.sender` tại Ledger
///         là contract này.
contract MockModulePoster {
    ILedger public immutable LEDGER;

    constructor(address ledger_) {
        LEDGER = ILedger(ledger_);
    }

    function topup(ILedger.Ctx calldata ctx, address customer, uint8 method, uint128 amount) external {
        LEDGER.topup(ctx, customer, method, amount);
    }

    function walletSpend(ILedger.Ctx calldata ctx, address customer, uint128 amount, uint128 discount) external {
        LEDGER.walletSpend(ctx, customer, amount, discount);
    }

    function directSale(ILedger.Ctx calldata ctx, address customer, uint8 method, uint128 amount, uint128 discount)
        external
    {
        LEDGER.directSale(ctx, customer, method, amount, discount);
    }

    function adjust(ILedger.Ctx calldata ctx, bool increase, uint128 amount, string calldata reason) external {
        LEDGER.adjust(ctx, increase, amount, reason);
    }

    function refundTopup(
        ILedger.Ctx calldata ctx,
        address customer,
        uint8 method,
        uint128 amount,
        string calldata reason
    ) external {
        LEDGER.refundTopup(ctx, customer, method, amount, reason);
    }

    function refundSale(ILedger.Ctx calldata ctx, bytes32 originalRefId, uint128 amount, string calldata reason)
        external
    {
        LEDGER.refundSale(ctx, originalRefId, amount, reason);
    }
}

/// @notice Bộ định tuyến cho test cũ: giữ API "có tham số service" và chuyển sang poster của đúng module.
///         `pay` = thanh toán nền tảng (moduleId 0: Topup/TopupRefund); `svc(1)` = NET, `svc(2)` = IQR.
///         Fixture cấp giấy phép cho các poster con. `Ctx.actor` do test truyền vào.
contract MockLedgerPoster {
    error NoPosterFor(uint16 service);

    ILedger public immutable LEDGER;
    MockModulePoster public immutable pay;
    MockModulePoster public immutable net;
    MockModulePoster public immutable iqr;

    constructor(address ledger_) {
        LEDGER = ILedger(ledger_);
        pay = new MockModulePoster(ledger_);
        net = new MockModulePoster(ledger_);
        iqr = new MockModulePoster(ledger_);
    }

    function svc(uint16 service) public view returns (MockModulePoster) {
        if (service == 1) return net;
        if (service == 2) return iqr;
        revert NoPosterFor(service);
    }

    function topup(ILedger.Ctx calldata ctx, address customer, uint8 method, uint128 amount) external {
        pay.topup(ctx, customer, method, amount);
    }

    function walletSpend(ILedger.Ctx calldata ctx, address customer, uint16 service, uint128 amount, uint128 discount)
        external
    {
        svc(service).walletSpend(ctx, customer, amount, discount);
    }

    function directSale(
        ILedger.Ctx calldata ctx,
        address customer,
        uint16 service,
        uint8 method,
        uint128 amount,
        uint128 discount
    ) external {
        svc(service).directSale(ctx, customer, method, amount, discount);
    }

    function adjust(ILedger.Ctx calldata ctx, uint16 service, bool increase, uint128 amount, string calldata reason)
        external
    {
        svc(service).adjust(ctx, increase, amount, reason);
    }

    function refundTopup(
        ILedger.Ctx calldata ctx,
        address customer,
        uint8 method,
        uint128 amount,
        string calldata reason
    ) external {
        pay.refundTopup(ctx, customer, method, amount, reason);
    }

    /// @dev Đi qua poster của module bút toán gốc (gốc không tồn tại → NET, để Ledger trả UnknownEntry).
    function refundSale(ILedger.Ctx calldata ctx, bytes32 originalRefId, uint128 amount, string calldata reason)
        external
    {
        uint16 s = LEDGER.entryOf(originalRefId).service;
        svc(s == 0 ? 1 : s).refundSale(ctx, originalRefId, amount, reason);
    }
}
