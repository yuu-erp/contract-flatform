// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {ILedger} from "../../../src/interfaces/ILedger.sol";
import {ISalesSettings} from "../../../src/interfaces/ISalesSettings.sol";
import {IPlatformAccess} from "../../../src/interfaces/IPlatformAccess.sol";
import {IHistoryIndex} from "../../../src/interfaces/IHistoryIndex.sol";
import {LedgerMetrics as M} from "../../../src/libraries/LedgerMetrics.sol";
import {IRegistry} from "../../../src/interfaces/IRegistry.sol";
import {MockModulePoster} from "../../utils/MockLedgerPoster.sol";

contract LedgerTest is PlatformFixture {
    uint8 internal constant CASH = 1;
    uint8 internal constant TRANSFER = 2;
    uint8 internal constant WALLET = 8;

    uint64 internal a;
    uint64 internal b1;
    address internal alice;
    address internal actor;

    function setUp() public override {
        super.setUp();
        alice = makeAddr("alice");
        actor = makeAddr("actor");
        a = _createAgent(agentOwner, NET | IQR);
        b1 = _createBranch(a, "a.vn", NET | IQR);
    }

    function _ctx(bytes32 refId, uint64 branchId) internal view returns (ILedger.Ctx memory) {
        return ILedger.Ctx({refId: refId, branchId: branchId, actor: actor, shiftId: 0});
    }

    function _day() internal view returns (uint32) {
        return ledger.dayOf(b1, block.timestamp);
    }

    function _cell(uint8 scope, uint64 id, uint32 d, uint256 metric) internal view returns (uint256) {
        return _rollCell(scope, id, d, metric);
    }

    function test_topup_creditsBucketAndRollups() public {
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, CASH, 100_000);
        assertEq(ledger.balanceOf(a, alice), 100_000);
        ILedger.Portion[] memory p = ledger.bucketsOf(a, alice);
        assertEq(p.length, 1);
        assertEq(p[0].branchId, b1);
        assertEq(p[0].amount, 100_000);
        assertEq(ledger.walletLiability(a), 100_000);
        uint32 d = _day();
        assertEq(d, 20_454);
        assertEq(_cell(2, b1, d, M.CASH_IN), 100_000);
        assertEq(_cell(2, b1, d, M.WALLET_TOPUP), 100_000);
        assertEq(_cell(1, a, d, M.CASH_IN), 100_000);
        assertEq(_cell(1, a, d, M.WALLET_TOPUP), 100_000);
        assertEq(_cell(0, 0, d, M.CASH_IN), 100_000);
        assertEq(_cell(0, 0, d, M.WALLET_TOPUP), 100_000);
        ILedger.Entry memory e = ledger.entryOf(bytes32(uint256(1)));
        assertEq(uint8(e.kind), uint8(ILedger.EntryKind.Topup));
        assertEq(e.amount, 100_000);
        assertEq(e.customer, alice);
    }

    function test_topup_rejects() public {
        vm.expectRevert(ILedger.ZeroRefId.selector);
        poster.topup(_ctx(bytes32(0), b1), alice, CASH, 1);
        vm.expectRevert(ILedger.ZeroAmount.selector);
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, CASH, 0);
        vm.expectRevert(abi.encodeWithSelector(ILedger.InvalidMethod.selector, uint8(8)));
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, WALLET, 1);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.MethodNotEnabled.selector, b1, TRANSFER));
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, TRANSFER, 1);

        ILedger.Ctx memory c = _ctx(bytes32(uint256(1)), b1);
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(ILedger.NotPoster.selector, stranger, ILedger.EntryKind.Topup));
        ledger.topup(c, alice, CASH, 1);

        vm.prank(platformAdmin);
        branches.suspendBranch(b1, "test");
        vm.expectRevert(abi.encodeWithSelector(ILedger.BranchNotActive.selector, b1));
        poster.topup(c, alice, CASH, 1);
    }

    function test_refId_usedOnceAcrossKinds() public {
        bytes32 r = bytes32(uint256(7));
        poster.topup(_ctx(r, b1), alice, CASH, 10);
        vm.expectRevert(abi.encodeWithSelector(ILedger.RefIdUsed.selector, r));
        poster.topup(_ctx(r, b1), alice, CASH, 10);
    }

    function test_topup_dayBoundary() public {
        vm.warp(1_767_200_399); // 2025-12-31T16:59:59Z = 23:59:59 +07
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, CASH, 1);
        vm.warp(block.timestamp + 1);
        poster.topup(_ctx(bytes32(uint256(2)), b1), alice, CASH, 2);
        assertEq(_cell(2, b1, 20_453, M.WALLET_TOPUP), 1);
        assertEq(_cell(2, b1, 20_454, M.WALLET_TOPUP), 2);
        assertEq(ledger.balanceOf(a, alice), 3);
    }

    function test_buckets_cap16() public {
        for (uint256 i; i < 16; ++i) {
            uint64 b = i == 0 ? b1 : _createBranch(a, string.concat("x", vm.toString(i), ".vn"), NET);
            poster.topup(_ctx(bytes32(i + 1), b), alice, CASH, 5);
        }
        assertEq(ledger.bucketsOf(a, alice).length, 16);
        uint64 b17 = _createBranch(a, "x17.vn", NET);
        vm.expectRevert(abi.encodeWithSelector(ILedger.TooManyBuckets.selector, a, alice));
        poster.topup(_ctx(bytes32(uint256(99)), b17), alice, CASH, 5);
        // nạp thêm vào túi có sẵn vẫn được
        poster.topup(_ctx(bytes32(uint256(100)), b1), alice, CASH, 5);
        assertEq(ledger.balanceOf(a, alice), 16 * 5 + 5);
    }

    function test_topup_writesFullDB() public {
        ILedger.Ctx memory c = ILedger.Ctx({refId: bytes32(uint256(1)), branchId: b1, actor: actor, shiftId: 3});
        poster.topup(c, alice, CASH, 100_000);
        IHistoryIndex.Query memory q;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("K", "1");
        q.sortSlot = -1;
        q.limit = 10;
        IHistoryIndex.Page memory page = historyIndex.search(a, "ledger", q);
        assertEq(page.total, 1);
        ILedger.LedgerRecord memory r = abi.decode(page.data[0], (ILedger.LedgerRecord));
        assertEq(r.amount, 100_000);
        assertEq(r.actor, actor);
        assertEq(r.customer, alice);
        assertEq(r.shiftId, 3);
        assertEq(r.refId, bytes32(uint256(1)));
        assertEq(r.agentId, a);
        assertEq(r.version, 1);
        assertEq(r.timestamp, block.timestamp);
    }

    function test_rollup_rangeLimit() public {
        vm.expectRevert(ILedger.InvalidRange.selector);
        ledger.rollup(0, 0, 0, 93);
        vm.expectRevert(ILedger.InvalidRange.selector);
        ledger.rollup(0, 0, 5, 4);
        assertEq(ledger.rollup(0, 0, 0, 92).length, 93);
    }

    function test_rollup_platformIgnoresId() public {
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, CASH, 100_000);
        uint32 d = _day();
        uint256[32][] memory x = ledger.rollup(ledger.SCOPE_PLATFORM(), 5, d, d);
        uint256[32][] memory y = ledger.rollup(ledger.SCOPE_PLATFORM(), 0, d, d);
        assertEq(x[0][M.WALLET_TOPUP], 100_000);
        for (uint256 i; i < 32; ++i) {
            assertEq(x[0][i], y[0][i]);
        }
    }

    function test_setPoster_onlyOwner() public {
        address pnet = address(poster.net());
        vm.prank(platformAdmin);
        vm.expectRevert(abi.encodeWithSelector(IPlatformAccess.NotPlatformOwner.selector, platformAdmin));
        ledger.setPoster(pnet, 1, SALE_KINDS, 1);
        ILedger.License memory l = ledger.licenseOf(pnet);
        assertEq(l.moduleId, 1);
        assertEq(l.kindsMask, SALE_KINDS);
        assertEq(l.maxAmount, type(uint128).max);
    }

    function test_whenPaused() public {
        vm.prank(platformOwner);
        access.pause();
        vm.expectRevert(PausableUpgradeable.EnforcedPause.selector);
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, CASH, 1);
    }

    function test_topup_emitsPosted() public {
        bytes32 r = bytes32(uint256(5));
        vm.expectEmit(true, true, true, true);
        emit ILedger.Posted(1, a, b1, r, ILedger.EntryKind.Topup, alice, 0, CASH, 1000, 0, actor, 0);
        poster.topup(_ctx(r, b1), alice, CASH, 1000);
    }

    function test_setPoster_ownerSetsAndEmits() public {
        address p2 = makeAddr("p2");
        vm.expectEmit(true, false, false, true);
        emit ILedger.PosterSet(1, p2, 2, 0x04, 500);
        vm.prank(platformOwner);
        ledger.setPoster(p2, 2, 0x04, 500);
        assertEq(ledger.licenseOf(p2).kindsMask, 0x04);
        assertEq(ledger.licenseOf(p2).maxAmount, 500);
    }

    function test_setPoster_zeroAddressReverts() public {
        vm.prank(platformOwner);
        vm.expectRevert(ILedger.ZeroAddress.selector);
        ledger.setPoster(address(0), 0, TOPUP_KINDS, 1);
    }

    function test_setPoster_maskZeroRevokes() public {
        address pay = address(poster.pay());
        vm.prank(platformOwner);
        ledger.setPoster(pay, 0, 0, 0);
        assertEq(ledger.licenseOf(pay).kindsMask, 0);
        ILedger.Ctx memory c = _ctx(bytes32(uint256(1)), b1);
        vm.expectRevert(abi.encodeWithSelector(ILedger.NotPoster.selector, pay, ILedger.EntryKind.Topup));
        poster.topup(c, alice, CASH, 1);
    }

    /// @dev ADR 0031 C3: nạp chỉ của thanh toán nền tảng (module 0); bán hàng chỉ của module có FLAG_SALES.
    function test_setPoster_rejectsInvalidLicenses() public {
        address p = makeAddr("p");
        vm.startPrank(platformOwner);
        vm.expectRevert(ILedger.InvalidLicense.selector);
        ledger.setPoster(p, 0, SALE_KINDS, 1); // module 0 không được bán hàng
        vm.expectRevert(ILedger.InvalidLicense.selector);
        ledger.setPoster(p, 1, TOPUP_KINDS, 1); // module bán hàng không được nạp ví
        vm.expectRevert(ILedger.InvalidLicense.selector);
        ledger.setPoster(p, 3, SALE_KINDS, 1); // Loyalty không bán hàng
        vm.expectRevert(ILedger.InvalidLicense.selector);
        ledger.setPoster(p, 9, SALE_KINDS, 1); // module chưa đăng ký
        vm.expectRevert(ILedger.InvalidLicense.selector);
        ledger.setPoster(p, 1, SALE_KINDS, 0); // trần 0
        vm.expectRevert(ILedger.InvalidLicense.selector);
        ledger.setPoster(p, 0, 0x81, 1); // bit loại không tồn tại
        vm.stopPrank();
    }

    function test_license_capPerEntry() public {
        address pay = address(poster.pay());
        vm.prank(platformOwner);
        ledger.setPoster(pay, 0, TOPUP_KINDS, 50_000);
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, CASH, 50_000);
        vm.expectRevert(abi.encodeWithSelector(ILedger.AmountExceedsLimit.selector, uint128(50_000), uint128(50_001)));
        poster.topup(_ctx(bytes32(uint256(2)), b1), alice, CASH, 50_001);
    }

    /// @dev ADR 0031 C2 — "module chết": tạm dừng NET thì Ledger từ chối mọi bút toán của NET,
    ///      nạp ví và IQR vẫn chạy; mở lại thì NET chạy tiếp.
    function test_modulePaused_onlyThatModuleStops() public {
        vm.prank(agentOwner);
        sales.setAgentPaymentMethods(a, 15);
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, CASH, 100_000);
        vm.prank(platformAdmin);
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Paused, "net loi tinh tien");

        vm.expectRevert(
            abi.encodeWithSelector(IRegistry.ModuleNotActive.selector, uint8(1), IRegistry.ModuleStatus.Paused)
        );
        poster.walletSpend(_ctx(bytes32(uint256(2)), b1), alice, NET, 10_000, 0);

        poster.walletSpend(_ctx(bytes32(uint256(3)), b1), alice, IQR, 10_000, 0);
        poster.topup(_ctx(bytes32(uint256(4)), b1), alice, CASH, 5000);
        assertEq(ledger.balanceOf(a, alice), 95_000);

        vm.prank(platformAdmin);
        modules.setModuleStatus(1, IRegistry.ModuleStatus.Active, "da sua");
        poster.walletSpend(_ctx(bytes32(uint256(5)), b1), alice, NET, 10_000, 0);
        assertEq(ledger.balanceOf(a, alice), 85_000);
    }

    /// @dev C3: poster của IQR không hoàn được bút toán của NET.
    function test_refundSale_wrongModuleReverts() public {
        vm.prank(agentOwner);
        sales.setAgentPaymentMethods(a, 15);
        poster.topup(_ctx(bytes32(uint256(1)), b1), alice, CASH, 100_000);
        poster.walletSpend(_ctx(bytes32(uint256(2)), b1), alice, NET, 10_000, 0);
        MockModulePoster iqrPoster = poster.iqr();
        vm.expectRevert(abi.encodeWithSelector(ILedger.WrongModule.selector, NET, IQR));
        iqrPoster.refundSale(_ctx(bytes32(uint256(3)), b1), bytes32(uint256(2)), 1000, "x");
    }
}
