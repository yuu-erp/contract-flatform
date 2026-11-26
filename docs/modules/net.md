# Module NET — phòng máy (`src/modules/net`)

Trạng thái: **Đã giao Cursor** (2026-11-26) — `tasks/18-net-module.md`. 6 câu mục 11 dùng giá trị đề xuất làm mặc định (bảng "Quyết định đã chốt" trong file task); người dùng đổi được trước review N2.
NET là **module mẫu**: module đầu tiên cắm vào nền tảng theo Module Contract (ADR 0030). Mục 3 đối chiếu từng nghĩa vụ; chỗ nào chuẩn chưa đủ ghi ở mục 4 và phải sửa **trước** khi code NET, không lách trong NET.

Kịch bản chuẩn phục vụ: `docs/09-kich-ban-chuan.md` bước 5, 6, 10, 13 và biến thể F1, F3, F4.

## 0. Kiểm tra kiến trúc (`docs/02` mục 11)

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Tầng, contract, câu hỏi | T3. `NetCatalog`: "máy nào thuộc khu nào, giá bao nhiêu lúc này?". `NetSessions`: "máy này đang có ai chơi, từ khi nào, đã tính tiền tới đâu?" |
| 2 | Dưới T3? | Không. Định danh máy trạm dùng `Resource` (T2) — xem F1 |
| 3 | Tên module dưới T3 | Không thêm. Nền tảng biết NET qua `Registry` (id 1) |
| 4 | NET chết thì sao | Ledger từ chối bút toán NET; IQR, Loyalty, nạp ví vẫn chạy; phiên đang chơi đóng băng, không tính tiền phần thời gian NET dừng (mục 6) |
| 5 | Chạm tiền | Chỉ `Ledger.walletSpend` / `refundSale` qua giấy phép module 1; số tiền do NET tự tính từ giờ chơi × giá, không nhận từ người gọi; `refId` duy nhất mỗi lần trừ; trần giấy phép |
| 6 | Kích thước | `NetCatalog` ~10 KB, `NetSessions` ~16 KB (ước) |
| 7 | Lịch sử / thống kê | Không bộ đếm dashboard on-chain (hệ cũ có hàng chục). Phiên đã đóng → FullDB kind `net_sessions` + event; doanh thu đọc `Ledger.moduleRollup(…, 1, …)` |
| 8 | Dữ liệu cũ | Mục 9 |
| 9 | Nâng cấp | T3: review thường; quay lui proxy riêng NET (C6) |

## 1. Phạm vi

**Có (MVP):** khu máy và giá theo khung giờ; máy trạm (trạng thái, bảo trì); phiên chơi trả trước bằng ví xu: mở, tính tiền định kỳ, đóng, chuyển máy, tự đóng khi hết tiền hoặc máy mất kết nối; hoàn tiền phiên (Manager); báo Loyalty khi đóng phiên.

**Không trong NET:**

| Việc | Ở đâu |
|---|---|
| Tài khoản khách, đăng nhập, OTP, QR | `AgentUserRegistry`, `DelegateRegistry` (T1) |
| Nạp tiền (quầy, chuyển khoản, nạp tại máy) | `PaymentAccounts` (T2) — chưa cài; MVP nạp qua thanh toán nền tảng |
| Ca, quyền nhân viên | `Duty`, `Permission` (T2) |
| Định danh, khoá ký của máy trạm | `Resource` (T2) — F1 |
| Điểm thưởng, dùng xu thưởng trả giờ chơi | Loyalty (T3) qua hook |
| Báo cáo, dashboard | Indexer / FullDB |

**Sau MVP (chốt riêng):** gói giờ (combo), đặt máy trước có cọc, giá theo hạng thành viên.

## 2. Khai báo module (Registry)

| Trường | Giá trị |
|---|---|
| `moduleId` | 1 (bit dịch vụ `1`) |
| `requiresAny` | 0 |
| `flags` | `FLAG_SALES \| FLAG_TAX_INCLUSIVE_ONLY` (giá giờ chơi luôn đã gồm thuế) |
| `contracts` | `NetCatalog`, `NetSessions` (`setModuleContract`) |
| Ledger | `NetSessions` có giấy phép: module 1, `WalletSpend \| SaleRefund`, trần mỗi bút toán (đề xuất 500.000 xu) |
| HistoryIndex | `NetSessions` ghi kind `net_sessions` (nhật ký) |

