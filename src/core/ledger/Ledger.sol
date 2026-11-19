// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../access/PlatformAccessed.sol";
import {ILedger} from "../../interfaces/ILedger.sol";
import {ISalesSettings} from "../../interfaces/ISalesSettings.sol";
import {IAgentRegistry} from "../../interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";
import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";
import {LedgerMetrics as M} from "../../libraries/LedgerMetrics.sol";
import {FullDBCodec} from "../../libraries/FullDBCodec.sol";

/// @title Ledger
/// @notice Sổ cái tiền của nền tảng. Xem `ILedger` và docs/08-dong-tien-va-doanh-thu.md.
///         Ghi nạp ví, trừ ví, bán trực tiếp và điều chỉnh doanh thu; giữ túi ví theo chi nhánh, bộ đếm ngày ba cấp
///         (nền tảng, agent, chi nhánh) và ghi FullDB.
contract Ledger is PlatformAccessed, ILedger {
    uint8 public constant EVENT_VERSION = 1;
    uint256 public constant MAX_BUCKETS = 16;
    uint256 public constant MAX_RANGE_DAYS = 93;
    uint256 public constant MAX_REASON_BYTES = 200;
    /// @notice For EntryKind.Adjust the `method` field of Entry, LedgerRecord and Posted holds the direction
    ///         (ADJUST_UP / ADJUST_DOWN), not a payment method.
    uint8 public constant ADJUST_UP = 1;
    uint8 public constant ADJUST_DOWN = 2;
    uint8 public constant SCOPE_PLATFORM = 0;
    uint8 public constant SCOPE_AGENT = 1;
    uint8 public constant SCOPE_BRANCH = 2;
    string public constant KIND_LEDGER = "ledger";

    /// @custom:storage-location erc7201:metaplatform.core.ledger
    struct LedgerStorage {
        IAgentRegistry agents;
        IBranchRegistry branches;
        ISalesSettings settings;
        IHistoryIndex history;
        mapping(address => uint8) posters; // poster → mặt nạ bit (1 << kind)
        mapping(bytes32 => Entry) entries; // refId → bút toán
        mapping(bytes32 => Portion[]) portions; // refId → phần theo chi nhánh của bút toán
        mapping(uint64 => mapping(address => Portion[])) wallets; // agentId → khách → túi (thứ tự nạp lần đầu)
        mapping(uint64 => uint256) liability; // agentId → tổng xu đang nợ khách
        mapping(uint256 => uint256[32]) rollups; // scope<<128 | id<<64 | day → chỉ số
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.core.ledger")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant LEDGER_STORAGE_SLOT = 0x3ed6a96264aa526bb09288b806496956a36da0c560605117eeca5d5984060f00;

    function _s() private pure returns (LedgerStorage storage $) {
        assembly {
            $.slot := LEDGER_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address agents_, address branches_, address settings_, address history_)
        external
        initializer
    {
        __PlatformAccessed_init(access_);
        if (agents_ == address(0) || branches_ == address(0) || settings_ == address(0) || history_ == address(0)) {
            revert ZeroAddress();
        }
        LedgerStorage storage $ = _s();
        $.agents = IAgentRegistry(agents_);
        $.branches = IBranchRegistry(branches_);
        $.settings = ISalesSettings(settings_);
        $.history = IHistoryIndex(history_);
    }

    // ─── Quản trị poster ────────────────────────────────────────────────

    /// @notice Set which entry kinds a poster may write (bit `1 << uint8(kind)`). Platform owner only.
    function setPoster(address poster, uint8 kindsMask) external onlyPlatformOwner {
        if (poster == address(0)) revert ZeroAddress();
        _s().posters[poster] = kindsMask;
        emit PosterSet(EVENT_VERSION, poster, kindsMask);
    }

    function posterKinds(address poster) external view returns (uint8) {
        return _s().posters[poster];
    }

    // ─── Ghi ────────────────────────────────────────────────────────────

    /// @notice Credit a customer's wallet after real money (CASH/TRANSFER/CARD) was taken at `ctx.branchId`.
    ///         The amount lands in that branch's bucket; poster must hold the Topup kind.
    function topup(Ctx calldata ctx, address customer, uint8 method, uint128 amount) external whenNotPaused {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz) = _newEntry($, ctx, EntryKind.Topup);
        if (amount == 0) revert ZeroAmount();
        if (customer == address(0)) revert ZeroAddress();
        uint256 mi = _requireCashMethod($, ctx.branchId, method);

        _addBucket($, agentId, customer, ctx.branchId, amount);
        $.liability[agentId] += amount;

        uint32 d = M.day(block.timestamp, tz);
        _bump($, agentId, ctx.branchId, d, M.CASH_IN + mi, amount);
        _bump($, agentId, ctx.branchId, d, M.WALLET_TOPUP, amount);

        $.entries[ctx.refId] = Entry({
            kind: EntryKind.Topup,
            method: method,
            service: 0,
            taxBps: 0,
            branchId: ctx.branchId,
            customer: customer,
            amount: amount,
            refunded: 0
        });
        _record(
            $,
            agentId,
            d,
            LedgerRecord({
                version: EVENT_VERSION,
                kind: EntryKind.Topup,
                refId: ctx.refId,
                originalRefId: bytes32(0),
                agentId: agentId,
                branchId: ctx.branchId,
                customer: customer,
                service: 0,
                method: method,
                amount: amount,
                discount: 0,
                tax: 0,
                portions: new Portion[](0),
                actor: ctx.actor,
                shiftId: ctx.shiftId,
                reason: "",
                timestamp: uint64(block.timestamp)
            })
        );
    }

    /// @notice Spend wallet coins for a service at `ctx.branchId` (the serving branch B). Buckets are drained
    ///         B first, then in array order; revenue and tax are booked to each funding branch, tax uses B's rate.
    ///         `discount` is informational (already off the price, not part of GROSS). Poster needs WalletSpend.
    function walletSpend(Ctx calldata ctx, address customer, uint16 service, uint128 amount, uint128 discount)
        external
        whenNotPaused
    {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz) = _newEntry($, ctx, EntryKind.WalletSpend);
        if (amount == 0) revert ZeroAmount();
        if (customer == address(0)) revert ZeroAddress();
        M.serviceMetric(service, M.GROSS); // chỉ NET/IQR, khác → InvalidService
        $.branches.requireWritable(ctx.branchId, service);
        $.settings.requireMethod(ctx.branchId, M.WALLET);

        LedgerRecord memory r = LedgerRecord({
            version: EVENT_VERSION,
            kind: EntryKind.WalletSpend,
            refId: ctx.refId,
            originalRefId: bytes32(0),
            agentId: agentId,
            branchId: ctx.branchId,
            customer: customer,
            service: service,
            method: M.WALLET,
            amount: amount,
            discount: discount,
            tax: 0,
            portions: new Portion[](0),
            actor: ctx.actor,
            shiftId: ctx.shiftId,
            reason: "",
            timestamp: uint64(block.timestamp)
        });
        (uint16 bps, uint32 d) = _settle($, r, tz); // điền r.portions, r.tax

        Portion[] storage saved = $.portions[ctx.refId];
        for (uint256 i; i < r.portions.length; ++i) {
            saved.push(r.portions[i]);
        }
        $.entries[ctx.refId] = Entry({
            kind: EntryKind.WalletSpend,
            method: M.WALLET,
            service: service,
            taxBps: bps,
            branchId: ctx.branchId,
            customer: customer,
            amount: amount,
            refunded: 0
        });
        _record($, agentId, d, r);
    }

    /// @notice Direct sale with real money (CASH/TRANSFER/CARD) at `ctx.branchId`; no wallet involved.
    ///         Tax is carved out of `amount` at the branch/service rate; `discount` is informational.
    ///         `customer` may be zero. Poster needs the DirectSale kind.
    function directSale(
        Ctx calldata ctx,
        address customer,
        uint16 service,
        uint8 method,
        uint128 amount,
        uint128 discount
    ) external whenNotPaused {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz) = _newEntry($, ctx, EntryKind.DirectSale);
        if (amount == 0) revert ZeroAmount();
        M.serviceMetric(service, M.GROSS); // chỉ NET/IQR, khác → InvalidService
        $.branches.requireWritable(ctx.branchId, service);
        uint256 mi = _requireCashMethod($, ctx.branchId, method);

        LedgerRecord memory r = LedgerRecord({
            version: EVENT_VERSION,
            kind: EntryKind.DirectSale,
            refId: ctx.refId,
            originalRefId: bytes32(0),
            agentId: agentId,
            branchId: ctx.branchId,
            customer: customer,
            service: service,
            method: method,
            amount: amount,
            discount: discount,
            tax: 0,
            portions: new Portion[](0),
            actor: ctx.actor,
            shiftId: ctx.shiftId,
            reason: "",
            timestamp: uint64(block.timestamp)
        });
        uint16 bps = $.settings.taxOf(ctx.branchId, service);
        r.tax = uint128(uint256(amount) * bps / (10_000 + uint256(bps)));
        uint32 d = M.day(block.timestamp, tz);
        _bookSale($, r, mi, d);

        $.entries[ctx.refId] = Entry({
            kind: EntryKind.DirectSale,
            method: method,
            service: service,
            taxBps: bps,
            branchId: ctx.branchId,
            customer: customer,
            amount: amount,
            refunded: 0
        });
        _record($, agentId, d, r);
    }

    /// @notice Adjust a service's revenue counters up or down (never wallet, never cash), with a 1–200 byte reason.
    ///         Tax is not computed for adjustments. Poster needs the Adjust kind.
    function adjust(Ctx calldata ctx, uint16 service, bool increase, uint128 amount, string calldata reason)
        external
        whenNotPaused
    {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz) = _newEntry($, ctx, EntryKind.Adjust);
        if (amount == 0) revert ZeroAmount();
        if (bytes(reason).length == 0 || bytes(reason).length > MAX_REASON_BYTES) revert InvalidReason();
        uint8 dir = increase ? ADJUST_UP : ADJUST_DOWN;
        uint256 metric = M.serviceMetric(service, increase ? M.ADJ_UP : M.ADJ_DOWN);
        $.branches.requireWritable(ctx.branchId, service);

        LedgerRecord memory r = LedgerRecord({
            version: EVENT_VERSION,
            kind: EntryKind.Adjust,
            refId: ctx.refId,
            originalRefId: bytes32(0),
            agentId: agentId,
            branchId: ctx.branchId,
            customer: address(0),
            service: service,
            method: dir,
            amount: amount,
            discount: 0,
            tax: 0,
            portions: new Portion[](0),
            actor: ctx.actor,
            shiftId: ctx.shiftId,
            reason: reason,
            timestamp: uint64(block.timestamp)
        });
        uint32 d = M.day(block.timestamp, tz);
        _bump($, agentId, ctx.branchId, d, metric, amount);
        $.entries[ctx.refId] = Entry({
            kind: EntryKind.Adjust,
            method: dir,
            service: service,
            taxBps: 0,
            branchId: ctx.branchId,
            customer: address(0),
            amount: amount,
            refunded: 0
        });
        _record($, agentId, d, r);
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function balanceOf(uint64 agentId, address customer) external view returns (uint128 sum) {
        Portion[] storage list = _s().wallets[agentId][customer];
        for (uint256 i; i < list.length; ++i) {
            sum += list[i].amount;
        }
    }

    function bucketsOf(uint64 agentId, address customer) external view returns (Portion[] memory) {
        return _s().wallets[agentId][customer];
    }

    function walletLiability(uint64 agentId) external view returns (uint256) {
        return _s().liability[agentId];
    }

    function entryOf(bytes32 refId) external view returns (Entry memory) {
        return _s().entries[refId];
    }

    function portionsOf(bytes32 refId) external view returns (Portion[] memory) {
        return _s().portions[refId];
    }

    function dayOf(uint64 branchId, uint256 timestamp) external view returns (uint32) {
        return M.day(timestamp, _s().branches.getBranch(branchId).tzOffsetMinutes);
    }

    function rollup(uint8 scope, uint64 id, uint32 fromDay, uint32 toDay)
        external
        view
        returns (uint256[32][] memory out)
    {
        if (scope > SCOPE_BRANCH || fromDay > toDay || toDay - fromDay >= MAX_RANGE_DAYS) revert InvalidRange();
        LedgerStorage storage $ = _s();
        out = new uint256[32][](uint256(toDay) - fromDay + 1);
        for (uint256 i; i < out.length; ++i) {
            out[i] = $.rollups[_key(scope, id, fromDay + uint32(i))];
        }
    }

    // ─── Nội bộ dùng chung cho mọi hàm ghi ──────────────────────────────

    /// @dev Kiểm poster + refId + chi nhánh/agent ghi được; đánh dấu refId đã dùng; trả agentId và múi giờ của chi nhánh (đọc registry một lần).
    ///      `entries[refId].kind` được đặt tạm để chiếm refId; hàm ghi gán Entry đầy đủ sau.
    function _newEntry(LedgerStorage storage $, Ctx calldata ctx, EntryKind kind)
        private
        returns (uint64 agentId, int16 tz)
    {
        if ($.posters[msg.sender] & (uint8(1) << uint8(kind)) == 0) revert NotPoster(msg.sender, kind);
        if (ctx.refId == bytes32(0)) revert ZeroRefId();
        if ($.entries[ctx.refId].kind != EntryKind.None) revert RefIdUsed(ctx.refId);
        IBranchRegistry.Branch memory br = $.branches.getBranch(ctx.branchId);
        if (br.status != IBranchRegistry.BranchStatus.Active) revert BranchNotActive(ctx.branchId);
        $.agents.requireAgentWritable(br.agentId);
        $.entries[ctx.refId].kind = kind;
        return (br.agentId, br.tzOffsetMinutes);
    }

    /// @dev Phương thức tiền thật: CASH/TRANSFER/CARD (khác → InvalidMethod) và đang bật ở chi nhánh. Trả chỉ số phương thức.
    function _requireCashMethod(LedgerStorage storage $, uint64 branchId, uint8 method)
        private
        view
        returns (uint256 mi)
    {
        mi = M.methodIndex(method);
        $.settings.requireMethod(branchId, method);
    }

    /// @dev Bộ đếm bán trực tiếp ở ba phạm vi: tiền thu theo phương thức, GROSS, TAX, DISCOUNT (nếu có).
    function _bookSale(LedgerStorage storage $, LedgerRecord memory r, uint256 mi, uint32 d) private {
        _bump($, r.agentId, r.branchId, d, M.CASH_IN + mi, r.amount);
        _bump($, r.agentId, r.branchId, d, M.serviceMetric(r.service, M.GROSS), r.amount);
        _bump($, r.agentId, r.branchId, d, M.serviceMetric(r.service, M.TAX), r.tax);
        if (r.discount != 0) _bump($, r.agentId, r.branchId, d, M.serviceMetric(r.service, M.DISCOUNT), r.discount);
    }

    function _key(uint8 scope, uint64 id, uint32 d) private pure returns (uint256) {
        return (uint256(scope) << 128) | (uint256(id) << 64) | d;
    }

    /// @dev Cộng `amount` vào chỉ số `metric` ở cả ba phạm vi (nền tảng, agent, chi nhánh) của ngày `d`.
    function _bump(LedgerStorage storage $, uint64 agentId, uint64 branchId, uint32 d, uint256 metric, uint256 amount)
        private
    {
        $.rollups[_key(SCOPE_PLATFORM, 0, d)][metric] += amount;
        $.rollups[_key(SCOPE_AGENT, agentId, d)][metric] += amount;
        $.rollups[_key(SCOPE_BRANCH, branchId, d)][metric] += amount;
    }

    /// @dev Chỉ phạm vi chi nhánh (ví dụ SERVED_HERE: chi nhánh phục vụ khác chi nhánh thu tiền).
    function _bumpBranch(LedgerStorage storage $, uint64 branchId, uint32 d, uint256 metric, uint256 amount) private {
        $.rollups[_key(SCOPE_BRANCH, branchId, d)][metric] += amount;
    }

    /// @dev Cộng vào túi của chi nhánh; túi mới ở cuối, quá `MAX_BUCKETS` → revert.
    function _addBucket(LedgerStorage storage $, uint64 agentId, address customer, uint64 branchId, uint128 amount)
        private
    {
        Portion[] storage list = $.wallets[agentId][customer];
        uint256 n = list.length;
        for (uint256 i; i < n; ++i) {
            if (list[i].branchId == branchId) {
                list[i].amount += amount;
                return;
            }
        }
        if (n >= MAX_BUCKETS) revert TooManyBuckets(agentId, customer);
        list.push(Portion(branchId, amount));
    }

    /// @dev Trừ `amount` khỏi túi ở vị trí `i`; túi về 0 thì gỡ bằng dịch trái (giữ thứ tự nạp).
    ///      Người gọi phải kiểm `amount <= list[i].amount` trước (ở đây chỉ gọi sau khi đã kiểm tổng số dư).
    function _subBucket(Portion[] storage list, uint256 i, uint128 amount) private {
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

    /// @dev Kiểm số dư (không đổi gì nếu thiếu), trừ túi, ghi bộ đếm, giảm nợ ví; điền `r.portions` và `r.tax`.
    ///      Trả bps thuế của chi nhánh phục vụ và ngày của nó.
    function _settle(LedgerStorage storage $, LedgerRecord memory r, int16 tz) private returns (uint16 bps, uint32 d) {
        Portion[] storage list = $.wallets[r.agentId][r.customer];
        uint128 bal = _sum(list);
        if (bal < r.amount) revert InsufficientBalance(bal, r.amount);
        bps = $.settings.taxOf(r.branchId, r.service);
        r.portions = _drain(list, r.branchId, r.amount);
        d = M.day(block.timestamp, tz);
        r.tax = _bookSpend($, r, d, bps);
        $.liability[r.agentId] -= r.amount;
    }

    function _sum(Portion[] storage list) private view returns (uint128 sum) {
        for (uint256 i; i < list.length; ++i) {
            sum += list[i].amount;
        }
    }

    /// @dev Trừ `amount` (đã kiểm <= tổng số dư): túi của `servedBranch` trước, rồi theo thứ tự mảng.
    ///      Trả các phần theo đúng thứ tự trừ. Túi về 0 bị gỡ.
    function _drain(Portion[] storage list, uint64 servedBranch, uint128 amount)
        private
        returns (Portion[] memory parts)
    {
        parts = new Portion[](list.length);
        uint256 n;
        uint128 left = amount;
        for (uint256 i; i < list.length; ++i) {
            if (list[i].branchId != servedBranch) continue;
            uint128 take = list[i].amount < left ? list[i].amount : left;
            parts[n++] = Portion(servedBranch, take);
            left -= take;
            _subBucket(list, i, take);
            break;
        }
        while (left != 0) {
            uint128 have = list[0].amount;
            uint128 take = have < left ? have : left;
            parts[n++] = Portion(list[0].branchId, take);
            left -= take;
            _subBucket(list, 0, take);
        }
        assembly {
            mstore(parts, n)
        }
    }

    /// @dev Ghi bộ đếm cho từng phần của `r`: ngày của chi nhánh nạp A; SERVED_HERE chỉ ở phạm vi chi nhánh
    ///      phục vụ B (ngày của B). DISCOUNT một lần, ở phần đầu. Trả tổng thuế.
    function _bookSpend(LedgerStorage storage $, LedgerRecord memory r, uint32 servedDay, uint16 bps)
        private
        returns (uint128 tax)
    {
        for (uint256 i; i < r.portions.length; ++i) {
            uint64 from = r.portions[i].branchId;
            uint128 x = r.portions[i].amount;
            uint32 d = servedDay;
            if (from != r.branchId) d = M.day(block.timestamp, $.branches.getBranch(from).tzOffsetMinutes);
            uint128 t = uint128(uint256(x) * bps / (10_000 + uint256(bps)));
            tax += t;
            _bump($, r.agentId, from, d, M.WALLET_SPEND, x);
            _bump($, r.agentId, from, d, M.serviceMetric(r.service, M.GROSS), x);
            _bump($, r.agentId, from, d, M.serviceMetric(r.service, M.TAX), t);
            if (i == 0 && r.discount != 0) {
                _bump($, r.agentId, from, d, M.serviceMetric(r.service, M.DISCOUNT), r.discount);
            }
            if (from != r.branchId) {
                _bumpBranch($, r.branchId, servedDay, M.serviceMetric(r.service, M.SERVED_HERE), x);
            }
        }
    }

    /// @dev Ghi FullDB: terms B<branch>, K<kind>, S<actor>, W<customer>?, C<shift>?; values 0 = ts, 1 = amount, 2 = day.
    function _record(LedgerStorage storage $, uint64 agentId, uint32 d, LedgerRecord memory r) private {
        uint256 n = 3 + (r.customer != address(0) ? 1 : 0) + (r.shiftId != 0 ? 1 : 0);
        IHistoryIndex.Term[] memory terms = new IHistoryIndex.Term[](n);
        uint256 k;
        terms[k++] = IHistoryIndex.Term("B", FullDBCodec.toDecimal(r.branchId));
        terms[k++] = IHistoryIndex.Term("K", FullDBCodec.toDecimal(uint8(r.kind)));
        terms[k++] = IHistoryIndex.Term("S", FullDBCodec.toHex(r.actor));
        if (r.customer != address(0)) terms[k++] = IHistoryIndex.Term("W", FullDBCodec.toHex(r.customer));
        if (r.shiftId != 0) terms[k++] = IHistoryIndex.Term("C", FullDBCodec.toDecimal(r.shiftId));
        IHistoryIndex.Value[] memory values = new IHistoryIndex.Value[](3);
        values[0] = IHistoryIndex.Value(0, r.timestamp);
        values[1] = IHistoryIndex.Value(1, r.amount);
        values[2] = IHistoryIndex.Value(2, d);
        $.history.append(agentId, KIND_LEDGER, abi.encode(r), terms, values);
        _emitPosted(agentId, r);
    }

    function _emitPosted(uint64 agentId, LedgerRecord memory r) private {
        emit Posted(
            EVENT_VERSION,
            agentId,
            r.branchId,
            r.refId,
            r.kind,
            r.customer,
            r.service,
            r.method,
            r.amount,
            r.tax,
            r.actor,
            r.shiftId
        );
    }
}
