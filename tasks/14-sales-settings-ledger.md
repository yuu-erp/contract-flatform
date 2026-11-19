# T14 — SalesSettings + Ledger (sổ tiền, bộ đếm doanh thu) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

Trạng thái: Chờ duyệt kế hoạch (2026-11-19) · Cỡ: L · Loại: Tính năng

**Goal:** Chủ agent cài thuế, kiểu giá và phương thức thanh toán; mọi khoản tiền (nạp ví, trừ ví, bán trực tiếp, hoàn, điều chỉnh) ghi vào một Ledger bút toán kép có `refId`, số dư ví theo chi nhánh nạp, và bộ đếm theo ngày ở ba cấp chi nhánh / agent / nền tảng.

**Architecture:** Hai contract UUPS mới kế thừa `PlatformAccessed` + `PlatformAuditing`: `SalesSettings` (`core/payment`, nhận phần thuế chuyển từ `BranchRegistry`) và `Ledger` (`core/ledger`). Ledger không tự kiểm vai trò người dùng: chỉ **poster** (module do PLATFORM_OWNER đăng ký, mỗi poster một tập loại bút toán) được ghi; poster (sau này `core/payment`, NET, IQR) kiểm vai trò và ca. Bộ đếm là mảng `uint256[32]` trong storage theo `(phạm vi, id, ngày)`; bút toán chi tiết ghi FullDB kind `ledger`.

**Tech Stack:** Solidity 0.8.28, Foundry, OZ upgradeable 5.6.1, `HistoryIndex` (FullDB).

**Spec:** `docs/08-dong-tien-va-doanh-thu.md` (đã duyệt 2026-11-19). Đọc kèm `docs/05-luu-tru-du-lieu.md`, `docs/modules/core-access.md`, `docs/07-deploy-va-nang-cap.md`.

**Ngoài phạm vi (kế hoạch sau):** ca thu ngân và tài khoản nhận chuyển khoản (`core/payment` phần 2), `DelegateRegistry`, NET/IQR, phí nền tảng, trang báo cáo web.

## Global Constraints

- Quy ước chung task 10–13 vẫn áp dụng: UUPS + ERC-7201 (`metaplatform.core.<khối>`), không biến state thường, custom error, event có `uint8 version` = 1 khai báo trong interface, interface ở `src/interfaces/I<Tên>.sol`, NatSpec tiếng Anh cho hàm external.
- Mỗi contract mới: dòng `impl` trong `storage-layouts/contracts.txt`, harness `test/layout/CoreLayouts.sol` + dòng `harness`, `python3 scripts/storage_layout.py snapshot`; test slot ERC-7201 trong `test/core/access/Erc7201Slots.t.sol`.
- Contract ≤ 24 576 byte runtime (`make sizes`).
- Không vòng lặp không trần trong hàm ghi; view danh sách/khoảng có trần.
- Xu chính 1:1 VND, số tiền `uint128`. Tiền thật ngoài chain.
- Dịch vụ: `NET = 1`, `IQR = 2` (cùng hằng `ServiceMask`). Phương thức: `CASH = 1`, `TRANSFER = 2`, `CARD = 4`, `WALLET = 8`; `ALL_METHODS = 15`; mặc định agent `CASH | WALLET` (= 9).
- Thuế: `bps` 0–10000; mặc định 0; kiểu giá mặc định **đã gồm thuế**; NET chỉ được kiểu đã gồm thuế. Làm tròn xuống đến 1 đồng.
- Thuế trong một khoản đã trả `paid` luôn là `paid · bps / (10000 + bps)` (kiểu giá chỉ đổi cách module tính `paid`; xem `quoteTax`).
- Ngày kinh doanh: `day = floor((timestamp + tzOffsetMinutes·60) / 86400)` của **chi nhánh ghi nhận**.
- Bút toán không sửa/xoá; hoàn tính vào ngày hoàn; số tiền hoàn bị chặn bởi bút toán gốc / số dư.
- `make ci` xanh sau mỗi task (bỏ qua lệch `forge fmt` có sẵn ở `test/script/DeployPlatform.t.sol` nếu bản Foundry khác); `make snapshot-update` khi gas đổi.
- Commit kiểu Conventional Commits, tiếng Việt.

## Review Focus

1. Trừ ví vượt tổng số dư các túi → revert `InsufficientBalance`, không túi nào đổi (Task 4).
2. Hoàn nhiều lần từng phần vượt số gốc → lần vượt revert `RefundExceedsOriginal` (Task 6).
3. Dùng lại `refId` ở loại bút toán khác → revert `RefIdUsed` (Task 3).
4. Túi về 0 bị gỡ, khách nạp lại: thứ tự trừ vẫn là "chi nhánh phục vụ trước, rồi theo thứ tự nạp lần đầu còn lại" (Task 4).
5. Giao dịch sát nửa đêm giờ địa phương (UTC+7 lúc 16:59:59Z và 17:00:00Z) rơi đúng hai ngày khác nhau (Task 3).

