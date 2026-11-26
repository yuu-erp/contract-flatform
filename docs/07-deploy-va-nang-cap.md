# Hướng dẫn deploy và nâng cấp proxy

Áp dụng cho tầng quản trị: `PlatformAccess`, `HistoryIndex`, `AgentRegistry`, `BranchRegistry`, `AgentAccess`, `SalesSettings`, `Ledger`.
Mọi lệnh có `--broadcast` (`make deploy`, `make upgrade`, `make set-admin`) **chỉ người giữ khoá chạy**. Agent (Claude, Cursor) không chạy các lệnh này.

## 1. Tổng quan

Mỗi contract là một proxy `ERC1967Proxy` trỏ tới một implementation UUPS. Người dùng và client chỉ dùng địa chỉ **proxy**; implementation thay được khi nâng cấp, dữ liệu nằm ở proxy và giữ nguyên.

| Contract | Khoá trong `deployments/platform-<chainid>.json` | Ai được nâng cấp |
|---|---|---|
| `PlatformAccess` | `accessProxy`, `accessImpl` | owner của chính nó (OZ `Ownable2Step`) |
| `HistoryIndex` | `historyProxy`, `historyImpl` | `PLATFORM_OWNER` (hỏi `PlatformAccess`) |
| `AgentRegistry` | `agentsProxy`, `agentsImpl` | `PLATFORM_OWNER` |
| `BranchRegistry` | `branchesProxy`, `branchesImpl` | `PLATFORM_OWNER` |
| `AgentAccess` | `agentAccessProxy`, `agentAccessImpl` | `PLATFORM_OWNER` |
| `SalesSettings` | `salesSettingsProxy`, `salesSettingsImpl` | `PLATFORM_OWNER` |
| `Ledger` | `ledgerProxy`, `ledgerImpl` | `PLATFORM_OWNER` |
| `AgentUserRegistry` | `usersProxy`, `usersImpl` | `PLATFORM_OWNER` |

File `deployments/platform-<chainid>.json` là nguồn địa chỉ cho script và cho web (`web/src/config.ts`). Commit file này sau mỗi lần deploy/nâng cấp trên chain thật.

## 2. Chuẩn bị

```bash
git submodule update --init --recursive
```

```bash
make ci
```

`make ci` phải xanh trước khi deploy hay nâng cấp. Tạo `.env` từ mẫu:

```bash
cp .env.example .env
```

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `PRIVATE_KEY` | có | khoá của `PLATFORM_OWNER`. Không commit `.env` |
| `RPC_URL` | có | RPC chain đích (`foundry.toml` map tên `platform` tới biến này) |
| `PLATFORM_ADMIN` | không | ví admin cấp ngay lúc deploy; để trống thì cấp sau bằng `make set-admin` |
| `FULLDB` | không | địa chỉ FullDB; để trống dùng precompile `0x…0107`. **Cố định vĩnh viễn** sau deploy (không có `setFullDB`) |
| `CONTRACT`, `UPGRADE_CALL` | khi nâng cấp | xem mục 5 |

Ví owner không được là chủ agent hay thành viên chi nhánh (luật tách vai), và nên khác ví admin.

## 3. Diễn tập trên anvil

Luôn thử trên anvil trước khi đụng chain thật. Mở một terminal chạy anvil:

```bash
anvil
```

Ở terminal khác: cài `MockFullDB` vào `0x…0107` rồi deploy cả bộ bằng khoá mặc định #0 của anvil. Các lệnh kiểm ở mục 4.2 dùng `jq` và `cast`.

```bash
make deploy-local
```

Diễn tập nâng cấp một contract:

```bash
make upgrade-local CONTRACT=AgentRegistry
```

File `deployments/platform-31337.json` bị `.gitignore` bỏ qua.

## 4. Deploy hệ mới lên chain

### 4.1 Chạy

```bash
make deploy
```

Script `script/DeployPlatform.s.sol` làm, trong cùng một lượt broadcast:

