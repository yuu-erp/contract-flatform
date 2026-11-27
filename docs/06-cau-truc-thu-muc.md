# 06. Cấu trúc thư mục

Mô tả từng thư mục của repo `meta-platform`: chứa gì, để làm gì, ai được ghi. Thêm hay đổi thư mục thì sửa file này cùng lúc. Nếu thay đổi chạm luật phụ thuộc thì sửa thêm `scripts/check_deps.sh`.

## 1. Toàn cảnh

```text
meta-platform/
├── src/                     mã contract (mục 2)
│   ├── kernel/              T0 rễ: quản trị nền tảng, Registry, cổng FullDB
│   ├── tenant/              T1 thân: agent, chi nhánh, vai trò, tài khoản, uỷ quyền
│   ├── shared/              T2 dùng chung: Ledger, thanh toán, quyền, ca trực, tài nguyên
│   ├── modules/             T3 dịch vụ bật/tắt theo chi nhánh: net, iqr, loyalty
│   ├── libraries/           logic thuần, không state
│   └── interfaces/          interface dùng chéo giữa các khối
├── test/                    test, cùng cấu trúc với src/ (mục 3)
├── script/                  script Foundry deploy/cấu hình (chỉ local/devnet)
├── abi/                     ABI JSON thuần cho client, sinh bằng `make abi` (commit)
├── deployments/             `platform-<chainid>.json` do script deploy ghi (file anvil 31337 không commit)
├── web/                     trang thử vai trò bằng ví MetaNode (pnpm, không nằm trong forge)
├── scripts/                 công cụ kiểm tra và tiện ích (Python/Bash)
├── storage-layouts/         snapshot storage layout để chặn nâng cấp làm hỏng dữ liệu
├── docs/                    tài liệu nghiệp vụ, kiến trúc, đặc tả (mục 5)
├── tasks/                   file bàn giao Claude ↔ Cursor
├── lib/                     thư viện (git submodule): forge-std, OpenZeppelin upgradeable
├── .github/workflows/       CI chạy `make ci`
├── foundry.toml, remappings.txt, foundry.lock, Makefile, .gas-snapshot
└── README.md, AGENTS.md, CLAUDE.md
```

Hai thư mục sinh ra khi build, không commit (`.gitignore`): `out/`, `cache/`. `cache/legacy-iqr/` là bản build meta-iqr cho công cụ kiểm kê.

## 2. `src/` — mã contract

### 2.1 Tiêu chí đặt chỗ (ADR 0029) và thư mục theo tầng (ADR 0034)

> **Thay đổi 2026-11-26:** kiến trúc chốt thành cây bốn tầng (`docs/02-kien-truc.md`). Tiêu chí cũ "chi nhánh nào cũng cần thì vào `core/`" **bỏ**. `src/core/` đã dời thành `src/kernel/` (T0), `src/tenant/` (T1), `src/shared/` (T2) (Architecture Baseline tuần 2). Chuỗi namespace ERC-7201 giữ nguyên (`metaplatform.core.*`), nên storage và proxy đã deploy không đổi.

| Câu hỏi | Nếu "có" |
|---|---|
| Logic tính toán thuần, không đọc/ghi storage? | `libraries/` |
| Chỉ là khai báo hàm/event/struct khối khác cần gọi? | `interfaces/` |
| Quản trị nền tảng, sổ địa chỉ/danh sách module, cổng lịch sử? | T0 `kernel/` |
| Agent, chi nhánh, vai trò, tài khoản, uỷ quyền ("ai, thuộc đâu, thay mặt ai")? | T1 `tenant/` |
| ≥ 2 module cần **ngay bây giờ**, diễn đạt được không cần từ nghiệp vụ riêng, **và** có ADR? | T2 `shared/` |
| Còn lại (mặc định) | T3 `modules/<module>` |

### 2.2 `src/kernel/`, `src/tenant/`, `src/shared/`

Bảng đầy đủ "contract – câu hỏi nó trả lời – trạng thái": `docs/02-kien-truc.md` mục 3. Ở đây chỉ ghi thư mục.

