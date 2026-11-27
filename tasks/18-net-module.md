# T18 — Module NET (module mẫu) + sửa chuẩn cắm module F1–F4 Implementation Plan

> **Người làm:** Cursor. **Người review:** Claude Code (sau **mỗi** task, trước khi sang task sau). Đánh dấu `- [ ]` khi xong. Mỗi task một commit Conventional Commits tiếng Việt, push `develop`.

Trạng thái: Giao 2026-11-26 · Cỡ: XL · Loại: Contract (Solidity) + một phần frontend (N4)

**Goal:** Cắm module dịch vụ đầu tiên (NET, `moduleId = 1`) vào nền tảng **đúng Module Contract** (ADR 0030), sau khi vá 4 lỗ hổng của chuẩn mà đặc tả NET phát hiện (F1–F4). Nếu khi làm NET thấy phải "lách" nền tảng ở đâu → **dừng, ghi vào báo cáo**, không tự sửa T0–T2 ngoài phạm vi task.

**Spec (đọc trước, theo thứ tự):**
1. `AGENTS.md` (mục "Kiến trúc chốt"), `docs/02-kien-truc.md` (4 tầng, 7 luật, checklist mục 11).
2. `docs/adr/0030-module-contract.md`, `0031-co-lap-loi.md`, `0033-mo-hinh-quyen.md`, `0035-thao-tac-nhan-vien-tren-tai-khoan.md`.
3. **`docs/modules/net.md`** — đặc tả chính của task này.
4. `docs/modules/kernel-registry.md`, `docs/modules/core-ledger.md` (mục 1 giấy phép poster), `docs/modules/shared-permission-duty.md`, `docs/modules/tenant-delegate.md`.
5. `docs/09-kich-ban-chuan.md` bước 5, 6, 10, 13, biến thể F1, F3, F4.

## Global Constraints

- Luật tầng (`scripts/check_deps.sh`): `src/modules/net/*` chỉ import `interfaces/`, `libraries/`; gọi nền tảng **qua interface**. Không import contract cụ thể của `kernel/`, `tenant/`, `shared/`. Không thêm tên "NET" vào `kernel/`, `tenant/`, `shared/`, `libraries/` (L2 — CI chặn).
- Mỗi contract UUPS + ERC-7201: namespace `metaplatform.<tầng>.<tên>` (ví dụ `metaplatform.modules.net.sessions`), harness `test/layout/PlatformLayouts.sol` (struct chính + `*RowsLayout` cho struct trong mapping), dòng `impl`/`harness` trong `storage-layouts/contracts.txt`, `python3 scripts/storage_layout.py snapshot`.
- Contract **nâng cấp** (Ledger, nếu chạm): chỉ **nối thêm** trường storage; `storage_layout.py check` phải báo "thêm trường mới", không báo đổi vị trí.
- Kích thước: mọi contract mới **≤ 20 KB** (L5). Vượt → tách library ngoài như `LedgerRecorder`.
- Không vòng lặp không trần trong hàm ghi; view danh sách phân trang.
- Tiền: chỉ `ILedger`; số tiền do NET tự tính; `refId = keccak256(abi.encode(sessionId, seq))`.
- Event có `uint8 version` đầu tiên.
- Người gọi luôn quy về tài khoản bằng `IDelegateRegistry.resolve(agentId, msg.sender)` trước khi kiểm quyền.
- `make ci` xanh trước **mỗi** commit (riêng `forge fmt --check` trên `test/script/DeployPlatform.t.sol` lệch do phiên bản Foundry — đã biết, **không** format lại file đó). Gas: `make snapshot-update` sau khi review. ABI: `make abi`.
- **Không deploy, không gửi giao dịch lên chain 991.** Diễn tập chỉ anvil (`make deploy-local`).
- Tài liệu, comment tiếng Việt; tên hàm/biến tiếng Anh.
- Mỗi task trả lời bảng "Kiểm tra kiến trúc" (`tasks/TEMPLATE.md`) trong báo cáo `tasks/18-reports/<task>.md`.

## Quyết định đã chốt cho task này

Người dùng giao việc 2026-11-26 khi đặc tả còn 6 câu hỏi (net.md mục 11). **Dùng giá trị đề xuất dưới đây làm mặc định**; tất cả là hằng số / tham số dễ đổi, người dùng có thể đổi trước review N2.

