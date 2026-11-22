# Báo cáo Task U2 — Nền shadcn, token màu, phông Inter

## Đã làm

- `packages/ui/components.json` (style new-york, alias `@/*` trong tsconfig).
- Shadcn UI: `sidebar`, `breadcrumb`, `tabs`, `select`, `dropdown-menu`, `dialog`, `sheet`, `alert-dialog`, `tooltip`, `badge`, `separator`, `skeleton`, `table`, `checkbox`, `label`, `textarea`, `toggle`/`toggle-group`, `popover`, `calendar`, `sonner`, `chart`, `avatar`, `alert`, `card`, `button`, `input` dưới `src/components/ui/`.
- Token trong `styles.css`: `--primary` xanh (~oklch 0.55 0.17 255), `--success/--warning/--danger`, `--chart-1` / `--chart-2` (NET/IQR); `body` dùng **Inter Variable** (`@fontsource-variable/inter`), `tabular-nums`.
- `primitives/button` và `primitives/input` re-export từ shadcn — app giữ import cũ.
- `RevenueChart` dùng `var(--chart-1)` / `var(--chart-2)`.

## Chưa làm (U3+)

- Gom `PageLoader` → `Skeleton`, `DashboardToolbar` → shadcn, `ConfirmDialog` → `AlertDialog`.
- Bọc app `TooltipProvider` / `SidebarProvider` (khi dùng sidebar shadcn thật).
- File `components/ui/*` dùng import tương đối trong dist (tsc không resolve `@/` khi build); shadcn CLI vẫn sinh `@/` — chỉnh tay sau mỗi `shadcn add`.

## Kiểm tra

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
pnpm --filter platform shots
```

CSS build ~87 kB (font Inter + shadcn); shots giữ 51 ảnh mock.