1. Deploy 7 implementation và 7 proxy theo thứ tự `PlatformAccess` → `HistoryIndex` → `AgentRegistry` → `BranchRegistry` → `AgentAccess` → `SalesSettings` → `Ledger`.
2. Đăng ký writer của `HistoryIndex` và kind được ghi:

   | Writer | Kind |
   |---|---|
   | `AgentRegistry` | `platform_agents`, `platform_audit` |
   | `BranchRegistry` | `platform_branches`, `platform_audit` |
   | `AgentAccess` | `platform_audit` |
   | `SalesSettings` | `platform_audit` |
   | `Ledger` | `ledger` |

   > **Ledger chưa có poster nào sau deploy.** Script không gọi `Ledger.setPoster`: mọi hàm ghi đều revert `NotPoster` cho tới khi `PLATFORM_OWNER` cấp quyền cho module dịch vụ (`core/payment`, NET, IQR) ở kế hoạch sau. Ledger chỉ ghi kind `ledger`, không ghi `platform_audit`.

3. `AgentRegistry.setAgentAccess(agentAccessProxy)`.
4. `PlatformAccess.setAgentRoleSources([agentsProxy, agentAccessProxy])`.
5. `addPlatformAdmin(PLATFORM_ADMIN)` nếu có.
6. Ghi `deployments/platform-<chainid>.json`.

> **Cảnh báo:** bước 6 **ghi đè cả file**. Nếu chain đã có bộ cũ (ví dụ chain 991), đổi tên file cũ trước để giữ địa chỉ:
>
> ```bash
> mv deployments/platform-991.json deployments/platform-991.old-$(date +%Y%m%d).json
> ```
>
> Bộ mới là hệ khác hoàn toàn: agent, chi nhánh, vai trò, lịch sử của bộ cũ **không** tự sang. Hệ hiện chưa có dữ liệu thật nên không cần migrate.

### 4.2 Kiểm sau deploy

Đặt biến shell từ file deployments (thay `991` bằng chain id):

```bash
F=deployments/platform-991.json; ACCESS=$(jq -r .accessProxy $F); HISTORY=$(jq -r .historyProxy $F); AGENTS=$(jq -r .agentsProxy $F); AA=$(jq -r .agentAccessProxy $F)
```

```bash
cast call $ACCESS "owner()(address)" --rpc-url $RPC_URL
```

```bash
cast call $ACCESS "agentRoleSources()(address[])" --rpc-url $RPC_URL
```

```bash
cast call $AGENTS "agentAccess()(address)" --rpc-url $RPC_URL
```

```bash
cast call $HISTORY "canWrite(address,string)(bool)" $AGENTS platform_agents --rpc-url $RPC_URL
```

Kỳ vọng: owner đúng ví của bạn; nguồn vai trò là `[AGENTS, AA]`; `agentAccess` là `AA`; `canWrite` là `true`.

### 4.3 Việc sau deploy

- Cấp/thu admin: điền `ACCESS_PROXY`, `ADMIN`, `ALLOW=true|false` trong `.env`, rồi:

  ```bash
  make set-admin
  ```

- **Hệ đã deploy trước khi có người dùng theo agent** (chain 991 hiện tại): thêm `AgentUserRegistry` bằng ví owner. Script đọc địa chỉ proxy từ `deployments/platform-<chainid>.json`, đăng ký writer kind `users` + `platform_audit`, rồi ghi thêm `usersProxy`, `usersImpl`; từ chối nếu khoá đã có:

  ```bash
  make deploy-users
  ```

- Đăng ký FreeGas cho các proxy (nếu chain dùng FreeGas): đăng ký **địa chỉ proxy**, không phải implementation.
- Commit `deployments/platform-<chainid>.json`. Web đọc file này khi build.
- (Tuỳ chọn, chỉ người dùng chạy) Sinh agent giả để thử dashboard: `make seed-mock-agents` (cần `ADMIN_PRIVATE_KEY` hoặc `PRIVATE_KEY` = `PLATFORM_ADMIN`; `MOCK_AGENT_COUNT` / `MOCK_AGENT_START` tuỳ chọn). Không cần deploy `MockFullDB` trên chain có precompile FullDB `0x…0107`.

## 5. Nâng cấp một proxy

### 5.1 Luật bắt buộc (nguyên tắc 9)

- Storage namespaced ERC-7201, **chỉ nối thêm trường vào cuối struct**. Không xoá, đổi tên, đổi chỗ, đổi kiểu trường cũ. `make layout` chặn các lỗi này.
- Contract UUPS không có biến state thường, không gán giá trị trong constructor (constructor chỉ `_disableInitializers()`).
- Cần khởi tạo dữ liệu mới khi nâng thì viết hàm `reinitializer(N)` (N tăng dần, mỗi N chạy một lần) và gọi kèm qua `UPGRADE_CALL`.
- Thay đổi struct namespaced: chạy `python3 scripts/storage_layout.py snapshot`, review diff `storage-layouts/*.json`, commit cùng mã.

