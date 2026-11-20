# Báo cáo Task 1 — Workspace + `packages/chain`

## Đã làm

- Khởi tạo pnpm workspace `frontend/` (`package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`).
- Package `@meta-platform/chain`: normalize, address, keccak256, `parsePlatformDeployments` / `loadAddresses`, decode FullDB (Ledger/Branch/Agent/Audit), `searchFullDB` + term helpers, `decodeContractError` (lỗi access/registry + SalesSettings + Ledger).
- Wrapper `MtnContract` cho 7 contract (sinh từ ABI bằng `scripts/gen-contracts.mjs`, gọi `sendTransaction` với `feeType: 'read' | 'sc'`).
- Vitest theo giá trị kế hoạch (normalize, thiếu `ledgerProxy`, decode round-trip, termAddress, lỗi).

## File thay đổi / mới

- `frontend/**` (workspace + `packages/chain/**` gồm contract generated).
- `tasks/15-web-dashboards.md` (đánh dấu Task 1).
- `tasks/15-reports/task-1.md` (báo cáo này).

## Lệnh kiểm tra

```bash
cd frontend && pnpm install && pnpm -r build && pnpm -r lint && pnpm -r test
```

### Kết quả (đuôi output)

```
 Test Files  5 passed (5)
      Tests  10 passed (10)
   Duration  358ms (transform 124ms, setup 0ms, collect 351ms, tests 9ms, environment 0ms, prepare 337ms)
```

(`pnpm -r build` và `pnpm -r lint` exit 0 trước đó.)

## Lệch kế hoạch và lý do

1. **`loadAddresses` trên browser:** Mặc định đọc file bằng `fs` (Node/vitest). App Vite sau này nên `import` JSON deployments và gọi `loadAddresses(chainId, data)` hoặc `parsePlatformDeployments` — không sửa `deployments/`.
2. **Wrapper contract:** Sinh script thay vì chép từng hàm tay; hành vi giống web-admin (`feeType`, `unwrapValue`). Chạy lại script khi ABI đổi.
3. **`web/` trong repo:** Thư mục không tồn tại trên disk lúc triển khai; chép pattern từ web-admin mẫu + mô tả kế hoạch.
4. **`loadAddresses(991)` thực tế:** `deployments/platform-991.json` thiếu `salesSettingsProxy` / `ledgerProxy` — gọi sẽ throw đúng kế hoạch; test dùng object giả.

## Câu hỏi mở

- Task 2: có tách `use-active-wallet` / `FinsdkProvider` vào `packages/chain` hay `packages/ui`? Kế hoạch Task 2 gom hook dữ liệu vào chain.
- App platform/agent: `@metanodejs/fiai-sdk` trỏ local path như `web/` README (khi có) — cần xác nhận đường dẫn trên máy dev.