# AGENTS.md — meta-platform

Đọc thêm `../AGENTS.md` (nhóm contract) và `../../../AGENTS.md` (workspace). Quy tắc ở đây thắng khi mâu thuẫn trong phạm vi repo này.

## Bối cảnh bắt buộc

- Repo này là hệ **mới**, xây song song với `repos/contract/meta-iqr` (hệ **cũ**, đang chạy thật).
- **Không sửa gì trong meta-iqr từ track này.** Chỉ đọc mã, đọc chain (view, event, storage). Việc sửa hệ cũ thuộc track `projects/loyalty-v2` (worktree `worktrees/meta-iqr-loyalty-v2`), do một session khác làm.
- Không deploy, không gửi giao dịch lên chain thật. Fork chỉ để đọc.

## Hai track đang chạy song song

| Track | Làm ở đâu | Ghi file ở đâu |
|---|---|---|
| Xây hệ mới (repo này) | `repos/contract/meta-platform` | repo này; ADR `documents/decisions/0020`–`0049` |
| Refactor Loyalty hệ cũ | `worktrees/meta-iqr-loyalty-v2` | worktree đó, `projects/loyalty-v2/`; ADR `0010`–`0019` |

Hai track dùng chung `documents/tech-debt.md` và `documents/work-log.md`: chỉ **nối thêm dòng**, không sửa dòng của track kia.

## Nguyên tắc thiết kế (chi tiết ở `docs/02-kien-truc.md`)

1. On-chain chỉ giữ tiền, quyền, trạng thái nghiệp vụ đang sống, cấu hình. Lịch sử, báo cáo, thống kê → event + indexer.
2. Không vòng lặp không trần trong hàm ghi. Danh sách có index vị trí (swap-pop). Bảo trì theo lô có `limit`. View danh sách luôn phân trang.
3. Tiền chỉ đi qua Ledger: bút toán kép, `refId` chống trùng; số tiền do contract tự ghi, không nhận từ bên gọi khi hoàn/huỷ.
4. Nghiệp vụ là máy trạng thái tường minh, có test cho mọi chuyển trạng thái.
5. Phân quyền qua một AccessManager, vai trò gắn `(agentId, branchId)`; cấu hình cấp agent chỉ vai trò cấp agent đổi được.
6. Contract ≤ 24 KB, một trách nhiệm. Logic dùng chung đặt trong library.
7. Session wallet là delegate của member, chỉ giải quyết ở `DelegateRegistry`.
8. Không lưu dữ liệu cá nhân dạng rõ on-chain (điện thoại, email, CCCD) — chỉ hash có salt.
9. UUPS + storage namespaced ERC-7201; layout storage kiểm tự động trước mỗi upgrade.
10. Event có schema ổn định (đánh version); ABI client sinh tự động.

## Công cụ và lệnh

- Foundry là công cụ chính. `make ci` chạy đủ: `forge fmt --check`, build, `--sizes`, `scripts/check_deps.sh`, `scripts/storage_layout.py check`, test, `forge snapshot --check` (bỏ test fuzz/invariant; cập nhật bằng `make snapshot-update`). Hardhat chỉ dùng nếu client cần.
- Contract UUPS mới: thêm dòng `impl` vào `storage-layouts/contracts.txt`; mỗi struct namespaced thêm harness `test/layout/` + dòng `harness`, rồi `python3 scripts/storage_layout.py snapshot`.
- Test dựng tầng quản trị qua `test/utils/PlatformFixture.sol`; FullDB giả lập bằng `installMockFullDB()` (cài `MockFullDB` vào `0x…0107`).
- Chỉ chạy test liên quan: `forge test --match-path 'test/<module>/**'`.
- `make abi` xuất ABI client vào `abi/`. `make deploy` / `make set-admin` chỉ người dùng chạy (đọc `.env`, gửi giao dịch). `make deploy-local` chỉ cho anvil.
- Mỗi module mới phải có: đặc tả trong `docs/modules/<module>.md`, unit test, invariant test nếu chạm tiền, ngân sách gas.

## Quy ước

- Tài liệu và trả lời bằng tiếng Việt; tên hàm/file/lệnh giữ tiếng Anh.
- Commit theo Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`), chỉ khi người dùng giao. Repo hiện chưa có remote.
- Task theo quy trình `documents/WORKFLOW.md`: Claude Code lập kế hoạch/review, Cursor triển khai; file bàn giao nằm trong `tasks/`.
- Thấy vấn đề ngoài phạm vi → ghi `documents/tech-debt.md`, không sửa lan.
