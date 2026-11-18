# GĐ0 — Kiểm kê hệ cũ meta-iqr (đầu vào để thiết kế hệ mới và chuyển dữ liệu)

Trạng thái: Triển khai — chia thành task con `00-1` … `00-6` (Cursor triển khai, Claude review)
Cỡ: L (giai đoạn 0 của `meta-platform`) · Loại: Tài liệu (không viết contract)
Ngày tạo: 2026-11-18

## Kế hoạch (Claude Code)

### Mục tiêu

Mô tả đầy đủ hệ cũ thành tài liệu trong `docs/legacy/`, đủ để:
1. thiết kế hệ mới không bỏ sót nghiệp vụ;
2. viết extractor chuyển dữ liệu (biết dữ liệu nằm ở đâu và đọc bằng cách nào);
3. biết client đang dựa vào hàm nào.

### Phạm vi

- Đọc mã `repos/contract/meta-iqr` tại `68d1d3c` (checkout chính, nhánh `feat/lock-member-voucher-restore`), FE `repos/fe/metanode-cyber-game`, qt-core `repos/cpp-qt/qt-core/src/sidebar-cyber`, qt-widget.
- Chỉ ghi file trong `repos/contract/meta-platform/docs/legacy/`.

### Ngoài phạm vi

- Sửa bất kỳ file nào ngoài `docs/legacy/`.
- Thiết kế hệ mới (GĐ1).
- Gọi chain.
- `contracts/robot/**`, `contracts/sc-robotcontroller/**`: chỉ liệt kê ở bước 1, không phân tích sâu.
- Không đọc/in `.env`, khoá, script có khoá.

### Tiêu chí nghiệm thu

- [ ] `docs/legacy/00-danh-muc-contract.md` có **mọi** file `.sol` trong `contracts/` (114 file theo `find` tại `68d1d3c` — kế hoạch ban đầu ghi nhầm 113, kể cả `legacy/`, `* copy.sol`, `v2/`, `contract_old/`), mỗi file một trạng thái. Kiểm bằng lệnh 1.
- [ ] `docs/legacy/01-abi-client.md` liệt kê mọi hàm/event mà FE, qt-core, qt-widget gọi, kèm file:dòng nơi gọi.
- [ ] Mỗi module (shared, system, net, iqr, loyalty) có file từ điển dữ liệu chứa **mọi** biến state `mapping`/mảng/struct của các contract đang deploy. Kiểm bằng lệnh 2: số biến đếm được = số dòng trong từ điển.
- [ ] Mỗi thực thể trong từ điển có: cách đọc (getter view / chỉ event / chỉ `getStorageAt`), lớp chuyển dữ liệu A/B/C/D theo `docs/03-chuyen-du-lieu.md`, và có bị vòng lặp không trần chạm không.
- [ ] `docs/legacy/20-luong-nghiep-vu.md` mô tả từng luồng chính bằng chuỗi hàm thật.
- [ ] `docs/legacy/30-quyen.md`: ma trận vai trò × hàm ghi.
- [ ] `docs/legacy/40-bat-bien-va-loi.md`: bất biến hệ cũ đang dựa vào + lỗi/rủi ro đã biết, dẫn nguồn.
- [ ] Mục "[cần xác nhận]" trong `docs/01-nghiep-vu.md` được trả lời bằng bằng chứng từ mã, hoặc chuyển thành câu hỏi cho người dùng.

### Checkout

| Repo | Checkout | Nhánh | HEAD lúc bắt đầu | Thay đổi có sẵn |
|---|---|---|---|---|
| contract/meta-platform | `repos/contract/meta-platform` | `main` (chưa có commit) | — | các file tài liệu ban đầu |
| contract/meta-iqr (chỉ đọc) | `repos/contract/meta-iqr` | `feat/lock-member-voucher-restore` | `68d1d3c` | không |
| fe/metanode-cyber-game (chỉ đọc) | `repos/fe/metanode-cyber-game` | `meos/version-4.0.3` (khớp origin) | `59eabf9` | ` M pnpm-lock.yaml` (của người dùng, giữ nguyên) |
| cpp-qt/qt-core (chỉ đọc) | `repos/cpp-qt/qt-core` | `develop` (sau origin 5 commit) | `b1802f32` | ` M backend/runsdk/macos_arm64/{Core,RunSDK,finsdk}.dll`, `?? meos.log` (của người dùng, giữ nguyên) |
| cpp-qt/qt-widget (chỉ đọc) | `repos/cpp-qt/qt-widget` | `feat/update-qt` (khớp origin) | `4f22433` | không |

