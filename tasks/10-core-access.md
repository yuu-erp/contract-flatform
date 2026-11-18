# T10 — core/access: AccessManager tối thiểu + base CoreAccessed

Trạng thái: Xong (Claude tự triển khai, 2026-11-18)
Cỡ: M (GĐ2 sớm của `meta-platform`, đặc tả `docs/modules/core-operator.md`) · Loại: Tính năng
Ngày tạo: 2026-11-18

> **Thay đổi so với kế hoạch (người dùng, 2026-11-18):** tầng quản trị chỉ có `PLATFORM_OWNER` và `PLATFORM_ADMIN`; vai trò agent **không** nằm chung. Không làm `AccessManager`/`CoreAccessed`/`AGENT_OWNER` như dưới đây. Đã làm `src/core/access/PlatformAccess.sol` (owner/pause dùng OZ `Ownable2StepUpgradeable` + `PausableUpgradeable`, theo người dùng 2026-11-18) + `PlatformAccessed.sol` (`src/interfaces/IPlatformAccess.sol`), test `test/core/access/**`. Chủ agent là `Agent.owner` trong `AgentRegistry`. Phần kế hoạch bên dưới giữ để tra lại.

## Kế hoạch (Claude Code)

- **Mục tiêu:** Có `AccessManager` giữ vai trò nền tảng (`PLATFORM_OWNER`, `PLATFORM_ADMIN`), danh sách contract core, vai trò theo agent (`AGENT_OWNER`), pause toàn hệ; và abstract `CoreAccessed` để mọi contract core khác kiểm quyền và nâng cấp qua nó.
- **Phạm vi:** `src/core/access/AccessManager.sol`, `src/core/access/CoreAccessed.sol`, `src/interfaces/IAccessManager.sol`, `test/core/access/**`, `test/layout/*`, `storage-layouts/*`. Xoá `test/Scaffold.t.sol`, `test/layout/ScaffoldLayout.sol`, `storage-layouts/ScaffoldLayout.json` và 2 dòng Scaffold trong `contracts.txt` (khung đã có module thật thay thế).
- **Ngoài phạm vi:** vai trò trong agent ngoài `AGENT_OWNER` (co-owner, manager, staff — làm ở luồng agent); `PAUSER` riêng; multisig.

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

- [ ] `AccessManager` (UUPS, namespace `metaplatform.core.access`):
  - `initialize(address owner_)`; `owner()`; `pendingOwner()`; `transferOwnership(address)` (chỉ owner, đặt pending); `acceptOwnership()` (chỉ pending). Không cho `address(0)`.
  - `setPlatformAdmin(address, bool)` chỉ owner; `isPlatformAdmin(address)`. Owner **không** tự động là admin.
  - `setCoreContract(address, bool)` chỉ owner; `isCoreContract(address)`.
  - `grantAgentRole(uint64 agentId, bytes32 role, address)`, `revokeAgentRole(...)` chỉ core contract; `hasAgentRole(agentId, role, account)`. Hằng `AGENT_OWNER = keccak256("AGENT_OWNER")`.
  - `pause()`, `unpause()` chỉ owner; `paused()`; `requireNotPaused()` (view, revert `SystemPaused`).
  - `_authorizeUpgrade` chỉ owner.
  - Event: `OwnershipTransferStarted`, `OwnershipTransferred`, `PlatformAdminSet`, `CoreContractSet`, `AgentRoleGranted`, `AgentRoleRevoked`, `Paused`, `Unpaused`.
- [ ] `CoreAccessed` (abstract, namespace `metaplatform.core.accessed`, lưu địa chỉ `IAccessManager`): `__CoreAccessed_init(address am)`; `accessManager()`; modifier `onlyPlatformOwner`, `onlyPlatformAdmin`, `onlyCoreContract`, `whenNotPaused`; `_authorizeUpgrade` = `onlyPlatformOwner`. Có contract test kế thừa để kiểm từng modifier.
- [ ] Test: mọi hàm ghi gọi bởi người không có quyền revert đúng lỗi; chuyển owner hai bước (kể cả huỷ bằng `transferOwnership` sang ví khác); nâng cấp bởi người lạ revert, bởi owner thành công và giữ dữ liệu; slot ERC-7201 đúng công thức; fuzz grant/revoke.
- [ ] `python3 scripts/storage_layout.py check` có dòng `impl` cho `AccessManager` và harness cho mọi struct storage; `make ci` xanh; Scaffold đã xoá.

### Checkout

| Repo | Checkout | Nhánh | HEAD lúc bắt đầu | Thay đổi có sẵn |
|---|---|---|---|---|
| contract/meta-platform | `repos/contract/meta-platform` | `main` | ghi lại (lúc lập kế hoạch: chưa có commit) | ghi lại `git status --short` |

Không đọc/sửa `repos/contract/meta-iqr` hay `worktrees/meta-iqr-loyalty-v2` trong task này (chỉ được mở file meta-iqr được dẫn trong task để tham khảo).

### Hợp đồng thay đổi

Không có bên sử dụng ngoài repo (FE/qt-core chưa dùng hệ mới).

### Các bước

1. [ ] `IAccessManager` (hàm, event, lỗi).
2. [ ] `AccessManager` + test.
3. [ ] `CoreAccessed` + contract test kế thừa + test.
4. [ ] Harness layout, `contracts.txt`, snapshot; xoá Scaffold.
5. [ ] `forge snapshot`, `make ci`.

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
forge test --match-path 'test/core/access/**' -vv
python3 scripts/storage_layout.py check
make ci
```

### Câu hỏi còn mở

-

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
