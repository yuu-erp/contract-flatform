# T17 — App `agent`: Chủ agent và Manager (vai trò theo `?domain`) Implementation Plan

> **Người làm:** Cursor. **Người review:** Claude Code (sau mỗi task). Đánh dấu `- [ ]` khi xong.

Trạng thái: Chờ duyệt (2026-11-23) · Cỡ: L · Loại: Tính năng (frontend)
Thay cho Task 7–8 của `tasks/15-web-dashboards.md` (Task 9 của T15 gộp vào A7 ở đây).

**Goal:** Một app `agent` duy nhất: không có `?domain` → giao diện **Chủ agent** đầy đủ tính năng; có `?domain=<domain chi nhánh>` và ví là **Manager** của chi nhánh đó → giao diện **Manager** chỉ trong chi nhánh đó.

**Architecture:** `frontend/apps/agent` (Vite, `base: /agent/`, HashRouter) dùng lại `@meta-platform/chain` và `@meta-platform/ui`. Các khối dùng chung với app `platform` (nhật ký, bảng bút toán, tổng quan chi nhánh, hiển thị thuế/phương thức) chuyển sang `packages/ui/src/domain/` để hai app không lặp code.

**Spec:** `tasks/15-web-dashboards.md` mục "Thiết kế" (công thức, nguồn dữ liệu, bảng màn hình app `agent`), `docs/modules/core-access.md` §3 (ma trận quyền), `docs/modules/core-sales-settings.md`, `docs/modules/core-ledger.md`, `tasks/16-ui-dashboard.md` mục "Quy chuẩn giao diện" và "Biểu đồ doanh thu".

## Global Constraints

- Mọi ràng buộc chung của T15 vẫn áp dụng (địa chỉ từ deployments, không gửi giao dịch khi build/test, `String(n)` cho uint, trang đánh số từ 0, byte UTF-8 cho trường văn bản, tiếng Việt).
- Giao diện theo "Quy chuẩn giao diện" T16: component shadcn trong `packages/ui` (không `<select>`/`<table>`/checkbox thô), `Skeleton` khi tải, toast cho mọi giao dịch, xác nhận cho thao tác thu hồi/nguy hiểm.
- SDK `@metanodejs/fiai-sdk ^2.1.1` từ npm; bản local chỉ qua `FIAI_SDK_PATH` (như `platform`).
- `pnpm -r build && pnpm -r lint && pnpm -r test` xanh trước **mỗi** commit; `pnpm --filter agent shots` chạy được.

## Quy tắc vai trò (quyết định đã chốt)

`domain` lấy từ `window.location.search` (phần **trước** `#`, ví dụ `/agent/?domain=q1.vn#/staff`), cắt khoảng trắng, chuyển chữ thường. Mọi liên kết trong app giữ nguyên phần này (HashRouter không đụng tới `search`).

| Điều kiện | Kết quả `AgentAccess` |
|---|---|
| Chưa kết nối ví | `{ kind: 'login' }` |
| Không có `domain`, `agentIdOf(ví) = id ≠ 0` | `{ kind: 'owner', agentId: id }` |
| Không có `domain`, ví không là chủ, có chi nhánh với vai trò ≥ Manager | `{ kind: 'pick-branch', branches: [{branchId, agentId, domain, name}] }` — màn chọn, mỗi dòng là link `?domain=` |
| Không có `domain`, không vai trò | `{ kind: 'no-access' }` |
| Có `domain`, `branchByDomain(domain) = 0` | `{ kind: 'domain-not-found', domain }` |
| Có `domain`, chi nhánh hoặc agent `Deleted` | `{ kind: 'domain-not-found', domain }` (thông báo "đã ngừng hoạt động") |
| Có `domain`, ví là chủ agent của chi nhánh đó | `{ kind: 'owner', agentId, focusBranchId }` (giao diện chủ, chọn sẵn chi nhánh) |
| Có `domain`, `effectiveRoleOf(branch, ví) = Manager` | `{ kind: 'manager', agentId, branchId, domain }` |
| Có `domain`, vai trò Staff hoặc None | `{ kind: 'no-access', domain }` ("Ví này không phải quản lý của <domain>") |

