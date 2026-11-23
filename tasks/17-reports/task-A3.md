# Task A3 — Tổng quan và Chi nhánh

**Trạng thái:** Hoàn thành  
**Ngày:** 2026-11-23

## Đã làm

- `/` chủ agent: KPI, biểu đồ NET/IQR (UTC+7, chú giải Legend), bảng so sánh chi nhánh (thuần + phục vụ tại chỗ), dư nợ ví, lọc chip chi nhánh.
- Manager: `BranchOverviewPanel` theo múi giờ chi nhánh (`useBranch`).
- `/branches`: bảng chi nhánh + doanh thu thuần khoảng chọn + **Mở link quản lý** (copy URL).
- `/branches/:branchId`: tab Tổng quan · Thông tin · Thành viên · Thuế · Giao dịch · Nhật ký (khối chung A0).

## Review A2 (kèm batch)

- SDK local trong 4 `package.json`; `check-deps` whitelist `@metanodejs/fiai-sdk`.
- `frontend/README.md` cập nhật.
- Màn không quyền có `domain`: nút **Đổi ví** + **Mở không kèm domain**.
- Xem trước ví → sidebar (`AgentPreviewNavUser`).

## Test

- `overview-scope.test.ts`, `branch-ranking.test.ts`.
- `pnpm -r build && pnpm lint && pnpm -r test && pnpm --filter agent shots` xanh.