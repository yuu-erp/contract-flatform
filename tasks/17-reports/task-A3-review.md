# Review Task A3 (+ quyết định SDK) — Tổng quan và Chi nhánh

Người review: Claude Code · 2026-11-23 · Commits: `bf4fed3`, `9dccff5`
Kết luận: **Đạt.** Làm tiếp A4. Các điểm dưới là Nhỏ — làm kèm A4.

Chạy lại trên container (tạm đổi SDK sang npm, không commit): build 4 gói xanh, lint xanh, test xanh (chain 59, ui 16, agent 6, platform 13); `pnpm --filter agent shots` 48 ảnh.

## Làm tốt
- SDK local giữ theo quyết định người dùng; `check-deps` cho phép riêng SDK.
- Chủ agent: lọc khoảng + dịch vụ + chip chi nhánh, KPI, biểu đồ chồng NET/IQR theo UTC+7 có chú giải, bảng so sánh chi nhánh (thuần, phục vụ tại chỗ), dư nợ ví khách.
- Manager: chỉ `SCOPE_BRANCH` (có test `overviewRollupTarget`); vào `/branches*` bị chuyển về `/` giữ `?domain`.
- `/branches`: bảng có trạng thái màu, chi nhánh chính, doanh thu thuần, nút "Mở link quản lý" (URL chuẩn hoá chữ thường).
- Xem trước ví đã chuyển vào thanh bên — đầu trang gọn.

## Nhỏ (làm kèm A4)
1. Chú giải biểu đồ: chữ đang tô màu của chuỗi và thứ tự IQR trước NET. Theo quy định biểu đồ: chữ dùng màu chữ thường, ô màu đứng cạnh; thứ tự **NET rồi IQR** (khớp thứ tự chồng); nhãn "NET" (bỏ "(thuần)" — đã nói ở tiêu đề/KPI).
2. Ô "Dư nợ ví khách" là số **hiện tại**, không theo khoảng ngày → ghi "Dư nợ ví khách (hiện tại)" để không lẫn với KPI theo khoảng.
3. Dữ liệu giả: agent 1 chỉ được cấp NET (`allowedServices = 1`), chi nhánh chỉ bật NET, nhưng bộ đếm vẫn có doanh thu IQR → biểu đồ có cột cam, gây nhầm khi review. Trong `mock-store`, chỉ sinh số IQR cho agent/chi nhánh có bit IQR.
4. Thiếu so sánh kỳ trước trên KPI chủ agent (app `platform` đã có) — thêm cho đồng nhất.
