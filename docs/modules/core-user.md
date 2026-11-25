# Người dùng theo agent (`core/user`)

Trạng thái: **Kế hoạch, chờ duyệt** (Claude Code, 2026-11-26). Chưa có code.

## 1. Bài toán

Mọi dịch vụ của agent đều cần người dùng (khách):

- **NET**: khách có tài khoản để đăng nhập máy trạm, có ví xu, bị trừ tiền theo giờ chơi.
- **IQR**: khách gọi món; muốn tích điểm hoặc dùng voucher thì cần tài khoản.
- **Loyalty**: điểm thưởng, hạng, voucher đều gắn vào tài khoản.

Hệ cũ (`NetCafeUserV3`) tạo tài khoản **theo từng chi nhánh**: sang chi nhánh khác của cùng agent phải đăng ký lại, và mỗi dịch vụ giữ danh sách khách riêng.

**Quyết định (người dùng, 2026-11-26): người dùng thuộc agent, không có tài khoản toàn hệ thống.**

- Một tài khoản dùng được ở **mọi chi nhánh, mọi dịch vụ của cùng agent** (NET, IQR, Loyalty).
- Một người đi chơi ở hai agent khác nhau thì có **hai tài khoản độc lập**: số dư, điểm, hạng, lịch sử tách riêng.
- Khớp Ledger hiện có: số dư khoá theo `(agentId, ví khách)`, tiền nạp ghi cho chi nhánh nơi nạp.

## 2. Mô hình

| Lớp | Phạm vi | Chứa gì | Ai ghi |
|---|---|---|---|
| **Người dùng của agent** (`AgentUserRegistry`) | theo agent | địa chỉ định danh, username, trạng thái, chi nhánh đăng ký, hồ sơ | khách tự đăng ký; nhân viên đăng ký hộ; quản lý/chủ agent khoá hoặc mở |
| **Dữ liệu dịch vụ** | theo agent | số dư ví (`Ledger`, đã có), điểm/hạng/voucher (`Loyalty`), phiên chơi (`NET`), đơn (`IQR`) | module tương ứng |

Một contract dùng chung cho mọi agent; dữ liệu khoá theo `agentId`, giống `AgentAccess` và `Ledger`.

## 3. Định danh: địa chỉ ví, không đổi trong agent

- Mỗi người dùng của agent có một **địa chỉ định danh** (`account`). Đây là khoá ở Ledger (`customer`), Loyalty, NET, IQR. Ledger **không phải sửa**.
- Khoá đầy đủ là `(agentId, account)`. Cùng một địa chỉ có thể đăng ký ở hai agent thành hai tài khoản riêng (vd. khách dùng chung ví điện thoại).
- **Ví điều khiển** thao tác thay tài khoản, giải quyết qua `DelegateRegistry` (nguyên tắc 7), cũng theo agent:
  - ví điện thoại của chính khách (không hết hạn, gỡ được);
  - **ví phiên trên máy trạm** (có hạn, hết khi đăng xuất hoặc hết giờ).
- Đổi điện thoại / đổi mật khẩu chỉ thay ví điều khiển; địa chỉ định danh giữ nguyên nên số dư, điểm, lịch sử không mất.

## 4. Đăng ký và đăng nhập

| Cách | Dùng khi | Luồng |
|---|---|---|
| **A. Ví điện thoại** (app webview của agent) | khách có app | app ký `register(agentId, username, …)` → ví đó vừa là định danh vừa là ví điều khiển |
| **B. Quét QR trên máy trạm** | khách có app, ngồi máy | máy hiện QR chứa ví phiên tạm → app ký uỷ quyền có hạn cho ví phiên → máy đăng nhập. Không gõ mật khẩu ở máy công cộng |
| **C. Username + mật khẩu** | khách không dùng app | xem §4.1 |
| **D. Nhân viên đăng ký hộ** | khách mới tại quầy | nhân viên (hoặc khách) nhập username + mật khẩu ban đầu → tạo tài khoản theo cách C; ghi `registeredBy`, `registeredBranch` |

### 4.1 Mật khẩu: **không lưu gì về mật khẩu on-chain** (đề xuất)

Hệ cũ lưu băm mật khẩu `bytes32` on-chain. Ai cũng đọc được, nên có thể dò offline mật khẩu yếu.

Đề xuất **ví sinh từ mật khẩu**, phía client:

`khoá riêng = scrypt(mật khẩu, salt = "meta-net:" + agentId + ":" + username, chi phí cao)`

- `agentId` nằm trong salt vì username chỉ duy nhất **trong một agent**. Hai người cùng username ở hai agent mà trùng mật khẩu vẫn ra hai địa chỉ khác nhau.
- Đăng ký: client sinh khoá → địa chỉ → địa chỉ đó là định danh. Đăng nhập máy trạm: sinh lại khoá → ký uỷ quyền cho ví phiên → xoá khoá khỏi bộ nhớ. On-chain chỉ có địa chỉ.
- Điểm yếu còn lại: mật khẩu quá yếu vẫn dò được vì địa chỉ công khai. Giảm bằng scrypt chậm (~1 giây/lần thử), mật khẩu tối thiểu 8 ký tự, khuyến khích cách A/B.
- **Đổi mật khẩu** = sinh địa chỉ mới, thêm làm ví điều khiển, gỡ ví cũ.
- **Quên mật khẩu**: nhân viên xác minh tại quầy → quản lý/chủ agent gắn ví điều khiển mới (`recover`). Phạm vi thiệt hại chỉ trong agent đó.

