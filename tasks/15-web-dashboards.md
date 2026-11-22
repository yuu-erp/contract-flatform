# T15 — Hai web dashboard: Nền tảng (Owner/Admin) và Agent (Chủ agent/Manager) Implementation Plan

> **Người làm:** Cursor. **Người review:** Claude Code (sau mỗi task, theo `documents/WORKFLOW.md`). Đánh dấu `- [ ]` khi xong từng bước.

Trạng thái: Chờ duyệt (2026-11-20) · Cỡ: L · Loại: Tính năng (frontend)

**Goal:** Hai ứng dụng web đọc/ghi contract đã deploy: `platform` cho PLATFORM_OWNER/ADMIN (toàn hệ → agent → chi nhánh) và `agent` cho chủ agent/Manager (agent → chi nhánh), đủ tính năng quản lý và dashboard doanh thu từ `Ledger`.

**Architecture:** pnpm workspace `frontend/` gồm `packages/chain` (lớp gọi contract, giải mã, công thức doanh thu, hook dữ liệu), `packages/ui` (giao diện dùng chung), `apps/platform`, `apps/agent`. Kết nối ví và gọi contract theo đúng cách của web-admin mẫu (bên dưới) bằng thư viện `@metanodejs/*`. Không có backend: mọi dữ liệu đọc từ view contract và FullDB (`HistoryIndex.search`).

**Tech Stack:** React 19, Vite, TypeScript, Tailwind 4, Radix/shadcn, TanStack Query, React Router (HashRouter), `@metanodejs/fiai-sdk`, `@metanodejs/system-core`, `@metanodejs/mtn-contract`, `recharts` (biểu đồ), `viem` (**chỉ** `decodeAbiParameters` để giải mã bản ghi FullDB), Vitest.

**Spec:** `docs/08-dong-tien-va-doanh-thu.md` (§6.4 ai xem gì), `docs/modules/core-ledger.md` (bộ đếm, công thức), `docs/modules/core-access.md`, `docs/modules/core-operator.md`, `docs/modules/core-sales-settings.md`.

## Mẫu phải theo (đọc trước khi code)

1. **Web-admin mẫu** (máy người dùng): `/Users/lekhaihoan/Documents/CONG_TY/CONTRACTS/service-noti/web-admin` — xem cách khởi tạo SDK, kết nối ví, lấy ví đang chọn, tạo instance contract, gọi hàm đọc (`feeType: 'read'`) và ghi (`feeType: 'sc'`), xử lý lỗi/huỷ ký. **Làm y như mẫu**; chỗ nào mẫu khác `web/` trong repo này thì theo mẫu.
2. **`web/` trong repo** (trang thử vai trò, giữ nguyên, không sửa): đã có `FinsdkProvider`, `use-active-wallet.ts`, wrapper `MtnContract` + `normalize.ts` (giải tuple SDK trả về), `errors.ts` (giải mã lỗi custom), `config.ts` (đọc `deployments/platform-<chainId>.json`). Được **chép và tách** sang `packages/chain`, không import chéo từ `web/`.

## Global Constraints

- Không gửi giao dịch khi build/test. Giao dịch chỉ khi người dùng bấm và ký trong ví.
- Địa chỉ đọc từ `deployments/platform-<VITE_CHAIN_ID>.json` (mặc định `991`). Khoá bắt buộc: `accessProxy, agentsProxy, branchesProxy, historyProxy, agentAccessProxy, salesSettingsProxy, ledgerProxy`. Thiếu khoá → màn lỗi nêu tên khoá, không crash.
- ABI import từ `abi/*.json` ở gốc repo (alias `@abi`), không chép tay. Thêm `abi/HistoryIndex.json` đã có sẵn.
- Phân quyền xem là **luật của app** (dữ liệu on-chain công khai, `docs/08` câu hỏi mở 1 → (a)). App vẫn phải ẩn/khoá đúng theo vai trò.
- Mọi danh sách phân trang; mọi gọi hàng loạt giới hạn đồng thời (`concurrency = 8`).
- Tiền hiển thị VND, số nguyên, phân cách hàng nghìn kiểu `vi-VN` (`1.234.567 ₫`). Thuế bps hiển thị `%` 2 chữ số thập phân (`800` → `8,00%`).
- Ngày kinh doanh: `day = floor((ts + tzMinutes·60)/86400)`. Dashboard cấp nền tảng/agent dùng múi giờ **UTC+7** (420) để chọn khoảng; cấp chi nhánh dùng `tzOffsetMinutes` của chi nhánh.
- `rollup` tối đa 93 ngày mỗi lần gọi → tự chia khoảng.
- Ngôn ngữ giao diện: tiếng Việt. Tên file/biến tiếng Anh.
- Mỗi app: `pnpm build && pnpm lint && pnpm test` xanh. Không thêm thư viện ngoài danh sách Tech Stack mà không ghi lý do trong báo cáo task.

