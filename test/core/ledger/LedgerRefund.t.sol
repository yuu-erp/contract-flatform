// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {ILedger} from "../../../src/interfaces/ILedger.sol";
import {IHistoryIndex} from "../../../src/interfaces/IHistoryIndex.sol";
import {LedgerMetrics as M} from "../../../src/libraries/LedgerMetrics.sol";

contract LedgerRefundTest is PlatformFixture {
    uint8 internal constant CASH = 1;
    uint8 internal constant TRANSFER = 2;
    uint8 internal constant WALLET = 8;

    uint64 internal a;
    uint64 internal b1;
    uint64 internal b2;
    address internal alice;
    address internal actor;
    uint256 internal n;

    function setUp() public override {
        super.setUp();
        alice = makeAddr("alice");
        actor = makeAddr("actor");
        a = _createAgent(agentOwner, NET | IQR);
        b1 = _createBranch(a, "a.vn", NET | IQR);
        b2 = _createBranch(a, "b.vn", NET | IQR);
    }

    function _ref() internal returns (bytes32) {
        return bytes32(++n);
    }

    function _ctx(bytes32 refId, uint64 branchId) internal view returns (ILedger.Ctx memory) {
        return ILedger.Ctx({refId: refId, branchId: branchId, actor: actor, shiftId: 0});
    }

    function _topup(uint64 b, uint128 amt) internal {
        poster.topup(_ctx(_ref(), b), alice, CASH, amt);
    }

    function _spend(uint64 b, uint128 amt) internal returns (bytes32 r) {
        r = _ref();
        poster.walletSpend(_ctx(r, b), alice, NET, amt, 0);
    }

    function _sale(uint64 b, uint16 svc, uint128 amt) internal returns (bytes32 r) {
        r = _ref();
        poster.directSale(_ctx(r, b), address(0), svc, CASH, amt, 0);
    }

    function _cell(uint8 scope, uint64 id, uint256 metric) internal view returns (uint256) {
        uint32 d = ledger.dayOf(b1, block.timestamp);
        return ledger.rollup(scope, id, d, d)[0][metric];
    }

    function _bal(uint64 b) internal view returns (uint128) {
        ILedger.Portion[] memory bk = ledger.bucketsOf(a, alice);
        for (uint256 i; i < bk.length; ++i) {
            if (bk[i].branchId == b) return bk[i].amount;
        }
        return 0;
    }

    function test_refundTopup_capsAtBucket() public {
        _topup(b1, 50_000);
        _topup(b2, 30_000);
        bytes32 r = _ref();
        vm.expectRevert(abi.encodeWithSelector(ILedger.InsufficientBalance.selector, 30_000, 30_001));
        poster.refundTopup(_ctx(r, b2), alice, CASH, 30_001);

        vm.expectEmit(true, true, true, true);
        emit ILedger.Posted(1, a, b2, r, ILedger.EntryKind.TopupRefund, alice, 0, CASH, 30_000, 0, actor, 0);
        poster.refundTopup(_ctx(r, b2), alice, CASH, 30_000);
        ILedger.Portion[] memory bk = ledger.bucketsOf(a, alice);
        assertEq(bk.length, 1);
        assertEq(bk[0].branchId, b1);
        assertEq(ledger.walletLiability(a), 50_000);
        assertEq(_cell(2, b2, M.CASH_OUT), 30_000);
        assertEq(_cell(2, b2, M.WALLET_TOPUP_REFUND), 30_000);
        assertEq(_cell(1, a, M.CASH_OUT), 30_000);
        assertEq(_cell(0, 0, M.WALLET_TOPUP_REFUND), 30_000);
        ILedger.Entry memory e = ledger.entryOf(r);
        assertEq(uint8(e.kind), uint8(ILedger.EntryKind.TopupRefund));
        assertEq(e.amount, 30_000);
    }

    function test_refundTopup_rejects() public {
        _topup(b1, 1000);
        vm.expectRevert(abi.encodeWithSelector(ILedger.InvalidMethod.selector, WALLET));
        poster.refundTopup(_ctx(_ref(), b1), alice, WALLET, 10);
        vm.expectRevert(ILedger.ZeroAmount.selector);
        poster.refundTopup(_ctx(_ref(), b1), alice, CASH, 0);
        // TRANSFER not enabled by default
        vm.expectRevert();
        poster.refundTopup(_ctx(_ref(), b1), alice, TRANSFER, 10);
        // unknown customer: empty bucket
        vm.expectRevert(abi.encodeWithSelector(ILedger.InsufficientBalance.selector, 0, 10));
        poster.refundTopup(_ctx(_ref(), b1), makeAddr("bob"), CASH, 10);
    }

    function test_refundSale_wallet_reverse() public {
        _topup(b1, 50_000);
        _topup(b2, 30_000);
        bytes32 s = _spend(b2, 40_000); // [(b2,30k),(b1,10k)]
        // b2 bucket removed; b1 has 40k
        assertEq(_bal(b2), 0);
        bytes32 r = _ref();
        poster.refundSale(_ctx(r, b2), s, 15_000);
        assertEq(_bal(b1), 40_000 + 10_000);
        assertEq(_bal(b2), 5000);
        assertEq(ledger.walletLiability(a), 80_000 - 40_000 + 15_000);
        uint256 rf = M.serviceMetric(NET, M.REFUND);
        assertEq(_cell(2, b1, rf), 10_000);
        assertEq(_cell(2, b2, rf), 5000);
        assertEq(_cell(1, a, rf), 15_000);
        assertEq(_cell(0, 0, rf), 15_000);
        assertEq(_cell(2, b1, M.WALLET_CREDIT), 10_000);
        assertEq(_cell(2, b2, M.WALLET_CREDIT), 5000);
        assertEq(_cell(0, 0, M.WALLET_CREDIT), 15_000);
        assertEq(ledger.entryOf(s).refunded, 15_000);
        ILedger.Entry memory e = ledger.entryOf(r);
        assertEq(uint8(e.kind), uint8(ILedger.EntryKind.SaleRefund));
        assertEq(e.method, WALLET);
    }

    function test_refundSale_wallet_secondRefundContinues() public {
        _topup(b1, 50_000);
        _topup(b2, 30_000);
        bytes32 s = _spend(b2, 40_000); // [(b2,30k),(b1,10k)]
        poster.refundSale(_ctx(_ref(), b2), s, 15_000); // b1 10k, b2 5k
        poster.refundSale(_ctx(_ref(), b2), s, 25_000); // b2 remaining 25k
        assertEq(_bal(b2), 30_000);
        assertEq(_bal(b1), 50_000);
        assertEq(ledger.walletLiability(a), 80_000);
        vm.expectRevert(abi.encodeWithSelector(ILedger.RefundExceedsOriginal.selector, 0, 1));
        poster.refundSale(_ctx(_ref(), b2), s, 1);
    }

    function test_refundSale_wallet_readdsRemovedBucketAndCap() public {
        _topup(b1, 10_000);
        bytes32 s = _spend(b2, 10_000); // b1 bucket removed
        assertEq(ledger.bucketsOf(a, alice).length, 0);
        // fill 16 buckets
        for (uint256 i; i < 16; ++i) {
            uint64 b = _createBranch(a, string.concat("x", vm.toString(i), ".vn"), NET | IQR);
            _topup(b, 1);
        }
        vm.expectRevert(abi.encodeWithSelector(ILedger.TooManyBuckets.selector, a, alice));
        poster.refundSale(_ctx(_ref(), b2), s, 100);
    }

    function test_refundSale_partialTwice() public {
        bytes32 s = _sale(b1, IQR, 100_000);
        poster.refundSale(_ctx(_ref(), b1), s, 60_000);
        vm.expectRevert(abi.encodeWithSelector(ILedger.RefundExceedsOriginal.selector, 40_000, 40_001));
        poster.refundSale(_ctx(_ref(), b1), s, 40_001);
        poster.refundSale(_ctx(_ref(), b1), s, 40_000);
        assertEq(ledger.entryOf(s).refunded, 100_000);
        assertEq(_cell(2, b1, M.CASH_OUT), 100_000);
        assertEq(_cell(0, 0, M.serviceMetric(IQR, M.REFUND)), 100_000);
        assertEq(_cell(1, a, M.CASH_OUT), 100_000);
    }

    function test_refundSale_wrongBranch() public {
        bytes32 s = _sale(b1, IQR, 100_000);
        vm.expectRevert(abi.encodeWithSelector(ILedger.WrongBranch.selector, b1, b2));
        poster.refundSale(_ctx(_ref(), b2), s, 1000);
    }

    function test_refundSale_unknownOrTopup() public {
        bytes32 unknown = keccak256("x");
        vm.expectRevert(abi.encodeWithSelector(ILedger.UnknownEntry.selector, unknown));
        poster.refundSale(_ctx(_ref(), b1), unknown, 1);

        bytes32 t = _ref();
        poster.topup(_ctx(t, b1), alice, CASH, 1000);
        vm.expectRevert(abi.encodeWithSelector(ILedger.UnknownEntry.selector, t));
        poster.refundSale(_ctx(_ref(), b1), t, 1);

        // refund of a refund
        bytes32 s = _sale(b1, IQR, 1000);
        bytes32 r = _ref();
        poster.refundSale(_ctx(r, b1), s, 500);
        vm.expectRevert(abi.encodeWithSelector(ILedger.UnknownEntry.selector, r));
        poster.refundSale(_ctx(_ref(), b1), r, 1);
    }

    function test_refundSale_taxReverse() public {
        vm.prank(agentOwner);
        sales.setBranchTax(b1, IQR, 800);
        bytes32 s = _sale(b1, IQR, 108_000);
        bytes32 r = _ref();
        vm.expectEmit(true, true, true, true);
        emit ILedger.Posted(1, a, b1, r, ILedger.EntryKind.SaleRefund, address(0), IQR, CASH, 54_000, 4000, actor, 0);
        poster.refundSale(_ctx(r, b1), s, 54_000);
        uint256 tr = M.serviceMetric(IQR, M.TAX_REFUND);
        assertEq(_cell(2, b1, tr), 4000);
        assertEq(_cell(1, a, tr), 4000);
        assertEq(_cell(0, 0, tr), 4000);
    }

    function test_refundSale_walletTaxPerPortion() public {
        vm.prank(agentOwner);
        sales.setBranchTax(b2, NET, 1000);
        _topup(b1, 50_000);
        _topup(b2, 30_000);
        bytes32 s = _spend(b2, 40_000); // 30k b2, 10k b1, tax bps 1000
        bytes32 r = _ref();
        poster.refundSale(_ctx(r, b2), s, 15_000); // b1 10k tax 909, b2 5k tax 454
        uint256 tr = M.serviceMetric(NET, M.TAX_REFUND);
        assertEq(_cell(2, b1, tr), 909);
        assertEq(_cell(2, b2, tr), 454);
        assertEq(_cell(0, 0, tr), 1363);
        assertEq(ledger.entryOf(s).taxBps, 1000);
    }

    function test_refund_countsOnRefundDay() public {
        bytes32 s = _sale(b1, IQR, 10_000);
        uint32 d0 = ledger.dayOf(b1, block.timestamp);
        vm.warp(block.timestamp + 1 days);
        poster.refundSale(_ctx(_ref(), b1), s, 10_000);
        uint256 rf = M.serviceMetric(IQR, M.REFUND);
        assertEq(ledger.rollup(2, b1, d0, d0 + 1)[0][rf], 0);
        assertEq(ledger.rollup(2, b1, d0, d0 + 1)[1][rf], 10_000);
        assertEq(ledger.rollup(2, b1, d0, d0)[0][M.CASH_OUT], 0);
    }

    function test_refund_writesFullDBWithOriginal() public {
        bytes32 s = _sale(b1, IQR, 10_000);
        poster.refundSale(_ctx(_ref(), b1), s, 4000);
        IHistoryIndex.Query memory q;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("K", "5");
        q.sortSlot = -1;
        q.limit = 10;
        IHistoryIndex.Page memory page = historyIndex.search(a, "ledger", q);
        assertEq(page.total, 1);
        ILedger.LedgerRecord memory rec = abi.decode(page.data[0], (ILedger.LedgerRecord));
        assertEq(rec.originalRefId, s);
        assertEq(rec.amount, 4000);
    }

    function test_refund_notPoster() public {
        bytes32 s = _sale(b1, IQR, 10_000);
        vm.expectRevert(abi.encodeWithSelector(ILedger.NotPoster.selector, address(this), ILedger.EntryKind.SaleRefund));
        ledger.refundSale(_ctx(_ref(), b1), s, 1);
        vm.expectRevert(
            abi.encodeWithSelector(ILedger.NotPoster.selector, address(this), ILedger.EntryKind.TopupRefund)
        );
        ledger.refundTopup(_ctx(_ref(), b1), alice, CASH, 1);
    }
}
