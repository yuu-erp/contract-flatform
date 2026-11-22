# Báo cáo Task 5 — Chi tiết agent và chi nhánh

## Đã làm

- `forge fmt` cho `script/SeedMockAgents.s.sol`, `script/DeployMockFullDB.s.sol` (theo review Task 4 §Review lại).
- Route `/agents/:agentId` (7 tab query `?tab=`) và `/branches/:branchId` (6 tab).
- Tái sử dụng **`AgentManageDialog` từ commit `867643e`** trên tab Hồ sơ agent (sửa/dừng/mở/xoá); thêm `ProposeOwnerDialog`, `CreateBranchDialog`, `BranchManageDialog`.
- Owner xem được mọi tab; ghi qua `usePlatformWrite` + `AdminOnlyNote` («Chỉ Admin») khi không phải `PLATFORM_ADMIN` hoặc pause.
- `packages/chain`: mở rộng API Branch/Agent/Sales (`proposeAgentOwner`, CRUD chi nhánh, `getBranchProfile`, đọc thuế/PT).
- Test Vitest mới: `ledger-display` (kind Adjust method 1/2), `wallet-buckets` (giữ thứ tự túi).

## TDD — output lúc đỏ

```
 FAIL  test/ledger-display.test.ts
 FAIL  test/wallet-buckets.test.ts
Cannot find module '../src/lib/ledger-display'
```

## Lệnh kiểm tra

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
```

```
packages/chain: 32 passed
packages/ui: 9 passed
platform: 10 passed (ledger-display 2, wallet-buckets 1, + Task 4 tests)
```

```bash
make ci
```

```
fmt (2 script + DeployPlatform test đã format), build, sizes, layout, forge test, snapshot — xanh; `scripts/check_deps.sh` bị chặn trong sandbox Cursor nhưng `bash scripts/check_deps.sh` → ok trên máy dev
```

## Màn hình

| Route | Tab |
|---|---|
| `/agents/:id` | Tổng quan, Chi nhánh, Hồ sơ & cấu hình, Thuế & TT, Ví khách, Giao dịch, Nhật ký |
| `/branches/:id` | Tổng quan (múi giờ chi nhánh + servedHere), Thông tin (ghi Admin), Thành viên, Thuế & TT, Giao dịch, Nhật ký |

## Ghi chú

- `AgentManageDialog` / hành động agent đã có từ `867643e`; Task 5 gắn vào trang chi tiết thay vì chỉ danh sách.
- Task 6: `/system` và `/audit` toàn hệ vẫn placeholder SystemPage / audit list (một phần UI pause đã có từ `867643e`).

## Sửa sau review (`task-5-review.md`)

1. Phân trang 0-based: `useState(0)`, `paginateAgents` + `pageOffset`, test `pagination.test.ts`; `AgentsPage` đồng bộ.
2. `mapAgentTaxBps` / `agentTaxOf` trả `uint16`; test chain mapper; tab Thuế hiển thị `formatBps` đúng.
3. `validate-create-branch`: domain, SĐT, longlat, ServiceMask + `allowedServices` agent; test 3 case; `BranchManageDialog` dùng chung.
4. **Dời Task 8:** bộ lọc giao dịch (loại, khách, ngày) và chi tiết bút toán — làm chung app `agent`.
5. Tab Ví khách: kiểm `0x`+40 hex, dư nợ tổng `walletLiability`, cột tên chi nhánh.

```bash
cd frontend && pnpm -r build && pnpm -r lint && pnpm -r test
```

```
packages/chain: 33 passed (thêm mapAgentTaxBps)
packages/ui: 9 passed
platform: 15 passed (pagination 2, validate-create-branch 3)
```