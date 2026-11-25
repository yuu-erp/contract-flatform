# Tài khoản người dùng toàn hệ thống (`core/user`)

Trạng thái: **Kế hoạch, chờ duyệt** (Claude Code, 2026-11-26). Chưa có code.

## 1. Bài toán

Mọi dịch vụ đều cần người dùng (khách):

- **NET**: khách có tài khoản để đăng nhập máy trạm, có ví xu, bị trừ tiền theo giờ chơi.
- **IQR**: khách gọi món; muốn tích điểm hoặc dùng voucher thì cần tài khoản.
- **Loyalty**: điểm thưởng, hạng, voucher đều gắn vào một tài khoản.

Hệ cũ (`NetCafeUserV3`) tạo tài khoản **theo từng chi nhánh**: sang chi nhánh khác phải đăng ký lại, và mỗi dịch vụ giữ danh sách khách riêng.

**Yêu cầu (người dùng, 2026-11-26):** tài khoản thuộc **toàn hệ thống**. Một người có một tài khoản, dùng ở mọi agent, mọi chi nhánh, mọi dịch vụ.

## 2. Mô hình: ba lớp, tách theo ai sở hữu dữ liệu

| Lớp | Phạm vi | Chứa gì | Ai ghi |
|---|---|---|---|
| **Tài khoản** (`UserRegistry`) | toàn hệ thống | địa chỉ định danh, username, tên hiển thị, trạng thái | người dùng tự đăng ký; nhân viên đăng ký hộ; admin nền tảng khoá khi gian lận |
| **Hội viên của agent** (`AgentMembership`) | theo agent | ngày tham gia, chi nhánh tham gia đầu, trạng thái tại agent (bị chặn hay không), ghi chú | tự tạo khi khách giao dịch lần đầu với agent; chủ agent/quản lý chặn hoặc mở |
| **Dữ liệu dịch vụ** | theo agent | số dư ví (`Ledger`, đã có), điểm/hạng/voucher (`Loyalty`), phiên chơi (`NET`), đơn (`IQR`) | module tương ứng |

Lý do tách:

- Agent không sở hữu tài khoản, nên không xoá được tài khoản của người khác.
- Agent vẫn tự quyết với khách của mình: chặn, ghi chú, hạng riêng.
- Ledger đã khoá số dư theo `(agentId, ví khách)`, ví không dùng chéo giữa các agent. Mô hình này giữ nguyên điều đó.

## 3. Định danh: **địa chỉ ví là khoá chính, không đổi**

- Mỗi tài khoản có một **địa chỉ định danh** (`account`). Đây là khoá ở mọi nơi: Ledger (`customer`), Loyalty, NET, IQR. Ledger hiện đã dùng địa chỉ, **không phải sửa**.
- **Ví điều khiển** là ví được phép thao tác thay tài khoản. Nó có thể khác địa chỉ định danh, và giải quyết qua `DelegateRegistry` (nguyên tắc 7):
  - ví điện thoại của chính người dùng (không hết hạn, gỡ được);
  - **ví phiên trên máy trạm** (session wallet, có hạn, tự hết khi đăng xuất hoặc hết giờ).
- Mất điện thoại hay đổi ví thì chỉ thêm/gỡ ví điều khiển. Địa chỉ định danh giữ nguyên nên số dư, điểm, lịch sử không mất.

## 4. Đăng ký và đăng nhập

| Cách | Dùng khi | Luồng |
|---|---|---|
| **A. Ví điện thoại** (app webview) | khách có app | app tạo ví → ký `register(username, …)` → ví đó vừa là định danh vừa là ví điều khiển |
| **B. Quét QR trên máy trạm** | khách có app, ngồi máy | máy hiện QR chứa ví phiên tạm → app điện thoại ký uỷ quyền có hạn cho ví phiên (`DelegateRegistry`) → máy đăng nhập. Không gõ mật khẩu ở máy công cộng |
| **C. Username + mật khẩu** | khách không dùng app (khách quen, trẻ em) | xem §4.1 |
| **D. Nhân viên đăng ký hộ** | khách mới tại quầy | nhân viên nhập username + mật khẩu ban đầu (hoặc khách tự gõ) → tạo tài khoản theo cách C; tài khoản ghi `registeredBy = nhân viên`, `registeredAt = chi nhánh` |

### 4.1 Mật khẩu: **không lưu gì về mật khẩu on-chain** (đề xuất)

Hệ cũ lưu băm mật khẩu `bytes32` on-chain. Ai cũng đọc được, nên có thể dò offline mật khẩu yếu (hàng triệu lần/giây).

Đề xuất thay bằng **ví sinh từ mật khẩu**, phía client:

`khoá riêng = scrypt(mật khẩu, salt = "meta-net:" + username, chi phí cao)`

- Đăng ký: client sinh khoá → địa chỉ → địa chỉ đó là định danh tài khoản.
- Đăng nhập ở máy trạm: gõ username + mật khẩu → client sinh lại khoá → ký uỷ quyền cho ví phiên → xoá khoá khỏi bộ nhớ.
- On-chain chỉ có địa chỉ, không có băm.
- Điểm yếu còn lại: mật khẩu quá yếu vẫn bị dò được, vì địa chỉ công khai. Giảm bằng scrypt chi phí cao (~1 giây/lần thử), mật khẩu tối thiểu 8 ký tự, và khuyến khích chuyển sang cách A/B.
- **Đổi mật khẩu** = sinh địa chỉ mới, thêm làm ví điều khiển, gỡ ví cũ. Định danh giữ nguyên (§3).
- **Quên mật khẩu**: nhân viên xác minh tại quầy → chủ agent/quản lý gọi `recover` để gắn ví điều khiển mới. Quyền này cần chốt (câu hỏi 3).

