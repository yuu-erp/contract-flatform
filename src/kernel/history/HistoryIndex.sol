// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../access/PlatformAccessed.sol";
import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";
import {IFullDB, PrefixEntry, RangeFilter, SearchParams, SearchResultsPage} from "../../interfaces/IFullDB.sol";
import {FullDBCodec} from "../../libraries/FullDBCodec.sol";

/// @title HistoryIndex
/// @notice Cổng duy nhất vào precompile FullDB. Sửa F1/F2 của hệ cũ: chỉ writer do PLATFORM_OWNER đăng ký mới ghi,
///         và chỉ ghi được các kind đã cấp cho writer đó; không có hàm xoá, không có hàm ghi theo tên DB tuỳ ý.
///         Kiểm docId trùng (F5). Địa chỉ FullDB cố định từ `initialize`: đổi kho giữa chừng làm mọi `profileDocId`
///         và bộ nhớ đệm `dbReady`/`docUsed` sai, nên không có hàm đổi.
contract HistoryIndex is PlatformAccessed, IHistoryIndex {
    uint8 public constant EVENT_VERSION = 1;
    uint256 public constant MAX_TERMS = 8;
    uint256 public constant MAX_VALUES = 4;
    uint256 public constant MAX_LIMIT = 100;
    uint8 public constant MAX_SLOT = 15;
    string private constant AGENT_PREFIX = "A";
    address public constant DEFAULT_FULLDB = 0x0000000000000000000000000000000000000107;

    /// @custom:storage-location erc7201:metaplatform.core.history
    struct HistoryStorage {
        IFullDB fullDB;
        mapping(address => bool) writers;
        mapping(bytes32 => bool) dbReady; // keccak(dbName) → đã getOrCreateDb
        mapping(bytes32 => mapping(uint256 => bool)) docUsed; // keccak(dbName) → docId → đã cấp
        mapping(address => mapping(bytes32 => bool)) writerKinds; // writer → keccak(kind) → được ghi
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.core.history")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant HISTORY_STORAGE_SLOT = 0x46c3a659d96b048a4a45a4f5296c70bc5944f8ae8dee0297fbfe6d2910e01a00;

    function _h() private pure returns (HistoryStorage storage $) {
        assembly {
            $.slot := HISTORY_STORAGE_SLOT
        }
    }

    /// @dev Hàm thay cho modifier để không thêm biến lên stack của `append`.
    function _onlyWriterOf(string calldata kind) private view {
        HistoryStorage storage $ = _h();
        if (!$.writers[msg.sender]) revert NotWriter(msg.sender);
        if (!$.writerKinds[msg.sender][keccak256(bytes(kind))]) revert KindNotAllowed(msg.sender, kind);
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address fullDB_) external initializer {
        __PlatformAccessed_init(access_);
        address db = fullDB_ == address(0) ? DEFAULT_FULLDB : fullDB_;
        _h().fullDB = IFullDB(db);
        emit FullDBSet(EVENT_VERSION, db);
    }

    // ─── Cấu hình (PLATFORM_OWNER) ──────────────────────────────────────

    function fullDB() external view returns (address) {
        return address(_h().fullDB);
    }

    function setWriter(address writer, bool allowed) external onlyPlatformOwner {
        if (writer == address(0)) revert ZeroAddress();
        _h().writers[writer] = allowed;
        emit WriterSet(EVENT_VERSION, writer, allowed);
    }

    function isWriter(address account) external view returns (bool) {
        return _h().writers[account];
    }

    function setWriterKind(address writer, string calldata kind, bool allowed) external onlyPlatformOwner {
        if (writer == address(0)) revert ZeroAddress();
        _checkKind(kind);
        _h().writerKinds[writer][keccak256(bytes(kind))] = allowed;
        emit WriterKindSet(EVENT_VERSION, writer, keccak256(bytes(kind)), kind, allowed);
    }

    function canWrite(address writer, string calldata kind) external view returns (bool) {
        HistoryStorage storage $ = _h();
        return $.writers[writer] && $.writerKinds[writer][keccak256(bytes(kind))];
    }

    // ─── Ghi ────────────────────────────────────────────────────────────

    function dbName(uint64 agentId, string calldata kind) public pure returns (string memory) {
        _checkKind(kind);
        return
            agentId == 0
                ? string.concat("mp1_", kind)
                : string.concat("mp1_", kind, "_", FullDBCodec.toDecimal(agentId));
    }

    function append(
        uint64 agentId,
        string calldata kind,
        bytes calldata data,
        Term[] calldata terms,
        Value[] calldata values
    ) external returns (uint256 docId) {
        _onlyWriterOf(kind);
        if (terms.length > MAX_TERMS) revert TooManyTerms(MAX_TERMS);
        if (values.length > MAX_VALUES) revert TooManyValues(MAX_VALUES);

        string memory db = dbName(agentId, kind);
        docId = _newDoc(db, data);
        _index(db, docId, agentId, terms, values);

        emit HistoryAppended(EVENT_VERSION, agentId, keccak256(bytes(kind)), docId, keccak256(data));
    }

    function replace(uint64 agentId, string calldata kind, uint256 docId, bytes calldata data) external {
        _onlyWriterOf(kind);
        HistoryStorage storage $ = _h();
        string memory db = dbName(agentId, kind);
        if (!$.docUsed[keccak256(bytes(db))][docId]) revert UnknownDocument(docId);
        $.fullDB.setDataDocument(db, docId, data);
        emit HistoryReplaced(EVENT_VERSION, agentId, keccak256(bytes(kind)), docId, keccak256(data));
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function get(uint64 agentId, string calldata kind, uint256 docId) external view returns (bytes memory) {
        return _h().fullDB.getDataDocument(dbName(agentId, kind), docId);
    }

    function search(uint64 agentId, string calldata kind, Query calldata q) external view returns (Page memory page) {
        if (q.limit == 0 || q.limit > MAX_LIMIT) revert InvalidLimit(MAX_LIMIT);
        if (q.sortSlot < -1 || q.sortSlot > int64(uint64(MAX_SLOT))) revert InvalidSortSlot();
        SearchParams memory params = _params(agentId, q.filters, q.ranges);
        params.sortByValueSlot = q.sortSlot;
        params.sortAscending = q.ascending;
        params.offset = q.offset;
        params.limit = q.limit;
        SearchResultsPage memory res = _h().fullDB.querySearch(dbName(agentId, kind), params);

        uint256 n = res.results.length;
        page.total = res.total;
        page.docIds = new uint256[](n);
        page.data = new bytes[](n);
        for (uint256 i; i < n; ++i) {
            page.docIds[i] = res.results[i].docid;
            page.data[i] = res.results[i].data;
        }
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _newDoc(string memory db, bytes calldata data) private returns (uint256 docId) {
        HistoryStorage storage $ = _h();
        bytes32 dbKey = keccak256(bytes(db));
        if (!$.dbReady[dbKey]) {
            $.fullDB.getOrCreateDb(db);
            $.dbReady[dbKey] = true;
        }
        docId = $.fullDB.newDocument(db, data);
        if ($.docUsed[dbKey][docId]) revert DocIdConflict(docId);
        $.docUsed[dbKey][docId] = true;
    }

    function _index(string memory db, uint256 docId, uint64 agentId, Term[] calldata terms, Value[] calldata values)
        private
    {
        IFullDB f = _h().fullDB;
        f.addTermDocument(db, docId, FullDBCodec.term(AGENT_PREFIX, FullDBCodec.toDecimal(agentId)));
        for (uint256 i; i < terms.length; ++i) {
            if (_isReserved(terms[i].prefix)) revert ReservedPrefix();
            f.addTermDocument(db, docId, FullDBCodec.term(terms[i].prefix, terms[i].value));
        }
        for (uint256 i; i < values.length; ++i) {
            if (values[i].slot > MAX_SLOT) revert InvalidSortSlot();
            f.addValueDocument(db, docId, values[i].slot, FullDBCodec.toPadded(values[i].value), false);
        }
    }

    function _params(uint64 agentId, Term[] calldata filters, Range[] calldata ranges)
        private
        pure
        returns (SearchParams memory p)
    {
        if (filters.length > MAX_TERMS) revert TooManyTerms(MAX_TERMS);
        if (ranges.length > MAX_VALUES) revert TooManyValues(MAX_VALUES);

        string memory query = FullDBCodec.queryTerm(AGENT_PREFIX, FullDBCodec.toDecimal(agentId));
        PrefixEntry[] memory pm = new PrefixEntry[](1 + filters.length);
        pm[0] = PrefixEntry(AGENT_PREFIX, AGENT_PREFIX);
        for (uint256 i; i < filters.length; ++i) {
            if (_isReserved(filters[i].prefix)) revert ReservedPrefix();
            query = string.concat(query, " ", FullDBCodec.queryTerm(filters[i].prefix, filters[i].value));
            pm[i + 1] = PrefixEntry(filters[i].prefix, filters[i].prefix);
        }

        RangeFilter[] memory rf = new RangeFilter[](ranges.length);
        for (uint256 i; i < ranges.length; ++i) {
            if (ranges[i].slot > MAX_SLOT) revert InvalidSortSlot();
            rf[i] =
                RangeFilter(ranges[i].slot, FullDBCodec.toPadded(ranges[i].min), FullDBCodec.toPadded(ranges[i].max));
        }

        p.queries = query;
        p.prefixMap = pm;
        p.stopWords = new string[](0);
        p.rangeFilters = rf;
    }

    /// @dev kind: 1–32 ký tự a–z, 0–9, '_'.
    function _checkKind(string calldata kind) private pure {
        bytes calldata b = bytes(kind);
        if (b.length == 0 || b.length > 32) revert InvalidKind();
        for (uint256 i; i < b.length; ++i) {
            bytes1 c = b[i];
            bool ok = (c >= 0x61 && c <= 0x7A) || (c >= 0x30 && c <= 0x39) || c == 0x5F;
            if (!ok) revert InvalidKind();
        }
    }

    function _isReserved(string calldata prefix) private pure returns (bool) {
        return keccak256(bytes(prefix)) == keccak256(bytes(AGENT_PREFIX));
    }
}
