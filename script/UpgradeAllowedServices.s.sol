// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {AgentRegistry} from "../src/core/tenant/AgentRegistry.sol";
import {BranchRegistry} from "../src/core/tenant/BranchRegistry.sol";
import {IAgentRegistry} from "../src/interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../src/interfaces/IBranchRegistry.sol";
import {ServiceMask} from "../src/libraries/ServiceMask.sol";

/// @notice Nâng AgentRegistry rồi BranchRegistry. Trần module của agent đã có được điền trong cùng
///         `upgradeToAndCall` của AgentRegistry (`migrateAllowedServices`, `reinitializer(2)`).
///         Mask = OR `services` của chi nhánh chưa xoá. Agent không có chi nhánh sống nhận NET|IQR (3).
///         Hơn `AgentRegistry.MAX_MIGRATE` agent sống thì revert trước khi nâng, vì reinitializer chỉ chạy một lần.
///         `run()` đọc env và broadcast. `upgrade()` không đọc env, để test gọi trực tiếp.
///         Không hard-code khoá. Người dùng tự chạy `make upgrade-allowed-services` với `.env`.
contract UpgradeAllowedServices is Script {
    /// @notice NET | IQR. Agent không có chi nhánh sống khi nâng cấp.
    uint16 internal constant DEFAULT_MASK = 3;

    error TooManyAgents(uint256 count);

    struct Result {
        address agentsImpl;
        address branchesImpl;
        uint64 agentCount;
    }

    /// @dev `run()` đặt cờ này trước khi gọi `upgrade` trong `startBroadcast`.
    ///      Trong broadcast không được `prank`. Test gọi `upgrade` trực tiếp thì phải `prank` owner.
    bool private _broadcasting;

    /// @param owner PLATFORM_OWNER, người được phép `upgradeToAndCall`.
    function upgrade(address owner, address agentsProxy, address branchesProxy) public returns (Result memory result) {
        AgentRegistry agents = AgentRegistry(agentsProxy);
        BranchRegistry branches = BranchRegistry(branchesProxy);
        (uint64[] memory ids, uint16[] memory masks) = _masks(agents, branches);
        if (ids.length > ServiceMask.MAX_MIGRATE) revert TooManyAgents(ids.length);
        for (uint256 i = 0; i < ids.length; ++i) {
            console2.log("agent", ids[i]);
            console2.log("mask", masks[i]);
        }

        if (!_broadcasting) vm.startPrank(owner);
        result.agentsImpl = address(new AgentRegistry());
        agents.upgradeToAndCall(result.agentsImpl, abi.encodeCall(AgentRegistry.migrateAllowedServices, (ids, masks)));
        result.branchesImpl = address(new BranchRegistry());
        branches.upgradeToAndCall(result.branchesImpl, "");
        if (!_broadcasting) vm.stopPrank();

        result.agentCount = agents.agentCount();
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(pk);
        string memory chainId = vm.toString(block.chainid);
        string memory path = string.concat("deployments/platform-", chainId, ".json");
        string memory json = vm.readFile(path);
        address agentsProxy = vm.parseJsonAddress(json, ".agentsProxy");
        address branchesProxy = vm.parseJsonAddress(json, ".branchesProxy");

        _broadcasting = true;
        vm.startBroadcast(pk);
        Result memory result = upgrade(owner, agentsProxy, branchesProxy);
        vm.stopBroadcast();
        _broadcasting = false;

        vm.writeJson(string.concat("\"", vm.toString(result.agentsImpl), "\""), path, ".agentsImpl");
        vm.writeJson(string.concat("\"", vm.toString(result.branchesImpl), "\""), path, ".branchesImpl");
        console2.log("agentsImpl", result.agentsImpl);
        console2.log("branchesImpl", result.branchesImpl);
        console2.log("wrote", path);
    }

    /// @dev Bỏ chi nhánh Deleted và agent Deleted. Mask 0 (không có chi nhánh sống) thành NET|IQR.
    function _masks(AgentRegistry agents, BranchRegistry branches)
        internal
        view
        returns (uint64[] memory ids, uint16[] memory masks)
    {
        uint64 agentCount = agents.agentCount();
        uint16[] memory acc = new uint16[](agentCount + 1);
        uint64 branchCount = branches.branchCount();
        for (uint64 branchId = 1; branchId <= branchCount; ++branchId) {
            IBranchRegistry.Branch memory br = branches.getBranch(branchId);
            if (br.status == IBranchRegistry.BranchStatus.Deleted) continue;
            if (br.agentId == 0 || br.agentId > agentCount) continue;
            acc[br.agentId] |= br.services;
        }

        uint256 live;
        for (uint64 agentId = 1; agentId <= agentCount; ++agentId) {
            if (agents.getAgent(agentId).status != IAgentRegistry.AgentStatus.Deleted) ++live;
        }
        ids = new uint64[](live);
        masks = new uint16[](live);
        uint256 n;
        for (uint64 agentId = 1; agentId <= agentCount; ++agentId) {
            if (agents.getAgent(agentId).status == IAgentRegistry.AgentStatus.Deleted) continue;
            uint16 mask = acc[agentId];
            if (mask == 0) mask = DEFAULT_MASK;
            ids[n] = agentId;
            masks[n] = mask;
            ++n;
        }
    }
}
