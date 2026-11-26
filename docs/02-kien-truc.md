# 02. Kiến trúc

Trạng thái: **Chốt — Architecture Baseline v1** (họp với người dùng 2026-11-26). Sửa file này phải kèm một ADR trong `docs/adr/`. Mọi task, mọi module mới đều phải khớp file này; chỗ nào không khớp thì sửa kiến trúc bằng ADR trước, không "lách" trong code.

## 1. Mục tiêu

| # | Yêu cầu | Nguồn |
|---|---|---|
| Y1 | **Hệ thống là một cái cây.** Cành, lá (module dịch vụ) chết thì thân và rễ (nền tảng) vẫn sống; tiền và tài khoản của khách không bao giờ phụ thuộc một module. | Người dùng, 2026-11-26 |
| Y2 | Thêm module mới (Enterprise, karaoke, bida…) **không phải nâng cấp nền tảng**. | Người dùng, 2026-11-26 |
| Y3 | Khách hàng đầu tiên dùng **NET + IQR + Loyalty cùng lúc**: chơi net, gọi đồ ăn tại máy, trả bằng một ví, tích điểm, dùng voucher. Kịch bản chuẩn: `docs/09-kich-ban-chuan.md`. | Người dùng, 2026-11-26 |
| Y4 | Quy mô nhỏ: chọn phương án đơn giản nhất đủ đúng, chưa tối ưu tải lớn. | Người dùng, 2026-11-26 |
| Y5 | Xây xong hệ mới rồi mới chuyển dữ liệu từ meta-iqr; mô hình dữ liệu mới phải **nhận được** dữ liệu cũ. | Người dùng, 2026-11-26 |

Vì sao không giữ kiến trúc cũ (meta-iqr): contract 100–160 KB, vòng lặp không trần, chuỗi gọi sâu 10 tầng, thống kê ghi on-chain trong luồng nóng, quyền lỏng giữa chi nhánh, dữ liệu cá nhân on-chain, xu chính nằm trong Loyalty, test không chạy. Dẫn chứng: `docs/legacy/`.

## 2. Cây bốn tầng

```text
              lá    lá    lá    lá
T3 MODULE    NET   IQR  Loyalty (Enterprise, …)   bật/tắt theo chi nhánh, mọc/rụng/thay được
               \    |    /
T2 DÙNG CHUNG  Ledger · PaymentAccounts · SalesSettings · Permission · Duty · Resource
                    ║                                   trung lập nghiệp vụ, ≥ 2 module cần
T1 THÂN        AgentRegistry · BranchRegistry · AgentAccess · AgentUserRegistry · DelegateRegistry
                    ║                                   ai, thuộc đâu, thay mặt ai
T0 RỄ          PlatformAccess · Registry · HistoryIndex
                                                        không biết gì về nghiệp vụ
──────────────────────────────────────────────────────────────────────────────
T4 NGOÀI CHAIN  Relayer (trả gas hộ) · Indexer · Frontend (apps theo vai trò) · FullDB (precompile)
```

| | **T0 · Rễ** | **T1 · Thân** | **T2 · Cành chính** | **T3 · Lá** |
|---|---|---|---|---|
| Câu hỏi | Ai quản trị nền tảng? Contract nào ở đâu? Module nào tồn tại, đang sống? Lịch sử ghi vào đâu? | Agent, chi nhánh nào tồn tại, đang chạy? Ai là chủ, Manager, Staff, khách? Ví này thay mặt ai? | Tiền của khách bao nhiêu? Nhân viên có quyền làm việc này không, có đang trực không? Thiết bị nào thuộc chi nhánh nào? | Nghiệp vụ cụ thể: mở máy, tính giờ, gọi món, tích điểm, chấm công… |
| Biết nghiệp vụ? | Không | Không (chỉ "người", "đơn vị") | Chỉ khái niệm chung (tiền, quyền, ca, thiết bị) | Có |
| Biết tên module? | **Không** | **Không** | **Không** | Chỉ tên của chính nó |
| Tần suất đổi | Gần như không | Hiếm | Thỉnh thoảng | Thường xuyên |
| Nâng cấp | ADR + người dùng duyệt | ADR + người dùng duyệt | ADR | Review thường |
| Lỗi thì | Cả hệ dừng → giữ thật nhỏ, test kỹ nhất | Cả hệ dừng | Mọi module dùng phần đó bị ảnh hưởng | **Chỉ module đó dừng** |

