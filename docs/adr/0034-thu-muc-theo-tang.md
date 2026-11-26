# 0034. Thư mục theo tầng

- Trạng thái: **Chốt** (người dùng đồng ý 2026-11-26)
- Ngày: 2026-11-26
- Người duyệt: người dùng

## Bối cảnh

Hiện mọi khối nằm chung `src/core/`; nhìn đường dẫn không biết file thuộc tầng nào, và `check_deps.sh` không kiểm được luật tầng (ADR 0029). Repo mới có khoảng 9 contract, chưa có module dịch vụ: đây là lúc dời rẻ nhất.

## Quyết định

```text
src/
├── kernel/      T0  access/ (PlatformAccess, PlatformAccessed), registry/, history/
├── tenant/      T1  agent/ (AgentRegistry), branch/ (BranchRegistry), access/ (AgentAccess),
│                    user/ (AgentUserRegistry), delegate/
├── shared/      T2  ledger/, payment/ (SalesSettings, PaymentAccounts), permission/, duty/, resource/
├── modules/     T3  net/, iqr/, loyalty/, (enterprise/)
├── migration/       công cụ tạm, ngoài cây
├── libraries/       logic thuần
└── interfaces/      interface dùng chéo (chia thư mục con theo tầng khi > 30 file)
```

`test/` theo cùng cấu trúc. Luật phụ thuộc (`check_deps.sh`):

| Thư mục | Không được import |
|---|---|
| `kernel/` | `tenant/`, `shared/`, `modules/`, `migration/` |
| `tenant/` | `shared/`, `modules/`, `migration/` |
| `shared/` | `modules/`, `migration/` |
| `modules/<a>/` | `modules/<b>/`, `migration/` |
| `libraries/` | mọi thứ trong `src/` |
| `interfaces/` | `kernel/`, `tenant/`, `shared/`, `modules/`, `migration/` |

Thêm kiểm L2: grep hằng/tên dịch vụ (`SERVICE_NET`, `SERVICE_IQR`, `SERVICE_LOYALTY`, `ServiceMask.NET`…) trong `kernel/`, `tenant/`, `shared/`, `libraries/` → lỗi. Giai đoạn chuyển tiếp: danh sách ngoại lệ có hạn, ghi rõ nợ N1/N2, xoá khi xử lý xong.

## Ảnh hưởng chain

**Không có.** Vị trí storage tính từ chuỗi namespace ERC-7201 (`metaplatform.core.ledger`…), không từ đường dẫn file; giữ nguyên chuỗi namespace cũ. Proxy đã deploy giữ địa chỉ; ABI không đổi. Chỉ đổi: đường dẫn import, script deploy/upgrade (tên artifact `src/...:Contract`), `storage-layouts/contracts.txt`, Makefile, tài liệu.

## Hệ quả

- Làm ở Baseline tuần 2, một commit riêng chỉ dời file (không sửa logic), `make ci` xanh trước và sau.
- `docs/05`, `docs/06`, `docs/07`, `docs/modules/*` sửa đường dẫn cùng lúc (nợ N9).
- Tên file đặc tả mới theo tầng: `kernel-*.md`, `tenant-*.md`, `shared-*.md`, `<module>.md`. File cũ `core-*.md` giữ tên tới khi sửa tới.
