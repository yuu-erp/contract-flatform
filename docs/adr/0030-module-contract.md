# 0030. Module Contract và Registry

- Trạng thái: **Chốt hướng** — chi tiết hàm chốt trong đặc tả `docs/modules/kernel-registry.md` (lập ở Baseline tuần 3)
- Ngày: 2026-11-26
- Người duyệt: Claude (kỹ thuật) — phần cầu dao chạm tiền nằm ở ADR 0031

## Bối cảnh

Muốn thêm module (Enterprise, karaoke…) mà không nâng cấp T0–T2 (Y2), nền tảng phải **hỏi** module là gì thay vì **biết sẵn**. Hiện `ServiceMask` cố định 3 dịch vụ và luật "Loyalty cần NET hoặc IQR" viết trong code thư viện. `docs/06` đã dự kiến `core/registry` làm sổ địa chỉ nhưng chưa làm.

## Quyết định

### 1. `Registry` (T0) giữ danh sách module

Mỗi module một bản khai báo:

| Trường | Ý nghĩa |
|---|---|
| `moduleId` (`uint8`) | Mã module. `0` = nền tảng (quyền lõi như đăng ký khách, nhận tiền). `1..16` = module dịch vụ, ứng với bit `1 << (moduleId-1)` trong `Branch.services` (`uint16`) |
| `name` | Tên kỹ thuật (`net`, `iqr`, `loyalty`) — chỉ để hiển thị/tra cứu, **không dùng để rẽ nhánh logic** |
| `requiresAny` (`uint16`) | Mặt nạ module mà chi nhánh phải bật ít nhất một (Loyalty = NET \| IQR) |
| `status` | `Active` / `Paused` / `Retired` (ADR 0031) |
| `contracts[]` | Địa chỉ proxy các contract của module (Ledger, HistoryIndex, Permission dựa vào đây để biết "lệnh này đến từ module nào") |
| `permValid`, `permManagerOnly` (`uint64`) | Danh mục quyền (ADR 0033) |
| `version` | Phiên bản khai báo, tăng khi sửa |

Mã `1` = NET, `2` = IQR, `3` = Loyalty giữ đúng bit hiện có (`1`, `2`, `4`) để không phải chuyển dữ liệu chi nhánh.

### 2. Vòng đời chung

```text
đăng ký (owner nền tảng) → cho phép ở agent (AgentRegistry.allowedServices)
  → bật ở chi nhánh (BranchRegistry.services) → [Paused ⇄ Active] → Retired (chỉ đọc vĩnh viễn)
```

- `AgentRegistry`, `BranchRegistry` kiểm "bit hợp lệ" và "module phụ thuộc" bằng `Registry`, không bằng hằng.
- Module **Retired** không bật thêm ở chi nhánh nào; chi nhánh đang bật vẫn đọc được dữ liệu.

### 3. Nghĩa vụ của một module

1. Đầu mọi hàm ghi: `BranchRegistry.requireWritable(branchId, moduleId)` và `Registry.requireActive(moduleId)`.
2. Kiểm quyền người thao tác: `Permission.can(branchId, account, moduleId, perm)`; không tự giữ danh sách nhân viên.
3. Tiền: chỉ qua Ledger, với giấy phép của module (ADR 0031).
4. Lịch sử: chỉ qua `HistoryIndex`, kind có tiền tố module (`net_sessions`, `iqr_orders`).
5. Báo module khác: chỉ qua hook trong `src/interfaces/` (ví dụ `ILoyaltyHook`), gọi an toàn (ADR 0031).
6. Có đặc tả `docs/modules/<module>.md`, unit test, invariant nếu chạm tiền, test "module chết", ngân sách gas.

### 4. Danh mục quyền nằm cùng khai báo module

Tên hiển thị quyền ở frontend. Bit đã dùng không bao giờ đổi nghĩa; bỏ quyền thì gỡ bit khỏi `permValid`.

## Phương án đã cân nhắc

| Phương án | Bỏ vì |
|---|---|
| Giữ `ServiceMask`, mỗi lần thêm module nâng cấp library + 3 contract | Trái Y2; nâng cấp T1 cho việc của T3 |
| Mỗi module tự đăng ký quyền vào `Permission` | Thông tin module rải nhiều nơi; `Registry` đã là nơi trả lời "module nào tồn tại" |
| `moduleId` kiểu `bytes32` tự do | Phải khớp bit `uint16` của chi nhánh; `uint8` đủ và rẻ |

## Hệ quả

- Nâng cấp một lần `AgentRegistry`, `BranchRegistry` (T1, người dùng duyệt) để đọc `Registry`; xoá `ServiceMask.ALL`.
- `SalesSettings`, `LedgerMetrics` bỏ hằng `SERVICE_*` (nợ N1, N2).
- Tối đa 16 module dịch vụ; hết chỗ thì nới kiểu `services` bằng một lần nâng cấp có ADR.