## 5. Dữ liệu tài khoản

On-chain, trong `UserRegistry` (storage, vì cần tra cứu khi ghi):

| Trường | Ghi chú |
|---|---|
| `account` (address) | khoá chính |
| `username` | duy nhất toàn hệ, chữ thường `a-z0-9._`, 3–24 ký tự; tra `accountOf(username)`. Đổi được, giữ lịch sử qua event |
| `status` | `Active` / `Suspended` (admin nền tảng khoá) |
| `createdAt`, `registeredBy`, `registeredBranch` | thống kê, đối soát |
| `profileDocId` | hồ sơ trong FullDB (tên hiển thị, avatar…) |

Hồ sơ trong FullDB: tên hiển thị, avatar, ngày sinh (tuỳ chọn). Dữ liệu cá nhân **chờ chốt** (câu hỏi 2).

Thống kê (đăng ký theo ngày, tổng người dùng): ghi bộ đếm ngày giống Ledger rollup, không có vòng lặp và không `rebuild…` như hệ cũ.

## 6. Hội viên theo agent (`AgentMembership`)

- Tự tạo khi khách **giao dịch lần đầu** với agent (nạp, mở máy, gọi món), do module dịch vụ gọi. Có thể tạo trước khi nhân viên đăng ký hộ.
- Trường: `joinedAt`, `firstBranchId`, `status` (`Active` / `Blocked`), `blockedReason`.
- Agent chặn khách thì khách không mở máy, không nạp, không gọi món ở agent đó. Số dư vẫn còn và hoàn được theo quy định Ledger.
- Danh sách hội viên của agent có index + phân trang (nguyên tắc 2), phục vụ app agent và cyber.
- Hạng, điểm, voucher **không** nằm ở đây; thuộc Loyalty (theo agent).

## 7. Quyền

| Việc | Ai |
|---|---|
| Tự đăng ký, sửa hồ sơ, đổi username, thêm/gỡ ví điều khiển | chính tài khoản (hoặc ví điều khiển của nó) |
| Đăng ký hộ khách | Staff trở lên của một chi nhánh đang hoạt động |
| Chặn / mở khách tại agent | Manager trở lên (chi nhánh của agent) hoặc chủ agent |
| Khôi phục tài khoản (gắn ví điều khiển mới) | chờ chốt (câu hỏi 3) |
| Khoá / mở tài khoản toàn hệ | `PLATFORM_ADMIN` / `PLATFORM_OWNER` |

## 8. Ảnh hưởng tới phần đã có

- **Ledger**: không đổi khoá. Thêm kiểm tra tài khoản không bị khoá toàn hệ khi nạp/tiêu (qua poster hoặc module dịch vụ), cụ thể khi làm NET.
- **App cyber**: vai trò Người chơi đăng nhập theo cách A/B/C. Staff có nút "Hội viên mới" (cách D). Manager và chủ agent có danh sách hội viên của agent.
- **App agent**: thêm trang Hội viên (danh sách, chặn/mở).
- **Chuyển dữ liệu hệ cũ**: khách hệ cũ đã có địa chỉ ví → dùng làm định danh. Username trùng giữa các chi nhánh/agent cần quy tắc gộp (câu hỏi 5).

## 9. Thứ tự triển khai

| Bước | Nội dung | Phụ thuộc |
|---|---|---|
| U1 | `UserRegistry`: đăng ký (tự / hộ), username duy nhất, hồ sơ FullDB, khoá toàn hệ, bộ đếm ngày; test + invariant (username ↔ account 1-1) | — |
| U2 | `DelegateRegistry`: ví điều khiển (không hạn) và ví phiên (có hạn), `resolve(caller) → account` | U1 |
| U3 | `AgentMembership`: tự tạo khi giao dịch đầu, chặn/mở, danh sách phân trang | U1, `AgentAccess` |
| U4 | Client: ví sinh từ mật khẩu (scrypt), đăng nhập QR, gói trong `packages/chain` | U1, U2 |
| U5 | UI: app cyber (đăng nhập người chơi, hội viên mới, danh sách hội viên), app agent (Hội viên), app platform (tra cứu / khoá tài khoản) | U1–U4 |

Sau U1–U3 mới viết đặc tả **NET** (máy trạm, phiên chơi), vì phiên chơi cần tài khoản và ví phiên.

## 10. Câu hỏi cần người dùng chốt

1. **Mật khẩu:** đồng ý "ví sinh từ mật khẩu" (§4.1, không lưu băm on-chain) thay cho cách hệ cũ không?
2. **Dữ liệu cá nhân khách** (SĐT, họ tên, ngày sinh): lưu rõ trong FullDB, chỉ lưu băm SĐT để tra cứu, hay không lưu? Lưu ý: SĐT chỉ có ~10 chữ số, nên băm vẫn dò ngược được; chỉ "không lưu" mới thật sự kín. Dữ liệu đã lên chain không xoá được.
3. **Quên mật khẩu:** ai được khôi phục tài khoản cho khách: chủ agent / quản lý nơi khách đăng ký, hay chỉ admin nền tảng? Khôi phục sai là chiếm được số dư của khách ở **mọi** agent.
4. **Đăng nhập máy trạm:** cần cả 3 cách (QR từ app, username + mật khẩu, OTP do nhân viên cấp) hay bỏ OTP?
5. **Hệ cũ:** khi gộp, username trùng giữa các chi nhánh thì giữ của ai? Đề xuất: người đăng ký sớm nhất giữ, người sau thêm hậu tố, có báo cho khách.
6. Nhân viên / quản lý có được đồng thời là khách (có ví xu, chơi máy) tại chính agent mình không? Đề xuất: được, nhưng không tự nạp / tự xác nhận nạp cho chính mình.
