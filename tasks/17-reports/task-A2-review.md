# Review Task A2 (+ sửa A0/A1) — vai trò theo `?domain`

Người review: Claude Code · 2026-11-23 · Commits: `8997d18`, `1c3a710`
Kết luận: **Đạt**, kèm 1 điểm Quan trọng nhỏ phải sửa đầu A3.

Chạy lại: `pnpm lint` (có `check-deps: OK`), build 4 gói xanh, test xanh (chain 59, ui 16, agent 2, platform 13); `pnpm --filter agent shots` 48 ảnh.

## Làm tốt
- Cả 4 `package.json` về `@metanodejs/fiai-sdk ^2.1.1`; `check-deps.mjs` chạy đầu `pnpm lint`.
- `resolveAgentAccess` thuần, đúng bảng "Quy tắc vai trò" (đủ 9 test). Chủ agent mở domain của chính mình → giao diện chủ, chọn sẵn chi nhánh; Staff/None → "không phải quản lý của <domain>"; domain không có / đã xoá → `domain-not-found`.
- Xem trước bỏ bảng cứng; ảnh chụp xác nhận màn "Chọn chi nhánh" (ví 3001: 2 chi nhánh, có icon, tên agent, domain, là liên kết thật) và "Không có quyền" (ví Staff 3004 với `agent1-cn1.mock.local`) đều ra từ logic thật trên dữ liệu giả.

## Quan trọng

### 1. `pnpm-lock.yaml` còn đường dẫn local → `pnpm install --frozen-lockfile` (mặc định ở CI) lỗi
```
ERR_PNPM_OUTDATED_LOCKFILE ... packages/ui/package.json
  @metanodejs/fiai-sdk (lockfile: /Users/lekhaihoan/Documents/CONG_TY/metanode-finsdk/packages/fiai-sdk, manifest: ^2.1.1)
```
Sửa: `pnpm install` (không frozen) rồi commit `pnpm-lock.yaml`; kiểm lại bằng `pnpm install --frozen-lockfile`. Mở rộng `check-deps.mjs`: (a) quét `pnpm-lock.yaml`, báo lỗi nếu có `specifier:` bắt đầu bằng `/`, `~/`, `file:`, `link:` trỏ ra ngoài `frontend/`; (b) quét `pnpm.overrides` trong `frontend/package.json` và `pnpm-workspace.yaml`.

## Nhỏ
2. Màn "Không có quyền" khi có `domain`: thêm nút "Đổi ví" và liên kết "Mở không kèm domain" (về `/agent/`), để người dùng tự gỡ.
3. Khối "Chế độ xem trước" vẫn chiếm ~140 px đầu trang (ghi từ review U2) — chuyển vào `NavUser` khi làm A3.