| # | Quyết định | Giá trị |
|---|---|---|
| Q1 | Đơn vị tính tiền | **phút**; giây lẻ cộng dồn sang lần sau (lưu `chargedUntil` theo giây, chỉ trừ phần đủ phút) |
| Q2 | Nhịp máy trạm / máy treo | `HEARTBEAT` 1 phút (client); `STALE = 3 phút`; `MAX_CHUNK = 10 phút` mỗi lần tính |
| Q3 | Số dư tối thiểu để mở máy | đủ **1 phút** theo giá khu hiện tại |
| Q4 | Nhân viên mở máy hộ không cần khách ký | **giữ** (quyền NET bit 0) |
| Q5 | Trần mỗi bút toán NET ở Ledger | **500.000** xu |
| Q6 | Gói giờ, đặt máy có cọc | **ngoài** T18 |
| — | Danh mục quyền NET | `permValid = 0xFF`, `permManagerOnly = 0xE0` (net.md mục 2) |

---

## Phần A — Sửa chuẩn cắm module (N0)

### Task N0a: ADR 0036 + `Resource` (T2) — F1

**Files:** `docs/adr/0036-resource.md`, `docs/adr/README.md`, `docs/02-kien-truc.md` (bảng mục 3 + mục 9), `src/interfaces/IResource.sol`, `src/shared/resource/Resource.sol`, `test/shared/resource/Resource.t.sol`, fixture, layout, `script/DeployPlatform.s.sol`, `script/UpgradeProxy.s.sol`, `Makefile` (abi).

- [x] ADR 0036 (trạng thái "Đề xuất — Claude review"): câu hỏi `Resource` trả lời "thiết bị này là gì, thuộc chi nhánh nào, module nào, khoá ký nào, còn dùng không?"; lý do vào T2 (NET máy trạm, IQR màn bếp, Enterprise máy chấm công — đủ L3).
- [x] Dữ liệu: `deviceId` (`uint64`, đếm toàn cục), `branchId`, `moduleId` (`uint8`, phải đăng ký ở Registry), `signer` (`address`, duy nhất toàn hệ), `status` (`None/Active/Disabled`), `label` (1–32 byte). Chỉ mục `signer → deviceId`, `branchId → deviceId[]` (≤ 512 / chi nhánh).
- [x] Hàm: `registerDevice(branchId, moduleId, signer, label)`, `setSigner(deviceId, signer)` (thay máy / lộ khoá), `setDeviceStatus(deviceId, status)`; quyền: Manager+ của chi nhánh (`IAgentAccess.effectiveRoleOf` sau `resolve`) — **không** dùng bit quyền module để `Resource` không phụ thuộc danh mục từng module. View: `getDevice`, `deviceOfSigner(signer)`, `devicesOf(branchId, offset, limit)`, `requireActiveDevice(signer, moduleId) returns (deviceId, branchId)` (revert nếu không Active, sai module, chi nhánh không Active).
- [x] Không biết tên module (L2). Event version 1.
- [x] Test: đăng ký / đổi khoá / vô hiệu, khoá trùng bị từ chối, sai module, Staff không đăng ký được, phân trang, `requireActiveDevice` các nhánh lỗi.
- [x] Nghiệm thu: `make ci` xanh; Resource ≤ 12 KB.

### Task N0b: Hook an toàn cho module bổ trợ — F2

**Files:** `src/interfaces/ILoyaltyHook.sol`, `src/libraries/SafeHook.sol` (hoặc `src/shared/hooks/` nếu cần state — ghi lý do), `docs/adr/0031-co-lap-loi.md` (bổ sung mục C4 chi tiết), test.

- [ ] `ILoyaltyHook.onSpend(uint8 version, uint64 agentId, uint64 branchId, address account, uint8 moduleId, bytes32 refId, uint128 amount)` — gọi khi dịch vụ chính trừ tiền xong (NET: khi **đóng phiên**, với tổng đã trừ của phiên).
- [ ] `SafeHook.call(address hook, bytes memory data, uint256 gasLimit) returns (bool ok)`: `hook == 0` → false; gọi với trần gas; nuốt mọi revert / hết gas; **không** để hook làm revert giao dịch chính (lưu ý 63/64 gas — kiểm còn đủ gas trước khi gọi).
- [ ] Người gọi phát `HookFailed(uint8 version, uint8 moduleId, address hook, bytes32 refId, bytes data)` khi `ok = false`.
- [ ] Địa chỉ hook: `IRegistry.addressOf(keccak256("hook.loyalty"))`; chỉ gọi khi chi nhánh bật Loyalty (`isServiceEnabled(branch, serviceBit(3))` — số 3 truyền từ cấu hình của NET, **không** hằng trong library) và module 3 Active.
- [ ] Test với hook giả: revert, hết gas, vòng lặp vô tận, trả bình thường → giao dịch chính luôn thành công.

