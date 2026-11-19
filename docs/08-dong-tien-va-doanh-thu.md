# 08. Dòng tiền, doanh thu và báo cáo

Trạng thái: **thiết kế chờ duyệt** (2026-11-19). Đầu vào cho ADR 0022 (Ledger) và đặc tả `docs/modules/core-ledger.md`, `core-payment.md`.
Chỗ ghi **[Claude chọn]** là quyết định Claude đề xuất khi người dùng giao "tự trả lời, tôi duyệt"; người dùng sửa được.

## 1. Mục đích

Ba nhu cầu của người dùng (2026-11-19):

1. **Chủ agent đối soát két tiền mỗi ngày:** tiền thực nhận ở quầy (tiền mặt, chuyển khoản, thẻ) khớp với sổ.
2. **Nền tảng tính phí cho agent:** có số liệu cơ sở tin được để tính phí theo kỳ.
3. **Theo dõi kinh doanh:** doanh thu theo ngày/tháng, theo dịch vụ, theo chi nhánh.

Phạm vi xem (người dùng chốt):

| Vai | Xem được |
|---|---|
| `PLATFORM_OWNER`, `PLATFORM_ADMIN` | toàn hệ; lọc một agent; xem từng chi nhánh của agent đó |
| Chủ agent | mọi chi nhánh của mình; lọc một chi nhánh |
| Manager | chi nhánh mình quản lý |

## 2. Hệ lớn làm thế nào và rút ra gì

| Hệ | Cách làm | Áp dụng |
|---|---|---|
| Stripe, Modern Treasury, TigerBeetle (sổ cái) | Bút toán kép trên **tài khoản**; không sửa bút toán cũ, sai thì ghi bút toán đảo; mọi giao dịch có khoá chống trùng | Ledger bút toán kép, append-only, `refId` (đã có trong nguyên tắc 3) |
| Kế toán thẻ trả trước, gift card (IFRS 15) | Tiền khách nạp là **khoản nợ khách** (doanh thu chưa thực hiện), **chưa phải doanh thu**. Doanh thu ghi nhận khi khách dùng dịch vụ | Tách hai con số: **tiền thu** và **doanh thu** |
| Square, Toast, KiotViet (POS) | **Ca thu ngân**: mở ca với tiền đầu ca, mọi giao dịch tiền mặt gắn ca, kết ca đếm tiền, chênh lệch được ghi và quản lý duyệt. "Ngày kinh doanh" theo giờ địa phương của cửa hàng | Đối soát két = đối soát **theo ca**, cộng lên ngày |
| Shopify, Grab (marketplace) | Phí nền tảng tính trên **GMV** của kỳ theo chính sách từng merchant; hoá đơn tách khỏi sổ giao dịch | Phí tính từ số tổng hợp kỳ; chính sách phí theo agent |
| Mọi hệ lớn (OLTP + OLAP) | Sổ giao dịch chi tiết để tra; báo cáo đọc từ **bảng tổng hợp** cập nhật sẵn, không cộng lại từ đầu mỗi lần xem | Bút toán chi tiết ở FullDB; **bộ đếm tổng hợp theo ngày** cập nhật ngay khi ghi |

## 3. Hai con số không được trộn

| | **Tiền thu (cash)** | **Doanh thu (revenue)** |
|---|---|---|
| Là gì | tiền thật vào/ra quầy, theo phương thức | giá trị dịch vụ đã cung cấp cho khách |
| Phát sinh khi | nạp ví, bán trả tiền mặt/thẻ/chuyển khoản, hoàn tiền | trừ ví cho giờ chơi, thanh toán đơn IQR (bất kể phương thức) |
| Ví dụ | khách nạp 100k tiền mặt → **tiền thu +100k, doanh thu 0** | khách chơi 30k trừ ví → **tiền thu 0, doanh thu +30k** |
| Dùng cho | đối soát két (nhu cầu 1) | phí nền tảng, theo dõi kinh doanh (nhu cầu 2, 3) |

Hệ quả: số dư ví khách là **nợ của agent với khách**. Báo cáo luôn hiện kèm "số dư ví khách cuối ngày".

## 4. Mô hình sổ cái

Xu chính 1:1 VND. Tiền thật nằm ngoài chain; Ledger là **sổ ghi nhận** nghĩa vụ và luồng tiền, không giữ fiat.

### 4.1 Tài khoản (theo agent)

