# N0b — ILoyaltyHook + SafeHook (F2)

**Ngày:** 2026-11-28  
**Foundry:** `forge 1.7.1` (4072e487). CI chốt `v1.7.1` (`.github/workflows/ci.yml`).

## Phạm vi

- R1 đã tách commit riêng (`fix(resource): chỉ đăng ký thiết bị khi chi nhánh bật module (R1 review N0a)`).
- `ILoyaltyHook` + `IHookEvents.HookFailed`.
- `libraries/SafeHook.call`: trần gas, kiểm 63/64 + dự phòng, assembly `retSize = 0`, không import Registry.
- ADR 0031 C4 chi tiết; `docs/modules/net.md` đánh dấu F2 (chưa gắn NET tới N2).

## Checklist kiến trúc (rút gọn)

| # | Nội dung | Kết quả |
|---|----------|---------|
| Tầng | `ILoyaltyHook` interface; `SafeHook` library thuần, không import `src/` | ✅ `check_deps` |
| L2 | Không hằng Loyalty / NET trong `SafeHook` | ✅ |
| Cô lập | Giao dịch chính không revert khi hook lỗi | ✅ 9 test |

## Kiểm tra

| Lệnh | Kết quả |
|------|---------|
| `make ci` | xanh (sau commit fmt) |
| `forge test --match-contract SafeHookTest` | 9/9 |

## Gas test (ước lượng)

Giao dịch chính `HookCaller.run` với hook thành công ~115k gas; hook revert/infinite ~157–171k; reentrancy ~632k (vẫn thành công). Trần kỳ vọng khi NET gọi thật: cấu hình `gasLimit` hook ~50k–80k.

## Việc tiếp (N0c)

Ledger `moduleOf` kiểm tra poster (F3).