# 08. Dòng tiền, doanh thu và báo cáo

Trạng thái: **đã duyệt** (người dùng, 2026-11-19), bổ sung thuế và phương thức thanh toán (mục 4.4). Đầu vào cho ADR 0022 (Ledger) và đặc tả `docs/modules/core-ledger.md`, `core-payment.md`.
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
| `ADJUST` điều chỉnh thủ công (bắt buộc ghi dịch vụ NET/IQR) | tuỳ | tuỳ | tuỳ | tuỳ |

Luật:
- **Không sửa, không xoá bút toán.** Sai thì ghi bút toán đảo, trỏ `refId` gốc.
- Hoàn tiền tính vào **ngày hoàn**, không sửa số của ngày gốc (như POS).
- Số tiền khi hoàn/huỷ do contract lấy từ bút toán gốc, không nhận từ bên gọi (nguyên tắc 3).
- Một đơn trả bằng nhiều cách (ví + tiền mặt) ghi **nhiều bút toán**, cùng mã đơn, mỗi bút toán một `refId` [Claude chọn].
- `ADJUST` chỉ Manager trở lên, bắt buộc lý do và dịch vụ (NET hoặc IQR), luôn hiện riêng trong báo cáo, tách theo dịch vụ.
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

### 4.4 Cài đặt của agent: thuế và phương thức thanh toán

Đặt trong contract mới **`SalesSettings`** (`core/payment`) [Claude chọn]: `BranchRegistry` còn ~820 byte trước trần 24 KB, và hệ deploy lại từ đầu nên chuyển thuế ra khỏi `BranchRegistry` không cần migrate. Chỉ **chủ agent** sửa (admin nền tảng không), agent và chi nhánh phải `Active`; mỗi thay đổi phát event và ghi audit.

**Thuế** (mỗi dịch vụ NET, IQR):

| Cài đặt | Cấp | Mặc định |
|---|---|---|
| Mức thuế `bps` (0–10000) | agent; chi nhánh ghi đè được, xoá ghi đè thì về mức agent (như hiện có ở `BranchRegistry`) | 0 |
| Kiểu giá: **đã gồm thuế** / **chưa gồm thuế** | agent | đã gồm |

- **IQR**: chọn được cả hai kiểu. Chưa gồm thuế: hoá đơn = tổng món + `tổng · bps / 10000` (khách trả thêm). Đã gồm thuế: khách trả đúng giá, thuế = `tổng · bps / (10000 + bps)`.
- **NET**: chỉ kiểu **đã gồm thuế** (giá giờ chơi niêm yết trọn gói), mặc định 0 %. Bật thuế để báo cáo cho chủ agent biết số thuế phải nộp trên doanh thu dịch vụ; không cộng thêm vào tiền khách trả. Mức áp dụng tuỳ loại hình (hộ kinh doanh nộp theo tỷ lệ doanh thu, doanh nghiệp tính VAT); chủ agent hỏi kế toán, hệ không đặt sẵn.
- **Chốt thuế lúc bán:** mỗi bút toán doanh thu lưu mức `bps` (`Entry.taxBps`); số thuế nằm trong bản ghi FullDB và event `Posted`. Kiểu giá chỉ ảnh hưởng cách poster tính số tiền khách trả (`paid`); Ledger luôn tách thuế `paid · bps / (10000 + bps)` từ `paid`. Đổi cài đặt không đổi số cũ.
- Nạp ví **không** tính thuế; thuế phát sinh khi ghi nhận doanh thu (`WALLET_SPEND`, `DIRECT_SALE`). Hoàn tính thuế đảo theo bút toán gốc (mức `bps` gốc, tổng thuế hoàn không vượt thuế gốc). Điều chỉnh (`ADJUST`) không có bút toán gốc nên **không ghi thuế**.
- Làm tròn: thuế làm tròn xuống đến 1 đồng [Claude chọn].

**Phương thức thanh toán:** `CASH`, `TRANSFER`, `CARD`, `WALLET` (xu chính).

| Cài đặt | Cấp | Mặc định |
|---|---|---|
| Tập phương thức được dùng | agent (bitmask) | `CASH \| WALLET` |
| Tập con bật ở chi nhánh | chi nhánh, phải nằm trong tập của agent | bằng tập của agent |

- `TOPUP` và `DIRECT_SALE` revert nếu phương thức chưa bật ở chi nhánh; `TOPUP` không nhận `WALLET`.
- Thu hẹp tập của agent không xoá bit ở chi nhánh; bit ngoài tập agent ngừng dùng được (giống trần dịch vụ).
- `TRANSFER` cần tài khoản nhận tiền: on-chain lưu hash số tài khoản và trạng thái; thông tin hiển thị để tạo VietQR lưu FullDB. Thuộc `core/payment`, làm cùng ca thu ngân.

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
| Doanh thu (mỗi dịch vụ NET, IQR một bộ) | gộp, giảm trừ, hoàn, điều chỉnh tăng, điều chỉnh giảm, thuế |
| Phục vụ tại chỗ (mỗi dịch vụ một bộ) | giá trị dịch vụ cung cấp **tại chi nhánh này** bằng tiền nạp ở chi nhánh khác (`SERVED_HERE`), và phần đã hoàn của nó (`SERVED_HERE_REFUND`, chỉ ở cấp chi nhánh, ngày hoàn) |

