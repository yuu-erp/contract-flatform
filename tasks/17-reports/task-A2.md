# Task A2 — Xác định vai trò theo `?domain`

**Trạng thái:** Hoàn thành  
**Ngày:** 2026-11-23

## Đã làm

- `packages/chain/src/agent-access.ts`: `resolveAgentAccess`, type `AgentAccess`.
- `packages/chain/src/read-domain.ts`: `readDomainParam`, `withDomain` (app agent re-export).
- `packages/chain/src/react/hooks/use-agent-access.ts`: `useAgentAccess()` gọi mock/live contracts.
- `BranchRegistryApi.branchByDomain` trên API layer.
- App agent: gộp `AgentAppChrome`, xoá `preview-access.ts`, preview chỉ đổi ví; `AgentGate` link `<a href="?domain=">` + icon.
- Route guard: manager `/branches*` → `/`.
- Live path: `usePlatformContracts` + `ContractsProvider`.

## Test

- `packages/chain/test/agent-access.test.ts`: đủ 9 dòng bảng quy tắc + `readDomainParam` / `withDomain`.
- `pnpm -r build && pnpm -r lint && pnpm -r test` xanh.
- `pnpm --filter agent shots` chạy sau `playwright install chromium`.

## Review A0-A1 (cùng batch SDK)

- `@metanodejs/fiai-sdk` ^2.1.1 trên agent, platform, chain, ui peer.
- `frontend/scripts/check-deps.mjs` trong `pnpm lint`.