### 5.2 Các bước

1. `make ci` xanh trên mã sẽ nâng.
2. Diễn tập: `make deploy-local` (với mã **cũ**, ví dụ `git stash` hoặc checkout commit đang chạy), rồi quay về mã mới và `make upgrade-local CONTRACT=<Tên>`.
3. Mô phỏng trên chain thật (không gửi giao dịch, không ghi file deployments) để chắc owner, proxy và khởi tạo đều qua:

   ```bash
   make upgrade-dry CONTRACT=AgentRegistry
   ```

4. Nâng thật:

   ```bash
   make upgrade CONTRACT=AgentRegistry
   ```

   Target tự chạy `storage_layout.py check`, deploy implementation mới, gọi `upgradeToAndCall(impl, UPGRADE_CALL)` trên proxy và ghi `agentsImpl` mới vào file deployments. Tên hợp lệ: `PlatformAccess`, `HistoryIndex`, `AgentRegistry`, `BranchRegistry`, `AgentAccess`, `SalesSettings`, `Ledger`.

5. Kiểm implementation đã đổi:

   ```bash
   cast implementation $(jq -r .agentsProxy deployments/platform-991.json) --rpc-url $RPC_URL
   ```

   Kết quả phải trùng `agentsImpl` trong file.

6. Nếu ABI đổi: `make abi`, commit `abi/` cùng file deployments.

### 5.3 Nâng kèm khởi tạo (`UPGRADE_CALL`)

Ví dụ implementation mới có `function initializeV2(uint256 x) external reinitializer(2) onlyPlatformOwner`:

```bash
UPGRADE_CALL=$(cast calldata "initializeV2(uint256)" 42) make upgrade CONTRACT=AgentRegistry
```

Nâng và khởi tạo nằm trong **một giao dịch**: khởi tạo revert thì nâng cấp cũng không xảy ra.

### 5.4 Thứ tự khi nhiều contract cùng đổi

Contract gọi nhau qua interface. Nâng **bên cung cấp hàm mới trước**, bên gọi sau. Ví dụ `BranchRegistry` mới gọi một hàm mới của `AgentRegistry` thì nâng `AgentRegistry` trước. Làm ngược thì giữa hai giao dịch các hàm ghi của bên gọi revert.

Nếu bản mới cần cấu hình thêm (writer kind mới, nguồn vai trò mới…), gửi các lệnh cấu hình **ngay sau** nâng cấp, ví dụ:

```bash
cast send $HISTORY "setWriterKind(address,string,bool)" $AGENTS platform_agents true --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

### 5.4a Đợt nâng 2026-11-25: owner làm được việc của admin

Đổi quyền (không đổi storage, không đổi ABI, không cần `UPGRADE_CALL`). Thứ tự không quan trọng vì không có hàm mới:

```bash
make upgrade CONTRACT=PlatformAccess   # pause/unpause: owner hoặc admin
make upgrade CONTRACT=AgentRegistry    # tạo/sửa/xoá agent: owner hoặc admin
make upgrade CONTRACT=BranchRegistry   # tạo/sửa/xoá chi nhánh: owner hoặc admin
```

Kiểm sau nâng: mở app `platform` bằng ví owner → nút "Tạo agent" bật và tạo thử được; ví admin bấm được "Tạm dừng hệ thống".

### 5.4b Đợt nâng Architecture Baseline tuần 3 (2026-11-26): Registry + giấy phép poster

ADR 0030, 0031. **Thứ tự bắt buộc** (giữa bước 1 và bước 2, tạo agent/chi nhánh mới hoặc đổi dịch vụ sẽ báo `RegistryNotSet` — làm liền một lượt):

```bash
make upgrade CONTRACT=AgentRegistry    # thêm setRegistry; kiểm dịch vụ qua Registry
make upgrade CONTRACT=BranchRegistry   # thêm setRegistry; cầu dao module trong requireWritable
make upgrade CONTRACT=SalesSettings    # bỏ hằng NET/IQR; đọc cờ module ở Registry
make upgrade CONTRACT=Ledger           # giấy phép poster (module + trần), bộ đếm theo module; tự deploy 2 library LedgerRecorder, LedgerWallet
make deploy-registry                   # deploy Registry, khai báo 0 platform / 1 net / 2 iqr / 3 loyalty, gắn vào AgentRegistry + BranchRegistry
```

- Ledger trên 991 **chưa có poster nào** nên đổi ABI ghi không ảnh hưởng dữ liệu. Bộ đếm cũ ô 10..27 bỏ trống (chưa có bút toán).
- `make deploy-users` (AgentUserRegistry) chạy **sau** đợt này: bản mới đã bỏ thống kê theo ngày.
- Kiểm sau nâng: app `platform` → Hệ thống → đọc giấy phép poster bất kỳ trả về rỗng; tạo thử chi nhánh bật NET + Loyalty được, chỉ Loyalty bị từ chối.
- Commit `deployments/platform-991.json` (có thêm `registryProxy`, `registryImpl`).

### 5.5 Quay lại bản cũ

Implementation cũ vẫn nằm trên chain (địa chỉ có trong lịch sử git của file deployments). Quay lại bằng:

```bash
cast send $AGENTS "upgradeToAndCall(address,bytes)" <IMPL_CŨ> 0x --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

