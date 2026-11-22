# Task A0 — Tách khối dashboard dùng chung

**Ngày:** 2026-11-23  
**Trạng thái:** Hoàn thành

## Làm gì

- Thêm `packages/ui/src/domain/` (lib, hooks, components): nhật ký (`AuditLogPanel`), bút toán (`LedgerEntriesPanel`, `ledger-display`), ví (`CustomerWalletPanel`, `wallet-buckets`), thuế/phương thức chỉ đọc (`SalesSettingsReadonly`), `chart-data`, `services-label`, `payment-methods`, tổng quan chi nhánh (`BranchOverviewPanel`), `OverviewFiltersBar`, `useAppTx`, `useAgentSalesRead`, hằng `SCOPE_*`.
- App `platform` import lại từ `@meta-platform/ui`; xoá bản trùng trong `apps/platform`.
- Test Vitest chuyển sang `packages/ui/test/` (ledger, wallet-buckets, audit).

## Kiểm tra

```text
# Trước: 4 file test domain → đỏ (thiếu module)
cd frontend && pnpm --filter @meta-platform/ui test   # 4 failed

# Sau:
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test   # xanh
```

## Ghi chú

- `apps/platform/shots` chưa chạy lại trong task này (giao diện platform không đổi hành vi).