`effectiveRoleOf` đã trả `None` khi chi nhánh/agent `Deleted` (contract A6).

## Màn hình

Menu trái theo vai trò. Manager: mọi dữ liệu khoá vào `branchId` của domain, không có bộ chọn chi nhánh.

| Route | Chủ agent | Manager |
|---|---|---|
| `/` Tổng quan | Phạm vi agent: KPI, biểu đồ NET/IQR theo ngày (UTC+7), bảng so sánh chi nhánh (doanh thu thuần, phục vụ tại chỗ), dư nợ ví khách. Lọc chi nhánh. | Phạm vi chi nhánh, theo múi giờ chi nhánh: KPI, biểu đồ, phục vụ tại chỗ thuần, tiền thu theo phương thức |
| `/branches` | Danh sách chi nhánh (tên, domain, trạng thái, dịch vụ, chi nhánh chính, doanh thu thuần khoảng đang chọn) + nút "Mở link quản lý" (copy URL `?domain=`) | — (ẩn) |
| `/branches/:branchId` | Tab: Tổng quan · Thông tin (chỉ đọc — admin nền tảng quản lý) · Thành viên · Thuế & thanh toán · Giao dịch · Nhật ký | — (thông tin chi nhánh hiện ở `/`) |
| `/staff` | Chọn chi nhánh → bảng thành viên; cấp/đổi Manager ↔ Staff, cấp Staff, thu hồi bất kỳ | Thành viên chi nhánh mình; cấp Staff cho ví **chưa có vai trò**, thu hồi Staff; nút "Rời chi nhánh" của chính mình |
| `/settings` | Ghi: thuế NET/IQR mức agent, ghi đè/xoá ghi đè theo chi nhánh, kiểu giá IQR (NET khoá "đã gồm"), phương thức thanh toán agent + từng chi nhánh (0 = theo agent); ô xem trước `quoteTax` | Chỉ đọc: thuế hiệu lực, kiểu giá, phương thức của chi nhánh mình; ô xem trước `quoteTax` |
| `/wallets` | Dư nợ ví khách của agent; tra một ví → số dư + túi theo chi nhánh (tên chi nhánh) | Tra một ví → số dư, **túi tại chi nhánh mình** nổi bật |
| `/transactions` | Bút toán agent: lọc chi nhánh, loại, ví khách, nhân viên, ca, khoảng ngày; bấm dòng mở `Sheet` chi tiết (phần chia túi, thuế, lý do, hướng điều chỉnh, bút toán gốc có link) | Như chủ nhưng khoá chi nhánh mình |
| `/audit` | Nhật ký agent (nhãn `G`) | Nhật ký chi nhánh (nhãn `G` + `B`) |

Mọi nút ghi khoá kèm lý do (tooltip) khi: hệ pause, agent không Active, chi nhánh không Active, sai vai trò theo ma trận.

---

### Task A0: Tách khối dùng chung sang `packages/ui/src/domain`

- [x] Chuyển từ `apps/platform` sang `packages/ui/src/domain/` (giữ test, sửa import ở `platform`): `AuditLogPanel`, bảng bút toán (+ `ledger-display`), `wallet-buckets`, `payment-methods`, `services-label`, `chart-data`, khối tổng quan chi nhánh (KPI + biểu đồ + phục vụ tại chỗ), khối hiển thị thuế/phương thức chỉ đọc, `useAppTx`.
- [x] App `platform` vẫn build/test xanh, `shots` không đổi giao diện.
- [ ] Commit `refactor(ui): tách khối dashboard dùng chung cho platform và agent`.

### Task A1: Khung app `agent`, xem trước giả, chụp màn hình