| Tài khoản | Khoá | Loại | Lưu số dư ở |
|---|---|---|---|
| Ví khách | `(khách, chi nhánh nạp)` | nợ | **storage** (hàm ghi cần kiểm số dư) |
| Quỹ chi nhánh | `(chi nhánh, phương thức)` | tài sản | chỉ bộ đếm tổng hợp |
| Doanh thu | `(chi nhánh, dịch vụ)` | thu nhập | chỉ bộ đếm tổng hợp |
| Giảm trừ doanh thu | `(chi nhánh, dịch vụ, loại)` (khuyến mãi, điểm thưởng) | giảm thu nhập | chỉ bộ đếm tổng hợp |

Phương thức: `CASH`, `TRANSFER` (chuyển khoản/VietQR), `CARD`, `OTHER`. Dịch vụ: `NET`, `IQR`.

### 4.2 Loại bút toán

`A` = chi nhánh nạp, `B` = chi nhánh nơi khách dùng dịch vụ.

| Loại | Nợ | Có | Tiền thu | Doanh thu |
|---|---|---|---|---|
| `TOPUP` nạp ví | Quỹ(A, pt) | Ví(khách, A) | +x tại A | 0 |
| `WALLET_SPEND` trừ ví (NET, IQR) | Ví(khách, A) | Doanh thu(A, dịch vụ) | 0 | +x cho **A**, ghi thêm "phục vụ tại B" |
| `DIRECT_SALE` IQR trả tiền mặt/thẻ/CK | Quỹ(B, pt) | Doanh thu(B, IQR) | +x tại B | +x cho B |
| `TOPUP_REFUND` hoàn tiền nạp | Ví(khách, A) | Quỹ(A, pt) | −x tại A | 0 |
| `SALE_REFUND` hoàn đơn/giờ chơi | Doanh thu(gốc) | Ví hoặc Quỹ (theo cách đã trả) | −x nếu trả tiền | −x |
| `ADJUST` điều chỉnh thủ công | tuỳ | tuỳ | tuỳ | tuỳ |

Luật:
- **Không sửa, không xoá bút toán.** Sai thì ghi bút toán đảo, trỏ `refId` gốc.
- Hoàn tiền tính vào **ngày hoàn**, không sửa số của ngày gốc (như POS).
- Số tiền khi hoàn/huỷ do contract lấy từ bút toán gốc, không nhận từ bên gọi (nguyên tắc 3).
- Một đơn trả bằng nhiều cách (ví + tiền mặt) ghi **nhiều bút toán**, cùng mã đơn, mỗi bút toán một `refId` [Claude chọn].
- `ADJUST` chỉ Manager trở lên, bắt buộc lý do, luôn hiện riêng trong báo cáo.
- Khuyến mãi và điểm thưởng ghi là **giảm trừ**: báo cáo có doanh thu gộp, giảm trừ, doanh thu thuần.

### 4.3 Trả lời 5 câu hỏi Ledger

| # | Câu hỏi | Trả lời [Claude chọn] | Lý do |
|---|---|---|---|
| 1 | Thứ tự trừ khi khách có tiền nạp ở nhiều chi nhánh | **Trừ phần nạp tại chi nhánh đang phục vụ trước**, thiếu thì trừ các chi nhánh khác theo thứ tự nạp sớm nhất | Doanh thu ở lại nơi phục vụ khi có thể, ít tranh chấp giữa chi nhánh; phần còn lại theo FIFO như thẻ trả trước |
| 2 | Loại tài sản đợt đầu | **Chỉ xu chính.** Xu thưởng/điểm thuộc Loyalty (`RewardLedger`, ADR 0027). Ledger có tham số `asset` để thêm sau | Tách tiền thật khỏi điểm khuyến mãi; bất biến đơn giản |
| 3 | Ai được nạp | **Staff trở lên**, chỉ khi **đang mở ca**. Khách tự nạp qua chuyển khoản: tạo yêu cầu, Staff xác nhận khi thấy tiền về (cổng thanh toán tự động: sau) | Mỗi đồng tiền mặt vào sổ đều gắn người nhận và ca, nên kết ca đối soát được |
| 4 | Hoàn tiền nạp | **Được**, Manager trở lên, tối đa số dư còn lại **tại chi nhánh nạp đó**, trả qua ca đang mở, bắt buộc lý do. Chưa giới hạn thời gian | Hoàn sai là rủi ro gian lận lớn nhất nên cần cấp cao hơn Staff |
| 5 | Danh tính khách | **Ví của khách** (địa chỉ). Tài khoản NET (username) và member trỏ về ví; session wallet trên máy trạm trỏ về ví qua `DelegateRegistry` | Ledger không cần biết dữ liệu cá nhân; khớp nguyên tắc 7 |

