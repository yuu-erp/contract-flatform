# T12 — core/tenant: TenantRegistry (agent, chi nhánh, dịch vụ, trạng thái, domain, thuế)

Trạng thái: Xong (Claude tự triển khai 2026-11-18)
Cỡ: M (GĐ2 sớm của `meta-platform`, đặc tả `docs/modules/core-operator.md`) · Loại: Tính năng
Ngày tạo: 2026-11-18

> **Cập nhật 2026-11-18:** phần agent đã tách thành `src/core/tenant/AgentRegistry.sol` (tạo/sửa/dừng/mở lại/xoá mềm/đổi chủ, audit FullDB). Phần còn lại của task này là **`BranchRegistry`** (chi nhánh, dịch vụ, domain, thuế, `requireWritable`), gọi `AgentRegistry.requireAgentWritable` và kế thừa `PlatformAccessed`. Cần viết lại kế hoạch trước khi giao.
>
> **Cập nhật 2026-11-18 (2):** `BranchRegistry` đã làm (`src/core/tenant/BranchRegistry.sol`, `src/interfaces/IBranchRegistry.sol`, `test/core/tenant/BranchRegistry.t.sol`, `test/invariant/BranchRegistry.invariant.t.sol`, `test/utils/MockServiceModule.sol`). Khác kế hoạch: tách hai registry thay vì một `TenantRegistry`; thêm `Deleted` (xoá mềm, nhả domain) và `setMainBranch`.

## Kế hoạch (Claude Code)

- **Mục tiêu:** Có `TenantRegistry` giữ dữ liệu và luật agent/chi nhánh theo `docs/modules/core-operator.md` mục 2.3, 2.4, 2.7, 6.2; module khác hỏi được `requireWritable(branchId, service)`.
- **Phạm vi:** `src/core/tenant/TenantRegistry.sol`, `src/interfaces/ITenantRegistry.sol`, `test/core/tenant/**`, `test/utils/MockServiceModule.sol`, layout.
- **Ngoài phạm vi:** hồ sơ hiển thị (FullDB — do T13 ghi); audit; licence; noti; vai trò trong agent ngoài `AGENT_OWNER`.

Quy ước chung cho task 10–13 (đặc tả gốc: `docs/modules/core-operator.md`):
- solc `0.8.28`, UUPS (`UUPSUpgradeable` OZ 5.6.1) + storage ERC-7201, namespace `metaplatform.core.<khối>`. Slot tính bằng `cast index-erc7201 <namespace>` và có test kiểm công thức (mẫu: `test/Scaffold.t.sol::test_storageAtErc7201Slot`).
- Không khai báo biến state thường. Mỗi contract thêm dòng `impl` vào `storage-layouts/contracts.txt`; mỗi struct storage thêm harness `test/layout/<Tên>Layout.sol` + dòng `harness`, chạy `python3 scripts/storage_layout.py snapshot`.
- Lỗi dùng custom error (không dùng chuỗi `require`). Event khai báo trong interface, tham số đầu `uint8 version` (= 1).
- Interface công khai đặt ở `src/interfaces/I<Tên>.sol`; contract `is I<Tên>`.
- NatSpec tiếng Anh ngắn cho mọi hàm external; chú thích nghiệp vụ tiếng Việt được.
- Test ở `test/core/<khối>/`, dùng `BaseTest`. Mỗi lỗi custom có ít nhất một test revert đúng lỗi (`vm.expectRevert(Err.selector)`).
- Không deploy, không gửi giao dịch lên chain thật.
- Xong mỗi task: `make ci` xanh, `forge snapshot` cập nhật `.gas-snapshot` (ghi số gas các hàm chính vào mục Triển khai).

### Tiêu chí nghiệm thu

