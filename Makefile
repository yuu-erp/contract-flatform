# Lệnh chuẩn của meta-platform. CI chạy `make ci`.
# `deploy`, `deploy-agent-access` và `set-admin` chỉ người dùng chạy (đọc .env, có --broadcast). Agent không chạy các target đó.
.PHONY: build test fmt sizes layout deps snapshot snapshot-update ci legacy-inventory abi deploy deploy-agent-access deploy-local set-admin

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

# ABI thuần (mảng JSON, không bytecode) cho client. Commit thư mục abi/.
abi:
	mkdir -p abi
	forge inspect PlatformAccess abi --json > abi/PlatformAccess.json
	forge inspect AgentRegistry abi --json > abi/AgentRegistry.json
	forge inspect BranchRegistry abi --json > abi/BranchRegistry.json
	forge inspect HistoryIndex abi --json > abi/HistoryIndex.json
	forge inspect AgentAccess abi --json > abi/AgentAccess.json

# Chỉ người dùng chạy. Cần PRIVATE_KEY và RPC_URL trong .env (foundry nạp .env; rpc "platform" = ${RPC_URL}).
deploy:
	forge script script/DeployPlatform.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Hệ đã deploy trước khi có AgentAccess: thêm AgentAccess, đọc/ghi deployments/platform-<chainid>.json.
# Cần PRIVATE_KEY (owner) trong .env.
deploy-agent-access:
	forge script script/DeployAgentAccess.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Cần PRIVATE_KEY (owner), ACCESS_PROXY, ADMIN, ALLOW=true|false.
set-admin:
	forge script script/SetPlatformAdmin.s.sol --rpc-url platform --broadcast

# Chỉ anvil local. Khoá dưới đây là tài khoản #0 mặc định của anvil — không dùng trên chain thật.
# Đặt MockFullDB vào precompile 0x…0107 rồi mới chạy script (HistoryIndex mặc định trỏ precompile đó).
ANVIL_RPC = http://127.0.0.1:8545
ANVIL_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
deploy-local:
	cast rpc anvil_setCode 0x0000000000000000000000000000000000000107 $$(forge inspect MockFullDB deployedBytecode) --rpc-url $(ANVIL_RPC)
	PRIVATE_KEY=$(ANVIL_KEY) forge script script/DeployPlatform.s.sol --rpc-url $(ANVIL_RPC) --broadcast
