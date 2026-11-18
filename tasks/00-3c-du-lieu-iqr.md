# GĐ0.3c — Từ điển dữ liệu IQR

Trạng thái: Chờ duyệt
Cỡ: M (GĐ0 của `meta-platform`, task con của `tasks/00-kiem-ke-he-cu.md`) · Loại: Tài liệu
Ngày tạo: 2026-11-18

## Kế hoạch (Claude Code)

- **Mục tiêu:** Từ điển dữ liệu IQR (Management 83, RestaurantOrder 89, RestaurantReporting 71, AgentIQR 20, IQRFactory 25): mỗi biến storage một dòng với cách đọc, lớp chuyển dữ liệu, vòng lặp.
- **Phạm vi:** `docs/legacy/13-du-lieu-iqr.md`.
- **Ngoài phạm vi:** mọi file khác; thiết kế hệ mới.

Luật chung (mọi task 00-x):
- Chỉ ghi file nêu trong mục Phạm vi. Không sửa `docs/legacy/generated/`, `docs/legacy/layout/` bằng tay (chạy lại `make legacy-inventory` nếu cần).
- Chỉ đọc meta-iqr/FE/qt-core/qt-widget. Không đọc/in `.env`, khoá, địa chỉ, RPC; không gọi chain.
- Mỗi khẳng định dẫn nguồn `file:dòng`. Chưa chắc → **[cần xác nhận]** + câu hỏi.
- Robot bỏ hẳn: không phân tích.
- Quy ước chi tiết: `docs/legacy/README.md`.

### Tiêu chí nghiệm thu

- [ ] `python3 scripts/legacy/check_docs.py dict <file>` in `ok` cho `13-du-lieu-iqr.md` (đủ mọi biến của `generated/state/<C>.md` trừ `__gap`, lớp ∈ A/B/C/D, có cột Cách đọc và Vòng lặp).
- [ ] Biến hạ tầng kế thừa (OZ `_initialized`, `_owner`, …) vẫn có dòng, Thực thể ghi `hạ tầng`.
- [ ] Mỗi struct dùng trong storage có mục "Struct" liệt kê trường, đánh dấu trường PII (phone, email, CCCD, tên…).
- [ ] Cột Cách đọc ghi tên getter thật (đối chiếu `generated/abi/<C>.md`); biến không có getter ghi `chỉ storage` (extractor đọc qua `layout/<C>.json`) hoặc `chỉ event <Tên>`.
- [ ] Cột Vòng lặp dẫn `file:dòng` hàm ghi lặp qua biến (đối chiếu `GLOBAL_STORAGE_ARRAY_LOOP_AUDIT.md`, kiểm lại với mã hiện tại).
- [ ] Mỗi contract ghi phạm vi một instance (toàn hệ / mỗi agent / mỗi chi nhánh).

### Checkout

| Repo | Checkout | Nhánh | HEAD lúc bắt đầu | Thay đổi có sẵn |
|---|---|---|---|---|
| contract/meta-platform (ghi) | `repos/contract/meta-platform` | `main` (chưa có commit) | — | khung GĐ0 + khung Foundry (chưa commit) |
| contract/meta-iqr (chỉ đọc) | `repos/contract/meta-iqr` | `feat/lock-member-voucher-restore` | `68d1d3c` | không |
| fe/metanode-cyber-game (chỉ đọc) | `repos/fe/metanode-cyber-game` | `meos/version-4.0.3` | `59eabf9` | ` M pnpm-lock.yaml` (của người dùng) |
| cpp-qt/qt-core (chỉ đọc) | `repos/cpp-qt/qt-core` | `develop` | `b1802f32` | 3 `.dll` sửa, `meos.log` (của người dùng) |
| cpp-qt/qt-widget (chỉ đọc) | `repos/cpp-qt/qt-widget` | `feat/update-qt` | `4f22433` | không |

Lệch HEAD meta-iqr → dừng, ghi vào "Còn vướng". Không đọc `worktrees/meta-iqr-loyalty-v2`.

### Các bước

1. [ ] `make legacy-inventory`; mở `generated/state/<C>.md` và `generated/abi/<C>.md` của từng contract.
2. [ ] Mỗi contract một mục `## <TênContract>` (đúng tên, để script kiểm khớp), chép đủ biến theo thứ tự slot.
3. [ ] Điền cột theo `docs/legacy/README.md` và hướng dẫn đầu file từ điển.
4. [ ] Mục Struct.
5. [ ] Chạy lệnh kiểm.

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
make legacy-inventory
python3 scripts/legacy/check_docs.py dict 13-du-lieu-iqr.md
```

## Triển khai (Cursor)

- **Checkout/nhánh/HEAD đã kiểm:**
- **File đã sửa:**
- **Khác kế hoạch (và lý do):**
- **Lệnh đã chạy và kết quả:**
- **Nợ kỹ thuật phát hiện** (đã ghi vào `documents/tech-debt.md`):
- **Còn vướng / [cần xác nhận]:**

## Review (Claude Code)

### Vòng 1

- **Phát hiện:**
- **Kết quả kiểm chạy lại:**
- **Kết luận:**
