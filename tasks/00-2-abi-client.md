# GĐ0.2 — ABI client đang dùng

Trạng thái: Chờ duyệt
Cỡ: M (GĐ0 của `meta-platform`, task con của `tasks/00-kiem-ke-he-cu.md`) · Loại: Tài liệu
Ngày tạo: 2026-11-18

## Kế hoạch (Claude Code)

- **Mục tiêu:** Điền `docs/legacy/01-abi-client.md`: mọi hàm/event FE, qt-core, qt-widget gọi vào hệ cũ, kèm nơi gọi.
- **Phạm vi:** `docs/legacy/01-abi-client.md`.
- **Ngoài phạm vi:** mọi file khác; thiết kế hệ mới.

Luật chung (mọi task 00-x):
- Chỉ ghi file nêu trong mục Phạm vi. Không sửa `docs/legacy/generated/`, `docs/legacy/layout/` bằng tay (chạy lại `make legacy-inventory` nếu cần).
- Chỉ đọc meta-iqr/FE/qt-core/qt-widget. Không đọc/in `.env`, khoá, địa chỉ, RPC; không gọi chain.
- Mỗi khẳng định dẫn nguồn `file:dòng`. Chưa chắc → **[cần xác nhận]** + câu hỏi.
- Robot bỏ hẳn: không phân tích.
- Quy ước chi tiết: `docs/legacy/README.md`.

### Tiêu chí nghiệm thu

- [ ] Mỗi dòng trong `generated/client-hits.md` có ít nhất một hit đã được xác minh: hoặc có dòng trong bảng "Hàm/event client gọi" (contract đúng, nơi gọi `file:dòng` thật), hoặc ghi là khớp nhầm ở cuối file (mục "Khớp nhầm đã loại", một dòng mỗi tên).
- [ ] FE: mọi class trong `packages/cyber-contracts/src/*/` và `packages/iqr-contracts/src/*/` được đối chiếu với ABI contract (`generated/abi/<C>.md`); hàm lệch ghi ở mục cuối.
- [ ] qt-core: mọi hàm trong `src/sidebar-cyber/CyberSidebarAbis.hpp` có dòng.
- [ ] qt-widget: đã tìm lời gọi chain (ghi rõ nếu không có).
- [ ] Mục "View trả mảng lớn không phân trang" liệt kê các view client gọi mà trả `[]` tăng theo dữ liệu (member, đơn, ngày…).
- [ ] Mục "Client dùng đường khác" ghi các chỗ đọc FullDB/PublicfullDB, event log, `getStorageAt`.

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

1. [ ] Đọc `generated/client-hits.md` (khớp chuỗi thô, có nhiễu: tên chung như `owner`, `initialize`).
2. [ ] FE: đi theo `packages/*-contracts/src/<contract>/*.contract.ts` → các hàm wrapper → nơi `apps/**` gọi wrapper. Ghi nơi gọi trong app (không chỉ wrapper).
3. [ ] qt-core: `src/sidebar-cyber/**` (`CyberSidebarAbis.hpp`, watcher, service).
4. [ ] qt-widget: tìm `eth_call`, `callContract`, selector, tên hàm.
5. [ ] Điền 4 mục; lập mục "Khớp nhầm đã loại".

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
make legacy-inventory
grep -c '^| ' docs/legacy/01-abi-client.md
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
