# Đặc tả: tầng vận hành nền tảng (owner, admin, agent, chi nhánh)

Trạng thái: **Đã duyệt** (người dùng, 2026-11-18): 8 câu trả lời, gộp admin (6.1), thuế do agent đặt (6.2). Triển khai: `tasks/10`–`13`
Thư mục mã: `src/core/operator`, `src/core/tenant`, `src/core/access` (phần vai trò nền tảng)
Phụ thuộc: `docs/05-luu-tru-du-lieu.md` (storage hay FullDB), ADR 0020 (singleton đa tenant), 0021 (UUPS + ERC-7201), 0023 (AccessManager)

Tầng này là lớp đầu tiên của hệ mới. Mọi khối khác (NET, IQR, Loyalty, `core/staff`, `core/resource`, `core/payment`) hỏi tầng này ba câu: "agent/chi nhánh có tồn tại và đang hoạt động không", "dịch vụ X có bật ở chi nhánh này không", "người gọi có vai trò gì".

## 1. Hệ cũ làm thế nào

Nguồn: `meta-iqr` tại `68d1d3c`.

### 1.1 Vai trò vận hành

| Vai trò | Lưu ở | Ai cấp | Làm gì |
|---|---|---|---|
| `owner()` (Ownable) | `AgentManagement` | deploy | cấp company admin, DA; tạo/kích hoạt licence (`EnhancedAgentManagement.sol:2885-2974`); nâng cấp |
| company admin | `isCompanyAdmin` | owner | tạo/xoá super admin (`AgentManagement.sol:283-315`); mọi việc của super admin |
| super admin | `isAdmin`, `superAdminToCompanyAdmin` | company admin | tạo/sửa/xoá agent, tạo chi nhánh, bật module, pause (`onlySuperAdmin`, `AgentManagement.sol:173`) |
| DA | `isDA` | owner, company admin | một số hàm `onlySuperAdminOrDA` |
| `superAdmin` (biến đơn) | `AgentManagement.sol:45` | khởi tạo | dư thừa với `isAdmin`, cần làm rõ |

### 1.2 Luồng tạo agent (`createAgentWithBranchModules`, `EnhancedAgentManagement.sol:246`)

1. `_createAgentInternal` (`:702`):
   - **khoá agent là địa chỉ ví** (`agents[_walletAddress]`), nên không đổi được ví chủ;
   - kiểm domain không trùng (duyệt lồng nhau trong batch);
   - tạo chi nhánh chính và các chi nhánh phụ (`branchIdCount++`);
   - lưu tên, địa chỉ, **số điện thoại** rõ on-chain, cùng mảng `branches` trong struct `Agent`;
   - `RevenueManager.addAgent`, `PublicfullDB.initAgentDbs`.
2. Ghi đè module theo chi nhánh. Module chi nhánh phụ phải là tập con của chi nhánh chính (`:262-272`).
3. `_grantPermissions` (`AgentManagement.sol:452`), cho từng chi nhánh:
   - `createBranchManagerSC`;
   - **deploy bộ contract riêng qua factory**: IQR (Management, Order, Report, TimeKeeping, AgentIQR), NET (7 beacon proxy), Loyalty, Robot;
   - cấp quyền, `AddAndUpdateManager`.
   - Giới hạn `MAX_BRANCHES_PER_GRANT = 20` vì gas.
4. `_finalizeBranchContractSet` cho từng chi nhánh: nối địa chỉ giữa các contract, chuyển owner contract IQR, đăng ký người gửi thông báo.
5. `_syncCreatedBranchModules` → `AgentModuleProvisioner.setModulesActiveForBranches`.
6. Ghi `agentAnalytics`, đẩy vào `monthlyAgents`/`yearlyAgents` (mảng không trần).

Có thêm `createAgentWithAnalytics` (`:172`), là đường cũ. Đường này **bắt buộc NET đi kèm Loyalty** (`:185`), ngược với quy tắc mới.

### 1.3 Luồng tạo chi nhánh (`createBranchForAgent`, `:431`)

Kiểm domain → `branchIdCount++` → lưu `BranchInfo` (tên, địa chỉ, SĐT, domain, toạ độ) → module chi nhánh ⊆ module chi nhánh chính → `createBranchManagerSC` → `_grantPermissions` (deploy bộ contract cho chi nhánh) → `_finalizeBranchContractSet`.

### 1.4 Vấn đề của hệ cũ ở tầng này

