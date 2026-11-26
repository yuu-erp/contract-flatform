# Permission + Duty — vị trí, quyền, ca trực (`shared/permission`, `shared/duty`)

Trạng thái: **Đặc tả chốt, đang cài** (Architecture Baseline tuần 4, người dùng duyệt 2026-11-26). Thay `docs/modules/core-staff.md`. ADR 0033.

## 0. Kiểm tra kiến trúc (`docs/02` mục 11)

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Tầng, contract, câu hỏi | T2. `Permission`: "ví này có quyền P của module M ở chi nhánh B **lúc này** không?". `Duty`: "ai đang trực ca nào, vị trí nào, đến khi nào?" |
| 2 | Điều kiện vào T2 | NET, IQR, Enterprise, AgentUserRegistry đều cần ngay; trung lập nghiệp vụ (chỉ biết "module", "bit quyền", "ca"); ADR 0033 |
| 3 | Tên module dưới T3 | Không. Danh mục quyền đọc từ `Registry` |
| 4 | Module chết | `can()` của module đó trả `false` (module `Paused`/tắt ở chi nhánh); module khác và quyền nền tảng không ảnh hưởng |
| 5 | Chạm tiền | Không. Két (ca thu ngân) thuộc `PaymentAccounts` |
| 6 | Kích thước | Mỗi contract dự kiến < 14 KB |
| 7 | Lịch sử | Chỉ event có version (vào/ra ca, giao ca, sửa vị trí). Bảng công tính ở indexer / module Enterprise |
| 8 | Dữ liệu cũ | Hệ cũ có staff + vai trò (`BranchAccessManager`), không có ca gắn quyền → migration chỉ chuyển nhân viên + vai trò; vị trí, ca tạo mới |
| 9 | Nâng cấp | T2: ADR + review |

## 1. Vai trò và quyền

| Vai trò | Nguồn | `can()` |
|---|---|---|
| Chủ agent | `AgentAccess.effectiveRoleOf` = Owner | đúng với mọi quyền hợp lệ của module đang bật |
| Manager | `AgentAccess` = Manager | như chủ agent, ở chi nhánh được giao; không cần ca |
| Staff | `AgentAccess` = Staff | bit không thuộc `permManagerOnly`, có **phiên trực đang mở** ở chi nhánh, vị trí của phiên có bit |

Quyền = `(moduleId, bit 0..63)`. Danh mục: `Registry.getModule(moduleId).permValid / permManagerOnly`.

### Danh mục quyền nền tảng (`moduleId = 0`)

| Bit | Quyền | Chỉ Manager |
|---|---|---|
| 0 | Đăng ký khách | |
| 1 | Sửa hồ sơ khách | |
| 2 | Cấp OTP đăng nhập | |
| 3 | Đặt lại mật khẩu khách | |
| 4 | Nhận tiền mặt nạp ví | |
| 5 | Xác nhận chuyển khoản | |
| 6 | Mở / đóng két, đối soát | |
| 7 | Xem doanh thu chi nhánh | |
| 8 | Hoàn tiền | ✔ |
| 9 | Chặn / mở khách | ✔ |
| 10 | Điều chỉnh doanh thu | ✔ |

`permValid = 0x7FF`, `permManagerOnly = 0x700` (`script/ModuleCatalog.sol`). Danh mục NET/IQR chốt khi đặc tả từng module. Bit đã dùng không đổi nghĩa.

## 2. Permission

### Dữ liệu

| Đối tượng | Trường | Giới hạn |
|---|---|---|
| Vị trí | `positionId` (toàn cục), `branchId`, `active`, `name` (1–50 byte), mặt nạ quyền theo từng `moduleId` | ≤ 32 vị trí / chi nhánh (kể cả đã ngừng) |

### Hàm ghi (Manager+ của chi nhánh, hệ không pause)

| Hàm | Kiểm |
|---|---|
| `createPosition(branchId, name, moduleIds[], masks[])` | độ dài khớp, ≤ 17 phần tử; mỗi mask ⊆ `permValid` và không chạm `permManagerOnly`; module đã đăng ký |
| `setPositionPerms(positionId, moduleId, mask)` | như trên; vị trí chưa ngừng |
| `renamePosition(positionId, name)` | |
| `setPositionActive(positionId, active)` | ngừng = mọi phiên đang dùng vị trí này mất quyền ngay |

### `can(branchId, account, moduleId, perm)` (view)

1. `perm < 64`, bit thuộc `permValid` của module; module `Active` ở Registry.
2. `moduleId ≠ 0`: chi nhánh bật module (`BranchRegistry.isServiceEnabled`).
3. Vai trò hiệu lực (`AgentAccess.effectiveRoleOf`): Owner / Manager → **đúng**. Không phải Staff → sai.
4. Staff: bit không thuộc `permManagerOnly`; `Duty.activeSessionOf(branchId, account)` có phiên; vị trí của phiên còn `active`, cùng chi nhánh, mặt nạ có bit.

`requirePermission(...)` = `can` + revert `NoPermission(branchId, account, moduleId, perm)`.