Track loyalty-v2 làm song song trong `worktrees/meta-iqr-loyalty-v2`. Task này **không** đọc worktree đó, chỉ đọc checkout chính. Danh mục ABI Loyalty đã có ở `projects/loyalty-v2/abi-surface.md` (nếu track kia xong trước) thì dẫn link, không làm lại.

### Hợp đồng thay đổi

Không có (chỉ tài liệu).

### Các bước

1. [ ] **Danh mục contract** → `00-danh-muc-contract.md`. Bảng: file · contract · module · trạng thái (`đang deploy` / `legacy` / `bản sao` / `mock` / `interface` / `library`) · kiểu proxy (UUPS / Beacon / không) · factory tạo ra · bytecode (`forge build --sizes`, bỏ `--skip` nếu build lỗi thì ghi rõ) · số dòng. Xác định "đang deploy" dựa trên `deployments/*.json` (chỉ lấy tên contract, **không chép địa chỉ hay khoá**), script deploy và factory.
2. [ ] **ABI client dùng** → `01-abi-client.md`.
   - FE: `packages/*-contracts/src/**` (contract class, ABI JSON) và nơi `apps/**` gọi.
   - qt-core: `src/sidebar-cyber/**` (`CyberSidebarAbis.hpp`, watcher).
   - qt-widget: tìm lời gọi chain.
   - Bảng: contract · hàm/event · đọc/ghi · client · file:dòng.
   - Ghi riêng các view trả mảng lớn không phân trang mà client gọi.
3. [ ] **Từ điển dữ liệu** — mỗi module một file: `10-du-lieu-shared.md` (BranchAccessManager, PaymentRegistry, ResourceRegistry, EconomyVault, ModuleRegistry, AuditTrail), `11-du-lieu-system.md` (AgentManagement, EnhancedAgentManagement, RevenueManager, StaffAgentStore, FreeGasStorage, MTDToken; BranchManagement, AttendanceSystem, HistoryTracking), `12-du-lieu-net.md` (NetCafe*V3), `13-du-lieu-iqr.md` (Management, RestaurantOrder, RestaurantReporting, AgentIQR), `14-du-lieu-loyalty.md` (LoyaltyStorage, PublicfullDB).
   - Mỗi dòng: biến · kiểu (khoá → giá trị) · thực thể nghiệp vụ · cách đọc (tên getter / event / chỉ storage) · tăng theo gì (member, đơn, ngày…) · lớp A/B/C/D · ghi chú (PII, dư thừa, đã deprecated).
   - Kèm layout storage: `forge inspect <Contract> storageLayout` cho các contract đang deploy, lưu ở `docs/legacy/layout/<Contract>.json` (cần cho extractor đọc biến internal).