| # | Vấn đề | Nguồn |
|---|---|---|
| O1 | Agent định danh bằng ví nên không đổi chủ được; mất khoá là mất agent | `_createAgentInternal`, `agents[_walletAddress]` |
| O2 | Mỗi chi nhánh deploy 10–15 contract: tạo chi nhánh rất đắt, trần 20 chi nhánh/lần, nâng cấp phải đi qua beacon | `_grantPermissions`, factory |
| O3 | Tạo agent gồm nhiều bước (`create…` → `Finalize…` → `BatchSet…`), bước sau hỏng thì agent nửa vời | `FinalizeAgentContractSet`, `BatchSetFinalize` |
| O4 | Bốn tầng admin chồng chéo (owner, company admin, super admin, DA) cộng biến `superAdmin` dư thừa | `AgentManagement.sol:45,173-195` |
| O5 | SĐT, địa chỉ lưu rõ on-chain | `BranchInfo`, `Agent` |
| O6 | Thống kê và mảng theo tháng/năm ghi trong luồng tạo agent | `monthlyAgents.push` |
| O7 | Xoá agent chỉ tắt cờ, không kiểm khách còn tiền nạp (đoạn kiểm bị comment) | `deleteAgent`, `AgentManagement.sol:1425-1445` |
| O8 | `_branchBelongsToAgent` duyệt mảng; contract 85 KB | `:518` |
| O9 | Licence là licence cài đặt phần mềm (hardware fingerprint, số lần cài) do `owner` cấp, không gắn với gói dịch vụ | `EnhancedAgentManagement.sol:2885` |

### 1.5 Ba vai trò company admin, super admin, DA làm gì thật

Đọc từ mã, không theo tên gọi:

| Vai trò | Ai cấp | Quyền thật trong mã | Ghi chú |
|---|---|---|---|
| **company admin** (`isCompanyAdmin`) | `owner` (`setCompanyAdmin`, `AgentManagement.sol:251`) | Làm **mọi việc của super admin**, vì `onlySuperAdmin` chấp nhận cả company admin (`:173-179`). Thêm: tạo/xoá super admin do chính mình tạo (`:283-315`), cấp DA (`:266`) | Là "trưởng nhóm vận hành" |
| **super admin** (`isAdmin`) | company admin | Tạo/sửa/xoá agent, tạo chi nhánh, bật module, đặt thuế, pause/unpause (mọi hàm `onlySuperAdmin`) | Là "nhân viên vận hành". Có ghi lại ai tạo mình (`superAdminToCompanyAdmin`) |
| **DA** (`isDA`) | owner hoặc company admin | **Gần như không có quyền gì.** Modifier `onlySuperAdminOrDA` (`:186`) khai báo nhưng **không hàm nào dùng**. DA chỉ xuất hiện trong view `canViewAgentData` (`:369`) và `getUserRole` | Ý định có lẽ là vai trò chỉ xem. Nhưng dữ liệu on-chain vốn ai cũng đọc được, nên vai trò "chỉ xem" on-chain không chặn được gì; FE tự ẩn hiện theo vai |

Ý định "mỗi nhân viên quản lý danh mục agent của mình" **chưa bao giờ chạy**:
- Hệ cũ không ghi agent do super admin nào tạo.
- `getAgentsBySuperAdmin` (`:329-364`) so `superAdminToCompanyAdmin[ví agent]` với `superAdminToCompanyAdmin[_superAdmin]`. Ví agent không bao giờ có trong mapping đó, nên hàm luôn trả rỗng, hoặc trả mọi agent khi super admin không có người tạo.
- Có thêm `rescueAdminAccess` (`:2320`) để cứu quyền admin sau một lần nâng cấp làm lệch storage.

**Kết luận:** thực tế chỉ có hai mức quyền: owner cấp admin, admin vận hành. DA không có tác dụng.

## 2. Thiết kế hệ mới

### 2.0 Quyết định của người dùng (2026-11-18)

