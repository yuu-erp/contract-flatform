# 05. Dữ liệu nào để trong storage, dữ liệu nào để trong FullDB

Trạng thái: **đề xuất** (2026-11-18). Người dùng đã chốt hệ mới dùng FullDB. Tài liệu này là đầu vào cho ADR 0024. Cơ chế FullDB và kết quả đo trên chain ở `docs/legacy/50-fulldb.md`.

Phần nào phụ thuộc câu trả lời của đội chain về FullDB (`50-fulldb.md` mục 5) thì đánh dấu **[chờ chain]**.

## 1. Ba nơi lưu

| Nơi | Là gì | Đặc tính |
|---|---|---|
| **S — storage contract** | biến state trong contract (namespace ERC-7201) | Ghi nguyên tử theo giao dịch, tất định, đọc rẻ trong hàm ghi, kiểm được bằng invariant. Đắt khi lưu nhiều |
| **F — FullDB** | precompile `0x…0107`, ghi qua contract `HistoryIndex` duy nhất | Rẻ hơn storage (~91k gas cho một bản ghi có 5 nhãn + 3 slot), tìm, lọc, sắp, phân trang sẵn. Không dùng để ra quyết định trong hàm ghi |
| **E — event** | log của giao dịch | Rẻ nhất, không đọc được trong contract. Dùng để dựng lại F khi cần và cho client nghe thay đổi |

## 2. Quy tắc xếp chỗ

Hỏi lần lượt, gặp câu "có" đầu tiên thì dừng.

1. **Có hàm ghi nào đọc dữ liệu này để quyết định không?** (kiểm quyền, tính tiền, kiểm số dư, kiểm trạng thái, chống trùng, kiểm giới hạn lượt) → **S**.
2. **Có liên quan tiền hoặc điểm, hoặc nằm trong một bất biến không?** (số dư, khoản đã trả, đã hoàn, batch điểm còn hạn) → **S**.
3. **Có phải trạng thái đang sống không?** (phiên NET đang mở, đơn chưa thanh toán, khoá điểm đang treo) → **S** khi còn sống. Khi kết thúc: ghi bản chốt sang **F**, xoá chi tiết khỏi S, chỉ giữ phần tối thiểu mà quy tắc 1–2 còn cần (ví dụ tổng đã trả, để còn hoàn tiền).
4. **Chỉ để xem lại, tìm, lọc, báo cáo?** (lịch sử, nhật ký, đơn đã xong, thống kê theo ngày) → **F**.
5. **Là dữ liệu cá nhân?** Lưu rõ thì không được ở đâu cả. Hash có salt để tra cứu → **S**; bản mã hoá (nếu cần) → **F**. Chờ ADR 0026.
6. **Mọi thay đổi ở S và F** đều phát **E** kèm đủ dữ liệu để dựng lại bản ghi F.

Hai luật đi kèm:
- **Không** dùng kết quả `querySearch` hay `getDataDocument` trong hàm ghi.
- Dữ liệu chủ (thực đơn, bảng giá, máy trạm…) ở **S** vì đơn hàng và phiên cần giá. Nếu cần tìm theo tên thì **đồng thời** ghi chỉ mục vào F. S là nguồn sự thật, F chỉ là bản sao để tìm.

### Thống kê và dashboard

Hệ cũ cộng dồn thống kê trong storage ngay trong luồng nóng (ví dụ `RestaurantOrder.dashboardPaymentBuckets`, `RestaurantReporting` có 71 biến, `NetCafeDashboardV3`). Hệ mới chọn một trong hai cách:

- **(a) Mặc định:** không lưu số tổng hợp. Client lấy từ F bằng `querySearch` lọc khoảng thời gian, cộng phía client theo trang.
- **(b) Chỉ cho số dashboard phải hiện tức thì:** mỗi `(chi nhánh, ngày)` một document tổng hợp trong F, cập nhật bằng `setDataDocument`. `docId` lưu ở S (`mapping(branch, day) → docId`). **[chờ chain]**: `setDataDocument` có nguyên tử theo giao dịch không.

Hệ cũ đang có thống kê nào thì task 00-3 đánh dấu lớp D. Thống kê nào thật sự cần tức thì: người dùng chốt khi làm đặc tả từng module.

## 3. Xếp chỗ theo thực thể

