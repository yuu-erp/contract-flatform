# TNN — <tên task>

> Mẫu file bàn giao. Chép thành `tasks/NN-<ten>.md`. Mục "Kiểm tra kiến trúc" **bắt buộc** điền trước khi code (`docs/02-kien-truc.md` mục 11); reviewer từ chối task thiếu mục này.

## Mục tiêu

## Kiểm tra kiến trúc

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Thuộc tầng nào (T0 kernel / T1 tenant / T2 shared / T3 module)? Contract nào; câu hỏi của contract có đổi không (L4)? | |
| 2 | Nếu đặt dưới T3: đủ ba điều kiện L3 (≥ 2 module cần ngay, trung lập nghiệp vụ, có ADR) chưa? ADR số mấy? | |
| 3 | Có tên module (`NET`/`IQR`/`LOYALTY`…) nào xuất hiện dưới T3 không (L2)? | |
| 4 | Module này chết thì cái gì còn chạy? Test "module chết" ở đâu? | |
| 5 | Chạm tiền: qua Ledger, có `refId`, có trần, có invariant? | |
| 6 | Kích thước contract sau thay đổi? > 20 KB thì kế hoạch tách (L5)? | |
| 7 | Lịch sử / thống kê để ở đâu (L6, `docs/05`)? | |
| 8 | Dữ liệu meta-iqr tương ứng chuyển sang được không (Y5)? | |
| 9 | Nâng cấp tầng nào, ai duyệt (L7)? | |

## Phạm vi (file được sửa)

## Các bước

## Tiêu chí xong

- [ ] `make ci` xanh (fmt, build, sizes, deps, layout, test, snapshot)
- [ ] Đặc tả `docs/modules/<khối>.md` cập nhật
- [ ] `docs/04-lo-trinh.md` cập nhật trạng thái