`account` là **tài khoản thật**. Module tự quy ví phiên → tài khoản qua `DelegateRegistry` trước khi hỏi (nguyên tắc 7).

## 3. Duty

### Dữ liệu

| Đối tượng | Trường | Giới hạn |
|---|---|---|
| Ca | `shiftId`, `branchId`, `startMin`, `endMin` (phút trong ngày giờ địa phương 0..1439; `end ≤ start` = qua đêm), `days` (bit 0 = Thứ 2 … bit 6 = CN), `active`, `name` | ≤ 16 ca / chi nhánh |
| Phân công | `(branchId, account) → [(shiftId, positionId)]` | ≤ 16 / nhân viên / chi nhánh |
| Phiên trực | `(branchId, account) → {shiftId, positionId, startedAt, scheduledEnd, hardEnd, source, deviceId}` | một phiên mở / nhân viên / chi nhánh |
| Cấu hình | `overtimeCapMinutes` theo chi nhánh | mặc định 240, 0..720 |
| Giao ca chờ | `(branchId, from) → to` | |

### Máy trạng thái phiên

```text
(không có) ──checkIn──► Đang trực ──(now ≥ scheduledEnd)──► Tăng ca ──(now ≥ hardEnd)──► Hết hạn
                          │                                   │
                          ├── checkOut / giao ca xong / Manager đóng ──► (không có)
                          └── extendSession (Manager) : hardEnd += phút
```

"Tăng ca" và "Hết hạn" là trạng thái **suy ra theo giờ**, không cần giao dịch. Phiên hết hạn coi như không có (được `checkIn` mới đè lên).

### Hàm

| Hàm | Ai | Kiểm / tác động |
|---|---|---|
| `createShift(branchId, name, startMin, endMin, days)` / `updateShift(...)` / `setShiftActive` | Manager+ | phút < 1440, `days ≠ 0`, `start ≠ end` |
| `setAssignments(branchId, account, (shiftId, positionId)[])` | Manager+ | account là Staff của chi nhánh; ca, vị trí cùng chi nhánh, đang dùng; thay toàn bộ danh sách |
| `setOvertimeCap(branchId, minutes)` | **chủ agent** | 0..720 |
| `checkIn(branchId, shiftId, positionId, deviceId)` | nhân viên | là Staff; có phân công `(shiftId, positionId)`; bây giờ thuộc cửa sổ `[bắt đầu − 15 phút, kết thúc)` của một lần ca (hôm qua / hôm nay / ngày mai theo giờ địa phương chi nhánh, đúng thứ trong tuần); chưa có phiên còn hạn |
| `checkInFor(branchId, account, shiftId, positionId, deviceId)` | Manager+ | như trên, `source = Manager` (vào ca hộ) |
| `checkOut(branchId)` | nhân viên | đóng phiên của mình (két: xem mục 4) |
| `requestHandover(branchId, to)` | người đang trực | `to` có phiên còn hạn ở chi nhánh |
| `acceptHandover(branchId, from)` | người nhận (`to`) | đóng phiên của `from`, phát `HandedOver` |
| `closeSession(branchId, account, reason)` | Manager+ | lý do 1–200 byte |
| `extendSession(branchId, account, minutes)` | Manager+ | `hardEnd += minutes`, ≤ 720 |
| `activeSessionOf(branchId, account)` | view | phiên còn hạn (`now < hardEnd`) hoặc rỗng |

Sự kiện (version 1): `ShiftSet`, `AssignmentsSet`, `CheckedIn(branch, account, shiftId, positionId, source, deviceId, scheduledEnd, hardEnd, by)`, `CheckedOut(branch, account, reason, overtimeSeconds, by)`, `HandoverRequested`, `HandedOver`, `SessionExtended`, `OvertimeCapSet`. `source`: 0 tự vào, 1 Manager vào hộ (2 thiết bị — khi có `Resource`). Enterprise và indexer dựng bảng công từ các sự kiện này.

## 4. Giao ca và két

- Người dùng chốt: **giao ca bắt buộc người ca sau xác nhận nhận két**.
- Két (ca thu ngân, đối soát) thuộc `PaymentAccounts` (`docs/08` mục 5), chưa cài. Khi cài: `PaymentAccounts` chặn `checkOut` của người còn giữ két mở (họ phải giao ca hoặc đóng két), và `acceptHandover` chuyển két sang người nhận sau khi người nhận xác nhận số đếm. Duty để sẵn hai bước `requestHandover` / `acceptHandover` cho việc đó.
- Manager vẫn đóng phiên thay được (`closeSession`, có lý do).

## 5. Bất biến (invariant test)

- Mỗi phân công trỏ vào ca và vị trí **cùng chi nhánh**.
- Staff không bao giờ `can()` với bit `permManagerOnly`.
- Không có phiên ⇒ Staff `can()` = false với mọi quyền.
- Số ca / vị trí / phân công không vượt trần.

## 6. Gas

`can()` là view; module gọi trong giao dịch tốn ~10–20k gas (đọc Registry, BranchRegistry, AgentAccess, Duty). `checkIn` ≤ 150k.
