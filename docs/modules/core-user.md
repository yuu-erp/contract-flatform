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
| **E. OTP do nhân viên cấp** | khách quên mật khẩu / không mang điện thoại | xem §4.3 |
| **D. Nhân viên đăng ký hộ** | khách mới tại quầy | nhân viên (hoặc khách) nhập username + mật khẩu ban đầu → tạo tài khoản theo cách C; ghi `registeredBy`, `registeredBranch` |

### 4.1 Mật khẩu lưu ở đâu — phân tích

**Mọi thứ đã lên chain đều công khai vĩnh viễn**: ai cũng đọc được storage, calldata của giao dịch, event, và cả giao dịch đang chờ trong mempool. Vì vậy câu hỏi không phải "giấu mật khẩu ở đâu trên chain", mà là "để lộ thứ gì thì vẫn an toàn".

| Cách | On-chain có gì | Kiểm mật khẩu thế nào | Đánh giá |
|---|---|---|---|
| **1. Băm nhanh** (hệ cũ: `bytes32` = keccak/sha) | bản băm | client gửi băm, contract so | **Không an toàn.** Đọc bản băm rồi thử mật khẩu offline: GPU thử hàng tỉ lần/giây, mật khẩu 8 ký tự thường bị lộ trong vài phút. Thêm: thứ gửi lên để so (băm hoặc mật khẩu) nằm trong calldata công khai → ai xem giao dịch là dùng lại được |
| **2. Băm chậm** (bcrypt/scrypt/argon2) lưu on-chain | bản băm chậm | contract **không chạy nổi** scrypt/argon2 (gas quá lớn) → client vẫn phải gửi băm lên để so | **Không được.** Gửi băm lên = gửi "mật khẩu tương đương", lộ trong calldata/mempool, dùng lại được |
| **3. Mã hoá mật khẩu** rồi lưu | bản mã | phải giải mã | **Không được.** Khoá giải mã để đâu? Để on-chain thì công khai; không có backend để giữ khoá |
| **4. Server riêng** lưu bcrypt (như web thường) | không có gì | server kiểm | An toàn nhất về mật khẩu, nhưng **hệ chưa có backend** (`docs/04` câu 5) và mất tính "chạy hoàn toàn on-chain" |
| **5. Ví sinh từ mật khẩu** (đề xuất) | chỉ một **địa chỉ** | client sinh khoá từ mật khẩu, **ký** giao dịch; contract kiểm chữ ký | **Dùng được.** Mật khẩu và khoá không bao giờ rời máy, không có gì để dùng lại từ giao dịch. Rủi ro duy nhất: thử mật khẩu offline từ địa chỉ công khai (xem dưới) |

**Kết luận: mật khẩu không nên lưu on-chain dưới bất kỳ dạng nào.** On-chain chỉ lưu địa chỉ ví sinh ra từ mật khẩu (cách 5).

#### Cách 5 hoạt động

`khoá riêng = scrypt(mật khẩu, salt = "meta-net:" + agentId + ":" + username, N = 2^17, r = 8, p = 1)` → địa chỉ đăng nhập.

- `AgentUserRegistry` lưu `loginAddress` của tài khoản (một ví điều khiển). Địa chỉ định danh `account` không đổi.
- Đăng nhập: máy trạm hỏi username + mật khẩu → sinh khoá (~0,5–1 giây) → ký uỷ quyền cho ví phiên của máy → xoá khoá khỏi bộ nhớ.
- **Người dùng đổi mật khẩu**: sinh địa chỉ mới từ mật khẩu mới → ký bằng khoá cũ (chứng minh biết mật khẩu cũ) → contract thay `loginAddress`.
- **Staff đặt lại mật khẩu** (khách quên): staff nhập mật khẩu mới cùng khách → client sinh địa chỉ mới → staff gửi `resetPassword(agentId, account, newLoginAddress)`. **Không cần mật khẩu cũ.** Event `PasswordReset(agentId, account, staff, branchId)` + nhật ký `platform_audit` ghi staff nào đổi cho tài khoản nào, ở chi nhánh nào. Mọi ví phiên đang mở của tài khoản bị thu hồi.
- Staff biết mật khẩu mới vừa đặt → app nhắc khách đổi lại ở lần đăng nhập sau.

#### Mức an toàn của cách 5

