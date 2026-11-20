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

## Sửa sau review

Theo `task-3-review.md`: lý do 1–200 byte UTF-8, RangePicker tuỳ chọn ≤366 ngày, menu mobile AppShell, StatusBadge tiếng Việt, trục Y `formatVndCompact`, KpiTile kỳ trước âm, `FinsdkProvider` cờ `alive`, dark `prefers-color-scheme`.

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
```

```
Scope: 2 of 3 workspace projects
packages/chain build$ tsc -p tsconfig.build.json
packages/chain build: Done
packages/ui build$ tsc -p tsconfig.build.json
packages/ui build: Done
Scope: 2 of 3 workspace projects
packages/chain lint$ eslint src --max-warnings 0
packages/chain lint: Done
packages/ui lint$ eslint src --max-warnings 0
packages/ui lint: Done
Scope: 2 of 3 workspace projects
packages/chain test$ vitest run
packages/chain test:  Test Files  13 passed (13)
packages/chain test:       Tests  32 passed (32)
packages/chain test: Done
packages/ui test$ vitest run
packages/ui test:  Test Files  4 passed (4)
packages/ui test:       Tests  9 passed (9)
packages/ui test: Done
```