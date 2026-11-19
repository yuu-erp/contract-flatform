// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {PlatformFixture} from "../utils/PlatformFixture.sol";
import {MockLedgerPoster} from "../utils/MockLedgerPoster.sol";
import {Ledger} from "../../src/core/ledger/Ledger.sol";
import {ILedger} from "../../src/interfaces/ILedger.sol";
import {LedgerMetrics as M} from "../../src/libraries/LedgerMetrics.sol";

/// @notice Gọi ngẫu nhiên sáu hàm ghi của Ledger qua MockLedgerPoster: 3 chi nhánh, 3 khách, warp tối đa 3 ngày.
///         Lời gọi sai (hết số dư, vượt gốc, ...) bị nuốt bằng try/catch.
contract LedgerHandler is Test {
    Ledger internal ledger;
    MockLedgerPoster internal poster;
    uint64[3] internal branchIds;
    address[3] internal customers;
    uint256 internal n;

    bytes32[] internal refIds; // mọi refId bút toán đã ghi thành công
    bytes32[] internal saleRefs; // walletSpend + directSale đã ghi, để hoàn
    mapping(bytes32 => uint64) internal saleBranch;
    uint256 public startTs;

    constructor(Ledger ledger_, MockLedgerPoster poster_, uint64 b0, uint64 b1, uint64 b2) {
        ledger = ledger_;
        poster = poster_;
        branchIds = [b0, b1, b2];
        for (uint256 i; i < 3; ++i) {
            customers[i] = address(uint160(0xC000 + i));
        }
        startTs = block.timestamp;
    }

    function _ctx(uint256 b) internal returns (ILedger.Ctx memory) {
        return ILedger.Ctx({refId: bytes32(++n), branchId: branchIds[b % 3], actor: address(0xAC), shiftId: 1});
    }

    function _method(uint256 s) internal pure returns (uint8) {
        uint256 r = s % 3;
        return r == 0 ? 1 : (r == 1 ? 2 : 4);
    }

    function _amount(uint256 s) internal pure returns (uint128) {
        return uint128(1 + (s % 200_000));
    }

    function _svc(uint256 s) internal pure returns (uint16) {
        return s % 2 == 0 ? 1 : 2;
    }

    function topup(uint256 b, uint256 c, uint256 m, uint256 a) external {
        ILedger.Ctx memory x = _ctx(b);
        try poster.topup(x, customers[c % 3], _method(m), _amount(a)) {
            refIds.push(x.refId);
        } catch {}
    }

    function walletSpend(uint256 b, uint256 c, uint256 s, uint256 a, uint256 d) external {
        ILedger.Ctx memory x = _ctx(b);
        try poster.walletSpend(x, customers[c % 3], _svc(s), _amount(a), uint128(d % 5000)) {
            refIds.push(x.refId);
            saleRefs.push(x.refId);
            saleBranch[x.refId] = x.branchId;
        } catch {}
    }

    function directSale(uint256 b, uint256 c, uint256 s, uint256 m, uint256 a, uint256 d) external {
        ILedger.Ctx memory x = _ctx(b);
        address cust = c % 4 == 3 ? address(0) : customers[c % 3];
        try poster.directSale(x, cust, _svc(s), _method(m), _amount(a), uint128(d % 5000)) {
            refIds.push(x.refId);
            saleRefs.push(x.refId);
            saleBranch[x.refId] = x.branchId;
        } catch {}
    }

    function adjust(uint256 b, uint256 s, bool up, uint256 a) external {
        ILedger.Ctx memory x = _ctx(b);
        try poster.adjust(x, _svc(s), up, _amount(a), "adj") {
            refIds.push(x.refId);
        } catch {}
    }

    function refundTopup(uint256 b, uint256 c, uint256 m, uint256 a) external {
        ILedger.Ctx memory x = _ctx(b);
        try poster.refundTopup(x, customers[c % 3], _method(m), _amount(a)) {
            refIds.push(x.refId);
        } catch {}
    }

    function refundSale(uint256 pick, uint256 a, bool wrongBranch) external {
        if (saleRefs.length == 0) return;
        bytes32 orig = saleRefs[pick % saleRefs.length];
        ILedger.Ctx memory x = _ctx(0);
        uint64 b = saleBranch[orig];
        x.branchId = wrongBranch ? branchIds[(a + 1) % 3] : b;
        // nửa số lần xin đúng phần còn lại để chạm trần
        ILedger.Entry memory e = ledger.entryOf(orig);
        uint128 amt = a % 2 == 0 ? e.amount - e.refunded : _amount(a);
        if (amt == 0) amt = 1;
        try poster.refundSale(x, orig, amt) {
            refIds.push(x.refId);
        } catch {}
    }

    function warp(uint256 secs) external {
        vm.warp(block.timestamp + (secs % (3 days)));
    }

    function customer(uint256 i) external view returns (address) {
        return customers[i];
    }

    function branch(uint256 i) external view returns (uint64) {
        return branchIds[i];
    }

    function refCount() external view returns (uint256) {
        return refIds.length;
    }

    function refAt(uint256 i) external view returns (bytes32) {
        return refIds[i];
    }

    function saleCount() external view returns (uint256) {
        return saleRefs.length;
    }

    function saleAt(uint256 i) external view returns (bytes32) {
        return saleRefs[i];
    }
}