**Quy tắc vàng:** rễ và thân càng nhỏ càng tốt. Phân vân thì đặt ở lá. Khi ≥ 2 module thật sự cần thì mới kéo xuống T2, bằng ADR.

## 3. Bản đồ contract

Mỗi contract trả lời **đúng một câu hỏi** (luật L4). Tính năng không khớp câu hỏi → contract mới hoặc module, không nới contract cũ.

| Tầng | Contract | Câu hỏi nó trả lời | Trạng thái | Thư mục đích (ADR 0034) |
|---|---|---|---|---|
| T0 | `PlatformAccess` (+ abstract `PlatformAccessed`) | Ai là owner/admin nền tảng? Hệ có đang dừng toàn bộ? | ✅ | `src/kernel/access/` |
| T0 | `Registry` | Contract/module nào ở địa chỉ nào, phiên bản nào; module nào đang chạy/tạm dừng/ngừng; module khai báo gì (ADR 0030) | ✅ (`docs/modules/kernel-registry.md`) | `src/kernel/registry/` |
| T0 | `HistoryIndex` | Ghi/đọc lịch sử vào FullDB ở đâu, ai được ghi loại nào | ✅ | `src/kernel/history/` |
| T1 | `AgentRegistry` | Agent nào tồn tại, chủ là ai, đang chạy hay dừng? | ✅ | `src/tenant/agent/` |
| T1 | `BranchRegistry` | Chi nhánh nào thuộc agent nào, bật module nào, đang chạy hay dừng? | ✅ | `src/tenant/branch/` |
| T1 | `AgentAccess` | Ví này là Manager/Staff của chi nhánh nào? | ✅ | `src/tenant/access/` |
| T1 | `AgentUserRegistry` | Tài khoản (khách **và** nhân viên) của agent: danh tính cố định, đăng nhập, hồ sơ. Thao tác nhân viên chỉ qua operator | ✅ | `src/tenant/user/` |
| T1 | `DelegateRegistry` | Ví phiên / ví máy này đang thay mặt tài khoản nào, tới khi nào? (+ OTP, QR) | ✅ (`docs/modules/tenant-delegate.md`) | `src/tenant/delegate/` |
| T2 | `Ledger` | Số dư của khách bao nhiêu, bút toán nào đã ghi? | ✅ | `src/shared/ledger/` |
| T2 | `SalesSettings` | Chi nhánh thu thuế bao nhiêu, nhận phương thức thanh toán nào? | ✅ | `src/shared/payment/` |
| T2 | `PaymentAccounts` | Tiền thật về tài khoản nào; ca thu ngân và két đang mở/đóng, chênh lệch bao nhiêu? (`docs/08` mục 5) | Chưa | `src/shared/payment/` |
| T2 | `Permission` | Ví này có quyền P của module M ở chi nhánh B **lúc này** không? (vị trí, `can()`) | ✅ (`docs/modules/shared-permission-duty.md`) | `src/shared/permission/` |
| T2 | `Duty` | Ai đang trực ca nào, vị trí nào, đến khi nào? (ca, phân công, phiên trực, tăng ca) | ✅ (`docs/modules/shared-permission-duty.md`) | `src/shared/duty/` |
| T2 | `CustomerDesk` | Nhân viên này có được thao tác trên tài khoản khách không? (ADR 0035) | ✅ (`docs/modules/tenant-delegate.md`) | `src/shared/desk/` |
| T2 | `Resource` | Thiết bị/tài nguyên nào thuộc chi nhánh nào, của module nào, đang hoạt động không? (chỉ danh tính + trạng thái) | Chưa | `src/shared/resource/` |
| T3 | `modules/net/*` | Tài khoản NET, máy trạm & giá, phiên chơi, nạp tại máy | Chưa | `src/modules/net/` |
| T3 | `modules/iqr/*` | Thực đơn, khuyến mãi quán, đơn/bàn (máy trạng thái), đặt bàn | Chưa | `src/modules/iqr/` |
| T3 | `modules/loyalty/*` | Thành viên, điểm theo batch có hạn, hạng, chiến dịch, voucher | Chưa | `src/modules/loyalty/` |
| T3 | `modules/enterprise/*` | Chấm công doanh nghiệp, nghỉ phép, thiết bị chấm công (sau) | Sau | `src/modules/enterprise/` |
| — | `Migration` | Nhập dữ liệu meta-iqr theo lô, idempotent, khoá sau `finalize` | Cuối (Y5) | `src/migration/` |

