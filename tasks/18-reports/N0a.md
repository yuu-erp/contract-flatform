# N0a — ADR 0036 + Resource

**Ngày:** 2026-11-27  
**Trạng thái:** Chờ Claude review (chưa sang N0b)

## Làm gì

- ADR `docs/adr/0036-resource.md` (trạng thái Đề xuất — Claude review). Cập nhật `docs/adr/README.md`, `docs/02` mục 3 và mục 9, `docs/06` (dòng `shared/resource/` đánh dấu đã cài), `docs/04` (Resource đang chờ review).
- `IResource` + `Resource` (T2, UUPS, ERC-7201 `metaplatform.shared.resource`).
- Test `test/shared/resource/Resource.t.sol` và khoá slot trong `Erc7201SlotsTest`.
- Cắm vào `PlatformFixture`, `DeployPlatform`, `UpgradeProxy` (khoá `resource`), `make abi` → `abi/Resource.json`.
- Layout: `ResourceLayout` + `ResourceRowsLayout`.

## Kiểm tra kiến trúc

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Tầng, contract, câu hỏi (L4) | T2, contract mới `Resource`. Câu hỏi đúng hàng đã có trong `docs/02` mục 3: thiết bị là gì, thuộc chi nhánh nào, module nào, khoá ký nào, còn dùng không. Không nới contract cũ. |
| 2 | Đủ L3? ADR? | Có. NET (máy trạm), IQR (màn bếp), Enterprise (máy chấm công) cần cùng một sổ. Trung lập: không khu, không giá, không phiên. ADR 0036. |
| 3 | Tên module dưới T3 (L2) | Không trong `src/shared/resource/` và `src/interfaces/IResource.sol`. `moduleId` đọc từ Registry lúc chạy. `scripts/check_deps.sh`: phụ thuộc ok. |
| 4 | Module chết thì còn gì? | Resource không gọi module. Module Paused vẫn cho đăng ký và `requireActiveDevice` — cầu dao nằm ở `requireWritable` của module, không ở sổ định danh. Chưa có test "module chết" của NET (đó là N3). |
| 5 | Tiền | Không chạm Ledger, không `refId`, không invariant tiền. |
| 6 | Kích thước (L5) | Runtime **9.300 B**, initcode 9.549 B. Trần task 12 KB, trần cảnh báo 20 KB. `make sizes`: kích thước ok. |
| 7 | Lịch sử (L6) | Không storage lịch sử, không FullDB. Chỉ event version 1 (`DeviceRegistered`, `DeviceSignerChanged`, `DeviceStatusChanged`). |
| 8 | Dữ liệu cũ (Y5) | Máy trạm hệ cũ (`NetCafeStation`) map được: một máy = một `deviceId`, khoá máy = `signer`, chi nhánh = `branchId`, `moduleId` của NET khi cắm module. Nhãn máy nằm ở `label` hoặc sau này ở `NetCatalog`. |
| 9 | Nâng cấp, ai duyệt (L7) | T2 mới. ADR 0036 chờ Claude review. Chưa deploy chain 991. |

## Gas

`forge test --match-contract ResourceTest --gas-report` (số lần gọi gồm cả lệnh revert sớm):

| Hàm | Trung vị | Max |
|---|---|---|
| `registerDevice` | 210.843 | 267.228 |
| `setSigner` | 109.602 | 142.707 |
| `setDeviceStatus` | 112.467 | 115.151 |
| `requireActiveDevice` | 26.980 | 27.013 |
| `devicesOf` | 6.814 | 125.845 (trang dài) |

Snapshot gas của cả suite được cập nhật vì `PlatformFixture` deploy thêm một proxy. `forge snapshot --check` (bỏ fuzz/invariant) xanh sau cập nhật.

## Lệch so với đặc tả

- `devicesOf` trả danh sách `deviceId`, không trả cả struct. Trần trang 100, giống các view danh sách khác.
- `setSigner` cùng khoá cũ: không đổi, không event.
- Module `Paused` vẫn đăng ký được. Module `Retired` hoặc chưa đăng ký thì từ chối.
- Vô hiệu thiết bị không nhả `signer` và vẫn chiếm một suất trong trần 512. Không có hàm xoá.
- Mọi hàm ghi đòi chi nhánh `Active`. Chi nhánh đang dừng thì không đổi khoá / trạng thái.
- `docs/modules/net.md` mục F1 vẫn ghi Resource chưa có. Không sửa vì không nằm trong danh sách file N0a.

## Kiểm thử

- `ResourceTest`: 13 passed. `test_resourceSlot`: passed (slot ERC-7201 đúng namespace).
- `forge test` toàn bộ (trước test slot): 386 passed, 0 failed. Snapshot tất định sau đó: 361 passed, gồm `test_resourceSlot`.
- `scripts/check_deps.sh`: ok. `storage_layout.py check`: ok. `check_sizes.py`: ok.
- `forge fmt --check` vẫn lệch ở `test/script/DeployPlatform.t.sol` và `test/script/DeployStaff.t.sol` (thụt lề named-arg). Không format lại, đúng ràng buộc task. Hai file này không nằm trong diff N0a.

## Câu hỏi cho review

1. Module đang Paused mà vẫn `requireActiveDevice` được — có muốn chặn ở Resource không, hay để module tự gọi `requireWritable`?
2. Trần 512 tính cả thiết bị Disabled, chưa có xoá. Có cần hàm xoá trong N0a không?
3. Hệ đã deploy trên 991 chưa có proxy Resource. N0a chỉ cắm vào `DeployPlatform` (anvil deploy mới có). Script cắm thêm cho hệ đang chạy (kiểu `DeployAgentUsers`) để sau, khi nào cần deploy thật.
