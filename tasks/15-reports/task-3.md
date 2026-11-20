# Báo cáo Task 3 — `packages/ui`

## Đã làm

- Package `@meta-platform/ui`: `formatVnd` / `formatBps`, 17 component theo kế hoạch, `FinsdkProvider`, `styles.css` (Tailwind 4 `@theme`).
- Phụ thuộc workspace `@meta-platform/chain` (`useTx`, `formatWalletAddress`, `RangePreset`).
- Type stub `@metanodejs/fiai-sdk` để build không cần path local (app gắn peer thật lúc chạy).

## TDD — output lúc đỏ

```
Error: Cannot find module '../src/lib/format'
 FAIL  test/format.test.ts
 FAIL  test/kpi-tile.test.tsx
(sh: vitest: command not found trước khi pnpm install)
```

## Lệnh kiểm tra

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
```

```
packages/ui: 3 passed (3)
packages/chain: 32 passed (32)
```

## Ghi chú

- App Task 4/7 import `@meta-platform/ui/styles.css` + cấu hình Tailwind Vite.
- `TxButton` cần `QueryClientProvider` ở app (đã có trong chain hooks).