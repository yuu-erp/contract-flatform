# meta-platform

Hệ thống smart contract thế hệ mới cho **nền tảng cho thuê dịch vụ vận hành cửa hàng**. Đây là bản xây lại từ đầu của `repos/contract/meta-iqr`. Sau khi hệ mới được test xong, dữ liệu từ meta-iqr sẽ được chuyển sang.

> **Agent mới vào đọc theo thứ tự:** `AGENTS.md` → file này → `docs/01-nghiep-vu.md` → `docs/02-kien-truc.md` → `docs/04-lo-trinh.md` (tìm task đang mở) → file task trong `tasks/`.

## Hệ thống làm gì

Chủ cửa hàng (gọi là **agent**) thuê dịch vụ của nền tảng để vận hành một hoặc nhiều **chi nhánh**. Mỗi chi nhánh bật những dịch vụ mình cần:

| Dịch vụ | Loại | Dùng cho |
|---|---|---|
| **NetCafe (NET)** | Dịch vụ chính | Vận hành tiệm net: tài khoản khách, máy trạm và bảng giá, phiên chơi, nạp tiền, trừ tiền theo thời gian |
| **IQR** | Dịch vụ chính | Nhà hàng/quán: thực đơn, gọi món bằng QR, đơn hàng, thanh toán, giảm giá, đặt bàn |
| **Loyalty** | **Module bổ trợ** | Điểm thưởng, hạng thành viên, chiến dịch, voucher đổi điểm. **Không dùng riêng**: phải gắn vào ít nhất một dịch vụ chính trên cùng chi nhánh |

Tổ hợp hợp lệ trên một chi nhánh:

| Tổ hợp | Ví dụ |
|---|---|
| NET | Tiệm net cơ bản |
| NET + Loyalty | Tiệm net có tích điểm cho khách chơi/nạp tiền |
| IQR | Nhà hàng cơ bản |
| IQR + Loyalty | Nhà hàng có tích điểm cho hoá đơn |
| NET + IQR | Tiệm net có bán đồ ăn (gọi món từ máy trạm) |
| NET + IQR + Loyalty | Tích điểm chung cho cả giờ chơi và đồ ăn |
| ~~Loyalty~~ | **Không hợp lệ** |

Lưu ý: khác với tài liệu cũ `meta-iqr/PROJECT_ARCHITECTURE_README.md` (cho phép "Chỉ Loyalty"), quy tắc mới là Loyalty luôn đi kèm dịch vụ chính.

## Các bên tham gia

| Vai | Là ai | Làm gì |
|---|---|---|
| Platform operator | Chủ nền tảng (chúng ta) | Deploy, nâng cấp, tạo agent, cấp licence, cấu hình dịch vụ |
| Agent owner | Chủ cửa hàng thuê dịch vụ | Toàn quyền nghiệp vụ trên mọi chi nhánh của mình |
| Co-owner / Branch manager | Người được agent uỷ quyền | Quyền trong phạm vi chi nhánh được giao |
| Staff | Nhân viên chi nhánh | Thao tác nghiệp vụ theo vai (thu ngân, phục vụ, kỹ thuật…) |
| Customer / Member | Khách của cửa hàng | Chơi net, gọi món, nạp tiền, tích và tiêu điểm |
| Station / Session wallet | Ví tạm trên máy trạm NET | Thay mặt khách trong một phiên chơi (uỷ quyền có thời hạn) |

## Client đang dùng hệ thống

- `repos/fe/metanode-cyber-game`: các app web (quản trị agent/chi nhánh, app khách, launcher). ABI nằm trong `packages/*-contracts`.
- `repos/cpp-qt/qt-core`: MeOS shell trên máy trạm, sidebar NET đọc phiên, giá máy, số dư.
- `repos/cpp-qt/qt-widget`: widget chạy trong shell.
- Chain: MVM (Metanode), có precompile FullDB tại `0x…0107` và cơ chế FreeGas (miễn phí gas cho contract đã đăng ký).

## Trạng thái

Đang ở giai đoạn 0 (kiểm kê hệ cũ, `docs/legacy/`). Đã có khung Foundry (chưa có contract nghiệp vụ: chờ ADR GĐ1). Lộ trình và task: `docs/04-lo-trinh.md`.

## Lệnh

```bash
git submodule update --init --recursive   # lần đầu
make ci                 # fmt, build, sizes, deps, layout, test, gas snapshot
make legacy-inventory   # sinh dữ liệu thô kiểm kê meta-iqr vào docs/legacy/generated/

# Trang thử vai trò (cần ví MetaNode để đăng nhập)
cd web && pnpm install && pnpm dev
# http://localhost:5173/platform-test/  — chain mặc định 991, đổi bằng VITE_CHAIN_ID=… pnpm dev
```

| Thư mục | Nội dung |
|---|---|
| `src/` | contract: `core/` (luôn có: vận hành, quyền, tenant, ledger, FullDB, nhân viên, tài nguyên, thanh toán), `modules/{net,iqr,loyalty}` (dịch vụ bật/tắt), `libraries/`, `interfaces/` — chi tiết `docs/06-cau-truc-thu-muc.md` |
| `test/` | soi gương `src/` (`core/`, `modules/<m>/`, `libraries/`) + `utils/BaseTest.sol`, `layout/`, `invariant/` |
| `storage-layouts/` | snapshot layout + `scripts/storage_layout.py` kiểm append-only |
| `scripts/` | `check_deps.sh` (hướng phụ thuộc), `legacy/` (kiểm kê hệ cũ) |

Phụ thuộc: `forge-std` v1.16.2, `openzeppelin-contracts-upgradeable` v5.6.1 (kèm `openzeppelin-contracts`), solc 0.8.28, `evm_version = cancun` (chờ câu hỏi mở số 4).

## Tài liệu

| File | Nội dung |
|---|---|
| `AGENTS.md` | Quy tắc cho agent làm việc trong repo này |
| `docs/01-nghiep-vu.md` | Nghiệp vụ từng dịch vụ, thực thể dữ liệu, luồng tiền |
| `docs/02-kien-truc.md` | Nguyên tắc thiết kế, kiến trúc đích, quyết định còn mở |
| `docs/03-chuyen-du-lieu.md` | Cách chuyển dữ liệu từ meta-iqr sang |
| `docs/04-lo-trinh.md` | Giai đoạn, task, trạng thái |
| `docs/05-luu-tru-du-lieu.md` | Dữ liệu nào ở storage, dữ liệu nào ở FullDB |
| `docs/06-cau-truc-thu-muc.md` | Từng thư mục làm gì, mục đích, luật phụ thuộc |
| `docs/modules/` | Đặc tả từng khối (bắt đầu: `core-operator.md`) |
| `tasks/` | File bàn giao chi tiết từng task |
| `documents/decisions/0005-…` (ở gốc workspace) | ADR chọn hướng xây hệ mới song song |
