# Review Task 3 — `packages/ui`

Người review: Claude Code · 2026-11-20 · Commit: `1b4bd02` (merge `d6bdb44`)
Kết luận: **Cần sửa trước Task 4** (3 điểm Quan trọng). Một commit `fix(ui): ...`, thêm mục "Sửa sau review" vào `task-3.md`.

Đã chạy lại: `pnpm install --frozen-lockfile && pnpm -r build && pnpm -r lint && pnpm -r test` → xanh (chain 32, ui 3).

## Làm tốt

- Đủ 17 thành phần theo kế hoạch, tách `lib/format.ts` để test; `formatVnd`/`formatBps` đúng giá trị kế hoạch, đã xử lý NBSP.
- `KpiTile` không ra NaN khi cả hai kỳ bằng 0; so sánh kỳ trước tính bằng `bigint`.
- `TxButton` dùng `useTx` của `chain` (không lặp logic), khoá nút khi đang ký.
- `DataTable` có đủ trạng thái tải, lỗi (nút thử lại), rỗng, phân trang.
- `AppShell` có banner pause và bộ chọn ngữ cảnh như thiết kế.

## Quan trọng (phải sửa)

### 1. Lý do đếm theo ký tự, contract đếm theo byte
`ConfirmDialog` kiểm `trimmed.length` 1–200 và `maxLength={200}`. Contract kiểm **200 byte UTF-8** (`Ledger.MAX_REASON_BYTES`, `AgentRegistry`/`BranchRegistry` `MAX_REASON`). Tiếng Việt có dấu chiếm 2–3 byte mỗi ký tự, nên lý do 200 ký tự có thể vượt 200 byte → giao dịch revert (`FieldTooLong` / `InvalidReason`) sau khi người dùng đã ký.

Sửa: thêm `utf8Length(text)` (`new TextEncoder().encode(text).length`) vào `lib/format.ts` (hoặc `chain`), kiểm 1–200 byte, bỏ `maxLength` theo ký tự, hiện bộ đếm "x/200 byte". Đặt lại ô lý do khi đóng hộp thoại.
Test: `utf8Length('Quận 1') == 8`; chuỗi 100 ký tự `'ệ'` (300 byte) bị coi là không hợp lệ; 200 ký tự `'a'` hợp lệ.

Áp dụng cùng hàm cho các trường văn bản có trần byte ở Task 4–8 (tên cửa hàng 100, địa chỉ 200, ghi chú 500, tên chi nhánh 100, vị trí 200 — đều tính byte).

### 2. Thiếu khoảng ngày "Tuỳ chọn"
Kế hoạch (Thiết kế, Tổng quan): bộ chọn khoảng gồm "Tuỳ chọn ≤ 366 ngày". `RangePicker` chỉ có 5 mốc cố định.

Sửa: `RangePicker` nhận và trả `RangeInput` (`RangePreset | { from: Date; to: Date }`), thêm nút "Tuỳ chọn" mở hai ô `input type="date"`. Chặn `from > to` và khoảng > 366 ngày (thông báo ngay dưới ô). Chuyển ngày chọn sang `Date` theo **lịch địa phương của múi giờ đang xem**, không theo múi giờ trình duyệt — dùng `calendarDay(Y, M, D)` của `chain` thay vì `new Date('YYYY-MM-DD')`.
Test: chọn 2026-01-01 → 2027-01-02 (367 ngày) bị chặn; 2026-11-01 → 2026-11-30 trả đúng `fromDay/toDay` = `calendarDay(2026,10,1)` / `calendarDay(2026,10,30)`.

### 3. Điện thoại không có menu
`AppShell` ẩn sidebar dưới `md` (`hidden md:flex`) mà không có menu thay thế → trên điện thoại không chuyển được trang. Chủ agent và Manager có thể dùng điện thoại.

Sửa: dưới `md`, hiện nút menu ở header mở danh sách menu (Radix `Dialog`/`Popover`, hoặc thanh cuộn ngang). Header phải xuống dòng gọn ở 360 px.

## Nhỏ (nên sửa)

4. `StatusBadge` hiển thị tiếng Anh (`Active`, `Suspended`, `Deleted`). Giao diện là tiếng Việt: **Hoạt động / Tạm dừng / Đã xoá**; vai trò: **Nhân viên / Quản lý / Chủ agent**. Thêm màu theo trạng thái (xanh / vàng / xám).
5. `RevenueChart` trục Y dùng `formatVnd` đầy đủ (vd `12.500.000 ₫`) → chữ dài, bị cắt ở `width={72}`. Dùng dạng gọn cho trục (`12,5 tr`, `1,2 tỷ`), tooltip giữ đầy đủ. Chế độ tối nên tự theo `prefers-color-scheme`/class `.dark` thay vì prop `dark`.
6. `KpiTile.compareText`: kỳ trước âm (doanh thu thuần âm do hoàn/điều chỉnh) cho phần trăm sai dấu. Khi `previous < 0` thì hiện chênh lệch tuyệt đối thay vì %.
7. `FinsdkProvider`: thiếu cờ `alive` khi unmount (bản cũ trong `web/` có). Thêm lại để tránh set state sau unmount.
8. `styles.css` chỉ có `.dark` theo class; thêm khối `@media (prefers-color-scheme: dark)` áp cùng biến khi trang không đặt class (hoặc ghi rõ app sẽ tự gắn class `dark`).

## Ghi chú cho Task 4/7

- Ở Task 4, nhớ điểm còn mở từ review Task 2: bắt lỗi thiếu khoá deployments, hiện màn lỗi thay vì sập app.