| # | Câu hỏi | Trả lời | Hệ quả trong đặc tả |
|---|---|---|---|
| 1 | Gộp admin | sau giải thích mục 1.5: **chốt gộp** | Một `PLATFORM_ADMIN`, bỏ DA (mục 6.1) |
| 2 | Ai tạo chi nhánh | **chỉ admin** tạo/sửa/xoá chi nhánh cho agent; agent không được | Mọi hàm chi nhánh chỉ `PLATFORM_ADMIN` |
| 3 | Licence | **bổ sung sau**; giờ chỉ cần tạo agent và cho vận hành | Bỏ licence, gói, `maxBranches` khỏi đợt này. Để chỗ mở rộng (mục 2.9) |
| 4 | Agent dừng hoạt động | **dữ liệu agent không được đụng tới**; agent bị dừng thì mọi luồng bên dưới **ngừng ghi, chỉ cho đọc** | `Suspended` = chỉ đọc toàn bộ (luật R5). "Xoá" (câu 9) là xoá mềm, cũng không đụng dữ liệu |
| 5 | Domain riêng mỗi chi nhánh | **cần** | Domain duy nhất toàn hệ, tra `domain → branchId` on-chain |
| 6 | Một ví làm chủ nhiều agent | **không** | `agentByOwner` một–một (R6) |
| 7 | Noti on-chain | **không**, bổ sung sau | Bỏ khỏi đợt này |
| 8 | Thuế | **agent tự đặt**: một mức cho mọi chi nhánh, hoặc mỗi chi nhánh một mức (người dùng, 2026-11-18) | Mục 6.2: mặc định cấp agent + mức riêng từng chi nhánh, chủ agent đặt |
| 9 | Tầng quản trị và agent | **tầng quản trị chỉ có `PLATFORM_OWNER` và `PLATFORM_ADMIN`; vai trò agent không nằm chung**; cần tạo/sửa/xoá agent (người dùng, 2026-11-18) | `PlatformAccess` chỉ giữ hai vai trò nền tảng; chủ agent là `Agent.owner` trong `AgentRegistry`. Thêm trạng thái `Deleted` (xoá mềm, cuối) |

### 2.1 Contract

Đã triển khai (2026-11-18) đánh dấu ✅.

| Contract | Thư mục | Trách nhiệm |
|---|---|---|
| ✅ `PlatformAccess` | `core/access` | **Chỉ tầng quản trị hệ thống:** `PLATFORM_OWNER` = owner của OZ `Ownable2StepUpgradeable` (đổi hai bước, **tắt `renounceOwnership`**), `PLATFORM_ADMIN` (≤ 50 ví, tự viết), pause toàn hệ bằng OZ `PausableUpgradeable`. Không có vai trò agent nào. Lỗi/event phần owner và pause là của OZ (`OwnableUnauthorizedAccount`, `EnforcedPause`, `Paused`…) |
| ✅ `PlatformAccessed` | `core/access` | Lớp cha abstract cho mọi contract khác: modifier `onlyPlatformOwner`, `onlyPlatformAdmin`, `whenNotPaused`; quyền nâng cấp UUPS = `PLATFORM_OWNER`. **Hỏi owner từ một `PlatformAccess` duy nhất**, không kế thừa `Ownable` riêng, để cả hệ chỉ có một owner (đổi một chỗ là đổi toàn hệ) |
| ✅ `HistoryIndex` | `core/history` | Cổng duy nhất vào FullDB. Writer do owner đăng ký (`setWriter`) và chỉ ghi được các kind owner cấp (`setWriterKind`). Địa chỉ FullDB cố định từ `initialize`, không có `setFullDB` |
| ✅ `AgentRegistry` | `core/tenant` | Agent: tạo, sửa hồ sơ, dừng, mở lại, xoá mềm, đổi ví chủ. View cho module: `requireAgentWritable(agentId)` |
| ✅ `BranchRegistry` | `core/tenant` | Chi nhánh, dịch vụ, domain, múi giờ, chi nhánh chính. View `requireWritable(branchId, service)`. **Thuế đã chuyển sang `SalesSettings`** (T14, `docs/modules/core-sales-settings.md`): BranchRegistry không còn hàm/event thuế; hai trường storage `agentTax`, `branchTaxPlusOne` giữ nguyên chỗ nhưng không dùng |
| ✅ `SalesSettings` | `core/payment` | Thuế (mặc định agent + mức riêng chi nhánh), kiểu giá, phương thức thanh toán. API thuế (`setAgentTax`, `setBranchTax`, `clearBranchTax`, `taxOf`, `agentTaxOf`, `branchTaxOf`, `TaxChanged`) chuyển từ `BranchRegistry` sang đây, cùng chữ ký |
| `AgentAccess` | `core/access` | Vai trò **bên trong** agent (co-owner, quản lý, nhân viên), gắn `(agentId, branchId)`. Thuộc bước "luồng agent" |
| `PlatformOperator` | `core/operator` | **Hoãn.** Mỗi registry tự kiểm `PLATFORM_ADMIN` nên không cần cổng riêng. Chỉ thêm nếu cần gom "tạo agent + chi nhánh chính" vào một giao dịch |
| `Registry` | `core/registry` | Địa chỉ các contract core và module |