## Thiết kế

### Bộ đếm và công thức (mirror `src/libraries/LedgerMetrics.sol`)

Mảng `uint256[32]` mỗi ngày. Chỉ số:

| Chỉ số | Ý nghĩa |
|---|---|
| 0, 1, 2 | Tiền thu: tiền mặt, chuyển khoản, thẻ |
| 3, 4, 5 | Tiền chi (hoàn): tiền mặt, chuyển khoản, thẻ |
| 6 / 7 / 8 / 9 | Nạp ví / Trừ ví / Hoàn nạp / Trả lại ví |
| 10–17 (NET), 18–25 (IQR) | offset: 0 gộp, 1 giảm trừ, 2 hoàn, 3 điều chỉnh tăng, 4 điều chỉnh giảm, 5 thuế, 6 thuế hoàn, 7 phục vụ tại chỗ |
| 26 (NET), 27 (IQR) | Hoàn phục vụ tại chỗ |

- Doanh thu thuần dịch vụ = gộp − hoàn + điều chỉnh tăng − điều chỉnh giảm.
- Thuế thuần = thuế − thuế hoàn.
- Phục vụ tại chỗ thuần = phục vụ tại chỗ − hoàn phục vụ tại chỗ (chỉ cấp chi nhánh).
- Tiền thu thuần theo phương thức = thu − chi.
- Dư nợ ví khách (tại một thời điểm) = `Ledger.walletLiability(agentId)`.
- Phạm vi: `SCOPE_PLATFORM = 0` (id 0), `SCOPE_AGENT = 1` (id agentId), `SCOPE_BRANCH = 2` (id branchId).

### Nguồn dữ liệu danh sách

| Danh sách | Cách lấy |
|---|---|
| Agent | `agentCount()` rồi `getAgent(id)` + `getAgentProfile(id)` cho từng id (mới nhất trước). Tìm theo tên/SĐT: tải hết rồi lọc phía client (giới hạn hiện tại: ≤ 1000 agent; ghi chú trong README) |
| Tìm theo ví chủ | `agentIdOf(address)` |
| Chi nhánh của agent | `HistoryIndex.search(agentId, "platform_branches", …)` (mỗi doc là `BranchProfileRecord`, có `branchId`), rồi `getBranch(branchId)` |
| Thành viên chi nhánh | `AgentAccess.membersOf(branchId, offset, limit≤100)` |
| Chi nhánh của ví | `AgentAccess.branchesOfAccount(account, offset, limit)` + `effectiveRoleOf` |
| Nhật ký quản trị | `HistoryIndex.search(0, "platform_audit", …)` lọc nhãn `G<agentId>`, `B<branchId>`, `X<action>`, `R<actor hex>`; sắp slot 0 giảm dần |
| Giao dịch sổ | `HistoryIndex.search(agentId, "ledger", …)` lọc `B<branchId>`, `K<kind>`, `W<customer hex>`, `S<actor hex>`, `C<shiftId>`; khoảng slot 0 (thời gian) hoặc slot 2 (ngày); giải mã `LedgerRecord` |
| Ví khách | `balanceOf(agentId, customer)`, `bucketsOf(agentId, customer)` |

