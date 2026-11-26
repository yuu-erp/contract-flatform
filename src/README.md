# src/

Mã contract theo **cây bốn tầng** (`docs/02-kien-truc.md`, ADR 0034). Mô tả chi tiết từng thư mục, mục đích và luật phụ thuộc: **`docs/06-cau-truc-thu-muc.md`**.

| Thư mục | Tầng | Chứa gì |
|---|---|---|
| `kernel/` | T0 rễ | quản trị nền tảng, sổ địa chỉ + danh sách module, cổng lịch sử FullDB |
| `tenant/` | T1 thân | agent, chi nhánh, vai trò trong agent, tài khoản, uỷ quyền |
| `shared/` | T2 dùng chung | tiền (Ledger), thanh toán, quyền chi tiết, ca trực, tài nguyên |
| `modules/` | T3 lá | dịch vụ bật/tắt theo chi nhánh (NET, IQR, Loyalty…) |
| `libraries/` | — | logic thuần, không state |
| `interfaces/` | — | interface dùng chéo |

Phụ thuộc chỉ đi xuống (`modules` → `shared` → `tenant` → `kernel`); `kernel`, `tenant`, `shared` không biết tên module.
