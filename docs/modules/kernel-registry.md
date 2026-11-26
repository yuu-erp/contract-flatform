# Registry — danh sách module, cầu dao, sổ địa chỉ (`kernel/registry`)

Trạng thái: **Đã cài** (Architecture Baseline tuần 3, 2026-11-26). ADR 0030 (Module Contract), 0031 (cô lập lỗi).

Code: `src/kernel/registry/Registry.sol`, `src/interfaces/IRegistry.sol`. UUPS, namespace ERC-7201 `metaplatform.kernel.registry`. Test: `test/kernel/registry/Registry.t.sol`.

## 1. Câu hỏi nó trả lời

"Module nào tồn tại, đang chạy hay dừng, phụ thuộc gì, có quyền gì; contract nào thuộc module nào; địa chỉ dùng chung ở đâu." Nền tảng **hỏi** Registry thay vì biết sẵn tên module (luật L2).

## 2. Khai báo module

| Trường | Ý nghĩa |
|---|---|
| `moduleId` | 0 = nền tảng (chỉ danh mục quyền); 1..16 ↔ bit `1 << (id-1)` của `Branch.services` |
| `name` | 1–32 byte, chỉ hiển thị |
| `requiresAny` | chi nhánh bật module này phải bật ít nhất một bit trong mặt nạ (Loyalty = NET\|IQR); không chứa chính nó; module 0 không có |
| `flags` | `FLAG_TAX_INCLUSIVE_ONLY = 1` (giá bắt buộc gồm thuế — NET); `FLAG_SALES = 2` (có doanh thu, thuế, được trừ ví — NET, IQR) |
| `permValid`, `permManagerOnly` | danh mục quyền (ADR 0033); `permManagerOnly ⊆ permValid` |
| `version` | tăng mỗi lần `updateModule` |
| `status` | `Active` / `Paused` / `Retired` |

Module mặc định khi deploy (`script/ModuleCatalog.sol`): 0 platform, 1 net (SALES + TAX_INCLUSIVE_ONLY), 2 iqr (SALES), 3 loyalty (requiresAny NET\|IQR). Danh mục quyền = 0 cho tới khi có `Permission`.

## 3. Hàm

| Hàm | Ai | Ghi chú |
|---|---|---|
| `registerModule(id, name, requiresAny, flags, permValid, permManagerOnly)` | owner | id ≤ 16, chưa tồn tại; trạng thái `Active` |
| `updateModule(id, requiresAny, flags, permValid, permManagerOnly)` | owner | không đổi tên; module chưa `Retired` |
| `setModuleStatus(id, status, reason)` | Active⇄Paused: admin/owner; →Retired: owner, một chiều | lý do 1–200 byte; **không** bị chặn bởi pause toàn hệ |
| `setModuleContract(addr, id, allowed)` | owner | gắn contract với module (`moduleOf`, `requireActiveModuleOf`) |
| `setAddress(key, addr)` / `addressOf(key)` | owner / ai cũng đọc | sổ địa chỉ (hook…) |
| `checkServices(mask)` / `checkServicesChange(mask, previous)` | view | mọi bit đã đăng ký, chưa Retired (trừ bit có sẵn trong `previous`), thoả `requiresAny` |
| `getModule`, `moduleIds`, `isActive`, `requireActive`, `serviceBit` | view | |

## 4. Ai dùng

- `AgentRegistry.createAgent / setAgentServices`, `BranchRegistry.createBranch / setBranchServices`: kiểm tập dịch vụ (thay `ServiceMask`, đã xoá).
- `BranchRegistry.requireWritable(branch, service)`: thêm `Registry.requireActive(moduleId)` → **cầu dao** cho mọi module và Ledger.
- `SalesSettings`: thuế chỉ cho module `FLAG_SALES`; `FLAG_TAX_INCLUSIVE_ONLY` cấm chế độ "chưa gồm thuế".
- `Ledger.setPoster`: giấy phép bán hàng chỉ cho module `FLAG_SALES`.
- T1/T2 lấy địa chỉ Registry qua `BranchRegistry.registry()` (AgentRegistry giữ bản riêng).

## 5. Deploy

- Hệ mới: `DeployPlatform` deploy Registry ngay sau PlatformAccess, khai báo module mặc định, `setRegistry` cho AgentRegistry + BranchRegistry.
- Hệ đã chạy (991): `docs/07` mục 5.4b.
