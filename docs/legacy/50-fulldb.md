# 50. FullDB — cơ chế, cách hệ cũ dùng, đánh giá cho hệ mới

Nguồn: mã meta-iqr `68d1d3c` và đo trên chain MVM (chain id 991) ngày 2026-11-18. Chỉ dùng lệnh đọc: `eth_call`, `eth_estimateGas` mô phỏng, không gửi giao dịch. Mã nguồn của precompile **không có** trong workspace: những gì nói về bên trong precompile là suy ra từ interface và hành vi đo được, đánh dấu *(suy luận)*. Đầu vào cho ADR 0024 (lịch sử) và 0026 (dữ liệu cá nhân).

## 1. FullDB là gì

FullDB là một **precompile** của chain MVM tại địa chỉ `0x…0107`. Nó không phải contract Solidity, mà là mã native trong node. Contract gọi nó như gọi một contract bình thường (`contracts/loyalty/PublicfullDB.sol:96-109` khai báo `IFullDBV1`).

Nó là **cơ sở dữ liệu tài liệu kèm chỉ mục tìm kiếm toàn văn**, nằm ngay trong chain. Nhìn interface thì giống hệt mô hình của thư viện tìm kiếm Xapian *(suy luận)*:

| Khái niệm | Hàm | Ý nghĩa |
|---|---|---|
| DB | `getOrCreateDb(name)` | Một "bảng" đặt tên bằng chuỗi. Hệ cũ dùng mỗi agent một DB, ví dụ `loyalty_transactions_v4_<agent>` |
| Document | `newDocument(db, bytes)` → `docId` | Một bản ghi, dữ liệu là `bytes` tuỳ ý (hệ cũ dùng `abi.encode(struct)` hoặc JSON) |
| | `getDataDocument`, `setDataDocument`, `deleteDocument` | Đọc, ghi đè, xoá theo `docId` |
| Term | `addTermDocument(db, docId, "W0xabc…")` | Nhãn để lọc chính xác. Tiền tố (`W` = ví, `B` = chi nhánh, `X` = loại giao dịch…) đóng vai trò cột |
| Full-text | `indexTextForDocument(db, docId, text, weight, prefix)` | Tách từ để tìm theo nội dung (ví dụ tên khách) |
| Value slot | `addValueDocument(db, docId, slot, value, isSerialise)` | Giá trị gắn vào bản ghi để sắp xếp và lọc khoảng (thời gian, số tiền) |
| Truy vấn | `querySearch(db, SearchParams)` → `{total, results[{docid, rank, percent, data}]}` | Chuỗi truy vấn, bảng tiền tố, stop word, `offset`/`limit` (**có phân trang**), sắp theo value slot, lọc khoảng |

Hình dung: mỗi DB là một bảng có chỉ mục. Term là cột lọc chính xác, value slot là cột để sắp xếp và lọc khoảng, `data` là toàn bộ bản ghi.

## 2. Đo được trên chain

| Phép đo | Kết quả |
|---|---|
| `eth_getCode(0x…0107)` | rỗng: đúng là precompile, không phải contract |
| `eth_call` gọi thẳng `0x…0107` từ ví ngoài | revert "Stack underflow on pop". **Phải gọi qua một contract**, nên hệ cũ cần lớp bọc `PublicfullDB` |
| `PublicfullDB.fullDB()` (proxy đang deploy) | `0x…0107` |
| Truy vấn qua `PublicfullDB.getPointHistoryByMember` | chạy được, trả trang rỗng cho ví không có dữ liệu |
| `getOrCreateDb` (mô phỏng) | ~112.000 gas cả giao dịch |
| `syncMember` (1 bản ghi + 5 term + 1 text + 3 value slot, mô phỏng) | **~191.000 gas** cả giao dịch. Một giao dịch chuyển tiền trơn tốn 100.000 gas, vậy phần ghi FullDB chỉ thêm khoảng 91.000 gas |
| So sánh | Lưu 11 trường của bản ghi đó vào storage contract tốn ≥ 220.000 gas, chưa kể chỉ mục. FullDB **rẻ hơn** và có sẵn tìm kiếm, phân trang |

## 3. Hệ cũ dùng FullDB ở đâu

| Nơi ghi | Dữ liệu | Nguồn |
|---|---|---|
| `LoyaltyFeature` → `PublicfullDB.syncMember` | nhật ký điểm: cộng/trừ xu A, xu B, hết hạn | `LoyaltyFeature.sol:1377`, `5306-5398` |
| `LoyaltyFeature` → `PublicfullDB.recordTxMeta` + `syncTransaction` | giao dịch Loyalty | `LoyaltyFeature.sol:4677-4700` |
| `Management.UploadCustomerInfo` | **hồ sơ khách: tên, ảnh, ngày sinh, giới tính, quốc tịch + vector khuôn mặt 128 chiều**, DB `CustomerDB` | `Management.sol:3296-3330` |
| `Management.SearchCustomerByVector` | tìm khách bằng khuôn mặt | `Management.sol:3333` |

Nơi đọc phía client: FE `apps/cyber/.../history-tracking/hooks/use-get-txs-by-branch.ts:52` (`getTxsByBranch`), cấu hình `launcher-lockscreen` (`publicFullDb`). Danh sách đầy đủ thuộc task 00-2.

Mọi lệnh ghi từ Loyalty bọc trong `try/catch` với trần gas 2M (`LoyaltyFeature.sol:4686`). Ghi FullDB lỗi thì giao dịch nghiệp vụ vẫn thành công, nhưng **lịch sử bị thiếu mà không ai biết**. Hệ cũ phải thêm `resyncTransactionToFullDB` và quét dự phòng `_scanTxsByBranchFromLoyalty` (`PublicfullDB.sol:919`) để vá chỗ này.