Struct giải mã (tuple ABI, theo `src/interfaces/*.sol`): `LedgerRecord`, `BranchProfileRecord`, `AgentProfileRecord`, `PlatformAuditRecord`.

### Vai trò

- App `platform`: vào được nếu ví là `owner()` hoặc `isPlatformAdmin`. Mục "Hệ thống" chỉ owner. Pending owner thấy nút "Nhận quyền owner".
- App `agent`: ví có một hoặc nhiều **ngữ cảnh**: `{type:'owner', agentId}` nếu `agentIdOf(ví) ≠ 0`; `{type:'manager', agentId, branchIds[]}` cho mỗi agent có chi nhánh mà `effectiveRoleOf ≥ Manager`. Nhiều ngữ cảnh → bộ chọn ngữ cảnh trên header (nhớ lựa chọn trong `localStorage`). Staff hoặc không vai trò → màn "Không có quyền" (Staff có màn riêng ở mốc ca thu ngân).

### Màn hình — app `platform`

| Route | Nội dung | Ai |
|---|---|---|
| `/` Tổng quan | Bộ chọn khoảng (Hôm nay, 7 ngày, 30 ngày, Tháng này, Tháng trước, Tuỳ chọn ≤ 366 ngày) + bộ lọc dịch vụ (Tất cả/NET/IQR). Ô KPI: doanh thu thuần, gộp, giảm trừ, hoàn, điều chỉnh (±), thuế thuần, tiền thu thuần theo phương thức, nạp ví, trừ ví. Biểu đồ cột theo ngày (thuần NET/IQR chồng). Bảng **xếp hạng agent** theo doanh thu thuần trong khoảng (có ô tìm). Ô đếm: agent theo trạng thái, tổng chi nhánh. Trạng thái rỗng: "Chưa có giao dịch trong khoảng này" | Owner, Admin |
| `/agents` | Bảng agent: id, tên cửa hàng, ví chủ, trạng thái, dịch vụ được cấp, số chi nhánh, ngày tạo. Tìm (tên, SĐT, id, địa chỉ ví), lọc trạng thái/dịch vụ, phân trang 20. Nút "Tạo agent" (form: ví chủ, dịch vụ, hồ sơ) | Owner, Admin (ghi: Admin) |
| `/agents/:agentId` | Header: tên, trạng thái, ví chủ, ví chủ đang chờ. Tabs: **Tổng quan** (KPI + biểu đồ của agent, bảng so sánh chi nhánh, dư nợ ví khách) · **Chi nhánh** (bảng + "Tạo chi nhánh") · **Hồ sơ & cấu hình** (sửa hồ sơ, đổi dịch vụ được cấp, dừng/mở/xoá có lý do, đề xuất ví chủ mới) · **Thuế & thanh toán** (chỉ đọc: thuế agent và từng chi nhánh, kiểu giá, phương thức) · **Ví khách** (dư nợ; tra một ví khách → số dư + túi theo chi nhánh) · **Giao dịch** (bảng bút toán, lọc chi nhánh/loại/khách/khoảng ngày) · **Nhật ký** | Owner, Admin (ghi: Admin) |
| `/branches/:branchId` | Header: tên, domain, agent, trạng thái, chi nhánh chính. Tabs: **Tổng quan** (KPI theo múi giờ chi nhánh + biểu đồ + phục vụ tại chỗ) · **Thông tin** (sửa hồ sơ, domain, dịch vụ, múi giờ, đặt chính, dừng/mở/xoá) · **Thành viên** (chỉ đọc) · **Thuế & thanh toán** (chỉ đọc) · **Giao dịch** · **Nhật ký** | Owner, Admin (ghi: Admin) |
| `/audit` | Nhật ký toàn hệ, lọc agent/chi nhánh/hành động/người làm/khoảng ngày | Owner, Admin |
| `/system` | Quản trị viên (danh sách, thêm, gỡ), Pause/Unpause, chuyển owner hai bước, nguồn vai trò agent (đọc), tra quyền ghi FullDB (`canWrite(writer, kind)`), tra/đặt poster Ledger (`posterKinds`, `setPoster` với hộp chọn loại bút toán) | **Chỉ Owner** |

