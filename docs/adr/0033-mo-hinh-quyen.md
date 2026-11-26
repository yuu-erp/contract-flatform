# 0033. Mô hình quyền: Permission + Duty

- Trạng thái: **Chốt, đã cài** (Baseline tuần 4) — đặc tả `docs/modules/shared-permission-duty.md`
- Ngày: 2026-11-26
- Người duyệt: người dùng (họp 2026-11-26: đồng ý 6 đề xuất về nhân sự)

## Bối cảnh

Kế hoạch `docs/modules/core-staff.md` đặt ca, vị trí, phân công, phiên trực, tăng ca, giao ca và `can()` vào một `StaffRegistry`. Theo L4 (một contract một câu hỏi) và L5 (kích thước), khối này gánh hai câu hỏi khác nhau:
- "ví này **có quyền** làm P không?" — đọc nhiều, gần như mọi lệnh ghi đều hỏi;
- "ai **đang trực**, đến khi nào?" — ghi theo ca, có máy trạng thái riêng.

Ngoài ra đối soát két khi giao ca là chuyện tiền, đã thiết kế ở `docs/08` mục 5 (ca thu ngân thuộc thanh toán).

## Quyết định

### Vai trò dùng chung, quyền tách theo module

| Vai trò | Nguồn | Quyền |
|---|---|---|
| Chủ agent | `AgentRegistry` | mọi quyền, mọi chi nhánh, mọi module đang bật |
| Manager | `AgentAccess` | mọi quyền ở chi nhánh được giao (kể cả "chỉ Manager"), mọi module đang bật; không bị giới hạn bởi vị trí |
| Staff | `AgentAccess` + `Duty` + `Permission` | đúng các bit trong vị trí của **phiên trực đang mở**; không bao giờ có quyền "chỉ Manager" |

Quyền = `(moduleId, bit)`; danh mục do module khai báo trong `Registry` (ADR 0030).

### Ba contract, ba câu hỏi

| Contract (tầng) | Câu hỏi | Giữ |
|---|---|---|
| `Permission` (T2) | Ví này có quyền P của module M ở chi nhánh B **lúc này** không? | Vị trí của chi nhánh: tên, mặt nạ quyền theo module, trạng thái. Hàm `can()` |
| `Duty` (T2) | Ai đang trực ca nào, vị trí nào, đến khi nào? | Ca (lặp theo thứ trong tuần), phân công `(nhân viên, ca, vị trí)`, phiên trực (vào ca, tăng ca, ra ca), trần tăng ca của chi nhánh |
| `PaymentAccounts` (T2) | Ca thu ngân và két: mở, đóng, chênh lệch? | `docs/08` mục 5. Giao ca = đóng ca két của người trước + người sau xác nhận nhận két |

`can(branchId, account, moduleId, perm)`:
1. Module bật ở chi nhánh và `Active` (`BranchRegistry`, `Registry`).
2. Chủ agent → đúng. Manager của chi nhánh → đúng.
3. Staff: bit không thuộc `permManagerOnly`; `Duty.activeShiftOf(branchId, account)` trả phiên đang mở; vị trí của phiên có bit.

### Các chốt nghiệp vụ (người dùng đồng ý 2026-11-26)

1. Vị trí theo **chi nhánh** (UI có "sao chép từ chi nhánh khác").
2. Phân công theo cặp **(ca, vị trí)**.
3. **Có chấm công:** chỉ thao tác khi có phiên trực mở; vào ca từ 15 phút trước giờ ca.
4. Ca **lặp theo thứ trong tuần**; đổi đột xuất bằng sửa phân công.
5. Danh mục quyền nền tảng (`moduleId = 0`) chốt khi đặc tả `Permission`; quyền NET/IQR chốt khi đặc tả từng module.
6. Manager **không** bị giới hạn bởi vị trí.

### Phiên trực, tăng ca, giao ca

- Quyền gắn với **phiên trực đang mở**, không cắt cứng ở giờ kết thúc ca.
- Quá giờ mà chưa ra ca → phiên chuyển **tăng ca**, quyền giữ nguyên, phát sự kiện cho Manager.
- Phiên đóng khi: tự ra ca; giao ca xong; Manager đóng; hoặc chạm **trần tăng ca** của chi nhánh (đánh giá lười trong `can()`, không cần giao dịch).
- Hai người cùng giữ một vị trí trong lúc bàn giao là hợp lệ.
- **Chốt (người dùng 2026-11-26):** trần tăng ca mặc định **4 giờ** (chủ agent đổi được theo chi nhánh); giao ca **bắt buộc** người ca sau xác nhận nhận két (két chưa được xác nhận thì phiên của người trước chưa đóng bằng giao ca; Manager vẫn đóng thay được, có ghi lý do).

### Dùng được cho mọi module

- Bàn, đơn, máy trạm, phòng **thuộc chi nhánh**, không thuộc nhân viên → giao ca không phải chuyển gì ngoài két.
- Phạm vi nhỏ hơn chi nhánh (tầng, khu, trạm bếp, phòng ban) do **module tự lọc**; `Permission` không biết.
- Chấm công theo quy tắc công ty (đi muộn, phép, bảng công) là **module Enterprise** đọc sự kiện của `Duty`. Sự kiện vào/ra ca có `source` (điện thoại, thiết bị, Manager vào hộ) và `deviceId` từ bản đầu.
- Nhân viên là tài khoản trong `AgentUserRegistry`; ví phiên trên máy quầy chỉ là công cụ ký, quy về tài khoản qua `DelegateRegistry`.

## Phương án đã cân nhắc

| Phương án | Bỏ vì |
|---|---|
| Một `StaffRegistry` gánh tất cả | Hai câu hỏi trong một contract; nguy cơ vượt 24 KB khi thêm tăng ca, giao ca |
| Một danh sách quyền chung toàn hệ | Thêm quyền của một module phải nâng cấp nền tảng (trái Y2) |
| Quyền theo giờ ca cứng | Hết giờ mà người sau chưa tới thì quầy ngừng (người dùng phản đối) |

## Hệ quả

- `docs/modules/core-staff.md` được thay bằng đặc tả `Permission` + `Duty` (giữ file cũ làm lịch sử thảo luận).
- `AgentUserRegistry` đổi sang `can()` (nợ N5).
