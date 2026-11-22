# Frontend (monorepo `pnpm`)

## Cài đặt

```bash
cd frontend && pnpm install
```

## SDK ví Meta (`@metanodejs/fiai-sdk`)

Mặc định dùng bản **npm `^2.1.1`** (khai báo trong `apps/platform/package.json` và peer của `@meta-platform/ui`).

Khi cần checkout SDK local (không sửa `package.json`):

```bash
FIAI_SDK_PATH=/đường/tới/metanode-finsdk/packages/fiai-sdk pnpm --filter platform dev
```

Vite alias `@metanodejs/fiai-sdk` → `FIAI_SDK_PATH` khi biến được set (`apps/platform/vite.config.ts`).

## Chạy app platform

```bash
cd frontend
pnpm --filter platform dev          # http://localhost:5173/platform/
VITE_PREVIEW=mock pnpm --filter platform dev   # dữ liệu giả, không ví
pnpm --filter platform shots        # chụp màn (build mock + Playwright)
```

## Kiểm tra

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
```

Deployments: `deployments/platform-<chainId>.json` (Vite import từ repo gốc). Overlay tùy chọn: `platform-<chainId>.local.json` (gitignore).