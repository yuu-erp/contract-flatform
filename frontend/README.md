# Frontend (monorepo `pnpm`)

## Cài đặt

```bash
cd frontend && pnpm install
```

CI / reviewer trên môi trường không có SDK local: tạm đổi `@metanodejs/fiai-sdk` sang `^2.1.1` trong các `package.json` (không commit), hoặc dùng `FIAI_SDK_PATH` khi dev.

## SDK ví Meta (`@metanodejs/fiai-sdk`)

Trên máy phát triển, **mọi** `package.json` trong `frontend/` khai báo trực tiếp:

`/Users/lekhaihoan/Documents/CONG_TY/metanode-finsdk/packages/fiai-sdk`

`pnpm lint` chạy `scripts/check-deps.mjs` — chỉ cho phép đường dẫn local với gói trên; mọi dependency khác phải dùng semver npm.

Tùy chọn khi dev (alias Vite, không sửa `package.json`):

```bash
FIAI_SDK_PATH=/đường/tới/metanode-finsdk/packages/fiai-sdk pnpm --filter platform dev
```

Cấu hình trong `apps/platform/vite.config.ts` và `apps/agent/vite.config.ts`.

## Chạy app

```bash
cd frontend
pnpm --filter platform dev    # http://localhost:5173/platform/
pnpm --filter agent dev       # http://localhost:5174/agent/
VITE_PREVIEW=mock pnpm --filter agent dev   # dữ liệu giả
pnpm --filter agent shots
```

## Kiểm tra

```bash
cd frontend && pnpm -r build && pnpm lint && pnpm -r test
```

Deployments: `deployments/platform-<chainId>.json` (Vite import từ repo gốc). Overlay: `platform-<chainId>.local.json` (gitignore).