**Một bộ contract dùng chung cho mọi agent (ADR 0020):** tạo agent hay chi nhánh **không deploy contract nào**, chỉ ghi vài ô storage. Không còn trần 20 chi nhánh, không còn factory/beacon theo chi nhánh, không còn bước `Finalize`.

Độ sâu gọi: `AgentRegistry → PlatformAccess | HistoryIndex → FullDB` là 2 tầng.

### 2.2 Vai trò

**Tầng quản trị hệ thống** (`PlatformAccess`, chỉ hai vai trò):

| Vai trò | Ai | Quyền |
|---|---|---|
| `PLATFORM_OWNER` | ví của người dùng (`PRIVATE_KEY`); sau này nên chuyển multisig | nâng cấp contract (UUPS), thêm/bớt `PLATFORM_ADMIN`, đăng ký writer của `HistoryIndex`, ghi `Registry`, pause/unpause toàn hệ. **Không** tự tạo agent (phải là admin; một ví không giữ cả hai vai) |
| `PLATFORM_ADMIN` | nhân viên vận hành | tạo/sửa hồ sơ/dừng/mở lại/xoá agent; đổi ví chủ agent; tạo/sửa/tạm dừng chi nhánh; bật/tắt dịch vụ. **Không** đặt thuế (thuế là việc của agent) |

`PLATFORM_OWNER` và `PLATFORM_ADMIN` **không** có quyền nghiệp vụ bên trong agent (không trừ/cộng tiền khách, không sửa đơn).

**Tầng agent** (không nằm trong `PlatformAccess`):
- **Chủ agent** = `AgentRegistry.getAgent(id).owner`. Không phải "role" cấp bởi `grantRole`, mà là trường dữ liệu của agent. Đổi bằng `proposeAgentOwner`/`acceptAgentOwner`.
- Vai trò khác trong agent (co-owner, quản lý chi nhánh, nhân viên) đặc tả ở bước "luồng agent" (`AgentAccess`).
- Ví giữ vai trò nền tảng (owner, pending owner, admin) **không** được làm chủ agent (R6).

### 2.3 Dữ liệu (theo `docs/05`)

**Storage (`TenantRegistry`):**

```text
Agent   { uint64 id; address owner; address pendingOwner; AgentStatus status; uint64 createdAt; uint64 updatedAt; uint256 profileDocId; uint16 allowedServices; }   ✅ (AgentRegistry)
AgentStatus = None | Active | Suspended | Deleted                                                                                  ✅
Branch  { uint64 id; uint64 agentId; BranchStatus status; uint16 services; bool isMain; int16 tzOffsetMinutes; bytes32 domainHash; uint64 createdAt; uint64 updatedAt; uint256 profileDocId; }   ✅ (BranchRegistry)
BranchStatus = None | Active | Suspended | Deleted                                                                                                   ✅
mainBranchOf[agentId] → branchId; branchCountOf[agentId] → uint32 (kể cả đã xoá)                                                                    ✅
Status  = None | Active | Suspended
services bitmask: NET = 1, IQR = 2, LOYALTY = 4          (Robot bỏ)
agentByOwner[address]            → agentId       (một ví một agent)
branchByDomainHash[bytes32]      → branchId      (domain duy nhất; FE tính keccak256(domain) rồi tra)
agentTax[agentId][service]       → uint16 bps                  (mức mặc định của agent)
branchTax[branchId][service]     → uint16 bps + 1, 0 = chưa đặt (mức riêng chi nhánh, mục 6.2)
```

- Không lưu mảng chi nhánh của agent. Danh sách đọc từ FullDB (`mp1_platform_branches`, nhãn `A<agentId>`).
- Kiểm "chi nhánh thuộc agent" bằng `branch.agentId`, O(1).

