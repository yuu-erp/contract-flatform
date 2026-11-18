# 02. Kiến trúc

Trạng thái: **sơ bộ**. Hướng tổng thể theo ADR 0005; các quyết định con chốt ở GĐ1 bằng ADR `0020`–`0049`.

## 1. Vì sao không giữ kiến trúc cũ

Dẫn chứng chi tiết: `projects/meta-platform-v2/README.md` mục 1, `documents/tasks/2026-11-18-review-loyalty-contract.md`, các file audit `GLOBAL_STORAGE_ARRAY_LOOP_AUDIT.md` và `CROSS_CONTRACT_CALL_DEPTH_AUDIT.md` trong meta-iqr. Tóm tắt:
- contract 100–160 KB;
- vòng lặp không trần;
- chuỗi gọi sâu 10 tầng;
- thống kê và lịch sử ghi on-chain trong luồng nóng;
- quyền lỏng giữa chi nhánh;
- dữ liệu cá nhân on-chain;
- xu chính nằm trong Loyalty;
- test không chạy.

## 2. Sơ đồ đích

```text
src/core (dùng chung, UUPS + ERC-7201)
  operator/    tầng vận hành: owner + admin nền tảng; tạo agent, tạo chi nhánh, licence, bật dịch vụ
  registry/    address book theo agent và version
  access/      AccessManager: vai trò theo (agentId, branchId), quyền chi tiết
  tenant/      TenantRegistry: agent, branch, dịch vụ bật theo branch (kiểm tổ hợp hợp lệ)
  delegate/    DelegateRegistry: session wallet / ví máy trạm → member, có hạn
  ledger/      Ledger: xu chính + điểm, bút toán kép, refId chống trùng, chi nhánh gốc của tiền nạp
  history/     HistoryIndex: cổng duy nhất vào FullDB (lịch sử, báo cáo, tìm kiếm) — docs/05
  migration/   nhập dữ liệu từ meta-iqr, idempotent, khoá vĩnh viễn sau finalize
  staff/       nhân viên, vai trò, ca làm, chấm công (chi nhánh nào cũng có)
  resource/    khu vực, bàn, máy trạm
  payment/     tài khoản thanh toán của chi nhánh

src/modules   (chỉ dịch vụ bật/tắt được theo chi nhánh)
  net/         Account · Station/Pricing · Session · TopUp
  iqr/         Catalog · Promotion · Order (máy trạng thái) · Reservation
  loyalty/     bổ trợ: Membership · RewardLedger (batch có hạn, heap) · Tier · Campaign · RewardVoucher
               nhận sự kiện qua interfaces/ILoyaltyHook; dịch vụ chính chạy được khi Loyalty tắt

src/libraries  logic thuần · src/interfaces  interface dùng chéo

Ngoài contract
  FullDB (precompile 0x…0107) — lịch sử, báo cáo, tìm kiếm; chỉ ghi qua core/history
  công cụ migration
```

Hướng phụ thuộc (kiểm bằng `scripts/check_deps.sh`): `modules/*` → `core/`; NET, IQR, Loyalty không import lẫn nhau, Loyalty nhận sự kiện qua `interfaces/ILoyaltyHook`. Bảng đầy đủ: `docs/06-cau-truc-thu-muc.md`. **Dịch vụ chính không phụ thuộc Loyalty**, `core/` không phụ thuộc module nào.

## 3. Nguyên tắc

Xem `AGENTS.md` mục "Nguyên tắc thiết kế". Thêm:

- **Ngân sách gas:** mỗi hàm luồng nóng (heartbeat NET, thanh toán, tích điểm) có ngân sách ghi trong đặc tả; `forge snapshot --check` trong CI.
- **Không gọi external trong vòng lặp** ở hàm ghi.
- **Độ sâu gọi chéo ≤ 3** trong luồng nóng.
- **Kiểm thử:** unit + fuzz cho từng hàm; invariant cho Ledger (tổng cộng − tổng trừ = tổng số dư) và RewardLedger (tổng batch active = số dư điểm); kịch bản đầu cuối cho mỗi tổ hợp dịch vụ trong `docs/01-nghiep-vu.md`.

## 4. Quyết định còn mở (ADR ở GĐ1)

| # | Chủ đề | Nghiêng về |
|---|---|---|
| 0020 | Mô hình tenant: singleton đa tenant hay proxy theo chi nhánh | Singleton đa tenant, khoá `agentId/branchId` |
| 0021 | Proxy và storage | UUPS + ERC-7201, kiểm layout tự động |
| 0022 | Ledger: một contract cho xu chính + điểm hay tách | Một Ledger, loại tài sản là tham số; số dư dùng chung mọi chi nhánh, mỗi khoản nạp gắn chi nhánh gốc để tính doanh thu (câu 8) |
| 0023 | AccessManager | Theo mẫu OZ `AccessManager` 5.x, mở rộng phạm vi branch |
| 0024 | Lịch sử và FullDB | **Người dùng chốt dùng FullDB** (2026-11-18). Quy tắc xếp chỗ: `docs/05-luu-tru-du-lieu.md`; còn chờ đội chain trả lời `docs/legacy/50-fulldb.md` mục 5 |
| 0025 | Định dạng snapshot và Merkle cho migration | JSON có version + Merkle theo thực thể |
| 0026 | Dữ liệu cá nhân | **Mâu thuẫn:** người dùng muốn mọi dữ liệu on-chain (câu 7). Cân nhắc: mã hoá on-chain thay vì lưu rõ |
| 0027 | Ví trả trước tách khỏi Loyalty | Bắt buộc (xem `docs/01` mục 3) |
| 0028 | Phạm vi Robot, MTDToken, RevenueManager | Ngoài đợt đầu |