Chỉ an toàn khi bản mới **chỉ thêm** trường storage (bản cũ bỏ qua trường thừa). Nếu bản mới đã chạy `reinitializer`, bản cũ không biết dữ liệu đó; cân nhắc trước khi quay lại. Sửa lại `<key>Impl` trong file deployments cho khớp.

## 6. Chain 991 và bộ địa chỉ product

**Quyết định người dùng (2026-11-23):** chain 991 là môi trường làm và thử, được deploy lại, seed dữ liệu giả, dùng `MockFullDB` thoải mái. Khi hoàn thiện sẽ **chốt một bộ địa chỉ riêng cho product**; chỉ bộ đó cần tuân thủ danh sách dưới.

Hiện trạng 991 (2026-11-23): đã có `salesSettingsProxy`, `ledgerProxy`; `HistoryIndex.fullDB()` trỏ tới một `MockFullDB` (có bytecode), không phải precompile `0x…0107`.

### Danh sách kiểm trước khi chốt bộ địa chỉ product

1. Deploy mới bằng `make deploy` với **`FULLDB` để trống** (precompile `0x…0107`). Kiểm `cast call $HISTORY "fullDB()(address)"` = `0x0000000000000000000000000000000000000107`.
2. Không chạy `seed-mock-agents`, không có agent/bút toán giả.
3. Chạy lại các lệnh đọc trong `tasks/16-reports/fulldb-991.md` (bước 1–3) trên bộ mới để xác nhận precompile `get`/`search` chạy.
4. Owner là ví chủ của người dùng (nên là multisig — `docs/04` câu 9); thêm admin bằng `make set-admin`.
5. Chỉ đăng ký poster Ledger thật (module ca thu ngân, NET, IQR) bằng `setPoster`; không đăng ký ví cá nhân.
6. Lưu file deployments product riêng (ví dụ `deployments/platform-<chainId>.json` của chain product), web build với `VITE_CHAIN_ID` tương ứng.
7. Đăng ký FreeGas cho các **proxy** của bộ product.

## 7. Lỗi thường gặp

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `NotPlatformOwner` / `OwnableUnauthorizedAccount` | `PRIVATE_KEY` không phải owner | dùng đúng khoá owner |
| `CONTRACT khong hop le: …` | sai tên ở `CONTRACT` | dùng một trong 5 tên ở mục 5.2 |
| `storage layout: LỖI …` | trường storage bị xoá/đổi chỗ/đổi kiểu | sửa mã cho append-only; không ép snapshot |
| `InvalidInitialization` | gọi `reinitializer(N)` lần hai hoặc N không tăng | tăng N |
| `KindNotAllowed(writer, kind)` | writer chưa được cấp kind đó | `setWriterKind(writer, kind, true)` |
| `AccountHasAgentRole` khi thêm admin/đổi owner | ví đang là chủ agent hoặc thành viên chi nhánh | dùng ví khác, hoặc ví đó rời vai agent trước |
| `vm.readFile` lỗi khi `make upgrade` | chưa có `deployments/platform-<chainid>.json` | deploy trước, hoặc khôi phục file |