### Task N0c: Ledger kiểm khai báo module ở Registry — F3

**Files:** `src/shared/ledger/Ledger.sol`, `src/interfaces/ILedger.sol`, test Ledger, `docs/modules/core-ledger.md`, `docs/adr/0031-co-lap-loi.md`.

- [ ] Ở `_newEntry`, với giấy phép `moduleId ≠ 0`: `(bool known, uint8 id) = registry.moduleOf(msg.sender)`; `!known || id != license.moduleId` → revert `ModuleMismatch(poster, licenseModule, registryModule)`.
- [ ] Fixture: `modules.setModuleContract(address(poster.net()), 1, true)`, tương tự IQR; mọi test Ledger cũ vẫn xanh.
- [ ] Test mới: poster có giấy phép nhưng chưa khai ở Registry → từ chối; khai sai module → từ chối.
- [ ] Ledger vẫn ≤ 24 KB (hiện 23.158 B — nếu vượt 20 KB thêm thì đã có kế hoạch N3, ghi số đo vào báo cáo).

### Task N0d: Quy trình cắm module — F4

**Files:** `script/DeployModule.s.sol` (abstract / thư viện dùng lại), `docs/07-deploy-va-nang-cap.md` (mục mới "Cắm module dịch vụ"), test script.

- [ ] Các bước theo thứ tự (một broadcast): deploy proxy các contract của module → `Registry.updateModule(id, …)` (danh mục quyền, cờ) → `Registry.setModuleContract` từng contract → `Ledger.setPoster(contract, id, kinds, maxAmount)` cho contract ghi tiền → `HistoryIndex.setWriter` + `setWriterKind(<tiền tố module>_*)` → (nếu có) `Registry.setAddress("hook.<module>", …)` → ghi `deployments/platform-<chainid>.json`.
- [ ] Hàm `deploy()` không đọc env (test gọi được) + `run()` đọc env (như các script hiện có).

---

## Phần B — Module NET

### Task N1: `NetCatalog`

**Files:** `src/modules/net/NetCatalog.sol`, `src/interfaces/INetCatalog.sol`, `test/modules/net/NetCatalog.t.sol`, layout, abi.

- [ ] Khu: `createZone(branchId, name, pricePerHour)`, `setZonePrice`, `setZoneWindows(zoneId, Window[] ≤ 4)` (`Window{startMin, endMin, pricePerHour}`, qua nửa đêm được), `setZoneActive`. ≤ 16 khu / chi nhánh. Quyền NET bit 5 (khu/máy), bit 6 (giá) — qua `IPermission.requirePermission(branch, actor, 1, bit)`.
- [ ] Máy: `addStation(deviceId, zoneId, label)` — `deviceId` phải Active ở `Resource`, `moduleId = 1`, cùng chi nhánh với khu; `moveStation(deviceId, zoneId)`; `setStationState(deviceId, Idle|Reserved|Maintenance)` (bit 4 bảo trì, bit 3 đặt máy). ≤ 256 máy / chi nhánh.
- [ ] `priceAt(deviceId, timestamp) returns (uint128 pricePerHour)` theo giờ địa phương chi nhánh (`tzOffsetMinutes`); khung nào chứa thời điểm thì giá khung đó, không có thì giá cơ bản.
- [ ] `NetSessions` (N2) là contract **duy nhất** được đổi trạng thái `InUse` (`setInUse(deviceId, bool)` — chỉ địa chỉ `sessions` do owner nối).
- [ ] Mọi hàm ghi: `requireWritable(branch, 1)` trước.
- [ ] Test: giá theo khung (kể cả qua nửa đêm, tz âm/dương), máy sai module / sai chi nhánh, quyền (Staff không sửa giá dù đang trực), giới hạn số lượng, NET `Paused` → mọi hàm ghi revert.

### Task N2: `NetSessions`

**Files:** `src/modules/net/NetSessions.sol`, `src/interfaces/INetSessions.sol`, test, layout, abi.