Bỏ: `operator/PlatformOperator` (mỗi registry tự kiểm quyền, không cần). `Attendance` không nằm ở nền tảng: nền tảng chỉ phát sự kiện vào/ra ca (Duty), chấm công theo quy tắc công ty là module Enterprise.

`Migration` là công cụ tạm, đứng ngoài cây: được gọi mọi tầng qua interface, quyền `MIGRATOR` thu hồi vĩnh viễn sau `finalize`.

## 4. Bảy luật kiến trúc

| # | Luật | Kiểm bằng |
|---|---|---|
| L1 | Phụ thuộc chỉ đi xuống: T3 → T2 → T1 → T0. Module không import nhau; báo nhau chỉ qua hook trong `interfaces/` | `scripts/check_deps.sh` |
| L2 | **T0–T2 không biết tên module.** Không hằng `NET`/`IQR`/`LOYALTY`, không nhánh `if (service == NET)` dưới T3. Danh sách module, phụ thuộc giữa module, danh mục quyền đọc từ `Registry` lúc chạy | `check_deps.sh` (grep hằng dịch vụ dưới `src/modules`) |
| L3 | **Mặc định đặt ở module.** Vào T2 khi đủ cả ba: ≥ 2 module cần ngay bây giờ, trung lập nghiệp vụ, có ADR | Checklist mục 10 + review |
| L4 | Mỗi contract trả lời một câu hỏi, ghi ở bảng mục 3 | Review |
| L5 | Ngân sách kích thước: > 20 KB là cảnh báo phải có kế hoạch tách; ≤ 24 KB là cứng | `make sizes` trong CI |
| L6 | Lịch sử, báo cáo, thống kê không nằm trong storage (`docs/05`). Ngoại lệ phải có ADR (hiện có: bộ đếm ngày của Ledger, `docs/08` mục 6, vì chưa có indexer) | Review |
| L7 | Nâng cấp T0/T1: ADR + người dùng duyệt. T2: ADR. T3: review thường, chỉ trong phạm vi module | `docs/07` |

Giữ nguyên 10 nguyên tắc trong `AGENTS.md` (Ledger, máy trạng thái, swap-pop, phân trang, UUPS + ERC-7201, event có version, không PII rõ…). Thêm:
- **Gas:** hàm luồng nóng (heartbeat NET, thanh toán, tích điểm) có ngân sách trong đặc tả; `forge snapshot --check` trong CI.
- **Không gọi external trong vòng lặp** ở hàm ghi. **Độ sâu gọi chéo ≤ 3** trong luồng nóng.

## 5. Cô lập lỗi — vì sao cành chết thì cây vẫn sống

Chi tiết: ADR 0031.

| # | Cơ chế | Đảm bảo |
|---|---|---|
| C1 | Lõi không gọi module (L1) | Code module lỗi không chạy trong giao dịch của lõi |
| C2 | **Cầu dao từng module** trong `Registry`: Đang chạy / Tạm dừng / Ngừng hẳn | Dừng riêng NET; IQR, Loyalty vẫn chạy. T2 từ chối mọi lệnh ghi đến từ module đang dừng |
| C3 | **Tường lửa tiền** ở Ledger: mỗi module một giấy phép (loại bút toán + module được ghi nhận + trần mỗi giao dịch), `refId` chống trùng; module không tự tạo tiền | Module lỗi không trừ quá trần, không trừ trùng, không ghi doanh thu cho module khác |
| C4 | **Hook an toàn**: dịch vụ chính báo Loyalty với trần gas + `try/catch`; lỗi thì phát sự kiện để chạy bù | Loyalty chết, khách vẫn chơi và ăn; điểm được bù sau |
| C5 | Mỗi contract một namespace storage; chạm lõi chỉ qua hàm công khai có kiểm quyền | IQR lỗi không sửa được số dư hay quyền |
| C6 | Nâng cấp / quay lui riêng từng module | Bản NET lỗi → trỏ proxy NET về bản cũ |
| C7 | Tiền (xu chính) và tài khoản của khách nằm ở T1/T2, không ở module. Điểm thưởng là tài sản của Loyalty: Loyalty ngừng thì điểm đóng băng (chỉ đọc), không mất | Module ngừng hẳn → chỉ đọc, khách không mất tiền, không mất tài khoản |

**Test bắt buộc:** mỗi module có kịch bản "module X chết" (cố ý revert / tạm dừng) và kiểm phần còn lại chạy, invariant Ledger vẫn đúng.

## 6. Ba trụ cột xuyên tầng

