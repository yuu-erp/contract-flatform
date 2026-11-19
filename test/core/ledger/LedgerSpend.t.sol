// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {ILedger} from "../../../src/interfaces/ILedger.sol";
import {ISalesSettings} from "../../../src/interfaces/ISalesSettings.sol";
import {IBranchRegistry} from "../../../src/interfaces/IBranchRegistry.sol";
import {LedgerMetrics as M} from "../../../src/libraries/LedgerMetrics.sol";

contract LedgerSpendTest is PlatformFixture {
    uint8 internal constant CASH = 1;
    uint8 internal constant WALLET = 8;

    uint64 internal a;
    uint64 internal b1;
    uint64 internal b2;
    uint64 internal b3;
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
        b3 = _createBranch(a, "c.vn", NET | IQR);
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

    function _spend(uint64 b, uint16 svc, uint128 amt, uint128 disc) internal returns (bytes32 r) {
        r = _ref();
        poster.walletSpend(_ctx(r, b), alice, svc, amt, disc);
    }

    function _cell(uint8 scope, uint64 id, uint256 metric) internal view returns (uint256) {
        uint32 d = ledger.dayOf(b1, block.timestamp);
        return ledger.rollup(scope, id, d, d)[0][metric];
    }

    function test_spend_servedBranchFirst() public {
        _topup(b1, 50_000);
        _topup(b2, 30_000);
        bytes32 r = _spend(b2, NET, 40_000, 0);
        ILedger.Portion[] memory bk = ledger.bucketsOf(a, alice);
        assertEq(bk.length, 1);
        assertEq(bk[0].branchId, b1);
        assertEq(bk[0].amount, 40_000);
        ILedger.Portion[] memory p = ledger.portionsOf(r);
        assertEq(p.length, 2);
        assertEq(p[0].branchId, b2);
        assertEq(p[0].amount, 30_000);
        assertEq(p[1].branchId, b1);
        assertEq(p[1].amount, 10_000);
        uint256 g = M.serviceMetric(NET, M.GROSS);
        uint256 sh = M.serviceMetric(NET, M.SERVED_HERE);
        assertEq(_cell(2, b2, g), 30_000);
        assertEq(_cell(2, b2, sh), 10_000);
        assertEq(_cell(2, b1, g), 10_000);
        assertEq(_cell(2, b1, sh), 0);
        assertEq(_cell(1, a, g), 40_000);
        assertEq(_cell(1, a, sh), 0);
        assertEq(_cell(0, 0, g), 40_000);
        assertEq(_cell(1, a, M.WALLET_SPEND), 40_000);
        assertEq(ledger.walletLiability(a), 40_000);
        ILedger.Entry memory e = ledger.entryOf(r);
        assertEq(uint8(e.kind), uint8(ILedger.EntryKind.WalletSpend));
        assertEq(e.branchId, b2);
        assertEq(e.amount, 40_000);
        assertEq(e.method, WALLET);
    }

    function test_spend_fifoAfterServed() public {
        _topup(b1, 10_000);
        _topup(b3, 10_000);
        _topup(b2, 10_000);
        bytes32 r = _spend(b2, NET, 25_000, 0);
        ILedger.Portion[] memory p = ledger.portionsOf(r);
        assertEq(p.length, 3);
        assertEq(p[0].branchId, b2);
        assertEq(p[0].amount, 10_000);
        assertEq(p[1].branchId, b1);
        assertEq(p[1].amount, 10_000);
        assertEq(p[2].branchId, b3);
        assertEq(p[2].amount, 5000);
        ILedger.Portion[] memory bk = ledger.bucketsOf(a, alice);
        assertEq(bk.length, 1);
        assertEq(bk[0].branchId, b3);
        assertEq(bk[0].amount, 5000);
    }

    function test_spend_insufficientNoChange() public {
        _topup(b1, 20_000);
        bytes32 r = _ref();
        ILedger.Ctx memory c = _ctx(r, b1);
        vm.expectRevert(abi.encodeWithSelector(ILedger.InsufficientBalance.selector, uint128(20_000), uint128(20_001)));
        poster.walletSpend(c, alice, NET, 20_001, 0);
        assertEq(ledger.bucketsOf(a, alice).length, 1);
        assertEq(ledger.balanceOf(a, alice), 20_000);
        assertEq(ledger.walletLiability(a), 20_000);
        assertEq(_cell(1, a, M.serviceMetric(NET, M.GROSS)), 0);
        assertEq(uint8(ledger.entryOf(r).kind), uint8(ILedger.EntryKind.None));
    }

    function test_spend_refillKeepsOrder() public {
        _topup(b1, 10_000);
        _topup(b3, 10_000);
        _spend(b1, NET, 10_000, 0);
        assertEq(ledger.bucketsOf(a, alice).length, 1);
        _topup(b1, 7000);
        ILedger.Portion[] memory bk = ledger.bucketsOf(a, alice);
        assertEq(bk.length, 2);
        assertEq(bk[0].branchId, b3);
        assertEq(bk[0].amount, 10_000);
        assertEq(bk[1].branchId, b1);
        assertEq(bk[1].amount, 7000);
    }

    function test_spend_tax() public {
        vm.prank(agentOwner);
        sales.setBranchTax(b2, IQR, 800);
        _topup(b2, 200_000);
        bytes32 r = _spend(b2, IQR, 108_000, 0);
        assertEq(ledger.entryOf(r).taxBps, 800);
        assertEq(_cell(1, a, M.serviceMetric(IQR, M.TAX)), 8000);
        assertEq(_cell(2, b2, M.serviceMetric(IQR, M.TAX)), 8000);
        assertEq(_cell(0, 0, M.serviceMetric(IQR, M.TAX)), 8000);
        assertEq(_cell(1, a, M.serviceMetric(IQR, M.GROSS)), 108_000);
    }

    function test_spend_taxPostedEvent() public {
        vm.prank(agentOwner);
        sales.setBranchTax(b2, IQR, 800);
        _topup(b1, 50_000);
        _topup(b2, 60_000);
        bytes32 r = _ref();
        // phần (b2, 60_000) thuế 4_444; phần (b1, 48_000) thuế 3_555; tổng 7_999 (làm tròn xuống từng phần)
        vm.expectEmit(true, true, true, true);
        emit ILedger.Posted(1, a, b2, r, ILedger.EntryKind.WalletSpend, alice, IQR, WALLET, 108_000, 7999, actor, 0);
        poster.walletSpend(_ctx(r, b2), alice, IQR, 108_000, 0);
    }

    function test_spend_discountOnce() public {
        _topup(b1, 20_000);
        _topup(b2, 30_000);
        _spend(b2, NET, 40_000, 5000);
        assertEq(_cell(1, a, M.serviceMetric(NET, M.DISCOUNT)), 5000);
        assertEq(_cell(2, b2, M.serviceMetric(NET, M.DISCOUNT)), 5000);
        assertEq(_cell(2, b1, M.serviceMetric(NET, M.DISCOUNT)), 0);
    }

    function test_spend_rejects() public {
        _topup(b2, 100_000);
        ILedger.Ctx memory c = _ctx(_ref(), b2);
        vm.expectRevert(abi.encodeWithSelector(ILedger.InvalidService.selector, uint16(4)));
        poster.walletSpend(c, alice, 4, 1, 0);
        vm.expectRevert(ILedger.ZeroAmount.selector);
        poster.walletSpend(c, alice, NET, 0, 0);

        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(ILedger.NotPoster.selector, stranger, ILedger.EntryKind.WalletSpend));
        ledger.walletSpend(c, alice, NET, 1, 0);

        vm.prank(platformAdmin);
        branches.setBranchServices(b2, IQR);
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotEnabled.selector, b2, NET));
        poster.walletSpend(c, alice, NET, 1, 0);

        vm.prank(agentOwner);
        sales.setBranchPaymentMethods(b2, CASH);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.MethodNotEnabled.selector, b2, WALLET));
        poster.walletSpend(c, alice, IQR, 1, 0);
    }

    function test_invariant_liabilityEqualsBuckets() public {
        _topup(b1, 50_000);
        _topup(b2, 30_000);
        _spend(b2, NET, 40_000, 0);
        _topup(b3, 9000);
        _spend(b3, IQR, 20_000, 1000);
        _topup(b1, 5000);
        _spend(b1, NET, 4000, 0);
        assertEq(ledger.walletLiability(a), ledger.balanceOf(a, alice));
        assertEq(ledger.balanceOf(a, alice), 50_000 + 30_000 + 9000 + 5000 - 64_000);
    }
}
