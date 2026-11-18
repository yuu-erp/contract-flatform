Trạng thái: khung (chưa điền) · Task: `tasks/00-4-luong-nghiep-vu.md` · Nguồn: meta-iqr `68d1d3c`


# 20. Luồng nghiệp vụ hệ cũ

Mỗi luồng: bên gọi → chuỗi `Contract.hàm` (theo thứ tự gọi thật) → state thay đổi → event. Đánh dấu ⚠️L (vòng lặp không trần) và ⚠️D (độ sâu gọi > 3).

Mẫu:

### <Tên luồng>

- **Bên gọi:** (vai, client, file:dòng nơi client gọi)
- **Chuỗi gọi:**
  1. `A.f()` (`file:dòng`) → 2. `B.g()` → …
- **State đổi:** `A.x[k]`, …
- **Event:**
- **Cảnh báo:** ⚠️L / ⚠️D, dẫn nguồn
- **Ghi chú:**

## 1. Hệ thống / agent / chi nhánh
### Tạo agent
### Tạo chi nhánh
### Bật / tắt dịch vụ trên chi nhánh

## 2. NET
### Đăng ký tài khoản
### Nạp tiền (yêu cầu, xác nhận, nạp tại máy)
### Mở phiên
### Heartbeat / trừ tiền
### Đóng phiên
### Đăng xuất máy (station logout)

## 3. IQR
### Gọi món
### Thanh toán PREPAID
### Thanh toán POSTPAID
### Huỷ món
### Huỷ đơn
### Hoàn một phần
### Đặt bàn

## 4. Loyalty
### Tích điểm theo hoá đơn
### Tích điểm theo nạp tiền
### Tier
### Campaign
### Tiêu điểm (khoá / xác nhận / huỷ)
### Voucher (đổi, dùng, trả lại)
### Hết hạn điểm
### Tích điểm thủ công
