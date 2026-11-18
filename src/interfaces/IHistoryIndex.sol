// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IHistoryIndex
/// @notice Cổng duy nhất ghi/đọc FullDB (docs/05-luu-tru-du-lieu.md). Chỉ contract được đăng ký writer mới ghi.
///         DB: agentId = 0 → "mp1_<kind>" (dữ liệu nền tảng), agentId > 0 → "mp1_<kind>_<agentId>".
///         Mỗi document tự có thêm term `A<agentId>` (prefix "A" dành riêng) để truy vấn không bao giờ rỗng.
///         Các filter khác prefix kết hợp AND; không truyền hai filter cùng prefix.
///         Ghi FullDB lỗi thì revert cả giao dịch (không nuốt lỗi như hệ cũ, F4).
interface IHistoryIndex {
    /// @notice Nhãn lọc chính xác: lưu thành `prefix ++ value` (ví dụ "G12").
    struct Term {
        string prefix;
        string value;
    }

    /// @notice Giá trị số gắn vào bản ghi để sắp xếp và lọc khoảng (lưu dạng thập phân đệm 0, 20 ký tự).
    struct Value {
        uint8 slot;
        uint256 value;
    }

    /// @notice Lọc khoảng [min, max] trên một slot.
    struct Range {
        uint8 slot;
        uint256 min;
        uint256 max;
    }

    /// @notice Truy vấn: filters kết hợp AND (khác prefix), ranges lọc khoảng, sortSlot = -1 là thứ tự engine.
    struct Query {
        Term[] filters;
        Range[] ranges;
        int64 sortSlot;
        bool ascending;
        uint64 offset;
        uint64 limit; // 1..MAX_LIMIT
    }

    struct Page {
        uint256 total;
        uint256[] docIds;
        bytes[] data;
    }

    error ZeroAddress();
    error NotWriter(address caller);
    error InvalidKind();
    error TooManyTerms(uint256 max);
    error TooManyValues(uint256 max);
    error InvalidLimit(uint256 max);
    error ReservedPrefix();
    error DocIdConflict(uint256 docId);
    error UnknownDocument(uint256 docId);
    error InvalidSortSlot();

    event FullDBSet(uint8 version, address indexed fullDB);
    event WriterSet(uint8 version, address indexed writer, bool allowed);
    event HistoryAppended(
        uint8 version, uint64 indexed agentId, bytes32 indexed kindHash, uint256 docId, bytes32 dataHash
    );
    event HistoryReplaced(
        uint8 version, uint64 indexed agentId, bytes32 indexed kindHash, uint256 docId, bytes32 dataHash
    );

    function MAX_TERMS() external view returns (uint256);
    function MAX_VALUES() external view returns (uint256);
    function MAX_LIMIT() external view returns (uint256);

    function fullDB() external view returns (address);
    function setFullDB(address fullDB_) external;
    function setWriter(address writer, bool allowed) external;
    function isWriter(address account) external view returns (bool);

    function dbName(uint64 agentId, string calldata kind) external pure returns (string memory);

    function append(
        uint64 agentId,
        string calldata kind,
        bytes calldata data,
        Term[] calldata terms,
        Value[] calldata values
    ) external returns (uint256 docId);

    function replace(uint64 agentId, string calldata kind, uint256 docId, bytes calldata data) external;

    function get(uint64 agentId, string calldata kind, uint256 docId) external view returns (bytes memory);

    function search(uint64 agentId, string calldata kind, Query calldata q) external view returns (Page memory);
}