---

### Task 1: SalesSettings — thuế, kiểu giá, phương thức thanh toán

**Files:**
- Create: `src/interfaces/ISalesSettings.sol`, `src/core/payment/SalesSettings.sol`, `test/core/payment/SalesSettings.t.sol`, `docs/modules/core-sales-settings.md`
- Modify: `test/utils/PlatformFixture.sol` (deploy + writer kind `platform_audit`), `test/layout/CoreLayouts.sol`, `storage-layouts/contracts.txt`, `test/core/access/Erc7201Slots.t.sol`

**Interfaces:**
- Consumes: `IAgentRegistry.requireAgentWritable(uint64) returns (uint16)`, `IAgentRegistry.getAgent(uint64).owner`, `IBranchRegistry.getBranch(uint64)`, `PlatformAuditing._writeAudit`.
- Produces (`ISalesSettings`):
  - hằng `CASH=1, TRANSFER=2, CARD=4, WALLET=8, ALL_METHODS=15, DEFAULT_METHODS=9, MAX_TAX_BPS=10000`
  - `initialize(address access, address agents, address branches, address history)`
  - ghi (chủ agent, `whenNotPaused`): `setAgentTax(uint64 agentId, uint16 service, uint16 bps)`, `setBranchTax(uint64 branchId, uint16 service, uint16 bps)`, `clearBranchTax(uint64 branchId, uint16 service)`, `setTaxExclusive(uint64 agentId, uint16 service, bool exclusive)`, `setAgentPaymentMethods(uint64 agentId, uint8 methods)`, `setBranchPaymentMethods(uint64 branchId, uint8 methods)` (`0` = theo agent)
  - đọc: `taxOf(uint64 branchId, uint16 service) returns (uint16)`, `agentTaxOf(uint64,uint16) returns (uint16)`, `branchTaxOf(uint64,uint16) returns (bool isSet, uint16 bps)`, `isTaxExclusive(uint64 agentId, uint16 service) returns (bool)`, `quoteTax(uint64 branchId, uint16 service, uint128 amount) returns (uint16 bps, bool exclusive, uint128 tax, uint128 total)`, `agentPaymentMethodsOf(uint64 agentId) returns (uint8)`, `paymentMethodsOf(uint64 branchId) returns (uint8)`, `requireMethod(uint64 branchId, uint8 method) view`
  - lỗi: `ZeroAddress, NotAgentOwner(address,uint64), BranchNotActive(uint64), InvalidService(uint16), TaxTooHigh(uint16), TaxModeNotAllowed(uint16), InvalidMethods(uint8), MethodsNotAllowed(uint64,uint8), MethodNotEnabled(uint64,uint8)`
  - event: `TaxChanged(uint8 version, uint64 indexed agentId, uint64 indexed branchId, uint16 service, uint16 oldBps, uint16 newBps, bool isSet, address by)` (giữ nguyên chữ ký cũ của BranchRegistry), `TaxModeChanged(uint8, uint64 indexed agentId, uint16 service, bool exclusive, address by)`, `PaymentMethodsChanged(uint8, uint64 indexed agentId, uint64 indexed branchId, uint8 oldMethods, uint8 newMethods, address by)`

Luật: ghi chỉ chủ agent của đúng agent, agent `Active` (qua `requireAgentWritable`), hàm cấp chi nhánh cần chi nhánh `Active`; `service ∈ {NET, IQR}`; `setTaxExclusive(_, NET, true)` revert `TaxModeNotAllowed(NET)`; `methods` agent khác 0 và `⊆ ALL_METHODS`; `methods` chi nhánh `0` hoặc `⊆` tập hiệu lực của agent. `paymentMethodsOf(b)` = (`branch == 0 ? agentEff : branch`) `&` agentEff, với `agentEff = stored == 0 ? DEFAULT_METHODS : stored`. `requireMethod` revert nếu `method` không phải đúng một bit hoặc không nằm trong `paymentMethodsOf`. `quoteTax`: đã gồm → `tax = amount·bps/(10000+bps)`, `total = amount`; chưa gồm → `tax = amount·bps/10000`, `total = amount + tax`. Mỗi lần ghi phát event và audit `sales_<tax|tax_mode|methods>` (nhãn như `PlatformAuditing`).

- [ ] **Step 1: Viết test (thất bại)** `test/core/payment/SalesSettings.t.sol` (kế thừa `PlatformFixture`, agent `NET|IQR`, hai chi nhánh `b1`, `b2`):

