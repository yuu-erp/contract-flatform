# 01. Nghiệp vụ

Mô tả theo mã meta-iqr tại `68d1d3c` (nhánh `feat/lock-member-voucher-restore`) và mong muốn của người dùng ngày 2026-11-18. Task GĐ0 (`tasks/00-kiem-ke-he-cu.md`) sẽ kiểm lại và bổ sung từng mục. Chỗ nào ghi **[cần xác nhận]** là chưa chắc.

## 1. Mô hình tenant

```text
Platform
 └─ Agent (chủ cửa hàng, có licence)
     ├─ cấu hình cấp agent: thuế, quyền admin/co-owner, tài khoản ngân hàng
     └─ Branch (chi nhánh)
         ├─ dịch vụ bật: NET? IQR? Loyalty? (Loyalty chỉ khi có NET hoặc IQR)
         ├─ staff + vai trò, chấm công
         ├─ tài nguyên dùng chung: khu vực, bàn, máy trạm (PC)
         └─ tài khoản thanh toán của chi nhánh
```

- Một agent có nhiều chi nhánh; dịch vụ bật **theo chi nhánh**.
- Khách hàng (ví) dùng chung cho toàn agent. Số dư/điểm theo dõi **theo chi nhánh** (hệ cũ: `EconomyVault` khoá `(agent, branch, account, token)`) Hệ mới (người dùng chốt 2026-11-18): khách dùng **một tài khoản ở mọi chi nhánh** của agent, nhưng **tiền nạp và doanh thu thuộc chi nhánh nơi khách nạp** (xem `docs/04-lo-trinh.md` câu 8).
- Hệ cũ: `AgentManagement`, `EnhancedAgentManagement` (licence, thuế, analytics), `BranchManagement`, `BranchModuleRegistry` (`MODULE_IQR/NET/LOYALTY/ROBOT`), `AgentModuleProvisioner`.

## 2. Hạ tầng dùng chung

| Khối | Nghiệp vụ | Hệ cũ |
|---|---|---|
| Quyền | agent admin, co-owner (có/không full access), branch manager, staff theo vai, quyền chi tiết (`PERM_LOYALTY_*`…) | `BranchAccessManager` (38 mapping) |
| Nhân sự | staff, vị trí, ca làm, chấm công, sự cố | `BranchManagement`, `AttendanceSystem` |
| Tài nguyên | khu vực, bàn, máy trạm — NET và IQR dùng chung | `BranchResourceRegistry` |
| Thanh toán | tài khoản ngân hàng thuộc chi nhánh (một tài khoản có thể dùng cho nhiều chi nhánh) | `BranchPaymentRegistry` |
| Sổ tiền | số dư khách theo chi nhánh, ledger có `refId` | `EconomyVault` |
| Nhật ký | audit trail thao tác quản trị | `BranchAuditTrail`, `HistoryTracking` |
| Doanh thu nền tảng | doanh thu agent theo ngày/tháng/năm, licence | `RevenueManager`, `EnhancedAgentManagement` |

## 3. Dịch vụ NET (NetCafe)

| Thực thể | Mô tả | Hệ cũ |
|---|---|---|
| Tài khoản khách | username, hash mật khẩu, ví; hiện có thêm phone/email/CCCD on-chain | `NetCafeUserV3` |
| Máy trạm, nhóm máy, bảng giá | giá theo nhóm/khung giờ | `NetCafeManagementV3`, station |
| Phiên chơi | mở trên máy, heartbeat trừ tiền định kỳ, đóng | `NetCafeSessionV3` |
| Nạp tiền | yêu cầu nạp, xác nhận, mã tham chiếu, nạp tại máy | `NetCafeTopUpV3` |
| Trừ tiền | trừ ví khách cho giờ chơi | `NetCafeSpendV3` |
| Dashboard | thống kê ngày/tháng | `NetCafeDashboardV3` |

Luồng tiền NET:

