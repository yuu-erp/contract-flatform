# Báo cáo Task 4 — `apps/platform`

## Đã làm

- App Vite `platform` (`base: /platform/`, `FinsdkProvider` + `QueryClientProvider`, `HashRouter`).
- Bắt `deploymentsError` → `ErrorState` (chain 991 hiện thiếu `salesSettingsProxy`, `ledgerProxy` — không sập app).
- Gate Owner/Admin; menu Tổng quan / Agent / Nhật ký; **Hệ thống** chỉ Owner.
- `/` Tổng quan: `RangePicker` (kể cả Tuỳ chọn), `ServiceFilter`, KPI + kỳ trước, biểu đồ ngày, xếp hạng agent (`rollup` scope agent, concurrency 8), đếm agent/chi nhánh.
- `/agents`: tìm/lọc/phân trang 20, dialog **Tạo agent** (validate byte UTF-8, `ServiceMask`, `TextRules.isPhone`), `createAgent` qua `useTx`.
- Chain bổ sung: `deploymentsError`, `AgentRegistryApi.createAgent`, `PlatformAccessApi.resolvePlatformRole` / `paused`, `usePlatformContracts` không ném khi thiếu khóa.

## TDD — output lúc đỏ

```
Error: Cannot find module '../src/lib/agent-list'
 FAIL  test/agent-list.test.ts
 FAIL  test/agent-ranking.test.ts
 FAIL  test/validate-create-agent.test.ts
```

## Lệnh kiểm tra

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
```

```
packages/chain: 32 passed
packages/ui: 9 passed
platform: 6 passed (agent-list 3, agent-ranking 1, validate-create-agent 2)
```

## Màn hình (`pnpm --filter platform dev` → http://localhost:5173/platform/)

| Màn | Mô tả |
|---|---|
| Thiếu deployments | Thông báo **「Thiếu khóa địa chỉ: salesSettingsProxy」** (hoặc `ledgerProxy`), nút Thử lại. |
| Chưa ví | `LoginScreen` «Kết nối ví». |
| Không quyền | `NoAccessScreen` nếu ví không Owner/Admin. |
| Tổng quan | Sidebar, banner pause nếu có, bộ chọn khoảng/dịch vụ, lưới KPI, biểu đồ, bảng xếp hạng + ô tìm. |
| Agent | Bảng + lọc + «Tạo agent»; link `/agents/:id` chưa có trang chi tiết (Task 5). |
| Nhật ký / Hệ thống | Placeholder «task tiếp theo». |

## Ghi chú

- Rollup/dashboard cần `ledgerProxy` trong `deployments/platform-991.json` sau khi deploy lại.
- Form tạo agent dùng `utf8Length` cho trần byte giống review Task 3.