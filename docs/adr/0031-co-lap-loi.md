# 0031. Cô lập lỗi: cầu dao module, tường lửa tiền, hook an toàn

- Trạng thái: **Chốt** — người dùng duyệt 2026-11-26
- Ngày: 2026-11-26
- Người duyệt: người dùng

## Bối cảnh

Yêu cầu Y1: cành, lá chết thì thân, rễ vẫn sống. "Chết" gồm: module có bug (tính sai tiền, revert liên tục), module bị khai thác, module bị bỏ. Hiện có sẵn một phần: Ledger chỉ nhận lệnh từ poster theo mặt nạ loại bút toán, `refId` chống trùng, hoàn tiền do Ledger tự tính. Chưa có: dừng riêng một module, gắn poster với module, trần mỗi giao dịch, gọi hook an toàn.

## Quyết định

### C1. Lõi không gọi module

Luật L1. Ngoại lệ duy nhất là hook (C4), luôn gọi an toàn.

### C2. Cầu dao từng module

- `Registry` giữ `status` mỗi module: `Active` / `Paused` / `Retired`.
- `PLATFORM_ADMIN` (owner hoặc admin) được `Paused ⇄ Active`. Chỉ `PLATFORM_OWNER` được `Retired` (một chiều).
- Khi module không `Active`:
  - mọi hàm ghi của module revert (`Registry.requireActive` ở đầu hàm);
  - **T2 từ chối mọi lệnh ghi đến từ contract của module đó** (Ledger, HistoryIndex, Duty… kiểm `Registry.moduleOf(msg.sender)` còn `Active`). Đây là lớp chặn thứ hai, phòng khi bản module lỗi quên kiểm.
- Pause toàn hệ (`PlatformAccess.pause`) giữ nguyên cho sự cố ở T0–T2.

### C3. Tường lửa tiền ở Ledger

Mỗi poster gắn với **một** module và có giấy phép:

| Trường | Ý nghĩa |
|---|---|
| `moduleId` | Bút toán của poster này luôn ghi nhận cho module này. Ledger **không** nhận `service` do bên gọi tự khai |
| `kindsMask` | Loại bút toán được phép (đã có) |
| `maxAmount` | Trần số tiền mỗi bút toán (0 = không cho) |

- `refId` chống trùng (đã có). Hoàn tiền do Ledger tự tính từ bút toán gốc (đã có).
- Tiền chỉ **vào** ví qua `Topup` từ poster thanh toán (`PaymentAccounts`), không từ module dịch vụ. NET/IQR chỉ được `WalletSpend`, `DirectSale`, `SaleRefund` của chính bút toán mình.
- Invariant hiện có giữ nguyên: tổng cộng − tổng trừ = tổng số dư.

Trần ngày theo chi nhánh để sau (Y4: quy mô nhỏ).

### C4. Hook an toàn

- Dịch vụ chính báo Loyalty (và module bổ trợ khác) qua `interfaces/ILoyaltyHook`, địa chỉ lấy từ `Registry`, **chỉ khi** Loyalty bật ở chi nhánh và đang `Active`.
- Gọi với trần gas cố định + `try/catch`. Lỗi → phát `HookFailed(version, moduleId, hook, refId, data)`; giao dịch chính **vẫn thành công**.
- Loyalty có hàm `replay` theo lô (quyền vận hành) để chạy bù từ sự kiện; tích điểm idempotent theo `refId` (bất biến "một hoá đơn tích một lần", `docs/01` mục 6).
- Chiều ngược lại (dịch vụ chính hỏi "được trừ tối đa bao nhiêu điểm") là **tuỳ chọn**: Loyalty lỗi thì thanh toán tiếp tục không dùng điểm.

### C5–C7

- C5: mỗi contract một namespace storage (đã có, ERC-7201).
- C6: nâng cấp / quay lui riêng từng module (UUPS; `docs/07`).
- C7: xu chính và tài khoản ở T1/T2. Điểm thưởng thuộc Loyalty; Loyalty ngừng thì điểm đóng băng, không mất.

### Kiểm thử bắt buộc

- Mỗi module: test "module chết" — module revert mọi lệnh / bị `Paused` → các module khác và luồng nạp tiền vẫn chạy, invariant Ledger đúng.
- Hook: Loyalty revert / hết gas → thanh toán NET/IQR vẫn thành công, có `HookFailed`, `replay` bù đúng một lần.
- Ledger: poster vượt `maxAmount`, poster của module `Paused`, poster ghi cho module khác → đều bị từ chối.

## Phương án đã cân nhắc

| Phương án | Bỏ vì |
|---|---|
| Chỉ dùng pause toàn hệ | Một module lỗi làm dừng cả quán (trái Y1) |
| Hook gọi thẳng, lỗi thì revert cả giao dịch | Loyalty chết kéo theo NET/IQR (lỗi của hệ cũ) |
| Hook bất đồng bộ hoàn toàn (chỉ event, off-chain tích điểm) | Cần indexer/relayer chạy liên tục; Y4 quy mô nhỏ, chưa có indexer. Giữ gọi đồng bộ + bù bằng sự kiện |

## Hệ quả

- `Ledger`: thêm `moduleId` + `maxAmount` vào giấy phép poster; bỏ tham số `service` khỏi hàm ghi (đổi ABI, cần làm trước khi có poster thật — hiện chưa có poster nào trên chain). Tính cùng phương án giảm tải Ledger (nợ N3).
- `Registry`: `status`, `requireActive`, `moduleOf(address)`.
- Gas mỗi lệnh ghi T2 thêm một lần đọc `Registry` (~2–3k gas); chấp nhận được với Y4.
