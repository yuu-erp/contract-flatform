# T16 — Làm lại giao diện dashboard theo chuẩn (shadcn `dashboard-01`)

> **Người làm:** Cursor. **Người review:** Claude Code (sau mỗi task). Đánh dấu `- [ ]` khi xong.

Trạng thái: Chờ duyệt (2026-11-22) · Cỡ: L · Loại: Giao diện

**Goal:** App `platform` (và sau này app `agent`) có giao diện dashboard chuẩn, nhất quán, đẹp ở sáng/tối và điện thoại, dựa trên một mẫu đã được kiểm chứng thay vì tự chế từng trang.

**Thứ tự với T15:** làm T16 **sau khi sửa review Task 6** và **trước Task 7–8** của T15, để app `agent` dùng luôn bộ giao diện mới.

## Mẫu tham chiếu

**shadcn/ui Blocks — `dashboard-01`** (https://ui.shadcn.com/blocks, mục Dashboard). Lý do chọn:
- Cùng nền công nghệ đang dùng (React 19, Tailwind 4, Radix, token màu oklch của shadcn — `packages/ui/src/styles.css` đã theo bộ token này), nên lấy về dùng được ngay, không phải đổi thư viện.
- Đủ đúng các mảnh hệ thống cần: thanh bên thu gọn có icon, header có breadcrumb, hàng thẻ KPI có huy hiệu xu hướng, biểu đồ có bộ chọn khoảng thời gian ngay trên thẻ, bảng dữ liệu có phân trang/sắp xếp/ẩn cột.
- Phong cách trung tính (kiểu Vercel/Linear): nền xám nhạt, thẻ trắng viền mảnh, một màu nhấn — hợp với dashboard tài chính, dễ đọc số.

Cách dùng: chạy `pnpm dlx shadcn@latest add dashboard-01` (và các component lẻ ở Task U2) **trong `packages/ui`** (cấu hình `components.json` cho monorepo), rồi chỉnh lại thành component dùng chung. Không chép nguyên trang demo vào app.

## Quy chuẩn giao diện (bắt buộc cho mọi màn)

| Hạng mục | Quy định |
|---|---|
| Phông | `Inter` biến thiên (`@fontsource-variable/inter`, có tiếng Việt). Số tiền và số liệu dùng `tabular-nums`. |
| Cỡ chữ | Tiêu đề trang 24/32 semibold · tiêu đề thẻ 16 semibold · nội dung 14 · phụ 12–13 màu `muted-foreground`. Tối đa 2 độ đậm trên một thẻ. |
| Khoảng cách | Thang 4 px. Lề trang 16 px (điện thoại) / 24 px (≥ md); khoảng giữa các thẻ 16 px (điện thoại) / 24 px; nội dung tối đa 1440 px. |
| Màu | Nền trung tính (zinc) theo token sẵn có. **Một màu nhấn** (`--primary` xanh dương, oklch ≈ `0.55 0.17 255`) cho mục đang chọn, nút chính, focus. Trạng thái: `--success` (xanh lá), `--warning` (vàng), `--danger` (đỏ) — chỉ dùng cho trạng thái, luôn kèm icon/chữ. |
| Màu biểu đồ | `--chart-1` = NET: `#2a78d6` (sáng) / `#3987e5` (tối) · `--chart-2` = IQR: `#eb6834` / `#d95926`. Không dùng màu trạng thái cho chuỗi dữ liệu. Màu gắn với dịch vụ, không đổi theo bộ lọc. |
| Bo góc / viền | Thẻ `rounded-xl` viền `border` 1 px, bóng rất nhẹ (`shadow-xs`). Không lồng thẻ trong thẻ. |
| Icon | `lucide-react`, 16 px trong nút/menu, 20 px ở tiêu đề. |
| Trạng thái tải | `Skeleton` đúng hình dạng nội dung (không dùng chữ "Đang tải…"). |
| Trống / lỗi | `EmptyState` có icon + tiêu đề + mô tả + (tuỳ) hành động; lỗi dùng `Alert` màu `danger` + nút "Thử lại". |
| Điện thoại | 390 px không cuộn ngang; bảng cuộn ngang trong khung của nó; thanh bên thành `Sheet`. |
| Sáng/tối | Cả hai chế độ được thiết kế (không chỉ đảo màu); theo hệ điều hành + nút chuyển trong menu người dùng. |
| Tiếp cận | Mọi ô nhập có `Label`; focus ring rõ; tương phản chữ ≥ 4.5:1; biểu đồ luôn có chú giải và bảng số liệu thay thế. |

## Biểu đồ doanh thu (quy định riêng)

- Dạng: **cột chồng theo ngày** NET + IQR (2 chuỗi). Lọc dịch vụ một loại → chỉ còn cột của loại đó (giữ nguyên màu).
- Cột mảnh, đầu cột bo 4 px, **khe 2 px** giữa hai đoạn chồng (viền màu nền), lưới ngang mờ, không lưới dọc, trục Y dùng `formatVndCompact`.
- Chú giải luôn hiện (2 chuỗi), tooltip khi rê chuột hiện ngày + từng dịch vụ + tổng (dùng `formatVnd` đầy đủ).
- Bộ chọn khoảng (`ToggleGroup`: 7 ngày / 30 ngày / Tháng này / Tháng trước / Tuỳ chọn) nằm ở góc phải tiêu đề thẻ biểu đồ; trên điện thoại chuyển thành `Select`.
- Nút "Xem bảng" mở bảng số liệu theo ngày (thay thế cho người không xem được màu).
- Dùng `ChartContainer`/`ChartTooltip` của shadcn (bọc `recharts`).

---

### Task U1: Chế độ xem trước có dữ liệu giả + chụp màn hình

Để thiết kế và review được mà không cần ví/chain.

- [x] `packages/chain`: `createMockContracts(seed)` trả `PlatformContracts` giả, dữ liệu tất định: 12 agent (đủ 3 trạng thái, tên có dấu), 30 chi nhánh (2 múi giờ: +7 và −5), 90 ngày bộ đếm (có ngày 0, có hoàn, có điều chỉnh), 60 bút toán đủ 6 loại, 40 dòng nhật ký, 3 admin, 1 poster.
- [x] App `platform`: khi `VITE_PREVIEW=mock` thì bỏ qua `FinsdkProvider`/ví, dùng ví giả là owner nền tảng (có công tắc đổi vai trò owner/admin/không quyền trong menu người dùng ở chế độ này). Giao dịch giả: chờ 800 ms rồi thành công (hoặc lỗi nếu địa chỉ bắt đầu bằng `0xdead`).
- [x] Script `pnpm --filter platform shots`: build với `VITE_PREVIEW=mock`, chạy `vite preview`, dùng Playwright chụp **mọi route** (Tổng quan, Agent, chi tiết agent từng tab, chi tiết chi nhánh từng tab, Nhật ký, Hệ thống) ở 1440×900 sáng, 1440×900 tối, 390×844 sáng → `frontend/apps/platform/shots/*.png` (thư mục bỏ qua git).
- [x] Commit `feat(platform): chế độ xem trước dữ liệu giả và chụp màn hình`.

### Task U2: Nền tảng giao diện trong `packages/ui`

- [ ] `components.json` cho monorepo; thêm component shadcn: `sidebar`, `breadcrumb`, `tabs`, `select`, `dropdown-menu`, `dialog`, `sheet`, `alert-dialog`, `tooltip`, `badge`, `separator`, `skeleton`, `table`, `checkbox`, `label`, `textarea`, `toggle-group`, `popover`, `calendar`, `sonner`, `chart`, `avatar`, `alert`, `card`, `button`, `input` (thay `primitives/` tự viết).
- [ ] Token: thêm `--primary` màu nhấn, `--success/--warning/--danger` (+ `-foreground`), `--chart-1/--chart-2` theo bảng trên cho cả sáng và tối; phông Inter.
- [ ] Bỏ các component tự chế trùng chức năng (`DashboardToolbar`, `PageLoader`, `primitives/*`) hoặc viết lại trên nền shadcn; giữ nguyên tên export đang được app dùng để không vỡ import (hoặc sửa import trong app cùng commit).
- [ ] Commit `feat(ui): nền shadcn, token màu, phông chữ`.

### Task U3: Khung ứng dụng theo `dashboard-01`

- [ ] `AppSidebar` thu gọn được (chế độ chỉ icon), nhóm menu: **Tổng quan · Agent · Nhật ký** và nhóm **Quản trị: Hệ thống** (chỉ owner). Đầu thanh: logo + tên "Meta Platform" + huy hiệu chain. Chân thanh: `NavUser` (ví rút gọn, vai trò, menu: đổi ví, chế độ sáng/tối, ngắt kết nối).
- [ ] `SiteHeader`: nút thu gọn thanh bên, breadcrumb (vd `Agent / Cyber Quận 1 / Chi nhánh / Q1`), vùng nút hành động của trang ở bên phải.
- [ ] `PageHeader`: tiêu đề + mô tả một dòng + vùng hành động; dùng cho mọi trang.
- [ ] Banner pause: `Alert` màu `warning` dưới header, có icon.
- [ ] Điện thoại: thanh bên là `Sheet`.
- [ ] Commit `feat(ui): khung ứng dụng sidebar + header`.

### Task U4: Thành phần dashboard

- [ ] `KpiCard` (theo `SectionCards`): nhãn, giá trị lớn `tabular-nums`, huy hiệu xu hướng (mũi tên + % so kỳ trước; tăng = `success`, giảm = `danger`, với chỉ số "hoàn"/"giảm trừ" thì đảo nghĩa màu), dòng chú thích nhỏ ở chân thẻ. Có `Skeleton`.
- [ ] `RevenueChartCard` theo mục "Biểu đồ doanh thu".
- [ ] `DataTable` dùng `@tanstack/react-table`: sắp xếp cột, ẩn/hiện cột, chọn số dòng/trang, chân bảng "1–20 / 134", hàng bấm được (con trỏ + hover), cột số căn phải, `Skeleton` 5 dòng khi tải, trạng thái trống có icon. Hỗ trợ cả phân trang phía client (danh sách agent) và phía máy chủ (FullDB `offset/limit`, trang đánh số từ 0).
- [ ] `FilterBar`: một hàng phía trên bảng/biểu đồ — ô tìm có icon, các `Select` lọc, nút "Xoá lọc" khi có lọc.
- [ ] `StatusBadge` có chấm màu + chữ; `Address` có nút copy + tooltip địa chỉ đầy đủ; `Money` căn phải.
- [ ] `ConfirmDialog` trên `AlertDialog` (biến thể `destructive` cho thao tác nguy hiểm); ô lý do có bộ đếm byte.
- [ ] Toast: `Toaster` (sonner) + `useAppTx` mặc định toast chờ ký/thành công/lỗi đã giải mã.
- [ ] Test Vitest: xu hướng KPI (tăng/giảm/0/kỳ trước âm, đảo nghĩa màu); chân bảng "1–20 / 134"; biểu đồ lọc NET giữ màu `--chart-1`.
- [ ] Commit `feat(ui): thẻ KPI, biểu đồ, bảng dữ liệu, bộ lọc, toast`.

### Task U5: Áp vào các trang `platform`

- [ ] **Tổng quan:** `PageHeader` + `FilterBar` (dịch vụ) → hàng 4 `KpiCard` chính (Doanh thu thuần, Gộp, Thuế thuần, Tiền thu thuần) → hàng 4 thẻ phụ (Giảm trừ, Hoàn, Điều chỉnh ±, Nạp ví) → `RevenueChartCard` rộng hết → lưới 2 cột: bảng xếp hạng agent (`DataTable` 10 dòng, cột #, agent, doanh thu thuần, % tổng) và thẻ "Hệ thống" (số agent theo trạng thái dạng thanh nhỏ, tổng chi nhánh, dư nợ ví).
- [ ] **Agent:** `DataTable` + `FilterBar` (tìm, trạng thái, dịch vụ) + nút "Tạo agent" ở `PageHeader`. Form tạo/sửa dạng `Dialog` có `Label`, mô tả, lỗi dưới từng ô.
- [ ] **Chi tiết agent / chi nhánh:** header gồm tên, `StatusBadge`, hàng thông tin (ví chủ, dịch vụ, ngày tạo, domain/múi giờ); `Tabs` dạng gạch chân đồng bộ `?tab=`; mỗi tab là các `Card`; hành động ghi gom vào nút `DropdownMenu` "Thao tác" ở header (sửa, dừng/mở, xoá trong nhóm nguy hiểm).
- [ ] **Nhật ký:** `DataTable` + `FilterBar`; bấm dòng mở `Sheet` bên phải hiện chi tiết trước/sau (giải mã theo `action`).
- [ ] **Hệ thống:** các `Card` có mô tả: Trạng thái hệ thống, Quản trị viên (bảng + thêm), Owner, Quyền ghi dữ liệu (tra `canWrite`, poster), và thẻ **Vùng nguy hiểm** (pause, chuyển owner, gỡ admin, đặt poster) — mọi nút qua `ConfirmDialog`.
- [ ] Màn đăng nhập / không quyền / thiếu khoá deployments: thẻ giữa màn hình có logo, tiêu đề, mô tả, nút.
- [ ] Commit `feat(platform): áp giao diện mới cho mọi trang`.

### Task U6: Kiểm tra chất lượng

- [ ] Chạy `pnpm --filter platform shots`, tự kiểm theo **Danh sách kiểm** dưới đây, sửa đến khi đạt; đính kèm danh sách ảnh (tên file) vào báo cáo.
- [ ] Commit `fix(ui): hoàn thiện theo danh sách kiểm`.

**Danh sách kiểm (reviewer cũng dùng):**
1. Mọi trang có cùng `PageHeader`, cùng lề, cùng khoảng cách giữa thẻ.
2. Không còn `<select>`, `<input type="checkbox">`, `<table>` thô trong app.
3. Không còn chữ "Đang tải…" — đều là `Skeleton`.
4. 390 px: không cuộn ngang, menu mở được, bảng cuộn trong khung.
5. Tối: không có chữ/viền "mất", biểu đồ dùng màu bản tối.
6. Số tiền căn phải, `tabular-nums`, cùng định dạng.
7. Thao tác nguy hiểm đều có xác nhận; mọi giao dịch có toast.
8. Biểu đồ có chú giải, tooltip, nút "Xem bảng".

## Lệnh kiểm tra

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
pnpm --filter platform shots
```
