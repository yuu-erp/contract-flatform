# docs/legacy — Kiểm kê hệ cũ meta-iqr (GĐ0)

Mô tả hệ cũ tại `68d1d3c`, làm đầu vào cho thiết kế hệ mới (GĐ1) và extractor chuyển dữ liệu (GĐ3). Không mô tả hệ mới ở đây.

| File | Nội dung | Task |
|---|---|---|
| `00-danh-muc-contract.md` | mọi file `.sol` + trạng thái chính thức | `tasks/00-1-danh-muc-contract.md` |
| `01-abi-client.md` | hàm/event FE, qt-core, qt-widget gọi | `tasks/00-2-abi-client.md` |
| `10-du-lieu-shared.md` … `14-du-lieu-loyalty.md` | từ điển dữ liệu theo module | `tasks/00-3-*.md` |
| `20-luong-nghiep-vu.md` | luồng nghiệp vụ bằng chuỗi hàm thật | `tasks/00-4-luong-nghiep-vu.md` |
| `30-quyen.md` | ma trận vai trò × hàm ghi | `tasks/00-5-quyen.md` |
| `40-bat-bien-va-loi.md` | bất biến + lỗi đã biết | `tasks/00-6-bat-bien-va-doi-chieu.md` |
| `50-fulldb.md` | cơ chế FullDB, cách hệ cũ dùng, lỗi, đề xuất (Claude, 2026-11-18) | — |
| `layout/<Contract>.json` | storageLayout đầy đủ của contract đang deploy (sinh tự động) | — |
| `generated/` | dữ liệu thô sinh tự động, **không sửa tay** | — |

## Dữ liệu thô

```bash
cd repos/contract/meta-platform
make legacy-inventory                      # = python3 scripts/legacy/inventory.py
python3 scripts/legacy/inventory.py --rebuild   # build lại meta-iqr (~2–3 phút, via_ir)
```

Script chỉ đọc meta-iqr/FE/qt-core/qt-widget, build meta-iqr vào `cache/legacy-iqr/` của repo này (không ghi vào checkout meta-iqr), không đọc `.env`, không lấy địa chỉ từ `deployments/`.

| File sinh | Dùng cho |
|---|---|
| `generated/contracts.md` | 114 file `.sol`, khai báo, module, **trạng thái gợi ý**, script deploy, bytecode KB, số dòng |
| `generated/deployed.md` | 31 contract script deploy tạo ra, số biến storage, số hàm/event |
| `generated/state/<C>.md` | mọi biến storage (kể cả kế thừa) — nguồn đếm cho từ điển dữ liệu |
| `generated/abi/<C>.md` | mọi hàm (selector, đọc/ghi) và event |
| `generated/client-hits.md` | nơi client nhắc tên hàm/event (khớp chuỗi, phải xác minh tay) |

## Quy ước chung cho các file viết tay

- Mỗi khẳng định dẫn nguồn `đường-dẫn:dòng` (trong meta-iqr hoặc client).
- Không chép địa chỉ, khoá, RPC, dữ liệu khách thật.
- Chỗ chưa chắc ghi **[cần xác nhận]** kèm câu hỏi cụ thể; gom về `docs/04-lo-trinh.md` ở task 00-6.
- Lớp chuyển dữ liệu A/B/C/D theo `docs/03-chuyen-du-lieu.md` mục 1.
- Robot: **bỏ hẳn** khỏi hệ mới (người dùng, 2026-11-18) — chỉ có trong danh mục, không phân tích.