**FullDB (qua `HistoryIndex`):**
- `mp1_platform_agents`: hồ sơ (tên cửa hàng, địa chỉ, ghi chú).
- `mp1_platform_branches_<agentId>` ✅: hồ sơ chi nhánh (`BranchProfileRecord`: tên, địa chỉ, **SĐT lưu rõ** như agent, toạ độ `lat,long`, ghi chú, **domain dạng chuỗi**), nhãn `B<branchId>`. Mỗi agent một DB nên danh sách chi nhánh = `search(agentId, "platform_branches", …)`. Dịch vụ, trạng thái đọc từ storage.
- `mp1_platform_audit`: mọi thao tác vận hành (ai, làm gì, agent, chi nhánh, trước/sau, lý do).
- `mp1_platform_agents` có thêm **`storePhone`**: số liên hệ của cửa hàng, **lưu rõ** (người dùng chốt 2026-11-18). Công khai và không xoá được trên chain. Hướng dẫn admin chỉ nhập số hotline cửa hàng, không nhập số cá nhân. SĐT của **khách** vẫn theo ADR 0026.

### 2.4 Luật

| # | Luật | Kiểm ở |
|---|---|---|
| R1 | Tổ hợp dịch vụ hợp lệ: `services ≠ 0`; có `LOYALTY` thì phải có `NET` hoặc `IQR`. `createAgent` cấp `allowedServices` theo luật này. Chi nhánh chỉ được bật tập con của trần đó | `ServiceMask`, `AgentRegistry.createAgent` / `setAgentServices`, `BranchRegistry._checkGranted` |
| R2 | Mỗi chi nhánh tự chọn dịch vụ trong trần của agent, **không** còn ràng buộc theo chi nhánh chính như hệ cũ | `createBranch`, `setBranchServices` |
| R3 | Domain bắt buộc, **chữ thường** (`a–z 0–9 - .`, 3–253 ký tự), duy nhất toàn hệ (so `keccak256`); đổi domain hoặc xoá chi nhánh thì nhả hash cũ | `createBranch`, `setBranchDomain`, `deleteBranch` ✅ |
| R4 | Chỉ `PLATFORM_ADMIN` tạo, sửa, tạm dừng chi nhánh và đổi dịch vụ. Thuế là ngoại lệ: chỉ `AGENT_OWNER` đặt (mục 6.2) | `PlatformOperator`, `TenantRegistry` |
| R5 | **Chỉ đọc khi dừng:** agent `Suspended`, hoặc chi nhánh `Suspended`, hoặc dịch vụ không bật → **mọi hàm ghi** của module ở chi nhánh đó revert, kể cả khách tiêu số dư, đóng phiên, thanh toán. View vẫn chạy bình thường. Dữ liệu không bị xoá hay sửa | `requireWritable(branchId, service)`, gọi đầu mọi hàm ghi của module |
| R6 | Một ví chỉ làm chủ một agent; ví chủ không được là ví nền tảng (owner, pending owner, admin), kiểm cả hai chiều: `PlatformAccess` hỏi `agentRoleSources` (`AgentRegistry`, `AgentAccess`) trước `addPlatformAdmin` / `transferOwnership` / `acceptOwnership`. Đổi chủ không được rơi vào thành viên chi nhánh của chính agent đó (`OwnerIsAgentMember`, xem core-access A9) | `createAgent`, `proposeAgentOwner`, `acceptAgentOwner`, `PlatformAccess._requireNoAgentRole` |
| R7 | **Không xoá dữ liệu.** `deleteAgent` / `deleteBranch` là xoá mềm: sang `Deleted` (trạng thái cuối), mọi dữ liệu vẫn đọc được, mọi hàm ghi revert như R5. Xoá agent nhả ví chủ; xoá chi nhánh nhả domain. Chi nhánh chính chỉ xoá được sau khi agent đã xoá (trước đó phải `setMainBranch` sang chi nhánh khác). `deleteBranch` vẫn gọi được khi agent đã xoá, để nhả domain | `AgentRegistry.deleteAgent`, `BranchRegistry.deleteBranch` ✅ |
| R8 | Tắt một dịch vụ trên chi nhánh: dữ liệu dịch vụ đó vẫn còn, chuyển chỉ đọc theo R5. Bật lại thì ghi tiếp | `setBranchServices` |
| R9 | Đổi ví chủ hai bước: admin đề xuất `pendingOwner`, ví mới `acceptAgentOwner`; vai trò `AGENT_OWNER` chuyển nguyên tử. `acceptAgentOwner` ghi lại hồ sơ FullDB với `owner` mới (`history.replace`) | `proposeAgentOwner`, `acceptAgentOwner` |
| R10 | Mỗi thao tác vận hành ghi một bản audit vào FullDB (`mp1_platform_audit`, nhãn `G<agentId>`, `X<action>`, `R<actor>`) và phát event. | `AgentRegistry._audit` ✅ |

