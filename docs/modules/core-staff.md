# Nhân sự chi nhánh: ca làm, vị trí, quyền (`core/staff`)

Trạng thái: **Kế hoạch, chờ duyệt** (Claude Code, 2026-11-26). Chưa có code.

## 1. Yêu cầu (người dùng, 2026-11-26)

Manager quản lý nhân viên chi nhánh theo thứ tự:

1. **Tạo ca làm việc** (ví dụ: ca sáng 06:00–14:00, ca chiều 14:00–22:00, ca đêm 22:00–06:00).
2. **Tạo vị trí**. Một vị trí có **một hoặc nhiều quyền** (ví dụ: "Thu ngân" = nạp tiền + mở máy + đăng ký khách).
3. **Tạo nhân viên.**
4. **Gán nhân viên vào ca làm việc và vị trí.**

Nhân viên chỉ làm được những việc mà vị trí của họ cho phép.

## 2. Hiện trạng và chỗ đặt

- `AgentAccess` (đã có) chỉ biết 3 bậc: chủ agent → Manager → Staff. Staff làm được mọi việc của Staff, chưa chia nhỏ.
- Module mới **`StaffRegistry`** (`src/core/staff`) nằm **trên** `AgentAccess`:
  - `AgentAccess` vẫn trả lời "ví X có phải nhân viên của chi nhánh B không" (thêm / xoá nhân viên vẫn ở đây);
  - `StaffRegistry` trả lời "nhân viên X **lúc này** có được làm việc P không".
- Mọi module (AgentUserRegistry, NET, IQR, nạp tiền) chỉ hỏi một câu: `can(branchId, ví, quyền)`.

## 3. Danh mục quyền (cố định trong code)

Quyền là bit trong một số `uint64`, do nền tảng định nghĩa sẵn (contract cần biết từng quyền để kiểm). Manager chỉ **chọn** quyền cho vị trí, không tạo quyền mới.

| Nhóm | Quyền | Ai được gán |
|---|---|---|
| Máy trạm (NET) | mở máy, tắt máy, chuyển máy, gia hạn giờ, đặt máy trước | Staff |
| Tiền | nhận tiền mặt nạp ví, xác nhận chuyển khoản, bán trực tiếp | Staff |
| Tiền | hoàn tiền, điều chỉnh tăng/giảm | **chỉ Manager** (hoặc vị trí được chủ agent cho phép) |
| Món (IQR) | nhận đơn, phục vụ / trả món, huỷ món | Staff |
| Khách | đăng ký khách, sửa hồ sơ, cấp OTP, đặt lại mật khẩu | Staff |
| Khách | chặn / mở khách | **chỉ Manager** |
| Ca | vào ca / ra ca (chấm công), đối soát két cuối ca | Staff |
| Báo cáo | xem doanh thu chi nhánh | Staff (tuỳ vị trí) |

Danh sách chính xác chốt khi viết NET / IQR; thêm quyền mới = nâng cấp contract, bit cũ giữ nguyên nghĩa.

## 4. Mô hình dữ liệu

| Đối tượng | Thuộc | Trường chính | Ai tạo / sửa |
|---|---|---|---|
| **Ca làm** | chi nhánh | tên, giờ bắt đầu, giờ kết thúc (phút trong ngày, giờ địa phương của chi nhánh; qua đêm được), các thứ trong tuần, trạng thái | Manager+ |
| **Vị trí** | chi nhánh (xem câu hỏi 1) | tên, mặt nạ quyền, trạng thái | Manager+; quyền "chỉ Manager" chỉ chủ agent mới đưa vào vị trí được |
| **Phân công** | nhân viên × chi nhánh | danh sách (ca, vị trí) | Manager+ |

Giới hạn để không có vòng lặp không trần (nguyên tắc 2): ≤ 16 ca / chi nhánh, ≤ 32 vị trí / chi nhánh, ≤ 16 phân công / nhân viên / chi nhánh.

Xoá ca / vị trí = **ngừng dùng** (xoá mềm), phân công đang trỏ vào thì mất hiệu lực, lịch sử giữ nguyên.

## 5. Kiểm quyền lúc thao tác

`can(branchId, ví, quyền)` đúng khi **một** trong các điều sau đúng:

1. Ví là **chủ agent** → mọi quyền.
2. Ví là **Manager** của chi nhánh → mọi quyền của chi nhánh.
3. Ví là **Staff** của chi nhánh, **đang trong một ca được phân công** (theo giờ địa phương của chi nhánh), và **vị trí gắn với ca đó** có quyền này. Nếu dùng chấm công (câu hỏi 3) thì thêm điều kiện **đã vào ca**.

Thu hồi Staff ở `AgentAccess`, xoá phân công, ngừng ca / vị trí → mất quyền **ngay**, vì kiểm lại ở mỗi thao tác.

## 6. Nối với ví phiên (`DelegateRegistry`)

- Nhân viên **vào ca** trên máy quầy (quét QR bằng điện thoại hoặc username + mật khẩu) → máy nhận **ví phiên nhân viên**, hết hạn **đúng giờ kết thúc ca**.
- Ví phiên chỉ mang danh nghĩa nhân viên; quyền vẫn kiểm theo §5 với nhân viên thật.
- Nhật ký ghi cả nhân viên thật và ví phiên / máy.
- Chủ agent không dùng ví phiên (xem phân tích trước).

## 7. Thứ tự triển khai

| Bước | Nội dung |
|---|---|
| S1 | `StaffRegistry`: ca, vị trí, phân công, `can()`; test + invariant (phân công không trỏ vào ca / vị trí của chi nhánh khác) |
| S2 | `DelegateRegistry`: phiên khách + phiên nhân viên (vào ca) |
| S3 | `AgentUserRegistry` đổi từ "Staff trở lên" sang `can(…, quyền cụ thể)` (nâng cấp UUPS) |
| S4 | UI app cyber: Manager quản lý ca / vị trí / phân công; Staff vào ca, màn quầy chỉ hiện nút theo quyền |
| — | Sau đó NET, IQR dùng `can()` ngay từ đầu |

## 8. Câu hỏi cần chốt

1. **Vị trí** tạo riêng **từng chi nhánh**, hay tạo **chung cho cả agent** (chủ agent định nghĩa "Thu ngân", "Phục vụ" một lần, mọi chi nhánh dùng)?
2. **Phân công**: gán theo cặp **(ca, vị trí)** (sáng làm Thu ngân, tối làm Phục vụ), hay nhân viên có **một vị trí cố định** và được gán vào các ca?
3. **Ngoài giờ ca** nhân viên có thao tác được không? Có cần **chấm công vào ca / ra ca** không? Đề xuất: **có chấm công**, vào ca mở ví phiên, chỉ thao tác được trong ca đã vào.
4. **Ca lặp theo thứ trong tuần** (T2–CN) hay **lịch theo từng ngày** (xếp lịch tuần sau cho từng người)?
5. Danh mục quyền §3 đã đủ chưa, quyền nào cần chuyển giữa "Staff" và "chỉ Manager"?
6. Manager có cần bị giới hạn bởi vị trí không, hay Manager luôn có mọi quyền ở chi nhánh mình quản lý?
