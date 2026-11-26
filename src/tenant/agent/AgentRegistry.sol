// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../../kernel/access/PlatformAccessed.sol";
import {PlatformAuditing} from "../../kernel/history/PlatformAuditing.sol";
import {IAgentRegistry} from "../../interfaces/IAgentRegistry.sol";
import {IAgentAccess} from "../../interfaces/IAgentAccess.sol";
import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";
import {FullDBCodec} from "../../libraries/FullDBCodec.sol";
import {IRegistry} from "../../interfaces/IRegistry.sol";
import {TextRules} from "../../libraries/TextRules.sol";

/// @title AgentRegistry
/// @notice PLATFORM_ADMIN tạo, sửa, dừng, mở lại, xoá mềm agent và đổi ví chủ agent (hai bước).
///         Storage: những gì hàm ghi cần để quyết định (chủ, trạng thái). FullDB: hồ sơ hiển thị và nhật ký audit.
///         Đặc tả: docs/modules/core-operator.md.
contract AgentRegistry is PlatformAccessed, PlatformAuditing, IAgentRegistry {
    uint8 public constant EVENT_VERSION = 1;
    uint8 public constant RECORD_VERSION = 1;
    uint256 public constant MAX_STORE_NAME = 100;
    uint256 public constant MAX_STORE_ADDRESS = 200;
    uint256 public constant MAX_NOTE = 500;
    uint256 public constant MAX_REASON = 200;

    /// @custom:storage-location erc7201:metaplatform.core.tenant.agents
    struct AgentsStorage {
        IHistoryIndex history;
        uint64 agentCount;
        mapping(uint64 => Agent) agents;
        mapping(address => uint64) agentByOwner; // chỉ agent chưa xoá
        IAgentAccess agentAccess; // để từ chối đổi chủ sang thành viên chi nhánh của chính agent
        IRegistry registry; // danh sách module (ADR 0030): kiểm tập dịch vụ được cấp
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.core.tenant.agents")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant AGENTS_STORAGE_SLOT = 0xedf803923c55a0f16904cf3e37d276888338928655d01abb49352257aa4c9f00;

    function _a() private pure returns (AgentsStorage storage $) {
        assembly {
            $.slot := AGENTS_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address history_) external initializer {
        __PlatformAccessed_init(access_);
        if (history_ == address(0)) revert ZeroAddress();
        _a().history = IHistoryIndex(history_);
    }

    function KIND_AGENTS() public pure returns (string memory) {
        return "platform_agents";
    }

    function KIND_AUDIT() public pure returns (string memory) {
        return KIND_PLATFORM_AUDIT;
    }

    function history() external view returns (IHistoryIndex) {
        return _a().history;
    }

    function agentAccess() external view returns (address) {
        return address(_a().agentAccess);
    }

    // ─── Cấu hình (PLATFORM_OWNER) ──────────────────────────────────────

    /// @notice AgentAccess deploy sau AgentRegistry nên nối bằng setter. Chưa nối thì chưa có thành viên nào để kiểm.
    function setAgentAccess(address agentAccess_) external onlyPlatformOwner {
        if (agentAccess_ == address(0)) revert ZeroAddress();
        _a().agentAccess = IAgentAccess(agentAccess_);
        emit AgentAccessSet(EVENT_VERSION, agentAccess_);
    }

    /// @notice Gắn Registry (danh sách module). Chỉ PLATFORM_OWNER.
    function setRegistry(address registry_) external onlyPlatformOwner {
        if (registry_ == address(0)) revert ZeroAddress();
        _a().registry = IRegistry(registry_);
        emit RegistrySet(EVENT_VERSION, registry_);
    }

    function registry() external view returns (address) {
        return address(_a().registry);
    }

    // ─── Ghi (PLATFORM_ADMIN) ───────────────────────────────────────────

    function createAgent(address owner, uint16 allowedServices, AgentProfile calldata profile)
        external
        onlyPlatformAdmin
        whenNotPaused
        returns (uint64 agentId)
    {
        _checkNewOwner(owner, 0);
        _checkProfile(profile);
        _registry().checkServices(allowedServices);
        AgentsStorage storage $ = _a();

        agentId = ++$.agentCount;
        uint64 nowTs = uint64(block.timestamp);

        IHistoryIndex.Term[] memory terms = new IHistoryIndex.Term[](1);
        terms[0] = IHistoryIndex.Term(P_AGENT, FullDBCodec.toDecimal(agentId));
        IHistoryIndex.Value[] memory values = new IHistoryIndex.Value[](1);
        values[0] = IHistoryIndex.Value(SLOT_TIME, nowTs);
        uint256 docId = $.history.append(0, KIND_AGENTS(), _profileRecord(agentId, owner, profile), terms, values);

        $.agents[agentId] = Agent({
            id: agentId,
            owner: owner,
            pendingOwner: address(0),
            status: AgentStatus.Active,
            createdAt: nowTs,
            updatedAt: nowTs,
            profileDocId: docId,
            allowedServices: allowedServices
        });
        $.agentByOwner[owner] = agentId;

        emit AgentCreated(EVENT_VERSION, agentId, owner, docId, allowedServices);
        emit AgentStatusChanged(EVENT_VERSION, agentId, AgentStatus.None, AgentStatus.Active, msg.sender, "");
        _audit("create", agentId, "", abi.encode(owner, allowedServices, profile), "");
    }

    function setAgentServices(uint64 agentId, uint16 allowedServices) external onlyPlatformAdmin whenNotPaused {
        Agent storage ag = _existing(agentId);
        if (ag.status == AgentStatus.Deleted) revert AgentDeleted(agentId);
        uint16 old = ag.allowedServices;
        if (old == allowedServices) return;
        _registry().checkServicesChange(allowedServices, old);
        ag.allowedServices = allowedServices;
        ag.updatedAt = uint64(block.timestamp);
        emit AgentServicesChanged(EVENT_VERSION, agentId, old, allowedServices);
        _audit("services", agentId, abi.encode(old), abi.encode(allowedServices), "");
    }

    function updateAgentProfile(uint64 agentId, AgentProfile calldata profile)
        external
        onlyPlatformAdmin
        whenNotPaused
    {
        Agent storage ag = _existing(agentId);
        if (ag.status == AgentStatus.Deleted) revert AgentDeleted(agentId);
        _checkProfile(profile);
        AgentsStorage storage $ = _a();

        bytes memory before = $.history.get(0, KIND_AGENTS(), ag.profileDocId);
        ag.updatedAt = uint64(block.timestamp);
        bytes memory after_ = _profileRecord(agentId, ag.owner, profile);
        $.history.replace(0, KIND_AGENTS(), ag.profileDocId, after_);

        emit AgentProfileUpdated(EVENT_VERSION, agentId, ag.profileDocId);
        _audit("update", agentId, before, after_, "");
    }

    function suspendAgent(uint64 agentId, string calldata reason) external onlyPlatformAdmin whenNotPaused {
        _transition(agentId, AgentStatus.Active, AgentStatus.Suspended, "suspend", reason);
    }

    function resumeAgent(uint64 agentId, string calldata reason) external onlyPlatformAdmin whenNotPaused {
        _transition(agentId, AgentStatus.Suspended, AgentStatus.Active, "resume", reason);
    }

    function deleteAgent(uint64 agentId, string calldata reason) external onlyPlatformAdmin whenNotPaused {
        Agent storage ag = _existing(agentId);
        AgentStatus from = ag.status;
        if (from == AgentStatus.Deleted) revert InvalidStatusTransition(from, AgentStatus.Deleted);
        _checkReason(reason);

        delete _a().agentByOwner[ag.owner];
        ag.pendingOwner = address(0);
        ag.status = AgentStatus.Deleted;
        ag.updatedAt = uint64(block.timestamp);

        emit AgentStatusChanged(EVENT_VERSION, agentId, from, AgentStatus.Deleted, msg.sender, reason);
        _audit("delete", agentId, abi.encode(from), abi.encode(AgentStatus.Deleted), reason);
    }

    function proposeAgentOwner(uint64 agentId, address newOwner) external onlyPlatformAdmin whenNotPaused {
        Agent storage ag = _existing(agentId);
        if (ag.status == AgentStatus.Deleted) revert AgentDeleted(agentId);
        if (newOwner != address(0)) _checkNewOwner(newOwner, agentId);

        address prevPending = ag.pendingOwner;
        ag.pendingOwner = newOwner;
        ag.updatedAt = uint64(block.timestamp);

        emit AgentOwnerProposed(EVENT_VERSION, agentId, ag.owner, newOwner);
        _audit("owner_propose", agentId, abi.encode(prevPending), abi.encode(newOwner), "");
    }

    function acceptAgentOwner(uint64 agentId) external whenNotPaused {
        Agent storage ag = _existing(agentId);
        if (ag.status == AgentStatus.Deleted) revert AgentDeleted(agentId);
        if (ag.pendingOwner == address(0)) revert NoPendingOwner(agentId);
        if (msg.sender != ag.pendingOwner) revert NotPendingOwner(msg.sender);
        // Kiểm lại: từ lúc đề xuất, ví mới có thể đã thành chủ agent khác, nhận vai trò nền tảng
        // hoặc được cấp vai trò trong một chi nhánh của chính agent này.
        _checkNewOwner(msg.sender, agentId);

        AgentsStorage storage $ = _a();
        address previous = ag.owner;
        delete $.agentByOwner[previous];
        $.agentByOwner[msg.sender] = agentId;
        ag.owner = msg.sender;
        ag.pendingOwner = address(0);
        ag.updatedAt = uint64(block.timestamp);

        AgentProfileRecord memory rec =
            abi.decode($.history.get(0, KIND_AGENTS(), ag.profileDocId), (AgentProfileRecord));
        rec.owner = msg.sender;
        rec.updatedAt = ag.updatedAt;
        $.history.replace(0, KIND_AGENTS(), ag.profileDocId, abi.encode(rec));

        emit AgentOwnerTransferred(EVENT_VERSION, agentId, previous, msg.sender);
        _audit("owner_accept", agentId, abi.encode(previous), abi.encode(msg.sender), "");
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function getAgent(uint64 agentId) external view returns (Agent memory) {
        return _existing(agentId);
    }

    function agentIdOf(address owner) external view returns (uint64) {
        return _a().agentByOwner[owner];
    }

    function agentCount() external view returns (uint64) {
        return _a().agentCount;
    }

    /// @notice Nguồn vai trò cho `PlatformAccess`: ví đang là chủ một agent chưa xoá.
    function holdsAgentRole(address account) external view returns (bool) {
        return _a().agentByOwner[account] != 0;
    }

    function isAgentActive(uint64 agentId) external view returns (bool) {
        return _a().agents[agentId].status == AgentStatus.Active;
    }

    function requireAgentWritable(uint64 agentId) external view returns (uint16 allowedServices) {
        platformAccess().requireNotPaused();
        Agent storage ag = _a().agents[agentId];
        if (ag.status != AgentStatus.Active) revert AgentNotActive(agentId);
        allowedServices = ag.allowedServices;
    }

    function getAgentProfile(uint64 agentId) external view returns (AgentProfileRecord memory) {
        Agent storage ag = _existing(agentId);
        return abi.decode(_a().history.get(0, KIND_AGENTS(), ag.profileDocId), (AgentProfileRecord));
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _registry() private view returns (IRegistry r) {
        r = _a().registry;
        if (address(r) == address(0)) revert RegistryNotSet();
    }

    function _existing(uint64 agentId) private view returns (Agent storage ag) {
        ag = _a().agents[agentId];
        if (ag.status == AgentStatus.None) revert AgentNotFound(agentId);
    }

    function _transition(
        uint64 agentId,
        AgentStatus expected,
        AgentStatus to,
        string memory action,
        string calldata reason
    ) private {
        Agent storage ag = _existing(agentId);
        AgentStatus from = ag.status;
        if (from != expected) revert InvalidStatusTransition(from, to);
        _checkReason(reason);
        ag.status = to;
        ag.updatedAt = uint64(block.timestamp);
        emit AgentStatusChanged(EVENT_VERSION, agentId, from, to, msg.sender, reason);
        _audit(action, agentId, abi.encode(from), abi.encode(to), reason);
    }

    /// @dev Một ví một agent; ví nền tảng (owner, pending owner, admin) không được làm chủ agent.
    ///      Đổi chủ (`agentId` ≠ 0): ví mới không được đang là Manager/Staff của chính agent đó, nếu không vai trò
    ///      cũ bị che khi làm chủ rồi "sống lại" khi quyền chủ chuyển đi. Thành viên phải rời chi nhánh trước.
    function _checkNewOwner(address owner, uint64 agentId) private view {
        if (owner == address(0)) revert ZeroAddress();
        if (_isPlatformRole(owner)) revert OwnerIsPlatformRole(owner);
        AgentsStorage storage $ = _a();
        uint64 existing = $.agentByOwner[owner];
        if (existing != 0) revert OwnerAlreadyHasAgent(owner, existing);
        IAgentAccess aa = $.agentAccess;
        if (agentId != 0 && address(aa) != address(0) && aa.membershipCountInAgent(agentId, owner) != 0) {
            revert OwnerIsAgentMember(owner, agentId);
        }
    }

    function _checkProfile(AgentProfile calldata p) private pure {
        uint256 n = bytes(p.storeName).length;
        if (n == 0 || n > MAX_STORE_NAME) revert InvalidStoreName();
        if (bytes(p.storeAddress).length > MAX_STORE_ADDRESS || bytes(p.note).length > MAX_NOTE) {
            revert FieldTooLong();
        }
        if (!TextRules.isPhone(p.storePhone)) revert InvalidPhone();
    }

    function _checkReason(string calldata reason) private pure {
        uint256 n = bytes(reason).length;
        if (n == 0) revert EmptyReason();
        if (n > MAX_REASON) revert FieldTooLong();
    }

    function _profileRecord(uint64 agentId, address owner, AgentProfile calldata profile)
        private
        view
        returns (bytes memory)
    {
        return abi.encode(
            AgentProfileRecord({
                version: RECORD_VERSION,
                agentId: agentId,
                owner: owner,
                profile: profile,
                updatedAt: uint64(block.timestamp)
            })
        );
    }

    function _audit(
        string memory action,
        uint64 agentId,
        bytes memory before,
        bytes memory after_,
        string memory reason
    ) private {
        _writeAudit(_a().history, string.concat("agent_", action), agentId, 0, before, after_, reason);
    }
}
