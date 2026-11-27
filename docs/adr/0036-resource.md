# 0036. Resource — định danh thiết bị dùng chung (T2)

- Trạng thái: **Đề xuất — Claude review**
- Ngày: 2026-11-27
- Người duyệt: Claude (kỹ thuật thuần; không đổi quy tắc tiền)

## Bối cảnh

Bản đồ kiến trúc (`docs/02` mục 3) đã dành contract T2 `Resource` cho câu hỏi: thiết bị này là gì, thuộc chi nhánh nào, của module nào, còn dùng không? Đặc tả NET (F1) cần chỗ giữ định danh máy trạm và khoá ký trước khi có phiên chơi. Cùng hình đó còn màn bếp (IQR) và máy chấm công (Enterprise). Để mỗi module tự giữ một sổ thiết bị thì ba sổ lặp lại cùng các luật: một khoá ký không được gắn hai thiết bị, thiết bị thuộc một chi nhánh, tắt thiết bị là tắt quyền ký.

## Quyết định

Thêm `Resource` ở T2 (`src/shared/resource/`). Contract chỉ trả lời câu hỏi định danh:

- `deviceId` đếm toàn cục (`uint64`, bắt đầu từ 1).
- `branchId`, `moduleId` (phải đã đăng ký ở `Registry`, chưa Retired; module đang Paused vẫn đăng ký được — cầu dao module không nằm ở đây).
- `signer`: địa chỉ khoá của chính thiết bị, duy nhất toàn hệ. Đổi khoá thì nhả khoá cũ.
- `status`: `Active` hoặc `Disabled`. Vô hiệu không xoá và không nhả khoá.
- `label`: 1–32 byte, chỉ để nhận ra thiết bị.
- Tối đa 512 thiết bị một chi nhánh (kể cả đã vô hiệu; chưa có hàm xoá).

Quyền ghi: Manager trở lên của chi nhánh, sau `DelegateRegistry.resolve`. Không dùng bit quyền của từng module, để `Resource` không phụ thuộc danh mục quyền module. `requireActiveDevice(signer, moduleId)` revert khi khoá không có, thiết bị không Active, sai module, hoặc chi nhánh không Active.

Không lưu khu, giá, trạng thái phiên, hay tên module. Phần đó thuộc module sở hữu thiết bị.

## Phương án đã cân nhắc

| | Cách | Vì sao không chọn |
|---|---|---|
| A | Mỗi module một sổ thiết bị | Lặp luật khoá ký; máy chấm công và màn bếp chưa có chỗ đứng chung |
| **B (đề xuất)** | Một `Resource` T2, module chỉ giữ thuộc tính riêng | Đủ L3: ít nhất hai module cần ngay (NET, IQR), Enterprise cần cùng hình; trung lập; câu hỏi đã có trong bản đồ |
| C | Nhét máy trạm vào `NetCatalog` | IQR và Enterprise không dùng được; nền tảng sau này phải biết tên NET |

## Hệ quả

- Nâng cấp T2: ADR này, Claude review. Chưa đụng tiền.
- `DeployPlatform` cắm proxy mới. Hệ đã deploy trên chain trước đó chưa có proxy này; script cắm thêm (kiểu `DeployAgentUsers`) chưa nằm trong N0a — anvil `make deploy-local` đi đường deploy đầy đủ nên có.
- Thiết bị Disabled vẫn chiếm một suất trong trần 512. Xoá hẳn cần ADR riêng nếu vận hành cần tái sử dụng suất.