**Chú ý R5:** khi dừng agent đang có phiên NET mở, phiên đó không đóng được và không trừ tiền tiếp, nên tiền khách đứng yên. Mở lại thì heartbeat tiếp theo sẽ tính cả khoảng thời gian bị dừng. Đặc tả NET phải quy định không tính tiền khoảng thời gian bị dừng (ghi vào đặc tả NET).

### 2.4.1 Không có bước migrate `allowedServices`

Hệ mới deploy từ đầu: mọi agent nhận `allowedServices` hợp lệ ngay ở `createAgent`. Không có `migrateAllowedServices`, không có script nâng cấp điền trần (đã gỡ 2026-11-19 theo yêu cầu người dùng).

### 2.5 Hàm (`PlatformOperator`, mỗi hàm một giao dịch, đều yêu cầu `PLATFORM_ADMIN`)

| Hàm | Việc |
|---|---|
| `createAgent(owner, AgentProfile, BranchInit main)` → `(agentId, mainBranchId)` | tạo agent + chi nhánh chính + cấp `AGENT_OWNER` + tạo các DB FullDB của agent + audit (R1, R3, R6) |
| `createBranch(agentId, BranchInit)` → `branchId` | R1, R3; agent phải `Active` |
| `updateAgentProfile(agentId, AgentProfile)` | chỉ ghi FullDB + audit |
| `updateBranchProfile(branchId, BranchProfile)` | chỉ ghi FullDB + audit |
| `setBranchDomain(branchId, domain)` | R3 |
| `setBranchServices(branchId, services)` | R1, R8 |
| `suspendAgent(agentId, reason)` / `resumeAgent(agentId)` | R5 |
| `suspendBranch(branchId, reason)` / `resumeBranch(branchId)` | R5, R7 |
| `proposeAgentOwner(agentId, newOwner)` / `acceptAgentOwner(agentId)` (ví mới gọi) | R6, R9 |

Hàm của chủ agent (nay ở `SalesSettings`, không còn ở `BranchRegistry`; yêu cầu `AGENT_OWNER` của đúng agent, agent phải `Active`):

| Hàm | Việc |
|---|---|
| `setAgentTax(agentId, service, bps)` | đặt mức mặc định cho mọi chi nhánh của agent |
| `setBranchTax(branchId, service, bps)` | đặt mức riêng cho một chi nhánh |
| `clearBranchTax(branchId, service)` | bỏ mức riêng, chi nhánh quay về mức mặc định |

`TenantRegistry` cho module (view; `taxOf` nay đọc từ `SalesSettings`):
- `requireWritable(branchId, service)`: mục tiêu ≤ 2 SLOAD;
- `agentOf(branchId)`;
- `getAgent`, `getBranch`;
- `branchByDomain(bytes32 domainHash)`;
- `isServiceEnabled` (chỉ cấu hình; `false` khi chi nhánh hoặc agent đã `Deleted`; không xét pause/`Suspended`, quyết định ghi dùng `requireWritable`);
- `taxOf(branchId, service)` → mức hiệu lực (riêng chi nhánh nếu có, không thì mặc định agent).

### 2.6 Event (schema có version)

`AgentCreated(v, agentId, owner, mainBranchId)`, `BranchCreated(v, agentId, branchId, services, domainHash)`, `BranchServicesChanged`, `BranchDomainChanged`, `AgentStatusChanged(agentId, status, reason)`, `BranchStatusChanged`, `AgentOwnerProposed`, `AgentOwnerTransferred`, `TaxChanged`, `PlatformRoleChanged`.

### 2.7 Máy trạng thái

```text
Agent:  None ──createAgent──▶ Active ⇄ Suspended
                               │          │
                               └─deleteAgent─▶ Deleted      (cuối; chỉ đọc; nhả ví chủ)
Branch: None ──createBranch─▶ Active ⇄ Suspended
                               │          │
                               └─deleteBranch─▶ Deleted     (cuối; chỉ đọc; nhả domain)
Ghi được ở chi nhánh B cho dịch vụ S  ⇔  hệ không pause ∧ agent Active ∧ B Active ∧ S ∈ B.services   (R5, `requireWritable`)
```

