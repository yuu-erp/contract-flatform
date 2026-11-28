# Review N0a — Resource (ADR 0036)

**Người review:** Claude Code · **Ngày:** 2026-11-28 · **Commit:** `35113b9`
**Kết luận:** **Đạt** — sang N0b. Sửa R1 ngay đầu N0b (cùng commit đầu của N0b).

## Đã kiểm

| Hạng mục | Kết quả |
|---|---|
| Build, `ResourceTest` 13/13 | ✅ |
| `check_deps` (L1, L2), `storage_layout check`, `check_sizes` | ✅ — Resource 9.300 B (trần task 12 KB) |
| Một câu hỏi (L4), không tên module (L2), event version 1 | ✅ |
| Quyền: Manager+ sau `resolve`, không dùng bit quyền module | ✅ đúng đặc tả |
| Khoá ký duy nhất toàn hệ, nhả khoá cũ khi đổi | ✅ có test |
| Phân trang trần 100, trần 512 / chi nhánh | ✅ |
| ERC-7201 + khoá slot trong `Erc7201SlotsTest`, harness `*RowsLayout` | ✅ |
| Báo cáo đủ 9 câu kiến trúc + gas | ✅ |

## Cần sửa

**R1 (nên sửa, nhỏ):** `registerDevice` không kiểm chi nhánh có bật module của thiết bị. Hiện đăng ký được máy NET (module 1) ở chi nhánh chỉ có IQR. Module vẫn chặn lúc dùng (`requireWritable`) nên không mất tiền, nhưng sổ thiết bị sai từ đầu.
→ Với `moduleId != 0`: `branches.isServiceEnabled(branchId, registry.serviceBit(moduleId))` phải đúng, không thì revert `ModuleNotEnabled(branchId, moduleId)`. `moduleId = 0` (thiết bị của nền tảng, ví dụ máy quầy) giữ như hiện tại — ghi rõ trong ADR 0036. Thêm test.

## Ghi chú (không chặn)

- **N1:** `signer` của thiết bị không được kiểm trùng với địa chỉ đăng nhập / ví phiên ở `DelegateRegistry`. Hiện vô hại vì NET xác thực máy bằng `requireActiveDevice`, không bằng `resolve`. Ghi vào ADR 0036 mục Hệ quả để IQR / Enterprise không dùng `resolve` cho khoá thiết bị.
- **N2:** `forge fmt --check` lệch ở `test/script/DeployStaff.t.sol` trên máy Cursor nhưng không lệch trên Foundry 1.5.1 của Claude → khác phiên bản `forge`. Không format lại; báo phiên bản `forge --version` trong báo cáo N0b.

## Trả lời câu hỏi

1. **Module Paused vẫn `requireActiveDevice` được?** Giữ như hiện tại. Resource chỉ trả lời định danh; cầu dao là việc của `requireWritable` mà mọi hàm ghi của module đã gọi. Chặn thêm ở Resource sẽ làm hai nơi giữ cùng một luật.
2. **Hàm xoá thiết bị?** Chưa cần. 512 suất / chi nhánh đủ cho quy mô hiện tại (Y4). Cần tái dùng suất thì ADR riêng.
3. **Script cắm Resource cho hệ đang chạy (991)?** Cần, trước lượt deploy thật. Gộp vào **N0d**: thêm `make deploy-resource` (kiểu `DeployAgentUsers`: đọc deployments json, deploy proxy, ghi `resourceProxy/Impl`), chạy sau `deploy-users`.
