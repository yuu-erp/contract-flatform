# Chẩn đoán 2 lỗi trên chain 991 (sau A4)

Người phân tích: Claude Code · 2026-11-23 · Trên commit `52b3466`

## Lỗi 2 — Cấp Manager thành công nhưng `/staff` hiện "Chưa có thành viên"

**Nguyên nhân (chắc chắn):** SDK trả kết quả hàm view có **một output có tên** dưới dạng object `{ <tên>: giá trị }`. `unwrapValue` chỉ bóc dạng `{ "": giá trị }`. ABI của `AgentAccess.membersOf` đặt tên output là `out` → SDK trả `{ out: [...] }` → `mapMembers` thấy không phải mảng → trả `[]` → bảng trống dù on-chain đã có Manager.

Bằng chứng trong mã: `mapBranchIdList` (cho `branchesOfAccount`, output cũng tên `out`) **đã** xử lý `.out`, và `mapAddressPage` đã xử lý `.page` — tức là đã gặp đúng hiện tượng này trước đó, nhưng chỉ vá từng hàm.

**Cùng lỗi, chưa ai thấy vì dữ liệu giả không bọc tên:** mọi hàm view một output có tên trong ABI:

| Contract.hàm | Tên output | Hậu quả trên chain thật |
|---|---|---|
| `AgentAccess.membersOf` | `out` | Nhân sự, tab Thành viên trống |
| `AgentAccess.branchesOfAccount` | `out` | (đã vá) |
| **`Ledger.rollup`** | `out` | **Mọi dashboard doanh thu ra 0** (nền tảng, agent, chi nhánh) |
| `Ledger.balanceOf` | `sum` | Số dư ví khách sai (0) |
| `PlatformAccess.agentRoleSources` | `out` | Danh sách nguồn vai trò trống |
| `PlatformAccess.platformAdmins` | `page` | (đã vá) |
| `HistoryIndex.search` | `page` | (đã vá bằng `parseHistorySearchPage`) |
| `AgentRegistry.requireAgentWritable` | `allowedServices` | nếu dùng |

**Sửa tận gốc (một chỗ):** trong `scripts/gen-contracts.mjs`, với hàm có **đúng một output** và output đó **có tên**, sinh mã bóc tên:
```ts
const result = await this.sendTransaction({ ... })
return unwrapNamed(result, 'out')   // tên lấy từ ABI
```
với `unwrapNamed(v, name)` trong `normalize.ts`: bóc `{ "": x }`, rồi nếu là object có khoá `name` thì trả `v[name]`, ngược lại trả nguyên. Chạy lại generator. Sau đó bỏ các vá riêng lẻ (`.out` trong `mapBranchIdList`, `.page` trong `mapAddressPage`, `page` trong `parseHistorySearchPage`) hoặc giữ cũng được.

**Dữ liệu giả phải bọc giống SDK:** `createMockContracts` hiện trả mảng trần, nên test và ảnh chụp không bắt được lỗi này. Sửa mock để các hàm view trả đúng hình dạng SDK (`{ out: [...] }`, `{ sum: x }`, `{ page: … }`) — hoặc tốt hơn, mock đi qua cùng lớp wrapper sinh tự động.

**Test bắt buộc:** với mỗi hàm trong bảng, mapper/wrapper nhận `{ <tên>: giá trị }` → ra đúng kiểu (`membersOf` → 1 `MemberView`; `rollup` → `bigint[][]` không rỗng; `balanceOf` → `bigint`).

## Lỗi 1 — `agents/102?tab=branches`: "Lỗi search FullDB: RPC Error (eth_call) [Code 3]: execution reverted"

**Nguyên nhân (rất có thể, cần xác nhận):** danh sách chi nhánh gọi `search` với `sortSlot` mặc định **`-1`** (`toSearchQuery`: `String(q.sortSlot ?? -1)`). Trong báo cáo chẩn đoán `fulldb-991.md`, lệnh `cast` với `-1` chạy được, nhưng **chưa từng gọi `search` qua SDK trong trình duyệt thành công** (bước 4 không chạy được ngoài trình duyệt). Nhật ký và giao dịch sổ dùng `sortSlot: 0`. Nghi vấn: SDK mã hoá số âm `int64 "-1"` sai (ví dụ thành số không dấu lớn) → `HistoryIndex.search` revert `InvalidSortSlot` (contract chặn `sortSlot < -1 || > 15`).

