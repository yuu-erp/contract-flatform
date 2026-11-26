// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../../kernel/access/PlatformAccessed.sol";
import {ILedger} from "../../interfaces/ILedger.sol";
import {ISalesSettings} from "../../interfaces/ISalesSettings.sol";
import {IAgentRegistry} from "../../interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";
import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";
import {IRegistry} from "../../interfaces/IRegistry.sol";
import {LedgerMetrics as M} from "../../libraries/LedgerMetrics.sol";
import {LedgerRecorder} from "./LedgerRecorder.sol";
import {LedgerWallet} from "./LedgerWallet.sol";

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
        mapping(address => uint8) posters; // không dùng từ ADR 0031 (thay bằng `licenses`), giữ chỗ storage
        mapping(bytes32 => Entry) entries; // refId → bút toán
        mapping(bytes32 => Portion[]) portions; // refId → phần theo chi nhánh của bút toán
        mapping(uint64 => mapping(address => Portion[])) wallets; // agentId → khách → túi (thứ tự nạp lần đầu)
        mapping(uint64 => uint256) liability; // agentId → tổng xu đang nợ khách
        mapping(uint256 => uint256[32]) rollups; // scope<<128 | id<<64 | day → chỉ số chung (0..9)
        mapping(address => License) licenses; // poster → giấy phép (ADR 0031)
        mapping(uint256 => mapping(uint8 => uint256[9])) moduleRollups; // key ngày → moduleId → bộ đếm module
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

    /// @dev Bit loại bút toán nạp/hoàn nạp (chỉ của thanh toán nền tảng, moduleId 0).
    uint8 private constant TOPUP_KINDS =
        (uint8(1) << uint8(EntryKind.Topup)) | (uint8(1) << uint8(EntryKind.TopupRefund));
    uint8 private constant ALL_KINDS = 0x7E;
    /// @dev = Registry.FLAG_SALES.
    uint16 private constant FLAG_SALES = 2;

    /// @notice Grant/revoke a poster license (ADR 0031): module, entry kinds, per-entry cap. Platform owner only.
    ///         moduleId 0 = platform payments (Topup/TopupRefund only); otherwise a sales module (no Topup kinds).
    function setPoster(address poster, uint8 moduleId, uint8 kindsMask, uint128 maxAmount) external onlyPlatformOwner {
        if (poster == address(0)) revert ZeroAddress();
        if (kindsMask == 0) {
            delete _s().licenses[poster];
        } else {
            if (maxAmount == 0 || kindsMask & ~ALL_KINDS != 0) revert InvalidLicense();
            if (moduleId == 0) {
                if (kindsMask & ~TOPUP_KINDS != 0) revert InvalidLicense();
            } else {
                if (kindsMask & TOPUP_KINDS != 0) revert InvalidLicense();
                IRegistry.Module memory m = _registry().getModule(moduleId);
                if (
                    m.status == IRegistry.ModuleStatus.None || m.status == IRegistry.ModuleStatus.Retired
                        || m.flags & FLAG_SALES == 0
                ) revert InvalidLicense();
            }
            _s().licenses[poster] = License(moduleId, kindsMask, maxAmount);
        }
        emit PosterSet(EVENT_VERSION, poster, moduleId, kindsMask, maxAmount);
    }

    function licenseOf(address poster) external view returns (License memory) {
        return _s().licenses[poster];
    }

    // ─── Ghi ────────────────────────────────────────────────────────────

    /// @notice Credit a customer's wallet after real money (CASH/TRANSFER/CARD) was taken at `ctx.branchId`.
    ///         The amount lands in that branch's bucket; poster must hold the Topup kind.
    function topup(Ctx calldata ctx, address customer, uint8 method, uint128 amount) external whenNotPaused {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz,) = _newEntry($, ctx, EntryKind.Topup, amount);
        if (customer == address(0)) revert ZeroAddress();
        uint256 mi = _requireCashMethod($, ctx.branchId, method);

        LedgerWallet.add($.wallets[agentId][customer], agentId, customer, ctx.branchId, amount);
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
    function walletSpend(Ctx calldata ctx, address customer, uint128 amount, uint128 discount) external whenNotPaused {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz, uint16 service) = _newEntry($, ctx, EntryKind.WalletSpend, amount);
        if (customer == address(0)) revert ZeroAddress();
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
    function directSale(Ctx calldata ctx, address customer, uint8 method, uint128 amount, uint128 discount)
        external
        whenNotPaused
    {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz, uint16 service) = _newEntry($, ctx, EntryKind.DirectSale, amount);
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
    function adjust(Ctx calldata ctx, bool increase, uint128 amount, string calldata reason) external whenNotPaused {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz, uint16 service) = _newEntry($, ctx, EntryKind.Adjust, amount);
        _requireReason(reason);
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
            method: increase ? ADJUST_UP : ADJUST_DOWN,
            amount: amount,
            discount: 0,
            tax: 0,
            portions: new Portion[](0),
            actor: ctx.actor,
            shiftId: ctx.shiftId,
            reason: reason,
            timestamp: uint64(block.timestamp)
        });
        _bookAdjust($, r, M.day(block.timestamp, tz));
    }

    /// @dev Bộ đếm ADJ_UP/ADJ_DOWN của module, Entry và bản ghi FullDB của một bút toán điều chỉnh.
    function _bookAdjust(LedgerStorage storage $, LedgerRecord memory r, uint32 d) private {
        _bumpMod($, r.agentId, r.branchId, d, r.service, r.method == ADJUST_UP ? M.ADJ_UP : M.ADJ_DOWN, r.amount);
        $.entries[r.refId] = Entry({
            kind: EntryKind.Adjust,
            method: r.method,
            service: r.service,
            taxBps: 0,
            branchId: r.branchId,
            customer: address(0),
            amount: r.amount,
            refunded: 0
        });
        _record($, r.agentId, d, r);
    }

    /// @notice Return real money (CASH/TRANSFER/CARD) to a customer out of their bucket at `ctx.branchId`.
    ///         Capped by that bucket's balance. Poster needs the TopupRefund kind.
    function refundTopup(Ctx calldata ctx, address customer, uint8 method, uint128 amount, string calldata reason)
        external
        whenNotPaused
    {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz,) = _newEntry($, ctx, EntryKind.TopupRefund, amount);
        _requireReason(reason);
        uint256 mi = _requireCashMethod($, ctx.branchId, method);

        LedgerRecord memory r = LedgerRecord({
            version: EVENT_VERSION,
            kind: EntryKind.TopupRefund,
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
            reason: reason,
            timestamp: uint64(block.timestamp)
        });
        LedgerWallet.take($.wallets[agentId][customer], ctx.branchId, amount);
        $.liability[agentId] -= amount;

        uint32 d = M.day(block.timestamp, tz);
        _bump($, agentId, ctx.branchId, d, M.CASH_OUT + mi, amount);
        _bump($, agentId, ctx.branchId, d, M.WALLET_TOPUP_REFUND, amount);

        $.entries[ctx.refId] = Entry({
            kind: EntryKind.TopupRefund,
            method: method,
            service: 0,
            taxBps: 0,
            branchId: ctx.branchId,
            customer: customer,
            amount: amount,
            refunded: 0
        });
        _record($, agentId, d, r);
    }

    /// @notice Refund part or all of a WalletSpend (coins return to the funding branches' buckets, last portion
    ///         first) or a DirectSale (real money out). The amount is capped by the original (`refunded + amount
    ///         <= original amount`); tax refunded is derived from the original's rate. Counted on the refund day.
    ///         Must be posted at the original's branch. Poster needs the SaleRefund kind.
    function refundSale(Ctx calldata ctx, bytes32 originalRefId, uint128 amount, string calldata reason)
        external
        whenNotPaused
    {
        LedgerStorage storage $ = _s();
        (uint64 agentId, int16 tz, uint16 service) = _newEntry($, ctx, EntryKind.SaleRefund, amount);
        _requireReason(reason);
        Entry storage orig = $.entries[originalRefId];
        if (orig.kind != EntryKind.WalletSpend && orig.kind != EntryKind.DirectSale) {
            revert UnknownEntry(originalRefId);
        }
        if (orig.service != service) revert WrongModule(orig.service, service);
        if (orig.branchId != ctx.branchId) revert WrongBranch(orig.branchId, ctx.branchId);
        $.branches.requireWritable(ctx.branchId, orig.service);
        if (amount > orig.amount - orig.refunded) revert RefundExceedsOriginal(orig.amount - orig.refunded, amount);

        LedgerRecord memory r = _refundRecord(ctx, agentId, originalRefId, amount, reason);
        uint32 d = M.day(block.timestamp, tz);
        if (orig.kind == EntryKind.DirectSale) {
            r.tax = uint128(uint256(amount) * orig.taxBps / (10_000 + uint256(orig.taxBps)));
            _bump($, agentId, ctx.branchId, d, M.CASH_OUT + M.methodIndex(orig.method), amount);
            _bumpRefund($, agentId, ctx.branchId, d, orig.service, amount, r.tax);
        } else {
            _refundWallet($, r, orig, d);
        }
        orig.refunded += amount;

        $.entries[ctx.refId] = Entry({
            kind: EntryKind.SaleRefund,
            method: r.method,
            service: r.service,
            taxBps: orig.taxBps,
            branchId: ctx.branchId,
            customer: r.customer,
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
        if (scope == SCOPE_PLATFORM) id = 0;
        LedgerStorage storage $ = _s();
        out = new uint256[32][](uint256(toDay) - fromDay + 1);
        for (uint256 i; i < out.length; ++i) {
            out[i] = $.rollups[_key(scope, id, fromDay + uint32(i))];
        }
    }

    function moduleRollup(uint8 scope, uint64 id, uint8 moduleId, uint32 fromDay, uint32 toDay)
        external
        view
        returns (uint256[9][] memory out)
    {
        if (scope > SCOPE_BRANCH || fromDay > toDay || toDay - fromDay >= MAX_RANGE_DAYS) revert InvalidRange();
        if (scope == SCOPE_PLATFORM) id = 0;
        LedgerStorage storage $ = _s();
        out = new uint256[9][](uint256(toDay) - fromDay + 1);
        for (uint256 i; i < out.length; ++i) {
            out[i] = $.moduleRollups[_key(scope, id, fromDay + uint32(i))][moduleId];
        }
    }

    // ─── Nội bộ dùng chung cho mọi hàm ghi ──────────────────────────────

    /// @dev Kiểm giấy phép (loại bút toán, trần số tiền) + refId + chi nhánh/agent ghi được; đánh dấu refId đã dùng.
    ///      Trả agentId, múi giờ chi nhánh và bit dịch vụ của module poster (0 với thanh toán nền tảng).
    ///      Cầu dao module (ADR 0031) được kiểm ở `BranchRegistry.requireWritable(branch, service)` của từng hàm ghi.
    ///      `entries[refId].kind` được đặt tạm để chiếm refId; hàm ghi gán Entry đầy đủ sau.
    function _newEntry(LedgerStorage storage $, Ctx calldata ctx, EntryKind kind, uint128 amount)
        private
        returns (uint64 agentId, int16 tz, uint16 service)
    {
        License storage lic = $.licenses[msg.sender];
        if (lic.kindsMask & (uint8(1) << uint8(kind)) == 0) revert NotPoster(msg.sender, kind);
        if (amount == 0) revert ZeroAmount();
        if (amount > lic.maxAmount) revert AmountExceedsLimit(lic.maxAmount, amount);
        if (lic.moduleId != 0) service = uint16(1) << (lic.moduleId - 1);
        if (ctx.refId == bytes32(0)) revert ZeroRefId();
        if ($.entries[ctx.refId].kind != EntryKind.None) revert RefIdUsed(ctx.refId);
        IBranchRegistry.Branch memory br = $.branches.getBranch(ctx.branchId);
        if (br.status != IBranchRegistry.BranchStatus.Active) revert BranchNotActive(ctx.branchId);
        $.agents.requireAgentWritable(br.agentId);
        $.entries[ctx.refId].kind = kind;
        return (br.agentId, br.tzOffsetMinutes, service);
    }

    function _registry() private view returns (IRegistry) {
        return IRegistry(_s().branches.registry());
    }

    /// @dev Lý do bắt buộc 1–200 byte (adjust, refundTopup, refundSale).
    function _requireReason(string calldata reason) private pure {
        if (bytes(reason).length == 0 || bytes(reason).length > MAX_REASON_BYTES) revert InvalidReason();
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
        _bumpMod($, r.agentId, r.branchId, d, r.service, M.GROSS, r.amount);
        _bumpMod($, r.agentId, r.branchId, d, r.service, M.TAX, r.tax);
        if (r.discount != 0) _bumpMod($, r.agentId, r.branchId, d, r.service, M.DISCOUNT, r.discount);
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

    /// @dev Bộ đếm của module (theo bit dịch vụ `service`) ở cả ba phạm vi của ngày `d`.
    function _bumpMod(
        LedgerStorage storage $,
        uint64 agentId,
        uint64 branchId,
        uint32 d,
        uint16 service,
        uint256 offset,
        uint256 amount
    ) private {
        uint8 mid = _moduleId(service);
        $.moduleRollups[_key(SCOPE_PLATFORM, 0, d)][mid][offset] += amount;
        $.moduleRollups[_key(SCOPE_AGENT, agentId, d)][mid][offset] += amount;
        $.moduleRollups[_key(SCOPE_BRANCH, branchId, d)][mid][offset] += amount;
    }

    /// @dev Chỉ phạm vi chi nhánh (SERVED_HERE, SERVED_HERE_REFUND: chi nhánh phục vụ khác chi nhánh thu tiền).
    function _bumpModBranch(
        LedgerStorage storage $,
        uint64 branchId,
        uint32 d,
        uint16 service,
        uint256 offset,
        uint256 amount
    ) private {
        $.moduleRollups[_key(SCOPE_BRANCH, branchId, d)][_moduleId(service)][offset] += amount;
    }

    /// @dev Bit dịch vụ (đúng một bit) → moduleId = vị trí bit + 1.
    function _moduleId(uint16 bit) private pure returns (uint8 id) {
        id = 1;
        while (bit > 1) {
            bit >>= 1;
            ++id;
        }
    }

    /// @dev Bản ghi nền của một bút toán hoàn bán, sao từ gốc; `tax`/`portions` do người gọi điền.
    function _refundRecord(
        Ctx calldata ctx,
        uint64 agentId,
        bytes32 originalRefId,
        uint128 amount,
        string calldata reason
    ) private view returns (LedgerRecord memory r) {
        Entry storage orig = _s().entries[originalRefId];
        r = LedgerRecord({
            version: EVENT_VERSION,
            kind: EntryKind.SaleRefund,
            refId: ctx.refId,
            originalRefId: originalRefId,
            agentId: agentId,
            branchId: ctx.branchId,
            customer: orig.customer,
            service: orig.service,
            method: orig.method,
            amount: amount,
            discount: 0,
            tax: 0,
            portions: new Portion[](0),
            actor: ctx.actor,
            shiftId: ctx.shiftId,
            reason: reason,
            timestamp: uint64(block.timestamp)
        });
    }

    /// @dev REFUND và TAX_REFUND của dịch vụ ở ba phạm vi.
    function _bumpRefund(
        LedgerStorage storage $,
        uint64 agentId,
        uint64 branchId,
        uint32 d,
        uint16 service,
        uint128 amount,
        uint128 tax
    ) private {
        _bumpMod($, agentId, branchId, d, service, M.REFUND, amount);
        _bumpMod($, agentId, branchId, d, service, M.TAX_REFUND, tax);
    }

    /// @dev Hoàn WalletSpend: duyệt phần của bút toán gốc từ cuối lên, bỏ qua phần đã hoàn (`orig.refunded`),
    ///      trả xu về túi chi nhánh nạp, ghi bộ đếm theo ngày hôm nay của chi nhánh đó. Điền `r.portions`, `r.tax`.
    ///      Số tiền đã được kiểm `<= orig.amount - orig.refunded` nên luôn đặt đủ.
    function _refundWallet(LedgerStorage storage $, LedgerRecord memory r, Entry storage orig, uint32 refundDay)
        private
    {
        Portion[] storage ps = $.portions[r.originalRefId];
        Portion[] memory parts = new Portion[](ps.length);
        uint256 n;
        uint128 skip = orig.refunded;
        uint128 left = r.amount;
        for (uint256 i = ps.length; i != 0 && left != 0; --i) {
            uint128 avail = ps[i - 1].amount;
            if (skip >= avail) {
                skip -= avail;
                continue;
            }
            avail -= skip;
            skip = 0;
            uint128 x = avail < left ? avail : left;
            left -= x;
            r.tax += _creditPart($, r, ps[i - 1].branchId, x, orig.taxBps, refundDay);
            parts[n++] = Portion(ps[i - 1].branchId, x);
        }
        assembly {
            mstore(parts, n)
        }
        r.portions = parts;
        $.liability[r.agentId] += r.amount;
    }

    /// @dev Trả `x` xu về túi chi nhánh nạp `from`, ghi WALLET_CREDIT/REFUND/TAX_REFUND theo ngày hôm nay của `from`.
    ///      Phần chéo chi nhánh (`from` != chi nhánh phục vụ) cộng SERVED_HERE_REFUND ở chi nhánh phục vụ, ngày hoàn.
    ///      Trả thuế của phần này.
    function _creditPart(
        LedgerStorage storage $,
        LedgerRecord memory r,
        uint64 from,
        uint128 x,
        uint16 bps,
        uint32 refundDay
    ) private returns (uint128 t) {
        LedgerWallet.add($.wallets[r.agentId][r.customer], r.agentId, r.customer, from, x);
        uint32 d = M.day(block.timestamp, $.branches.getBranch(from).tzOffsetMinutes);
        t = uint128(uint256(x) * bps / (10_000 + uint256(bps)));
        _bump($, r.agentId, from, d, M.WALLET_CREDIT, x);
        _bumpRefund($, r.agentId, from, d, r.service, x, t);
        if (from != r.branchId) _bumpModBranch($, r.branchId, refundDay, r.service, M.SERVED_HERE_REFUND, x);
    }

    /// @dev Kiểm số dư (không đổi gì nếu thiếu), trừ túi, ghi bộ đếm, giảm nợ ví; điền `r.portions` và `r.tax`.
    ///      Trả bps thuế của chi nhánh phục vụ và ngày của nó.
    function _settle(LedgerStorage storage $, LedgerRecord memory r, int16 tz) private returns (uint16 bps, uint32 d) {
        Portion[] storage list = $.wallets[r.agentId][r.customer];
        uint128 bal = LedgerWallet.sum(list);
        if (bal < r.amount) revert InsufficientBalance(bal, r.amount);
        bps = $.settings.taxOf(r.branchId, r.service);
        r.portions = LedgerWallet.drain(list, r.branchId, r.amount);
        d = M.day(block.timestamp, tz);
        r.tax = _bookSpend($, r, d, bps);
        $.liability[r.agentId] -= r.amount;
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
            _bumpMod($, r.agentId, from, d, r.service, M.GROSS, x);
            _bumpMod($, r.agentId, from, d, r.service, M.TAX, t);
            if (i == 0 && r.discount != 0) _bumpMod($, r.agentId, from, d, r.service, M.DISCOUNT, r.discount);
            if (from != r.branchId) _bumpModBranch($, r.branchId, servedDay, r.service, M.SERVED_HERE, x);
        }
    }

    /// @dev Ghi FullDB + phát `Posted` qua library liên kết ngoài (DELEGATECALL, giữ msg.sender = Ledger) để giảm kích thước.
    function _record(LedgerStorage storage $, uint64 agentId, uint32 d, LedgerRecord memory r) private {
        LedgerRecorder.record($.history, agentId, d, r);
    }
}