### Màn hình — app `agent`

| Route | Nội dung | Chủ agent | Manager |
|---|---|---|---|
| `/` Tổng quan | Như tổng quan nền tảng nhưng phạm vi agent (owner) hoặc chi nhánh được quản lý (manager; nhiều chi nhánh thì cộng và cho lọc). Bảng so sánh chi nhánh. Dư nợ ví khách (owner) | ✓ | ✓ (chi nhánh của mình) |
| `/branches` | Bảng chi nhánh (owner: tất cả; manager: của mình) | ✓ | ✓ |
| `/branches/:branchId` | Tabs Tổng quan · Thông tin (chỉ đọc — admin quản lý) · Thành viên · Thuế & thanh toán · Giao dịch · Nhật ký | ✓ | ✓ nếu là chi nhánh của mình |
| `/staff` | Thành viên theo chi nhánh: cấp/đổi/thu Manager và Staff (owner); cấp Staff cho ví chưa có vai trò, thu Staff (manager). Manager tự rời chi nhánh (hộp xác nhận) | ✓ | ✓ (giới hạn) |
| `/settings` | Thuế agent NET/IQR, ghi đè/xoá ghi đè theo chi nhánh, kiểu giá IQR (NET khoá "đã gồm"), phương thức thanh toán agent và từng chi nhánh (checkbox, mặc định Tiền mặt + Ví) | ✓ ghi | chỉ đọc |
| `/wallets` | Dư nợ ví khách (owner); tra một ví khách → số dư, túi theo chi nhánh | ✓ | ✓ (chỉ tra) |
| `/transactions` | Bút toán sổ, lọc chi nhánh/loại/khách/nhân viên/ca/khoảng ngày; chi tiết bút toán (phần chia túi, lý do, bút toán gốc) | ✓ | ✓ (chi nhánh của mình) |
| `/audit` | Nhật ký của agent / chi nhánh | ✓ | ✓ (chi nhánh của mình) |

Mọi hành động ghi: nút bị khoá kèm lý do khi điều kiện không đủ (agent không Active, chi nhánh không Active, hệ pause, sai vai trò); sau khi ký thành công → toast + làm mới query liên quan; lỗi custom error giải mã thành câu tiếng Việt (mở rộng `errors.ts` cho lỗi của `SalesSettings`, `Ledger`).

## Review Focus

1. Ví vừa là chủ agent A vừa là Manager ở agent B → app `agent` hiện hai ngữ cảnh, dữ liệu không trộn (Task 7).
2. Khoảng ngày > 93 ngày → chia nhiều lần `rollup`, tổng đúng bằng cộng tay (Task 2).
3. Chi nhánh khác múi giờ (ví dụ UTC−5) → tổng quan chi nhánh dùng ngày của chi nhánh, tổng quan agent dùng UTC+7; không mất ngày ở biên (Task 2).
4. `rollup` trả toàn 0 (chưa có poster) → màn hiển thị trạng thái rỗng, không lỗi chia cho 0 hay NaN% (Task 3).
5. Người dùng huỷ ký hoặc giao dịch revert → nút trở lại, toast lỗi đúng, không làm mới sai dữ liệu (Task 3).

---

### Task 1: Workspace + `packages/chain` — lớp gọi contract

**Files:** tạo `frontend/package.json` (pnpm workspace), `frontend/pnpm-workspace.yaml`, `frontend/tsconfig.base.json`, `frontend/packages/chain/**`. Không sửa `web/`.

