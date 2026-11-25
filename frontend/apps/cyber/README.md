# Cyber — giao diện phòng máy (module NET)

App React cho 4 vai trò: **Owner** (chủ agent), **Manager** (quản lý 1 hoặc nhiều chi nhánh), **Staff** (nhân viên quầy), **Người chơi** (launcher trên máy trạm). Phong cách kính mờ trên hình nền `src/assets/room-bg.webp`.

```bash
cd frontend/apps/cyber
pnpm dev        # http://localhost:5175/cyber/
pnpm test && pnpm lint && pnpm build
```

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `src/ui/` | Thành phần dùng chung, không gắn nghiệp vụ: `Glass`, `Card`, `Button`, `Chip`, `Tabs`, `SearchInput`, `Avatar`, `UserChip`, `InfoPill`, `IconCluster`, `StatTile`, `ProgressBar`, `RingProgress`, `AreaChart`, `ListRow`, `SideNav`… |
| `src/domain/` | Thành phần nghiệp vụ NET dùng lại giữa các vai trò: `PcTile`/`PcGrid`, `ZonePanel`, `PcLegend`, `PcDetailCard`, `ShiftCard`, `RequestItem`, `QuickAction`, `BranchRow`, `GameTile`, `FoodCard`, `WalletTxRow`, `VoucherCard`… |
| `src/layout/` | `Backdrop` (hình nền), `DashboardLayout` (sidebar + thanh trên + nội dung), `ContentPanel`, `SidePanel`, `PageHead` |
| `src/pages/` | Màn theo vai trò, chỉ ghép từ `ui/` + `domain/` |
| `src/data/` | Kiểu dữ liệu, định dạng, quy tắc trạng thái máy (`pc.ts`), dữ liệu giả (`mock.ts`) và **hook** (`hooks.ts`) |

Màn hình chỉ đọc dữ liệu qua hook trong `src/data/hooks.ts`. Khi module NET có contract/indexer, đổi thân các hook đó (vd. sang TanStack Query); component không phải sửa.

Màu theo ngữ nghĩa (token trong `src/styles.css`): xanh lá = đang chơi / tiền vào; vàng = ví KM / sắp hết giờ; cam = nạp tiền; hồng = gọi hỗ trợ; xanh dương = đặt trước; đỏ = thông báo / nguy hiểm.

Màn `/` là trang chọn vai trò cho bản demo; bản thật xác định vai trò từ ví (owner/manager/staff) hoặc máy trạm (người chơi). Mục menu chưa làm hiện "sẽ làm ở bước sau".