Cột: **S** = trường giữ trong storage · **F** = DB và nhãn trong FullDB · **E** = event chính.

### 3.1 Core — tầng vận hành, tenant, quyền

| Thực thể | S | F | E |
|---|---|---|---|
| Owner, admin nền tảng | địa chỉ + vai trò | — | `RoleGranted/Revoked` |
| Agent | id, ví chủ, trạng thái (active/suspended), thuế mặc định theo dịch vụ (licence: sau này) | hồ sơ hiển thị (tên cửa hàng, địa chỉ, ghi chú) để tìm agent theo tên | `AgentCreated`, `AgentStatusChanged` |
| Chi nhánh | id, agentId, trạng thái, dịch vụ bật (bitmask NET/IQR/LOYALTY), múi giờ, hash domain, thuế riêng theo dịch vụ (nếu agent đặt) | hồ sơ hiển thị | `BranchCreated`, `ServicesChanged` |
| Vai trò người dùng | `(agentId, branchId, account) → roles`, quyền chi tiết | — | `RoleGranted/Revoked` |
| Nhật ký quản trị | — | `audit_<agent>`: ai, làm gì, khi nào, chi nhánh | `AdminAction` |
| Session wallet | `delegate → (member, agentId, hết hạn)` | — | `DelegateSet/Revoked` |
| Ledger: số dư xu chính | số dư theo `(agent, khách)`, **phần nạp theo chi nhánh gốc** (câu 8), `refId` đã dùng | `ledger_<agent>`: từng bút toán (nạp, tiêu, hoàn; nhãn ví, chi nhánh nạp, chi nhánh tiêu, module, thời gian) | `Posted(refId, …)` |
| Doanh thu chi nhánh | số tiền chờ quyết toán theo chi nhánh (nếu có rút/đối soát on-chain) | bút toán doanh thu theo chi nhánh nạp | `RevenueAttributed` |

### 3.2 Hạ tầng chi nhánh (`core/staff`, `core/resource`, `core/payment`)

| Thực thể | S | F | E |
|---|---|---|---|
| Staff | `(branch, account) → vai, trạng thái` | hồ sơ hiển thị (tên, vị trí; PII theo ADR 0026) | `StaffAdded/Updated` |
| Ca làm, chấm công | ca **đang mở** của staff (để chặn chấm trùng) | `attendance_<agent>`: từng lần vào/ra, ca, sự cố | `CheckedIn/Out` |
| Khu vực, bàn, máy trạm | id, chi nhánh, loại, trạng thái, nhóm giá | — | `ResourceChanged` |
| Tài khoản thanh toán | id, chi nhánh, trạng thái, hash số tài khoản | thông tin hiển thị (mã hoá nếu là dữ liệu nhạy cảm) | `PaymentAccountChanged` |

### 3.3 NET

| Thực thể | S | F | E |
|---|---|---|---|
| Tài khoản khách | ví, hash username, hash mật khẩu, trạng thái, agentId | hồ sơ (PII theo ADR 0026); chỉ mục tìm theo username | `AccountRegistered` |
| Bảng giá, nhóm máy | giá theo nhóm và khung giờ | — | `PriceChanged` |
| Phiên **đang mở** | máy, khách, delegate, giờ bắt đầu, lần trừ cuối, đơn giá áp dụng | — | `SessionOpened`, `Charged` |
| Phiên **đã đóng** | xoá; giữ `sessionId → đã tất toán` nếu cần chống đóng hai lần | `net_sessions_<agent>`: máy, khách, chi nhánh, thời lượng, tổng trừ xu chính/xu thưởng | `SessionClosed` |
| Yêu cầu nạp **chờ duyệt** | id, khách, số tiền, chi nhánh, trạng thái | — | `TopUpRequested` |
| Nạp đã xong | (số dư nằm ở Ledger) | bút toán trong `ledger_<agent>` | `TopUpConfirmed` |

### 3.4 IQR

