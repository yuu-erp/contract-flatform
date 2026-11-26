# core/ledger — Ledger

Sổ cái tiền của hệ mới: ví xu của khách theo agent (chia **túi theo chi nhánh nạp**), bộ đếm ngày ba cấp (nền tảng, agent, chi nhánh) và bản ghi từng bút toán vào FullDB qua `HistoryIndex` (kind `ledger`). Đặc tả nghiệp vụ gốc: `docs/08-dong-tien-va-doanh-thu.md`. Cài đặt thuế và phương thức thanh toán: `docs/modules/core-sales-settings.md`.

Code: `src/shared/ledger/Ledger.sol`, `src/interfaces/ILedger.sol`, `src/libraries/LedgerMetrics.sol`. UUPS, namespace ERC-7201 `metaplatform.core.ledger`.

## 1. Mô hình poster — giấy phép (ADR 0031, 2026-11-26)

- Ledger **không** nhận lệnh từ người dùng hay từ app. Chỉ "poster" có giấy phép gọi được các hàm ghi.
- `PLATFORM_OWNER` gọi `setPoster(poster, moduleId, kindsMask, maxAmount)`; `licenseOf(poster)` đọc lại. `kindsMask` bit `1 << uint8(EntryKind)` (Topup=1, WalletSpend=2, DirectSale=3, TopupRefund=4, SaleRefund=5, Adjust=6); `kindsMask = 0` thu hồi.
  - `moduleId = 0`: thanh toán của nền tảng (`PaymentAccounts`), chỉ được **Topup / TopupRefund**. Tiền chỉ vào ví qua đây.
  - `moduleId ≠ 0`: module có cờ `FLAG_SALES` ở Registry, chưa Retired (NET, IQR), chỉ được **WalletSpend / DirectSale / SaleRefund / Adjust**.
  - `maxAmount > 0`: trần số tiền **mỗi bút toán** (`AmountExceedsLimit`). Sai bất kỳ điều kiện nào → `InvalidLicense`.
- Bút toán bán hàng luôn ghi cho **module của poster**: hàm ghi không còn tham số `service` (`walletSpend(ctx, customer, amount, discount)`, `directSale(ctx, customer, method, amount, discount)`, `adjust(ctx, increase, amount, reason)`). `SaleRefund` phải cùng module với bút toán gốc (`WrongModule`).
- **Cầu dao module**: mọi bút toán bán hàng gọi `BranchRegistry.requireWritable(branch, service)`, hàm này kiểm `Registry.requireActive(moduleId)`. Module bị `Paused` → Ledger từ chối mọi bút toán của module đó; nạp ví và module khác vẫn chạy (test `test_modulePaused_onlyThatModuleStops`).
- Gọi sai loại: `NotPoster(caller, kind)`. Phát `PosterSet(1, poster, moduleId, kindsMask, maxAmount)`.
- **Deploy không đăng ký poster nào.** Test dùng `MockLedgerPoster` (định tuyến tới 3 poster con: `pay` module 0, `net` module 1, `iqr` module 2).
- Mọi hàm ghi đi qua cùng một cổng (`_newEntry`): kiểm giấy phép + trần, `amount > 0`, `refId != 0` (`ZeroRefId`), `refId` chưa dùng (`RefIdUsed`), chi nhánh `Active` (`BranchNotActive`), agent ghi được (`requireAgentWritable`). `Ctx = {refId, branchId, actor, shiftId}`.
- Tiền chỉ đi qua Ledger; số tiền hoàn/huỷ do Ledger tự tính từ bút toán gốc và túi, không tin bên gọi (chỉ bị chặn bởi trần).
- **Bộ đếm**: `rollup` giữ chỉ số chung 0..9 (tiền thu, ví); ô 10..31 bỏ trống. Bộ đếm theo module ở `moduleRollup(scope, id, moduleId, from, to)` → `uint256[9]`: GROSS, DISCOUNT, REFUND, ADJ_UP, ADJ_DOWN, TAX, TAX_REFUND, SERVED_HERE, SERVED_HERE_REFUND (hai ô cuối chỉ ở phạm vi chi nhánh). Frontend ghép lại về 32 ô cũ (`mergeModuleRollups`).
- **Kích thước**: phần ghi FullDB (`LedgerRecorder`) và thao tác túi ví (`LedgerWallet`) là library liên kết ngoài (DELEGATECALL, `msg.sender` vẫn là Ledger). Ledger 23.158 B.

## 2. Sáu loại bút toán