1. Nạp tiền → **xu chính** (Token A) của khách tại chi nhánh, tỉ lệ 1:1 VND.
2. Phiên chơi: mỗi heartbeat trừ xu chính (và xu thưởng nếu có Loyalty và chính sách cho phép).
3. Máy trạm dùng **session wallet** đại diện cho khách trong phiên.

**Điểm phải sửa ở hệ mới:** hệ cũ đặt **xu chính** (tiền khách nạp) trong Loyalty, và "NET buộc kèm Loyalty" (`CURRENT_FULL_FLOW.md` mục 0). Với quy tắc "Loyalty là bổ trợ", hệ mới phải tách:
- **Ví trả trước (xu chính)** thuộc hạ tầng thanh toán/Ledger, NET dùng được khi không bật Loyalty.
- **Loyalty** chỉ giữ điểm thưởng (xu thưởng), hạng, chiến dịch, voucher.

## 4. Dịch vụ IQR (nhà hàng)

| Thực thể | Mô tả | Hệ cũ |
|---|---|---|
| Thực đơn | danh mục, món, biến thể, thuộc tính, banner | `Management` |
| Khuyến mãi của quán | mã giảm giá, giới hạn lượt/khách | `Management`, `PromotionCodeLib` |
| Phiên bàn / đơn | phiên theo bàn, gộp bàn, đơn, món, course | `RestaurantOrder` |
| Thanh toán | PREPAID (khoá trước, xác nhận sau) và POSTPAID; tiền mặt/thẻ/ví/xu thưởng; huỷ món, hoàn một phần | `RestaurantOrder` |
| Đặt bàn | đặt trước theo giờ | `RestaurantOrder` |
| Báo cáo | doanh thu món, theo ngày | `RestaurantReporting` |

Thứ tự trừ khi thanh toán: xu thưởng (nếu khách chọn, theo trần %) → xu chính (nếu chọn ví) → phần còn lại tiền mặt/thẻ.

## 5. Module Loyalty (bổ trợ)

| Thực thể | Mô tả |
|---|---|
| Member | khách đăng ký thành viên (tự đăng ký hoặc do NET/IQR đăng ký hộ); có thể bị khoá |
| Nhóm member | phân nhóm để nhắm chiến dịch |
| Điểm thưởng (xu thưởng) | theo **batch** có hạn dùng; tiêu batch sắp hết hạn trước; hết hạn thì mất |
| Nguồn điểm | cashback % hoá đơn, thưởng theo hạng, chiến dịch (sự kiện: nạp tiền, chơi net, thanh toán đồ ăn) |
| Hạng (tier) | theo tổng chi tiêu; tăng % thưởng, hệ số chiến dịch, trần dùng điểm |
| Chiến dịch | theo loại sự kiện, điều kiện tối thiểu, hạng, phạm vi chi nhánh, cộng dồn/loại trừ |
| Voucher đổi điểm | catalog voucher; khách đổi điểm lấy voucher; dùng khi thanh toán; trả lại khi huỷ đơn |
| Chính sách tiêu điểm | trần % hoá đơn theo dịch vụ (NET/FOOD), trần tuyệt đối, tỉ giá điểm → VND |
| Yêu cầu tích điểm thủ công | nhân viên tạo, admin duyệt |

Loyalty nhận sự kiện từ dịch vụ chính (đơn đã trả, phiên đã tính tiền, nạp tiền) và cấp điểm. Dịch vụ chính hỏi Loyalty "được trừ tối đa bao nhiêu điểm" rồi khoá/trừ.

## 6. Bất biến nghiệp vụ (phải giữ ở hệ mới)

- Một hoá đơn/lần nạp chỉ được tích điểm một lần.
- Tổng điểm khoá cho một thanh toán ≤ số dư khả dụng; huỷ thì trả đúng batch cũ (giữ hạn dùng cũ).
- Không phát sinh điểm thưởng không có hạn dùng.
- Số tiền hoàn ≤ số tiền đã trừ cho cùng thanh toán.
- Khách bị khoá không tích, không tiêu.
- Mọi thay đổi số dư có bản ghi ledger với `refId` duy nhất theo `(agent, branch, refId, reason)`.