```solidity
function test_tax_agentDefaultAndBranchOverride() // setAgentTax(a, IQR, 800); setBranchTax(b2, IQR, 1000)
    // taxOf(b1, IQR) == 800; taxOf(b2, IQR) == 1000; clearBranchTax(b2, IQR) → taxOf(b2, IQR) == 800
function test_tax_onlyAgentOwner()          // admin, owner nền tảng, Manager → NotAgentOwner
function test_tax_rules()                   // service 4 → InvalidService(4); bps 10001 → TaxTooHigh(10001); chi nhánh Suspended → BranchNotActive
function test_taxMode_netOnlyInclusive()    // setTaxExclusive(a, NET, true) → TaxModeNotAllowed(1); IQR true → isTaxExclusive == true
function test_quoteTax()                    // bps 800: đã gồm, 108_000 → (800,false,8_000,108_000); chưa gồm, 100_000 → (800,true,8_000,108_000);
                                            // bps 1000, đã gồm, 100_000 → tax 9_090 (làm tròn xuống)
function test_methods_defaultCashWallet()   // paymentMethodsOf(b1) == 9; requireMethod(b1, CASH) ok; requireMethod(b1, TRANSFER) → MethodNotEnabled(b1, 2)
function test_methods_branchSubsetOfAgent() // agent 15; branch b2 = CASH → paymentMethodsOf(b2) == 1; branch 16 → InvalidMethods(16);
                                            // agent 9 rồi branch TRANSFER → MethodsNotAllowed(b2, 2)
function test_methods_shrinkAgentHidesBranchBits() // agent 15, b2 = 3; agent → 9 ⇒ paymentMethodsOf(b2) == 1
function test_requireMethod_rejectsMultiBit()      // requireMethod(b1, 9) → MethodNotEnabled(b1, 9)
function test_emitsAndAudits()              // expectEmit TaxChanged/PaymentMethodsChanged; search platform_audit X="sales_tax" total 1
```

- [ ] **Step 2:** `forge test --match-path test/core/payment/SalesSettings.t.sol` → FAIL (chưa có contract).
- [ ] **Step 3:** Viết `ISalesSettings` và `SalesSettings` (namespace `metaplatform.core.payment.settings`; storage: `agents, branches, history`, `agentTax[agentId][service]`, `branchTaxPlusOne[branchId][service]`, `taxExclusive[agentId][service]`, `agentMethods[agentId]` (0 = mặc định), `branchMethods[branchId]` (0 = theo agent)). Thêm vào `PlatformFixture`: proxy `salesSettings`, `setWriter` + `setWriterKind(salesSettings, "platform_audit")`. Layout harness + slot test.
- [ ] **Step 4:** Test task chạy PASS; `make build sizes layout` xanh.
- [ ] **Step 5:** Viết `docs/modules/core-sales-settings.md` (vai trò, luật, bảng hàm, dữ liệu; nguồn: spec mục 4.4). Commit `feat(payment): SalesSettings — thuế, kiểu giá, phương thức thanh toán`.

---

### Task 2: Gỡ thuế khỏi BranchRegistry, nối SalesSettings vào deploy

**Files:**
- Modify: `src/core/tenant/BranchRegistry.sol`, `src/interfaces/IBranchRegistry.sol`, `test/core/tenant/BranchRegistry.t.sol` (bỏ test thuế), `test/e2e/PlatformAdminFlow.t.sol` (thuế đọc từ `salesSettings`), `script/DeployPlatform.s.sol` (+ `salesSettingsProxy/Impl`), `script/UpgradeProxy.s.sol` (tên `SalesSettings` → khoá `salesSettings`), `test/script/DeployPlatform.t.sol`, `test/script/UpgradeProxy.t.sol`, `Makefile` (`abi`), `docs/modules/core-operator.md`, `docs/07-deploy-va-nang-cap.md`

**Interfaces:**
- Consumes: Task 1 `ISalesSettings`.
- Produces: `DeployPlatform.Deployed.salesSettingsProxy`, `.salesSettingsImpl`; `BranchRegistry` không còn `setAgentTax`, `setBranchTax`, `clearBranchTax`, `taxOf`, `agentTaxOf`, `branchTaxOf`, `TaxChanged`, `TaxTooHigh`, `InvalidService` (chỉ `_checkTax` dùng), `MAX_TAX_BPS`.

Giữ nguyên hai trường storage `agentTax`, `branchTaxPlusOne` trong `BranchesStorage` (ghi chú "không dùng, thuế ở SalesSettings") để `storage_layout.py check` không báo xoá trường.

