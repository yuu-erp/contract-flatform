# storage-layouts/

Snapshot layout storage để chặn nâng cấp làm hỏng dữ liệu (nguyên tắc 9 trong `AGENTS.md`).

- Contract UUPS dùng ERC-7201 nên `forge inspect` của chính nó phải **rỗng** (dòng `impl`).
- Mỗi struct namespaced có một harness `test/layout/<Tên>Layout.sol` khai báo struct đó như biến thường; snapshot `<Tên>Layout.json` ghi (đường dẫn trường, slot, offset, kiểu).
- `python3 scripts/storage_layout.py check` (chạy trong CI): lỗi nếu trường cũ bị xoá, đổi tên, đổi chỗ hoặc đổi kiểu. Trường mới chỉ được thêm ở cuối struct.
- Chỉ chạy `snapshot` khi thêm struct mới hoặc sau khi review chấp nhận trường mới; commit snapshot cùng thay đổi.
