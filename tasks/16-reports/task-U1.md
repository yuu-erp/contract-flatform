# Báo cáo Task U1 — Xem trước dữ liệu giả + chụp màn hình

## Đã làm

- `packages/chain`: `createMockContracts(seed)` + `buildMockState` — 12 agent (3 trạng thái, tên có dấu), 30 chi nhánh (múi giờ +420 / −300), 90 ngày rollup (có ngày 0 do kỳ lọc, hoàn + điều chỉnh), 60 bút toán (6 loại), 40 audit, 3 admin, 1 poster (`mask 0x7e`). Giao dịch giả chờ 800ms; địa chỉ `0xdead…` ném lỗi.
- App `platform`: `VITE_PREVIEW=mock` — bỏ `FinsdkProvider`, `PreviewBootstrap` + ví owner mặc định, menu đổi vai trò Owner/Admin/Pending/Không quyền.
- Script `pnpm --filter platform shots`: build mock, `vite preview`, Playwright chụp mọi route chính + tab agent/chi nhánh × (1440 sáng/tối, 390 sáng) → `frontend/apps/platform/shots/` (gitignore).

## Test

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
pnpm --filter platform shots
```

- chain: 39 tests (`create-mock-contracts.test.ts` mới).
- platform/ui: giữ xanh.
- shots: 51 ảnh PNG (ví dụ `overview--1440-light.png`, `agent-audit--390-light.png`).

## Chạy xem trước local

```bash
cd frontend/apps/platform
VITE_PREVIEW=mock pnpm dev
```

## Tham chiếu UI

Mẫu [shadcn dashboard-01](https://ui.shadcn.com/blocks) dùng cho Task U2–U5; U1 chỉ cần dữ liệu và ảnh chụp để review layout hiện tại.

## Sửa sau review (`task-U1-review.md`)

- `packages/ui/src/styles.css`: `@source "./";` sau `@import 'tailwindcss'` — Tailwind quét mã component dùng chung (biểu đồ `h-72`, thanh bên `md:flex`, …).
- `platform/package.json`: `@metanodejs/fiai-sdk` về `^2.1.1` (npm).
- `mock-store`: enum trạng thái 1/2/3; rollup chi nhánh chia theo tỉ lệ (tổng = agent trừ served-here); test bổ sung.
- `capture-shots.mjs`: `PW_CHROMIUM_PATH`, chờ `.recharts-surface` trên trang biểu đồ.