| Thực thể | S | F | E |
|---|---|---|---|
| Thực đơn: danh mục, món, biến thể, thuộc tính | giá, trạng thái bán, tồn (nếu có) | tên, mô tả, ảnh, chỉ mục tìm món | `MenuItemChanged` |
| Khuyến mãi | điều kiện, hạn, trần lượt, **số lượt đã dùng** (theo khách) | — | `PromotionChanged/Used` |
| Phiên bàn, đơn **đang mở** | bàn, món, số lượng, giá chốt, trạng thái món | — | `OrderPlaced`, `ItemStatusChanged` |
| Thanh toán | khoản đã trả theo phương thức, **đã hoàn**, khoá điểm/ví đang treo | — | `Paid`, `Refunded` |
| Đơn **đã xong** | chỉ giữ tóm tắt tất toán (tổng trả, tổng hoàn) để còn hoàn tiền; hết hạn hoàn thì xoá | `iqr_orders_<agent>`: đầy đủ món, staff, bàn, ghi chú; nhãn chi nhánh, ngày, khách, staff, trạng thái | `OrderClosed` |
| Đặt bàn | đặt chỗ **sắp tới** (để chặn trùng giờ) | `iqr_reservations_<agent>`: đặt chỗ đã qua hoặc đã huỷ | `Reserved/Cancelled` |
| Đánh giá món | — | `iqr_reviews_<agent>` | `Reviewed` |
| Báo cáo món, doanh thu | — (cách a) hoặc docId tổng hợp (cách b) | tổng hợp theo ngày | — |

### 3.5 Loyalty

| Thực thể | S | F | E |
|---|---|---|---|
| Member | ví, trạng thái (khoá), hạng, tổng chi tiêu | hồ sơ hiển thị | `MemberJoined/Locked` |
| Batch điểm **còn hạn** | số còn lại, hạn dùng, chi nhánh gốc (heap theo hạn) | — | `PointsGranted` |
| Điểm bị khoá cho thanh toán | khoá đang treo, batch nào, bao nhiêu | — | `PointsLocked/Released` |
| Giao dịch điểm (tích, tiêu, hết hạn, thủ công) | `refId` đã dùng (chống tích trùng) | `loyalty_tx_<agent>`: nhãn ví, loại, chi nhánh, module, thời gian | `PointsPosted` |
| Hạng, chính sách tiêu điểm | cấu hình | — | `TierChanged` |
| Chiến dịch | cấu hình, ngân sách còn lại, trạng thái | mô tả hiển thị | `CampaignChanged` |
| Voucher | catalog, instance **chưa dùng** (chủ, hạn) | instance đã dùng hoặc hết hạn | `VoucherIssued/Redeemed` |
| Yêu cầu tích thủ công | yêu cầu **chờ duyệt** | yêu cầu đã duyệt hoặc từ chối | `ManualRequest*` |

## 4. Tên DB trong FullDB

`mp1_<loại>_<agentId>`, ví dụ `mp1_ledger_12`, `mp1_iqr_orders_12`. `mp1` là version schema: đổi schema thì tăng lên `mp2`, không ghi đè DB cũ.

Mỗi bản ghi là `abi.encode(struct có version)`. Nhãn chuẩn: `W` ví, `B` chi nhánh, `M` module, `K` loại, `S` staff, `R` refId. Slot chuẩn: 0 thời gian, 1 số tiền, 2 chi nhánh.

Chỉ `core/history/HistoryIndex` gọi FullDB. Module ghi qua `HistoryIndex.append(agentId, kind, record, terms, values)`; `HistoryIndex` kiểm module đã đăng ký và chỉ cho ghi vào DB của agent đó.

## 5. Lỗi khi ghi FullDB **[chờ chain]**

- Nếu ghi FullDB **bị huỷ theo** khi giao dịch revert: ghi F trong cùng giao dịch, lỗi thì revert cả giao dịch. Lịch sử không bao giờ thiếu.
- Nếu không: ghi F rồi phát `HistoryAppended(docId)`. Lỗi thì phát `HistoryAppendFailed` kèm dữ liệu; có hàm `reindex` theo lô để ghi bù từ event.

## 6. Hệ quả cho kiến trúc

- Thêm `core/history/HistoryIndex` vào sơ đồ (`docs/02-kien-truc.md`).
- Bỏ khỏi storage: mọi mảng lịch sử, mảng "all…", bucket dashboard của hệ cũ.
- Phiên NET, đơn IQR, khoá điểm có **dọn storage khi kết thúc** trong đặc tả máy trạng thái.
- Test local: `MockFullDB` có lọc theo nhãn, sắp theo slot, phân trang. Mock của hệ cũ trả rỗng, không dùng được.
