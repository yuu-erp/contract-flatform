// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title ILedger
/// @notice Sổ cái tiền: ví xu của khách theo agent (túi theo chi nhánh), bút toán kép và bộ đếm ngày ba cấp.
///         Chỉ "poster" được ghi. Mỗi poster một giấy phép (ADR 0031): thuộc một module, được các loại bút toán nào,
///         trần số tiền mỗi bút toán. Bút toán bán hàng luôn ghi cho module của poster, không do bên gọi tự khai.
///         Đặc tả: docs/08-dong-tien-va-doanh-thu.md §4, §6.
interface ILedger {
    enum EntryKind {
        None,
        Topup,
        WalletSpend,
        DirectSale,
        TopupRefund,
        SaleRefund,
        Adjust
    }

    /// @notice Ngữ cảnh một lần ghi: refId chống trùng, chi nhánh ghi nhận, người thao tác, ca.
    struct Ctx {
        bytes32 refId;
        uint64 branchId;
        address actor;
        uint64 shiftId;
    }

    struct Entry {
        EntryKind kind;
        uint8 method;
        uint16 service;
        uint16 taxBps;
        uint64 branchId;
        address customer;
        uint128 amount;
        uint128 refunded;
    }

    /// @notice Giấy phép poster. `moduleId` 0 = thanh toán của nền tảng (chỉ Topup/TopupRefund);
    ///         khác 0 = module bán hàng (chỉ WalletSpend/DirectSale/SaleRefund/Adjust). `kindsMask` bit `1 << kind`.
    struct License {
        uint8 moduleId;
        uint8 kindsMask;
        uint128 maxAmount;
    }

    struct Portion {
        uint64 branchId;
        uint128 amount;
    }

    /// @notice Bản ghi FullDB của mỗi bút toán: `abi.encode(LedgerRecord)`. Chỉ nối thêm trường vào cuối.
    struct LedgerRecord {
        uint8 version;
        EntryKind kind;
        bytes32 refId;
        bytes32 originalRefId;
        uint64 agentId;
        uint64 branchId;
        address customer;
        uint16 service;
        uint8 method;
        uint128 amount;
        uint128 discount;
        uint128 tax;
        Portion[] portions;
        address actor;
        uint64 shiftId;
        string reason;
        uint64 timestamp;
    }

    function MAX_BUCKETS() external view returns (uint256);
    function MAX_RANGE_DAYS() external view returns (uint256);
    function SCOPE_PLATFORM() external view returns (uint8);
    function SCOPE_AGENT() external view returns (uint8);
    function SCOPE_BRANCH() external view returns (uint8);
    function KIND_LEDGER() external view returns (string memory);

    error ZeroAddress();
    error ZeroAmount();
    error ZeroRefId();
    error NotPoster(address caller, EntryKind kind);
    error RefIdUsed(bytes32 refId);
    error InvalidMethod(uint8 method);
    error TooManyBuckets(uint64 agentId, address customer);
    error InsufficientBalance(uint128 available, uint128 requested);
    error InvalidRange();
    error UnknownEntry(bytes32 refId);
    error RefundExceedsOriginal(uint128 remaining, uint128 requested);
    error WrongBranch(uint64 expected, uint64 actual);
    error AmountExceedsLimit(uint128 limit, uint128 amount);
    error WrongModule(uint16 expected, uint16 actual);
    error InvalidLicense();
    error InvalidReason();
    error BranchNotActive(uint64 branchId);

    event Posted(
        uint8 version,
        uint64 indexed agentId,
        uint64 indexed branchId,
        bytes32 indexed refId,
        EntryKind kind,
        address customer,
        uint16 service,
        uint8 method,
        uint128 amount,
        uint128 tax,
        address actor,
        uint64 shiftId
    );
    event PosterSet(uint8 version, address indexed poster, uint8 moduleId, uint8 kindsMask, uint128 maxAmount);

    /// @notice Cấp/thu giấy phép poster (ADR 0031). `kindsMask` 0 = thu hồi. Chỉ PLATFORM_OWNER.
    function setPoster(address poster, uint8 moduleId, uint8 kindsMask, uint128 maxAmount) external;
    function licenseOf(address poster) external view returns (License memory);

    /// @notice Nạp xu cho khách bằng tiền thật (CASH/TRANSFER/CARD) tại chi nhánh `ctx.branchId`.
    function topup(Ctx calldata ctx, address customer, uint8 method, uint128 amount) external;

    /// @notice Trừ ví cho module của poster tại chi nhánh phục vụ `ctx.branchId`: túi chi nhánh đó trước, rồi
    ///         các túi còn lại theo thứ tự nạp. Doanh thu ghi cho chi nhánh nạp, thuế theo chi nhánh phục vụ.
    function walletSpend(Ctx calldata ctx, address customer, uint128 amount, uint128 discount) external;

    /// @notice Bán trực tiếp bằng tiền thật (CASH/TRANSFER/CARD) tại `ctx.branchId`, không qua ví. `customer` có thể là 0.
    ///         Thuế tách từ `amount` theo thuế suất của chi nhánh/dịch vụ; `discount` chỉ để thống kê.
    function directSale(Ctx calldata ctx, address customer, uint8 method, uint128 amount, uint128 discount) external;

    /// @notice Điều chỉnh doanh thu của module của poster (tăng/giảm), kèm lý do 1–200 byte. Không đụng ví hay tiền thu.
    function adjust(Ctx calldata ctx, bool increase, uint128 amount, string calldata reason) external;

    /// @notice Hoàn tiền thật cho khách từ túi của họ tại `ctx.branchId` (CASH/TRANSFER/CARD); chặn bởi số dư túi đó.
    ///         `reason` bắt buộc, 1–200 byte (ghi vào FullDB).
    function refundTopup(Ctx calldata ctx, address customer, uint8 method, uint128 amount, string calldata reason)
        external;

    /// @notice Hoàn một bút toán WalletSpend (xu về túi chi nhánh nạp, từ phần cuối ngược lên) hoặc DirectSale
    ///         (tiền thật ra) của cùng module với poster. Chặn bởi gốc: `refunded + amount <= amount gốc`. Tính vào ngày hoàn. `reason` bắt buộc, 1–200 byte.
    function refundSale(Ctx calldata ctx, bytes32 originalRefId, uint128 amount, string calldata reason) external;

    function balanceOf(uint64 agentId, address customer) external view returns (uint128);
    function bucketsOf(uint64 agentId, address customer) external view returns (Portion[] memory);
    function walletLiability(uint64 agentId) external view returns (uint256);
    function entryOf(bytes32 refId) external view returns (Entry memory);
    function portionsOf(bytes32 refId) external view returns (Portion[] memory);
    function dayOf(uint64 branchId, uint256 timestamp) external view returns (uint32);
    /// @notice Bộ đếm từng ngày trong [fromDay, toDay], tối đa `MAX_RANGE_DAYS` ngày.
    function rollup(uint8 scope, uint64 id, uint32 fromDay, uint32 toDay) external view returns (uint256[32][] memory);
    /// @notice Bộ đếm doanh thu của một module từng ngày (offset GROSS..SERVED_HERE_REFUND), tối đa `MAX_RANGE_DAYS` ngày.
    function moduleRollup(uint8 scope, uint64 id, uint8 moduleId, uint32 fromDay, uint32 toDay)
        external
        view
        returns (uint256[9][] memory);
}
