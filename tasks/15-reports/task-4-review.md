# Review Task 4 — App `platform` (khung, Tổng quan, danh sách agent)

Người review: Claude Code · 2026-11-22 · Commits: `20222a1`, `867643e`
Kết luận: **Cần sửa** (1 Nghiêm trọng, 4 Quan trọng). Sửa trong một commit `fix(platform): ...`, cập nhật `task-4.md`, đánh dấu `[x]` Task 4 trong kế hoạch.

## Kết quả chạy lại (container của reviewer)

- `chain` build/lint/test xanh (32), `ui` xanh (9), `platform` lint xanh.
- `platform` **build lỗi** và `test/validate-create-agent.test.ts` **lỗi**: cả hai cần `@metanodejs/fiai-sdk` ở đường dẫn local `/Users/.../CONG_TY/metanode-finsdk/...` (xem điểm 4). Trên máy người dùng có thể vẫn xanh.

## Làm tốt

- Bắt lỗi thiếu khoá deployments, hiện màn lỗi, không sập (đúng nhắc từ review Task 2).
- Gate Owner/Admin, "Hệ thống" chỉ owner, banner pause.
- Tổng quan: KPI có so với kỳ trước, biểu đồ chồng NET/IQR, xếp hạng agent gọi `rollup` cấp agent với đồng thời 8, đếm trạng thái agent và tổng chi nhánh.
- Form tạo agent kiểm byte UTF-8, `ServiceMask`, SĐT; có test.

## Nghiêm trọng

### 1. Script seed bác bỏ FullDB thật, dẫn tới deploy `MockFullDB` lên chain
`script/SeedMockAgents.s.sol` dừng nếu `HistoryIndex.fullDB().code.length == 0`. Nhưng FullDB là **precompile `0x…0107`: precompile không có bytecode**, nên điều kiện này **luôn đúng** trên chain thật. Script sẽ luôn báo "FullDB không có code" và hướng người dùng chạy `DeployMockFullDB` rồi `make deploy` lại với `FULLDB=<MockFullDB>`.

Hậu quả nếu làm theo trên chain 991:
- `MockFullDB` là contract test, **không kiểm quyền**: ai cũng gọi thẳng `setDataDocument`/`newDocument` để sửa hồ sơ, nhật ký, bút toán.
- Địa chỉ FullDB cố định từ `initialize` (không có `setFullDB`), nên muốn quay lại precompile phải deploy lại toàn bộ.
- `make deploy-mock-fulldb` mà script nhắc tới **không tồn tại** trong `Makefile`.

Ngoài ra kế hoạch T15 ghi rõ không sửa `script/`. Hai file này nằm ngoài phạm vi task.

Sửa:
- Bỏ điều kiện `code.length` trong `SeedMockAgents` (nếu cần kiểm thì thử gọi `HistoryIndex.dbName(0, "platform_agents")` hoặc một lệnh đọc nhẹ, không dựa vào bytecode).
- `DeployMockFullDB`: **xoá**, hoặc chặn chỉ chạy trên anvil (`require(block.chainid == 31337)`), ghi rõ không dùng trên chain thật.
- Nếu người dùng muốn giữ `SeedMockAgents`, thêm target `make seed-mock-agents` (chỉ người dùng chạy) và một dòng trong `docs/07-deploy-va-nang-cap.md`.
- Hỏi người dùng: chain 991 đã lỡ deploy với `MockFullDB` chưa? Nếu có, phải deploy lại bằng precompile trước khi dùng thật.

## Quan trọng

### 2. Thư mục build `dist/` bị commit
`frontend/apps/platform/dist/**` (JS/CSS đã build, hai phiên bản khác hash) nằm trong git. Xoá khỏi git và thêm `frontend/**/dist/` vào `.gitignore` (gói `chain`, `ui` đã có `.gitignore` riêng, app thì chưa).

### 3. Ô tìm trong bảng xếp hạng không có tác dụng
`useAgentRankings` lọc theo `rankSearch` **bên trong `queryFn`** nhưng `queryKey` không chứa `rankSearch`. React Query không chạy lại → gõ vào ô tìm không đổi kết quả. Ngoài ra lọc dùng `includes` thô, không dùng `matchAgent` (bỏ dấu, SĐT) đã có ở `chain`.

