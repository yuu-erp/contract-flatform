# T11 — core/history: HistoryIndex (cổng FullDB) + MockFullDB tìm kiếm được

Trạng thái: Xong (Claude tự triển khai, 2026-11-18)
Cỡ: M (GĐ2 sớm của `meta-platform`, đặc tả `docs/modules/core-operator.md`) · Loại: Tính năng
Ngày tạo: 2026-11-18

> **Đã làm theo kế hoạch, khác ở:** `search` nhận struct `Query` (tránh stack too deep, không bật `via_ir`); mỗi document tự có term `A<agentId>` (prefix `A` dành riêng) để truy vấn không rỗng; kiểm `docId` trùng (F5) bằng `docUsed`; prefix 1–8 chữ in hoa, value không có dấu cách/`:`/`"`. Mã: `src/core/history/HistoryIndex.sol`, `src/libraries/FullDBCodec.sol`, `test/utils/MockFullDB.sol`.

## Kế hoạch (Claude Code)

- **Mục tiêu:** Mọi ghi/đọc FullDB đi qua một contract `HistoryIndex` có kiểm quyền (sửa lỗ hổng F1/F2 của hệ cũ); có `MockFullDB` hành xử như precompile để test các view lịch sử.
- **Phạm vi:** `src/core/history/HistoryIndex.sol`, `src/interfaces/IFullDB.sol`, `src/interfaces/IHistoryIndex.sol`, `src/libraries/FullDBCodec.sol`, `test/utils/MockFullDB.sol`, `test/utils/BaseTest.sol` (thêm helper), `test/core/history/**`, `test/libraries/**`, layout.
- **Ngoài phạm vi:** schema bản ghi của từng module (module tự định nghĩa); job ghi bù; xử lý khi FullDB lỗi khác "revert cả giao dịch" (chờ đội chain, `docs/05` mục 5).

Quy ước chung cho task 10–13 (đặc tả gốc: `docs/modules/core-operator.md`):
- solc `0.8.28`, UUPS (`UUPSUpgradeable` OZ 5.6.1) + storage ERC-7201, namespace `metaplatform.core.<khối>`. Slot tính bằng `cast index-erc7201 <namespace>` và có test kiểm công thức (mẫu: `test/Scaffold.t.sol::test_storageAtErc7201Slot`).
- Không khai báo biến state thường. Mỗi contract thêm dòng `impl` vào `storage-layouts/contracts.txt`; mỗi struct storage thêm harness `test/layout/<Tên>Layout.sol` + dòng `harness`, chạy `python3 scripts/storage_layout.py snapshot`.
- Lỗi dùng custom error (không dùng chuỗi `require`). Event khai báo trong interface, tham số đầu `uint8 version` (= 1).
- Interface công khai đặt ở `src/interfaces/I<Tên>.sol`; contract `is I<Tên>`.
- NatSpec tiếng Anh ngắn cho mọi hàm external; chú thích nghiệp vụ tiếng Việt được.
- Test ở `test/core/<khối>/`, dùng `BaseTest`. Mỗi lỗi custom có ít nhất một test revert đúng lỗi (`vm.expectRevert(Err.selector)`).
- Không deploy, không gửi giao dịch lên chain thật.
- Xong mỗi task: `make ci` xanh, `forge snapshot` cập nhật `.gas-snapshot` (ghi số gas các hàm chính vào mục Triển khai).

### Tiêu chí nghiệm thu

