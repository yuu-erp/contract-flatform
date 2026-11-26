# 0029. Cây bốn tầng và tiêu chí đặt chỗ

- Trạng thái: **Chốt**
- Ngày: 2026-11-26
- Người duyệt: người dùng (họp kiến trúc 2026-11-26)

## Bối cảnh

Tiêu chí cũ (`docs/06` mục 2.1): "chi nhánh nào cũng cần thì vào `core/`". Theo câu này, nhân viên, ca, chấm công, máy trạm, bàn, thiết bị, tài khoản khách đều vào `core/`, và mỗi lần bàn tính năng là `core/` phình thêm. Cùng lúc, lõi đã biết tên module (`ServiceMask`, `SERVICE_*`), nên thêm module (Enterprise) phải nâng cấp lõi. `core/` cũng trộn thứ rủi ro cao, hiếm đổi (Ledger, PlatformAccess) với thứ đổi thường xuyên (lịch ca), chung một quy trình review.

Người dùng yêu cầu: hệ là một cái cây, cành lá chết thì thân rễ vẫn sống; thêm module không phải nâng cấp nền tảng.

## Quyết định

1. Chia `src/` thành bốn tầng, phụ thuộc chỉ đi xuống:
   - **T0 Rễ (kernel):** quản trị nền tảng, sổ địa chỉ + danh sách module, cổng lịch sử. Không biết nghiệp vụ.
   - **T1 Thân (tenant):** agent, chi nhánh, vai trò, tài khoản, uỷ quyền. Trả lời "ai, thuộc đâu, thay mặt ai".
   - **T2 Cành chính (shared):** dịch vụ dùng chung trung lập nghiệp vụ: tiền, thanh toán, quyền chi tiết, ca trực, tài nguyên.
   - **T3 Lá (modules):** dịch vụ bật/tắt theo chi nhánh.
2. **T0–T2 không biết tên module** (luật L2).
3. **Mặc định đặt ở module.** Một khả năng chỉ vào T2 khi đủ cả ba:
   - ≥ 2 module cần **ngay bây giờ** (không phải "sau này có thể");
   - trung lập nghiệp vụ (diễn đạt được mà không dùng từ "máy trạm", "món", "điểm"…);
   - có ADR.
4. Mỗi contract trả lời một câu hỏi, ghi ở `docs/02` mục 3.
5. Mức review nâng cấp theo tầng (L7).

## Phương án đã cân nhắc

| Phương án | Bỏ vì |
|---|---|
| Giữ `core/` + `modules/`, chỉ siết review | Không có ranh giới máy kiểm được; đã thất bại thực tế (4 khối suýt vào lõi trong một tuần) |
| Hai tầng: platform + modules, đẩy hết Ledger/quyền vào module | Tiền phải ở một chỗ dùng chung (nguyên tắc 3, Y1); module chết không được kéo theo tiền |
| Mỗi module tự quản lý nhân viên, quyền, thiết bị | Ba bản khác nhau cho cùng khái niệm; khách hàng đầu tiên dùng NET + IQR cùng lúc với cùng nhân viên |

## Hệ quả

- `docs/02` viết lại theo bốn tầng; `docs/06` đổi tiêu chí.
- Các khối đã bàn được xếp lại: `StaffRegistry` tách `Permission` + `Duty` (T2); chấm công doanh nghiệp là module Enterprise (T3); `DeviceRegistry` gộp vào `Resource` (T2, chỉ danh tính + trạng thái); danh sách module gộp vào `Registry` (T0); tài khoản nhân viên dùng `AgentUserRegistry` (T1).
- Nợ N1–N9 (`docs/02` mục 10) được xử lý trong Architecture Baseline.