### 2.8 Test bắt buộc

- Unit cho mọi hàm. Mỗi luật R1–R10 có ca vi phạm (revert đúng lỗi). Người không phải admin gọi mọi hàm ghi đều revert.
- Mọi chuyển trạng thái trong 2.7.
- Fuzz: mọi giá trị `services` (R1); domain trùng, đổi domain.
- Invariant:
  - mỗi chi nhánh thuộc đúng một agent tồn tại;
  - `branchCount` = số chi nhánh của agent;
  - `agentByOwner[a.owner] == a.id` với mọi agent;
  - mỗi agent có đúng một `AGENT_OWNER`;
  - mỗi `domainHash` trỏ đúng một chi nhánh.
- R5 kiểm bằng một module giả trong test (`test/utils/MockServiceModule.sol`): hàm ghi revert khi dừng, view vẫn chạy.
- Gas: ngân sách cho `createAgent`, `createBranch`, `requireWritable`.

### 2.9 Để mở rộng sau (không làm đợt này)

- **Licence/gói dịch vụ** (câu 3): thêm khối `core/licence` và một điều kiện trong `requireWritable`. Struct `Agent` không cần đổi, dữ liệu licence để namespace riêng.
- **Noti** (câu 7): nghe event `BranchCreated`, không cần đổi tầng này.
- Phân cấp admin (nếu sau này cần): thêm vai trò `PLATFORM_ADMIN_MANAGER` trong `AccessManager`.

## 3. Ánh xạ cũ → mới (cho migration)

| Cũ | Mới |
|---|---|
| `agents[wallet]` | `Agent{id mới, owner = wallet}`; bảng `oldWallet → agentId` off-chain + event `Migrated` |
| `mBranchIdToBranch[id]`, `agentToBranchIds` | `Branch{id mới}`; ánh xạ `oldBranchId → branchId` |
| `agents[].permissions` + `_branchModuleOverride` | `Branch.services` (bỏ Robot) |
| `isCompanyAdmin`, `isAdmin` | `PLATFORM_ADMIN` (nếu duyệt 6.1); `isDA` bỏ |
| `mDomainToWallet`, `mDomainToBranchId` | `branchByDomainHash`; chuỗi domain sang FullDB |
| tên, địa chỉ, SĐT, toạ độ | FullDB `mp1_platform_*`; SĐT agent → `storePhone` lưu rõ; toạ độ, domain → chi nhánh |
| `agentTaxPercent` (%, cấp agent, chép xuống từng `RestaurantOrder`) | `agentTax[agentId][IQR] = percent × 100`; chi nhánh nào trong `RestaurantOrder._taxPercent` khác mức agent thì thành `branchTax` |
| `licenses` | không chuyển đợt này (câu 3) |
| `agentAnalytics`, `monthlyAgents`, `yearlyAgents` | không chuyển (lớp D) |

Hiện chỉ có 1 agent chạy thật, nên migration tầng này chỉ là 1 agent và các chi nhánh của nó.

## 4. Kế hoạch triển khai

Theo yêu cầu người dùng (2026-11-18), **Claude tự triển khai** tầng đầu tiên:

1. ✅ `core/access`: `PlatformAccess`, `PlatformAccessed` (chỉ vai trò nền tảng).
2. ✅ `core/history`: `HistoryIndex`, `libraries/FullDBCodec`, `test/utils/MockFullDB` có lọc/sắp/phân trang.
3. ✅ `core/tenant`: `AgentRegistry` (tạo/sửa/dừng/mở lại/xoá mềm/đổi chủ).
4. ✅ `core/tenant`: `BranchRegistry`. Hàm admin: `createBranch(agentId, BranchInit)` (chi nhánh đầu tiên tự thành chi nhánh chính), `updateBranchProfile`, `setBranchDomain`, `setBranchServices`, `setBranchTimezone`, `setMainBranch`, `suspendBranch`/`resumeBranch`/`deleteBranch(id, reason)`. Hàm chủ agent: `setAgentTax`, `setBranchTax`, `clearBranchTax` (chỉ NET, IQR; ≤ 10000 bps; agent và chi nhánh phải Active). View: `requireWritable`, `taxOf`, `getBranch`, `getBranchProfile`, `branchByDomain`, `mainBranchOf`, `agentOf`, `isServiceEnabled`. Admin vẫn cấu hình được chi nhánh khi agent `Suspended`; khi agent `Deleted` thì chỉ còn `deleteBranch`.
   Audit agent và chi nhánh dùng chung `PlatformAuditRecord` (`src/interfaces/IPlatformAudit.sol`), action có tiền tố `agent_` / `branch_`.