## 4. Lỗi nghiêm trọng của lớp bọc hiện tại

| # | Vấn đề | Nguồn | Hậu quả |
|---|---|---|---|
| F1 | `syncMember`, `syncTransaction` **không kiểm người gọi**: `agentReady` rỗng, `onlyAllowedCaller` bị comment. Mô phỏng từ địa chỉ lạ vẫn thành công | `PublicfullDB.sol:216-224`, `357`, `411` | Ai cũng ghi được lịch sử giả vào DB của bất kỳ agent nào |
| F2 | `newDocument`, `setDataDocument`, `deleteDocument`, `addValueDocument`… public, **không kiểm quyền**, nhận tên DB tuỳ ý | `PublicfullDB.sol:853-890` | Ai cũng sửa hoặc xoá được bản ghi trong mọi DB đi qua lớp bọc (lịch sử điểm, giao dịch, `CustomerDB`) |
| F3 | Dữ liệu sinh trắc học (vector khuôn mặt) và dữ liệu cá nhân lưu rõ, `UploadCustomerInfo` không kiểm người gọi | `Management.sol:3296` | Lộ PII vĩnh viễn, ai cũng đọc được. Rủi ro pháp lý (Nghị định 13/2023 về dữ liệu cá nhân) |
| F4 | Ghi FullDB lỗi bị nuốt (`try/catch {}`) | `LoyaltyFeature.sol:4677-4700`, `5306+` | Lịch sử thiếu mà không báo |
| F5 | `newDocument` có lúc trả `docId` đã dùng, hệ cũ phải thêm `TransactionSyncDocConflict` | `PublicfullDB.sol:446-452` | Nghi precompile cấp `docId` không ổn định, cần hỏi đội chain |

Đã ghi vào `documents/tech-debt.md` (`fulldb-no-access-control`).

## 5. Câu hỏi về precompile phải hỏi đội chain trước khi chốt

1. **Dữ liệu FullDB có nằm trong đồng thuận không?** Có vào state root, mọi node có cùng dữ liệu, có đồng bộ khi thêm node mới không? Nếu chỉ là chỉ mục cục bộ của từng node thì nó **không phải "on-chain" theo nghĩa bảo đảm**.
2. Khi giao dịch revert, các lệnh ghi FullDB trong giao dịch đó có bị huỷ theo không? "MVM tự commit" (`PublicfullDB.sol:402`) nghĩa là commit lúc nào?
3. `querySearch` có cho kết quả **tất định** giữa các node không (thứ tự, `rank`, `percent`)? Nếu không thì không được dùng kết quả của nó trong logic ghi.
4. Có phân quyền theo DB không, hay ai gọi qua contract cũng ghi được mọi DB?
5. Giới hạn: kích thước document, số DB, số term, chi phí gas chính thức.
6. Có xoá thật không, hay xoá vẫn còn trong lịch sử?
7. Precompile có trên mọi môi trường (devnet, testnet) không? Chạy local thì dùng `MockFullDB` (`contracts/test/MockFullDB.sol`), nhưng mock này không tìm kiếm được.

## 6. Đánh giá cho hệ mới

**Hợp với FullDB:** lịch sử và báo cáo (lớp D ở `docs/03-chuyen-du-lieu.md`). Đó là dữ liệu chỉ thêm, cần lọc theo ví, chi nhánh, thời gian, có phân trang. Ví dụ: nhật ký điểm, giao dịch nạp/tiêu, đơn đã xong, phiên đã đóng, chấm công. FullDB giải đúng bài "lịch sử on-chain, không có indexer" (câu 2 và 5 ở `docs/04-lo-trinh.md`), rẻ hơn storage, và bỏ được các mảng lịch sử không trần đang làm hệ cũ hết gas.

**Không hợp với FullDB:**
- Tiền, điểm, quyền, trạng thái đang sống (lớp A, B, C). Phải ở storage contract: ghi nguyên tử, tất định, kiểm được bằng invariant.
- Mọi quyết định trong hàm ghi không được dựa vào kết quả `querySearch`.
- Dữ liệu cá nhân dạng rõ.

**Đề xuất (chờ ADR 0024 sau khi có câu trả lời mục 5):**

1. Storage contract là **nguồn sự thật**. FullDB là **bản sao có chỉ mục** của lịch sử, mỗi bản ghi còn phát kèm event để dựng lại được.
2. Một contract `HistoryIndex` duy nhất làm cổng vào FullDB:
   - chỉ module đã đăng ký trong AccessManager mới ghi được, và chỉ vào DB của agent mình (sửa F1, F2);
   - không có hàm ghi/xoá public tuỳ ý;
   - schema bản ghi có version.
3. Ghi lịch sử **không nuốt lỗi âm thầm**. Hai cách: (a) ghi FullDB là một phần giao dịch, lỗi thì revert cả giao dịch; (b) nếu ghi lỗi thì phát event `HistoryIndexFailed` kèm job ghi bù. Chọn cách nào phụ thuộc câu hỏi 2 ở mục 5.
4. Dữ liệu cá nhân: không lưu rõ, kể cả trong FullDB. Lưu bản mã hoá (khoá do agent giữ) hoặc chỉ hash. Vector khuôn mặt **không đưa lên chain**. Đây là nội dung ADR 0026.
5. Migration: lịch sử cũ trong FullDB đọc qua lớp bọc cũ rồi chép sang DB mới (tên DB có version, ví dụ `mp1_<loại>_<agentId>`). Không ghi lại vào storage.
6. Test local cần một `MockFullDB` có tìm kiếm thật (lọc theo term, sắp theo value slot) để test được view lịch sử.
