# GĐ0.5 — Ma trận quyền hệ cũ

Trạng thái: Chờ duyệt
Cỡ: M (GĐ0 của `meta-platform`, task con của `tasks/00-kiem-ke-he-cu.md`) · Loại: Tài liệu
Ngày tạo: 2026-11-18

## Kế hoạch (Claude Code)

- **Mục tiêu:** Điền `docs/legacy/30-quyen.md`: vai trò, module được uỷ quyền, ma trận vai trò × hàm ghi.
- **Phạm vi:** `docs/legacy/30-quyen.md`.
- **Ngoài phạm vi:** mọi file khác; thiết kế hệ mới.

Luật chung (mọi task 00-x):
- Chỉ ghi file nêu trong mục Phạm vi. Không sửa `docs/legacy/generated/`, `docs/legacy/layout/` bằng tay (chạy lại `make legacy-inventory` nếu cần).
- Chỉ đọc meta-iqr/FE/qt-core/qt-widget. Không đọc/in `.env`, khoá, địa chỉ, RPC; không gọi chain.
- Mỗi khẳng định dẫn nguồn `file:dòng`. Chưa chắc → **[cần xác nhận]** + câu hỏi.
- Robot bỏ hẳn: không phân tích.
- Quy ước chi tiết: `docs/legacy/README.md`.

### Tiêu chí nghiệm thu

- [ ] Mọi hàm ghi (không view/pure) của contract đang deploy (theo `generated/abi/<C>.md`, cột `ghi`) có một dòng trong ma trận. Kiểm: số dòng ma trận ≥ tổng số hàm `ghi` trong `generated/abi/*.md` của contract đang deploy (lệnh dưới).
- [ ] Mỗi dòng có modifier/kiểm tra `file:dòng`.
- [ ] Vai trò: system owner, super admin, agent admin, co-owner (có/không full access), branch manager, staff theo `STAFF_ROLE`, quyền `PERM_*`; mỗi vai trò ghi lưu ở biến nào.
- [ ] Module uỷ quyền: `isOrder`, `isNetSpendModule`, `authorizedModules` của vault, và các cờ tương tự khác tìm được.
- [ ] Cột ⚠️ đánh dấu hàm kiểm quyền theo chi nhánh nhưng tác động rộng hơn.

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

1. [ ] Liệt kê modifier và hàm kiểm quyền (`BranchAccessControlled`, `BranchAccessManager`, `onlyOwner`…).
2. [ ] Duyệt từng contract đang deploy, từng hàm ghi.
3. [ ] Đánh dấu ⚠️.

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
for f in docs/legacy/generated/abi/*.md; do grep -c '| ghi (' $f; done | paste -sd+ - | bc
grep -cE '^\| `?[A-Za-z]+\.[A-Za-z_]+' docs/legacy/30-quyen.md
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
