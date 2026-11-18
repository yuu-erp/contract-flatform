# 04. Lộ trình

Cập nhật bảng này mỗi khi một task đổi trạng thái. Chỉ task của giai đoạn đang làm mới có file bàn giao chi tiết; giai đoạn sau lập kế hoạch khi giai đoạn trước Xong.

| GĐ | Nội dung | Kết thúc khi | Trạng thái |
|---|---|---|---|
| 0 | **Kiểm kê hệ cũ:** danh mục contract và ABI client dùng, từ điển dữ liệu từng module, luồng nghiệp vụ, bất biến, quyền | Có `docs/legacy/*` được review Đạt | **Triển khai** — khung + script xong; task con `tasks/00-1` … `00-6` chờ Cursor (xem `tasks/00-kiem-ke-he-cu.md`) |
| 1 | **Kiến trúc:** ADR 0020–0028, mô hình dữ liệu mới, ánh xạ cũ → mới, đặc tả module `docs/modules/*` | ADR được duyệt | **Bắt đầu sớm** — `docs/05-luu-tru-du-lieu.md` (storage/FullDB), `docs/modules/core-operator.md` (tầng vận hành, **đã duyệt**); tiếp theo: luồng agent |
| 2 | **Nền tảng:** khung Foundry + CI (**xong sớm 2026-11-18**, còn slither). Tầng quản trị **Claude tự triển khai 2026-11-18**: `PlatformAccess`, `HistoryIndex`, `AgentRegistry`, `BranchRegistry` (T10, T11, T12 — Xong). `AgentAccess` (chủ agent → quản lý → nhân viên, chưa co-owner) **Claude triển khai 2026-11-18**, đặc tả `docs/modules/core-access.md`. Tiếp: DelegateRegistry, Ledger, Registry, Migration | Invariant Ledger xanh, deploy được trên devnet | **Đang làm** |
| 3 | **Dịch vụ:** core chi nhánh (`core/staff`, `resource`, `payment`) → NET → IQR → Loyalty; mỗi module có đặc tả, test, extractor + importer | Mỗi module diễn tập nhập dữ liệu thật trên devnet, diff = 0 | Chưa |
| 4 | **Indexer + client:** indexer, API báo cáo; package FE v2 + adapter; adapter qt-core | FE/qt-core chạy với agent thử trên devnet | Chưa |
| 5 | **Test toàn hệ + diễn tập migration** với snapshot thật 1–2 agent; nghiệm thu với người vận hành | Runbook cắt chuyển được duyệt | Chưa |
| 6 | **Migrate:** thí điểm 1 agent → theo đợt → tất cả | Mọi agent ở hệ mới | Chưa |
| 7 | **Đóng hệ cũ:** meta-iqr chỉ còn lưu trữ chỉ đọc | Không còn client gọi hệ cũ | Chưa |

## Câu hỏi mở cho người dùng

Trả lời trước GĐ1; ghi câu trả lời ngay dưới mỗi câu.

1. Có bao nhiêu agent/chi nhánh đang chạy thật? Mỗi agent chấp nhận dừng bao lâu khi cắt chuyển?
   - **Trả lời (2026-11-18):** hiện chỉ **1 agent** chạy thật (số chi nhánh: người dùng sẽ gửi danh sách). Thời gian dừng chấp nhận được: **chưa trả lời**.
2. Lịch sử cũ chỉ cần xem lại qua indexer, hay bắt buộc on-chain ở hệ mới?
   - **Trả lời (2026-11-18):** lịch sử **nằm on-chain** trên hệ mới. Mâu thuẫn với nguyên tắc 1 (`AGENTS.md`) và lớp D (`docs/03-chuyen-du-lieu.md`) → chốt ở ADR 0024. Cần làm rõ: "on-chain" là event log (rẻ, vẫn trên chain, đọc bằng `eth_getLogs`) hay storage contract (đắt, phải có view phân trang).