### Danh mục quyền NET (chốt khi duyệt đặc tả này)

| Bit | Quyền | Chỉ Manager |
|---|---|---|
| 0 | Mở máy cho khách (không cần khách ký) | |
| 1 | Tắt máy / đóng phiên hộ khách | |
| 2 | Chuyển máy | |
| 3 | Đặt máy trước / huỷ đặt | |
| 4 | Đưa máy vào / ra bảo trì | |
| 5 | Thêm, sửa máy và khu | ✔ |
| 6 | Sửa bảng giá | ✔ |
| 7 | Hoàn tiền phiên chơi | ✔ |

`permValid = 0xFF`, `permManagerOnly = 0xE0`. Cập nhật bằng `Registry.updateModule(1, …)` lúc cài NET; danh sách nháp trong UI cyber đổi theo.

## 3. Đối chiếu Module Contract (ADR 0030 mục 3)

| Nghĩa vụ | NET làm thế nào | Chuẩn đã đủ? |
|---|---|---|
| 1. Đầu mọi hàm ghi: `requireWritable(branch, 1)` + module Active | Gọi `BranchRegistry.requireWritable(branchId, 1)` (đã gồm cầu dao Registry) | ✅ |
| 2. Quyền người thao tác qua `Permission.can()` | Người gọi quy về tài khoản bằng `DelegateRegistry.resolve`, rồi `requirePermission(branch, actor, 1, bit)` | ✅ |
| 3. Tiền chỉ qua Ledger, giấy phép module | `walletSpend` / `refundSale`; không hàm nào nhận số tiền từ người gọi | ✅ |
| 4. Lịch sử qua `HistoryIndex`, kind có tiền tố module | `net_sessions` | ✅ (ADR 0032 chưa chốt cách xử lý khi FullDB lỗi) |
| 5. Báo module khác qua hook an toàn | `ILoyaltyHook.onSpend(...)` khi đóng phiên, trần gas + `try/catch` | ❌ **F2** — interface và cách gọi an toàn chưa có |
| 6. Đặc tả, unit test, invariant tiền, test "module chết", gas | File này + mục 8 | ✅ |
| (ngầm) Định danh thiết bị | Máy trạm ký `heartbeat` bằng khoá thiết bị | ❌ **F1** — `Resource` chưa có |
| (ngầm) Một chỗ khai báo "contract này thuộc module nào" | Hiện phải khai 2 nơi: `Registry.setModuleContract` và `Ledger.setPoster(moduleId…)` | ⚠️ **F3** |
| (ngầm) Quy trình cắm module | Chưa có script mẫu: deploy → `setModuleContract` → `updateModule` (quyền) → giấy phép Ledger → writer HistoryIndex | ⚠️ **F4** |

## 4. Lỗ hổng của chuẩn phát hiện khi làm mẫu (sửa trước khi code NET)

| # | Vấn đề | Đề xuất | Tầng | Duyệt |
|---|---|---|---|---|
| **F1** | Chưa có nơi giữ định danh máy trạm (và màn bếp IQR, máy chấm công Enterprise) | Cài `Resource` (T2, đã có trong bản đồ kiến trúc): `deviceId`, chi nhánh, `moduleId` sở hữu, `signer` (khoá máy), trạng thái Active / Disabled. NET chỉ giữ thuộc tính riêng (khu, số máy). Đủ điều kiện L3: NET + IQR + Enterprise cần | T2 | ADR mới 0036 |
| **F2** | Chưa có hook an toàn cho module bổ trợ | `interfaces/ILoyaltyHook.sol` + library `SafeHook` (gọi với trần gas, `try/catch`, phát `HookFailed`); địa chỉ hook đọc từ `Registry.addressOf("hook.loyalty")`, chỉ gọi khi Loyalty bật ở chi nhánh và Active | interfaces / libraries | ADR 0031 bổ sung |
| **F3** | Khai module của contract ở 2 nơi, có thể lệch | Ledger kiểm thêm `Registry.moduleOf(poster) == license.moduleId` khi ghi; lệch thì từ chối. Nâng cấp Ledger nhỏ | T2 | ADR 0031 bổ sung |
| **F4** | Chưa có quy trình cắm module | `script/DeployModule.s.sol` mẫu + mục "cắm module" trong `docs/07`; NET là lần chạy đầu | script | Claude |

