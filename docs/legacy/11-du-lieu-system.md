Trạng thái: khung (chưa điền) · Task: `tasks/00-3a-du-lieu-shared-system.md` · Nguồn: meta-iqr `68d1d3c`


# Từ điển dữ liệu — system

Contract: EnhancedAgentManagement (kế thừa AgentManagement), RevenueManager, StaffAgentStore, FreeGasStorage, BMFactory, BranchManagement, AttendanceSystem, HistoryTracking; MTDToken, BranchAuditTrail nếu xác nhận có deploy.

Mỗi contract một mục. Mỗi biến storage (trừ `__gap`) **một dòng**, theo đúng thứ tự trong `generated/state/<Contract>.md`. Số dòng bảng = số biến trong file state đó.

Cột:
- **Kiểu**: khoá → giá trị (struct thì liệt kê trường hoặc dẫn tới mục struct bên dưới).
- **Cách đọc**: tên getter view (kèm có phân trang không) / chỉ event (tên event) / chỉ storage (`getStorageAt` theo `layout/<C>.json`).
- **Tăng theo**: member, đơn, ngày, chi nhánh, … hoặc `cố định`.
- **Lớp**: A tiền/điểm · B dữ liệu chủ · C đang dở · D lịch sử/thống kê.
- **Vòng lặp**: hàm ghi nào lặp không trần qua biến này (dẫn nguồn), hoặc `—`.
- **Ghi chú**: PII, dư thừa (trùng biến khác), deprecated, chỉ phục vụ thống kê.

## <Contract>

Proxy: · Tạo bởi: · Phạm vi một instance: (toàn hệ / mỗi agent / mỗi chi nhánh)

| Slot | Biến | Kiểu | Thực thể | Cách đọc | Tăng theo | Lớp | Vòng lặp | Ghi chú |
|---|---|---|---|---|---|---|---|---|

### Struct

| Struct | Trường | Ghi chú |
|---|---|---|
