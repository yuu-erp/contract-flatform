# Lệnh chuẩn của meta-platform. CI chạy `make ci`.
# `deploy`, `deploy-agent-access` và `set-admin` chỉ người dùng chạy (đọc .env, có --broadcast). Agent không chạy các target đó.
.PHONY: deploy-staff deploy-registry build test fmt sizes layout deps snapshot snapshot-update ci legacy-inventory abi deploy deploy-agent-access deploy-local set-admin mock-agents seed-mock-agents deploy-mock-fulldb upgrade upgrade-dry upgrade-local

build:
	forge build

test:
	forge test

fmt:
	forge fmt --check

sizes:
	forge build --sizes --skip 'test/**' --skip 'script/**'
	forge build --sizes --json --skip 'test/**' --skip 'script/**' 2>/dev/null | python3 scripts/check_sizes.py

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
	forge inspect SalesSettings abi --json > abi/SalesSettings.json
	forge inspect Ledger abi --json > abi/Ledger.json
	forge inspect AgentUserRegistry abi --json > abi/AgentUserRegistry.json
	forge inspect Registry abi --json > abi/Registry.json
	forge inspect Permission abi --json > abi/Permission.json
	forge inspect Duty abi --json > abi/Duty.json
	forge inspect DelegateRegistry abi --json > abi/DelegateRegistry.json
	forge inspect CustomerDesk abi --json > abi/CustomerDesk.json

# Chỉ người dùng chạy. Cần PRIVATE_KEY và RPC_URL trong .env (foundry nạp .env; rpc "platform" = ${RPC_URL}).
# FOUNDry doc: bien trong .env duoc nap; neu FULLDB khong ap dung, chay: FULLDB=0x... make deploy
deploy:
	forge script script/DeployPlatform.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Hệ đã deploy trước khi có AgentAccess: thêm AgentAccess, đọc/ghi deployments/platform-<chainid>.json.
# Cần PRIVATE_KEY (owner) trong .env.
deploy-agent-access:
	forge script script/DeployAgentAccess.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Hệ đã deploy trước khi có người dùng theo agent: thêm AgentUserRegistry,
# đọc/ghi deployments/platform-<chainid>.json. Cần PRIVATE_KEY (owner) trong .env.
deploy-users:
	forge script script/DeployAgentUsers.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Thêm Permission + Duty (ADR 0033); chạy SAU deploy-registry.
deploy-staff:
	forge script script/DeployStaff.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Thêm Registry (ADR 0030) vào hệ đã deploy; chạy SAU khi upgrade AgentRegistry + BranchRegistry.
deploy-registry:
	forge script script/DeployRegistry.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Cần PRIVATE_KEY (owner), ACCESS_PROXY, ADMIN, ALLOW=true|false.
set-admin:
	forge script script/SetPlatformAdmin.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Cần ADMIN_PRIVATE_KEY trong .env (hoặc PRIVATE_KEY = admin). MOCK_AGENT_COUNT / MOCK_AGENT_START tuỳ chọn.
mock-agents seed-mock-agents:
	forge script script/SeedMockAgents.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Deploy MockFullDB tren anvil (chain 31337) — khong dung tren chain that.
deploy-mock-fulldb:
	forge script script/DeployMockFullDB.s.sol --rpc-url platform --broadcast

# Chỉ người dùng chạy. Nâng một proxy lên implementation build từ mã hiện tại; ghi lại <key>Impl trong
# deployments/platform-<chainid>.json. Cần PRIVATE_KEY (owner). Ví dụ: make upgrade CONTRACT=AgentRegistry
# Target tự chạy kiểm storage layout trước. Hướng dẫn: docs/07-deploy-va-nang-cap.md.
upgrade:
	@test -n "$(CONTRACT)" || (echo "Thiếu CONTRACT=PlatformAccess|Registry|HistoryIndex|AgentRegistry|BranchRegistry|AgentAccess|SalesSettings|Ledger|AgentUserRegistry|Permission|Duty|DelegateRegistry|CustomerDesk" && exit 1)
	python3 scripts/storage_layout.py check
	CONTRACT=$(CONTRACT) forge script script/UpgradeProxy.s.sol --rpc-url platform --broadcast

# Mô phỏng `make upgrade` trên chain thật: không gửi giao dịch, không ghi file deployments.
upgrade-dry:
	@test -n "$(CONTRACT)" || (echo "Thiếu CONTRACT=..." && exit 1)
	python3 scripts/storage_layout.py check
	DRY_RUN=true CONTRACT=$(CONTRACT) forge script script/UpgradeProxy.s.sol --rpc-url platform

# Chỉ anvil local. Khoá dưới đây là tài khoản #0 mặc định của anvil — không dùng trên chain thật.
# Đặt MockFullDB vào precompile 0x…0107 rồi mới chạy script (HistoryIndex mặc định trỏ precompile đó).
ANVIL_RPC = http://127.0.0.1:8545
ANVIL_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
deploy-local:
	cast rpc anvil_setCode 0x0000000000000000000000000000000000000107 $$(forge inspect MockFullDB deployedBytecode) --rpc-url $(ANVIL_RPC)
	PRIVATE_KEY=$(ANVIL_KEY) forge script script/DeployPlatform.s.sol --rpc-url $(ANVIL_RPC) --broadcast

# Chỉ anvil local: diễn tập nâng cấp trên hệ vừa `make deploy-local`.
upgrade-local:
	@test -n "$(CONTRACT)" || (echo "Thiếu CONTRACT=..." && exit 1)
	PRIVATE_KEY=$(ANVIL_KEY) CONTRACT=$(CONTRACT) forge script script/UpgradeProxy.s.sol --rpc-url $(ANVIL_RPC) --broadcast
