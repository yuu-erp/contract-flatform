// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {
    IFullDB,
    PrefixEntry,
    RangeFilter,
    SearchParams,
    SearchResult,
    SearchResultsPage
} from "../../src/interfaces/IFullDB.sol";

/// @notice Giả lập precompile FullDB (0x…0107) đủ để test view lịch sử:
///         - term lưu dạng `prefix++value`; truy vấn `P:value` cách nhau bằng dấu cách, mọi mệnh đề phải khớp (AND);
///         - prefixMap ánh xạ key → prefix (không có trong map thì dùng chính key);
///         - lọc khoảng và sắp xếp theo value slot bằng so sánh chuỗi (vì vậy số phải đệm 0);
///         - phân trang offset/limit, `total` = tổng số khớp.
///         Núm test: `forceNextDocId` (giả lập F5 cấp docId trùng), `failWrites` (giả lập precompile lỗi).
///         Cài bằng `vm.etch(0x…0107, type(MockFullDB).runtimeCode)` nên không có constructor.
contract MockFullDB is IFullDB {
    struct Doc {
        bool exists;
        bytes data;
        string[] terms;
        mapping(uint256 => string) values;
        mapping(uint256 => bool) hasValue;
    }

    mapping(bytes32 => bool) public dbExists;
    mapping(bytes32 => uint256) public lastDocId;
    mapping(bytes32 => mapping(uint256 => Doc)) private _docs;

    uint256 public forceNextDocId;
    bool public failWrites;
    uint256 public writeCount;

    error MockNoDb(string name);
    error MockNoDoc(uint256 docId);
    error MockWriteFailed();

    // ─── Núm test ───────────────────────────────────────────────────────

    function setForceNextDocId(uint256 id) external {
        forceNextDocId = id;
    }

    function setFailWrites(bool v) external {
        failWrites = v;
    }

    function termsOf(string memory db, uint256 docId) external view returns (string[] memory) {
        return _docs[keccak256(bytes(db))][docId].terms;
    }

    function valueOf(string memory db, uint256 docId, uint256 slot) external view returns (string memory) {
        return _docs[keccak256(bytes(db))][docId].values[slot];
    }

    // ─── IFullDB ────────────────────────────────────────────────────────

    function getOrCreateDb(string memory name) external returns (bool) {
        _write();
        dbExists[keccak256(bytes(name))] = true;
        return true;
    }

    function newDocument(string memory dbname, bytes memory data) external returns (uint256 id) {
        _write();
        bytes32 k = _db(dbname);
        if (forceNextDocId != 0) {
            id = forceNextDocId;
            forceNextDocId = 0;
        } else {
            id = ++lastDocId[k];
        }
        Doc storage d = _docs[k][id];
        d.exists = true;
        d.data = data;
    }

    function getDataDocument(string memory dbname, uint256 docId) external view returns (bytes memory) {
        Doc storage d = _docs[_db(dbname)][docId];
        if (!d.exists) revert MockNoDoc(docId);
        return d.data;
    }

    function setDataDocument(string memory dbname, uint256 docId, bytes memory data) external returns (uint256) {
        _write();
        Doc storage d = _doc(dbname, docId);
        d.data = data;
        return docId;
    }

    function deleteDocument(string memory dbname, uint256 docId) external returns (bool) {
        _write();
        _doc(dbname, docId).exists = false;
        return true;
    }

    function addTermDocument(string memory dbname, uint256 docId, string memory term) external returns (uint256) {
        _write();
        _doc(dbname, docId).terms.push(term);
        return docId;
    }

    function indexTextForDocument(string memory dbname, uint256 docId, string memory, uint8, string memory)
        external
        returns (uint256)
    {
        _write();
        _doc(dbname, docId);
        return docId;
    }

    function addValueDocument(string memory dbname, uint256 docId, uint256 slot, string memory data, bool)
        external
        returns (uint256)
    {
        _write();
        Doc storage d = _doc(dbname, docId);
        d.values[slot] = data;
        d.hasValue[slot] = true;
        return docId;
    }

    function getValueDocument(string memory dbname, uint256 docId, uint256 slot, bool)
        external
        view
        returns (string memory)
    {
        return _docs[_db(dbname)][docId].values[slot];
    }

    function getTermsDocument(string memory dbname, uint256 docId) external view returns (string[] memory) {
        return _docs[_db(dbname)][docId].terms;
    }

    function commit(string memory) external pure returns (bool) {
        return true;
    }

    function querySearch(string memory dbname, SearchParams memory p)
        external
        view
        returns (SearchResultsPage memory page)
    {
        bytes32 k = keccak256(bytes(dbname));
        if (!dbExists[k]) return page; // DB chưa có → trang rỗng
        bytes32[] memory required = _parseQuery(p.queries, p.prefixMap);

        uint256 last = lastDocId[k];
        uint256[] memory hits = new uint256[](last);
        uint256 n;
        for (uint256 id = 1; id <= last; ++id) {
            Doc storage d = _docs[k][id];
            if (d.exists && _hasAll(d, required) && _inRanges(d, p.rangeFilters)) hits[n++] = id;
        }
        if (p.sortByValueSlot >= 0) _sort(k, hits, n, uint256(int256(p.sortByValueSlot)), p.sortAscending);

        page.total = n;
        uint256 start = p.offset > n ? n : p.offset;
        uint256 end = start + p.limit > n ? n : start + p.limit;
        page.results = new SearchResult[](end - start);
        for (uint256 i = start; i < end; ++i) {
            page.results[i - start] =
                SearchResult({docid: hits[i], rank: i, percent: 100, data: _docs[k][hits[i]].data});
        }
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _write() private {
        if (failWrites) revert MockWriteFailed();
        ++writeCount;
    }

    function _db(string memory name) private view returns (bytes32 k) {
        k = keccak256(bytes(name));
        if (!dbExists[k]) revert MockNoDb(name);
    }

    function _doc(string memory dbname, uint256 docId) private view returns (Doc storage d) {
        d = _docs[_db(dbname)][docId];
        if (!d.exists) revert MockNoDoc(docId);
    }

    /// @dev "P:v Q:w" → [hash("P"+"v"), hash(map(Q)+"w")].
    function _parseQuery(string memory q, PrefixEntry[] memory pm) private pure returns (bytes32[] memory out) {
        bytes memory b = bytes(q);
        uint256 count;
        for (uint256 k; k < b.length; ++k) {
            if (b[k] != " " && (k == 0 || b[k - 1] == " ")) ++count;
        }
        out = new bytes32[](count);
        uint256 idx;
        uint256 i;
        while (i < b.length) {
            while (i < b.length && b[i] == " ") ++i;
            if (i >= b.length) break;
            uint256 s = i;
            uint256 colon = type(uint256).max;
            while (i < b.length && b[i] != " ") {
                if (colon == type(uint256).max && b[i] == ":") colon = i;
                ++i;
            }
            if (colon == type(uint256).max) {
                out[idx++] = keccak256(_slice(b, s, i));
            } else {
                bytes memory key = _slice(b, s, colon);
                bytes memory prefix = key;
                for (uint256 j; j < pm.length; ++j) {
                    if (keccak256(bytes(pm[j].key)) == keccak256(key)) {
                        prefix = bytes(pm[j].value);
                        break;
                    }
                }
                out[idx++] = keccak256(bytes.concat(prefix, _slice(b, colon + 1, i)));
            }
        }
    }

    function _hasAll(Doc storage d, bytes32[] memory required) private view returns (bool) {
        for (uint256 r; r < required.length; ++r) {
            bool found;
            for (uint256 t; t < d.terms.length; ++t) {
                if (keccak256(bytes(d.terms[t])) == required[r]) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        return true;
    }

    function _inRanges(Doc storage d, RangeFilter[] memory rf) private view returns (bool) {
        for (uint256 i; i < rf.length; ++i) {
            if (!d.hasValue[rf[i].slot]) return false;
            bytes memory v = bytes(d.values[rf[i].slot]);
            if (_cmp(v, bytes(rf[i].startSerialised)) < 0 || _cmp(v, bytes(rf[i].endSerialised)) > 0) return false;
        }
        return true;
    }

    function _sort(bytes32 k, uint256[] memory ids, uint256 n, uint256 slot, bool asc) private view {
        for (uint256 i = 1; i < n; ++i) {
            uint256 key = ids[i];
            bytes memory kv = bytes(_docs[k][key].values[slot]);
            uint256 j = i;
            while (j > 0) {
                int256 c = _cmp(bytes(_docs[k][ids[j - 1]].values[slot]), kv);
                bool shouldMove = asc ? c > 0 : c < 0;
                if (!shouldMove) break;
                ids[j] = ids[j - 1];
                --j;
            }
            ids[j] = key;
        }
    }

    function _cmp(bytes memory a, bytes memory b) private pure returns (int256) {
        uint256 n = a.length < b.length ? a.length : b.length;
        for (uint256 i; i < n; ++i) {
            if (a[i] < b[i]) return -1;
            if (a[i] > b[i]) return 1;
        }
        if (a.length == b.length) return 0;
        return a.length < b.length ? int256(-1) : int256(1);
    }

    function _slice(bytes memory b, uint256 s, uint256 e) private pure returns (bytes memory out) {
        out = new bytes(e - s);
        for (uint256 i; i < out.length; ++i) {
            out[i] = b[s + i];
        }
    }
}
