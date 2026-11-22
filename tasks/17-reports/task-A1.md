# Task A1 — Khung app `agent`, mock, chụp màn hình

**Ngày:** 2026-11-23  
**Trạng thái:** Hoàn thành

## Làm gì

- App mới `frontend/apps/agent` (Vite `base: /agent/`, port 5174, HashRouter, toast, `AppShell` “Meta Agent”).
- Mock: `PREVIEW_WALLETS` (4001 chủ A1, 3001 manager, 3002 chủ+manager, 3004 staff); thành viên CN1/4 manager, CN2 staff, CN5 manager dual; `agentIdOf`, `branchByDomain`, `effectiveRoleOf`, `branchesOfAccount`.
- `VITE_PREVIEW=mock`: `PreviewRoleMenu` (vai trò + ô domain), `resolvePreviewAccess` (chủ / manager / chọn CN / không quyền / domain lỗi).
- `read-domain.ts` + test Vitest; manager route overview dùng `BranchOverviewPanel`.
- `pnpm --filter agent shots` → `apps/agent/shots/*` (owner/manager routes; gate screens; 1440 sáng-tối, 390 sáng).

## Kiểm tra

```text
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
pnpm --filter agent shots
```

## Ghi chú

- Vai trò on-chain thật (`resolveAgentAccess`) để Task A2; preview dùng bảng giả lập trong `preview-access.ts`.