- [ ] **Step 1:** Sửa test: `test_deploy_ownerWritersAdminAndCreateAgent` thêm `assertTrue(history.canWrite(d.salesSettingsProxy, "platform_audit"))`, `assertEq(SalesSettings(d.salesSettingsProxy).paymentMethodsOf(b), 9)` sau khi tạo chi nhánh; `UpgradeProxyTest.test_keyOf` thêm `assertEq(up.keyOf("SalesSettings"), "salesSettings")` và đưa vào vòng nâng cấp; e2e đặt thuế qua `salesSettings`.
- [ ] **Step 2:** `forge test` → FAIL ở các test trên.
- [ ] **Step 3:** Gỡ thuế khỏi `BranchRegistry`/`IBranchRegistry`; thêm `SalesSettings` vào `DeployPlatform.deploy` (sau `AgentAccess`; writer + kind `platform_audit`), `_write` JSON, `UpgradeProxy.keyOf/newImpl`, `make abi` (`SalesSettings.json`).
- [ ] **Step 4:** `make ci` xanh; `make sizes` cho thấy `BranchRegistry` nhỏ đi (ghi số).
- [ ] **Step 5:** Sửa tài liệu (core-operator: thuế chuyển sang SalesSettings; 07: bảng contract thêm dòng). Commit `refactor(tenant): chuyển thuế sang SalesSettings`.

---

### Task 3: Ledger — khung, poster, nạp ví, bộ đếm, FullDB

**Files:**
- Create: `src/interfaces/ILedger.sol`, `src/core/ledger/Ledger.sol`, `src/libraries/LedgerMetrics.sol`, `test/core/ledger/Ledger.t.sol`, `test/utils/MockLedgerPoster.sol`, `test/libraries/LedgerMetrics.t.sol`
- Modify: `test/utils/PlatformFixture.sol`, `test/layout/CoreLayouts.sol`, `storage-layouts/contracts.txt`, `test/core/access/Erc7201Slots.t.sol`

**Interfaces:**
- Consumes: `IBranchRegistry.getBranch` (agentId, status, tzOffsetMinutes), `IBranchRegistry.requireWritable(uint64,uint16)`, `IAgentRegistry.requireAgentWritable`, `ISalesSettings.requireMethod`, `ISalesSettings.taxOf`, `IHistoryIndex.append`.
- Produces (`ILedger`):
  - `enum EntryKind { None, Topup, WalletSpend, DirectSale, TopupRefund, SaleRefund, Adjust }`
  - `struct Ctx { bytes32 refId; uint64 branchId; address actor; uint64 shiftId; }`
  - `struct Entry { EntryKind kind; uint8 method; uint16 service; uint16 taxBps; uint64 branchId; address customer; uint128 amount; uint128 refunded; }`
  - `struct Portion { uint64 branchId; uint128 amount; }`
  - hằng `MAX_BUCKETS = 16`, `MAX_RANGE_DAYS = 93`, `SCOPE_PLATFORM = 0`, `SCOPE_AGENT = 1`, `SCOPE_BRANCH = 2`, `KIND_LEDGER = "ledger"`
  - `initialize(address access, address agents, address branches, address settings, address history)`
  - `setPoster(address poster, uint8 kindsMask)` (PLATFORM_OWNER; bit `1 << uint8(kind)`), `posterKinds(address) returns (uint8)`
  - `topup(Ctx calldata ctx, address customer, uint8 method, uint128 amount)`
  - đọc: `balanceOf(uint64 agentId, address customer) returns (uint128)`, `bucketsOf(uint64 agentId, address customer) returns (Portion[] memory)`, `walletLiability(uint64 agentId) returns (uint256)`, `entryOf(bytes32 refId) returns (Entry memory)`, `portionsOf(bytes32 refId) returns (Portion[] memory)`, `dayOf(uint64 branchId, uint256 timestamp) returns (uint32)`, `rollup(uint8 scope, uint64 id, uint32 fromDay, uint32 toDay) returns (uint256[32][] memory)`
  - lỗi: `ZeroAddress, ZeroAmount, ZeroRefId, NotPoster(address,EntryKind), RefIdUsed(bytes32), InvalidMethod(uint8), TooManyBuckets(uint64,address), InsufficientBalance(uint128,uint128), InvalidRange(), UnknownEntry(bytes32), RefundExceedsOriginal(uint128,uint128), WrongBranch(uint64,uint64), InvalidService(uint16), InvalidReason()`
  - event `Posted(uint8 version, uint64 indexed agentId, uint64 indexed branchId, bytes32 indexed refId, EntryKind kind, address customer, uint16 service, uint8 method, uint128 amount, uint128 tax, address actor, uint64 shiftId)`, `PosterSet(uint8 version, address indexed poster, uint8 kindsMask)`
- `LedgerMetrics` (library, hằng chỉ số trong `uint256[32]`): `CASH_IN = 0` (+ vị trí bit phương thức: CASH 0, TRANSFER 1, CARD 2), `CASH_OUT = 3` (+ như trên), `WALLET_TOPUP = 6`, `WALLET_SPEND = 7`, `WALLET_TOPUP_REFUND = 8`, `WALLET_CREDIT = 9`, `SERVICE_BASE = 10`, `SERVICE_STRIDE = 8`, offset trong mỗi dịch vụ: `GROSS 0, DISCOUNT 1, REFUND 2, ADJ_UP 3, ADJ_DOWN 4, TAX 5, TAX_REFUND 6, SERVED_HERE 7`; hàm `methodIndex(uint8 method) returns (uint256)` (CASH→0, TRANSFER→1, CARD→2, khác revert), `serviceMetric(uint16 service, uint256 offset) returns (uint256)` (NET→10+off, IQR→18+off), `day(uint256 ts, int16 tzMinutes) returns (uint32)`.