- **Kẻ tấn công cần gì:** địa chỉ đăng nhập (công khai) + username + agentId (công khai) → thử từng mật khẩu, mỗi lần một phép scrypt.
- **Tốn bao nhiêu:** scrypt ~128 MB RAM/lần thử, chống GPU tốt. Ước lượng: ~1.000 lần/giây cho một kẻ tấn công có nhiều máy. So với băm nhanh của hệ cũ (hàng tỉ lần/giây), chậm hơn khoảng **một triệu lần**.
  - Mật khẩu nằm trong danh sách phổ biến (`123456`, `matkhau1`…): vẫn lộ trong vài giây đến vài phút.
  - 8 ký tự ngẫu nhiên (chữ + số): ~2,8×10^14 khả năng → hàng nghìn năm.
- **Salt có agentId + username** → không dùng bảng tính sẵn; phải tấn công từng tài khoản một.
- **Thiệt hại nếu bị lộ** giới hạn trong một agent: chỉ là số xu chơi máy / gọi món tại agent đó. Đề xuất **không có tính năng chuyển xu giữa khách** và **không rút xu ra tiền mặt** (hoàn tiền chỉ qua staff tại quầy, đã có trong Ledger) → kẻ chiếm tài khoản phải ra tận quán mới dùng được.
- **Bắt buộc khi đặt mật khẩu:** tối thiểu 8 ký tự, chặn danh sách mật khẩu phổ biến và mật khẩu chứa username/SĐT (kiểm ở client).

### 4.1a Tạo ví ngầm cho khách không biết ví (đã chốt phương án A, 2026-11-26)

Khách chỉ nhớ **username + mật khẩu**. Ví được tạo và dùng phía sau, khách không thấy.

Các bước client làm (thư viện trong `packages/chain`):

1. `salt = "meta-net:" + agentId + ":" + username` (username chữ thường).
2. `seed = scrypt(mật khẩu, salt, N = 2^17, r = 8, p = 1, 32 byte)`: ~0,5–1 giây, ~128 MB RAM.
3. `khoá riêng = seed` (nếu rơi ngoài khoảng hợp lệ của secp256k1 thì băm lại với hậu tố `:1`, xác suất ~10^-38).
4. `khoá công khai = secp256k1(khoá riêng)`; `địa chỉ = 20 byte cuối của keccak256(khoá công khai)`. Cách tính địa chỉ y hệt mọi ví Ethereum.
5. Dùng khoá **ký** thông điệp EIP-712 rồi xoá khoá khỏi bộ nhớ. Không lưu khoá ở đâu cả.

Địa chỉ tính được ở lần đăng ký đầu tiên là **địa chỉ định danh** (`account`, khoá ở Ledger), đồng thời là `loginAddress` đầu tiên. Đổi mật khẩu chỉ đổi `loginAddress`; `account` giữ nguyên.

**Phí gas: khách không trả.** Ví vừa sinh có số dư 0 nên không tự gửi giao dịch được. Mọi thao tác của khách là **chữ ký EIP-712** (đăng ký, đăng nhập, đổi mật khẩu) và **người khác gửi giao dịch**:

| Thao tác | Ai gửi giao dịch (trả gas) |
|---|---|
| Nhân viên đăng ký hộ tại quầy | ví staff |
| Khách tự đăng ký trên app webview | ví relayer của agent (hoặc FreeGas proxy của chain, `docs/07` §6) |
| Đăng nhập máy trạm | ví của máy trạm (do agent cấp gas) |
| Khách đổi mật khẩu | relayer / máy trạm |

Contract kiểm chữ ký bằng `ecrecover` (EIP-712, có `nonce` + hạn) nên người gửi hộ không giả mạo hay dùng lại được chữ ký.

**Quy tắc mật khẩu** (kiểm ở client vì phương án A không có máy chủ): tối thiểu 8 ký tự; không chứa username/SĐT; chặn danh sách ~10.000 mật khẩu phổ biến; báo mức mạnh/yếu khi gõ.

### 4.2 Đăng nhập bằng QR

Máy trạm sinh ví phiên tạm, hiện QR (địa chỉ ví phiên + máy + hạn). App điện thoại của khách quét, ký uỷ quyền cho ví phiên trong `DelegateRegistry`. Không có bí mật nào đi qua máy công cộng. An toàn nhất trong 3 cách.

### 4.3 OTP do staff cấp

Khó ở chỗ: gửi OTP lên chain để kiểm thì OTP lộ trong mempool, người khác có thể chen giao dịch dùng trước. Cách xử lý: **OTP cũng là ví sinh, dùng một lần**.