- [x] `apps/agent` theo khung `platform` (shadcn sidebar, `NavUser`, `SiteHeader`, `PageHeader`, toast, banner pause). Tiêu đề: "Meta Agent"; header hiện tên cửa hàng + (manager) tên chi nhánh và domain.
- [x] `createMockContracts`: thêm domain cho mọi chi nhánh (đã có), thêm thành viên: ví giả `0x…3001` là Manager chi nhánh 1 và 4, Staff chi nhánh 2; ví `0x…3002` vừa là chủ agent 2 vừa là Manager chi nhánh của agent 3.
- [x] `VITE_PREVIEW=mock`: menu người dùng có công tắc ví giả (Chủ agent 1 · Manager `0x…3001` · Chủ + Manager `0x…3002` · Staff · Không quyền) và ô nhập `domain` để thử.
- [x] `pnpm --filter agent shots`: chụp mọi route cho (a) chủ agent, (b) manager với `?domain=` chi nhánh 1, (c) màn chọn chi nhánh, (d) không quyền, (e) domain không tồn tại — 1440 sáng/tối, 390 sáng. Hỗ trợ `PW_CHROMIUM_PATH`.
- [x] Commit `feat(agent): khung ứng dụng, xem trước dữ liệu giả, chụp màn hình`.

### Task A2: Xác định vai trò theo `?domain`

- [x] `packages/chain/src/agent-access.ts`: hàm thuần `resolveAgentAccess(input) → AgentAccess` theo đúng bảng "Quy tắc vai trò" (input đã đọc sẵn: `domain?`, `ownedAgentId`, `branchIdByDomain`, `branch`, `agentOfBranch`, `agentStatus`, `roleInBranch`, `managedBranches`); hook `useAgentAccess()` đọc chain (`branchByDomain`, `getBranch`, `getAgent`, `agentIdOf`, `effectiveRoleOf`, `branchesOfAccount` + `getBranchProfile` cho danh sách chọn).
- [x] `readDomainParam(location)` chuẩn hoá (trim, chữ thường); `withDomain(path)` giữ `?domain` khi tạo link.
- [x] Route guard: manager vào `/branches*` → chuyển về `/`; mọi truy vấn của manager dùng `branchId` của domain, **không** lấy từ URL khác.
- [x] Test (bắt buộc, đủ 9 dòng bảng): mỗi dòng một test cho `resolveAgentAccess`; `readDomainParam('?domain=%20Q1.VN%20')` → `'q1.vn'`; `withDomain('/staff')` giữ `?domain=q1.vn`.
- [x] Commit `feat(agent): xác định vai trò chủ agent / manager theo domain`.

### Task A3: Tổng quan và Chi nhánh

- [x] `/` theo bảng Màn hình cho cả hai vai trò (chủ: UTC+7; manager: múi giờ chi nhánh).
- [x] `/branches`, `/branches/:branchId` (chủ). Nút "Mở link quản lý" copy `https://<origin>/agent/?domain=<domain>`.
- [x] Test: tổng quan manager chỉ gọi `rollup(SCOPE_BRANCH, branchId, …)` (không gọi phạm vi agent); bảng so sánh chi nhánh của chủ cộng đúng.
- [x] Commit `feat(agent): tổng quan và chi nhánh`.

### Task A4: Nhân sự

- [x] `/staff` theo ma trận `core-access.md` §3. Hàm thuần `allowedStaffActions(viewer, target)` → tập hành động hợp lệ (`grantManager`, `grantStaff`, `demoteToStaff`, `promoteToManager`, `revoke`, `renounce`) — nút ngoài tập này ẩn.
- [x] Cấp vai trò: kiểm địa chỉ, chặn ví là chủ agent (`AccountIsAgentOwner`) trước khi gửi nếu biết; lỗi contract hiện toast tiếng Việt (`NotAuthorized`, `TooManyMembers`, `TooManyBranches`, `AccountIsPlatformRole`, `RoleUnchanged`).
- [x] Thu hồi / rời chi nhánh qua `ConfirmDialog`.
- [x] Test `allowedStaffActions`: chủ với Manager/Staff; manager với Staff (thu hồi được), với Manager khác (không gì), với ví chưa có vai trò (chỉ cấp Staff), với chính mình (chỉ rời).
- [x] Commit `feat(agent): nhân sự theo ma trận quyền`.

