# Báo cáo Task 4 — `apps/platform`

## Đã làm

- App Vite `platform` (`base: /platform/`, `FinsdkProvider` + `QueryClientProvider`, `HashRouter`).
- Bắt `deploymentsError` → `ErrorState` (chain 991 hiện thiếu `salesSettingsProxy`, `ledgerProxy` — không sập app).
- Gate Owner/Admin; menu Tổng quan / Agent / Nhật ký; **Hệ thống** chỉ Owner.
- `/` Tổng quan: `RangePicker` (kể cả Tuỳ chọn), `ServiceFilter`, KPI + kỳ trước, biểu đồ ngày, xếp hạng agent (`rollup` scope agent, concurrency 8), đếm agent/chi nhánh.
- `/agents`: tìm/lọc/phân trang 20, dialog **Tạo agent** (validate byte UTF-8, `ServiceMask`, `TextRules.isPhone`), `createAgent` qua `useTx`.
- Chain bổ sung: `deploymentsError`, `AgentRegistryApi.createAgent`, `PlatformAccessApi.resolvePlatformRole` / `paused`, `usePlatformContracts` không ném khi thiếu khóa.

## Commit `867643e` (đã push trước review)

Message không theo kế hoạch một-task-một-commit; nội dung gộp thêm UI/Task 5–6. Liệt kê để Task 5/6 review lại:

| Thay đổi | Lý do / ghi chú |
|---|---|
| `AgentManageDialog`, mở rộng `AgentsPage` | Sửa hồ sơ, dừng/mở/xoá agent — phạm vi Task 5, review sau ở Task 5 |
| `SystemPage` (pause/unpause) | Task 6 — review sau |
| `ThemeToggle`, `WalletSwitcher`, `SidebarWallet`, `AppShell`, `PlatformChrome` | Khung ví/theme dùng chung — hỗ trợ Task 4 layout |
| `.env.example`, `deployments/platform-991*.json`, `vite` + `fiai-sdk` local | Cấu hình máy dev — review sửa SDK npm ở commit fix |
| `script/SeedMockAgents`, `DeployMockFullDB`, `Makefile` | Seed mock — review sửa an toàn FullDB ở commit fix |
| Commit `dist/` app platform | Review sửa: bỏ khỏi git |

## Sửa sau review (`task-4-review.md` điểm 1–7)

1. **Seed / MockFullDB:** bỏ kiểm `fullDB.code.length` trong `SeedMockAgents`; `DeployMockFullDB` chỉ chain `31337`; alias `make seed-mock-agents`; ghi `docs/07-deploy-va-nang-cap.md`.
2. **dist:** xoá `frontend/apps/platform/dist` khỏi git, `frontend/**/dist/` trong `.gitignore`.
3. **Xếp hạng:** lọc ô tìm bằng `useMemo` + `matchAgent`/`filterAgentRankings`; test `quan 1` → Cyber Quận 1.
4. **SDK:** `@metanodejs/fiai-sdk@^2.1.1` từ npm; bỏ override/alias local; `utf8Length`/`isReasonBytesValid` → `@meta-platform/chain`.
5. Báo cáo này + đánh `[x]` Task 4 trong kế hoạch.
6. KPI Tổng quan: thêm so sánh kỳ trước cho Tiền mặt thuần, Giảm trừ, Hoàn.
7. Dùng `prevRev` thay vì gọi lặp `revenue(prevSum, service)` trong JSX.

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
Scope: 3 of 4 workspace projects
packages/chain build$ tsc -p tsconfig.build.json
packages/chain build: Done
packages/ui build$ tsc -p tsconfig.build.json
packages/ui build: Done
apps/platform build$ tsc -p tsconfig.app.json && vite build
apps/platform build: ✓ built in 2.89s
apps/platform build: Done

packages/chain lint: Done
packages/ui lint: Done
apps/platform lint: Done

packages/chain test: Test Files  13 passed (13)
packages/chain test:       Tests  32 passed (32)

packages/ui test: Test Files  4 passed (4)
packages/ui test:       Tests  9 passed (9)

apps/platform test: Test Files  3 passed (3)
apps/platform test:       Tests  7 passed (7)
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
- Phần `AgentManageDialog` / `SystemPage` từ `867643e` sẽ được review đầy đủ ở Task 5/6.