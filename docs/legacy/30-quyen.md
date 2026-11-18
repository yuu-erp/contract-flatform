Trạng thái: khung (chưa điền) · Task: `tasks/00-5-quyen.md` · Nguồn: meta-iqr `68d1d3c`


# 30. Quyền hệ cũ

## Vai trò

| Vai trò | Lưu ở đâu (`Contract.biến`) | Ai cấp | Phạm vi (toàn hệ / agent / chi nhánh) |
|---|---|---|---|

## Module được uỷ quyền (contract gọi contract)

| Cờ / danh sách | Contract | Cho phép làm gì | Ai bật |
|---|---|---|---|

## Ma trận vai trò × hàm ghi

Mỗi hàm ghi (không view/pure) của contract đang deploy một dòng. Ô: ✓ được gọi · — không · `điều kiện` nếu có thêm điều kiện.

| Contract.hàm | Modifier / kiểm tra (file:dòng) | system owner | super admin | agent admin | co-owner | branch manager | staff (vai) | module | khách | ⚠️ phạm vi |
|---|---|---|---|---|---|---|---|---|---|---|

Cột ⚠️: đánh dấu khi quyền kiểm theo chi nhánh nhưng hàm tác động phạm vi rộng hơn (agent, toàn hệ, chi nhánh khác).