Storage (namespace `metaplatform.core.ledger`): `agents, branches, settings, history`; `posters[address] → uint8`; `entries[refId] → Entry`; `portions[refId] → Portion[]`; `wallets[agentId][customer] → Portion[]` (túi theo thứ tự nạp lần đầu; gỡ túi về 0 bằng **dịch trái**, không swap-pop, để giữ thứ tự); `liability[agentId] → uint256`; `rollups[key] → uint256[32]`, `key = uint256(scope) << 128 | uint256(id) << 64 | day`.

`topup`: poster có bit `Topup`; `refId ≠ 0` và chưa dùng; `amount > 0`; `customer ≠ 0`; `method ∈ {CASH, TRANSFER, CARD}` (khác → `InvalidMethod`) và `settings.requireMethod(branchId, method)`; chi nhánh `Active` + `agents.requireAgentWritable`; cộng túi `ctx.branchId` (túi mới ở cuối, quá 16 → `TooManyBuckets`); `liability += amount`; bộ đếm ở ngày của chi nhánh: `CASH_IN+idx` và `WALLET_TOPUP` ở cả ba phạm vi; lưu `Entry`; phát `Posted`; ghi FullDB `append(agentId, "ledger", abi.encode(LedgerRecord), terms, values)` với terms `B<branchId>`, `K<uint8 kind>`, `S<actor hex>`, `W<customer hex>` (nếu ≠ 0), `C<shiftId>` (nếu ≠ 0); values slot 0 = timestamp, 1 = amount, 2 = day. `LedgerRecord` (khai báo trong `ILedger`): `{uint8 version; EntryKind kind; bytes32 refId; bytes32 originalRefId; uint64 agentId; uint64 branchId; address customer; uint16 service; uint8 method; uint128 amount; uint128 discount; uint128 tax; Portion[] portions; address actor; uint64 shiftId; string reason; uint64 timestamp;}`.

`rollup`: `fromDay ≤ toDay`, `toDay − fromDay < 93`, khác → `InvalidRange`.

- [ ] **Step 1: Viết test (thất bại)** — `MockLedgerPoster` chuyển tiếp mọi hàm ghi của Ledger (đăng ký trong fixture với `kindsMask = 0x7E`):

```solidity
// LedgerMetrics.t.sol
function test_day_utc7Boundary()      // day(1_767_200_399, 420) == 20_453; day(1_767_200_400, 420) == 20_454  (2025-12-31 23:59:59 / 2026-01-01 00:00:00 +07)
function test_day_negativeTz()        // day(86_399 + 3_600, -60) == 0; day(86_400 + 3_600, -60) == 1  (UTC−1)
function test_serviceMetric()         // serviceMetric(NET, TAX) == 15; serviceMetric(IQR, SERVED_HERE) == 25; serviceMetric(4, 0) revert
// Ledger.t.sol
function test_topup_creditsBucketAndRollups() // topup(b1, alice, CASH, 100_000):
    // balanceOf == 100_000; bucketsOf == [(b1,100_000)]; walletLiability == 100_000
    // rollup(BRANCH,b1,d,d)[0][CASH_IN] == 100_000 và [WALLET_TOPUP] == 100_000; cùng số ở AGENT và PLATFORM
function test_topup_rejects()         // refId 0 → ZeroRefId; amount 0 → ZeroAmount; method WALLET → InvalidMethod(8);
                                      // TRANSFER chưa bật → MethodNotEnabled; poster lạ → NotPoster(stranger, Topup); chi nhánh Suspended → revert
function test_refId_usedOnceAcrossKinds() // topup refId R rồi topup R → RefIdUsed(R)  (Task 5 thêm: directSale R → RefIdUsed)
function test_topup_dayBoundary()     // warp 2025-12-31T16:59:59Z topup 1; warp +1s topup 2 → hai ngày khác nhau, mỗi ngày 1 bút toán
function test_buckets_cap16()         // 16 chi nhánh nạp → ok; chi nhánh 17 → TooManyBuckets
function test_topup_writesFullDB()    // search(agentId,"ledger", filter K=1) total 1; decode LedgerRecord.amount == 100_000, actor == poster's actor
function test_rollup_rangeLimit()     // rollup(.., 0, 93) → InvalidRange; (5, 4) → InvalidRange; (0, 92) length 93
function test_setPoster_onlyOwner()   // admin → NotPlatformOwner
function test_whenPaused()            // pause → topup revert EnforcedPause
```

