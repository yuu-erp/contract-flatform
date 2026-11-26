# 09. Kịch bản chuẩn: NET + IQR + Loyalty

Trạng thái: **Chốt** (2026-11-26). Đây là thước đo cho mọi thiết kế: đặc tả module nào cũng phải chỉ ra mình phục vụ bước nào ở đây; khi đủ module, kịch bản này thành test đầu cuối `test/e2e/StandardScenario.t.sol`.

Lý do: khách hàng đang kinh doanh thật trên hệ cũ dùng đúng tổ hợp này (người dùng, 2026-11-26): khách chơi net, gọi đồ ăn tại máy, trả bằng một ví, tích điểm, dùng voucher.

## 1. Bối cảnh

| Đối tượng | Giá trị |
|---|---|
| Agent | "Cyber Demo", chủ agent `Chủ` |
| Chi nhánh | `HD` (Hà Đông) bật NET + IQR + Loyalty; `TX` (Thanh Xuân) bật NET + Loyalty |
| Nhân sự HD | Manager `Hùng`; Staff `Lan` (ca sáng 06–14 Thu ngân), `Minh` (ca chiều 14–22 Thu ngân), `Bếp` (ca sáng Bếp) |
| Vị trí HD | Thu ngân: nền tảng {đăng ký khách, nhận tiền mặt, vào/ra ca, đối soát két}, NET {mở máy, gia hạn}, IQR {đóng bàn}. Bếp: nền tảng {vào/ra ca}, IQR {nhận món, trả món} |
| Khách | `Tèo` (tài khoản username + mật khẩu, không biết ví) |
| Giá | NET 10.000đ/giờ; mì 25.000đ; thuế 0 để dễ kiểm |
| Loyalty | cashback 10% mọi chi tiêu ví; voucher "Giảm 5.000đ" đổi bằng 50 điểm |

## 2. Luồng chính

| # | Bước | Tầng chạm | Kiểm |
|---|---|---|---|
| 1 | 06:55 Lan vào ca trên máy quầy (QR) | T1 Delegate (ví phiên → Lan) · T2 Duty (mở phiên) | `can(HD, Lan, 0, VÀO_CA)` đúng; phiên đến 14:00 |
| 2 | Lan mở ca két, tiền đầu ca 500.000đ | T2 PaymentAccounts | ca két `Open` |
| 3 | Tèo tự đăng ký tại quầy, Lan xác nhận | T1 AgentUserRegistry · T2 Permission | tài khoản Tèo `Active` |
| 4 | Tèo nạp 100.000đ tiền mặt | T2 Permission → PaymentAccounts → Ledger `Topup` | số dư Tèo 100.000 (túi HD); két dự kiến 600.000 |
| 5 | Tèo đăng nhập máy 12 | T1 Delegate (máy 12 → Tèo) · T2 Resource · **T3 NET** mở phiên | phiên NET `Open` |
| 6 | Chơi 2 giờ, NET trừ theo heartbeat | **T3 NET** → Ledger `WalletSpend` (module NET) | số dư 80.000; hook Loyalty +2.000 điểm… (10% × 20.000 = 2.000đ quy điểm theo tỉ giá) |
| 7 | Tèo gọi mì từ máy 12 | **T3 IQR** tạo đơn gắn máy 12 | đơn `Placed` |
| 8 | Bếp nhận món, trả món | **T3 IQR** · `can(HD, Bếp, IQR, TRẢ_MÓN)` | đơn `Served` |
| 9 | Tèo dùng voucher 5.000đ, trả 20.000đ bằng ví | **T3 IQR** hỏi **T3 Loyalty** (qua hook) → Ledger `WalletSpend` (module IQR) | số dư 60.000; voucher `Used`; cashback trên 20.000 |
| 10 | Tèo đứng dậy, NET đóng phiên | **T3 NET** | phiên `Closed`, storage phiên được dọn |
| 11 | 14:00 Minh chưa tới → Lan tăng ca | T2 Duty | phiên Lan `Overtime`, Lan vẫn `can(...)` |
| 12 | 14:40 Minh vào ca; Lan giao ca, đếm két 600.000đ, Minh xác nhận | T2 Duty · PaymentAccounts | ca két Lan `Closed`, chênh 0; phiên Lan đóng, tăng ca 40 phút |
| 13 | Hôm sau Tèo chơi ở TX bằng số dư cũ | **T3 NET** ở TX → Ledger | trừ túi HD; doanh thu `SERVED_HERE` cho TX, tiền nạp thuộc HD |
| 14 | Cuối ngày Hùng xem doanh thu HD | T0 HistoryIndex / bộ đếm Ledger | NET 20.000, IQR 20.000, nạp 100.000 |

**Bất biến kiểm sau mỗi bước:** tổng cộng − tổng trừ của Ledger = tổng số dư; mỗi `refId` một lần; điểm Loyalty một lần mỗi hoá đơn.

## 3. Biến thể "cành chết" (Y1, ADR 0031)

| # | Sự cố | Kỳ vọng |
|---|---|---|
| F1 | Admin **tạm dừng NET** lúc bước 6 | NET mọi lệnh ghi revert; bước 7–9 (IQR) vẫn chạy; Ledger từ chối lệnh từ contract NET; nạp tiền vẫn chạy |
| F2 | **Loyalty revert mọi lệnh** ở bước 6, 9 | Trừ tiền NET và thanh toán IQR vẫn thành công **không dùng voucher**; có `HookFailed`; sau khi sửa, `replay` cộng điểm đúng một lần |
| F3 | **Bản NET mới tính sai** | Quay proxy NET về bản cũ; số dư khách không đổi do sự cố quay lui |
| F4 | NET bị lỗi gửi `WalletSpend` lặp cùng `refId` hoặc vượt trần | Ledger từ chối (`RefIdUsed`, vượt `maxAmount`) |
| F5 | IQR bị **ngừng hẳn** (`Retired`) | Dữ liệu đơn chỉ đọc; số dư Tèo nguyên; NET + Loyalty vẫn chạy |
| F6 | FullDB lỗi (ADR 0032, chờ đội chain) | Nạp, trừ tiền vẫn thành công; lịch sử phát `HistoryDeferred`, `reindex` ghi bù |
| F7 | Thu hồi Staff của Lan giữa ca | Lệnh tiếp theo của Lan bị từ chối ngay, ví phiên trên máy quầy vô dụng |

## 4. Ánh xạ dữ liệu cũ (Y5)

Mỗi đối tượng trong kịch bản phải có nguồn ở meta-iqr khi migration: tài khoản `NetCafeUserV3` → `AgentUserRegistry`; xu chính trong Loyalty/`EconomyVault` → túi Ledger theo chi nhánh; batch điểm → Loyalty `RewardLedger`; voucher → Loyalty; máy trạm `BranchResourceRegistry` → `Resource` + NET. Chi tiết ở `docs/03-chuyen-du-lieu.md` khi tới giai đoạn migration.