- [ ] Storage đúng mục 2.3: `Agent{id, owner, pendingOwner, status, createdAt, mainBranchId, branchCount}`, `Branch{id, agentId, status, services, isMain, tzOffsetMinutes, domainHash}`, `agentByOwner`, `branchByDomainHash`, `agentTax[agentId][service]`, `branchTax[branchId][service]` (lưu `bps+1`), bộ đếm `nextAgentId`, `nextBranchId` (bắt đầu từ 1). `Status { None, Active, Suspended }`. Hằng dịch vụ `NET=1, IQR=2, LOYALTY=4`, `ALL=7`.
- [ ] Hàm ghi chỉ `onlyCoreContract` (sẽ là `PlatformOperator`), `whenNotPaused`: `createAgent(owner) → agentId` (chưa có chi nhánh, `Active`), `createBranch(agentId, services, isMain, tz, domainHash) → branchId` (chi nhánh đầu tiên phải `isMain`, chỉ một main), `setBranchServices`, `setBranchDomain`, `setAgentStatus(agentId, Status)`, `setBranchStatus`, `proposeOwner(agentId, newOwner)`, `acceptOwner(agentId, caller)` (operator truyền `msg.sender` gốc).
- [ ] Luật: R1 (`_validateServices`: `≠ 0`, `⊆ ALL`, có LOYALTY thì có NET hoặc IQR); R3 (domainHash `≠ 0`, chưa dùng; đổi thì nhả hash cũ); R6 (`agentByOwner` một–một khi tạo và khi `acceptOwner`; owner `≠ 0`); không có hàm xoá; `createBranch`/đổi dịch vụ chỉ khi agent `Active`; chuyển trạng thái chỉ `Active ⇄ Suspended` (đặt trùng trạng thái revert).
- [ ] Thuế (mục 6.2): `setAgentTax(agentId, service, bps)`, `setBranchTax(branchId, service, bps)`, `clearBranchTax(branchId, service)` gọi **trực tiếp** bởi ví có `AGENT_OWNER` của đúng agent (hỏi `AccessManager.hasAgentRole`), agent và chi nhánh phải `Active`, `service ∈ {NET, IQR}`, `bps ≤ 10000`; `taxOf(branchId, service)` trả mức riêng nếu có, không thì mặc định. Event `TaxChanged(1, agentId, branchId, service, oldBps, newBps)` (`branchId = 0` cho mức agent).
- [ ] View: `requireWritable(branchId, service)` (revert `BranchNotFound`, `AgentNotActive`, `BranchNotActive`, `ServiceDisabled`, `SystemPaused`); `isWritable(...) returns (bool)`; `getAgent`, `getBranch`, `agentOf(branchId)`, `agentIdByOwner(address)`, `branchByDomain(bytes32)`, `isServiceEnabled`, `taxOf`.
- [ ] `MockServiceModule` (test): một hàm ghi gọi `requireWritable` và một view; test R5 đủ 4 trường hợp (agent dừng, chi nhánh dừng, dịch vụ tắt, pause toàn hệ) — ghi revert, view vẫn chạy, dữ liệu không đổi.
- [ ] Invariant test (`test/invariant/TenantInvariant.t.sol`, handler gọi ngẫu nhiên các hàm qua một core contract giả): mỗi chi nhánh thuộc agent tồn tại; `branchCount` đúng; `agentByOwner[a.owner] == a.id`; mỗi `domainHash` đang dùng trỏ đúng một chi nhánh; mỗi agent có đúng một chi nhánh `isMain`.
- [ ] Gas `requireWritable` ≤ 2 lần đọc storage nguội ngoài `AccessManager.paused()` (ghi số đo); `make ci` xanh.

### Checkout

| Repo | Checkout | Nhánh | HEAD lúc bắt đầu | Thay đổi có sẵn |
|---|---|---|---|---|
| contract/meta-platform | `repos/contract/meta-platform` | `main` | ghi lại (lúc lập kế hoạch: chưa có commit) | ghi lại `git status --short` |

Không đọc/sửa `repos/contract/meta-iqr` hay `worktrees/meta-iqr-loyalty-v2` trong task này (chỉ được mở file meta-iqr được dẫn trong task để tham khảo).

### Hợp đồng thay đổi

Không có bên sử dụng ngoài repo (FE/qt-core chưa dùng hệ mới).

### Các bước

1. [ ] `ITenantRegistry` (struct, enum, hàm, event, lỗi).
2. [ ] Storage + `createAgent`/`createBranch` + test.
3. [ ] Dịch vụ, domain, trạng thái, owner hai bước + test.
4. [ ] Thuế + test.
5. [ ] `requireWritable` + `MockServiceModule` + test R5.
6. [ ] Invariant test, layout, snapshot, `make ci`.

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
forge test --match-path 'test/core/tenant/**' -vv
forge test --match-path 'test/invariant/**' -vv
make ci
```

### Câu hỏi còn mở

- Phụ thuộc T10 (`CoreAccessed`, `AccessManager`). Làm sau T10.

## Triển khai (Cursor)

- **Checkout/nhánh/HEAD đã kiểm:**
- **File đã sửa:**
- **Khác kế hoạch (và lý do):**
- **Lệnh đã chạy và kết quả:**
- **Gas (từ `.gas-snapshot`):**
- **Nợ kỹ thuật phát hiện** (đã ghi vào `documents/tech-debt.md`):
- **Còn vướng:**

## Review (Claude Code)

### Vòng 1

- **Phát hiện:**
- **Kết quả test chạy lại:**
- **Kết luận:**