1. **Module Contract** (ADR 0030): mỗi module đăng ký vào `Registry` một bản khai báo (mã, bit dịch vụ, module phụ thuộc, danh mục quyền, loại tài nguyên, hook, phiên bản). Vòng đời chung: *đăng ký → cho phép ở agent → bật ở chi nhánh → tạm dừng / ngừng hẳn (chỉ đọc)*.
2. **Mô hình quyền thống nhất** (ADR 0033): vai trò (chủ agent, Manager, Staff) dùng chung; quyền chi tiết tách theo module; Staff có quyền qua vị trí của phiên trực; mọi module chỉ gọi `Permission.can(branchId, account, moduleId, perm)`.
3. **Sự kiện là hợp đồng với bên ngoài**: chain giữ trạng thái đang sống; lịch sử, báo cáo, bảng công đi qua event có version + FullDB/indexer (`docs/05`). Ghi lịch sử không được làm rễ phụ thuộc vào thứ ngoài cây (ADR 0032).

## 7. Danh tính và uỷ quyền

- Một người = một **địa chỉ tài khoản** cố định trong `AgentUserRegistry`, kể cả nhân viên (không bắt nhân viên dùng ví). Đăng nhập bằng username + mật khẩu sinh ví ngầm (`docs/modules/core-user.md`).
- Vai trò (`AgentAccess`) cấp cho **địa chỉ tài khoản**.
- Ví đăng nhập, ví phiên, ví máy trạm đều quy về tài khoản qua `DelegateRegistry` trước khi hỏi quyền (nguyên tắc 7).
- Relayer (T4) trả gas hộ; chữ ký EIP-712 của tài khoản là nguồn quyền, relayer không có quyền nghiệp vụ.

## 8. Ngoài chain (T4)

| Thành phần | Vai trò | Ghi chú |
|---|---|---|
| FullDB (precompile `0x…0107`) | Lịch sử, hồ sơ, tìm kiếm | Chỉ đi qua `HistoryIndex` |
| Indexer | Báo cáo, bảng công, tổng hợp | Chưa có; hiện đọc FullDB trực tiếp |
| Relayer | Trả gas hộ cho khách/nhân viên | Cần ADR riêng (hạn mức theo agent, khoá tách quyền) |
| Frontend | `frontend/` pnpm: `packages/chain` (adapter ABI), `packages/ui`, `apps/platform`, `apps/agent`, `apps/cyber` | App chỉ gọi chain qua `packages/chain`; ABI sinh tự động |

## 9. Trạng thái quyết định

| ADR | Chủ đề | Trạng thái |
|---|---|---|
| 0020 | Mô hình tenant | **Chốt:** singleton đa tenant, khoá `agentId/branchId` (đã cài) |
| 0021 | Proxy và storage | **Chốt:** UUPS + ERC-7201, kiểm layout tự động (đã cài) |
| 0022 | Ledger | **Chốt:** một Ledger, số dư theo `(agent, khách)`, túi theo chi nhánh nạp (`docs/modules/core-ledger.md`) |
| 0023 | Phân quyền | **Chốt khác hướng ban đầu:** không dùng OZ `AccessManager`; `PlatformAccess` (tầng quản trị) + `AgentAccess` (tầng agent) + `Permission` (ADR 0033) |
| 0024 | Lịch sử và FullDB | **Chốt dùng FullDB** (`docs/05`); điểm lỗi khi ghi chuyển sang ADR 0032 |
| 0025 | Định dạng snapshot migration | **Hoãn** tới giai đoạn migration (Y5) |
| 0026 | Dữ liệu cá nhân | **Chốt một phần:** hồ sơ khách lưu rõ trong FullDB kind `users` theo yêu cầu người dùng (`docs/modules/core-user.md`); sinh trắc, GPS không lên chain |
| 0027 | Ví trả trước tách Loyalty | **Chốt:** xu chính ở Ledger (T2) |
| 0028 | Robot, MTDToken, RevenueManager, licence | Robot bỏ; licence sau; MTDToken, RevenueManager chưa trả lời |
| 0029 | Cây bốn tầng và tiêu chí đặt chỗ | **Chốt** (`docs/adr/0029-cay-bon-tang.md`) |
| 0030 | Module Contract và Registry | **Chốt**, đã cài (`docs/adr/0030-module-contract.md`, `docs/modules/kernel-registry.md`) |
| 0031 | Cô lập lỗi: cầu dao, tường lửa tiền, hook an toàn | **Chốt** (người dùng duyệt 2026-11-26) (`docs/adr/0031-co-lap-loi.md`) |
| 0032 | Ghi lịch sử không làm rễ phụ thuộc FullDB | **Đề xuất**, chờ đội chain trả lời (`docs/adr/0032-fulldb-trong-giao-dich.md`) |
| 0033 | Mô hình quyền: Permission + Duty | **Chốt hướng** (`docs/adr/0033-mo-hinh-quyen.md`) |
| 0034 | Thư mục theo tầng | **Chốt** (`docs/adr/0034-thu-muc-theo-tang.md`) |
| 0035 | Thao tác nhân viên trên tài khoản khách | **Chốt, đã cài** — phương án B, `CustomerDesk` (`docs/adr/0035-thao-tac-nhan-vien-tren-tai-khoan.md`) |

