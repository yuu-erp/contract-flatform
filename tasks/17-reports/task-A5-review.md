# Review Task A5 — cài đặt thuế và phương thức thanh toán

Người review: Claude Code · 2026-11-23 · Commit: `8a3a901`
Kết luận: **Logic A5 đạt, nhưng phải sửa trước A6** (2 Nghiêm trọng, 2 Quan trọng). Một commit `fix(agent): ...`, thêm "Sửa sau review" vào `task-A5.md`.

Chạy lại trên container (tạm đổi SDK sang npm, không commit): build 4 gói xanh, lint xanh, test xanh (chain 75, ui 16, agent 13, platform 13).

## Phần đạt

- `sales-settings.ts`: `parsePercentToBps` ('8,5' → 850, '100' → 10000, '100,01' lỗi), `effectiveBranchPaymentMethods = (branch || agent) & agent`, "Theo agent" = 0, `CASH|WALLET == 9` — đúng plan, có test.
- `AgentSalesSettingsEditor`: mặt nạ agent khác 0 và ⊆ ALL; mặt nạ chi nhánh ⊆ agent; checkbox ngoài tập agent bị khoá; cảnh báo chi nhánh rỗng phương thức.
- Manager chỉ xem (đúng kịch bản nghiệm thu bước 3).

## Nghiêm trọng

### 1. Chế độ xem trước (`VITE_PREVIEW=mock`) hỏng hoàn toàn từ `b9f4089`
`pnpm --filter agent shots` chạy ra 48 ảnh nhưng **mọi ảnh chỉ có "Đang tải…"**.

Nguyên nhân: `b9f4089` bọc mock bằng `AgentAccessApi`, `BranchRegistryApi`… — các lớp này gửi tham số số dạng `String(n)` (đúng với SDK). Nhưng mock vẫn so sánh `b.id === branchId` với số → `getBranch("1")` ném `BranchNotFound`, `effectiveRoleOf("1", …)` trả 0. Kiểm bằng vitest: `branchesOfAccount(owner1)` = `[1, 2]` nhưng `getBranch(1)` qua lớp Api ném `BranchNotFound`. App `platform` dùng chung mock nên cũng bị.

Sửa: chuẩn hoá tham số ở **biên mock** — mỗi hàm mock đổi id/số bằng `Number(x)`, số tiền bằng `BigInt(x)` (hoặc bọc từng đối tượng mock một lần bằng hàm chuẩn hoá). Thêm test trong `create-mock-contracts.test.ts` gọi **qua `createMockContracts()`** (tức qua lớp Api, không gọi thẳng state):
- với mọi chi nhánh: `branches.getBranch(id)`, `getBranchProfile(id)` chạy;
- `agentAccess.effectiveRoleOf(3001-branch, manager3001) >= 2`;
- `salesSettings.quoteTax(branchId, 1, 100000n)` trả đúng thuế theo mock.

Reviewer vá tạm cục bộ (không commit) để xem được giao diện — sau vá, trang Cài đặt hiện đúng (ảnh mô tả bên dưới).

### 2. Lỗi xác định vai trò bị nuốt → quay "Đang tải…" mãi
`AgentAppChrome`: `if (!access) return <PageLoader message="Đang tải…" />`. Khi `useAgentAccess` lỗi (TanStack Query: `status = 'error'`, `isLoading = false`, `data = undefined`) thì người dùng thấy vòng quay vô hạn, không biết lỗi gì. Trên chain thật, chỉ cần một lệnh đọc revert (RPC, domain lỗi, chi nhánh bị xoá) là cả app treo.

Sửa: xử lý `isError` trước nhánh `!access`: hiện thẻ lỗi với `decodeContractError(error)` + nút "Thử lại" (`refetch`). Áp dụng tương tự ở app `platform` nếu có chỗ cùng mẫu. Test: render `AgentAppChrome` với hook trả lỗi → thấy thông báo lỗi, không thấy "Đang tải…".

## Quan trọng

### 3. Mock `quoteTax` lỗi kiểu số tiền
`SalesSettingsApi.quoteTax` gửi `amount.toString()`; `mockQuoteTax` làm `amount * BigInt(bps)` với chuỗi → `TypeError`. Trang Cài đặt của manager hiện "Không gọi được quoteTax." (ảnh sau vá điểm 1). Sửa cùng điểm 1 (`BigInt(amount)`). Đồng thời `TaxQuotePreview` nên hiện thông báo giải mã (`decodeContractError`) thay vì câu chung.