| Thư mục | Tầng | Contract | Ai được ghi |
|---|---|---|---|
| `kernel/access/` | T0 | ✅ `PlatformAccess`, ✅ `PlatformAccessed` (abstract: modifier quyền + quyền nâng cấp cho mọi contract) | `PLATFORM_OWNER` / `PLATFORM_ADMIN` |
| `kernel/registry/` | T0 | ✅ `Registry`: danh sách module, cầu dao, sổ địa chỉ (ADR 0030) | `PLATFORM_OWNER`; tạm dừng module: `PLATFORM_ADMIN` |
| `kernel/history/` | T0 | ✅ `HistoryIndex`, ✅ `PlatformAuditing` (abstract ghi audit) | writer được đăng ký |
| `tenant/agent/` | T1 | ✅ `AgentRegistry` | `PLATFORM_ADMIN` |
| `tenant/branch/` | T1 | ✅ `BranchRegistry` | `PLATFORM_ADMIN`; thuế do chủ agent |
| `tenant/access/` | T1 | ✅ `AgentAccess` (Manager / Staff theo chi nhánh) | chủ agent, Manager |
| `tenant/user/` | T1 | ✅ `AgentUserRegistry` (tài khoản khách và nhân viên) | chữ ký người dùng, nhân viên có quyền |
| `tenant/delegate/` | T1 | ✅ `DelegateRegistry` (ví phiên, OTP, QR) | tài khoản (chữ ký), operator (OTP) |
| `shared/ledger/` | T2 | ✅ `Ledger` + library ngoài `LedgerRecorder`, `LedgerWallet` | poster có giấy phép (ADR 0031) |
| `shared/payment/` | T2 | ✅ `SalesSettings`, `PaymentAccounts` (tài khoản nhận tiền, ca két) | chủ agent, nhân viên có quyền |
| `shared/desk/` | T2 | ✅ `CustomerDesk` (quầy khách, ADR 0035) | nhân viên có quyền |
| `shared/permission/` | T2 | ✅ `Permission` (ADR 0033) | Manager+ |
| `shared/duty/` | T2 | ✅ `Duty` (ADR 0033) | Manager+, nhân viên (vào/ra ca); trần tăng ca: chủ agent |
| `shared/resource/` | T2 | ✅ `Resource` (định danh thiết bị, ADR 0036) | Manager+ của chi nhánh |
| `migration/` | ngoài cây | `Migration` | `MIGRATOR`, thu hồi sau `finalize` |

### 2.3 `src/modules/`

Chỉ chứa **dịch vụ bật/tắt được theo chi nhánh**. Mỗi module đọc `BranchRegistry.requireWritable(branchId, <dịch vụ>)` ở đầu mọi hàm ghi.

| Thư mục | Contract dự kiến | Làm gì | Mục đích |
|---|---|---|---|
| `net/` | `NetAccount`, `StationPricing`, `NetSession`, `TopUp` | Tài khoản khách NET, bảng giá theo nhóm máy/khung giờ, phiên chơi (mở, trừ tiền định kỳ, đóng), yêu cầu nạp tiền | Dịch vụ tiệm net. Chạy được khi không bật Loyalty |
| `iqr/` | `Catalog`, `Promotion`, `Order`, `Reservation` | Thực đơn, khuyến mãi, đơn hàng theo máy trạng thái (gọi món → thanh toán PREPAID/POSTPAID → huỷ/hoàn), đặt bàn | Dịch vụ nhà hàng. Chạy được khi không bật Loyalty |
| `loyalty/` | `Membership`, `RewardLedger`, `Tier`, `Campaign`, `RewardVoucher` | Thành viên, điểm theo batch có hạn, hạng, chiến dịch, voucher đổi điểm | Module bổ trợ: chỉ bật khi chi nhánh có NET hoặc IQR. Nhận sự kiện qua `interfaces/ILoyaltyHook`, dịch vụ chính không import Loyalty |

Mỗi module có thể có `interfaces/` riêng bên trong cho interface chỉ dùng nội bộ module.

