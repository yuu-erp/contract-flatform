// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "./PlatformAccessed.sol";
import {PlatformAuditing} from "../history/PlatformAuditing.sol";
import {IAgentAccess} from "../../interfaces/IAgentAccess.sol";
import {IAgentRegistry} from "../../interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";
import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";

/// @title AgentAccess
/// @notice Vai trò cấp chi nhánh: chủ agent → Manager → Staff. Xem `IAgentAccess` và docs/modules/core-access.md.
///         Danh sách thành viên mỗi chi nhánh và danh sách chi nhánh của mỗi ví đều có trần, xoá kiểu swap-pop.
contract AgentAccess is PlatformAccessed, PlatformAuditing, IAgentAccess {
    uint8 public constant EVENT_VERSION = 1;
    uint16 public constant MAX_MEMBERS_PER_BRANCH = 200;
    uint16 public constant MAX_BRANCHES_PER_ACCOUNT = 20;
    uint256 public constant MAX_PAGE = 100;

    /// @custom:storage-location erc7201:metaplatform.core.access.agent
    struct AgentAccessStorage {
        IAgentRegistry agents;
        IBranchRegistry branches;
        IHistoryIndex history;
        mapping(uint64 => address[]) members; // branchId → ví
        mapping(uint64 => mapping(address => Member)) member; // branchId → ví → thành viên
        mapping(address => uint64[]) branchesOf; // ví → branchId
        mapping(address => mapping(uint64 => uint16)) branchIndexPlusOne; // ví → branchId → vị trí + 1
        mapping(address => mapping(uint64 => uint16)) agentMemberships; // ví → agentId → số chi nhánh đang là thành viên
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.core.access.agent")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant AGENT_ACCESS_STORAGE_SLOT =
        0xf9649f38873517d69ae27f72e96fbd1ae514f39be25fabc3c1d4d2870dd52700;

    function _s() private pure returns (AgentAccessStorage storage $) {
        assembly {
            $.slot := AGENT_ACCESS_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address agents_, address branches_, address history_) external initializer {
        __PlatformAccessed_init(access_);
        if (agents_ == address(0) || branches_ == address(0) || history_ == address(0)) revert ZeroAddress();
        AgentAccessStorage storage $ = _s();
        $.agents = IAgentRegistry(agents_);
        $.branches = IBranchRegistry(branches_);
        $.history = IHistoryIndex(history_);
    }

    // ─── Ghi ────────────────────────────────────────────────────────────

    function grantRole(uint64 branchId, address account, Role role) external whenNotPaused {
        if (role != Role.Staff && role != Role.Manager) revert InvalidRole(role);
        if (account == address(0)) revert ZeroAddress();
        AgentAccessStorage storage $ = _s();

        IBranchRegistry.Branch memory br = $.branches.getBranch(branchId);
        if (br.status != IBranchRegistry.BranchStatus.Active) revert BranchNotActive(branchId);
        $.agents.requireAgentWritable(br.agentId);
        address agentOwner = $.agents.getAgent(br.agentId).owner;

        Member storage m = $.member[branchId][account];
        Role current = m.role;
        if (current == role) revert RoleUnchanged(branchId, account, role);

        // Chủ agent: mọi thay đổi. Manager: chỉ cấp Staff cho ví chưa có vai trò.
        if (msg.sender != agentOwner) {
            bool managerAddsStaff =
                role == Role.Staff && current == Role.None && $.member[branchId][msg.sender].role == Role.Manager;
            if (!managerAddsStaff) revert NotAuthorized(msg.sender, branchId);
        }
        if (account == agentOwner) revert AccountIsAgentOwner(account, br.agentId);
        if (_isPlatformRole(account)) revert AccountIsPlatformRole(account);

        if (current == Role.None) _add(br.agentId, branchId, account);
        m.role = role;
        m.grantedBy = msg.sender;
        m.grantedAt = uint64(block.timestamp);

        emit RoleChanged(EVENT_VERSION, br.agentId, branchId, account, current, role, msg.sender);
        _audit("grant", br.agentId, branchId, abi.encode(account, current), abi.encode(account, role));
    }

    function revokeRole(uint64 branchId, address account) external whenNotPaused {
        AgentAccessStorage storage $ = _s();
        uint64 agentId = $.branches.agentOf(branchId);
        Role current = _memberRole(branchId, account);

        if (msg.sender != $.agents.getAgent(agentId).owner) {
            bool managerRemovesStaff = current == Role.Staff && $.member[branchId][msg.sender].role == Role.Manager;
            if (!managerRemovesStaff) revert NotAuthorized(msg.sender, branchId);
        }
        _remove(agentId, branchId, account, current, "revoke");
    }

    function renounceRole(uint64 branchId) external whenNotPaused {
        uint64 agentId = _s().branches.agentOf(branchId);
        _remove(agentId, branchId, msg.sender, _memberRole(branchId, msg.sender), "renounce");
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function agentRegistry() external view returns (address) {
        return address(_s().agents);
    }

    function branchRegistry() external view returns (address) {
        return address(_s().branches);
    }

    function roleOf(uint64 branchId, address account) external view returns (Role) {
        return _s().member[branchId][account].role;
    }

    /// @dev Chi nhánh không tồn tại hoặc đã xoá, agent đã xoá: mọi ví là None (vai trò đã lưu vẫn giữ để thu hồi).
    function effectiveRoleOf(uint64 branchId, address account) public view returns (Role) {
        AgentAccessStorage storage $ = _s();
        if (account == address(0) || branchId == 0 || branchId > $.branches.branchCount()) return Role.None;
        IBranchRegistry.Branch memory br = $.branches.getBranch(branchId);
        if (br.status == IBranchRegistry.BranchStatus.Deleted) return Role.None;
        IAgentRegistry.Agent memory ag = $.agents.getAgent(br.agentId);
        if (ag.status == IAgentRegistry.AgentStatus.Deleted) return Role.None;
        if (account == ag.owner) return Role.Owner;
        return $.member[branchId][account].role;
    }

    function hasRole(uint64 branchId, address account, Role minRole) public view returns (bool) {
        if (minRole == Role.None) return true;
        return effectiveRoleOf(branchId, account) >= minRole;
    }

    function requireRole(uint64 branchId, address account, Role minRole) external view {
        if (!hasRole(branchId, account, minRole)) revert MissingRole(branchId, account, minRole);
    }

    function getMember(uint64 branchId, address account) external view returns (Member memory) {
        return _s().member[branchId][account];
    }

    function memberCountOf(uint64 branchId) external view returns (uint256) {
        return _s().members[branchId].length;
    }

    function membersOf(uint64 branchId, uint256 offset, uint256 limit) external view returns (MemberView[] memory out) {
        AgentAccessStorage storage $ = _s();
        address[] storage list = $.members[branchId];
        (uint256 start, uint256 end) = _page(list.length, offset, limit);
        out = new MemberView[](end - start);
        for (uint256 i = start; i < end; ++i) {
            address a = list[i];
            Member storage m = $.member[branchId][a];
            out[i - start] = MemberView({account: a, role: m.role, grantedBy: m.grantedBy, grantedAt: m.grantedAt});
        }
    }

    function holdsAgentRole(address account) external view returns (bool) {
        return _s().branchesOf[account].length != 0;
    }

    function membershipCountInAgent(uint64 agentId, address account) external view returns (uint256) {
        return _s().agentMemberships[account][agentId];
    }

    function branchCountOfAccount(address account) external view returns (uint256) {
        return _s().branchesOf[account].length;
    }

    function branchesOfAccount(address account, uint256 offset, uint256 limit)
        external
        view
        returns (uint64[] memory out)
    {
        uint64[] storage list = _s().branchesOf[account];
        (uint256 start, uint256 end) = _page(list.length, offset, limit);
        out = new uint64[](end - start);
        for (uint256 i = start; i < end; ++i) {
            out[i - start] = list[i];
        }
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _memberRole(uint64 branchId, address account) private view returns (Role role) {
        role = _s().member[branchId][account].role;
        if (role == Role.None) revert NotMember(branchId, account);
    }

    function _add(uint64 agentId, uint64 branchId, address account) private {
        AgentAccessStorage storage $ = _s();
        address[] storage list = $.members[branchId];
        if (list.length >= MAX_MEMBERS_PER_BRANCH) revert TooManyMembers(branchId);
        uint64[] storage mine = $.branchesOf[account];
        if (mine.length >= MAX_BRANCHES_PER_ACCOUNT) revert TooManyBranches(account);

        list.push(account);
        // forge-lint: disable-next-line(unsafe-typecast)
        $.member[branchId][account].indexPlusOne = uint16(list.length); // ≤ MAX_MEMBERS_PER_BRANCH
        mine.push(branchId);
        // forge-lint: disable-next-line(unsafe-typecast)
        $.branchIndexPlusOne[account][branchId] = uint16(mine.length); // ≤ MAX_BRANCHES_PER_ACCOUNT
        ++$.agentMemberships[account][agentId]; // ≤ MAX_BRANCHES_PER_ACCOUNT
    }

    function _remove(uint64 agentId, uint64 branchId, address account, Role current, string memory action) private {
        AgentAccessStorage storage $ = _s();

        // swap-pop khỏi danh sách thành viên chi nhánh
        address[] storage list = $.members[branchId];
        uint256 idx = $.member[branchId][account].indexPlusOne - 1;
        address last = list[list.length - 1];
        list[idx] = last;
        // forge-lint: disable-next-line(unsafe-typecast)
        $.member[branchId][last].indexPlusOne = uint16(idx + 1); // idx < MAX_MEMBERS_PER_BRANCH
        list.pop();
        delete $.member[branchId][account];

        // swap-pop khỏi danh sách chi nhánh của ví
        uint64[] storage mine = $.branchesOf[account];
        uint256 bIdx = $.branchIndexPlusOne[account][branchId] - 1;
        uint64 lastBranch = mine[mine.length - 1];
        mine[bIdx] = lastBranch;
        // forge-lint: disable-next-line(unsafe-typecast)
        $.branchIndexPlusOne[account][lastBranch] = uint16(bIdx + 1); // bIdx < MAX_BRANCHES_PER_ACCOUNT
        mine.pop();
        delete $.branchIndexPlusOne[account][branchId];
        --$.agentMemberships[account][agentId];

        emit RoleChanged(EVENT_VERSION, agentId, branchId, account, current, Role.None, msg.sender);
        _audit(action, agentId, branchId, abi.encode(account, current), abi.encode(account, Role.None));
    }

    function _page(uint256 len, uint256 offset, uint256 limit) private pure returns (uint256 start, uint256 end) {
        if (limit > MAX_PAGE) limit = MAX_PAGE;
        start = offset > len ? len : offset;
        end = limit > len - start ? len : start + limit;
    }

    function _audit(string memory action, uint64 agentId, uint64 branchId, bytes memory before, bytes memory after_)
        private
    {
        _writeAudit(_s().history, string.concat("access_", action), agentId, branchId, before, after_, "");
    }
}
