# GĐ0.6 — Bất biến, lỗi đã biết, đối chiếu nghiệp vụ

Trạng thái: Chờ duyệt
Cỡ: M (GĐ0 của `meta-platform`, task con của `tasks/00-kiem-ke-he-cu.md`) · Loại: Tài liệu
Ngày tạo: 2026-11-18

## Kế hoạch (Claude Code)

- **Mục tiêu:** Điền `docs/legacy/40-bat-bien-va-loi.md`; đối chiếu `docs/01-nghiep-vu.md` với mã; gom câu hỏi mở vào `docs/04-lo-trinh.md`.
- **Phạm vi:** `docs/legacy/40-bat-bien-va-loi.md`, `docs/01-nghiep-vu.md`, mục "Câu hỏi mở" của `docs/04-lo-trinh.md`. Làm sau cùng (cần 00-1…00-5).
- **Ngoài phạm vi:** mọi file khác; thiết kế hệ mới.

Luật chung (mọi task 00-x):
- Chỉ ghi file nêu trong mục Phạm vi. Không sửa `docs/legacy/generated/`, `docs/legacy/layout/` bằng tay (chạy lại `make legacy-inventory` nếu cần).
- Chỉ đọc meta-iqr/FE/qt-core/qt-widget. Không đọc/in `.env`, khoá, địa chỉ, RPC; không gọi chain.
- Mỗi khẳng định dẫn nguồn `file:dòng`. Chưa chắc → **[cần xác nhận]** + câu hỏi.
- Robot bỏ hẳn: không phân tích.
- Quy ước chi tiết: `docs/legacy/README.md`.

### Tiêu chí nghiệm thu

- [ ] Mỗi bất biến ở `docs/01-nghiep-vu.md` mục 6 có dòng trong bảng bất biến: nơi hệ cũ đảm bảo (hoặc "không đảm bảo"), có test không.
- [ ] Bảng lỗi có mọi mục từ `documents/tasks/2026-11-18-review-loyalty-contract.md` và các mục của meta-iqr trong `documents/tech-debt.md`, mỗi dòng dẫn nguồn.
- [ ] `grep -c 'cần xác nhận' docs/01-nghiep-vu.md` = 0: mỗi chỗ được trả lời bằng `file:dòng`, hoặc chuyển thành câu hỏi đánh số trong `docs/04-lo-trinh.md`.
- [ ] Chỗ `docs/01-nghiep-vu.md` sai so với mã được sửa, ghi "(sửa theo GĐ0: file:dòng)".
- [ ] Mọi `[cần xác nhận]` còn lại trong `docs/legacy/*.md` được gom thành câu hỏi trong `docs/04-lo-trinh.md`.

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

1. [ ] Bảng bất biến.
2. [ ] Bảng lỗi.
3. [ ] Đối chiếu `docs/01-nghiep-vu.md`.
4. [ ] Gom câu hỏi.

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
grep -c 'cần xác nhận' docs/01-nghiep-vu.md
grep -l 'cần xác nhận' docs/legacy/*.md
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