**Produces:**
- `loadAddresses(chainId?) → PlatformAddresses` (thêm `salesSettings`, `ledger`).
- Wrapper `MtnContract` (cách gọi theo web-admin mẫu): `PlatformAccessContract`, `AgentRegistryContract`, `BranchRegistryContract`, `AgentAccessContract`, `SalesSettingsContract`, `LedgerContract`, `HistoryIndexContract` — mỗi hàm view/ghi ở danh sách ABI (bỏ `initialize`, `upgradeToAndCall`, hằng số không dùng). Kiểu trả về đã chuẩn hoá (number cho id/uint ≤ 2^53, `bigint` cho số tiền và `uint256[32]`).
- `decodeLedgerRecord(bytes)`, `decodeBranchProfileRecord(bytes)`, `decodeAgentProfileRecord(bytes)`, `decodeAuditRecord(bytes)` (viem `decodeAbiParameters`, tuple khớp `src/interfaces`).
- `searchFullDB(history, agentId, kind, query) → {total, items:{docId, data}[]}` với `Query{filters, ranges, sortSlot, ascending, offset, limit≤100}`; helper term: `termAgent(id)`, `termBranch(id)`, `termKind(k)`, `termAddress(prefix, addr)` (hex thường có `0x`).
- `decodeContractError(error) → string` (chép `web/src/lib/errors.ts`, thêm mọi lỗi của `ISalesSettings`, `ILedger`).

- [x] Viết test Vitest: `normalize` (tuple mảng/obj/`{"":v}`), `loadAddresses` thiếu khoá → lỗi nêu tên `ledgerProxy`, `decodeLedgerRecord` với dữ liệu mã hoá bằng viem `encodeAbiParameters` (round-trip đủ trường, `portions` 2 phần), `termAddress('W', '0xABC…')` → chữ thường, `decodeContractError` cho `InsufficientBalance`, `MethodNotEnabled`.
- [x] Cài, chạy test đỏ → viết code → xanh. `pnpm -r build` xanh.
- [x] Commit `feat(frontend): workspace và lớp gọi contract dùng chung`.

### Task 2: `packages/chain` — doanh thu, ngày, vai trò, hook dữ liệu

**Produces:**
- `metrics.ts`: hằng chỉ số như bảng Thiết kế; `type Day = number`; `sumDays(rows: bigint[][]) → bigint[]`; `revenue(row, service: 'NET'|'IQR'|'ALL') → {gross, discount, refund, adjUp, adjDown, net, tax, taxNet}`; `cash(row) → {in:{cash,transfer,card}, out:{…}, net:{…}}`; `wallet(row) → {topup, spend, topupRefund, credit}`; `servedHere(row, service) → bigint`.
- `days.ts`: `dayOf(ts, tzMinutes)`; `rangeToDays(preset|{from,to}, tzMinutes, now) → {fromDay,toDay}`; `chunkDays(fromDay, toDay, max=93) → [from,to][]`; `dayToDate(day, tzMinutes)` để vẽ trục.
- `roles.ts`: `resolvePlatformRole(...) → {isOwner,isAdmin,isPendingOwner}`; `resolveAgentContexts(account) → Context[]` (theo Thiết kế/Vai trò).
- Hook React Query: `useRollup(scope, id, fromDay, toDay)` (tự chunk, cache theo khoá), `useAgents()` (tải hết có concurrency 8, trả `{rows, search(text), filter}`), `useAgent(id)`, `useAgentBranches(agentId)`, `useBranch(id)`, `useMembers(branchId, page)`, `useAuditLog(filter, page)`, `useLedgerEntries(agentId, filter, page)`, `useCustomerWallet(agentId, address)`, `useSalesSettings(agentId, branchIds)`, `useTx()` (bọc ghi: trạng thái pending, toast, giải mã lỗi, invalidate khoá truyền vào).

- [x] Test (giá trị chính xác):
  - `dayOf(1_767_200_399, 420) == 20_453`, `dayOf(1_767_200_400, 420) == 20_454`, `dayOf(90_000, -60) == 1` (khớp test Solidity `LedgerMetrics.t.sol`).
  - `chunkDays(0, 199)` → `[[0,92],[93,185],[186,199]]`.
  - `revenue` với hàng có NET gộp 100_000, hoàn 10_000, tăng 5_000, giảm 2_000, thuế 9_090, thuế hoàn 909 → net 93_000, taxNet 8_181; `'ALL'` cộng NET + IQR.
  - `resolveAgentContexts`: ví chủ agent 1 + Manager chi nhánh 7 của agent 2 + Staff chi nhánh 9 → 2 ngữ cảnh (owner 1; manager 2 [7]); Staff bị bỏ.
  - `useRollup` với 200 ngày gọi contract giả 3 lần và cộng đúng.