- [ ] **Step 2:** Chạy `forge test --match-path 'test/**/Ledger*'` → FAIL.
- [ ] **Step 3:** Viết `LedgerMetrics`, `ILedger`, `Ledger` (khung + `topup` + view), `MockLedgerPoster`; fixture: proxy `ledger`, `setWriter` + `setWriterKind(ledger, "ledger")`, `ledger.setPoster(address(poster), 0x7E)`. Layout + slot test.
- [ ] **Step 4:** Test PASS; `make sizes` (ghi số byte Ledger).
- [ ] **Step 5:** Commit `feat(ledger): khung Ledger, nạp ví, bộ đếm ngày ba cấp`.

---

### Task 4: Ledger — trừ ví (`walletSpend`) theo túi, doanh thu, thuế, phục vụ tại chỗ

**Files:** Modify `src/core/ledger/Ledger.sol`, `src/interfaces/ILedger.sol`; Test `test/core/ledger/LedgerSpend.t.sol`

**Interfaces:**
- Produces: `walletSpend(Ctx calldata ctx, address customer, uint16 service, uint128 amount, uint128 discount)`.

Luật: poster có bit `WalletSpend`; `branches.requireWritable(ctx.branchId, service)` (chi nhánh **phục vụ** B); `settings.requireMethod(B, WALLET)`; `service ∈ {NET, IQR}`; đủ số dư (thiếu → `InsufficientBalance(balance, amount)`, không đổi gì). Thứ tự trừ: túi `B` trước (nếu có), rồi các túi còn lại theo thứ tự trong mảng. Túi về 0 bị gỡ (dịch trái). `bps = settings.taxOf(B, service)`; với mỗi phần `(A, x)`: thuế phần = `x·bps/(10000+bps)`. Bộ đếm (ngày của A cho phần của A): ở cả ba phạm vi `WALLET_SPEND += x`, `serviceMetric(GROSS) += x`, `serviceMetric(TAX) += thuế phần`; `serviceMetric(DISCOUNT) += discount` tính một lần ở phạm vi của túi đầu tiên bị trừ; nếu `A ≠ B`: `serviceMetric(SERVED_HERE) += x` **chỉ ở phạm vi chi nhánh B**. `liability -= amount`. Lưu `Entry{kind WalletSpend, method WALLET, service, taxBps: bps, branchId: B, customer, amount, refunded 0}` và `portions[refId]` theo thứ tự trừ. `Posted.tax` = tổng thuế các phần.

Ghi chú quyết định (đưa vào `docs/modules/core-ledger.md` ở Task 7): doanh thu ghi cho chi nhánh nạp A (spec câu 8), thuế dùng mức của chi nhánh phục vụ B; `GROSS` là số khách trả (đã gồm thuế), doanh thu thuần = `GROSS − REFUND + ADJ_UP − ADJ_DOWN`, `DISCOUNT` chỉ để xem (khoản đã giảm cho khách, không nằm trong `GROSS`).

- [ ] **Step 1: Viết test (thất bại)**

```solidity
function test_spend_servedBranchFirst()   // nạp b1 50k, b2 30k; spend tại b2 40k NET
    // bucketsOf == [(b1,40_000)]; portionsOf(R) == [(b2,30_000),(b1,10_000)]
    // rollup BRANCH b2: NET GROSS 30_000, SERVED_HERE 10_000; BRANCH b1: NET GROSS 10_000, SERVED_HERE 0
    // AGENT: NET GROSS 40_000, SERVED_HERE 0; walletLiability == 40_000
function test_spend_fifoAfterServed()     // nạp b1 10k, b3 10k, b2 10k; spend tại b2 25k → portions [(b2,10k),(b1,10k),(b3,5k)]
function test_spend_insufficientNoChange()// số dư 20k, spend 20_001 → InsufficientBalance(20_000, 20_001); bucketsOf, rollup không đổi
function test_spend_refillKeepsOrder()    // nạp b1, b3; spend hết b1 (túi gỡ); nạp b1 lại → bucketsOf == [(b3,..),(b1,..)]
function test_spend_tax()                 // taxOf(b2, IQR) = 800; spend 108_000 IQR tại b2 → Posted.tax == 8_000, AGENT IQR TAX == 8_000
function test_spend_discountOnce()        // spend 40k discount 5k qua hai túi → AGENT NET DISCOUNT == 5_000
function test_spend_rejects()             // service 4 → InvalidService(4); WALLET tắt ở b2 → MethodNotEnabled(b2, 8); NET tắt ở b2 → ServiceNotEnabled
function test_invariant_liabilityEqualsBuckets() // sau chuỗi trên: walletLiability == Σ balanceOf các khách
```

- [ ] **Step 2:** Chạy → FAIL.
- [ ] **Step 3:** Cài `walletSpend`.
- [ ] **Step 4:** Test PASS; `make sizes`.
- [ ] **Step 5:** Commit `feat(ledger): trừ ví theo túi chi nhánh, doanh thu và thuế`.

---

### Task 5: Ledger — bán trực tiếp và điều chỉnh