### 4. Script chụp ảnh không phát hiện trang chưa tải xong
`capture-shots.mjs` chỉ chờ `networkidle` + 400 ms → chụp phải màn "Đang tải…" mà không báo lỗi; vì vậy điểm 1 lọt qua. Sửa: sau mỗi `goto`, chờ loader biến mất (gắn `data-page-loader` cho `PageLoader`, rồi `waitForFunction(() => !document.querySelector('[data-page-loader]'), { timeout: 15000 })`); hết hạn thì **ném lỗi, thoát mã khác 0** kèm tên ảnh. Báo cáo task chỉ ghi "shots đạt" sau khi đã mở xem vài ảnh.

## Nhỏ (sửa cùng commit nếu tiện)

- Nhãn "Phương thức: Theo agent (= 0)" lộ giá trị thô → "Theo agent".
- Cảnh báo đầu trang "…không còn phương thức nào **sau khi thu hẹp** tập agent" hiện ngay khi mở trang (dữ liệu sẵn đã lệch, chưa thu hẹp gì) → đổi thành "Các chi nhánh sau hiện không có phương thức thanh toán nào: …"; dùng khối cảnh báo (viền/nền vàng) thay vì cả thẻ chữ đỏ.
- Trang manager: tiêu đề thẻ là domain `agent1-cn1.mock.local`, nên là tên chi nhánh, domain để dòng phụ; bỏ khoảng trống dưới tiêu đề.

## Ảnh (sau vá tạm điểm 1)

- Chủ agent 1440: thuế NET 8 %, IQR 10 %, "Kiểu giá NET: đã gồm thuế (khoá)", phương thức agent chỉ Tiền mặt, phần ghi đè theo chi nhánh — bố cục ổn.
- Manager 1440: bảng chỉ đọc + "Xem trước quoteTax" lỗi (điểm 3).

## Việc tiếp theo

Sửa điểm 1–4 (+ nhỏ) → chạy `pnpm -r build && pnpm -r lint && pnpm -r test && pnpm --filter agent shots`, mở xem `owner--settings--1440-light.png`, `manager--settings--1440-light.png`, `owner--overview--1440-light.png` → push. Sau đó mới làm A6.

## Review lại sau sửa (commit `106d908`)

Kết luận: **Đạt A5 — chuyển sang A6.** Hai mục nhỏ còn lại gộp vào commit A6.

Chạy lại trên container: build/lint xanh, test xanh (chain 80, ui 16, agent 15, platform 13); `pnpm --filter agent shots` đủ 48 ảnh, **không còn ảnh "Đang tải…"**.

- Điểm 1 — Đã sửa: `mockId`/`mockBig` ở biên mock, test gọi qua lớp Api (id dạng chuỗi), `quoteTax` 100.000 ₫ NET 8 % → thuế 7.407 ₫.
- Điểm 2 — Đã sửa: `AgentAppChrome` xử lý `isError` → `ErrorState` + Thử lại, có test.
- Điểm 3 — Đã sửa: ảnh manager hiện kết quả quote (thuế suất 8,00 %).
- Điểm 4 — Đã sửa: `data-page-loader` + chờ loader, quá 15 s thoát mã ≠ 0.

### Còn mở (nhỏ, làm cùng A6)

- Câu cảnh báo vẫn là "…sau khi thu hẹp tập agent" và cả khối chữ đỏ (`AgentSalesSettingsEditor.tsx:76`) → "Các chi nhánh sau hiện không có phương thức thanh toán nào: …", khối cảnh báo vàng.
- Trang manager: tiêu đề thẻ và nhãn quote vẫn là domain (`SettingsPage.tsx:35,37` dùng `access.domain`) → dùng `access.branchName`, domain làm dòng phụ.
- Ảnh `owner--settings--1440-light.png`: menu "Nhân sự" có nền xám còn "Cài đặt" không được tô (mục đang mở phải được tô). Kiểm lại trạng thái active của `NavLink` khi vào thẳng `#/settings`; nếu chỉ do chuột còn nằm trên menu khi chụp thì thêm `page.mouse.move(0, 0)` trước khi chụp.
- (Không phải lỗi) Ảnh tổng quan owner: "Doanh thu thuần" > "Gộp" là hợp lệ vì thuần = gộp − hoàn + điều chỉnh tăng − điều chỉnh giảm (`metrics.ts:69`). Nên thêm dòng phụ dưới ô "Thuần" ghi rõ phần hoàn/điều chỉnh để người xem không thấy vô lý.
