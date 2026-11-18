# GĐ0.4 — Luồng nghiệp vụ hệ cũ

Trạng thái: Chờ duyệt
Cỡ: M (GĐ0 của `meta-platform`, task con của `tasks/00-kiem-ke-he-cu.md`) · Loại: Tài liệu
Ngày tạo: 2026-11-18

## Kế hoạch (Claude Code)

- **Mục tiêu:** Điền `docs/legacy/20-luong-nghiep-vu.md`: mỗi luồng là chuỗi hàm thật, state đổi, event, cảnh báo vòng lặp/độ sâu.
- **Phạm vi:** `docs/legacy/20-luong-nghiep-vu.md`.
- **Ngoài phạm vi:** mọi file khác; thiết kế hệ mới.

Luật chung (mọi task 00-x):
- Chỉ ghi file nêu trong mục Phạm vi. Không sửa `docs/legacy/generated/`, `docs/legacy/layout/` bằng tay (chạy lại `make legacy-inventory` nếu cần).
- Chỉ đọc meta-iqr/FE/qt-core/qt-widget. Không đọc/in `.env`, khoá, địa chỉ, RPC; không gọi chain.
- Mỗi khẳng định dẫn nguồn `file:dòng`. Chưa chắc → **[cần xác nhận]** + câu hỏi.
- Robot bỏ hẳn: không phân tích.
- Quy ước chi tiết: `docs/legacy/README.md`.

### Tiêu chí nghiệm thu

- [ ] Mọi mục `###` trong khung có nội dung đủ 5 dòng (Bên gọi, Chuỗi gọi, State đổi, Event, Cảnh báo); không còn mục trống.
- [ ] Mỗi bước trong Chuỗi gọi có `file:dòng`.
- [ ] Bước có vòng lặp không trần đánh ⚠️L, gọi sâu > 3 tầng đánh ⚠️D, đối chiếu và kiểm lại `CROSS_CONTRACT_CALL_DEPTH_AUDIT.md`, `GLOBAL_STORAGE_ARRAY_LOOP_AUDIT.md` với mã `68d1d3c` (ghi chỗ audit đã lỗi thời).
- [ ] Bên gọi khớp nơi client gọi trong `01-abi-client.md` (nếu task 00-2 đã xong; chưa thì ghi [cần xác nhận]).

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

1. [ ] Đọc `CURRENT_FULL_FLOW.md`, `PROJECT_ARCHITECTURE_README.md`, `SCRIPT_CALLERS_AND_PERMISSIONS.md` làm bản đồ, nhưng mọi bước phải kiểm với mã.
2. [ ] Hệ thống/agent/chi nhánh → NET → IQR → Loyalty, đúng thứ tự khung.
3. [ ] Đánh dấu ⚠️L/⚠️D.

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
grep -c '^### ' docs/legacy/20-luong-nghiep-vu.md
grep -c 'Chuỗi gọi' docs/legacy/20-luong-nghiep-vu.md
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
