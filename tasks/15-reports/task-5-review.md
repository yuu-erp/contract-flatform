# Review Task 5 — Chi tiết agent và chi nhánh (app `platform`)

Người review: Claude Code · 2026-11-22 · Commit: `7994069`
Kết luận: **Cần sửa** (3 điểm Quan trọng). Một commit `fix(platform): ...`, thêm "Sửa sau review" vào `task-5.md`.

Chạy lại trên container reviewer: `pnpm install --frozen-lockfile && pnpm -r build && pnpm -r lint && pnpm -r test` → xanh (chain 32, ui 9, platform 10); `forge fmt --check` sạch (đã xử lý điểm còn lại của Task 4).

## Làm tốt

- Đủ 7 tab agent, 6 tab chi nhánh; tab lưu trên URL (`?tab=`) nên chia sẻ link được.
- Chi nhánh của agent lấy từ FullDB `platform_branches` đúng thiết kế; tổng quan chi nhánh dùng múi giờ chi nhánh và có "phục vụ tại chỗ".
- Owner xem được, nút ghi khoá kèm "Chỉ Admin"; tái dùng `AgentManageDialog`.
- API `chain` mở rộng giữ đúng quy ước `String(...)`; có test hướng điều chỉnh (method 1/2) và thứ tự túi.

## Quan trọng (phải sửa)

### 1. Phân trang bắt đầu từ trang 1 → mất 20 dòng đầu
Các bảng khởi tạo `useState(1)` (`AgentDetailPage.tsx:429, 482`, `BranchDetailPage.tsx:223, 260, 282`), nhưng hook tính `offset = page * limit` và `DataTable` hiển thị "Trang {page+1}", khoá nút "Trước" khi `page <= 0` — tức là **trang đánh số từ 0**. Kết quả: giao dịch, nhật ký, thành viên **bỏ qua 20 dòng mới nhất**; khi chỉ có ≤ 20 dòng thì bảng **trống**, và màn hình hiển thị "Trang 2".

Sửa: khởi tạo `useState(0)` và khi đổi bộ lọc đặt về `0`. Kiểm luôn `AgentsPage.tsx:22` (nếu danh sách cắt mảng theo `(page-1)*20` thì thống nhất về 0). Thêm test cho một hàm thuần `pageOffset(page, size)` hoặc test `DataTable` nút "Trước" bị khoá ở trang đầu và dòng đầu tiên được hiện.

### 2. Thuế mặc định của agent luôn hiện 0
`SalesSettingsApi.agentTaxOf` dùng `mapBranchTax` (đọc tuple `(isSet, bps)`), nhưng `agentTaxOf` trên contract trả **một `uint16`**. Với giá trị vô hướng, `asRecord` ra object rỗng → `bps = 0`. Tab "Thuế & thanh toán" sẽ luôn hiện 0,00% cho mức agent.

Sửa: `agentTaxOf(...): Promise<number>` dùng `asNumber(unwrapValue(...))`. Test mapper: đầu vào `"800"`, `800`, `{ "": "800" }` → `800`.

### 3. Tạo/sửa chi nhánh chỉ kiểm một phần, lỗi chỉ hiện sau khi ký
`validate-create-branch.ts` chỉ kiểm domain "viết thường". Contract (`TextRules`) còn chặn:
- domain 3–253 ký tự, chỉ `a–z 0–9 - .`, không mở đầu/kết thúc bằng `-` hoặc `.` (`InvalidDomain`);
- SĐT theo `isPhone` (đã có ở form agent — dùng lại);
- toạ độ `longlat` 0–40 ký tự gồm số, `.`, `-`, `,`, khoảng trắng (`InvalidLonglat`);
- dịch vụ hợp lệ theo `ServiceMask` (có LOYALTY thì phải có NET hoặc IQR) và **nằm trong `allowedServices` của agent** (`ServiceNotAllowed`).

Sửa: thêm các kiểm này (dùng chung hàm với form agent), áp cho cả `BranchManageDialog` (đổi domain/dịch vụ/hồ sơ). Test: `"Q1.vn"` sai, `"-q1.vn"` sai, `"q1.vn"` đúng, `"ab"` sai; dịch vụ `LOYALTY` một mình sai; dịch vụ IQR khi agent chỉ được NET sai.

## Nhỏ (nên sửa)

4. Tab Giao dịch chỉ lọc theo chi nhánh; thiết kế yêu cầu thêm **loại bút toán, ví khách, khoảng ngày**, và cột **thời gian**, **khách**, chi tiết (phần chia túi, lý do, bút toán gốc). Có thể làm ở Task 8 (dùng chung với app agent) — ghi rõ trong báo cáo nếu dời.
5. Tab Ví khách: kiểm địa chỉ trước khi gọi (`0x` + 40 hex), hiện dư nợ tổng ngay trong tab, cột chi nhánh hiện **tên** thay vì id.
6. Nhật ký: thêm cột chi nhánh và mở chi tiết (trước/sau) — thuộc Task 6 nhưng nên dùng cùng component cho cả trang chi tiết.
7. `useAgentBranches` lấy tối đa 100 chi nhánh, không phân trang. Chấp nhận hiện tại; ghi giới hạn vào README (Task 9).
