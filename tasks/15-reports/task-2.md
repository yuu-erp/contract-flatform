# Báo cáo Task 2 — metrics, ngày, vai trò, hook dữ liệu

## Đã làm

- `src/metrics.ts`, `src/days.ts`, `src/roles.ts` (mirror `LedgerMetrics.sol`).
- `src/react/`: `ContractsProvider`, `useActiveWallet`, `useConnectWallet`, hooks React Query (`useRollup`, `useAgents`, …, `useTx`).
- Sửa review Task 1: `LedgerApi.rollup` / `SalesSettingsApi.quoteTax` / `branchTaxOf` gửi `String(...)` cho mọi uint.
- `peerDependencies`: `react`, `@tanstack/react-query`, `@metanodejs/fiai-sdk`, `@metanodejs/system-core`.

## TDD — output lúc đỏ (trước khi có `src/metrics.ts`, `days.ts`, `roles.ts`, `use-rollup`)

```
 FAIL  test/days.test.ts — Cannot find module '../src/days'
 FAIL  test/metrics.test.ts — Cannot find module '../src/metrics'
 FAIL  test/roles.test.ts — Cannot find module '../src/roles'

 Test Files  3 failed | 8 passed (11)
      Tests  21 passed (21)
```

## Lệnh kiểm tra

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
```

```
 Test Files  12 passed (12)
      Tests  27 passed (27)
   Duration  898ms
```

## Lệch kế hoạch / ghi chú

- `useSalesSettings` mới đọc `branchTaxOf` theo danh sách `branchIds` (chưa gom `agentTaxOf` / payment methods — Task 8).
- `useAgents` tải `agentCount` rồi id giảm dần; profile lỗi được bỏ qua (agent chưa có hồ sơ).

## Câu hỏi mở

- App sẽ bọc `ContractsProvider` + `QueryClientProvider` ở Task 4/7; toast `useTx` do app truyền `onError` (chưa phụ thuộc `sonner` trong `chain`).