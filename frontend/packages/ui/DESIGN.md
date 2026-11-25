# Thiết kế giao diện (theo ngôn ngữ thiết kế của X)

Học bố cục, màu và nhịp chữ của X; **không** dùng logo, tên hay tài sản của X.

## Hiển thị: nền × màu chủ đạo

`src/display/display.ts` lưu `{ background, accent }` ở `localStorage['meta-display']`, gắn lên `<html>`:

| Thuộc tính | Giá trị |
|---|---|
| `data-bg` | `light` (Mặc định `#FFF`), `dim` (Mờ `#15202B`), `dark` (Tối hẳn `#000`) |
| `data-accent` | `blue #1D9BF0`, `yellow #FFD400`, `pink #F91880`, `purple #7856FF`, `orange #FF7A00`, `green #00BA7C` |

- Nền `dim`/`dark` bật thêm lớp `.dark` để các biến thể `dark:` cũ vẫn chạy.
- Mỗi app gọi `initDisplay()` trong `main.tsx` trước khi render (tránh nháy màu).
- Đổi trong hộp `DisplaySettingsDialog` (mục "Hiển thị" ở thanh trái). `ThemeToggle` chỉ bật nhanh sáng ↔ tối.
- Màu biểu đồ NET/IQR **cố định** (`--chart-1`, `--chart-2`), không đổi theo màu chủ đạo.

Token trong `styles.css`: `--background`, `--foreground`, `--muted(-foreground)`, `--border`, `--input`, `--hover` (nền khi rê vào nút/menu), `--row-hover` (nền khi rê vào hàng), `--overlay`, `--primary` (= màu chủ đạo), `--success/--warning/--danger`.

## Bố cục dashboard: `DashboardShell` (`src/shell/`)

Giữ phong cách X (màu, chữ, nút viên thuốc) nhưng bố cục là dashboard:

- **Sidebar trái** 76px (thu gọn chỉ icon) / 264px (≥1280px): logo + tên, menu viên thuốc (mục đang mở đậm + nền nhạt), "Hiển thị", nút hành động chính (vd. "Tạo agent"), tài khoản ở đáy (bấm mở menu).
- **Thanh trên** dính, nền mờ: ô tìm kiếm bên trái; chip trạng thái + nút Hiển thị bên phải.
- **Nội dung** rộng tối đa 1440px, dạng lưới: `PageHeader` (tiêu đề 31px + mô tả + hành động), hàng KPI 4 cột, `Panel` cho biểu đồ / bảng / thẻ phụ.
- **Điện thoại**: nút menu mở ngăn kéo; KPI 2 cột; cột phụ của bảng ẩn bớt.

## Thành phần

| Thành phần | Dùng khi |
|---|---|
| `PageHeader` | đầu mỗi trang |
| `Panel` | thẻ khối dashboard (tiêu đề 20px đậm, mô tả, hành động; `flush` cho bảng sát viền; `tone="danger"`) |
| `DataTable bare` | bảng nằm trong `Panel` (không viền ngoài, phân trang ở chân) |
| `UnderlineTabs` | tab gạch chân màu chủ đạo (trạng thái agent, tab trang chi tiết) |
| `RowMenu` | nút "…" mở menu hành động của hàng / trang chi tiết |
| `SearchPill` | ô tìm bo tròn |
| `HashAvatar`, `hashCover` | avatar tròn / ảnh bìa sinh màu từ ví hoặc tên |
| `KpiTile` | số liệu: nhãn 13px, số 23px đậm, xu hướng xanh/đỏ |

Quy ước chữ: thân 15px, phụ 13px, tiêu đề thẻ 20px `font-extrabold`, tiêu đề trang 31px. Nút luôn `rounded-full font-bold`; ô nhập bo 4px; thẻ bo 16px; hộp thoại bo 16px với bóng mờ, nền phủ `bg-overlay`.

App `platform` dùng `DashboardShell`. App `agent` vẫn dùng `AppShell` cũ (đã nhận màu mới); chuyển sang `DashboardShell` là việc sau.
