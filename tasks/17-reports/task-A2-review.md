# Review Task A2 (+ sửa A0/A1) — vai trò theo `?domain`

Người review: Claude Code · 2026-11-23 · Commits: `8997d18`, `1c3a710`
Kết luận: **Đạt**, kèm 1 điểm Quan trọng nhỏ phải sửa đầu A3.

Chạy lại: `pnpm lint` (có `check-deps: OK`), build 4 gói xanh, test xanh (chain 59, ui 16, agent 2, platform 13); `pnpm --filter agent shots` 48 ảnh.

## Làm tốt
- Cả 4 `package.json` về `@metanodejs/fiai-sdk ^2.1.1`; `check-deps.mjs` chạy đầu `pnpm lint`.
- `resolveAgentAccess` thuần, đúng bảng "Quy tắc vai trò" (đủ 9 test). Chủ agent mở domain của chính mình → giao diện chủ, chọn sẵn chi nhánh; Staff/None → "không phải quản lý của <domain>"; domain không có / đã xoá → `domain-not-found`.
- Xem trước bỏ bảng cứng; ảnh chụp xác nhận màn "Chọn chi nhánh" (ví 3001: 2 chi nhánh, có icon, tên agent, domain, là liên kết thật) và "Không có quyền" (ví Staff 3004 với `agent1-cn1.mock.local`) đều ra từ logic thật trên dữ liệu giả.

## Quyết định của người dùng về SDK (2026-11-23) — thay điểm "Quan trọng" cũ

Người dùng **giữ** `"@metanodejs/fiai-sdk": "/Users/lekhaihoan/Documents/CONG_TY/metanode-finsdk/packages/fiai-sdk"` trong mọi `package.json` của `frontend/`. Reviewer không nêu lại điểm này.

Việc cần làm cho khớp:
- Đưa cả 4 `package.json` về đường dẫn trên, chạy `pnpm install` để `pnpm-lock.yaml` khớp (kiểm `pnpm install --frozen-lockfile` chạy được **trên máy người dùng**).
- `check-deps.mjs`: cho phép riêng `@metanodejs/fiai-sdk` (danh sách cho phép), vẫn chặn đường dẫn local với mọi gói khác.
- Giữ `FIAI_SDK_PATH` trong `vite.config.ts` (không hại) hoặc bỏ — tuỳ người làm; cập nhật `frontend/README.md` cho đúng cách đang dùng.
- Reviewer khi chạy trên container sẽ tạm đổi sang bản npm `^2.1.1` (không commit).

## Nhỏ
2. Màn "Không có quyền" khi có `domain`: thêm nút "Đổi ví" và liên kết "Mở không kèm domain" (về `/agent/`), để người dùng tự gỡ.
3. Khối "Chế độ xem trước" vẫn chiếm ~140 px đầu trang (ghi từ review U2) — chuyển vào `NavUser` khi làm A3.