- Doanh thu thuần của một dịch vụ = gộp − hoàn + điều chỉnh tăng − điều chỉnh giảm (`GROSS − REFUND + ADJ_UP − ADJ_DOWN`); giảm trừ chỉ để tham khảo, có thể vượt số tiền. Ví dụ "doanh thu NET toàn hệ tháng 11" = Σ công thức này trên bộ đếm `(nền tảng, ngày)` các ngày tháng 11; thay bằng `(agent, ngày)` hoặc `(chi nhánh, ngày)` để lọc.
- Mỗi chi nhánh xem được hai góc: **doanh thu ghi nhận** (theo chi nhánh nạp, câu 8) và **dịch vụ phục vụ tại chỗ** = doanh thu ghi nhận của chính nó do khách nạp tại chỗ + chỉ số "phục vụ tại chỗ" thuần (`SERVED_HERE − SERVED_HERE_REFUND`). Hoàn ví chéo chi nhánh chỉ cộng `SERVED_HERE_REFUND` ở chi nhánh phục vụ, không bao giờ trừ `SERVED_HERE`.
- Tiền thu không tách theo dịch vụ (ví dùng chung NET và IQR); chỉ tách theo phương thức. Bán trực tiếp IQR vẫn biết là IQR qua bút toán `DIRECT_SALE`.
- Thuế: số thuế của từng bút toán doanh thu tính lúc ghi theo mục 4.4 và cộng vào chỉ số "thuế" của dịch vụ.

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

### 6.5 Quyết định khi cài đặt Ledger (T14, 2026-11-19)

Chi tiết ở `docs/modules/core-ledger.md`.

- Deploy không đăng ký poster; owner cấp quyền theo mask loại bút toán.
- Túi ví: chi nhánh phục vụ trước, rồi theo thứ tự nạp đầu tiên, xoá túi rỗng bằng dịch trái, tối đa 16 túi.
- Thuế theo mức của chi nhánh phục vụ, làm tròn xuống từng phần; hoàn dùng mức gốc.
- Ngày: phần của chi nhánh nạp theo ngày chi nhánh nạp; `SERVED_HERE` theo ngày chi nhánh phục vụ; hoàn theo ngày hoàn.
- Hướng điều chỉnh ghi ở `method` (`ADJUST_UP=1`, `ADJUST_DOWN=2`); `ADJUST` chỉ đụng doanh thu.
- `refundSale` không kiểm lại phương thức thanh toán; hoàn ví cộng cho túi chi nhánh nạp kể cả khi chi nhánh đó đang dừng.
- Số tiền hiệu dụng < 1e20 (giới hạn mã hoá FullDB).

## 7. Phí nền tảng

- Cơ sở tính: **doanh thu thuần** của agent trong kỳ (tháng, theo giờ VN), đọc từ bộ đếm `(agent, ngày)`.
- Chính sách phí theo agent [Claude chọn]: `bps` trên doanh thu thuần + phí cố định mỗi chi nhánh đang hoạt động + mức tối thiểu; lưu ở storage, chỉ `PLATFORM_ADMIN` sửa, có hiệu lực từ kỳ sau.
- Đợt đầu: view `feeQuote(agentId, kỳ)` tính ra số phí; xuất hoá đơn và thu tiền **ngoài chain**. Ghi nhận đã thu phí, khoá kỳ, licence: làm cùng licence (đã hoãn theo câu 6).

## 8. Chống gian lận và bất biến

- Nạp, bán trực tiếp, hoàn đều bắt buộc gắn ca đang mở và người thao tác.
- Tổng số dư ví khách của agent = Σ(nạp − trừ − hoàn nạp + xu hoàn về túi) (không có điều chỉnh ví) trên bộ đếm agent (invariant test).
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
| 0 | `SalesSettings`: thuế (chuyển từ `BranchRegistry`), kiểu giá, phương thức thanh toán | AgentRegistry, BranchRegistry |
| 1 | `core/ledger`: tài khoản ví, bút toán, `refId`, bộ đếm 3 cấp, ghi FullDB, invariant | AgentAccess (quyền), BranchRegistry (tz), SalesSettings (thuế) |
| 2 | `core/payment`: ca thu ngân, nạp/hoàn qua ca, bán trực tiếp | 1 |
| 3 | `core/delegate`: session wallet → ví khách | — |
| 4 | NET, IQR ghi doanh thu qua Ledger | 1–3 |
| 5 | Phí nền tảng: chính sách + `feeQuote` | 1 |
| 6 | Trang báo cáo trên web theo vai | 1, 2 |

## 11. Câu hỏi mở cho người dùng

1. **Doanh thu công khai?** Trên chain ai cũng đọc được số liệu của mọi agent (kể cả đối thủ). Chọn: (a) chấp nhận công khai, app chỉ lọc theo vai; (b) mã hoá chi tiết bút toán ở FullDB, bộ đếm vẫn công khai; (c) số liệu nhạy cảm để off-chain. Claude nghiêng về **(a) cho đợt đầu**, ghi rủi ro, chốt cùng ADR 0026. Người dùng duyệt thiết kế (2026-11-19) mà chưa chọn khác → **làm theo (a)**, xem lại khi viết ADR 0026.