### 2.4 `src/libraries/`

Logic thuần (`library`, hàm `internal pure/view`), không giữ state, không import gì khác trong `src/`. Ví dụ: tính tiền và thuế (bps), làm tròn, phân trang, swap-pop cho danh sách có index, thời gian theo múi giờ chi nhánh, mã hoá bản ghi và term cho FullDB (`FullDBCodec`).

**Mục đích:** dùng chung giữa các khối mà không tạo phụ thuộc vòng; giữ contract nhỏ (≤ 24 KB).

### 2.5 `src/interfaces/`

Interface công khai của mọi contract (`I<Tên>.sol`): hàm, event, lỗi, struct trả về. Cùng các interface dùng chéo: `ILoyaltyHook` (dịch vụ chính báo sự kiện cho Loyalty), `IFullDB` (precompile), `IServiceModule`.

**Mục đích:**
1. Khối khác gọi qua interface, không import contract cụ thể, nên giữ được hướng phụ thuộc.
2. Client (FE, qt-core) sinh ABI từ đây (nguyên tắc 10 trong `AGENTS.md`).

## 3. `test/`

| Thư mục | Chứa gì | Mục đích |
|---|---|---|
| `kernel/`, `tenant/`, `shared/` | unit + fuzz test của từng khối nền tảng, cùng cấu trúc với `src/` | Mỗi hàm, mỗi luật, mỗi lỗi custom có test |
| `modules/<module>/` | unit + fuzz test của từng dịch vụ | như trên |
| `libraries/` | test library thuần (thường là fuzz) | |
| `invariant/` | invariant test: Ledger (tổng cộng − tổng trừ = tổng số dư), RewardLedger, Tenant… | Bắt lỗi chỉ lộ ra sau chuỗi thao tác ngẫu nhiên |
| `e2e/` | kịch bản đầu cuối qua nhiều contract (tạo agent → bật dịch vụ → nghiệp vụ → dừng → chỉ đọc) | Kiểm các khối nối với nhau đúng, như người dùng thật đi qua |
| `layout/` | harness `<Tên>Layout.sol`: khai báo struct storage namespaced như biến thường | Cho `scripts/storage_layout.py` in và so layout từng trường |
| `utils/` | `BaseTest.sol` (vai trò mẫu, `deployProxy`, `installMockFullDB`), `MockFullDB.sol`, `MockServiceModule.sol` | Hạ tầng test dùng chung |
| `script/` | test script deploy và nâng cấp (`DeployPlatform`, `DeployAgentAccess`, `SetPlatformAdmin`, `UpgradeProxy`) | Script chạy được trong test, không cần chain |

Khung `Scaffold` đã xoá (2026-11-18) khi có khối thật đầu tiên. Harness layout của core ở `test/layout/PlatformLayouts.sol`; `test/utils/PlatformFixture.sol` dựng sẵn PlatformAccess → HistoryIndex → AgentRegistry → BranchRegistry → AgentAccess cho test.

## 4. Luật phụ thuộc trong `src/`

Kiểm tự động bằng `scripts/check_deps.sh` (chạy trong `make ci`). ADR 0029, 0034.

| Thư mục | Không được import |
|---|---|
| `libraries/` | mọi thứ khác trong `src/` |
| `interfaces/` | `kernel/`, `tenant/`, `shared/`, `modules/`, `migration/` |
| `kernel/` (T0) | `tenant/`, `shared/`, `modules/`, `migration/` |
| `tenant/` (T1) | `shared/`, `modules/`, `migration/` |
| `shared/` (T2) | `modules/`, `migration/` |
| `modules/<a>/` (T3) | `modules/<b>/`, `migration/` |

**L2:** `kernel/`, `tenant/`, `shared/`, `libraries/` không được chứa hằng/tên dịch vụ (`SERVICE_NET`, `ServiceMask.IQR`…). Ngoại lệ tạm thời liệt kê trong `check_deps.sh` (nợ N1, N2), xoá khi có `Registry`.

