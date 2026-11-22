// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {AgentRegistry} from "../src/core/tenant/AgentRegistry.sol";
import {IAgentRegistry} from "../src/interfaces/IAgentRegistry.sol";
import {PlatformAccess} from "../src/core/access/PlatformAccess.sol";
/// @notice Tạo hàng loạt agent giả để thử dashboard / phân trang.
///         Env: `ADMIN_PRIVATE_KEY` (ưu tiên) hoặc `PRIVATE_KEY` nếu đó là **PLATFORM_ADMIN**.
///         Tuỳ chọn: `MOCK_AGENT_COUNT` (mặc định 100), `MOCK_AGENT_START` (chỉ số bắt đầu, mặc định 0).
///         Đọc `agentsProxy` / `accessProxy` từ `deployments/platform-<chainId>.json`.
///         Ví chủ agent = địa chỉ deterministic `keccak256("mock-agent-owner", index, chainId)` — không trùng admin.
contract SeedMockAgents is Script {
    using stdJson for string;

    uint16 internal constant SERVICES_ALL = 7;

    function run() external {
        uint256 pk = _adminPrivateKey();
        address signer = vm.addr(pk);

        string memory path = string.concat("deployments/platform-", vm.toString(block.chainid), ".json");
        string memory json = vm.readFile(path);
        address agentsProxy = json.readAddress(".agentsProxy");
        address accessProxy = json.readAddress(".accessProxy");

        PlatformAccess access = PlatformAccess(accessProxy);
        if (!access.isPlatformAdmin(signer)) {
            console2.log("signer", signer);
            console2.log("isPlatformAdmin", false);
            revert("ADMIN_PRIVATE_KEY/PRIVATE_KEY phai la PLATFORM_ADMIN");
        }

        uint256 count = vm.envOr("MOCK_AGENT_COUNT", uint256(100));
        uint256 start = vm.envOr("MOCK_AGENT_START", uint256(0));
        if (count == 0) revert("MOCK_AGENT_COUNT=0");

        AgentRegistry registry = AgentRegistry(agentsProxy);
        uint64 created;
        uint64 skipped;

        vm.startBroadcast(pk);
        for (uint256 i = 0; i < count; i++) {
            uint256 n = start + i;
            address owner = _mockOwner(n);
            if (registry.agentIdOf(owner) != 0) {
                skipped++;
                continue;
            }
            string memory name = string.concat("Mock Agent #", vm.toString(n));
            string memory phone = _mockPhone(n);
            IAgentRegistry.AgentProfile memory profile = IAgentRegistry.AgentProfile({
                storeName: name,
                storeAddress: "Seed mock - auto generated",
                note: "Created by script/SeedMockAgents.s.sol",
                storePhone: phone
            });
            uint64 id = registry.createAgent(owner, SERVICES_ALL, profile);
            created++;
            if (n % 10 == 0 || n == start + count - 1) {
                console2.log("agentId", id);
                console2.log("owner", owner);
                console2.log("index", n);
            }
        }
        vm.stopBroadcast();

        console2.log("path", path);
        console2.log("agentsProxy", agentsProxy);
        console2.log("created", created);
        console2.log("skipped_existing", skipped);
        console2.log("requested", count);
    }

    function _adminPrivateKey() private view returns (uint256) {
        if (vm.envExists("ADMIN_PRIVATE_KEY")) {
            string memory raw = vm.envString("ADMIN_PRIVATE_KEY");
            if (bytes(raw).length != 0) return vm.envUint("ADMIN_PRIVATE_KEY");
        }
        return vm.envUint("PRIVATE_KEY");
    }

    function _mockOwner(uint256 index) private view returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked("mock-agent-owner", index, block.chainid)))));
    }

    function _mockPhone(uint256 index) private pure returns (string memory) {
        return string.concat("09", Strings.toString(10_000_000 + (index % 89_999_999)));
    }
}