## 5. Dữ liệu

### NetCatalog

| Đối tượng | Trường | Giới hạn |
|---|---|---|
| Khu | `zoneId`, `branchId`, tên, giá cơ bản / giờ, tối đa 4 khung giờ giá riêng `(phút bắt đầu, phút kết thúc, giá)`, trạng thái | ≤ 16 khu / chi nhánh |
| Máy trạm | `deviceId` (Resource) → `zoneId`, nhãn ("VIP-07"), trạng thái `Idle / Reserved / Maintenance` | ≤ 256 máy / chi nhánh |

### NetSessions

| Đối tượng | Trường (storage, chỉ khi đang mở) |
|---|---|
| Phiên | `sessionId`, `deviceId`, `account`, `startedAt`, `chargedUntil`, `lastBeat`, `charged` (tổng đã trừ), `seq` (số lần trừ) |
| Chỉ mục | `deviceId → sessionId`, `(agentId, account) → sessionId` (một phiên / máy, một phiên / khách / agent) |

Phiên đóng: xoá khỏi storage, ghi FullDB `net_sessions` (máy, khách, chi nhánh, thời lượng, tổng trừ, lý do đóng) + event `SessionClosed`.

## 6. Máy trạng thái phiên và tính tiền

```text
              startByCustomer / startByStaff
(máy Idle) ───────────────────────────────► Đang chơi ──heartbeat──► Đang chơi
                                              │
       stop (khách) / stopByStaff / hết tiền / mất kết nối / chuyển máy (đóng rồi mở máy mới)
                                              ▼
                                          Đã đóng (xoá storage, FullDB + event)
```

| Chuyển | Ai gọi | Kiểm |
|---|---|---|
| `startByCustomer(deviceId, account, deadline, sig)` | **khoá máy trạm** (Resource) | máy Idle, thuộc chi nhánh, NET bật; `sig` EIP-712 `PlayOn(deviceId, nonce, deadline)` của địa chỉ đăng nhập hoặc ví phiên của khách (resolve về `account`); khách chưa có phiên; số dư ≥ giá 1 phút |
| `startByStaff(deviceId, account)` | nhân viên quyền NET 0 | như trên, không cần khách ký (khách đứng ở quầy) |
| `heartbeat(deviceId)` | khoá máy trạm | tính tiền phần `[chargedUntil, now]`, **tối đa `MAX_CHUNK` = 10 phút mỗi lần**; thiếu tiền thì trừ phần đủ (làm tròn xuống phút) và đóng phiên "hết tiền" |
| `stop(deviceId)` | khoá máy trạm (khách đăng xuất) | tính phần cuối rồi đóng |
| `stopByStaff(deviceId)` | quyền NET 1 | tính phần cuối rồi đóng |
| `closeStale(deviceId)` | **ai cũng gọi được** | `now − lastBeat > STALE` (đề xuất 3 phút): đóng, chỉ tính tới `lastBeat + 1 phút` — máy treo không làm khách mất tiền |
| `move(fromDevice, toDevice)` | quyền NET 2 | đóng phiên cũ (tính tiền), mở phiên mới cùng khách, máy mới Idle |
| `refund(sessionRef, amount, reason)` | quyền NET 7 (chỉ Manager) | `Ledger.refundSale` trên bút toán gốc; trần = đã trừ |

**Tính tiền:**
- Đơn vị: **phút**, giá theo khu tại thời điểm tính; mỗi lần trừ `walletSpend` với `refId = keccak256(sessionId, seq)` → không trừ trùng.
- Giờ chơi chưa đủ phút cộng dồn sang lần sau (không làm tròn lên mỗi heartbeat).
- `MAX_CHUNK` bảo đảm: NET bị tạm dừng / máy mất mạng lâu thì **không** tính dồn quá 10 phút khi chạy lại.
- Thuế: Ledger tách theo thuế suất chi nhánh (giá đã gồm thuế).

**Gas (ngân sách):** `heartbeat` ≤ 150k (Ledger ghi + FullDB nhật ký chỉ khi đóng); `start*` ≤ 200k; `stop` ≤ 250k.

