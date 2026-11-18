# Đặc tả: vai trò cấp agent (AgentAccess)

Trạng thái: **Đã triển khai** (Claude Code, 2026-11-18) theo yêu cầu người dùng. Chưa có co-owner, chưa có biểu quyết.
Mã: `src/interfaces/IAgentAccess.sol`, `src/core/access/AgentAccess.sol` (13,4 KB)
Phụ thuộc: `AgentRegistry` (chủ agent), `BranchRegistry` (chi nhánh), `HistoryIndex` (audit), `PlatformAccess` (pause, nâng cấp)

## 1. Yêu cầu (người dùng, 2026-11-18)

- Tạm chưa làm co-owner và biểu quyết.
- Chủ agent tạo quản lý chi nhánh. Quản lý chi nhánh tạo nhân viên.
- Chủ agent có toàn quyền, nên cũng tạo được nhân viên cho chi nhánh.

## 2. Vai trò

| Vai trò | Lưu ở | Ai cấp / thu | Phạm vi |
|---|---|---|---|
| `Owner` (chủ agent) | **không lưu ở đây**: `AgentRegistry.getAgent(id).owner` | `PLATFORM_ADMIN` qua `proposeAgentOwner` / `acceptAgentOwner` | mọi chi nhánh của agent |
| `Manager` | `AgentAccess.member[branchId][ví]` | chủ agent | một chi nhánh |
| `Staff` | `AgentAccess.member[branchId][ví]` | chủ agent, hoặc `Manager` của chính chi nhánh đó | một chi nhánh |

Thứ bậc `None < Staff < Manager < Owner` (enum `IAgentAccess.Role`). Module hỏi "ít nhất vai trò X" bằng `hasRole` / `requireRole`.

Tầng quản trị nền tảng (`PLATFORM_OWNER`, `PLATFORM_ADMIN`) **không** cấp vai trò agent và **không** được nhận vai trò agent.

## 3. Ma trận quyền

| Hàm | Chủ agent | Manager (cùng chi nhánh) | Staff | Khác (kể cả admin nền tảng) |
|---|---|---|---|---|
| `grantRole(b, ví, Manager)` | ✓ | — | — | — |
| `grantRole(b, ví, Staff)`, ví chưa có vai trò | ✓ | ✓ | — | — |
| `grantRole` đổi Staff ↔ Manager | ✓ | — | — | — |
| `revokeRole(b, Manager)` | ✓ | — | — | — |
| `revokeRole(b, Staff)` | ✓ | ✓ | — | — |
| `renounceRole(b)` | — | chính mình | chính mình | — |

## 4. Luật

| # | Luật | Kiểm ở |
|---|---|---|
| A1 | Cấp vai trò: hệ không pause, chi nhánh `Active`, agent `Active` | `grantRole` |
| A2 | Thu vai trò và tự rời chạy được khi chi nhánh/agent đã dừng hoặc xoá (chỉ cần hệ không pause), để luôn thu quyền được | `revokeRole`, `renounceRole` |
| A3 | Ví nhận vai trò khác `0x0`, khác chủ agent, không phải owner / pending owner / admin nền tảng | `grantRole` |
| A4 | Một ví có tối đa một vai trò trong mỗi chi nhánh; có thể ở nhiều chi nhánh (kể cả của agent khác) | `member[branchId][ví]` |
| A5 | Trần: 200 thành viên mỗi chi nhánh, 20 chi nhánh mỗi ví. Danh sách xoá kiểu swap-pop, view phân trang tối đa 100 | `_add`, `_remove`, `_page` |
| A6 | Vai trò hiệu lực là `None` khi chi nhánh hoặc agent đã `Deleted`; vai trò đã lưu vẫn giữ để thu hồi | `effectiveRoleOf` |
| A7 | Đổi chủ agent đổi quyền `Owner` ngay, không cần thao tác ở AgentAccess | `effectiveRoleOf` đọc `AgentRegistry` |
| A8 | Mỗi lần cấp / thu / tự rời phát `RoleChanged` và ghi audit `access_grant` / `access_revoke` / `access_renounce` vào `mp1_platform_audit` (nhãn `G`, `B`, `X`, `R`) | `_audit` |

`requireRole` chỉ kiểm vai trò. Module vẫn phải gọi `BranchRegistry.requireWritable(branchId, service)` để kiểm pause, trạng thái và dịch vụ.

## 5. Dữ liệu

```text
Member { address grantedBy; uint64 grantedAt; uint16 indexPlusOne; Role role; }   // một slot
AgentAccessStorage (erc7201:metaplatform.core.access.agent)
  agents, branches, history
  members[branchId]            → address[]
  member[branchId][ví]         → Member
  branchesOf[ví]               → uint64[]
  branchIndexPlusOne[ví][branchId] → uint16
```

Không lưu tên, SĐT nhân viên (nguyên tắc 8). Hồ sơ nhân viên, ca làm, chấm công thuộc `core/staff` (giai đoạn 3).

## 6. Deploy

- Hệ mới: `make deploy` đã gồm AgentAccess và đăng ký nó làm writer của `HistoryIndex`.
- Hệ đã deploy trước khi có AgentAccess (chain 991): người dùng chạy `make deploy-agent-access` bằng ví owner. Script đọc địa chỉ proxy từ `deployments/platform-<chainid>.json` rồi ghi thêm `agentAccessProxy`, `agentAccessImpl`; từ chối nếu khoá đã có.

## 7. Để sau

- Co-owner (đồng sở hữu), biểu quyết.
- Quyền chi tiết theo bit cho nhân viên (thu ngân, phục vụ…), khi làm `core/staff` và các module dịch vụ.
- Admin nền tảng thu hồi khẩn cấp vai trò agent (chưa có yêu cầu).