- [ ] Máy trạng thái và hàm đúng `docs/modules/net.md` mục 6: `startByCustomer`, `startByStaff`, `heartbeat`, `stop`, `stopByStaff`, `closeStale`, `move`, `refund`.
- [ ] Hàm của máy trạm (`startByCustomer`, `heartbeat`, `stop`) xác thực bằng `IResource.requireActiveDevice(msg.sender, 1)`.
- [ ] `startByCustomer`: EIP-712 domain `MetaNetNet` v1, `PlayOn(uint64 deviceId,address account,uint64 nonce,uint256 deadline)`; người ký resolve về `account` (địa chỉ đăng nhập hoặc ví phiên còn hạn); nonce theo `(agentId, account)`.
- [ ] Tính tiền: `chargeable = min(now, chargedUntil + MAX_CHUNK) − chargedUntil`; `minutes = chargeable / 60`; `amount = minutes × priceAt(...) / 60` (làm tròn xuống); `chargedUntil += minutes × 60`; `minutes == 0` → không gọi Ledger. Thiếu số dư → trừ số phút đủ tiền, đóng phiên lý do `OutOfBalance`. `closeStale`: chỉ tính tới `lastBeat + 60`.
- [ ] Đóng phiên: xoá storage; FullDB kind `net_sessions` (nhật ký); event `SessionClosed(version, …, reason, durationSec, charged)`; hook Loyalty qua `SafeHook` (N0b) với tổng đã trừ.
- [ ] Một phiên / máy, một phiên / `(agentId, account)`.
- [ ] Ngân sách gas (net.md mục 6) ghi vào báo cáo từ `forge snapshot`.
- [ ] Test unit: mọi chuyển trạng thái và mọi lỗi; phút lẻ cộng dồn; hết tiền giữa chừng; chữ ký sai người / hết hạn / dùng lại; nhân viên không trực bị từ chối; `move`; `refund` chỉ Manager, trần = đã trừ.

### Task N3: Test "module chết", invariant, đầu cuối

**Files:** `test/modules/net/NetDead.t.sol`, `test/invariant/NetSessions.invariant.t.sol`, `test/e2e/StandardScenario.t.sol` (phần NET).

- [ ] Module chết: NET `Paused` giữa phiên → `heartbeat` revert; IQR (poster giả) trừ ví được; nạp ví được; mở lại → lần tính đầu ≤ 10 phút. Loyalty hook revert / hết gas → đóng phiên vẫn thành công, có `HookFailed`.
- [ ] Invariant (handler kiểu `StaffDuty`/`Ledger`: chọn tham số luôn hợp lệ phần lớn thời gian, `afterInvariant` kiểm đã chạm đường chính): tổng `charged` = NET `GROSS` trong `Ledger.moduleRollup(…, 1, …)`; một phiên / máy / khách; không phiên nào bị tính vượt thời gian thực; số dư không âm. **Không dùng `b + 1` với tham số fuzz chưa `%`** (bài học N11).
- [ ] Đầu cuối: `docs/09` bước 5, 6, 10, 13 (chơi ở chi nhánh khác bằng ví chung → `SERVED_HERE` cho chi nhánh phục vụ).

### Task N4: Cắm NET + nối UI cyber

**Files:** `script/DeployNet.s.sol` (dùng `DeployModule`), `Makefile` (`deploy-net`, `deploy-local` cài NET), `frontend/packages/chain` (sinh contract NetCatalog/NetSessions/Resource từ ABI, Api + mock), `frontend/apps/cyber/src/data/hooks.ts` (đổi `useBranchFloor` sang chain khi có địa chỉ, giữ mock khi `VITE_PREVIEW=mock`).

- [ ] `make deploy-local` dựng đủ NET trên anvil; diễn tập kịch bản: đăng ký máy (Resource) → khu + giá → khách mở máy → heartbeat → đóng.
- [ ] UI: màn Phòng máy (Owner/Manager) đọc trạng thái máy + phiên thật; component không đổi (chỉ đổi hook). Màn chưa nối giữ dữ liệu mẫu.
- [ ] `pnpm -r build && pnpm -r lint && pnpm -r test` xanh. Không commit thay đổi `@metanodejs/fiai-sdk` trong `package.json` / lockfile.

---

## Báo cáo và review

- Mỗi task: `tasks/18-reports/<task>.md` gồm: việc đã làm, bảng kiểm tra kiến trúc, kích thước contract (`make sizes`), gas các hàm nóng, lệch so với đặc tả (nếu có, kèm lý do), câu hỏi.
- Claude review theo `docs/02` mục 11 + đặc tả; chỉ sang task sau khi review "Đạt".
- Thứ tự bắt buộc: N0a → N0b → N0c → N0d → N1 → N2 → N3 → N4.
