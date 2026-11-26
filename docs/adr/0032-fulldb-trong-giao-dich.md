# 0032. Ghi lịch sử không làm rễ phụ thuộc FullDB

- Trạng thái: **Đề xuất** — chờ đội chain trả lời `docs/legacy/50-fulldb.md` mục 5
- Ngày: 2026-11-26
- Người duyệt: người dùng (ảnh hưởng vận hành)

## Bối cảnh

Mọi contract ghi lịch sử bằng `HistoryIndex.append`/`replace`, gọi precompile FullDB (`0x…0107`) **trong cùng giao dịch**. Nếu FullDB lỗi (precompile revert, hết dung lượng, node chưa bật FullDB), hiện **mọi** giao dịch có ghi lịch sử revert theo — kể cả nạp tiền, trừ tiền ở Ledger. Rễ (T0) và cành chính (T2) phụ thuộc vào một thành phần ngoài cây, trái Y1.

Hai câu chưa có câu trả lời từ đội chain (`docs/05` mục 5):
1. Ghi FullDB có bị huỷ theo khi giao dịch revert không?
2. FullDB có thể lỗi trong khi chain vẫn chạy không, và lỗi trả về thế nào?

## Đề xuất

Chia lịch sử làm hai loại:

| Loại | Ví dụ | Khi FullDB lỗi |
|---|---|---|
| **Bắt buộc** — trạng thái chỉ có ở FullDB, mất là sai nghiệp vụ | hồ sơ người dùng (`users`), cấu hình chỉ lưu ở FullDB | Revert (như hiện tại) |
| **Nhật ký** — trạng thái thật đã ở storage, FullDB chỉ là bản ghi để tra cứu | bút toán Ledger, audit, lịch sử phiên/đơn | Giao dịch **vẫn thành công**; phát `HistoryDeferred(version, kind, agentId, data)`; `reindex` theo lô ghi bù từ sự kiện |

- `HistoryIndex` thêm `tryAppend` (bắt lỗi precompile, phát `HistoryDeferred`). Bên gọi chọn `append` (bắt buộc) hay `tryAppend` (nhật ký).
- Sự kiện luôn được phát trước khi gọi FullDB, nên indexer sau này (T4) không phụ thuộc FullDB.
- Nếu đội chain xác nhận FullDB **không** huỷ theo khi revert: bên gọi phải ghi FullDB **sau cùng**, sau mọi kiểm tra, để không có bản ghi mồ côi.

## Phương án đã cân nhắc

| Phương án | Đánh giá |
|---|---|
| Giữ nguyên (mọi ghi đều bắt buộc) | Đơn giản, lịch sử không bao giờ thiếu; nhưng FullDB lỗi = cả hệ dừng |
| Bỏ FullDB khỏi giao dịch, chỉ phát event | Trái quyết định người dùng (lịch sử on-chain, ADR 0024); chưa có indexer |
| Đề xuất trên | Giữ lịch sử on-chain, rễ không chết theo FullDB; tốn thêm cơ chế bù |

## Hệ quả

- Sửa `HistoryIndex` (T0, cần người dùng duyệt) sau khi đội chain trả lời.
- Đặc tả mỗi module ghi rõ kind nào là "bắt buộc", kind nào là "nhật ký".