| Loại | Hàm | Kiểm tra (ngoài cổng chung) | Tác động chính |
|---|---|---|---|
| `Topup` | `topup(ctx, customer, method, amount)` | `amount>0`, `customer != 0`, `method` ∈ CASH/TRANSFER/CARD (`InvalidMethod`), phương thức bật ở chi nhánh, tối đa 16 túi (`TooManyBuckets`) | cộng túi chi nhánh `ctx.branchId`; `CASH_IN+m`, `WALLET_TOPUP` |
| `WalletSpend` | `walletSpend(ctx, customer, service, amount, discount)` | `amount>0`, `customer != 0`, dịch vụ NET/IQR (`InvalidService`), dịch vụ bật ở chi nhánh phục vụ, WALLET bật, đủ số dư (`InsufficientBalance`, kiểm trước mọi thay đổi) | trừ túi; `WALLET_SPEND`, `GROSS`, `TAX`, `DISCOUNT`; `SERVED_HERE` nếu chi nhánh nạp khác chi nhánh phục vụ |
| `DirectSale` | `directSale(ctx, customer, service, method, amount, discount)` | `amount>0`, NET/IQR, dịch vụ bật, `method` ∈ CASH/TRANSFER/CARD và bật; `customer` có thể là 0 | `CASH_IN+m`, `GROSS`, `TAX`, `DISCOUNT` |
| `TopupRefund` | `refundTopup(ctx, customer, method, amount, reason)` | `amount>0`, `reason` 1–200 byte (`InvalidReason`), method CASH/TRANSFER/CARD và bật; chặn bởi **số dư túi** của `ctx.branchId` | trừ túi; `CASH_OUT+m`, `WALLET_TOPUP_REFUND` |
| `SaleRefund` | `refundSale(ctx, originalRefId, amount, reason)` | `reason` 1–200 byte (`InvalidReason`), gốc phải là WalletSpend/DirectSale (`UnknownEntry`), `ctx.branchId` khớp chi nhánh gốc (`WrongBranch`), `refunded + amount <= gốc` (`RefundExceedsOriginal(remaining, requested)`) | xem mục 3 |
| `Adjust` | `adjust(ctx, service, increase, amount, reason)` | `amount>0`, NET/IQR, dịch vụ bật, `reason` 1–200 byte (`InvalidReason`) | `ADJ_UP` hoặc `ADJ_DOWN` ở ba cấp; **chỉ đụng doanh thu** |

Ghi chú:

- `discount` chỉ để thống kê, không kiểm so với `amount` (có thể lớn hơn).
- **Hướng của `Adjust`** nằm ở trường `method` của `Entry`, `LedgerRecord` và `Posted`: `Ledger.ADJUST_UP = 1`, `Ledger.ADJUST_DOWN = 2` (không phải phương thức thanh toán). Adjust không có bút toán gốc nên **không ghi thuế**, không đụng ví, tiền thu hay `TAX`.
- `refundSale` **không** kiểm lại phương thức thanh toán (phương thức gốc có thể đã bị tắt sau đó). Bút toán hoàn lưu `method` = phương thức gốc (WALLET với hoàn ví) và `taxBps` gốc.
- **Lý do bắt buộc khi hoàn**: `refundTopup` và `refundSale` đòi `reason` 1–200 byte như `adjust` (cùng kiểm tra, `InvalidReason`), lưu vào `LedgerRecord.reason` ở FullDB.
- Số tiền hiệu dụng phải `< 1e20` vì `FullDBCodec.toPadded` (mã hoá số vào FullDB).

## 3. Túi ví

- Số dư là `(agentId, customer) → Portion[]`, mỗi `Portion = {branchId, amount}`. Mỗi chi nhánh nạp tối đa một túi; tối đa `MAX_BUCKETS = 16` túi mỗi khách (nạp vào túi chi nhánh mới khi đã đủ 16 → `TooManyBuckets`).
- **Thứ tự trừ** khi `walletSpend` tại chi nhánh B: túi của B trước, rồi các túi còn lại theo **thứ tự nạp đầu tiên** (thứ tự mảng). Túi hết tiền bị xoá bằng **dịch trái** (giữ thứ tự). Nạp lại vào chi nhánh đã bị xoá túi → túi mới ở cuối mảng.
- Bút toán WalletSpend lưu `portions[refId]` = các phần đã lấy `[(branch, amount), ...]` theo thứ tự lấy.
- **Hoàn ví** (`refundSale` trên WalletSpend): xu trả về **túi chi nhánh nạp** theo thứ tự **ngược** (phần cuối trước), tiếp tục từ chỗ lần hoàn trước dừng (dựa `refunded`). Túi bị xoá được tạo lại (nếu đã đủ 16 túi → `TooManyBuckets`). Xu được cộng cho chi nhánh nạp **kể cả khi chi nhánh đó đang `Suspended`**. Mỗi phần phát `REFUND` + `WALLET_CREDIT` ở chi nhánh nạp; `WALLET_CREDIT` cũng ở agent/nền tảng.
- Hoàn DirectSale: tiền thật ra (`CASH_OUT + methodIndex`), `REFUND`, `TAX_REFUND`; không đụng túi.
- `balanceOf` duyệt tối đa 16 túi; `walletLiability(agentId)` là số cộng dồn của toàn agent.