### Task A5: Cài đặt thuế và phương thức thanh toán

- [ ] `/settings` theo bảng Màn hình. Đọc `agentTaxOf`, `branchTaxOf`, `isTaxExclusive`, `agentPaymentMethodsOf`, `paymentMethodsOf`; ghi `setAgentTax`, `setBranchTax`, `clearBranchTax`, `setTaxExclusive`, `setAgentPaymentMethods`, `setBranchPaymentMethods`.
- [ ] Nhập thuế dạng phần trăm (`8,5` → 850 bps), chặn > 100 %; checkbox phương thức ↔ bitmask; chi nhánh có lựa chọn "Theo agent" (= 0); cảnh báo khi tập chi nhánh không còn phương thức nào sau khi thu hẹp tập agent.
- [ ] Xem trước: nhập số tiền + dịch vụ → `quoteTax` hiện thuế và khách trả.
- [ ] Test: `parsePercentToBps('8,5') == 850`, `'100' == 10000`, `'100,01'` lỗi; `CASH|WALLET == 9`; "Theo agent" = 0; tập hiệu lực chi nhánh = (chi nhánh || agent) & agent.
- [ ] Commit `feat(agent): cài đặt thuế và phương thức thanh toán`.

### Task A6: Ví khách, Giao dịch, Nhật ký

- [ ] `/wallets`, `/transactions` (đủ bộ lọc + `Sheet` chi tiết — phần dời từ review Task 5 của T15), `/audit` theo bảng Màn hình; dùng khối chung từ A0 (app `platform` cũng nhận bộ lọc mới).
- [ ] Test: dựng query giao dịch từ bộ lọc (nhãn `B`, `K`, `W`/`S` chữ thường, `C`, khoảng slot 0); chi tiết bút toán hoàn hiện link bút toán gốc.
- [ ] Commit `feat(agent): ví khách, giao dịch, nhật ký`.

### Task A7: Tài liệu và nghiệm thu (thay Task 9 của T15)

- [ ] `frontend/README.md`: chạy hai app, `?domain`, `VITE_PREVIEW=mock`, `shots`, `FIAI_SDK_PATH`, giới hạn đã biết.
- [ ] `docs/04-lo-trinh.md`: mốc FE 1 (hai dashboard) — trạng thái.
- [ ] `frontend/NGHIEM-THU.md`, kịch bản trên chain 991:
  1. Admin (app `platform`) tạo agent A cho ví X, 2 chi nhánh `a1.test`, `a2.test`.
  2. X mở `/agent/`: giao diện chủ; đặt thuế IQR 8 %, chi nhánh `a2.test` ghi đè 10 %; bật Chuyển khoản ở agent, tắt ở `a2.test`; cấp Manager cho ví Y ở `a1.test`.
  3. Y mở `/agent/` (không domain): thấy màn chọn chi nhánh có `a1.test`; mở `/agent/?domain=a1.test`: giao diện manager, cấp Staff cho ví Z, không sửa được Cài đặt, không thấy menu Chi nhánh.
  4. Y mở `/agent/?domain=a2.test` → "không phải quản lý"; Z mở `?domain=a1.test` → "không có quyền".
  5. X mở `/agent/?domain=a1.test` → giao diện chủ, chọn sẵn chi nhánh `a1.test`.
  6. `/agent/?domain=khong-co.test` → "domain không tồn tại".
  7. Owner nền tảng pause → cả hai app hiện banner, nút ghi khoá; unpause.
- [ ] Commit `docs(frontend): hướng dẫn và kịch bản nghiệm thu`.

## Lệnh kiểm tra

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
pnpm --filter agent shots
cd apps/agent && VITE_PREVIEW=mock pnpm dev   # http://localhost:5174/agent/?domain=agent1-cn1.mock.local
```
