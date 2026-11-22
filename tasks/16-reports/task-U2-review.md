# Review Task U2 (+ sửa A–C của U1)

Người review: Claude Code · 2026-11-23 · Commits: `2b079c0`, `6695016`
Kết luận: **Đạt.** Làm tiếp U3.

Chạy lại trên container reviewer: `pnpm install --frozen-lockfile` (SDK npm, không còn đường dẫn local) → `pnpm -r build/lint/test` xanh (chain 48, ui 9, platform 20); `pnpm shots` 51 ảnh.

## Sửa A–C (`2b079c0`)
- A — test `list-agent-branches` xanh.
- B — `@metanodejs/fiai-sdk ^2.1.1`; `FIAI_SDK_PATH` chỉ đổi alias Vite, có README.
- C — `fetchAgentBranches`: thử `search` trước, dự phòng quét registry, cảnh báo/lỗi giải mã hiện trên tab. Đúng hướng.

## U2 (`6695016`)
- Đủ bộ component shadcn trong `packages/ui/src/components/ui/`, `components.json`.
- Token: `--primary` xanh, `--success/--warning/--danger`, `--chart-1/--chart-2` đúng mã màu kế hoạch cho cả sáng (`#2a78d6`/`#eb6834`) và tối (`#3987e5`/`#d95926`); phông Inter; `@source "./"` giữ nguyên.
- Ảnh chụp: nút chính đã đổi màu nhấn xanh, huy hiệu trạng thái có màu (Hoạt động xanh / Tạm dừng vàng / Đã xoá xám).

## Ghi chú cho U3–U5 (chưa phải lỗi của U2)
1. Trang vẫn dùng `<select>` thô ("Mọi trạng thái", "Mọi dịch vụ") → thay bằng `Select` ở U4/U5.
2. Header app `platform` vẫn hiện huy hiệu **"Chủ agent"** cho owner nền tảng → sửa nhãn ở U3.
3. Hai khối "Chế độ xem trước" + dòng ví chiếm ~150 px đầu trang → gộp vào `NavUser` ở U3.
4. Thông báo "Ví Owner chỉ quản trị hệ thống; tạo agent cần ví Admin…" đang đặt dưới nút, chữ nhỏ dài → đưa vào `Tooltip` của nút bị khoá.
5. File `components/ui/*` phải sửa tay import `@/` sau mỗi lần `shadcn add` (tsc không đổi alias khi build). Ghi bước này vào `frontend/README.md`, hoặc thêm `tsc-alias` vào script build của `ui` để khỏi sửa tay.