## 4. Bộ đếm ngày

`rollup(scope, id, fromDay, toDay)` trả `uint256[32][]` (mỗi ngày một hàng), tối đa `MAX_RANGE_DAYS = 93` ngày (`InvalidRange`). `scope`: 0 nền tảng (`id` bị bỏ qua, coi như 0), 1 agent, 2 chi nhánh. Mọi bút toán cộng đồng thời ba cấp.

| Chỉ số | Vị trí | Ý nghĩa |
|---|---|---|
| `CASH_IN + m` | 0, 1, 2 | thu tiền thật: CASH, TRANSFER, CARD (nạp + bán trực tiếp) |
| `CASH_OUT + m` | 3, 4, 5 | chi/hoàn tiền thật theo phương thức |
| `WALLET_TOPUP` | 6 | xu nạp |
| `WALLET_SPEND` | 7 | xu trừ khi dùng dịch vụ |
| `WALLET_TOPUP_REFUND` | 8 | xu hoàn lại cho khách thành tiền thật |
| `WALLET_CREDIT` | 9 | xu hoàn về túi (hoàn WalletSpend) |
| `SERVICE_BASE + s·8 + off` | NET: 10–17, IQR: 18–25 | doanh thu từng dịch vụ (bảng dưới) |
| `SERVED_HERE_REFUND` | NET: 26, IQR: 27 | hoàn phần phục vụ tại chỗ (chỉ cấp chi nhánh) |
| 28–31 | | dự trữ |

Offset trong mỗi dịch vụ: `GROSS` 0, `DISCOUNT` 1, `REFUND` 2, `ADJ_UP` 3, `ADJ_DOWN` 4, `TAX` 5, `TAX_REFUND` 6, `SERVED_HERE` 7.

**Phục vụ tại chỗ thuần** (chi nhánh) = `SERVED_HERE − SERVED_HERE_REFUND`.

**Doanh thu thuần** của một dịch vụ = `GROSS − REFUND + ADJ_UP − ADJ_DOWN`. `DISCOUNT` chỉ để tham khảo (giá đã nằm trong `GROSS`; có thể lớn hơn `amount`, không trừ lần nữa). Thuế còn lại = `TAX − TAX_REFUND`.

Quy tắc ngày (ngày kinh doanh = `floor((ts + tzOffsetMinutes·60) / 86400)` của chi nhánh ghi nhận; `dayOf(branchId, ts)`):

- Chỉ số theo phần ví (`WALLET_SPEND`, `GROSS`, `TAX`, `DISCOUNT`) tính theo **ngày của chi nhánh nạp A**, ở cấp nền tảng/agent/chi nhánh A.
- `SERVED_HERE` ghi ở cấp chi nhánh phục vụ B, theo **ngày của B**, chỉ khi A ≠ B. Hoàn một phần chéo chi nhánh **không** trừ `SERVED_HERE`; nó cộng `SERVED_HERE_REFUND` ở B, ngày hoàn của B (phần cùng chi nhánh không cộng gì).
- Mọi bút toán hoàn (`REFUND`, `TAX_REFUND`, `CASH_OUT`, `WALLET_CREDIT`) tính vào **ngày hoàn**, theo múi giờ chi nhánh hoàn/credit tương ứng, không sửa ngày của gốc.
- Bất biến: với mọi chỉ số trừ `SERVED_HERE` và `SERVED_HERE_REFUND`, Σ chi nhánh = agent = nền tảng (một agent).

## 5. Thuế

- Mức `bps` lấy từ `SalesSettings.taxOf(branch, service)` của **chi nhánh phục vụ** (B), chốt vào `Entry.taxBps` lúc ghi.
- Tiền đã trả đã gồm thuế: `tax = paid · bps / (10000 + bps)`, làm tròn xuống 1 đồng. Với `walletSpend`, tính **mỗi phần (portion) riêng, mỗi phần làm tròn xuống**, rồi cộng; `Posted.tax` là tổng.
- Thuế hoàn dùng `taxBps` **gốc** (không dùng mức hiện tại), tính theo phần, và **tổng thuế đã hoàn không vượt thuế của gốc**.
- `Adjust` không ghi thuế.

