# Task A4 — Nhân sự

**Trạng thái:** Hoàn thành  
**Ngày:** 2026-11-23

## Đã làm

- `/staff`: chủ chọn chi nhánh; manager khoá `branchId` domain.
- `allowed-staff-actions.ts` + 7 test theo ma trận §3.
- `StaffPage`: cấp/thăng/hạ/thu hồi/rời; `ConfirmDialog`; `useAppTx` + `decodeContractError` toast Việt.
- Mock: `grantRole` / `revokeRole` / `renounceRole`; thêm staff chi nhánh 1 cho shots.
- `AgentAccessApi` bổ sung write methods.

## Review A3 (4 điểm Nhỏ)

1. Chú giải biểu đồ: chữ muted + ô màu, thứ tự NET → IQR, nhãn "NET".
2. KPI "Dư nợ ví khách (hiện tại)".
3. Mock rollup chỉ sinh IQR khi `allowedServices` có bit IQR.
4. KPI chủ agent so sánh kỳ trước (`previousDayRange`).

## Kiểm tra

`pnpm -r build && pnpm lint && pnpm -r test && pnpm --filter agent shots` xanh (agent 13 test).