- [x] Đỏ → code → xanh. Commit `feat(frontend): công thức doanh thu, ngày kinh doanh, vai trò và hook dữ liệu`.

### Task 3: `packages/ui` — giao diện dùng chung

**Produces:** `AppShell` (sidebar theo danh sách menu truyền vào, header: chain, ví rút gọn, huy hiệu vai trò, bộ chọn ngữ cảnh tuỳ chọn, banner "Hệ đang tạm dừng"), `LoginScreen`, `NoAccessScreen`, `KpiTile` (giá trị, nhãn, so sánh kỳ trước tuỳ chọn), `RevenueChart` (recharts, cột chồng NET/IQR theo ngày, tooltip VND, chế độ sáng/tối), `RangePicker`, `ServiceFilter`, `DataTable` (cột, phân trang, rỗng, đang tải, lỗi), `ConfirmDialog` (có ô lý do 1–200 ký tự khi cần), `TxButton` (dùng `useTx`), `Money`, `Percent`, `Address` (rút gọn + copy), `StatusBadge` (agent/chi nhánh/vai trò), `EmptyState`, `ErrorState`.

- [x] Test Vitest cho hàm định dạng: `formatVnd(1234567n) == "1.234.567 ₫"` (so sánh sau khi đổi NBSP của `Intl` thành dấu cách), `formatBps(800) == "8,00%"`, `formatBps(0) == "0,00%"`; `KpiTile` với giá trị 0 và kỳ trước 0 không hiện NaN.
- [x] Commit `feat(frontend): bộ giao diện dùng chung`.

### Task 4: App `platform` — khung, Tổng quan, danh sách agent

**Files:** `frontend/apps/platform/**` (base `/platform/`, `FiaiSDK.init({ basePath: '/platform' })` theo mẫu).

- [x] Gate vai trò (Owner/Admin; khác → `NoAccessScreen`), menu: Tổng quan, Agent, Nhật ký, Hệ thống (chỉ owner).
- [x] `/` Tổng quan đủ như bảng Thiết kế; bảng xếp hạng agent dùng `useRollup(SCOPE_AGENT, id, …)` cho từng agent (concurrency 8), sắp theo `net` giảm dần.
- [x] `/agents` danh sách, tìm, lọc, phân trang, form "Tạo agent" (kiểm dữ liệu như `web/src/lib/validate.ts`: tên 1–100, địa chỉ ≤ 200, ghi chú ≤ 500, SĐT theo `TextRules.isPhone`, dịch vụ hợp lệ theo `ServiceMask`).
- [x] Test Vitest: lọc/tìm agent (tên không dấu/có dấu, SĐT, id, địa chỉ ví) trên dữ liệu giả 150 agent; sắp xếp xếp hạng.
- [x] Commit `feat(platform): tổng quan và danh sách agent`.

### Task 5: App `platform` — chi tiết agent và chi nhánh

- [x] `/agents/:agentId` đủ 7 tab; `/branches/:branchId` đủ 6 tab (Thiết kế). Hành động ghi của Admin: sửa hồ sơ agent/chi nhánh, dịch vụ, dừng/mở/xoá (lý do bắt buộc), đề xuất ví chủ, tạo chi nhánh (domain chữ thường, múi giờ −720…840), đặt chi nhánh chính, đổi domain, đổi múi giờ.
- [x] Owner nền tảng xem được nhưng nút ghi agent/chi nhánh bị khoá với chú thích "Chỉ Admin" (contract chỉ cho `PLATFORM_ADMIN`).
- [x] Test Vitest: bảng giao dịch giải mã đúng loại bút toán và hướng điều chỉnh (`method` 1 = tăng, 2 = giảm với `kind = Adjust`); tab Ví khách hiển thị túi theo thứ tự trả về.
- [x] Commit `feat(platform): chi tiết agent và chi nhánh`.

### Task 6: App `platform` — Hệ thống và Nhật ký

