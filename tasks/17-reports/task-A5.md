# Task A5 — Cài đặt thuế và phương thức thanh toán

**Trạng thái:** Hoàn thành  
**Ngày:** 2026-11-23

## Đã làm

- `/settings`: chủ agent — `AgentSalesSettingsEditor` (thuế agent, ghi đè/xoá chi nhánh, IQR tách thuế, phương thức agent + chi nhánh «Theo agent» = 0, cảnh báo chi nhánh effective = 0); manager — chỉ đọc + `TaxQuotePreview`.
- `packages/chain/src/sales-settings.ts`: `parsePercentToBps`, bitmask, `effectiveBranchPaymentMethods`.
- `SalesSettingsApi`: thêm các hàm ghi; mock state + SDK-shaped read/write.
- Test `sales-settings.test.ts` theo kế hoạch.

## Kiểm tra

`pnpm -r build && pnpm lint && pnpm -r test && pnpm --filter agent shots` xanh (chain 75 test, gồm `sales-settings.test.ts`).

## Sửa sau review

- Mock: `mockId` / `mockBig` ở biên `create-mock-contracts`; test API (chi nhánh, manager3001, `quoteTax` 100.000₫).
- `AgentAppChrome`: `isError` + `ErrorState` / Thử lại; `agentAccessErrorMessage` + test.
- `TaxQuotePreview`: `decodeContractError` khi lỗi.
- `PageLoader` `data-page-loader`; shots chờ loader ≤ 15s.
- UI: chú thích trường `/settings` (`sales-settings-help.tsx`).