Giới hạn: mỗi khách tối đa **16** "túi" chi nhánh có số dư > 0 (danh sách swap-pop), để vòng trừ tiền có trần (nguyên tắc 2).

## 5. Ca thu ngân và đối soát két

Thuộc `core/payment` (giai đoạn 3), thiết kế ngay để Ledger gắn được `shiftId`.

```text
Mở ca:   Staff, chi nhánh, tiền đầu ca (đếm)               → Shift Open
Trong ca: mọi bút toán có phương thức ≠ ví gắn shiftId      → cộng dồn theo phương thức
Kết ca:  Staff nhập tiền mặt đếm được (và CK/thẻ nếu muốn)  → Shift Closed
         dự kiến = đầu ca + thu − chi (theo phương thức)
         chênh lệch = đếm được − dự kiến (ghi lại, không tự sửa sổ)
Duyệt:   Manager xác nhận ca (hoặc ghi chú chênh lệch)      → Shift Approved
```

- Một Staff một ca mở tại một chi nhánh; ca có trạng thái tường minh (nguyên tắc 4).
- Báo cáo két theo ngày = danh sách ca của ngày + tổng theo phương thức + tổng chênh lệch.
- Chuyển khoản/thẻ đối soát với sao kê ngân hàng **ngoài chain**; hệ cung cấp số dự kiến theo ca/ngày để so.

## 6. Bộ đếm tổng hợp và báo cáo

### 6.1 Cách lưu (các phương án)

| Phương án | Cách | Được | Mất |
|---|---|---|---|
| A. Không tổng hợp | client đọc bút toán từ FullDB, tự cộng | đơn giản, ghi rẻ | xem tháng toàn hệ phải đọc hàng chục nghìn bút toán; chậm, dễ lệch |
| B. Tài liệu tổng hợp trong FullDB | mỗi (chi nhánh, ngày) một document, `setDataDocument` mỗi giao dịch | không tốn storage | phụ thuộc chain trả lời `setDataDocument` có nguyên tử không **[chờ chain]**; không kiểm được bằng invariant |
| **C. Bộ đếm trong storage** (chọn) | mảng số cố định theo (phạm vi, ngày), cộng ngay trong hàm ghi Ledger | nguyên tử cùng giao dịch, kiểm bằng invariant (tổng chi nhánh = tổng agent = tổng nền tảng = tổng bút toán), view đọc nhanh | thêm vài lần ghi storage mỗi giao dịch (chain này gas rẻ, có FreeGas) |

**[Claude chọn] C**, kèm bút toán chi tiết ở FullDB để xem chi tiết. Khi sau này có indexer, bộ đếm vẫn là nguồn đối chiếu.

### 6.2 Cấu trúc

- Ngày kinh doanh = ngày theo giờ địa phương của chi nhánh (`tzOffsetMinutes` đã có trong `BranchRegistry`): `day = floor((timestamp + tz·60) / 86400)`.
- Ba cấp, cùng bộ chỉ số, cập nhật trong cùng giao dịch:
  - `(chi nhánh, ngày)`
  - `(agent, ngày)`
  - `(nền tảng, ngày)`
- Bút toán cộng vào ngày địa phương **của chi nhánh ghi nhận**, ở cả ba cấp. Hiện mọi chi nhánh cùng UTC+7 nên ngày khớp nhau; khác múi giờ thì cấp agent/nền tảng là tổng các ngày địa phương [Claude chọn].
- Chỉ số (mảng cố định, thêm ở cuối khi cần):

| Nhóm | Chỉ số |
|---|---|
| Tiền thu | thu theo phương thức (4), chi/hoàn theo phương thức (4) |
| Ví | nạp, trừ, hoàn nạp |
| Doanh thu | gộp NET, gộp IQR, giảm trừ NET, giảm trừ IQR, hoàn NET, hoàn IQR |
| Khác | điều chỉnh (+/−), doanh thu phục vụ chéo chi nhánh (tiền nạp nơi khác dùng ở đây) |

- Thuế: giá đã gồm thuế [Claude chọn]; báo cáo tính phần thuế `gộp · bps / (10000 + bps)` theo mức thuế hiệu lực của chi nhánh ở `BranchRegistry`.

### 6.3 Đọc báo cáo