## 10. Nợ kiến trúc hiện có (đo 2026-11-26)

| # | Nợ | Vi phạm | Xử lý | Khi nào |
|---|---|---|---|---|
| N1 | ~~`ServiceMask` + hằng `SERVICE_*` trong nền tảng~~ | L2, Y2 | `Registry` (ADR 0030); `ServiceMask` xoá; `check_deps` L2 không còn ngoại lệ | **Xong** tuần 3 |
| N2 | ~~Bộ đếm Ledger cố định NET/IQR; `service` do poster tự khai~~ | L2, C3 | `moduleRollup` theo `moduleId`; dịch vụ lấy từ giấy phép poster | **Xong** tuần 3 |
| N3 | `Ledger` 23.158 B (trước 24.403 B) | L5 | Đã tách `LedgerRecorder`, `LedgerWallet` (library ngoài). Còn > 20 KB: tách bộ đếm sang library nếu thêm tính năng | Theo dõi |
| N4 | `AgentUserRegistry` 21.388 B (trước 24.180 B) | L5 | Đã bỏ thống kê (tuần 3), OTP sang `DelegateRegistry`, thao tác nhân viên sang `CustomerDesk` (tuần 4). Còn > 20 KB: theo dõi | Theo dõi |
| N5 | ~~`AgentUserRegistry` kiểm "Staff trở lên"~~ | ADR 0033, L1 | `CustomerDesk` kiểm `Permission.can()` (ADR 0035) | **Xong** tuần 4 |
| N11 | ~~Test bất biến Ledger chập chờn theo seed~~ | CI | Kịch bản `crossRefund` tràn số khi fuzzer truyền `uint256` max → lấy `b % 3` trước khi cộng; 6/6 seed xanh | **Xong** |
| N6 | Ghi FullDB nằm trong giao dịch chính, chưa rõ hành vi khi FullDB lỗi | Y1 | ADR 0032 | Chờ đội chain |
| N7 | `BranchRegistry` bắt buộc domain duy nhất cho mọi chi nhánh | Y2 (Enterprise nhiều văn phòng) | Cho phép chi nhánh không domain | Khi làm Enterprise |
| N8 | ~~`Ledger.setPoster` chưa có trần, chưa gắn module~~ | C3 | Giấy phép `(moduleId, kindsMask, maxAmount)` (ADR 0031) | **Xong** tuần 3 |
| N9 | ~~`docs/05`, `docs/06` còn đường dẫn `core/` cũ~~ | — | Đã sửa khi dời thư mục (ADR 0034) | **Xong** tuần 2 |
| N10 | `BranchRegistry` 20.956 B (> 20 KB sau khi thêm cầu dao) | L5 | Nếu thêm tính năng: tách hồ sơ/domain sang library ngoài | Theo dõi |

## 11. Checklist kiến trúc cho mọi task

Ghi vào file bàn giao (`tasks/`) và trả lời trước khi code:

1. Thay đổi này thuộc tầng nào? Contract nào, câu hỏi của contract có đổi không (L4)?
2. Nếu đặt dưới T3: đủ ba điều kiện L3 chưa, ADR nào?
3. Có chữ `NET`/`IQR`/`LOYALTY` hay tên module nào xuất hiện dưới T3 không (L2)?
4. Module này chết thì cái gì còn chạy? Có test "module chết" chưa (mục 5)?
5. Chạm tiền: đi qua Ledger, có `refId`, có trần, có invariant chưa?
6. Kích thước sau thay đổi? > 20 KB thì kế hoạch tách là gì (L5)?
7. Lịch sử/thống kê để ở đâu (L6, `docs/05`)?
8. Dữ liệu meta-iqr tương ứng chuyển sang được không (Y5)?
9. Nâng cấp tầng nào, ai duyệt (L7)?