**Files:** Modify `Ledger.sol`, `ILedger.sol`; Test `test/core/ledger/LedgerSale.t.sol`

**Interfaces:**
- Produces: `directSale(Ctx calldata ctx, address customer, uint16 service, uint8 method, uint128 amount, uint128 discount)`; `adjust(Ctx calldata ctx, uint16 service, bool increase, uint128 amount, string calldata reason)`.

Luật `directSale`: poster bit `DirectSale`; `requireWritable(branch, service)`; `method ∈ {CASH,TRANSFER,CARD}` và `requireMethod`; `customer` được `0`; thuế = `amount·bps/(10000+bps)` với `bps = taxOf(branch, service)`; bộ đếm ba phạm vi: `CASH_IN+idx += amount`, `GROSS += amount`, `TAX += thuế`, `DISCOUNT += discount`. Lưu `Entry` (`portions` rỗng).
Luật `adjust`: poster bit `Adjust`; `requireWritable(branch, service)`; `reason` 1–200 byte (khác → `InvalidReason`); chỉ chỉnh doanh thu (không đụng ví, không đụng tiền thu) [quyết định: điều chỉnh ví sẽ tạo tiền từ không]; bộ đếm ba phạm vi `ADJ_UP` hoặc `ADJ_DOWN` của dịch vụ. Lưu `Entry{kind Adjust}`; FullDB record có `reason`.

- [ ] **Step 1: Viết test (thất bại)**

```solidity
function test_directSale_cashCounts()  // directSale(b1, 0x0, IQR, CASH, 216_000, 0), taxOf IQR 800 → BRANCH b1 CASH_IN 216_000, IQR GROSS 216_000, IQR TAX 16_000; WALLET_* = 0
function test_directSale_rejects()     // method WALLET → InvalidMethod(8); TRANSFER chưa bật → MethodNotEnabled
function test_refId_usedOnceAcrossKinds_sale() // topup R; directSale R → RefIdUsed(R)
function test_adjust_byService()       // adjust(b1, NET, true, 5_000, "bu gio may loi") → NET ADJ_UP 5_000; IQR không đổi
function test_adjust_requiresReason()  // reason "" → InvalidReason; reason 201 byte → InvalidReason; 200 byte → ok
```

- [ ] **Step 2:** Chạy → FAIL. **Step 3:** Cài hai hàm. **Step 4:** PASS + `make sizes`. **Step 5:** Commit `feat(ledger): bán trực tiếp và điều chỉnh doanh thu`.

---

### Task 6: Ledger — hoàn tiền nạp và hoàn bán

**Files:** Modify `Ledger.sol`, `ILedger.sol`; Test `test/core/ledger/LedgerRefund.t.sol`

**Interfaces:**
- Produces: `refundTopup(Ctx calldata ctx, address customer, uint8 method, uint128 amount)`; `refundSale(Ctx calldata ctx, bytes32 originalRefId, uint128 amount)`.

Luật `refundTopup`: poster bit `TopupRefund`; chi nhánh `Active` + agent writable; `method ∈ {CASH,TRANSFER,CARD}` + `requireMethod`; `amount ≤` túi của khách tại `ctx.branchId` (khác → `InsufficientBalance(túi, amount)`); trừ túi (về 0 thì gỡ); `liability -= amount`; bộ đếm ba phạm vi `CASH_OUT+idx += amount`, `WALLET_TOPUP_REFUND += amount`.
Luật `refundSale`: poster bit `SaleRefund`; gốc tồn tại và là `WalletSpend` hoặc `DirectSale` (khác → `UnknownEntry`); `ctx.branchId == gốc.branchId` (khác → `WrongBranch(gốc, ctx)`); `requireWritable(branch, gốc.service)`; `gốc.refunded + amount ≤ gốc.amount` (khác → `RefundExceedsOriginal(còn lại, amount)`); thuế hoàn = `amount·gốc.taxBps/(10000+gốc.taxBps)` (theo từng phần với WalletSpend).
- Gốc `DirectSale`: bộ đếm ba phạm vi `CASH_OUT + idx(gốc.method) += amount`, `REFUND += amount`, `TAX_REFUND += thuế`.
- Gốc `WalletSpend`: trả về túi theo `portionsOf(gốc)` **từ phần cuối ngược lên**. `gốc.refunded` (trước lần này) là tổng đã trả tính từ phần cuối: bỏ qua các phần cuối mà tổng đã trả phủ hết, phần đang dở nhận tiếp phần còn thiếu, rồi lần lượt các phần phía trước cho tới khi đủ `amount` (≤ 16 vòng). Cộng lại túi A (túi đã gỡ thì thêm lại cuối mảng; quá 16 → `TooManyBuckets`); `liability += amount`; bộ đếm (ngày hôm nay của A): `WALLET_CREDIT += x`, `REFUND += x`, `TAX_REFUND += thuế phần` ở ba phạm vi.
- Cập nhật `gốc.refunded += amount`; lưu `Entry{kind (TopupRefund|SaleRefund)}`; FullDB record có `originalRefId`.

