# 03. Chuyển dữ liệu từ meta-iqr

Chỉ làm **sau khi hệ mới đã test xong** (GĐ5 trở đi). Hệ cũ chỉ được đọc, không sửa mã, không upgrade, không ghi.

## 1. Phân loại

| Loại | Ví dụ | Xử lý |
|---|---|---|
| A. Tiền, điểm | `EconomyVault` xu chính/xu thưởng theo agent/branch/ví; batch xu thưởng còn hạn (Loyalty `_rewardBatches`) | Chụp tại block B, đối soát tổng, nhập vào Ledger/RewardLedger kèm Merkle root |
| B. Dữ liệu chủ | agent, branch, staff, quyền, tài khoản NH, khu vực/bàn/PC, bảng giá, thực đơn, khuyến mãi, member, tier, campaign, voucher và instance chưa dùng, tài khoản NET | Trích xuất, chuẩn hoá, nhập theo lô |
| C. Đang dở | phiên NET mở, order chưa trả, lock điểm, earn chờ confirm, manual request chờ | **Không chuyển.** Xả hết trên hệ cũ trước block B |
| D. Lịch sử | order đã xong, giao dịch điểm, ledger, nạp tiền, phiên đã đóng, chấm công, thống kê | Không ghi lại on-chain; nạp vào indexer từ chain cũ; neo Merkle root lên hệ mới |

## 2. Đường ống

1. **Extractor** (chỉ đọc): view + event + `eth_getStorageAt` (cho biến internal, theo layout `forge inspect`) tại block B → JSON snapshot theo agent, có version.
2. **Validator**: tổng số dư = số dư vault; số lượng khớp; không có tham chiếu mồ côi → báo cáo + Merkle root.
3. **Importer** → `Migration.importBatch(snapshotId, records, proof)`: chỉ vai trò MIGRATOR, idempotent theo `(snapshotId, oldKey)`, lô có trần; `finalizeMigration(agentId)` khoá vĩnh viễn và thu hồi MIGRATOR.
4. **Reconciler**: đọc lại hệ mới, so với snapshot → diff phải = 0.

Ví (EOA) giữ nguyên địa chỉ nên không cần ánh xạ danh tính. ID nội bộ (món, đơn, campaign…) đổi → bảng ánh xạ lưu off-chain và phát qua event `Migrated(oldKey, newId)`.

## 3. Cắt chuyển một agent

1. Báo trước, chọn cửa sổ ngoài giờ.
2. Client của agent vào chế độ bảo trì (không mở phiên/đơn/nạp mới).
3. Xả loại C; checker xác nhận = 0.
4. (Nếu người dùng duyệt) pause module cũ của agent bằng quyền admin hiện có.
5. Chụp block B → Extract → Validate → Import → Reconcile (diff = 0) → finalize.
6. Đổi cấu hình client của agent sang hệ mới.
7. Mở lại, theo dõi; job phát hiện giao dịch lạc vào hệ cũ sau B.

Lùi lại an toàn trước bước 6. Sau bước 6 có điểm không quay lại (24–72 giờ theo dõi).

## 4. Diễn tập

Chụp dữ liệu thật → nhập devnet → đối soát → chạy kịch bản nghiệp vụ trên dữ liệu đó. Lặp tới khi diff = 0 và runbook ổn định, rồi mới thí điểm agent thật.

## 5. Phụ thuộc vào track loyalty-v2

Track refactor Loyalty hệ cũ (`projects/loyalty-v2`) đang đổi storage Loyalty (thêm storage v2 namespaced, di chuyển lười). Extractor của Loyalty phải đọc được **cả hai** dạng: storage `LoyaltyStorage` gốc và storage v2. Khi track đó chốt layout v2, cập nhật mục này.
