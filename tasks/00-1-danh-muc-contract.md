# GĐ0.1 — Danh mục contract hệ cũ

Trạng thái: Chờ duyệt
Cỡ: M (GĐ0 của `meta-platform`, task con của `tasks/00-kiem-ke-he-cu.md`) · Loại: Tài liệu
Ngày tạo: 2026-11-18

## Kế hoạch (Claude Code)

- **Mục tiêu:** Điền `docs/legacy/00-danh-muc-contract.md`: trạng thái chính thức cho đủ 114 file `.sol`, proxy và factory cho contract đang deploy.
- **Phạm vi:** `docs/legacy/00-danh-muc-contract.md`.
- **Ngoài phạm vi:** mọi file khác; thiết kế hệ mới.

Luật chung (mọi task 00-x):
- Chỉ ghi file nêu trong mục Phạm vi. Không sửa `docs/legacy/generated/`, `docs/legacy/layout/` bằng tay (chạy lại `make legacy-inventory` nếu cần).
- Chỉ đọc meta-iqr/FE/qt-core/qt-widget. Không đọc/in `.env`, khoá, địa chỉ, RPC; không gọi chain.
- Mỗi khẳng định dẫn nguồn `file:dòng`. Chưa chắc → **[cần xác nhận]** + câu hỏi.
- Robot bỏ hẳn: không phân tích.
- Quy ước chi tiết: `docs/legacy/README.md`.

### Tiêu chí nghiệm thu

- [ ] Mục "Toàn bộ file" có đủ 114 file, trạng thái thuộc tập cho phép: `python3 scripts/legacy/check_docs.py catalog` in `ok`.
- [ ] 4 file gợi ý `chưa rõ` (`ICard.sol`, `IRestaurant.sol`, `BranchAuditTrail.sol`, `MTDToken.sol`) được kết luận, dẫn nguồn (tìm nơi deploy/kế thừa/import).
- [ ] `AgentManagement` (gợi ý `base`): xác nhận có deploy riêng không hay chỉ là base của `EnhancedAgentManagement`.
- [ ] Mục "Contract đang deploy" có đủ 31 contract của `generated/deployed.md` (± kết luận ở trên), mỗi dòng có kiểu proxy và factory/beacon tạo ra, dẫn nguồn (`scripts/create_system.js:dòng`, factory `file:dòng`).
- [ ] Bảng tóm tắt đếm theo trạng thái khớp mục "Toàn bộ file".

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

1. [ ] `make legacy-inventory` (dùng build có sẵn trong `cache/legacy-iqr/`, nếu chưa có thì script tự build ~2–3 phút). Đọc `generated/contracts.md`, `generated/deployed.md`.
2. [ ] Chép 114 dòng sang mục "Toàn bộ file", sửa trạng thái gợi ý thành chính thức (`base của contract đang deploy` → `base`), thêm cột Proxy/Factory/Ghi chú.
3. [ ] Kết luận 4 file `chưa rõ` và `AgentManagement`.
4. [ ] Với mỗi contract đang deploy: proxy UUPS hay Beacon, factory nào tạo (`IQRFactory`, `NetCafeV3Factory`, `LoyaltyFactory`, `BMFactory`, hay `create_system.js` trực tiếp), phạm vi instance (toàn hệ / mỗi agent / mỗi chi nhánh). Nguồn: `PROXY_PATTERN.md`, `NET_V3_DEPLOYMENT.md`, mã factory.
5. [ ] Điền bảng tóm tắt, chạy lệnh kiểm.

### Lệnh kiểm tra

```bash
cd repos/contract/meta-platform
make legacy-inventory
python3 scripts/legacy/check_docs.py catalog
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