## 6. Lỗi

`ZeroAddress`, `ZeroAmount`, `ZeroRefId`, `NotPoster(caller, kind)`, `RefIdUsed`, `InvalidMethod`, `TooManyBuckets(agentId, customer)`, `InsufficientBalance(available, requested)`, `InvalidRange`, `UnknownEntry`, `RefundExceedsOriginal(remaining, requested)`, `WrongBranch(expected, actual)`, `InvalidService`, `InvalidReason`, `BranchNotActive`. Lỗi từ `SalesSettings` (`MethodNotEnabled`, `ServiceNotEnabled`) và registry (agent bị dừng) đi nguyên.

## 7. Bản ghi và event

- `Posted(version=1, agentId, branchId, refId, kind, customer, service, method, amount, tax, actor, shiftId)`, `PosterSet`.
- FullDB: kind `ledger`, nhãn `B` (chi nhánh), `K` (loại), `S` (người thao tác), `W` (ví khách, nếu có), `C` (ca, nếu ≠ 0); giá trị `timestamp`, `amount`, `day`; thân `abi.encode(LedgerRecord)` (có `originalRefId`, `portions`, `reason`). Phần của bút toán hoàn chỉ ghi trong FullDB, không ghi `portions` storage.
- **Nguồn dựng lại bộ đếm là bản ghi FullDB**, không phải event `Posted` (event thiếu `originalRefId`, `discount`, `portions`).
- Bút toán không sửa/xoá.

## 8. Kích thước và gas

Đo ngày 2026-11-19 (sau đợt sửa cuối) (`forge build --sizes`, solc 0.8.28, optimizer 200):

| Contract | Runtime | Giới hạn | Còn lại |
|---|---|---|---|
| `Ledger` | 24,403 B | 24,576 B | 173 B |
| `SalesSettings` | 11,297 B | 24,576 B | 13,279 B |

**Ledger gần trần**: mọi thay đổi thêm mã phải chuyển phần dựng `LedgerRecord` + gọi `HistoryIndex.append` sang một library `public` trước.

Gas một giao dịch (poster → Ledger, test với `MockFullDB`, trạng thái lạnh, 3 cấp bộ đếm + bản ghi FullDB; con số thật phụ thuộc chi phí ghi FullDB):

| Thao tác | Gas |
|---|---|
| `topup` (túi mới) | ≈ 1,279,000 |
| `topup` (túi có sẵn) | ≈ 982,000 |
| `walletSpend` (2 túi) | ≈ 1,420,000 |
| `directSale` | ≈ 1,017,000 |
| `refundSale` ví (2 phần) | ≈ 1,359,000 |
| `refundSale` bán trực tiếp | ≈ 1,089,000 |
| `adjust` | ≈ 962,000 |

Ngân sách: mọi hàm ghi < 1.5M gas (hiện ≤ 1.42M). Ảnh chụp gas test: `.gas-snapshot` (`make snapshot-update`).

## 9. Kiểm thử

- Unit: `test/shared/ledger/*.t.sol`, `test/libraries/LedgerMetrics.t.sol`.
- Bất biến `test/invariant/Ledger.invariant.t.sol` (handler gọi ngẫu nhiên sáu hàm ghi, 3 chi nhánh khác múi giờ, 3 khách, warp ≤ 3 ngày; lời gọi sai bị nuốt): nợ ví = Σ túi; dòng xu theo ngày = nợ ví; Σ chi nhánh = agent = nền tảng (trừ `SERVED_HERE`, `SERVED_HERE_REFUND`); mỗi dịch vụ ở cấp agent `Σ TAX_REFUND ≤ Σ TAX` và `Σ REFUND ≤ Σ GROSS`; `refunded ≤ amount`; ≤ 16 túi và không túi 0. Profile mặc định 64 lượt × 64 sâu; `ci` 256 × 128 xanh.

## 10. Để sau

- Hoàn ví có thể bị chặn bởi `TooManyBuckets` khi túi của chi nhánh nạp A đã bị xoá và khách đang giữ 16 túi khác.
- Mặt nạ poster theo **loại bút toán**, không theo dịch vụ: poster NET có bit WalletSpend vẫn ghi được IQR. Khi đăng ký poster thật, thêm mặt nạ dịch vụ theo từng poster.
- Thêm getter `ADJUST_UP` / `ADJUST_DOWN` vào `ILedger` khi viết poster đầu tiên.