## 5. Dữ liệu người dùng

On-chain, storage của `AgentUserRegistry` (cần tra khi ghi):

| Trường | Ghi chú |
|---|---|
| `(agentId, account)` | khoá chính |
| `username` | duy nhất **trong agent**, chữ thường `a-z0-9._`, 3–24 ký tự; tra `accountOf(agentId, username)`. Đổi được, lịch sử qua event |
| `status` | `Active` / `Blocked` (agent chặn), kèm lý do |
| `createdAt`, `registeredBy`, `registeredBranch` | thống kê, đối soát |
| `profileDocId` | hồ sơ trong FullDB (tên hiển thị, avatar…) |

- Danh sách người dùng của agent có index + phân trang (nguyên tắc 2), phục vụ app agent và cyber.
- Thống kê (đăng ký mới theo ngày, tổng người dùng) theo agent và chi nhánh: bộ đếm ngày như Ledger rollup, không vòng lặp, không `rebuild…` như hệ cũ.
- Bị `Blocked`: không mở máy, không nạp, không gọi món ở agent đó. Số dư vẫn còn, hoàn theo quy định Ledger.
- Hạng, điểm, voucher thuộc Loyalty (theo agent), không nằm ở đây.
- Dữ liệu cá nhân (SĐT, họ tên…) **chờ chốt** (câu hỏi 2).

## 6. Quyền

| Việc | Ai |
|---|---|
| Tự đăng ký, sửa hồ sơ, đổi username, thêm/gỡ ví điều khiển | chính tài khoản (hoặc ví điều khiển của nó) |
| Đăng ký hộ khách | Staff trở lên của một chi nhánh đang hoạt động thuộc agent |
| Chặn / mở người dùng | Manager trở lên hoặc chủ agent |
| Khôi phục tài khoản (gắn ví điều khiển mới) | chờ chốt (câu hỏi 3) |
| Nền tảng (owner/admin) | chỉ xem và thống kê; không sửa người dùng của agent (`core-operator.md` R: nền tảng không có quyền nghiệp vụ trong agent) |

Agent bị tạm dừng: người dùng của agent chỉ đọc (theo R5).

## 7. Ảnh hưởng tới phần đã có

- **Ledger**: không đổi khoá. Thêm kiểm tra người dùng không bị chặn khi nạp/tiêu, đặt ở module dịch vụ/poster khi làm NET.
- **App cyber**: Người chơi đăng nhập theo A/B/C; Staff có "Hội viên mới" (cách D); Manager/Owner có danh sách người dùng của agent, chặn/mở.
- **App agent**: thêm trang Người dùng.
- **App platform**: chỉ số tổng người dùng theo agent (đọc bộ đếm).
- **Chuyển dữ liệu hệ cũ**: khách hệ cũ đã có địa chỉ ví → dùng làm định danh. Hệ cũ tách theo chi nhánh nên khi gộp về agent có thể trùng username (câu hỏi 5).

## 8. Thứ tự triển khai

| Bước | Nội dung | Phụ thuộc |
|---|---|---|
| U1 | `AgentUserRegistry`: đăng ký (tự / hộ), username duy nhất trong agent, chặn/mở, hồ sơ FullDB, bộ đếm ngày, danh sách phân trang; test + invariant (username ↔ account 1-1 trong agent) | `AgentRegistry`, `AgentAccess` |
| U2 | `DelegateRegistry`: ví điều khiển và ví phiên theo agent, `resolve(agentId, caller) → account` | U1 |
| U3 | Client: ví sinh từ mật khẩu (scrypt), đăng nhập QR, gói trong `packages/chain` | U1, U2 |
| U4 | UI: app cyber (đăng nhập người chơi, đăng ký hộ, danh sách người dùng), app agent (Người dùng), app platform (thống kê) | U1–U3 |

Sau U1–U2 mới viết đặc tả **NET** (máy trạm, phiên chơi), vì phiên chơi cần tài khoản và ví phiên.

## 9. Câu hỏi cần người dùng chốt

1. **Mật khẩu:** đồng ý "ví sinh từ mật khẩu" (§4.1, không lưu băm on-chain) thay cho cách hệ cũ không?
2. **Dữ liệu cá nhân khách** (SĐT, họ tên, ngày sinh): lưu rõ trong FullDB, chỉ lưu băm SĐT để tra cứu, hay không lưu? SĐT chỉ ~10 chữ số nên băm vẫn dò ngược được; chỉ "không lưu" mới thật sự kín. Dữ liệu đã lên chain không xoá được.
3. **Quên mật khẩu:** ai được khôi phục: quản lý chi nhánh nơi khách đăng ký, mọi quản lý của agent, hay chỉ chủ agent?
4. **Đăng nhập máy trạm:** cần OTP do nhân viên cấp không, hay chỉ QR + mật khẩu?
5. **Hệ cũ:** gộp khách các chi nhánh về agent, username trùng thì giữ của ai? Đề xuất: người đăng ký sớm nhất giữ, người sau thêm hậu tố, có báo cho khách.
6. Nhân viên/quản lý có được làm khách tại chính agent mình không? Đề xuất: được, nhưng không tự nạp / tự xác nhận nạp cho chính mình.
