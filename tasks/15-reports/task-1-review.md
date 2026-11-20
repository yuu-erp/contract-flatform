# Review Task 1 — Workspace + `packages/chain`

Người review: Claude Code · 2026-11-20 · Commit: `e1979ce`
Kết luận: **Cần sửa trước khi làm Task 2** (3 điểm Quan trọng). Sửa trong một commit `fix(frontend): ...`, ghi báo cáo sửa vào cuối `task-1.md`.

Đã chạy lại: `pnpm install --frozen-lockfile && pnpm -r build && pnpm -r lint && pnpm -r test` → xanh (10/10 test).

## Làm tốt

- Workspace gọn: `packages/*`, `apps/*`; ABI import trực tiếp từ `abi/` ở gốc repo, không chép tay.
- `decode.ts` khớp đúng struct Solidity (`LedgerRecord` 17 trường, `portions`, `BranchProfileRecord`, `AgentProfileRecord`, `PlatformAuditRecord`). Có test round-trip bằng `encodeAbiParameters`.
- `parsePlatformDeployments` báo đúng tên khoá thiếu (`ledgerProxy`).
- `decodeContractError` dò cả selector 4 byte lẫn tên lỗi, nhận diện người dùng huỷ ký.
- Sinh wrapper bằng script từ ABI giúp không sót hàm khi ABI đổi.

## Quan trọng (phải sửa)

### 1. Gói `chain` kéo `node:fs` vào trình duyệt
`src/config/loadAddresses.ts` import `node:fs`, `node:path`, `node:url` ở đầu file, và `src/index.ts` export lại file này. Hai app Vite import `@meta-platform/chain` sẽ kéo module Node vào bundle: Vite externalize và gọi tới sẽ lỗi lúc chạy.

Sửa:
- Tách phần đọc file sang `src/config/loadAddresses.node.ts` (chỉ test/script dùng, **không** export từ `index.ts`).
- `index.ts` chỉ export `parsePlatformDeployments(data)` và `loadAddresses(chainId, data)` bắt buộc có `data` (app tự lấy bằng `import.meta.glob('../../../../deployments/platform-*.json', { eager: true })`).
- Thêm test: không file nào trong `src/` (trừ `*.node.ts`) chứa chuỗi `node:` (đọc file bằng `fs` trong test là được).

### 2. Wrapper chưa chuẩn hoá kiểu (kế hoạch Task 1, mục Produces)
Mọi hàm sinh ra nhận `unknown` và trả `unknown`. Kế hoạch yêu cầu kiểu đã chuẩn hoá: `number` cho id/uint nhỏ, `bigint` cho tiền và `uint256[32]`, struct có tên trường. Nếu để vậy, Task 2–8 sẽ tự giải tuple ở nhiều chỗ, dễ lệch.

Sửa: giữ wrapper sinh tự động làm lớp thô, thêm lớp có kiểu `src/api/` (viết tay, chỉ cho hàm app dùng), dùng `normalize.ts`:

| Hàm | Kiểu trả về |
|---|---|
| `AgentRegistry.getAgent` | `AgentView {id, owner, pendingOwner, status, createdAt, updatedAt, profileDocId: bigint, allowedServices}` |
| `AgentRegistry.getAgentProfile` | `AgentProfileRecord` |
| `BranchRegistry.getBranch` | `BranchView {id, agentId, status, services, isMain, tzOffsetMinutes, domainHash, createdAt, updatedAt, profileDocId}` |
| `AgentAccess.membersOf` | `MemberView[] {account, role, grantedBy, grantedAt}` |
| `AgentAccess.branchesOfAccount` | `number[]` |
| `Ledger.rollup` | `bigint[][]` (mỗi phần tử dài 32) |
| `Ledger.bucketsOf` / `portionsOf` | `{branchId: number, amount: bigint}[]` |
| `Ledger.entryOf` | `LedgerEntry {kind, method, service, taxBps, branchId, customer, amount: bigint, refunded: bigint}` |
| `Ledger.balanceOf`, `walletLiability` | `bigint` |
| `SalesSettings.quoteTax` | `{bps, exclusive, tax: bigint, total: bigint}` |
| `SalesSettings.branchTaxOf` | `{isSet, bps}` |
| `PlatformAccess.platformAdmins` | `string[]` |

Đầu vào: chuyển như web-admin mẫu yêu cầu (mã cũ trong `web/` truyền `uint` dạng `String(n)`). Ghi rõ quy ước trong báo cáo.
Test: mỗi hàm trên với **cả hai dạng** SDK có thể trả (mảng theo thứ tự ABI và object theo tên), riêng `rollup` kiểm `bigint` không mất chính xác với `2n**100n`.

