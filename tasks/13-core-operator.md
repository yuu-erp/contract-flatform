# T13 — core/operator: PlatformOperator (tạo agent, chi nhánh, vận hành) + kịch bản đầu cuối

Trạng thái: Hoãn (2026-11-18)
Cỡ: M (GĐ2 sớm của `meta-platform`, đặc tả `docs/modules/core-operator.md`) · Loại: Tính năng
Ngày tạo: 2026-11-18

> **Hoãn:** mỗi registry tự kiểm `PLATFORM_ADMIN`, chưa cần cổng `PlatformOperator`. Kịch bản đầu cuối của tầng agent đã có ở `test/e2e/PlatformAdminFlow.t.sol`. Mở lại nếu cần gom "tạo agent + chi nhánh chính" vào một giao dịch.

## Kế hoạch (Claude Code)

- **Mục tiêu:** Admin nền tảng thực hiện mọi thao tác vận hành của `docs/modules/core-operator.md` mục 2.5 trong một giao dịch mỗi thao tác: ghi `TenantRegistry`, cấp/chuyển `AGENT_OWNER`, ghi hồ sơ + audit vào FullDB qua `HistoryIndex`.
- **Phạm vi:** `src/core/operator/PlatformOperator.sol`, `src/interfaces/IPlatformOperator.sol`, `test/core/operator/**`, `test/e2e/CoreOperator.t.sol`, `script/DeployCore.s.sol` (chỉ chạy local/anvil), layout.
- **Ngoài phạm vi:** `Registry` (chưa cần; địa chỉ truyền lúc khởi tạo); licence; noti; vai trò trong agent.

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

- [ ] `PlatformOperator` (UUPS, `CoreAccessed`, namespace `metaplatform.core.operator`) lưu địa chỉ `TenantRegistry`, `HistoryIndex`; được đăng ký là core contract trong `AccessManager` và là writer trong `HistoryIndex`.
- [ ] Hàm (đều `onlyPlatformAdmin`, `whenNotPaused`, trừ `acceptAgentOwner`):
  - `createAgent(address owner, AgentProfile profile, BranchInit main) → (agentId, mainBranchId)`: R6 (owner không phải `PLATFORM_ADMIN`, không phải `PLATFORM_OWNER`, chưa có agent); tenant tạo agent + chi nhánh chính; `grantAgentRole(agentId, AGENT_OWNER, owner)`; ghi hồ sơ agent (`kind = "platform_agents"`, agentId 0, term `G<agentId>`) và hồ sơ chi nhánh (`"platform_branches"`, term `A<agentId>`, `S<services>`); audit.
  - `createBranch(agentId, BranchInit) → branchId`; `updateAgentProfile`; `updateBranchProfile` (dùng `replace` với docId đã lưu trong storage operator: `agentProfileDoc[agentId]`, `branchProfileDoc[branchId]`); `setBranchDomain(branchId, string domain)`; `setBranchServices`; `suspendAgent(agentId, string reason)`, `resumeAgent`; `suspendBranch`, `resumeBranch`; `proposeAgentOwner(agentId, newOwner)`.
  - `acceptAgentOwner(agentId)` gọi bởi ví mới: tenant `acceptOwner`, thu `AGENT_OWNER` của ví cũ, cấp cho ví mới, cùng một giao dịch.
  - Domain: chuẩn hoá chữ thường, không rỗng, ≤ 253 ký tự; `domainHash = keccak256(bytes(domain))`; chuỗi domain nằm trong hồ sơ chi nhánh FullDB.
- [ ] Struct (`IPlatformOperator`): `AgentProfile{storeName, storeAddress, note}`, `BranchProfile{name, location, longlat, domain}`, `BranchInit{BranchProfile profile, uint16 services, int16 tzOffsetMinutes}`; bản ghi FullDB = `abi.encode(uint8 version, struct)`.
- [ ] Audit: mỗi hàm ghi một bản `AuditRecord{version, actor, action (bytes32), agentId, branchId, before (bytes), after (bytes), reason, timestamp}` vào `"platform_audit"` (agentId 0), term `G<agentId>`, `B<branchId>`, `K<action>`, value slot 0 = timestamp.
- [ ] Không có số điện thoại trong bất kỳ struct nào (ADR 0026 chưa chốt).
- [ ] Test đơn vị: mỗi hàm thành công + mọi luật R1–R10 có ca vi phạm; người không phải admin revert; `acceptAgentOwner` sai ví revert; sau đổi chủ ví cũ mất `AGENT_OWNER`, ví mới có, ví cũ tạo được agent mới.
- [ ] Kịch bản đầu cuối (`test/e2e/CoreOperator.t.sol`, dùng `MockFullDB` và `MockServiceModule`): owner deploy + cấu hình → cấp admin → admin tạo agent A (NET+LOYALTY) và chi nhánh phụ (IQR) → chủ A đặt thuế agent + thuế riêng một chi nhánh → module giả ghi được → admin dừng agent A → module giả ghi revert, view và `HistoryIndex.search` vẫn đọc được → mở lại → ghi được; tìm chi nhánh của A qua `search(term A<id>)` ra đủ; audit có đủ bản ghi theo thứ tự.
- [ ] `script/DeployCore.s.sol`: deploy 4 contract sau proxy, nối quyền (core contract, writer), cấp admin từ biến môi trường; **chỉ** chạy trên anvil (`forge script ... --fork-url http://localhost:8545`). Không có khoá trong script, không chạy lên chain thật.
- [ ] Gas `createAgent`, `createBranch` ghi vào mục Triển khai; tất cả contract ≤ 24 KB; `make ci` xanh.

### Checkout

| Repo | Checkout | Nhánh | HEAD lúc bắt đầu | Thay đổi có sẵn |
|---|---|---|---|---|
| contract/meta-platform | `repos/contract/meta-platform` | `main` | ghi lại (lúc lập kế hoạch: chưa có commit) | ghi lại `git status --short` |

Không đọc/sửa `repos/contract/meta-iqr` hay `worktrees/meta-iqr-loyalty-v2` trong task này (chỉ được mở file meta-iqr được dẫn trong task để tham khảo).

### Hợp đồng thay đổi

Không có bên sử dụng ngoài repo (FE/qt-core chưa dùng hệ mới).

### Các bước

1. [ ] `IPlatformOperator`.
2. [ ] `createAgent`, `createBranch` + test.
3. [ ] Hồ sơ, domain, dịch vụ, trạng thái, đổi chủ + test.
4. [ ] Audit + test.
5. [ ] Kịch bản đầu cuối.
6. [ ] Script deploy local, layout, snapshot, `make ci`.

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
forge test --match-path 'test/core/operator/**' -vv
forge test --match-path 'test/e2e/**' -vv
make ci
```

### Câu hỏi còn mở

- Phụ thuộc T10, T11, T12. Làm cuối.

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
