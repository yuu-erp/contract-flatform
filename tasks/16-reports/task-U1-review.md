# Review Task U1 (+ sửa Task 6) — xem trước dữ liệu giả, chụp màn hình

Người review: Claude Code · 2026-11-22 · Commits: `609f0fa` (sửa Task 6), `e757664` (U1)
Kết luận: **Cần sửa trước U2** (1 Nghiêm trọng, 3 Quan trọng). Một commit `fix(ui): ...`, thêm "Sửa sau review" vào `task-U1.md`.

Reviewer đã tự chạy `pnpm shots` (51 ảnh) — rất hữu ích, giờ review được bằng mắt.

## Nghiêm trọng — lý do chính khiến giao diện "xấu"

### 1. Tailwind không quét mã của `packages/ui` → phần lớn class của component dùng chung **không được sinh ra**
App import `@meta-platform/ui/styles.css` (chỉ có `@import 'tailwindcss'`). Tailwind 4 tự dò class từ thư mục gốc của app và **bỏ qua `node_modules`** — mà `@meta-platform/ui` được liên kết vào `node_modules`. Mọi class **chỉ xuất hiện trong `packages/ui`** không có trong CSS.

Bằng chứng (chạy Playwright trên bản build xem trước):
- Khung biểu đồ `.recharts-responsive-container` rộng 899 px nhưng **cao 0 px** (class `h-72` của `RevenueChart` không tồn tại) → "Doanh thu theo ngày" và "Biểu đồ agent" **trống trơn** dù có dữ liệu.
- Ở 1440 px **không thấy thanh bên** (class `md:flex`, `w-60` của `AppShell` không tồn tại) → chỉ còn chữ "Tổng quan" trên cùng.
- Lề, bo góc, nền của nhiều thẻ/nút trong `packages/ui` lệch so với thiết kế.

Sửa (một dòng, làm **trước** mọi thứ khác ở U2): trong `packages/ui/src/styles.css`, ngay sau `@import 'tailwindcss';` thêm
```css
@source "./";
```
(đường dẫn tính từ file CSS → quét toàn bộ `packages/ui/src`). Kiểm lại bằng `pnpm shots`: biểu đồ có cột, thanh bên hiện ở 1440 px.

## Quan trọng

### 2. Phụ thuộc SDK lại trỏ vào thư mục trên máy khác
`frontend/apps/platform/package.json`: `"@metanodejs/fiai-sdk": "/Users/yuu/Downloads/metanode-finsdk/packages/fiai-sdk"` (commit `609f0fa`). Máy khác, CI và container reviewer **không build được** app `platform`. Review Task 4 đã chốt dùng bản npm `^2.1.1` (gói `ui` đang dùng bản này). Đưa về `^2.1.1`. Nếu máy dev bắt buộc bản local, dùng `pnpm.overrides` trong một file **không commit** hoặc biến môi trường, không ghi đường dẫn tuyệt đối vào `package.json`.

### 3. Dữ liệu giả sai enum trạng thái và sai tổng chi nhánh
`packages/chain/src/mock/mock-store.ts`:
- `STATUSES = [0,0,0,0,0,0,1,1,1,2,2,2]` và chi nhánh `status: status === 2 ? 2 : 0`. Trên contract `0 = None` (không tồn tại), `1 = Active`, `2 = Suspended`, `3 = Deleted`. Kết quả: 6 agent hiện huy hiệu **"Không có"**, thẻ Hệ thống ra "3 hoạt động, 3 tạm dừng" trên 12 agent. Sửa thành `[1,1,1,1,1,1,1,1,2,2,3,3]` (hoặc tỉ lệ tương tự), chi nhánh dùng 1/2/3.
- Bộ đếm chi nhánh **chép nguyên** bộ đếm agent (`branchDays = perAgentDays.map(...)`) → mỗi chi nhánh bằng cả agent ("So sánh chi nhánh" hai dòng cùng 38.752.386 ₫), sai bất biến "tổng chi nhánh = agent". Chia bộ đếm agent cho các chi nhánh (vd theo tỉ lệ cố định), sao cho tổng các chi nhánh = agent ở mọi chỉ số trừ `SERVED_HERE`.
- Thêm test trong `create-mock-contracts.test.ts`: mọi agent có `status ∈ {1,2,3}`; với mỗi agent, Σ rollup chi nhánh = rollup agent (trừ chỉ số 17, 25, 26, 27); Σ agent = nền tảng.

