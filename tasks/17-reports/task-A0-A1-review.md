# Review Task A0 + A1 (T17)

Người review: Claude Code · 2026-11-23 · Commits: `a7a86bc` (A0), `74d5ed8` (A1)
Kết luận: **A0 đạt. A1 đạt phần khung**, nhưng có 1 điểm Nghiêm trọng lặp lại phải chặn hẳn, 1 điểm Quan trọng phải làm ở A2.

Chạy lại trên container reviewer (sau khi tạm đổi SDK về npm, xem điểm 1): build xanh cả 4 gói; test xanh (chain 48, ui 16, platform 13, agent 2); `pnpm --filter agent shots` ra 48 ảnh.

## A0 — Đạt
- Khối dùng chung đã ở `packages/ui/src/domain/`; `platform` import lại từ `@meta-platform/ui`, test chuyển theo (ui 9 → 16, platform 20 → 13 — không mất test).

## A1 — ảnh chụp
- Manager `?domain=agent1-cn1.mock.local`: menu đúng phạm vi (không có "Chi nhánh"), header "Cyber Quận 1 · 1 · agent1-cn1…", KPI + biểu đồ chồng NET/IQR theo ngày.
- Màn "Chọn chi nhánh" cho ví manager không có domain: đúng thiết kế.
- Chủ agent: trang tổng quan còn là khung chờ A3 (đúng phạm vi A1).

## Nghiêm trọng

### 1. SDK lại trỏ đường dẫn trên máy — lần thứ 4
`apps/agent/package.json` **và** `apps/platform/package.json` (bị đổi lại trong `74d5ed8`): `"@metanodejs/fiai-sdk": "/Users/yuu/Downloads/metanode-finsdk/packages/fiai-sdk"`. Máy khác/CI/reviewer không build được app nào. Điểm này đã sửa 3 lần rồi bị đổi lại.

Sửa dứt điểm:
- Đưa cả hai về `^2.1.1`. Bản local **chỉ** qua `FIAI_SDK_PATH` (alias Vite) như README.
- Thêm kiểm tự động để không lặp lại: `frontend/scripts/check-deps.mjs` đọc mọi `package.json` trong workspace, **báo lỗi** nếu giá trị phụ thuộc bắt đầu bằng `/`, `~`, `file:` hoặc `link:`; gọi trong script `lint` ở `frontend/package.json` (chạy trước `pnpm -r lint`).
- Nếu bản npm `2.1.1` thiếu tính năng mà máy dev cần, ghi rõ tính năng nào vào báo cáo để phát hành bản npm mới — không sửa `package.json`.

## Quan trọng

### 2. Xem trước dùng bảng vai trò viết tay, không chạy logic thật
`apps/agent/src/preview/preview-access.ts` trả kết quả cứng theo từng ví/domain. Như vậy ảnh chụp **không kiểm** logic vai trò thật. Ở A2: xoá bảng này; chế độ xem trước chỉ đổi **ví giả**, còn vai trò tính bằng chính `useAgentAccess()` → `resolveAgentAccess()` chạy trên `createMockContracts` (mock đã có `agentIdOf`, `branchByDomain`, `effectiveRoleOf`, `branchesOfAccount`). Ảnh chụp các màn cổng (chọn chi nhánh, không quyền, domain không tồn tại) phải ra từ logic thật.

## Nhỏ (làm cùng U4 của T16 hoặc A3)
3. Biểu đồ trong `BranchOverviewPanel` chưa theo quy định biểu đồ T16: chưa nằm trong `Card` có tiêu đề, **chưa có chú giải** NET/IQR, chưa có khe 2 px giữa hai đoạn chồng, chưa có nút "Xem bảng". Hai chuỗi màu xanh/cam đã đúng.
4. Khối "Chế độ xem trước" vẫn chiếm ~170 px đầu trang (như `platform`): chuyển vào menu `NavUser` (đã ghi ở review U2).
5. Màn "Chọn chi nhánh": mỗi dòng nên là liên kết thật (`<a href="?domain=...">`), có icon mũi tên và tên agent, để mở tab mới được.
