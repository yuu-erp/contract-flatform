# ADR — hồ sơ quyết định kiến trúc

Mỗi quyết định lớn một file `NNNN-ten-ngan.md`. Track xây hệ mới dùng số `0020`–`0049` (`AGENTS.md`). ADR `0020`–`0028` được chốt gộp trong bảng `docs/02-kien-truc.md` mục 9; từ `0029` mỗi ADR một file.

## Mẫu

```markdown
# NNNN. Tiêu đề

- Trạng thái: Đề xuất | Chốt | Chờ người dùng duyệt | Thay bởi NNNN
- Ngày: YYYY-MM-DD
- Người duyệt: Claude (kỹ thuật thuần) | người dùng (chạm tiền, bảo mật, chi phí vận hành)

## Bối cảnh
## Quyết định
## Phương án đã cân nhắc
## Hệ quả
```

## Ai duyệt

- **Người dùng duyệt:** ADR chạm tiền, bảo mật, chi phí vận hành, và mọi nâng cấp T0/T1.
- **Claude duyệt:** ADR kỹ thuật thuần (cấu trúc thư mục, công cụ, quy ước code).

## Danh sách

| ADR | Chủ đề | Trạng thái |
|---|---|---|
| [0029](0029-cay-bon-tang.md) | Cây bốn tầng và tiêu chí đặt chỗ | Chốt |
| [0030](0030-module-contract.md) | Module Contract và Registry | Chốt, đã cài |
| [0031](0031-co-lap-loi.md) | Cô lập lỗi: cầu dao module, tường lửa tiền, hook an toàn | Chốt |
| [0032](0032-fulldb-trong-giao-dich.md) | Ghi lịch sử không làm rễ phụ thuộc FullDB | Đề xuất |
| [0033](0033-mo-hinh-quyen.md) | Mô hình quyền: Permission + Duty | Chốt, đã cài |
| [0034](0034-thu-muc-theo-tang.md) | Thư mục theo tầng | Chốt |
| [0035](0035-thao-tac-nhan-vien-tren-tai-khoan.md) | Thao tác nhân viên trên tài khoản khách (T1 không gọi lên T2) | Chốt, đã cài |
| [0036](0036-resource.md) | Resource: định danh thiết bị dùng chung | Chốt |
