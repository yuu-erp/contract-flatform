# 0035. Thao tác nhân viên trên tài khoản khách (T1 không gọi lên T2)

- Trạng thái: **Đề xuất** — chờ người dùng chọn
- Ngày: 2026-11-26
- Người duyệt: người dùng (đổi cấu trúc T1)

## Bối cảnh

`AgentUserRegistry` (T1) có 4 thao tác do nhân viên làm: đăng ký hộ, sửa hồ sơ hộ, cấp OTP, đặt lại mật khẩu; và 1 thao tác Manager: chặn / mở khách. Hiện kiểm "Staff trở lên" (`AgentAccess`). Theo ADR 0033 phải kiểm quyền cụ thể bằng `Permission.can()` (đang trực, vị trí có quyền). Nhưng `Permission` ở T2: T1 gọi lên T2 là trái luật L1, và làm thân cây phụ thuộc cành (Y1).

Đồng thời `AgentUserRegistry` đang 23.044 B (nợ N4).

## Phương án

| | Cách làm | Ưu | Nhược |
|---|---|---|---|
| **A** | `AgentUserRegistry` gọi `Permission.can()` qua interface | ít sửa | trái L1; Permission lỗi thì nhân viên không đăng ký hộ được; AgentUserRegistry phình thêm |
| **B (đề xuất)** | Tách 5 thao tác nhân viên ra contract T2 `CustomerDesk` ("quầy khách"): Desk kiểm `Permission.can()` rồi gọi hàm *operator-only* của `AgentUserRegistry`. `AgentUserRegistry` chỉ còn: tự đăng ký / đổi mật khẩu bằng chữ ký, tra cứu, và cổng operator (chỉ contract được owner cấp) | đúng L1; T1 không phụ thuộc T2; `AgentUserRegistry` nhỏ lại ~4–5 KB (giải nợ N4); mọi quầy (NET, IQR, Enterprise) dùng chung một Desk | thêm một contract; đổi ABI các hàm staff (app agent đổi theo — chưa deploy trên 991 nên chưa ai dùng) |
| C | Giữ "Staff trở lên" | không sửa | không phân quyền theo vị trí / ca như người dùng yêu cầu |

## Đề xuất

Chọn **B**. Làm cùng đợt tách OTP sang `DelegateRegistry` (N4), trước khi `make deploy-users` trên chain 991.
