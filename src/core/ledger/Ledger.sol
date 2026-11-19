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
///         Task này: khung, poster, nạp ví, bộ đếm ngày ba cấp, ghi FullDB.
contract Ledger is PlatformAccessed, ILedger {
    uint8 public constant EVENT_VERSION = 1;
    uint256 public constant MAX_BUCKETS = 16;
    uint256 public constant MAX_RANGE_DAYS = 93;
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
        uint64 agentId = _newEntry($, ctx, EntryKind.Topup);
        if (amount == 0) revert ZeroAmount();
        if (customer == address(0)) revert ZeroAddress();
        uint256 mi = M.methodIndex(method); // CASH/TRANSFER/CARD, khác → InvalidMethod
        $.settings.requireMethod(ctx.branchId, method);

        _addBucket($, agentId, customer, ctx.branchId, amount);
        $.liability[agentId] += amount;

        uint32 d = _dayOfBranch($, ctx.branchId);
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

    /// @dev Kiểm poster + refId + chi nhánh/agent ghi được; đánh dấu refId đã dùng; trả agentId của chi nhánh.
    ///      `entries[refId].kind` được đặt tạm để chiếm refId; hàm ghi gán Entry đầy đủ sau.
    function _newEntry(LedgerStorage storage $, Ctx calldata ctx, EntryKind kind) private returns (uint64 agentId) {
        if ($.posters[msg.sender] & (uint8(1) << uint8(kind)) == 0) revert NotPoster(msg.sender, kind);
        if (ctx.refId == bytes32(0)) revert ZeroRefId();
        if ($.entries[ctx.refId].kind != EntryKind.None) revert RefIdUsed(ctx.refId);
        IBranchRegistry.Branch memory br = $.branches.getBranch(ctx.branchId);
        if (br.status != IBranchRegistry.BranchStatus.Active) revert BranchNotActive(ctx.branchId);
        $.agents.requireAgentWritable(br.agentId);
        $.entries[ctx.refId].kind = kind;
        return br.agentId;
    }

    function _dayOfBranch(LedgerStorage storage $, uint64 branchId) private view returns (uint32) {
        return M.day(block.timestamp, $.branches.getBranch(branchId).tzOffsetMinutes);
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
