# 06. Cấu trúc thư mục

Mô tả từng thư mục của repo `meta-platform`: chứa gì, để làm gì, ai được ghi. Thêm hay đổi thư mục thì sửa file này cùng lúc. Nếu thay đổi chạm luật phụ thuộc thì sửa thêm `scripts/check_deps.sh`.

## 1. Toàn cảnh

```text
meta-platform/
├── src/                     mã contract (mục 2)
│   ├── core/                nền tảng: luôn có ở mọi chi nhánh, không bật/tắt
│   ├── modules/             dịch vụ bật/tắt theo chi nhánh: net, iqr, loyalty
│   ├── libraries/           logic thuần, không state
│   └── interfaces/          interface dùng chéo giữa các khối
├── test/                    test, cùng cấu trúc với src/ (mục 3)
├── script/                  script Foundry deploy/cấu hình (chỉ local/devnet)
├── abi/                     ABI JSON thuần cho client, sinh bằng `make abi` (commit)
├── deployments/             `platform-<chainid>.json` do script deploy ghi (file anvil 31337 không commit)
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

### 2.1 Tiêu chí chia `core/` và `modules/`

| Câu hỏi | Nếu "có" |
|---|---|
| Dịch vụ này **bật/tắt được theo từng chi nhánh** (`Branch.services`)? | `modules/<dịch vụ>` |
| Chi nhánh nào cũng cần, kể cả chi nhánh chỉ có NET hoặc chỉ có IQR? | `core/<khối>` |
| Logic tính toán thuần, không đọc/ghi storage? | `libraries/` |
| Chỉ là khai báo hàm/event/struct mà khối khác cần gọi? | `interfaces/` |

Trong `core/` có hai nhóm khác nhau về **người quản lý**. Ranh giới giữa hai nhóm nằm ở phân quyền (`PlatformAccess` cho tầng quản trị, `AgentAccess` cho tầng agent), không phải ở thư mục:
- **Tầng nền tảng**: `operator`, `access`, `tenant`, `registry`, `migration`. Do `PLATFORM_OWNER`/`PLATFORM_ADMIN` quản lý.
- **Tầng agent**: `staff`, `resource`, `payment`, cấu hình trong `tenant` (thuế). Do chủ agent và người được uỷ quyền quản lý.
- `ledger`, `history`, `delegate` là hạ tầng chung mà cả hai tầng và mọi module cùng dùng.

### 2.2 `src/core/`

| Thư mục | Contract dự kiến | Làm gì | Mục đích | Ai được ghi | Đặc tả / task |
|---|---|---|---|---|---|
| `operator/` | `PlatformOperator` (**hoãn**) | Gom thao tác vận hành nhiều bước (ví dụ tạo agent + chi nhánh chính) vào một giao dịch, nếu cần | Hiện mỗi registry tự kiểm `PLATFORM_ADMIN` nên chưa cần | `PLATFORM_ADMIN` | `docs/modules/core-operator.md` mục 2.1 |
| `access/` | ✅ `PlatformAccess`, ✅ `PlatformAccessed` (abstract), ✅ `AgentAccess` | `PlatformAccess`: **chỉ tầng quản trị** (`PLATFORM_OWNER`, `PLATFORM_ADMIN`) + pause toàn hệ. `PlatformAccessed`: modifier kiểm quyền và quyền nâng cấp cho mọi contract. Vai trò bên trong agent để ở `AgentAccess` (chủ agent → `Manager` → `Staff` theo chi nhánh; co-owner để sau), **tách khỏi** tầng quản trị | Một nơi trả lời "ai quản trị hệ thống", thay cho 3 vai trò admin rời rạc của hệ cũ; vai trò agent không lẫn vào | `PLATFORM_OWNER`; vai trò agent do chủ agent / quản lý | `docs/modules/core-operator.md` mục 2.2, `docs/modules/core-access.md` |
| `tenant/` | ✅ `AgentRegistry`, ✅ `BranchRegistry` | `AgentRegistry`: agent, chủ agent, trạng thái (`Active`/`Suspended`/`Deleted`), `requireAgentWritable`. `BranchRegistry`: chi nhánh, dịch vụ bật, domain, thuế, `requireWritable(branchId, service)` | Nguồn sự thật về "agent/chi nhánh nào tồn tại, đang chạy, bật dịch vụ gì". Mọi module hỏi ở đây trước khi ghi (dừng thì chỉ đọc) | `PLATFORM_ADMIN`; thuế do chủ agent | `docs/modules/core-operator.md` |
| `registry/` | `Registry` | Sổ địa chỉ các contract core và module, có version | Client và contract tra địa chỉ ở một chỗ; nâng cấp hay thêm module không phải sửa cấu hình rải rác | `PLATFORM_OWNER` | chưa lập |
| `migration/` | `Migration` | Nhập dữ liệu từ meta-iqr theo lô, idempotent, có Merkle proof; `finalize` khoá vĩnh viễn | Chuyển agent từ hệ cũ sang mà không nhập trùng, không sửa được sau khi chốt | vai trò `MIGRATOR` (thu hồi sau finalize) | `docs/03-chuyen-du-lieu.md` |
| `ledger/` | `Ledger` | Số dư xu chính (tiền nạp) và điểm; bút toán kép; `refId` chống trùng; tiền nạp gắn chi nhánh gốc để tính doanh thu | Tiền chỉ đi qua một chỗ và kiểm được bằng invariant. Tách xu chính khỏi Loyalty (hệ cũ đặt sai chỗ) | module dịch vụ được uỷ quyền | ADR 0022, chưa lập |
| `history/` | `HistoryIndex` | Cổng duy nhất ghi/đọc FullDB (precompile `0x…0107`): lịch sử, báo cáo, hồ sơ, audit, tìm kiếm có phân trang | Lịch sử nằm on-chain mà không phình storage; sửa lỗ hổng ai cũng ghi/xoá được FullDB của hệ cũ | contract được đăng ký writer | `docs/05`, `docs/legacy/50-fulldb.md`, `tasks/11` |
| `delegate/` | `DelegateRegistry` | Session wallet / ví máy trạm thay mặt khách trong thời hạn | Khách chơi net không phải ký bằng ví chính. Chỉ một chỗ giải quyết "ví này đại diện cho ai" | module NET, khách | chưa lập |
| `staff/` | `StaffRegistry`, `Attendance` | Nhân viên của chi nhánh, vai trò nghiệp vụ, ca làm, chấm công | Chi nhánh nào cũng có nhân viên. NET và IQR cùng dùng một danh sách | chủ agent, quản lý chi nhánh | luồng agent, chưa lập |
| `resource/` | `ResourceRegistry` | Khu vực, bàn, máy trạm, nhóm máy | Tài nguyên vật lý của chi nhánh; NET (máy) và IQR (bàn) dùng chung khu vực | chủ agent, quản lý chi nhánh | luồng agent, chưa lập |
| `payment/` | `PaymentAccounts` | Tài khoản nhận tiền của chi nhánh (một tài khoản có thể dùng cho nhiều chi nhánh) | Nơi tiền thật về, dùng khi nạp tiền và thanh toán | chủ agent | luồng agent, chưa lập |

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
| `core/<khối>/` | unit + fuzz test của từng khối core | Mỗi hàm, mỗi luật, mỗi lỗi custom có test |
| `modules/<module>/` | unit + fuzz test của từng dịch vụ | như trên |
| `libraries/` | test library thuần (thường là fuzz) | |
| `invariant/` | invariant test: Ledger (tổng cộng − tổng trừ = tổng số dư), RewardLedger, Tenant… | Bắt lỗi chỉ lộ ra sau chuỗi thao tác ngẫu nhiên |
| `e2e/` | kịch bản đầu cuối qua nhiều contract (tạo agent → bật dịch vụ → nghiệp vụ → dừng → chỉ đọc) | Kiểm các khối nối với nhau đúng, như người dùng thật đi qua |
| `layout/` | harness `<Tên>Layout.sol`: khai báo struct storage namespaced như biến thường | Cho `scripts/storage_layout.py` in và so layout từng trường |
| `utils/` | `BaseTest.sol` (vai trò mẫu, `deployProxy`, `installMockFullDB`), `MockFullDB.sol`, `MockServiceModule.sol` | Hạ tầng test dùng chung |
| `script/` | test script deploy (`DeployPlatform`, `DeployAgentAccess`, `SetPlatformAdmin`) | Script chạy được trong test, không cần chain |

Khung `Scaffold` đã xoá (2026-11-18) khi có khối thật đầu tiên. Harness layout của core ở `test/layout/CoreLayouts.sol`; `test/utils/PlatformFixture.sol` dựng sẵn PlatformAccess → HistoryIndex → AgentRegistry → BranchRegistry → AgentAccess cho test.

## 4. Luật phụ thuộc trong `src/`

Kiểm tự động bằng `scripts/check_deps.sh` (chạy trong `make ci`).

| Thư mục | Được import | Không được import |
|---|---|---|
| `libraries/` | — | mọi thứ khác trong `src/` |
| `interfaces/` | `libraries/` | `core/`, `modules/` |
| `core/` | `core/`, `libraries/`, `interfaces/` | `modules/` |
| `modules/net/` | `core/`, `libraries/`, `interfaces/` | `modules/iqr/`, `modules/loyalty/` |
| `modules/iqr/` | `core/`, `libraries/`, `interfaces/` | `modules/net/`, `modules/loyalty/` |
| `modules/loyalty/` | `core/`, `libraries/`, `interfaces/` | `modules/net/`, `modules/iqr/` |

Giữa các module, khi NET hay IQR cần báo cho Loyalty, nó gọi qua `interfaces/ILoyaltyHook`. Địa chỉ hook lấy từ `Registry`, và khi Loyalty tắt thì không gọi.

## 5. Thư mục khác

| Thư mục / file | Chứa gì | Mục đích |
|---|---|---|
| `script/` | `DeployPlatform.s.sol`, `DeployAgentAccess.s.sol`, `SetPlatformAdmin.s.sol` | Deploy tầng quản trị, thêm AgentAccess vào hệ đã deploy, cấp/thu admin. Không chứa khoá. Người dùng tự chạy `make deploy` / `make deploy-agent-access` / `make set-admin` |
| `abi/` | `PlatformAccess.json`, `AgentRegistry.json`, `BranchRegistry.json`, `HistoryIndex.json`, `AgentAccess.json` | Mảng ABI thuần (`make abi`), client copy. Không có bytecode |
| `deployments/` | `platform-<chainid>.json` | Địa chỉ proxy, impl, owner, admin sau deploy. `*-31337.json` (anvil) nằm trong `.gitignore` |
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
| `Makefile` | `build`, `test`, `fmt`, `sizes`, `deps`, `layout`, `snapshot`, `ci`, `legacy-inventory`, `abi`, `deploy`, `deploy-local`, `set-admin` | Một bộ lệnh chuẩn cho người và agent. `deploy` và `set-admin` chỉ người dùng chạy |
| `.gas-snapshot` | gas từng test | `forge snapshot --check` báo khi gas thay đổi ngoài ý muốn |
