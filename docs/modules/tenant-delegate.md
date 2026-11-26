# DelegateRegistry + CustomerDesk — ví phiên, OTP, QR và quầy khách

Trạng thái: **Đã cài** (Baseline tuần 4, 2026-11-26). Nguyên tắc 7, ADR 0035.

## 1. Câu hỏi mỗi contract trả lời

| Contract | Tầng | Câu hỏi |
|---|---|---|
| `DelegateRegistry` | T1 | Ví này đang thay mặt tài khoản nào, tới khi nào? |
| `CustomerDesk` | T2 | Nhân viên này (đang trực, vị trí có quyền) có được làm thao tác này trên tài khoản khách không? Nếu có thì làm hộ ở T1 |
| `AgentUserRegistry` | T1 | Tài khoản: định danh, đăng nhập, hồ sơ. Thao tác nhân viên chỉ qua cổng operator (`*For`) |

## 2. Quy người gọi về tài khoản — `resolve(agentId, caller)`

1. `caller` là ví phiên còn hạn, tài khoản còn `Active`, `loginEpoch` khớp → tài khoản.
2. `caller` là địa chỉ đăng nhập hiện tại → tài khoản.
3. Còn lại → chính `caller` (ví thật: chủ agent, Manager dùng ví riêng).

Dùng ở `Duty`, `Permission` (ghi), `CustomerDesk`; module NET/IQR dùng khi có.

## 3. Ba cách mở ví phiên

| Cách | Hàm | Ai ký |
|---|---|---|
| Đăng nhập username + mật khẩu ngay trên máy | `openSession(agentId, delegate, ttl)` | địa chỉ đăng nhập (gửi trực tiếp) |
| Quét QR bằng điện thoại đã đăng nhập | `openSessionBySig(...)` | địa chỉ đăng nhập ký EIP-712 `OpenSession`, ai gửi hộ cũng được; nonce chống dùng lại |
| OTP nhân viên cấp | `openSessionByOtp(...)` | khoá sinh từ mã OTP ký `OtpLogin`; OTP dùng một lần |

- TTL ví phiên ≤ 24 giờ; OTP ≤ 10 phút.
- Ví phiên / OTP không được trùng địa chỉ đăng nhập hay định danh tài khoản (`DelegateInUse`).
- Vô hiệu khi: hết hạn; đổi / đặt lại mật khẩu (`loginEpoch` tăng); tài khoản bị chặn; `revokeSession` (chính ví phiên, hoặc chủ tài khoản).
- EIP-712 domain: `MetaNetDelegate`, version `1`.

## 4. CustomerDesk — quyền nền tảng (module 0)

| Hàm | Bit quyền | Gọi tới |
|---|---|---|
| `registerCustomer` | 0 | `AgentUserRegistry.registerFor` |
| `updateCustomerProfile` | 1 | `updateProfileFor` |
| `issueOtp` | 2 | `DelegateRegistry.issueOtp` |
| `resetCustomerLogin` | 3 | `resetLoginFor` (tăng `loginEpoch`) |
| `setCustomerBlocked` | 9 (chỉ Manager) | `setBlockedFor` |

Nhật ký (audit FullDB) ghi **nhân viên thật** làm người thực hiện (`PlatformAuditing._writeAuditAs`), không ghi địa chỉ Desk.

## 5. Deploy

- Hệ mới: `DeployPlatform` deploy và nối đủ (operator, `setDelegate` cho Permission + Duty).
- Hệ đã chạy: `make deploy-users` (sau `make deploy-staff`) deploy AgentUserRegistry + DelegateRegistry + CustomerDesk.

## 6. Test

`test/tenant/delegate/DelegateRegistry.t.sol` (10), `test/shared/desk/CustomerDesk.t.sol` (5), `test/tenant/user/AgentUserRegistry.t.sol` (cổng operator), invariant AgentUserRegistry (handler đóng vai operator).