1. Staff chọn tài khoản → client sinh OTP ngẫu nhiên 8 ký tự (chữ + số, bỏ ký tự dễ nhầm) → `otpAddress = scrypt(OTP, salt = agentId + account + nonce)`.
2. Staff gửi `issueOtp(agentId, account, otpAddress, expiresAt)`; hạn **5 phút**, dùng **một lần**. Event + nhật ký ghi staff nào cấp cho ai. OTP đọc cho khách, không lên chain.
3. Khách nhập OTP ở máy → máy sinh lại khoá → ký uỷ quyền ví phiên → contract xoá `otpAddress`.
4. Dò OTP từ `otpAddress` trong 5 phút: ~2,8×10^12 khả năng × scrypt → không khả thi.

OTP chỉ mở phiên chơi trên máy. Muốn đặt lại mật khẩu vẫn phải qua staff `resetPassword` (§4.1).

## 5. Dữ liệu người dùng

On-chain, storage của `AgentUserRegistry` (cần tra khi ghi):

| Trường | Ghi chú |
|---|---|
| `(agentId, account)` | khoá chính |
| `username` | duy nhất **trong agent**, chữ thường `a-z0-9._`, 3–24 ký tự; tra `accountOf(agentId, username)`. Đổi được, lịch sử qua event |
| `status` | `Active` / `Blocked` (agent chặn), kèm lý do |
| `createdAt`, `registeredBy`, `registeredBranch` | thống kê, đối soát |
| `loginAddress` | địa chỉ sinh từ mật khẩu (§4.1); đổi khi đổi / đặt lại mật khẩu |
| `profileDocId` | hồ sơ trong FullDB (tên hiển thị, SĐT, họ tên, ngày sinh, avatar) |

- Danh sách người dùng của agent có index + phân trang (nguyên tắc 2), phục vụ app agent và cyber.
- Thống kê (đăng ký mới theo ngày, tổng người dùng) theo agent và chi nhánh: bộ đếm ngày như Ledger rollup, không vòng lặp, không `rebuild…` như hệ cũ.
- Bị `Blocked`: không mở máy, không nạp, không gọi món ở agent đó. Số dư vẫn còn, hoàn theo quy định Ledger.
- Hạng, điểm, voucher thuộc Loyalty (theo agent), không nằm ở đây.
- Dữ liệu cá nhân (SĐT, họ tên, ngày sinh) **lưu rõ trong FullDB**, giống hồ sơ agent (người dùng chốt 2026-11-26). Lưu ý: dữ liệu đã lên chain công khai và không xoá được.

## 6. Quyền

| Việc | Ai |
|---|---|
| Tự đăng ký, sửa hồ sơ, đổi username, thêm/gỡ ví điều khiển | chính tài khoản (hoặc ví điều khiển của nó) |
| Đăng ký hộ khách | Staff trở lên của một chi nhánh đang hoạt động thuộc agent |
| Nạp tiền / xác nhận nạp | Staff trở lên, **trừ** khi tài khoản được nạp là của chính staff đó (nhân viên vẫn được làm khách) |
| Chặn / mở người dùng | Manager trở lên hoặc chủ agent |
| Đổi mật khẩu | chính tài khoản (ký bằng khoá từ mật khẩu cũ) |
| Đặt lại mật khẩu khi quên (không cần mật khẩu cũ) | Staff trở lên của agent; ghi log staff, tài khoản, chi nhánh |
| Cấp OTP đăng nhập | Staff trở lên của agent; hạn 5 phút, dùng 1 lần, ghi log |
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

## 9. Đã chốt (người dùng, 2026-11-26)

1. Người dùng thuộc agent, không có tài khoản toàn hệ.
2. Dữ liệu cá nhân khách lưu rõ trong FullDB như hồ sơ agent.
3. Quên mật khẩu: staff đặt lại, không cần mật khẩu cũ, ghi log staff nào đổi cho tài khoản nào. Người dùng tự đổi mật khẩu được.
4. Ba cách đăng nhập máy trạm: OTP do staff cấp, username + mật khẩu, quét QR.
5. Gộp hệ cũ: username trùng thì người đăng ký sớm nhất giữ, người sau thêm hậu tố (vd. `teo` → `teo.2`), báo cho khách.
6. Nhân viên được làm khách tại agent mình, nhưng không tự nạp / tự xác nhận nạp cho chính mình.
7. Mật khẩu: phương án A, ví sinh từ mật khẩu bằng scrypt, không có máy chủ (§4.1a). Chấp nhận mật khẩu yếu vẫn có thể bị đoán offline; giảm bằng quy tắc mật khẩu.

## 10. Còn chờ chốt

1. **Không chuyển xu giữa khách, không rút xu ra tiền** (giới hạn thiệt hại khi lộ mật khẩu): đồng ý không?
