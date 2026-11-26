// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {MockLedgerPoster} from "../../utils/MockLedgerPoster.sol";
import {ILedger} from "../../../src/interfaces/ILedger.sol";
import {IHistoryIndex} from "../../../src/interfaces/IHistoryIndex.sol";
import {ISalesSettings} from "../../../src/interfaces/ISalesSettings.sol";
import {IBranchRegistry} from "../../../src/interfaces/IBranchRegistry.sol";
import {LedgerMetrics as M} from "../../../src/libraries/LedgerMetrics.sol";

contract LedgerSaleTest is PlatformFixture {
    uint8 internal constant CASH = 1;
    uint8 internal constant TRANSFER = 2;
    uint8 internal constant CARD = 4;
    uint8 internal constant WALLET = 8;

    uint64 internal a;
    uint64 internal b1;
    address internal alice;
    address internal actor;
    uint256 internal n;

    function setUp() public override {
        super.setUp();
        alice = makeAddr("alice");
        actor = makeAddr("actor");
        a = _createAgent(agentOwner, NET | IQR);
        b1 = _createBranch(a, "a.vn", NET | IQR);
    }

    function _ref() internal returns (bytes32) {
        return bytes32(++n);
    }

    function _ctx(bytes32 refId) internal view returns (ILedger.Ctx memory) {
        return ILedger.Ctx({refId: refId, branchId: b1, actor: actor, shiftId: 0});
    }

    function _cell(uint8 scope, uint64 id, uint256 metric) internal view returns (uint256) {
        uint32 d = ledger.dayOf(b1, block.timestamp);
        return _rollCell(scope, id, d, metric);
    }

    function _allScopes(uint256 metric, uint256 expected) internal view {
        assertEq(_cell(0, 0, metric), expected, "platform");
        assertEq(_cell(1, a, metric), expected, "agent");
        assertEq(_cell(2, b1, metric), expected, "branch");
    }

    function test_directSale_cashCounts() public {
        vm.prank(agentOwner);
        sales.setBranchTax(b1, IQR, 800);
        bytes32 r = _ref();
        vm.expectEmit(true, true, true, true);
        emit ILedger.Posted(1, a, b1, r, ILedger.EntryKind.DirectSale, address(0), IQR, CASH, 216_000, 16_000, actor, 0);
        poster.directSale(_ctx(r), address(0), IQR, CASH, 216_000, 5000);
        _allScopes(M.CASH_IN, 216_000);
        _allScopes(_svc(IQR, M.GROSS), 216_000);
        _allScopes(_svc(IQR, M.TAX), 16_000);
        _allScopes(_svc(IQR, M.DISCOUNT), 5000);
        _allScopes(_svc(NET, M.GROSS), 0);
        _allScopes(M.WALLET_TOPUP, 0);
        _allScopes(M.WALLET_SPEND, 0);
        ILedger.Entry memory e = ledger.entryOf(r);
        assertEq(uint8(e.kind), uint8(ILedger.EntryKind.DirectSale));
        assertEq(e.method, CASH);
        assertEq(e.service, IQR);
        assertEq(e.taxBps, 800);
        assertEq(e.branchId, b1);
        assertEq(e.customer, address(0));
        assertEq(e.amount, 216_000);
        assertEq(e.refunded, 0);
        assertEq(ledger.portionsOf(r).length, 0);
        assertEq(ledger.walletLiability(a), 0);
    }

    function test_directSale_cardAndTransferIndex() public {
        vm.prank(agentOwner);
        sales.setAgentPaymentMethods(a, CASH | TRANSFER | CARD | WALLET);
        poster.directSale(_ctx(_ref()), alice, NET, TRANSFER, 10_000, 0);
        poster.directSale(_ctx(_ref()), alice, NET, CARD, 7000, 0);
        _allScopes(M.CASH_IN + 1, 10_000);
        _allScopes(M.CASH_IN + 2, 7000);
        _allScopes(M.CASH_IN, 0);
        _allScopes(_svc(NET, M.GROSS), 17_000);
        assertEq(ledger.balanceOf(a, alice), 0);
    }

    function test_directSale_rejects() public {
        ILedger.Ctx memory c = _ctx(_ref());
        vm.expectRevert(abi.encodeWithSelector(M.InvalidMethod.selector, WALLET));
        poster.directSale(c, address(0), IQR, WALLET, 1000, 0);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.MethodNotEnabled.selector, b1, TRANSFER));
        poster.directSale(c, address(0), IQR, TRANSFER, 1000, 0);
        vm.expectRevert(ILedger.ZeroAmount.selector);
        poster.directSale(c, address(0), IQR, CASH, 0, 0);
        vm.expectRevert(abi.encodeWithSelector(MockLedgerPoster.NoPosterFor.selector, uint16(4)));
        poster.directSale(c, address(0), 4, CASH, 1000, 0); // Loyalty không có poster bán hàng
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(ILedger.NotPoster.selector, stranger, ILedger.EntryKind.DirectSale));
        ledger.directSale(c, address(0), CASH, 1000, 0);
    }

    function test_directSale_serviceNotEnabled() public {
        uint64 b2 = _createBranch(a, "b.vn", NET);
        ILedger.Ctx memory c = ILedger.Ctx({refId: _ref(), branchId: b2, actor: actor, shiftId: 0});
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotEnabled.selector, b2, IQR));
        poster.directSale(c, address(0), IQR, CASH, 1000, 0);
    }

    function test_refId_usedOnceAcrossKinds_sale() public {
        bytes32 r = _ref();
        poster.topup(_ctx(r), alice, CASH, 5000);
        vm.expectRevert(abi.encodeWithSelector(ILedger.RefIdUsed.selector, r));
        poster.directSale(_ctx(r), address(0), IQR, CASH, 1000, 0);
        bytes32 r2 = _ref();
        poster.directSale(_ctx(r2), address(0), IQR, CASH, 1000, 0);
        vm.expectRevert(abi.encodeWithSelector(ILedger.RefIdUsed.selector, r2));
        poster.adjust(_ctx(r2), NET, true, 1, "x");
    }

    function test_adjust_byService() public {
        bytes32 r = _ref();
        vm.expectEmit(true, true, true, true);
        emit ILedger.Posted(1, a, b1, r, ILedger.EntryKind.Adjust, address(0), NET, 1, 5000, 0, actor, 0);
        poster.adjust(_ctx(r), NET, true, 5000, "bu gio may loi");
        _allScopes(_svc(NET, M.ADJ_UP), 5000);
        _allScopes(_svc(NET, M.ADJ_DOWN), 0);
        _allScopes(_svc(IQR, M.ADJ_UP), 0);
        _allScopes(_svc(NET, M.GROSS), 0);
        _allScopes(_svc(NET, M.TAX), 0);
        poster.adjust(_ctx(_ref()), NET, false, 1200, "tru nham");
        _allScopes(_svc(NET, M.ADJ_DOWN), 1200);
        _allScopes(_svc(NET, M.ADJ_UP), 5000);
        ILedger.Entry memory e = ledger.entryOf(r);
        assertEq(uint8(e.kind), uint8(ILedger.EntryKind.Adjust));
        assertEq(e.service, NET);
        assertEq(e.amount, 5000);
        assertEq(e.branchId, b1);
        assertEq(e.method, ledger.ADJUST_UP());
        bytes32 r2 = _ref();
        poster.adjust(_ctx(r2), NET, false, 700, "tru nham");
        assertEq(ledger.entryOf(r2).method, ledger.ADJUST_DOWN());
    }

    function test_adjust_neverTouchesWalletOrCash() public {
        poster.topup(_ctx(_ref()), alice, CASH, 9000);
        poster.adjust(_ctx(_ref()), IQR, true, 4000, "dieu chinh");
        poster.adjust(_ctx(_ref()), IQR, false, 4000, "dieu chinh");
        assertEq(ledger.balanceOf(a, alice), 9000);
        assertEq(ledger.walletLiability(a), 9000);
        _allScopes(M.CASH_IN, 9000);
        _allScopes(M.WALLET_TOPUP, 9000);
        _allScopes(M.WALLET_SPEND, 0);
        _allScopes(M.CASH_OUT, 0);
    }

    function test_adjust_requiresReason() public {
        vm.expectRevert(ILedger.InvalidReason.selector);
        poster.adjust(_ctx(_ref()), NET, true, 1000, "");
        vm.expectRevert(ILedger.InvalidReason.selector);
        poster.adjust(_ctx(_ref()), NET, true, 1000, string(new bytes(201)));
        poster.adjust(_ctx(_ref()), NET, true, 1000, string(new bytes(200)));
        poster.adjust(_ctx(_ref()), NET, true, 1000, "x");
    }

    function test_adjust_rejects() public {
        vm.expectRevert(ILedger.ZeroAmount.selector);
        poster.adjust(_ctx(_ref()), NET, true, 0, "x");
        uint64 b2 = _createBranch(a, "b.vn", NET);
        ILedger.Ctx memory c = ILedger.Ctx({refId: _ref(), branchId: b2, actor: actor, shiftId: 0});
        vm.expectRevert(abi.encodeWithSelector(IBranchRegistry.ServiceNotEnabled.selector, b2, IQR));
        poster.adjust(c, IQR, true, 1, "x");
        vm.expectRevert(abi.encodeWithSelector(ILedger.NotPoster.selector, address(this), ILedger.EntryKind.Adjust));
        ledger.adjust(_ctx(_ref()), true, 1, "x");
    }

    function _records(ILedger.EntryKind kind) internal view returns (bytes[] memory) {
        IHistoryIndex.Query memory q;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("K", vm.toString(uint256(kind)));
        q.sortSlot = -1;
        q.limit = 10;
        return historyIndex.search(a, "ledger", q).data;
    }

    function test_fullDB_saleAndAdjust() public {
        vm.prank(agentOwner);
        sales.setBranchTax(b1, NET, 1000);
        bytes32 r1 = _ref();
        poster.directSale(_ctx(r1), alice, NET, CASH, 11_000, 500);
        bytes[] memory d = _records(ILedger.EntryKind.DirectSale);
        assertEq(d.length, 1);
        ILedger.LedgerRecord memory s = abi.decode(d[0], (ILedger.LedgerRecord));
        assertEq(s.refId, r1);
        assertEq(s.customer, alice);
        assertEq(s.amount, 11_000);
        assertEq(s.discount, 500);
        assertEq(s.tax, 1000);
        assertEq(s.portions.length, 0);

        bytes32 r2 = _ref();
        poster.adjust(_ctx(r2), NET, false, 300, "tru nham");
        d = _records(ILedger.EntryKind.Adjust);
        assertEq(d.length, 1);
        ILedger.LedgerRecord memory j = abi.decode(d[0], (ILedger.LedgerRecord));
        assertEq(j.refId, r2);
        assertEq(j.reason, "tru nham");
        assertEq(j.tax, 0);
        assertEq(j.amount, 300);
        assertEq(j.method, ledger.ADJUST_DOWN());

        bytes32 r3 = _ref();
        vm.expectEmit(true, true, true, true);
        emit ILedger.Posted(1, a, b1, r3, ILedger.EntryKind.Adjust, address(0), NET, 1, 40, 0, actor, 0);
        poster.adjust(_ctx(r3), NET, true, 40, "cong them");
        d = _records(ILedger.EntryKind.Adjust);
        assertEq(d.length, 2);
        ILedger.LedgerRecord memory x = abi.decode(d[0], (ILedger.LedgerRecord));
        ILedger.LedgerRecord memory y = abi.decode(d[1], (ILedger.LedgerRecord));
        (ILedger.LedgerRecord memory up, ILedger.LedgerRecord memory down) = x.refId == r3 ? (x, y) : (y, x);
        assertEq(up.method, ledger.ADJUST_UP());
        assertEq(down.method, ledger.ADJUST_DOWN());
    }
}