Sửa: `queryFn` chỉ trả danh sách đã sắp; lọc bằng `useMemo` bên ngoài với `matchAgent`. Test: dữ liệu giả 3 agent, tìm `"quan 1"` ra đúng agent tên `"Cyber Quận 1"`.

### 4. Gói SDK chỉ chạy trên một máy
`frontend/package.json` (`pnpm.overrides` → `link:../../CONG_TY/...`) và `apps/platform/vite.config.ts` (alias `../../../../CONG_TY/...`) trỏ vào thư mục trên máy người dùng. Máy khác, CI hay Cursor ở thư mục khác đều không build được. Test thuần (`validate-create-agent`) cũng hỏng vì import `utf8Length` từ gốc `@meta-platform/ui`, kéo theo `FinsdkProvider` → `@metanodejs/fiai-sdk`.

Sửa:
- `@metanodejs/fiai-sdk` **đã có trên npm (bản 2.1.1)**. Nếu đúng là SDK web-admin đang dùng thì cài từ npm, bỏ override/alias local. Nếu bắt buộc dùng bản local, đọc đường dẫn từ biến môi trường (`FIAI_SDK_PATH`), mặc định dùng bản npm.
- Chuyển `utf8Length`/`isReasonBytesValid` sang `@meta-platform/chain` (không phụ thuộc React/SDK), hoặc thêm export phụ `@meta-platform/ui/format`. Test thuần không được import thứ kéo theo SDK.

### 5. Commit thứ hai chưa báo cáo, lấn sang Task 5/6
`867643e` thêm `AgentManageDialog` (sửa hồ sơ, dừng/mở/xoá agent), `SystemPage` (pause/unpause), `ThemeToggle`, `WalletSwitcher`, `SidebarWallet`, đổi `AppShell` và cả `script/`, nhưng `task-4.md` không nhắc tới và kế hoạch chưa đánh `[x]`.

Sửa: thêm mục "Commit `867643e`" vào `task-4.md` liệt kê từng thay đổi và lý do. Phần thuộc Task 5/6 sẽ được review cùng Task 5/6 (ghi rõ trong báo cáo Task 5/6 rằng đã có từ `867643e`). Đánh `[x]` các bước Task 4.

## Nhỏ

6. Tổng quan: các ô "Tiền mặt thuần", "Giảm trừ", "Hoàn" không có so sánh kỳ trước trong khi ô khác có; nên đồng nhất (hoặc bỏ hết so sánh ở hàng hai).
7. `revenue(prevSum, service)` gọi lặp nhiều lần trong JSX; dùng `prevRev` đã tính.
8. Message commit `867643e` không theo kế hoạch (một task một commit, tên cố định). Từ Task 5 giữ đúng.

## Review lại sau sửa (commit `117a595`)

Kết luận: **Đạt**, kèm một việc nhỏ phải làm ở đầu Task 5.

Chạy lại trên container reviewer: `pnpm install --frozen-lockfile && pnpm -r build && pnpm -r lint && pnpm -r test` → **xanh cả ba gói** (chain 32, ui 9, platform 7); app `platform` build được nhờ SDK lấy từ npm.

- Điểm 1 — Đã sửa: bỏ kiểm bytecode FullDB; `DeployMockFullDB` chặn ngoài chain 31337.
- Điểm 2 — Đã sửa: `dist/` ra khỏi git, thêm vào `.gitignore`.
- Điểm 3 — Đã sửa: lọc xếp hạng bằng `useMemo` + `matchAgent`, có test.
- Điểm 4 — Đã sửa: `@metanodejs/fiai-sdk@^2.1.1` từ npm; `utf8Length` chuyển sang `chain`.
- Điểm 5–7 — Đã sửa.

Việc nhỏ (làm cùng commit đầu tiên của Task 5): `forge fmt --check` báo lệch ở `script/SeedMockAgents.s.sol` và `script/DeployMockFullDB.s.sol` → `make ci` (CI GitHub) đỏ. Chạy `forge fmt script/SeedMockAgents.s.sol script/DeployMockFullDB.s.sol`.