- View `rollup(scope, id, fromDay, toDay)` trả mảng theo ngày, tối đa 93 ngày mỗi lần (nguyên tắc 2). Tháng = cộng các ngày.
- "Toàn hệ" đọc `(nền tảng, ngày)`; "lọc agent" đọc `(agent, ngày)`; "chi tiết chi nhánh" đọc `(chi nhánh, ngày)` của từng chi nhánh (danh sách chi nhánh của agent đã có ở `BranchRegistry`).
- Chi tiết từng bút toán: `HistoryIndex.search(agentId, "ledger", …)` lọc theo nhãn chi nhánh, ngày, loại, ca, khách, nhân viên.

### 6.4 Ai xem gì

| Vai | Màn hình |
|---|---|
| Owner/Admin nền tảng | tổng toàn hệ theo ngày/tháng; bảng xếp agent; vào một agent → bảng chi nhánh; vào chi nhánh → ca, bút toán |
| Chủ agent | tổng mọi chi nhánh; lọc chi nhánh; ca thu ngân; số dư ví khách; phí nền tảng của mình |
| Manager | chi nhánh mình: ngày, ca, duyệt kết ca, bút toán |
| Staff | ca của chính mình |

**Giới hạn phải biết:** trên chain, view và FullDB **ai có RPC cũng đọc được**. Phân quyền xem ở bảng trên là luật **của app**, không phải bí mật. Xem câu hỏi mở 1.

## 7. Phí nền tảng

- Cơ sở tính: **doanh thu thuần** của agent trong kỳ (tháng, theo giờ VN), đọc từ bộ đếm `(agent, ngày)`.
- Chính sách phí theo agent [Claude chọn]: `bps` trên doanh thu thuần + phí cố định mỗi chi nhánh đang hoạt động + mức tối thiểu; lưu ở storage, chỉ `PLATFORM_ADMIN` sửa, có hiệu lực từ kỳ sau.
- Đợt đầu: view `feeQuote(agentId, kỳ)` tính ra số phí; xuất hoá đơn và thu tiền **ngoài chain**. Ghi nhận đã thu phí, khoá kỳ, licence: làm cùng licence (đã hoãn theo câu 6).

## 8. Chống gian lận và bất biến

- Nạp, bán trực tiếp, hoàn đều bắt buộc gắn ca đang mở và người thao tác.
- Tổng số dư ví khách của agent = Σ(nạp − trừ − hoàn nạp ± điều chỉnh ví) trên bộ đếm agent (invariant test).
- Σ bộ đếm chi nhánh = bộ đếm agent; Σ bộ đếm agent = bộ đếm nền tảng (invariant test).
- `refId` không dùng hai lần; bút toán đảo chỉ đảo được một lần và không vượt số gốc.
- Module (NET, IQR) chỉ ghi được loại bút toán của mình; số tiền trừ ví do module tính theo bảng giá on-chain, không nhận từ client.

## 9. Không làm (đợt đầu)

- Không giữ fiat, không cổng thanh toán tự động, không rút tiền on-chain.
- Không đa tiền tệ.
- Không kế toán điểm Loyalty trong Ledger (Loyalty tự giữ).
- Không xuất phần mềm kế toán, không hoá đơn điện tử.
- Không coi "phân quyền xem" là bảo mật dữ liệu (xem câu hỏi mở 1).

## 10. Thứ tự triển khai

| # | Phần | Phụ thuộc |
|---|---|---|
| 1 | `core/ledger`: tài khoản ví, bút toán, `refId`, bộ đếm 3 cấp, ghi FullDB, invariant | AgentAccess (quyền), BranchRegistry (tz, thuế) |
| 2 | `core/payment`: ca thu ngân, nạp/hoàn qua ca, bán trực tiếp | 1 |
| 3 | `core/delegate`: session wallet → ví khách | — |
| 4 | NET, IQR ghi doanh thu qua Ledger | 1–3 |
| 5 | Phí nền tảng: chính sách + `feeQuote` | 1 |
| 6 | Trang báo cáo trên web theo vai | 1, 2 |

## 11. Câu hỏi mở cho người dùng

1. **Doanh thu công khai?** Trên chain ai cũng đọc được số liệu của mọi agent (kể cả đối thủ). Chọn: (a) chấp nhận công khai, app chỉ lọc theo vai; (b) mã hoá chi tiết bút toán ở FullDB, bộ đếm vẫn công khai; (c) số liệu nhạy cảm để off-chain. Claude nghiêng về **(a) cho đợt đầu**, ghi rủi ro, chốt cùng ADR 0026.