4. [ ] **Luồng nghiệp vụ** → `20-luong-nghiep-vu.md`: tạo agent/branch, bật/tắt dịch vụ; NET (đăng ký, nạp, mở phiên, heartbeat, đóng phiên, đăng xuất máy); IQR (gọi món, PREPAID, POSTPAID, huỷ món, huỷ đơn, hoàn một phần, đặt bàn); Loyalty (tích điểm theo hoá đơn/nạp, tier, campaign, tiêu điểm, voucher, hết hạn, thủ công). Mỗi luồng: bên gọi → chuỗi hàm (contract.hàm) → thay đổi state → event. Đánh dấu bước có vòng lặp không trần hoặc gọi external sâu > 3 tầng (dùng `CROSS_CONTRACT_CALL_DEPTH_AUDIT.md`, `GLOBAL_STORAGE_ARRAY_LOOP_AUDIT.md` làm nguồn, kiểm lại với mã hiện tại).
5. [ ] **Quyền** → `30-quyen.md`: vai trò (system owner, super admin, agent admin, co-owner, branch manager, staff theo `STAFF_ROLE`, quyền `PERM_*`, module được uỷ quyền như `isOrder`, `isNetSpendModule`, `authorizedModules` của vault) × hàm ghi của các contract đang deploy. Đánh dấu chỗ quyền theo branch nhưng tác động phạm vi rộng hơn.
6. [ ] **Bất biến và lỗi đã biết** → `40-bat-bien-va-loi.md`: bất biến tiền/điểm/trạng thái hệ cũ dựa vào; danh sách lỗi từ `documents/tasks/2026-11-18-review-loyalty-contract.md`, `documents/tech-debt.md` và các audit trong meta-iqr, mỗi dòng dẫn nguồn.
7. [ ] **Đối chiếu `docs/01-nghiep-vu.md`**: sửa chỗ sai so với mã, trả lời "[cần xác nhận]", thêm câu hỏi mới vào `docs/04-lo-trinh.md` mục câu hỏi mở. Cập nhật bảng GĐ0 trong `docs/04-lo-trinh.md` thành "Review".

### Lệnh kiểm tra

