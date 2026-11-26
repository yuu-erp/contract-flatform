// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

// Chép nguyên chữ ký từ meta-iqr `contracts/loyalty/PublicfullDB.sol` (IFullDBV1) để khớp precompile MVM 0x…0107.
// Chỉ `kernel/history/HistoryIndex` được gọi interface này.

struct PrefixEntry {
    string key;
    string value;
}

struct RangeFilter {
    uint256 slot;
    string startSerialised;
    string endSerialised;
}

struct SearchParams {
    string queries;
    PrefixEntry[] prefixMap;
    string[] stopWords;
    uint64 offset;
    uint64 limit;
    int64 sortByValueSlot;
    bool sortAscending;
    RangeFilter[] rangeFilters;
}

struct SearchResult {
    uint256 docid;
    uint256 rank;
    int256 percent;
    bytes data;
}

struct SearchResultsPage {
    uint256 total;
    SearchResult[] results;
}

interface IFullDB {
    function getOrCreateDb(string memory name) external returns (bool);
    function newDocument(string memory dbname, bytes memory data) external returns (uint256);
    function getDataDocument(string memory dbname, uint256 docId) external view returns (bytes memory);
    function setDataDocument(string memory dbname, uint256 docId, bytes memory data) external returns (uint256);
    function deleteDocument(string memory dbname, uint256 docId) external returns (bool);
    function addTermDocument(string memory dbname, uint256 docId, string memory term) external returns (uint256);
    function indexTextForDocument(
        string memory dbname,
        uint256 docId,
        string memory text,
        uint8 weight,
        string memory prefix
    ) external returns (uint256);
    function addValueDocument(string memory dbname, uint256 docId, uint256 slot, string memory data, bool isSerialise)
        external
        returns (uint256);
    function getValueDocument(string memory dbname, uint256 docId, uint256 slot, bool isSerialise)
        external
        returns (string memory);
    function getTermsDocument(string memory dbname, uint256 docId) external returns (string[] memory);
    function querySearch(string memory dbname, SearchParams memory params)
        external
        view
        returns (SearchResultsPage memory);
    function commit(string memory dbname) external returns (bool);
}
