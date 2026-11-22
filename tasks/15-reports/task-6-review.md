# Review Task 6 — Hệ thống và Nhật ký (app `platform`)

Người review: Claude Code · 2026-11-22 · Commit: `bbd3af9`
Kết luận: **Cần sửa** (3 điểm Quan trọng). Một commit `fix(platform): ...`, thêm "Sửa sau review" vào `task-6.md`.

Chạy lại trên container reviewer: build/lint/test → xanh (chain 33, ui 9, platform 18).

## Làm tốt

- `/system` đủ mục theo thiết kế: pause, admin, chuyển owner hai bước, nguồn vai trò, tra `canWrite`, đọc/đặt poster.
- Pending owner có nút "Nhận quyền owner" ở header.
- `AuditLogPanel` dùng chung cho `/audit` và tab Nhật ký của agent/chi nhánh; có lọc khoảng ngày theo slot 0.
- `ledgerKindsMaskFromBits` dùng đúng `1 << kind` (mask 0x7E cho đủ 6 loại), có test.

## Quan trọng (phải sửa)

### 1. Thao tác nhạy cảm chạy ngay, không xác nhận
`SystemPage.tsx`: "Gỡ" admin (dòng ~130), "Đề xuất owner" (~180), "setPoster" (~285), pause/unpause gửi giao dịch ngay khi bấm. Đặc biệt `setPoster` **cấp quyền ghi sổ tiền** cho một địa chỉ; mask 0 là **thu hồi toàn bộ**.

Sửa: mọi thao tác này qua `ConfirmDialog`, nội dung nêu rõ địa chỉ (đầy đủ, không rút gọn) và hậu quả:
- setPoster: liệt kê loại bút toán sẽ được ghi; mask 0 → "Thu hồi toàn bộ quyền ghi sổ của <địa chỉ>".
- Đề xuất owner: "Ví <địa chỉ> sẽ nhận toàn quyền nâng cấp và quản trị nền tảng sau khi chấp nhận".
- Gỡ admin, pause: một câu hậu quả.
Đặt các mục này trong một thẻ "Vùng nguy hiểm" riêng.

### 2. Giao dịch lỗi không hiện gì cho người dùng
Ngoài `CreateAgentDialog`, các `tx.run(...)` trong `SystemPage` (và phần lớn trang khác) không truyền `onError`, app cũng không có toast chung. Giao dịch revert hoặc người dùng huỷ ký → màn hình im lặng, nút trở lại như chưa có gì.

Sửa: thêm `Toaster` (thư viện `sonner`) ở gốc app; `useTx` (hoặc một `useAppTx` của app) mặc định toast "Đang chờ ký…", "Thành công", và lỗi đã giải mã bằng `decodeContractError`. Gỡ toast tự chế trong `CreateAgentDialog`. (Kế hoạch giao diện T16 sẽ làm đẹp toast; ở đây chỉ cần có.)

### 3. Lọc theo người làm không khớp khi dán địa chỉ có chữ hoa
`useAuditLog` đẩy `{ prefix: 'R', value: filter.actor }` nguyên văn. Nhãn trong FullDB là hex chữ thường (`FullDBCodec.toHex`). Dán địa chỉ dạng checksum (có chữ hoa) → không ra kết quả.

Sửa: dùng `termAddress('R', actor)` (đã chuẩn hoá chữ thường), kiểm địa chỉ hợp lệ trước khi lọc. Test hook/hàm dựng query: `0xAbC…` → giá trị `0xabc…`.

## Nhỏ

4. Lọc khoảng ngày chỉ áp khi có **cả hai** đầu; chỉ chọn "từ ngày" thì bộ lọc bị bỏ qua lặng lẽ. Cho phép một đầu (đầu kia mở) hoặc báo cần chọn đủ.
5. `formatAuditBytes` thử giải mã mọi `before/after` thành hồ sơ agent/chi nhánh; với thao tác `services`, `tax`, `timezone`… nên hiển thị theo `action` (ví dụ `agent_services` → giải mã `uint16` thành tên dịch vụ). Có thể làm ở T16.
