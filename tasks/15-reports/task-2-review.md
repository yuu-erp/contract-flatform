# Review Task 2 — metrics, ngày, vai trò, hook dữ liệu

Người review: Claude Code · 2026-11-20 · Commit: `b31e9a2`
Kết luận: **Cần sửa trước Task 3** (2 điểm Quan trọng). Một commit `fix(frontend): ...`, thêm mục "Sửa sau review" vào `task-2.md`.

Đã chạy lại: `pnpm install --frozen-lockfile && pnpm -r build && pnpm -r lint && pnpm -r test` → xanh (27/27).

## Làm tốt

- `metrics.ts` khớp đúng `LedgerMetrics.sol` (0–27), công thức thuần/thuế thuần/phục vụ tại chỗ thuần đúng; test đúng giá trị kế hoạch (93 000 / 8 181).
- `dayOf`, `chunkDays` khớp test Solidity; `useRollup` có test 200 ngày → 3 lần gọi, ghép đúng thứ tự.
- `buildAgentContexts` tách được phần thuần để test; Staff bị loại đúng.
- `mapWithConcurrency` giới hạn đồng thời 8 như ràng buộc.
- Đã sửa quy ước `String(...)` còn sót từ Task 1. Có bằng chứng bước đỏ.

## Quan trọng (phải sửa)

### 1. `rangeToDays` lệch ngày với "Tháng này" / "Tháng trước"
`src/days.ts`:
- `monthRange` lấy mốc **00:00 UTC** ngày 1 và **23:59:59 UTC** ngày cuối rồi cộng múi giờ. Với UTC+7, 23:59:59 UTC ngày cuối tháng là 06:59 sáng **ngày 1 tháng sau** theo giờ địa phương → "Tháng trước" dư một ngày. Với múi giờ âm, `fromDay` lùi một ngày.
- `thisMonth`/`lastMonth` lấy tháng/năm bằng `getUTCMonth()` của `now`, không theo giờ địa phương → từ 00:00 đến 06:59 sáng ngày 1 (giờ VN) app vẫn coi là tháng trước.

Sửa: với múi giờ `tz`, ngày kinh doanh của lịch địa phương `(Y, M, D)` chính là `Date.UTC(Y, M, D) / 86_400_000`. Lấy `Y, M` địa phương bằng `new Date(now.getTime() + tz·60_000)` rồi dùng các hàm `getUTC*`.

Test (bắt buộc, giá trị cụ thể):
- `tz = 420`, `now = 2026-11-30T17:30:00Z` (00:30 ngày 1/12 giờ VN): `thisMonth` → `fromDay = toDay = Date.UTC(2026,11,1)/86_400_000`; `lastMonth` → `[Date.UTC(2026,10,1), Date.UTC(2026,10,30)] / 86_400_000` (đúng 30 ngày).
- `tz = -300`, `now = 2026-12-01T03:00:00Z` (22:00 ngày 30/11 giờ địa phương): `thisMonth` là tháng 11, `toDay = Date.UTC(2026,10,30)/86_400_000`.
- `7d` → `toDay − fromDay == 6`; `today` → bằng `dayOf(now, tz)`.
- Khoảng tuỳ chọn: giữ như hiện tại nhưng thêm test một trường hợp.

### 2. Tìm agent thiếu SĐT và không bỏ dấu
`useAgents().search` chỉ tìm theo id, ví chủ, tên cửa hàng, và so sánh có dấu. Kế hoạch (Thiết kế "Nguồn dữ liệu" và test Task 4) yêu cầu tìm theo **tên (có dấu/không dấu), SĐT, id, ví**.

Sửa:
- Lưu cả `storePhone` (và `storeAddress` nếu muốn) vào `AgentRow` khi đọc hồ sơ.
- Tách hàm thuần `matchAgent(row, text)` ra file riêng (ví dụ `src/search-agents.ts`) để Task 4 dùng lại và test được không cần React.
- Chuẩn hoá chuỗi: chữ thường, `normalize('NFD')`, bỏ dấu (`\p{Diacritic}`), đổi `đ` → `d`. SĐT: bỏ mọi ký tự không phải số trước khi so sánh.
- Thêm lọc theo dịch vụ được cấp (`allowedServices & mask`) cạnh lọc trạng thái.

Test: `"cyber quan 1"` khớp tên `"Cyber Quận 1"`; `"0283822"` khớp SĐT `"028 3822 0000"`; `"0xabc"` khớp ví chủ viết hoa; id `"12"` khớp agent 12.

## Nhỏ (nên sửa)

3. `useTx.run` ném lại lỗi sau khi gọi `onError`. Nếu nút gọi `run(...)` mà không `catch`, trình duyệt sẽ báo "unhandled rejection". Hoặc nuốt lỗi (trả `false`), hoặc ghi rõ trong JSDoc là caller phải `catch`. Mình chọn: **trả về `boolean`** (thành công/thất bại), không ném.
4. `useAgents` gọi `getAgentProfile` rồi nuốt mọi lỗi. Chỉ nuốt khi agent chưa có hồ sơ; còn lỗi mạng thì cho query lỗi để màn hình hiện "Thử lại". Tối thiểu: ghi `console.warn`.
5. `useRollup` gọi tuần tự từng khoảng 93 ngày. Chấp nhận được với ≤ 4 khoảng (1 năm); không cần đổi.

## Ghi chú cho Task 3/4/7

- App cần một hook dựng `PlatformContracts` từ ví đang chọn và địa chỉ (`loadAddresses(chainId, data)`), rồi bọc `ContractsProvider` + `QueryClientProvider`. Đặt hook này trong `packages/chain/src/react/` (ví dụ `usePlatformContracts(chainId, deployments)`) để hai app không viết lặp.
- Toast của `useTx`: app truyền `onError`/`onSuccess` (đồng ý với báo cáo).