5. `core/operator`: hoãn (mục 2.1).

Hàm đã có của `AgentRegistry` (`src/interfaces/IAgentRegistry.sol`): `createAgent(owner, allowedServices, profile)`, `setAgentServices(id, allowedServices)`, `updateAgentProfile`, `suspendAgent(id, reason)`, `resumeAgent(id, reason)`, `deleteAgent(id, reason)`, `proposeAgentOwner`, `acceptAgentOwner`; view `getAgent`, `agentIdOf`, `agentCount`, `isAgentActive`, `requireAgentWritable` (trả về trần module), `getAgentProfile`. Mọi hàm ghi yêu cầu hệ không pause. Lý do (`reason`) bắt buộc khi dừng/mở/xoá. Danh sách agent đọc qua `HistoryIndex.search(0, "platform_agents", …)`.

Mỗi bước kèm test và kiểm layout.

## 5. Ngoài phạm vi

Vai trò trong agent (co-owner, quản lý, staff), cấu hình nghiệp vụ agent, luồng NET/IQR/Loyalty: bước tiếp theo ("luồng agent"). Licence, Noti: sau này.

## 6. Quyết định về admin và thuế

### 6.1 Vai trò admin (đã chốt gộp, 2026-11-18)

Gộp company admin và super admin thành một **`PLATFORM_ADMIN`**, do `PLATFORM_OWNER` cấp/thu trực tiếp. **Bỏ DA.**

Lý do:
- trong mã cũ company admin làm được mọi việc của super admin;
- tính năng "mỗi admin quản lý agent của mình" chưa từng chạy;
- DA không có quyền ghi nào;
- quyền "chỉ xem" on-chain không chặn được ai, vì dữ liệu chain ai cũng đọc được.

Nếu sau này cần phân cấp thì thêm vai trò mà không đổi dữ liệu (mục 2.9).

### 6.2 Thuế (đã chốt hướng theo người dùng, 2026-11-18)

**Agent tự đặt thuế**: một mức mặc định cho toàn bộ chi nhánh, và có thể đặt mức riêng cho từng chi nhánh. Claude đồng ý với hướng này: thuế là trách nhiệm của chủ kinh doanh, và các chi nhánh có thể là hộ kinh doanh hoặc pháp nhân khác nhau.

Cách làm:
- **Hai mức:** `agentTax[agentId][service]` (mặc định) và `branchTax[branchId][service]` (riêng chi nhánh). Mức hiệu lực = mức riêng nếu đã đặt, không thì mức mặc định. `branchTax` lưu `bps + 1` để phân biệt "chưa đặt" với "đặt 0 %".
- **Theo dịch vụ:** NET và IQR có thể khác nhau (giờ chơi net khác đồ ăn). Loyalty không có thuế.
- **Đơn vị:** 0,01 % (bps), trần 10000. Hệ cũ dùng % nguyên nên không biểu diễn được mức lẻ.
- **Ai đặt:** chủ agent (`AgentRegistry.getAgent(id).owner`). Admin nền tảng **không** đặt hay sửa (đồng bộ câu 4: không đụng dữ liệu agent). Khi làm "luồng agent" sẽ xét có cho co-owner đặt không.
- **Chốt mức thuế vào từng đơn/phiên lúc tạo.** Đổi thuế chỉ áp cho đơn/phiên mới, không đổi đơn đang mở. Hoàn tiền dùng mức đã chốt, sửa lỗi hệ cũ tính hoàn theo mức hiện tại (`RestaurantOrder.sol:1872`, `2144`).
- Agent đang `Suspended` thì không đổi được thuế (R5).
- Mỗi lần đổi phát `TaxChanged(agentId, branchId, service, oldBps, newBps)` và ghi audit FullDB, để biết đơn nào áp mức nào.

Test thêm:
- mức hiệu lực đúng trong cả 4 trường hợp (chỉ mặc định, có mức riêng, mức riêng 0 %, xoá mức riêng);
- người khác `AGENT_OWNER` (kể cả admin) đặt thuế thì revert;
- đơn tạo trước khi đổi thuế vẫn giữ mức cũ.
