# Lệnh chuẩn của meta-platform. CI chạy `make ci`.
.PHONY: build test fmt sizes layout deps snapshot snapshot-update ci legacy-inventory

build:
	forge build

test:
	forge test

fmt:
	forge fmt --check

sizes:
	forge build --sizes --skip 'test/**' --skip 'script/**'

layout:
	python3 scripts/storage_layout.py check

deps:
	scripts/check_deps.sh

# Gas snapshot chỉ gồm test tất định: test fuzz/invariant có gas trung bình đổi theo seed và số lần chạy.
# Cập nhật bằng `make snapshot-update` sau khi review chấp nhận thay đổi gas.
SNAPSHOT_FILTER = --no-match-test 'testFuzz|invariant'
snapshot:
	forge snapshot --check $(SNAPSHOT_FILTER)

snapshot-update:
	forge snapshot $(SNAPSHOT_FILTER)

ci: fmt build sizes deps layout test snapshot

# Sinh dữ liệu thô kiểm kê hệ cũ (chỉ đọc meta-iqr) vào docs/legacy/generated/
legacy-inventory:
	python3 scripts/legacy/inventory.py