### 3. Thiếu thông báo lỗi tiếng Việt cho nhiều lỗi sẽ gặp thường xuyên
`MESSAGES` chưa có các lỗi sau, nên người dùng sẽ thấy hex hoặc tên lỗi:
- `AgentAccess`: `NotAuthorized`, `RoleUnchanged`, `NotMember`, `InvalidRole`, `AccountIsAgentOwner`, `AccountIsPlatformRole`, `TooManyMembers`, `TooManyBranches`, `MissingRole`.
- `PlatformAccess`: `AccountHasAgentRole`, `AlreadyAdmin`, `NotAdmin`, `OwnerCannotBeAdmin`, `TooManyAdmins`, `TooManyRoleSources`, `RenounceDisabled`.
- `AgentRegistry`: `OwnerIsAgentMember`, `NotPendingOwner`, `NoPendingOwner`, `AlreadyMainBranch` (BranchRegistry).
- `SalesSettings`: `NotAgentOwner`.

Đồng thời: `messageFromText` dò tên bằng `includes` theo thứ tự object, nên `InvalidService` có thể khớp nhầm trong chuỗi `InvalidServices` nếu thứ tự đổi. Dò tên dài trước (sắp theo độ dài giảm dần) hoặc khớp theo ranh giới từ.

Test: thêm `NotAuthorized`, `AccountHasAgentRole`, `OwnerIsAgentMember`, và chuỗi chứa `InvalidServices` phải ra thông báo của `InvalidServices`.

## Nhỏ (nên sửa)

4. `searchFullDB` truyền `bigint` cho `ranges.min/max` và `number` cho `sortSlot` thẳng vào SDK; `data` được coi là chuỗi hex. Cần xác nhận theo web-admin mẫu SDK nhận/trả kiểu gì (chuỗi số? hex? base64?) và ghi vào báo cáo. Nếu SDK trả `bytes` dạng khác hex, chuẩn hoá về hex trước khi giải mã.
5. `termAgent` dùng prefix `G` — đây là nhãn agent **trong nhật ký audit**, không phải nhãn tự động `A` của `HistoryIndex`. Đổi tên thành `termAuditAgent` hoặc thêm NatSpec để Task 6/8 không dùng nhầm cho `ledger`.
6. Phiên bản: `typescript ~5.7`, `vitest ^3` trong khi web cũ dùng TS 6, Vitest 4. Chấp nhận, nhưng hai app phải dùng cùng phiên bản với `packages/*`.
7. Báo cáo chưa có bằng chứng bước đỏ (TDD). Từ Task 2: dán đoạn output lúc test đỏ.

## Trả lời câu hỏi mở

- **Hook ví / `FinsdkProvider`:** hook ví (`useActiveWallet`, `useConnectWallet`) và `useContracts` đặt ở `packages/chain/src/react/` (Task 2), khai báo `react`, `@tanstack/react-query`, `@metanodejs/fiai-sdk` là `peerDependencies`. `FinsdkProvider` đặt ở `packages/ui` (Task 3). App chỉ ghép lại.
- **`@metanodejs/fiai-sdk`:** đường dẫn local trong `web/package.json` cũ là `/Users/lekhaihoan/Documents/CONG_TY/metanode-finsdk/packages/fiai-sdk`. Người dùng xác nhận lại nếu đã đổi; khai báo ở **app** (và peer ở `chain`), không đặt trong gói `chain` dạng dependency cứng.

## Việc tiếp theo

Sửa 1–3 (và 4–5 nếu kịp), chạy lại `pnpm -r build && pnpm -r lint && pnpm -r test`, commit `fix(frontend): tách loader Node, lớp gọi contract có kiểu, bổ sung thông báo lỗi`, cập nhật `task-1.md` phần "Sửa sau review", rồi báo để review lại trước khi sang Task 2.

## Review lại sau sửa (commit `b11687d`)

Kết luận: **Đạt.** Chạy lại `pnpm -r build && pnpm -r lint && pnpm -r test` → xanh (21/21).

- Điểm 1 — Đã sửa: `loadAddresses.ts` không còn module Node; `loadAddresses.node.ts` không export qua `index.ts`; có test quét `node:`.
- Điểm 2 — Đã sửa: lớp `src/api/` có kiểu, mapper chịu cả dạng mảng và object; `rollup` giữ `2n**100n`.
- Điểm 3 — Đã sửa: bổ sung lỗi, dò tên dài trước.
- Điểm 4, 5 — Đã sửa (`asHexData`, `termAuditAgent`).

Nhỏ, sửa khi làm Task 2: quy ước "uint gửi `String(n)`" chưa nhất quán — `LedgerApi.rollup` gửi `scope` dạng số, `SalesSettingsApi.quoteTax`/`branchTaxOf` gửi `service` dạng số. Đổi hết sang `String(...)` theo đúng quy ước đã ghi.
