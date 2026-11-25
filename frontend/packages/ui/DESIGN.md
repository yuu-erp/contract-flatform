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

## Bố cục: `ColumnShell` (`src/shell/`)

- Trái 88px (thu gọn) / 275px (≥1280px): logo, menu chữ 20px (đậm khi đang mở), "Hiển thị", nút hành động chính dạng viên thuốc, tài khoản ở đáy (bấm mở menu).
- Giữa 600px, viền hai bên. Mỗi trang bắt đầu bằng `ColumnHeader` (dính, nền mờ, nút quay lại) + `UnderlineTabs` nếu có tab.
- Phải 290/350px (≥1024px): `SearchPill`, các `RailCard`.
- Điện thoại: thanh tab dưới, nút hành động nổi, avatar ở header mở ngăn kéo.

## Thành phần

| Thành phần | Dùng khi |
|---|---|
| `ColumnSection` | khối nội dung trong cột giữa, ngăn bằng đường kẻ (`flush` cho danh sách) |
| `ListRow` | hàng kiểu "người để theo dõi": avatar, tên đậm, dòng phụ, nội dung, hành động phải |
| `RowMenu` | nút "…" mở menu hành động của hàng / trang hồ sơ |
| `ListPager` | phân trang cuối danh sách |
| `HashAvatar`, `hashCover` | avatar tròn / ảnh bìa sinh màu từ ví hoặc tên |
| `KpiTile` | số liệu: nhãn 13px, số 23px đậm, xu hướng xanh/đỏ |

Quy ước chữ: thân 15px, phụ 13px, tiêu đề khối 20px `font-extrabold`, số lớn 31–40px. Nút luôn `rounded-full font-bold`; ô nhập bo 4px; thẻ bo 16px; hộp thoại bo 16px với bóng mờ, nền phủ `bg-overlay`.

App `platform` đã dùng `ColumnShell`. App `agent` vẫn dùng `AppShell` cũ (đã nhận màu mới); chuyển sang `ColumnShell` là việc sau.