### 4. Script chụp màn hình không chạy được nếu chưa tải trình duyệt Playwright riêng
`capture-shots.mjs` gọi `chromium.launch()` không tham số. Thêm `executablePath: process.env.PW_CHROMIUM_PATH` khi có biến này (container CI/reviewer dùng `/opt/pw-browsers/chromium`), và đợi biểu đồ vẽ xong trước khi chụp (`await page.waitForSelector('.recharts-surface', { timeout: 3000 }).catch(() => {})` ở các trang có biểu đồ).

## Đã kiểm phần sửa Task 6 (`609f0fa`)

- Điểm 1 — Đã sửa: "Vùng nguy hiểm" + xác nhận cho pause, gỡ admin, đề xuất owner, setPoster.
- Điểm 2 — Đã sửa: `useAppTx` + toast.
- Điểm 3, 4 — Đã sửa: `termAddress` cho người làm; lọc khoảng ngày một đầu, có test.

## Nhận xét giao diện từ ảnh chụp (đưa vào U2–U5)

- Thanh "Chế độ xem trước" và dòng ví/vai trò chiếm ~150 px đầu mọi trang → gộp vào menu người dùng ở thanh bên (U3).
- Header app `platform` hiện huy hiệu **"Chủ agent"** cho ví owner nền tảng → sai nhãn; dùng "Owner nền tảng"/"Admin".
- Ô KPI: số tiền có gạch chân dưới "₫" (ký tự đ bị trình duyệt gạch chân do phông); dùng `₫` không gạch hoặc viết "đ" thường.
- Điện thoại (trang Hệ thống): địa chỉ đầy đủ 42 ký tự tràn dòng trong "Vùng nguy hiểm"; nút "Gỡ" nằm dưới địa chỉ thay vì cùng hàng.
- Bảng "So sánh chi nhánh" và "Xếp hạng agent" chưa có lề trong thẻ (chữ dính sát viền) — sẽ hết khi sửa điểm 1 và dùng `DataTable` mới.

## Review lại sau sửa (commits `6091523`, `42c280a`)

Kết luận: **Đạt phần U1**, nhưng commit `42c280a` mở lại 2 vấn đề — sửa trước khi làm U2.

Reviewer chụp lại 51 ảnh: **thanh bên đã hiện, biểu đồ đã có cột**, thẻ có lề; huy hiệu trạng thái đúng (8 hoạt động, 2 tạm dừng, 2 đã xoá). Điểm 1–4 đã sửa đúng.

### Còn mở (từ `42c280a`)

**A. Test đỏ bị commit.** `pnpm -r test` ở `packages/chain`: `list-agent-branches.test.ts > trả rỗng khi branchCountOf = 0` lỗi `branches.mainBranchOf is not a function` (mock thiếu `mainBranchOf`). Luôn chạy đủ `pnpm -r test` trước khi commit.

**B. SDK lại trỏ đường dẫn local** (`/Users/yuu/Downloads/...`). Nếu máy dev cần bản SDK local mới hơn npm, giữ `package.json` là `^2.1.1` và cho Vite đổi hướng khi có biến môi trường, không đụng `package.json`:
```ts
// apps/platform/vite.config.ts
const localSdk = process.env.FIAI_SDK_PATH
resolve: { alias: localSdk ? { '@metanodejs/fiai-sdk': localSdk } : {} }
```
Ghi cách dùng (`FIAI_SDK_PATH=... pnpm dev`) vào README. Nếu bản npm thiếu tính năng cần thiết thì ghi rõ tính năng nào để phát hành bản npm mới.

**C. Danh sách chi nhánh chuyển sang quét toàn bộ id** (`listAgentBranches`): mỗi agent quét id 1…`branchCount` toàn hệ, tuần tự, 2–3 lệnh đọc mỗi id → 1 000 chi nhánh là vài nghìn lệnh gọi cho **một** trang. Cách này che đi một vấn đề lớn hơn: **`HistoryIndex.search` trên chain thật có chạy không?** Nhật ký và giao dịch sổ cũng dùng `search`. Báo cáo cần ghi: lỗi/kết quả cụ thể khi gọi `search(agentId, "platform_branches", …)` trên chain 991 (thông báo lỗi, hay trả rỗng, hay sai định dạng). Tạm thời giữ cách quét nhưng: chạy song song có giới hạn (`mapWithConcurrency` 8), dừng khi đủ `branchCountOf`, và chỉ dùng khi `search` lỗi/rỗng (thử `search` trước).