- [ ] `IFullDB`: chép **nguyên** interface `IFullDBV1` và các struct `PrefixEntry`, `RangeFilter`, `SearchParams`, `SearchResult`, `SearchResultsPage` từ `meta-iqr/contracts/loyalty/PublicfullDB.sol:13-109` (cùng chữ ký để chạy được với precompile thật).
- [ ] `FullDBCodec` (library thuần): `term(prefix, value)` = `prefix ++ value` (không có `:`, theo `PublicfullDB.sol:1206-1210`); `queryTerm(prefix, value)` = `prefix ++ ":" ++ value`; `toPadded(uint256)` = chuỗi thập phân **đệm 0 đủ 20 ký tự** (để so khoảng đúng dù engine so chuỗi hay so số); `toHex(address)` chữ thường; fuzz test cho `toPadded` giữ thứ tự (`a < b ⇔ toPadded(a) < toPadded(b)` theo so chuỗi).
- [ ] `HistoryIndex` (UUPS, `CoreAccessed`, namespace `metaplatform.core.history`):
  - storage: `fullDB` (mặc định `0x0000000000000000000000000000000000000107`), `isWriter[address]`, `dbReady[bytes32]`.
  - `setFullDB(address)`, `setWriter(address, bool)` chỉ `PLATFORM_OWNER`.
  - `dbName(uint64 agentId, string kind)` pure: `agentId == 0` → `"mp1_<kind>"`, ngược lại `"mp1_<kind>_<agentId>"`; `kind` chỉ `[a-z0-9_]`, dài 1–32, sai thì revert `InvalidKind`.
  - `append(uint64 agentId, string kind, bytes data, Term[] terms, Value[] values) returns (uint256 docId)`: chỉ writer, `whenNotPaused`; `terms.length ≤ 8`, `values.length ≤ 4`; lần đầu với DB thì `getOrCreateDb` và đánh `dbReady`; `newDocument` → `addTermDocument` từng term (`FullDBCodec.term`) → `addValueDocument(slot, toPadded(value), false)`; phát `HistoryAppended(1, agentId, keccak256(kind), docId, keccak256(data))`. Lỗi từ FullDB **không bắt** (revert cả giao dịch).
  - `replace(uint64 agentId, string kind, uint256 docId, bytes data)`: chỉ writer; `setDataDocument`; phát `HistoryReplaced`.
  - view `get(agentId, kind, docId) returns (bytes)`; view `search(agentId, kind, Term[] filters, Range[] ranges, int64 sortSlot, bool ascending, uint64 offset, uint64 limit) returns (uint256 total, uint256[] docIds, bytes[] data)`: dựng `SearchParams` như `PublicfullDB` (query = các `queryTerm` nối bằng dấu cách, `prefixMap` mỗi prefix 2 cặp như `_pm2`), `limit ≤ 100` (lớn hơn revert `LimitTooLarge`), range dùng `toPadded`.
  - Không có hàm ghi/xoá nào khác (không `deleteDocument`).
- [ ] `MockFullDB` (`test/utils`, `is IFullDB`) hành xử thật: lưu document theo DB; term theo document; value slot; `querySearch` tách query theo dấu cách, mỗi phần `P:v` tra `prefixMap` thành term `P v` ghép, **AND** mọi term; lọc range so chuỗi trên slot; sắp theo `sortByValueSlot` (−1 = theo docId); `offset/limit`; `total` = số khớp trước phân trang; `getOrCreateDb` idempotent; docId tăng dần theo DB. `BaseTest.installMockFullDB()` deploy mock rồi `vm.etch(0x…0107, code)`.
- [ ] Test `MockFullDB` riêng (lọc 1 term, 2 term AND, range, sắp tăng/giảm, phân trang, DB khác nhau không lẫn).
- [ ] Test `HistoryIndex`: người không phải writer `append`/`replace` revert; `kind` sai revert; quá trần term/value/limit revert; dữ liệu ghi rồi `search` theo term + range + sort ra đúng; DB của agent 1 không lẫn agent 2; pause chặn ghi, không chặn đọc; event đúng.
- [ ] Layout + `make ci` xanh.

### Checkout

| Repo | Checkout | Nhánh | HEAD lúc bắt đầu | Thay đổi có sẵn |
|---|---|---|---|---|
| contract/meta-platform | `repos/contract/meta-platform` | `main` | ghi lại (lúc lập kế hoạch: chưa có commit) | ghi lại `git status --short` |

Không đọc/sửa `repos/contract/meta-iqr` hay `worktrees/meta-iqr-loyalty-v2` trong task này (chỉ được mở file meta-iqr được dẫn trong task để tham khảo).

### Hợp đồng thay đổi

Không có bên sử dụng ngoài repo (FE/qt-core chưa dùng hệ mới).

### Các bước

1. [ ] `IFullDB`, `FullDBCodec` + test library.
2. [ ] `MockFullDB` + test + helper `installMockFullDB`.
3. [ ] `IHistoryIndex`, `HistoryIndex` + test.
4. [ ] Layout, snapshot, `make ci`.

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
forge test --match-path 'test/core/history/**' -vv
forge test --match-path 'test/libraries/**' -vv
make ci
```

### Câu hỏi còn mở

- Phụ thuộc T10 (`CoreAccessed`). Làm sau T10; có thể song song với T12.
- (Không chặn task) Đội chain chưa trả lời 7 câu ở `docs/legacy/50-fulldb.md` mục 5. Task giả định ghi FullDB huỷ theo khi giao dịch revert; nếu sai sẽ có task sửa sau.

## Triển khai (Cursor)

- **Checkout/nhánh/HEAD đã kiểm:**
- **File đã sửa:**
- **Khác kế hoạch (và lý do):**
- **Lệnh đã chạy và kết quả:**
- **Gas (từ `.gas-snapshot`):**
- **Nợ kỹ thuật phát hiện** (đã ghi vào `documents/tech-debt.md`):
- **Còn vướng:**

## Review (Claude Code)

### Vòng 1

- **Phát hiện:**
- **Kết quả test chạy lại:**
- **Kết luận:**
