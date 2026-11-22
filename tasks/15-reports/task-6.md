# Báo cáo Task 6 — Hệ thống và nhật ký

## Đã làm

- `/system` (chỉ owner, redirect Admin đã có ở `PlatformChrome`): tái dùng pause/unpause từ `SystemPage` (`867643e`); thêm/gỡ platform admin, đề xuất owner hai bước, đọc `agentRoleSources`, tra `history.canWrite`, đọc/`setPoster` Ledger.
- Header: pending owner vào dashboard + nút **Nhận quyền owner** (`acceptOwnership`) trên `PlatformRoleStrip`.
- `/audit` toàn hệ + tab Nhật ký agent/chi nhánh dùng chung `AuditLogPanel` (lọc agent/cn/hành động/ví/khoảng ngày, dialog trước/sau qua `formatAuditBytes`).
- `packages/chain`: API `PlatformAccess` (admin/owner/poster), `useAuditLog` lọc `fromTs`/`toTs`; helper `mapAddressList`.
- Test Vitest: `audit-display`, `ledger-poster`.

## TDD — output lúc đỏ

```
Cannot find module '../src/lib/audit-display'
Cannot find module '../src/lib/ledger-poster'
```

## Lệnh kiểm tra

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
```

```
packages/chain: 33 passed
packages/ui: 9 passed
platform: 18 passed
```

## Màn hình

| Route | Nội dung |
|---|---|
| `/system` | Pause, admins, transfer owner, role sources, canWrite, Ledger poster |
| `/audit` | Nhật ký toàn hệ, lọc + chi tiết |
| Agent/branch tab Nhật ký | Cùng panel, khóa filter agent/cn |

## Ghi chú

- Admin vẫn không vào `/system` (Navigate `/`).
- Giải mã before/after: thử profile agent/chi nhánh; còn lại hex rút gọn.

## Sửa sau review (`task-6-review.md`)

- `SystemPage`: thẻ **Vùng nguy hiểm** + `ConfirmDialog` cho pause/unpause, gỡ admin, đề xuất owner, `setPoster` (địa chỉ đầy đủ, mô tả mask/loại bút toán).
- `sonner` + `Toaster` ở `main.tsx`; `useAppTx` toast chờ ký / thành công / lỗi `decodeContractError`; bỏ toast tự chế `CreateAgentDialog`.
- `buildAuditSearchQuery` + `termAddress('R', …)`; test `audit-search.test.ts`; lọc ngày một đầu (`audit-date-range`, `AUDIT_TS_MAX`).