```bash
cd repos/contract/meta-iqr
# 1. đủ file trong danh mục
find contracts -name '*.sol' | wc -l
grep -c '^| `contracts/' ../meta-platform/docs/legacy/00-danh-muc-contract.md
# 2. đủ biến state trong từ điển (ví dụ cho NET; lặp cho từng module)
grep -hcE '^\s+(mapping\(|[A-Za-z0-9_]+(\[\])+\s+(public|internal|private))' contracts/net_repo/contracts/v3/NetCafe*V3.sol
grep -c '^| ' ../meta-platform/docs/legacy/12-du-lieu-net.md
# 3. layout storage
forge inspect contracts/loyalty/RestaurantLoyaltySystem.sol:RestaurantLoyaltySystem storageLayout > /dev/null && echo ok
```

`forge build` toàn repo đang lỗi do vài test không biên dịch (nợ `loyalty-tests-broken`). Dùng `forge build --skip 'test/**' --skip 'script/**'` cho bước 1 và 3.

### Câu hỏi còn mở (người dùng trả lời trước khi Triển khai)

- Danh sách agent/chi nhánh đang chạy thật có thể lấy từ đâu ngoài chain (để biết module nào thật sự đang dùng)?
  - **Trả lời (2026-11-18):** người dùng sẽ gửi danh sách. Khi chưa có, "đang deploy" suy từ `deployments/*.json`, script deploy và factory; đối chiếu lại khi có danh sách.
- Robot có cần đưa vào từ điển dữ liệu không, hay bỏ hẳn khỏi hệ mới?
  - **Trả lời (2026-11-18):** bỏ hẳn khỏi hệ mới. Bước 1 vẫn liệt kê file Robot (trạng thái `bỏ — không chuyển`) để danh mục đủ 113 file; không có từ điển dữ liệu, luồng hay quyền cho Robot.

### Task con (người dùng chọn 2026-11-18: Claude dựng khung, Cursor làm từng task, Claude review)

| Task | Bước | File ghi | Trạng thái |
|---|---|---|---|
| `tasks/00-1-danh-muc-contract.md` | 1 | `docs/legacy/00-danh-muc-contract.md` | Chờ duyệt |
| `tasks/00-2-abi-client.md` | 2 | `docs/legacy/01-abi-client.md` | Chờ duyệt |
| `tasks/00-3a-du-lieu-shared-system.md` | 3 | `docs/legacy/10-…`, `11-…` | Chờ duyệt |
| `tasks/00-3b-du-lieu-net.md` | 3 | `docs/legacy/12-du-lieu-net.md` | Chờ duyệt |
| `tasks/00-3c-du-lieu-iqr.md` | 3 | `docs/legacy/13-du-lieu-iqr.md` | Chờ duyệt |
| `tasks/00-3d-du-lieu-loyalty.md` | 3 | `docs/legacy/14-du-lieu-loyalty.md` | Chờ duyệt |
| `tasks/00-4-luong-nghiep-vu.md` | 4 | `docs/legacy/20-luong-nghiep-vu.md` | Chờ duyệt |
| `tasks/00-5-quyen.md` | 5 | `docs/legacy/30-quyen.md` | Chờ duyệt |
| `tasks/00-6-bat-bien-va-doi-chieu.md` | 6, 7 | `docs/legacy/40-…`, `docs/01-nghiep-vu.md`, `docs/04-lo-trinh.md` | Chờ duyệt (làm cuối) |

00-1…00-5 độc lập, ghi file khác nhau, chạy song song được. 00-6 làm sau cùng. Task này chuyển Review khi cả 9 task con Đạt.

## Triển khai

### Lượt 1 — khung (Claude Code, 2026-11-18)

- **Checkout/nhánh/HEAD đã kiểm:** meta-iqr `68d1d3c` khớp; FE `59eabf9`, qt-core `b1802f32`, qt-widget `4f22433` (bảng Checkout). Không ghi gì vào các checkout chỉ đọc (`git status` meta-iqr vẫn sạch).
- **File đã tạo:**
  - `docs/legacy/README.md` + khung 10 file `docs/legacy/*.md` (tiêu đề, cột bảng, quy ước).
  - `scripts/legacy/inventory.py` (`make legacy-inventory`): build meta-iqr vào `cache/legacy-iqr/` (gitignore), sinh `docs/legacy/generated/{contracts,deployed,client-hits}.md`, `generated/state/<C>.md`, `generated/abi/<C>.md`, `docs/legacy/layout/<C>.json` (31 contract).
  - `scripts/legacy/check_docs.py`: kiểm tiêu chí đo được (catalog đủ 114 file, từ điển đủ biến storage, lớp A/B/C/D).
  - 9 file task con `tasks/00-*.md`.
- **Khác kế hoạch (và lý do):**
  - Người dùng chọn: Claude dựng khung + script, Cursor điền tài liệu theo task con → thêm `scripts/legacy/` ngoài `docs/legacy/`.
  - Danh mục 114 file, không phải 113.
  - "Đang deploy" suy từ `scripts/create_system.js` và `script/DeployNetCafeV3.s.sol` (31 contract, không tính Robot); `AgentManagement`, `MTDToken`, `BranchAuditTrail` không thấy trong script deploy → task 00-1 kết luận.
  - Từ điển dữ liệu đếm theo `forge` storageLayout (đủ cả scalar và biến kế thừa) thay cho lệnh `grep` của kế hoạch; chặt hơn.
  - Robot bỏ hẳn (câu trả lời người dùng).
- **Lệnh đã chạy và kết quả:** `forge build --skip 'test/**' --skip 'script/**' --sizes --extra-output storageLayout` (meta-iqr, out ra thư mục ngoài checkout): biên dịch được, báo nhiều contract > 24 KB (lớn nhất `RestaurantLoyaltySystem` 158.5 KB, `RestaurantOrder` 119.7 KB, `Management` 100.7 KB, `HistoryTracking` 97.4 KB, `EnhancedAgentManagement` 85.6 KB). `inventory.py`: 114 file, 31 contract đang deploy, 546/2151 tên hàm/event có client nhắc. `check_docs.py catalog` trên khung: báo thiếu 114 file (đúng, chưa điền).
- **Nợ kỹ thuật phát hiện:** không mới (kích thước contract đã có trong nợ cũ).
- **Còn vướng:** chờ người dùng gửi danh sách agent/chi nhánh thật để đối chiếu "đang deploy"; 8 câu hỏi mở trong `docs/04-lo-trinh.md`.

## Review (Claude Code)

### Vòng 1

- **Phát hiện:**
- **Kết luận:**