contract LedgerInvariantTest is PlatformFixture {
    LedgerHandler internal handler;
    uint64 internal agentId;

    function setUp() public override {
        super.setUp();
        agentId = _createAgent(agentOwner, NET | IQR);
        uint64 b0 = _createBranch(agentId, "a.vn", NET | IQR);
        uint64 b1 = _createBranch(agentId, "b.vn", NET | IQR);
        uint64 b2 = _createBranch(agentId, "c.vn", NET | IQR);
        vm.startPrank(agentOwner);
        sales.setAgentPaymentMethods(agentId, 15);
        sales.setAgentTax(agentId, NET, 1000);
        sales.setBranchTax(b1, IQR, 800);
        sales.setBranchTax(b2, NET, 0);
        vm.stopPrank();
        vm.startPrank(platformAdmin);
        branches.setBranchTimezone(b1, -300);
        branches.setBranchTimezone(b2, 840);
        vm.stopPrank();
        vm.warp(1_800_000_000);
        handler = new LedgerHandler(ledger, poster, b0, b1, b2);
        targetContract(address(handler));
    }

    /// @dev Nợ ví của agent bằng tổng mọi túi của mọi khách.
    function invariant_liabilityEqualsBuckets() public view {
        uint256 sum;
        for (uint256 c; c < 3; ++c) {
            ILedger.Portion[] memory p = ledger.bucketsOf(agentId, handler.customer(c));
            for (uint256 i; i < p.length; ++i) {
                sum += p[i].amount;
            }
        }
        assertEq(ledger.walletLiability(agentId), sum);
    }

    /// @dev Dòng xu theo ngày ở cấp agent khớp nợ ví.
    function invariant_walletFlowsMatchLiability() public view {
        uint256[32] memory t = _sumDays(ledger.SCOPE_AGENT(), agentId);
        assertEq(
            t[M.WALLET_TOPUP] + t[M.WALLET_CREDIT] - t[M.WALLET_SPEND] - t[M.WALLET_TOPUP_REFUND],
            ledger.walletLiability(agentId)
        );
    }

    /// @dev Mọi chỉ số (trừ SERVED_HERE): tổng chi nhánh = agent = nền tảng.
    function invariant_branchSumsEqualAgent() public view {
        uint256[32] memory ag = _sumDays(ledger.SCOPE_AGENT(), agentId);
        uint256[32] memory pl = _sumDays(ledger.SCOPE_PLATFORM(), 0);
        uint256[32] memory br;
        for (uint256 i; i < 3; ++i) {
            uint256[32] memory t = _sumDays(ledger.SCOPE_BRANCH(), handler.branch(i));
            for (uint256 m; m < 32; ++m) {
                br[m] += t[m];
            }
        }
        for (uint256 m; m < 32; ++m) {
            assertEq(ag[m], pl[m], "agent != platform");
            if (m == M.SERVICE_BASE + M.SERVED_HERE || m == M.SERVICE_BASE + M.SERVICE_STRIDE + M.SERVED_HERE) {
                continue;
            }
            assertEq(br[m], ag[m], "branches != agent");
        }
    }

    /// @dev Số đã hoàn không vượt gốc.
    function invariant_refundNeverExceeds() public view {
        for (uint256 i; i < handler.refCount(); ++i) {
            ILedger.Entry memory e = ledger.entryOf(handler.refAt(i));
            assertLe(e.refunded, e.amount);
        }
    }

    /// @dev Tối đa 16 túi, không túi rỗng.
    function invariant_bucketsCapped() public view {
        for (uint256 c; c < 3; ++c) {
            ILedger.Portion[] memory p = ledger.bucketsOf(agentId, handler.customer(c));
            assertLe(p.length, ledger.MAX_BUCKETS());
            for (uint256 i; i < p.length; ++i) {
                assertGt(p[i].amount, 0);
            }
        }
    }

    /// @dev Cộng bộ đếm mọi ngày từ lúc bắt đầu tới nay (+ biên múi giờ), cắt khúc ≤ MAX_RANGE_DAYS.
    function _sumDays(uint8 scope, uint64 id) internal view returns (uint256[32] memory t) {
        uint32 from = ledger.dayOf(handler.branch(0), handler.startTs()) - 1;
        uint32 to = ledger.dayOf(handler.branch(0), block.timestamp) + 1;
        uint256 step = ledger.MAX_RANGE_DAYS();
        for (uint32 s = from; s <= to; s += uint32(step)) {
            uint32 e = s + uint32(step) - 1;
            if (e > to) e = to;
            uint256[32][] memory r = ledger.rollup(scope, id, s, e);
            for (uint256 d; d < r.length; ++d) {
                for (uint256 m; m < 32; ++m) {
                    t[m] += r[d][m];
                }
            }
        }
    }
}