## 7. Cô lập lỗi

| Sự cố | Hành vi |
|---|---|
| NET `Paused` | mọi hàm ghi NET revert; Ledger từ chối bút toán NET; khi mở lại, lần tính đầu tối đa 10 phút |
| Loyalty lỗi | hook `try/catch` → `HookFailed`; đóng phiên vẫn thành công; Loyalty `replay` sau |
| Bản NET mới tính sai | quay proxy `NetSessions` về bản cũ; bút toán sai hoàn bằng `refund` (Manager) |
| FullDB lỗi | theo ADR 0032 (chờ đội chain): `net_sessions` là "nhật ký" |
| Máy treo | `closeStale` bởi bất kỳ ai, tính tới lần heartbeat cuối |

## 8. Kiểm thử

- **Unit:** từng chuyển trạng thái, từng điều kiện từ chối, giá theo khung giờ (khung qua nửa đêm), phút lẻ cộng dồn, hết tiền giữa chừng, chữ ký khách (sai người ký, hết hạn, dùng lại), nhân viên không trực bị từ chối.
- **Module chết:** NET `Paused` giữa phiên → IQR và nạp ví vẫn chạy; mở lại chỉ tính ≤ 10 phút.
- **Invariant:** tổng `charged` các phiên = tổng NET `GROSS` trong `Ledger.moduleRollup`; một phiên / máy, một phiên / khách; không phiên nào bị trừ vượt thời gian thực đã trôi; số dư khách không âm.
- **Đầu cuối:** `docs/09` bước 5, 6, 10, 13 (chơi ở chi nhánh khác bằng ví chung → doanh thu chi nhánh nạp + phục vụ hộ).

## 9. Chuyển dữ liệu từ hệ cũ

| Hệ cũ | Hệ mới |
|---|---|
| `NetCafeUserV3` (tài khoản) | `AgentUserRegistry` (đã có) |
| Máy, nhóm máy, bảng giá (`NetCafeManagementV3`, station) | `Resource` (máy) + `NetCatalog` (khu, giá) |
| Số dư xu chính | `Ledger` (bút toán nạp chuyển đổi, túi theo chi nhánh) |
| Phiên đang mở | **Không chuyển**: đóng hết trên hệ cũ lúc cắt chuyển |
| Bộ đếm dashboard on-chain | Không chuyển; lịch sử cũ đọc từ hệ cũ / FullDB |

## 10. Thứ tự làm

| Bước | Việc | Phụ thuộc |
|---|---|---|
| N0 | Sửa chuẩn: ADR 0036 + `Resource` (F1), `ILoyaltyHook` + `SafeHook` (F2), Ledger kiểm `moduleOf` (F3), `DeployModule` mẫu (F4) | duyệt mục 4 |
| N1 | `NetCatalog`: khu, giá theo khung giờ, máy ↔ khu, trạng thái máy | N0 |
| N2 | `NetSessions`: máy trạng thái, tính tiền, đóng do hết tiền / mất kết nối, chuyển máy, hoàn tiền | N1 |
| N3 | Test module chết, invariant, đầu cuối; ngân sách gas | N2 |
| N4 | Cắm NET bằng `DeployModule`; nối UI cyber (phòng máy, quầy) vào contract | N3 |

## 11. Câu hỏi cần người dùng chốt

1. **Tính tiền theo phút** (giờ chơi lẻ cộng dồn, không làm tròn lên) — đồng ý?
2. **Nhịp heartbeat** của máy trạm: đề xuất **1 phút**; máy im quá **3 phút** thì ai cũng đóng phiên được và chỉ tính tới lần heartbeat cuối.
3. **Số dư tối thiểu để mở máy**: đủ 1 phút chơi theo giá khu, hay một mức cố định (ví dụ 5.000 xu)?
4. **Mở máy không cần khách ký** (nhân viên mở hộ ở quầy) — giữ quyền này (bit 0) hay bắt buộc khách xác nhận bằng OTP / QR?
5. **Trần mỗi bút toán** của NET ở Ledger: đề xuất 500.000 xu (một lần trừ ≤ 10 phút nên thực tế rất nhỏ; trần chỉ chặn lỗi).
6. **Gói giờ (combo)** và **đặt máy có cọc**: để sau MVP như đề xuất?
