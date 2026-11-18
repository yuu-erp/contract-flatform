# Web test vai trò meta-platform

Trang thử luồng `PLATFORM_ADMIN`, chủ agent, quản lý, nhân viên và ví không vai trò. Không gửi giao dịch khi build. Giao dịch chỉ xảy ra khi người dùng bấm nút trong ví MetaNode.

## Cài

`@metanodejs/fiai-sdk` trỏ tới checkout local:

`/Users/lekhaihoan/Documents/CONG_TY/metanode-finsdk/packages/fiai-sdk`

```bash
cd web
pnpm install
pnpm dev
```

Mở `http://localhost:5173/platform-test/`. Base path là `/platform-test/` (`HashRouter`).

Chain mặc định `991`, đọc `../deployments/platform-991.json`. Đổi chain không cần file `.env`:

```bash
VITE_CHAIN_ID=991 pnpm dev
```

Thiếu `deployments/platform-<id>.json` hoặc thiếu khoá proxy thì trang báo tên khoá, không crash.

## Kiểm tra

```bash
pnpm build && pnpm lint && pnpm test
```

## Kịch bản trên chain (4 ví có vai trò + 1 ví trống)

1. Admin tạo chi nhánh mới cho agent #1 (tab Admin).
2. Chủ agent cấp Manager cho ví B (tab Chủ agent).
3. B cấp Staff cho ví C. B thử cấp Manager ở tab Thử quyền → `NotAuthorized`.
4. C thử cấp Staff → `NotAuthorized`. C rời chi nhánh (tab Nhân viên, có hộp xác nhận).
5. Ví trống thấy "Không có vai trò", thử `grantRole` → `NotAuthorized`.