- [x] `/system` (chỉ owner) đủ như Thiết kế; pending owner thấy nút nhận quyền ở header.
- [x] `/audit` toàn hệ, lọc theo Thiết kế, mỗi dòng mở chi tiết (trước/sau giải mã được thì hiển thị, không thì hex).
- [x] Commit `feat(platform): hệ thống và nhật ký`.

### Task 7: App `agent` — khung, ngữ cảnh, Tổng quan, chi nhánh

**Files:** `frontend/apps/agent/**` (base `/agent/`).

- [ ] Ngữ cảnh và bộ chọn ngữ cảnh (Review Focus 1); Staff/không vai trò → "Không có quyền".
- [ ] `/`, `/branches`, `/branches/:branchId` như Thiết kế; Manager không truy cập được chi nhánh ngoài danh sách (vào URL trực tiếp → `NoAccessScreen`).
- [ ] Test Vitest: route guard theo ngữ cảnh; tổng quan manager nhiều chi nhánh cộng đúng.
- [ ] Commit `feat(agent): ngữ cảnh, tổng quan và chi nhánh`.

### Task 8: App `agent` — Nhân sự, Cài đặt, Ví khách, Giao dịch, Nhật ký

- [ ] `/staff` theo ma trận quyền `docs/modules/core-access.md` §3 (nút không hợp lệ thì ẩn hoặc khoá kèm lý do).
- [ ] `/settings`: đọc `agentTaxOf`, `branchTaxOf`, `isTaxExclusive`, `agentPaymentMethodsOf`, `paymentMethodsOf`; ghi `setAgentTax`, `setBranchTax`, `clearBranchTax`, `setTaxExclusive` (NET khoá), `setAgentPaymentMethods`, `setBranchPaymentMethods` (0 = theo agent). Ô xem trước `quoteTax` (nhập số tiền → thuế, khách trả).
- [ ] `/wallets`, `/transactions`, `/audit` như Thiết kế.
- [ ] Test Vitest: chuyển checkbox ↔ bitmask phương thức (`CASH|WALLET == 9`, chi nhánh "theo agent" = 0); nhập thuế `8,5%` → `850` bps, chặn > 100%.
- [ ] Commit `feat(agent): nhân sự, cài đặt, ví khách, giao dịch, nhật ký`.

### Task 9: Tài liệu và nghiệm thu

- [ ] `frontend/README.md`: cài (`@metanodejs/fiai-sdk` trỏ checkout local như `web/`), chạy hai app, biến môi trường, giới hạn đã biết (tìm agent phía client, số liệu 0 khi chưa có poster).
- [ ] `docs/04-lo-trinh.md`: thêm mốc FE 1 (hai dashboard).
- [ ] Viết `frontend/NGHIEM-THU.md`: kịch bản nghiệm thu trên chain 991 **sau khi người dùng deploy lại** (có `salesSettingsProxy`, `ledgerProxy`):
  1. Admin tạo agent A (ví X), 2 chi nhánh; tìm A theo tên, theo ví X.
  2. X mở app agent: thấy ngữ cảnh "Chủ agent A"; cấp Manager cho ví Y ở chi nhánh 1; đặt thuế IQR 8 %, ghi đè chi nhánh 2 = 10 %; bật Chuyển khoản ở agent, tắt ở chi nhánh 2.
  3. Y mở app agent: chỉ thấy chi nhánh 1; cấp Staff cho ví Z; không sửa được Cài đặt.
  4. Admin xem agent A → tab Thuế & thanh toán khớp bước 2; Nhật ký có các thao tác trên.
  5. Owner nền tảng: thêm/gỡ admin, pause → cả hai app hiện banner, nút ghi bị khoá; unpause.
  6. Dashboard mọi cấp hiển thị 0 và trạng thái rỗng (chưa có poster).
- [ ] Commit `docs(frontend): hướng dẫn và kịch bản nghiệm thu`.

## Lệnh kiểm tra

```bash
cd frontend && pnpm install && pnpm -r build && pnpm -r lint && pnpm -r test
pnpm --filter platform dev   # http://localhost:5173/platform/
pnpm --filter agent dev      # cổng khác, /agent/
```