3. Có được pause hệ cũ của một agent lúc cắt chuyển không?
   - Thêm (2026-11-18): ở hệ mới, agent bị dừng thì mọi luồng của agent **chỉ đọc**, dữ liệu không được đụng tới (`docs/modules/core-operator.md` R5).
   - **Trả lời (2026-11-18):** **có**, được dừng hệ cũ.
4. Hệ mới chạy cùng chain MVM? Trần gas block và giới hạn bytecode bao nhiêu?
   - **Người dùng chưa rõ; Claude đo bằng RPC chỉ đọc (2026-11-18, `eth_getBlockByNumber`, `eth_estimateGas` mô phỏng tạo contract, không gửi giao dịch):** chain id `991`, block ~41.5k; **trần gas block 10.000.000.000**; base fee / gas price 100.000 wei; **không áp giới hạn bytecode** (EIP-170: runtime 200.000 byte vẫn tạo được) và **không áp giới hạn initcode** (EIP-3860: 300 KB vẫn qua) — khớp việc hệ cũ đang chạy contract 158 KB; hỗ trợ opcode Cancun (`PUSH0`, `TSTORE`, `MCOPY`, `BLOBBASEFEE`) → `evm_version = cancun` giữ nguyên. Chưa xác minh: chain có cùng là chain hệ mới sẽ chạy không (giả định có). Đề xuất: **vẫn giữ trần 24 KB** làm quy tắc thiết kế (nguyên tắc 6) để công cụ chuẩn, audit và khả năng chuyển chain không bị khoá.
5. Đã có indexer/backend off-chain chưa, hay đang dựa hoàn toàn vào FullDB/PublicfullDB?
   - **Trả lời (2026-11-18):** **chưa có** indexer/backend; dựa hoàn toàn vào FullDB/PublicfullDB. → ADR 0024 phải tính phương án không có indexer.
6. Robot, MTDToken, RevenueManager, licence có trong đợt đầu không?
   - Robot: **bỏ hẳn** khỏi hệ mới (người dùng, 2026-11-18). Licence: **bổ sung sau**, đợt đầu chỉ tạo agent và cho vận hành (người dùng, 2026-11-18). MTDToken, RevenueManager: **chưa trả lời**.
7. Dữ liệu cá nhân NET: chỉ lưu hash on-chain được không? Dữ liệu rõ để ở đâu?
   - **Trả lời (2026-11-18):** **toàn bộ dữ liệu lưu on-chain** (hiểu là cả dữ liệu cá nhân; [cần xác nhận] lưu rõ hay mã hoá). Mâu thuẫn nguyên tắc 8 → chốt ở ADR 0026; lưu ý dữ liệu đã lên chain không xoá được.
   - **Đã chốt một phần (2026-11-18):** SĐT liên hệ của **cửa hàng/agent** lưu **rõ** trong FullDB (`AgentProfile.storePhone`). Dữ liệu cá nhân của **khách** vẫn chờ ADR 0026.
8. Khách có được dùng số dư nạp ở chi nhánh A tại chi nhánh B của cùng agent không?
   - **Trả lời (2026-11-18):** hệ cũ **không**; hệ mới **có**: khách dùng một tài khoản chơi net ở mọi chi nhánh của agent, nhưng **tiền nạp và doanh thu tính cho chi nhánh nơi khách nạp**. → ADR 0022 (Ledger): số dư theo `(agent, khách)` nhưng mỗi khoản nạp gắn chi nhánh gốc; khi tiêu ở chi nhánh B, doanh thu ghi cho chi nhánh nạp. [cần xác nhận] khi khách có tiền nạp ở nhiều chi nhánh thì trừ khoản nào trước (FIFO theo thời gian nạp? ưu tiên chi nhánh đang chơi?).
9. Ai giữ khoá owner/deployer? Hệ mới có dùng multisig không?
   - **Trả lời (2026-11-18):** người dùng giữ khoá, `PRIVATE_KEY` trong `.env`; không nói tới multisig. Rủi ro: một EOA nắm quyền nâng cấp toàn hệ → đề xuất ở ADR 0021/0023 tách vai (deployer ≠ admin nâng cấp, timelock hoặc multisig khi có nhiều agent).