**L5:** `scripts/check_sizes.py` (trong `make sizes`) báo contract > 20 KB; contract chưa có kế hoạch tách thì lỗi.

Giữa các module, khi NET hay IQR cần báo cho Loyalty, nó gọi qua `interfaces/ILoyaltyHook`, địa chỉ lấy từ `Registry`, gọi an toàn (ADR 0031).

## 5. Thư mục khác

| Thư mục / file | Chứa gì | Mục đích |
|---|---|---|
| `script/` | `DeployPlatform.s.sol`, `DeployAgentAccess.s.sol`, `SetPlatformAdmin.s.sol`, `UpgradeProxy.s.sol` | Deploy tầng quản trị, thêm AgentAccess vào hệ đã deploy, cấp/thu admin, nâng một proxy (xem `docs/07-deploy-va-nang-cap.md`). Không chứa khoá. Người dùng tự chạy `make deploy` / `make deploy-agent-access` / `make set-admin` / `make upgrade` |
| `abi/` | `PlatformAccess.json`, `AgentRegistry.json`, `BranchRegistry.json`, `HistoryIndex.json`, `AgentAccess.json` | Mảng ABI thuần (`make abi`), client copy. Không có bytecode |
| `deployments/` | `platform-<chainid>.json` | Địa chỉ proxy, impl, owner, admin sau deploy. `*-31337.json` (anvil) nằm trong `.gitignore` |
| `web/` | Vite + React, `pnpm` | Trang thử luồng vai trò (admin, chủ agent, quản lý, nhân viên, user). ABI và địa chỉ đọc từ `abi/` và `deployments/`, không chép. `node_modules/` và `dist/` không commit |
| `scripts/check_deps.sh` | kiểm luật mục 4 | Giữ kiến trúc không bị xói mòn |
| `scripts/storage_layout.py` | `check` / `snapshot` layout | Chặn nâng cấp làm lệch storage (lỗi hệ cũ phải có `rescueAdminAccess`) |
| `scripts/legacy/` | `inventory.py`, `check_docs.py` | Kiểm kê hệ cũ meta-iqr (GĐ0), chỉ đọc |
| `storage-layouts/` | `contracts.txt` (danh sách kiểm), `<Tên>Layout.json` (snapshot) | Đầu vào cho `storage_layout.py`; snapshot commit cùng thay đổi |
| `docs/01–06` | nghiệp vụ, kiến trúc, chuyển dữ liệu, lộ trình, lưu trữ, cấu trúc thư mục | Tài liệu nền, đọc theo thứ tự trong `README.md` |
| `docs/modules/` | đặc tả từng khối (`core-operator.md`, …) | Phải được duyệt trước khi viết mã khối đó |
| `docs/legacy/` | kiểm kê meta-iqr; `generated/` và `layout/` do script sinh | Hiểu hệ cũ để thiết kế và migrate; **không sửa tay** `generated/`, `layout/` |
| `tasks/` | file bàn giao (`00-*` GĐ0, `10-*` tầng vận hành…) | Quy trình Claude lập kế hoạch/review, Cursor triển khai (`documents/WORKFLOW.md`) |
| `lib/` | submodule `forge-std` v1.16.2, `openzeppelin-contracts-upgradeable` v5.6.1 | Không sửa; nâng version bằng `forge install` + ghi lý do |
| `.github/workflows/ci.yml` | chạy `make ci` | Mọi thay đổi phải qua: fmt, build, sizes, deps, layout, test, gas snapshot |
| `Makefile` | `build`, `test`, `fmt`, `sizes`, `deps`, `layout`, `snapshot`, `ci`, `legacy-inventory`, `abi`, `deploy`, `deploy-local`, `set-admin`, `upgrade`, `upgrade-dry`, `upgrade-local` | Một bộ lệnh chuẩn cho người và agent. `deploy`, `set-admin`, `upgrade` chỉ người dùng chạy |
| `.gas-snapshot` | gas từng test | `forge snapshot --check` báo khi gas thay đổi ngoài ý muốn |