- [ ] **Step 1: Viết test (thất bại)**

```solidity
function test_refundTopup_capsAtBucket()   // nạp b1 50k, b2 30k; refundTopup tại b2 30_001 → InsufficientBalance(30_000, 30_001); 30_000 → túi b2 gỡ, CASH_OUT CASH 30_000
function test_refundSale_wallet_reverse()  // spend tại b2 40k = [(b2,30k),(b1,10k)]; refundSale 15k → túi b1 +10k, b2 +5k; REFUND: b1 10k, b2 5k
function test_refundSale_partialTwice()    // directSale 100k; refund 60k ok; refund 40_001 → RefundExceedsOriginal(40_000, 40_001); refund 40k ok
function test_refundSale_wrongBranch()     // directSale tại b1; refund tại b2 → WrongBranch(b1, b2)
function test_refundSale_unknownOrTopup()  // refId lạ → UnknownEntry; gốc là Topup → UnknownEntry
function test_refundSale_taxReverse()      // IQR 800 bps, directSale 108k, refund 54k → TAX_REFUND 4_000
function test_refund_countsOnRefundDay()   // bán ngày d, warp +1 ngày, hoàn → REFUND ở d+1, ngày d không đổi
```

- [ ] **Step 2:** FAIL. **Step 3:** Cài. **Step 4:** PASS + `make sizes`. **Step 5:** Commit `feat(ledger): hoàn tiền nạp và hoàn bán`.

---

### Task 7: Bất biến, deploy, tài liệu, ngân sách

**Files:**
- Create: `test/invariant/Ledger.invariant.t.sol`, `docs/modules/core-ledger.md`
- Modify: `script/DeployPlatform.s.sol` (+ `ledgerProxy/Impl`, writer kind `ledger` + `platform_audit`), `script/UpgradeProxy.s.sol` (`Ledger` → `ledger`), `test/script/*.t.sol`, `Makefile` (`abi`: `Ledger.json`), `docs/07-deploy-va-nang-cap.md`, `docs/04-lo-trinh.md` (GĐ2: SalesSettings, Ledger xong), `docs/08-dong-tien-va-doanh-thu.md` (ghi các quyết định Task 4–6)

**Interfaces:** Consumes mọi hàm Ledger ở Task 3–6. Deploy không đăng ký poster nào (poster thật là `core/payment`, NET, IQR ở kế hoạch sau); ghi điều này trong `docs/07`.

- [ ] **Step 1:** Viết invariant (handler gọi ngẫu nhiên topup/walletSpend/directSale/adjust/refundTopup/refundSale qua `MockLedgerPoster`, 3 chi nhánh, 3 khách, `warp` ngẫu nhiên ≤ 3 ngày):

```solidity
function invariant_liabilityEqualsBuckets()   // walletLiability(agent) == Σ khách Σ túi
function invariant_walletFlowsMatchLiability()// Σ ngày AGENT (WALLET_TOPUP − WALLET_SPEND − WALLET_TOPUP_REFUND + WALLET_CREDIT) == walletLiability
function invariant_branchSumsEqualAgent()     // mọi chỉ số trừ SERVED_HERE: Σ BRANCH == AGENT; AGENT == PLATFORM (một agent)
function invariant_refundNeverExceeds()       // mọi refId handler đã dùng: entryOf.refunded ≤ entryOf.amount
function invariant_bucketsCapped()            // bucketsOf(...).length ≤ 16, không túi 0
```

- [ ] **Step 2:** `forge test --match-path test/invariant/Ledger.invariant.t.sol` → PASS (sửa Ledger nếu đỏ).
- [ ] **Step 3:** Nối deploy + upgrade + abi; test script kiểm `canWrite(ledgerProxy,"ledger")`, `keyOf("Ledger") == "ledger"`.
- [ ] **Step 4:** `make ci` xanh; `make snapshot-update`; ghi vào `docs/modules/core-ledger.md` số byte `Ledger`, `SalesSettings` và gas `topup`, `walletSpend` (2 túi), `directSale`, `refundSale`. Nếu `Ledger` > 24 576 byte: chuyển phần dựng `LedgerRecord` + gọi `HistoryIndex.append` sang library `LedgerRecords` với hàm `public` (forge tự link trong test/script), chạy lại `make ci`.
- [ ] **Step 5:** Viết `docs/modules/core-ledger.md` (vai trò poster, bảng bút toán, thứ tự túi, bộ đếm và công thức doanh thu thuần, thuế, hoàn, lỗi, gas). Commit `feat(ledger): bất biến, deploy và đặc tả`.

## Lệnh kiểm tra

```bash
forge test --match-path 'test/core/payment/**'
forge test --match-path 'test/**/Ledger*'
make ci
```