Các khả năng khác đã loại: DB chưa có (MockFullDB trả trang rỗng, không revert); `limit` > 100 (đang 100); `kind` sai (hằng `platform_branches`).

**Xác nhận (Cursor làm trên trình duyệt có ví):**
1. Ở tab Nhật ký của agent 102 (dùng `sortSlot 0`) — có dữ liệu không? Nếu có mà tab Chi nhánh lỗi → khớp giả thuyết.
2. Gọi tạm `searchFullDB(history, 102, 'platform_branches', { sortSlot: 0, limit: 100 })` → nếu hết revert là đúng.
3. In nguyên văn lỗi (kể cả `error.data`) — `decodeContractError` phải giải được selector `InvalidSortSlot()`; nếu không giải được, sửa để đọc `data` trong lỗi RPC Code 3.

**Sửa:** không bao giờ gửi `sortSlot` âm qua SDK — mặc định `0` (slot thời gian; mọi bản ghi `platform_branches`, `platform_agents`, `platform_audit`, `ledger` đều có slot 0); danh sách chi nhánh sắp `sortSlot 0, ascending true`. Thêm test `toSearchQuery({})` → `sortSlot: "0"`.

## Ghi chú review A4
Code `allowedStaffActions` + 7 test và build/test đều xanh trên container (agent 13 test). Không xác nhận được trên chain vì lỗi 2 làm bảng thành viên luôn trống — review lại A4 sau khi sửa.

---

## Xác nhận sau sửa (Cursor · 2026-11-23)

### Lỗi 1 — FullDB / `sortSlot`

| Kiểm tra | Kết quả |
|----------|---------|
| Trình duyệt tự động (localhost:5173/platform/agents/102?tab=branches) | **Chưa có ví Meta** — không gọi được SDK; cần ví thật để tái hiện lỗi UI. |
| Tab Nhật ký agent 102 (RPC `search` đúng chữ ký struct `Query`) | `platform_audit`, `sortSlot: 0`, `limit: 5` → **total = 0** (chưa có bản ghi audit cho agent 102 trên chain). |
| `platform_branches` agent 102, `sortSlot: -1` (mặc định cũ) qua `cast` + struct | **OK** — `total = 2` (docIds 1, 2; profile `khaihoan.vn`, `khaihoan2.net`). |
| Cùng truy vấn, `sortSlot: 0`, `ascending: true` | **OK** — cùng `total = 2`. |
| Lỗi UI trước sửa (user) | Nguyên văn: `RPC Error (eth_call) [Code 3]: execution reverted` (thường **không** kèm `data` trong message SDK; RPC có thể trả `data: "0x"` nếu selector không decode). |
| `decodeContractError({ code: 3, data: <InvalidSortSlot selector> })` | Unit test → `sortSlot FullDB không hợp lệ (0–15).` |
| Sửa code | `toSearchQuery({})` → `sortSlot: "0"`; `fetchAgentBranches` → `sortSlot: 0`, `ascending: true`. |

**Kết luận lỗi 1:** Trên RPC thuần, agent 102 **có** 2 chi nhánh; lỗi tab Chi nhánh trên app khả năng cao do **SDK mã hoá `sortSlot: "-1"`** (hoặc thiếu `data` khi revert), không phải DB trống. Sau sửa frontend luôn gửi `sortSlot ≥ 0` — cần user reload app **có ví** để xác nhận tab Chi nhánh hết banner dự phòng.

### Lỗi 2 — output có tên SDK

| Kiểm tra | Kết quả |
|----------|---------|
| `membersOf(2, 0, 20)` on-chain (branch chính agent 102) | **1 thành viên** — `role = 2` (Manager), account `0x2907…93f6`. |
| Generator + `unwrapNamed` | Contract wrapper bóc `{ out \| sum \| page }`; mock bọc cùng hình dạng; `named-sdk-outputs.test.ts` cover bảng hàm. |
| CI | `pnpm -r build`, `lint`, `pnpm -r test`, `pnpm --filter agent shots` — **xanh**. |

**Kết luận lỗi 2:** On-chain đã có Manager; sau sửa `membersOf` qua SDK phải hiện trên `/agent/…/staff` khi reload có ví và branch context đúng (branchId 2).
