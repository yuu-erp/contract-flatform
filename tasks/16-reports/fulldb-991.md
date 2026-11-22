# Chẩn đoán HistoryIndex.search (FullDB) — chain 991

Ngày: 2026-11-23. Chỉ đọc RPC; không gửi giao dịch; không sửa contract.

Deployments: `deployments/platform-991.json`  
`H=0x6139b4e1aA807b4787a50233D968281a46Cf2162` · `B=0x2111e2e4FEcD570370E779E8B7930Ccaa5ad902e` · `A=0x24F09E3a2Ed1D260b46DE91F95FA368b8DD05e2e`

---

## Bước 1 — cấu hình

| Lệnh | Output (rút gọn) | Nhận xét |
|------|------------------|----------|
| `cast call $H "fullDB()(address)" --rpc-url $RPC_URL` | `0xCCc63a17F863471301d5e03aa4DdB5a0a5d96d5c` | chạy được |
| `cast code <fullDB> … \| head -c 20` | `0x608060405234801561` | chạy được (có bytecode) |
| `cast call $A "agentCount()(uint64)"` | `101` | chạy được |
| `cast call $B "branchCount()(uint64)"` | `1` | chạy được |
| `cast call $H "dbName(uint64,string)(string)" 1 platform_branches` | `"mp1_platform_branches_1"` | chạy được |
| `cast call $H "dbName(uint64,string)(string)" 101 platform_branches` | `"mp1_platform_branches_101"` | chạy được |

---

## Bước 2 — đọc document (không search)

| Lệnh | Output (rút gọn) | Nhận xét |
|------|------------------|----------|
| `cast call $B "getBranch(uint64)(…)" 1` | `(1, 101, 1, 7, true, 420, 0x245bbb…, …, profileDocId=1)` | chạy được — branch **#1** thuộc agent **101** |
| `cast call $H "get(uint64,string,uint256)(bytes)" 101 platform_branches 1` | hex ABI `BranchProfileRecord` (domain `yuucyberking.net`, tên có dấu) | chạy được — khớp FullDB agent-scoped DB |
| `cast call $B "getBranchProfile(uint64)" 1` | cùng payload bytes | chạy được |

---

## Bước 3 — `search` qua cast

**Chú ý chữ ký:** `SIG` trong task với **hai bộ ngoặc** return `((…))((uint256,…))` khi decode output đôi khi báo `buffer overrun` (cast 1.x).  
Gọi **không** khai báo return tuple vẫn trả raw hex; gọi với `SIG` đầy đủ decode được `(total, docIds, data)`.

### Cùng SIG task (khi decode OK)

| Lệnh | Output (rút gọn) | Nhận xét |
|------|------------------|----------|
| `search 101 platform_branches ([],[],-1,false,0,10)` | `(1, [1], [0x…profile…])` | **chạy được**, total=1 |
| `search 101 platform_branches ([],[],0,false,0,10)` | `(1, [1], [0x…])` | **chạy được**, total=1 |
| `search 101 platform_branches ([(B,1)],[],-1,false,0,10)` | `(1, [1], [0x…])` | **chạy được**, total=1 |
| `search 0 platform_audit ([],[],0,false,0,5)` | `(104, [104,103,102,101,6], [5×bytes])` | **chạy được**, total=104 |
| `search 0 platform_agents ([],[],0,false,0,5)` | `(101, [101,6,7,8,9], [5×bytes])` | **chạy được**, total=101 |

### Gọi kiểu `cast call …` không khai return (raw hex)

Với `search(uint64,string,(tuple…))` (một lần ngoặc):

- `101` / `platform_branches` / sort -1 hoặc 0: raw hex có `total=1`, `docIds=[1]`.
- Lần thử đầu với SIG task **double-return** decode lỗi → **không phải revert on-chain**, lỗi decode cast cục bộ.

### Tham chiếu viem `readContract` (cùng RPC, cùng ABI)

| Truy vấn | total | docIds | Nhận xét |
|----------|-------|--------|----------|
| 101 / platform_branches / sort -1 | 1 | [1] | khớp cast |
| 101 / platform_branches / sort 0 | 1 | [1] | khớp cast |
| 101 / B=1 | 1 | [1] | khớp cast |
| 0 / platform_audit / limit 5 | 104 | 5 id đầu | khớp cast |
| 0 / platform_agents / limit 5 | 101 | 5 id đầu | khớp cast |

**Kết luận bước 3:** FullDB + `HistoryIndex.search` trên chain **trả đúng dữ liệu** (kể cả `mp1_platform_branches_101`). Không có `total=0` cho agent 101 khi gọi đúng `agentId=101`.

---

## Bước 4 — SDK web (`HistoryIndexContract.search` như app)

Script tạm: `RUN_CHAIN_INTEGRATION=1 vitest … test/diag-sdk-991.test.ts --environment jsdom` (file đã xóa sau chạy, **không commit**).

| Truy vấn | Kết quả SDK | Nhận xét |
|----------|-------------|----------|
| Mọi query (101/branches, 0/audit, 0/agents, String và number `agentId`) | **ERROR:** `No frame found for action: sendTransaction` | Không chạy được **ngoài trình duyệt có ví** — FiaiSDK cần host frame; Node/jsdom không có extension. |

Log trước lỗi (stdout): SDK build calldata đúng — ví dụ `agentId.value: '101'`, `kind: platform_branches`, `sortSlot: '-1'`.

**Trên app thật (Chrome + ví đã chọn):** `search` đi qua cùng stack `@metanodejs/mtn-contract` + `feeType: 'read'`. Vấn đề UI từng gặp (tab Chi nhánh / audit trống) **không** do `total=0` on-chain mà do **phía web**:

1. `history.search(agentId, …)` gửi `agentId` kiểu number thay vì `String(agentId)` (quy ước SDK khác `getBranch`/`branchCountOf`).
2. `searchFullDB` parse `Page` nếu SDK trả tuple/bọc `page` — đã bổ sung `parseHistorySearchPage`.
3. `decodeBranchProfileRecord` trên bytes lỗi → React Query fail im lặng → bảng trống (đã chuyển listing chi nhánh sang `listAgentBranches` đọc registry).

---

## Kết luận

| Phương án | Đánh giá |
|-----------|----------|
| **(a) FullDB trên chain** | **Loại trừ** — `get`/`search` cast & viem đều có doc branch agent 101; bytecode FullDB tồn tại. |
| **(b) HistoryIndex contract** | **Loại trừ** — `search(101, "platform_branches", …)` trả `total=1`, `docIds=[1]`; audit/agents scope `0` cũng có dữ liệu. |
| **(c) SDK / giải mã phía web** | **Đúng hướng** — Node không gọi được SDK; trên browser, lỗi hiển thị chủ yếu do **encoding agentId**, **parse Page**, và **xử lý lỗi decode**; không phải thiếu index on-chain. |

Khuyến nghị: giữ `String(agentId)` trong `searchFullDB`; listing chi nhánh/nhật ký ưu tiên registry hoặc test tích hợp có ví; cast nên dùng chữ ký return một lần hoặc `viem readContract` khi debug.