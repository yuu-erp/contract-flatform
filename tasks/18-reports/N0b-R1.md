# N0b — R1 (Resource.registerDevice + ModuleNotEnabled)

**Ngày:** 2026-11-28  
**Foundry:** `forge 1.7.1` (4072e487, 2026-05-08) — ghi để đối chiếu với 1.5.1 trên máy Claude (`DeployStaff.t.sol` fmt).

## Phạm vi lượt này

Sửa review N0a (R1) trước phần SafeHook / ILoyaltyHook còn lại của N0b.

## Thay đổi

- `registerDevice`: sau kiểm Registry, với `moduleId != 0` gọi `branches.isServiceEnabled(branchId, registry.serviceBit(moduleId))`; không bật → `ModuleNotEnabled(branchId, moduleId)`.
- `moduleId = 0` không đổi (thiết bị nền tảng; không gọi `serviceBit(0)`).
- Test `test_moduleNotEnabledOnBranch`: `b2` chỉ NET — đăng ký `moduleId=2` (IQR) revert; `b1` NET|IQR — ok.
- ADR 0036 mục quyết định đồng bộ với hệ quả review.

## Kiểm tra

| Lệnh | Kết quả |
|------|---------|
| `forge test --match-contract ResourceTest` | 14/14 pass |

## Ba câu review (đã chốt, không đổi code)

1. Module Paused — vẫn tra `requireActiveDevice`; không chặn thêm ở Resource.
2. Xóa thiết bị — chưa.
3. `make deploy-resource` — N0d, sau `deploy-users`.

## Việc tiếp (cùng task N0b)

- `SafeHook` + `ILoyaltyHook`, test hook giả, cập nhật ADR 0031 (C4).