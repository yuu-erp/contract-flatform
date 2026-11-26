# core/payment — SalesSettings

Nguồn: `docs/08-dong-tien-va-doanh-thu.md` mục 4.4. Contract: `src/shared/payment/SalesSettings.sol`, interface `src/interfaces/ISalesSettings.sol`.

## Vai trò

Giữ cài đặt bán hàng của agent: mức thuế, kiểu giá và phương thức thanh toán. Ledger và Payment đọc ở đây lúc ghi bút toán và chốt kết quả vào bút toán (đổi cài đặt không đổi số cũ). Thuế tách khỏi `BranchRegistry` vì contract đó gần trần 24 KB.

## Luật

- Chỉ **chủ agent** của đúng agent được ghi; admin và owner nền tảng, Manager, Staff đều bị `NotAgentOwner`. Agent phải `Active` (qua `requireAgentWritable`); hàm cấp chi nhánh cần chi nhánh `Active` (`BranchNotActive`). Mọi hàm ghi `whenNotPaused`.
- Dịch vụ có thuế: `NET = 1`, `IQR = 2`; khác thì `InvalidService`. `bps` 0–10000 (`TaxTooHigh`), mặc định 0.
- Thuế chi nhánh ghi đè mức agent; `clearBranchTax` về mức agent.
- Kiểu giá mặc định **đã gồm thuế**. `setTaxExclusive(_, NET, true)` revert `TaxModeNotAllowed`; IQR chọn được cả hai.
- Phương thức: `CASH=1, TRANSFER=2, CARD=4, WALLET=8`. Agent: khác 0 và `⊆ 15`, chưa đặt = `CASH|WALLET` (9). Chi nhánh: `0` = theo agent, hoặc tập con của tập hiệu lực của agent (`MethodsNotAllowed`).
- `paymentMethodsOf(b) = (branch == 0 ? agentEff : branch) & agentEff`: thu hẹp tập agent không xoá bit ở chi nhánh nhưng bit ngoài tập agent ngừng dùng được.
- `requireMethod` revert `MethodNotEnabled` nếu `method` không phải đúng một bit hoặc không nằm trong `paymentMethodsOf`.
- Làm tròn xuống 1 đồng. Đã gồm: `tax = amount·bps/(10000+bps)`, `total = amount`. Chưa gồm: `tax = amount·bps/10000`, `total = amount + tax`.

## Hàm

| Hàm | Ai | Việc |
|---|---|---|
| `setAgentTax(agentId, service, bps)` | chủ agent | mức thuế mặc định của agent |
| `setBranchTax(branchId, service, bps)` | chủ agent | mức thuế riêng chi nhánh |
| `clearBranchTax(branchId, service)` | chủ agent | bỏ ghi đè |
| `setTaxExclusive(agentId, service, exclusive)` | chủ agent | kiểu giá |
| `setAgentPaymentMethods(agentId, methods)` | chủ agent | tập phương thức của agent |
| `setBranchPaymentMethods(branchId, methods)` | chủ agent | tập con ở chi nhánh, `0` = theo agent |
| `taxOf`, `agentTaxOf`, `branchTaxOf`, `isTaxExclusive` | ai cũng đọc | đọc thuế |
| `quoteTax(branchId, service, amount)` | ai cũng đọc | `(bps, exclusive, tax, total)` |
| `agentPaymentMethodsOf`, `paymentMethodsOf`, `requireMethod` | ai cũng đọc | đọc phương thức |

## Dữ liệu

Namespace ERC-7201 `metaplatform.core.payment.settings`: `agents, branches, history`; `agentTax[agentId][service]`; `branchTaxPlusOne[branchId][service]` (bps+1, 0 = chưa đặt); `taxExclusive[agentId][service]`; `agentMethods[agentId]` (0 = mặc định); `branchMethods[branchId]` (0 = theo agent).

Event (version 1): `TaxChanged` (chữ ký như `BranchRegistry` cũ), `TaxModeChanged`, `PaymentMethodsChanged` (`oldMethods`/`newMethods` là giá trị lưu, `0` = mặc định/theo agent). Audit `platform_audit` với action `sales_tax`, `sales_tax_mode`, `sales_methods`. SalesSettings cần là writer của `HistoryIndex` với kind `platform_audit`.
