// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../access/PlatformAccessed.sol";
import {PlatformAuditing} from "../history/PlatformAuditing.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";
import {IAgentRegistry} from "../../interfaces/IAgentRegistry.sol";
import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";
import {FullDBCodec} from "../../libraries/FullDBCodec.sol";
import {TextRules} from "../../libraries/TextRules.sol";

/// @title BranchRegistry
/// @notice Chi nhánh, dịch vụ bật, domain, múi giờ, thuế. Một bộ contract cho mọi agent: tạo chi nhánh không deploy gì.
///         - PLATFORM_ADMIN: tạo/sửa/dừng/mở lại/xoá mềm chi nhánh, bật/tắt dịch vụ, đổi domain, chọn chi nhánh chính.
///         - Chủ agent (`AgentRegistry`): đặt thuế. Admin không đặt thuế.
///         Đặc tả: docs/modules/core-operator.md.
contract BranchRegistry is PlatformAccessed, PlatformAuditing, IBranchRegistry {
    uint8 public constant EVENT_VERSION = 1;
    uint8 public constant RECORD_VERSION = 1;
    uint16 public constant SERVICE_NET = 1;
    uint16 public constant SERVICE_IQR = 2;
    uint16 public constant SERVICE_LOYALTY = 4;
    uint16 internal constant SERVICE_ALL = 7;
    uint16 public constant MAX_TAX_BPS = 10_000;
    int16 public constant MIN_TZ = -720;
    int16 public constant MAX_TZ = 840;
    uint256 public constant MAX_NAME = 100;
    uint256 public constant MAX_LOCATION = 200;
    uint256 public constant MAX_NOTE = 500;
    uint256 public constant MAX_REASON = 200;

    /// @custom:storage-location erc7201:metaplatform.core.tenant.branches
    struct BranchesStorage {
        IAgentRegistry agents;
        IHistoryIndex history;
        uint64 branchCount;
        mapping(uint64 => Branch) branches;
        mapping(bytes32 => uint64) branchByDomainHash;
        mapping(uint64 => uint64) mainBranchOf; // agentId → branchId
        mapping(uint64 => uint32) branchCountOf; // agentId → số chi nhánh (kể cả đã xoá)
        mapping(uint64 => mapping(uint16 => uint16)) agentTax; // agentId → service → bps
        mapping(uint64 => mapping(uint16 => uint16)) branchTaxPlusOne; // branchId → service → bps + 1; 0 = chưa đặt
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.core.tenant.branches")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant BRANCHES_STORAGE_SLOT = 0xb910da4d2ef69d67f6a38d7163e447ab5384ca660ed21c2c44cd6fea4d014400;

    function _b() private pure returns (BranchesStorage storage $) {
        assembly {
            $.slot := BRANCHES_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address agents_, address history_) external initializer {
        __PlatformAccessed_init(access_);
        if (agents_ == address(0) || history_ == address(0)) revert ZeroAddress();
        _b().agents = IAgentRegistry(agents_);
        _b().history = IHistoryIndex(history_);
    }

    function KIND_BRANCHES() public pure returns (string memory) {
        return "platform_branches";
    }

    // ─── Ghi (PLATFORM_ADMIN) ───────────────────────────────────────────

    function createBranch(uint64 agentId, BranchInit calldata init)
        external
        onlyPlatformAdmin
        whenNotPaused
        returns (uint64 branchId)
    {
        BranchesStorage storage $ = _b();
        if (!$.agents.isAgentActive(agentId)) revert AgentNotActive(agentId);
        _checkServices(init.services);
        _checkTimezone(init.tzOffsetMinutes);
        _checkProfile(init.profile);
        bytes32 dh = _claimDomain(init.domain, 0);

        branchId = ++$.branchCount;
        bool isMain = $.mainBranchOf[agentId] == 0;
        uint256 docId = _appendProfile(agentId, branchId, init.domain, init.profile);

        Branch storage br = $.branches[branchId];
        br.id = branchId;
        br.agentId = agentId;
        br.status = BranchStatus.Active;
        br.services = init.services;
        br.isMain = isMain;
        br.tzOffsetMinutes = init.tzOffsetMinutes;
        br.domainHash = dh;
        br.createdAt = uint64(block.timestamp);
        br.updatedAt = uint64(block.timestamp);
        br.profileDocId = docId;
        $.branchByDomainHash[dh] = branchId;
        ++$.branchCountOf[agentId];
        if (isMain) $.mainBranchOf[agentId] = branchId;

        emit BranchCreated(EVENT_VERSION, agentId, branchId, init.services, dh, isMain);
        emit BranchStatusChanged(EVENT_VERSION, branchId, BranchStatus.None, BranchStatus.Active, msg.sender, "");
        if (isMain) emit MainBranchChanged(EVENT_VERSION, agentId, 0, branchId);
        _audit("create", agentId, branchId, "", abi.encode(init), "");
    }

    function updateBranchProfile(uint64 branchId, BranchProfile calldata profile)
        external
        onlyPlatformAdmin
        whenNotPaused
    {
        Branch storage br = _editable(branchId);
        _checkProfile(profile);
        BranchesStorage storage $ = _b();
        bytes memory before = $.history.get(br.agentId, KIND_BRANCHES(), br.profileDocId);
        string memory domain = abi.decode(before, (BranchProfileRecord)).domain;
        br.updatedAt = uint64(block.timestamp);
        $.history
            .replace(
                br.agentId, KIND_BRANCHES(), br.profileDocId, _profileRecord(br.agentId, branchId, domain, profile)
            );
        emit BranchProfileUpdated(EVENT_VERSION, br.agentId, branchId, br.profileDocId);
        _audit("update", br.agentId, branchId, before, abi.encode(profile), "");
    }

    function setBranchDomain(uint64 branchId, string calldata domain) external onlyPlatformAdmin whenNotPaused {
        Branch storage br = _editable(branchId);
        BranchesStorage storage $ = _b();
        bytes32 oldHash = br.domainHash;
        bytes32 newHash = _claimDomain(domain, branchId);
        if (newHash == oldHash) return; // không đổi
        delete $.branchByDomainHash[oldHash];
        $.branchByDomainHash[newHash] = branchId;
        br.domainHash = newHash;
        br.updatedAt = uint64(block.timestamp);

        BranchProfileRecord memory rec =
            abi.decode($.history.get(br.agentId, KIND_BRANCHES(), br.profileDocId), (BranchProfileRecord));
        string memory oldDomain = rec.domain;
        rec.domain = domain;
        rec.updatedAt = uint64(block.timestamp);
        $.history.replace(br.agentId, KIND_BRANCHES(), br.profileDocId, abi.encode(rec));

        emit BranchDomainChanged(EVENT_VERSION, branchId, oldHash, newHash);
        _audit("domain", br.agentId, branchId, bytes(oldDomain), bytes(domain), "");
    }

    function setBranchServices(uint64 branchId, uint16 services) external onlyPlatformAdmin whenNotPaused {
        Branch storage br = _editable(branchId);
        _checkServices(services);
        uint16 old = br.services;
        br.services = services;
        br.updatedAt = uint64(block.timestamp);
        emit BranchServicesChanged(EVENT_VERSION, branchId, old, services);
        _audit("services", br.agentId, branchId, abi.encode(old), abi.encode(services), "");
    }

    function setBranchTimezone(uint64 branchId, int16 tzOffsetMinutes) external onlyPlatformAdmin whenNotPaused {
        Branch storage br = _editable(branchId);
        _checkTimezone(tzOffsetMinutes);
        int16 old = br.tzOffsetMinutes;
        br.tzOffsetMinutes = tzOffsetMinutes;
        br.updatedAt = uint64(block.timestamp);
        emit BranchTimezoneChanged(EVENT_VERSION, branchId, old, tzOffsetMinutes);
        _audit("timezone", br.agentId, branchId, abi.encode(old), abi.encode(tzOffsetMinutes), "");
    }

    function setMainBranch(uint64 branchId) external onlyPlatformAdmin whenNotPaused {
        Branch storage br = _editable(branchId);
        if (br.status != BranchStatus.Active) revert BranchNotActive(branchId);
        if (br.isMain) revert AlreadyMainBranch(branchId);
        BranchesStorage storage $ = _b();
        uint64 old = $.mainBranchOf[br.agentId];
        if (old != 0) $.branches[old].isMain = false;
        br.isMain = true;
        br.updatedAt = uint64(block.timestamp);
        $.mainBranchOf[br.agentId] = branchId;
        emit MainBranchChanged(EVENT_VERSION, br.agentId, old, branchId);
        _audit("main", br.agentId, branchId, abi.encode(old), abi.encode(branchId), "");
    }

    function suspendBranch(uint64 branchId, string calldata reason) external onlyPlatformAdmin whenNotPaused {
        _editable(branchId);
        _transition(branchId, BranchStatus.Active, BranchStatus.Suspended, "suspend", reason);
    }

    function resumeBranch(uint64 branchId, string calldata reason) external onlyPlatformAdmin whenNotPaused {
        _editable(branchId);
        _transition(branchId, BranchStatus.Suspended, BranchStatus.Active, "resume", reason);
    }

    /// @dev Được gọi cả khi agent đã xoá (để nhả domain). Chi nhánh chính chỉ xoá được khi agent đã xoá.
    function deleteBranch(uint64 branchId, string calldata reason) external onlyPlatformAdmin whenNotPaused {
        Branch storage br = _existing(branchId);
        BranchStatus from = br.status;
        if (from == BranchStatus.Deleted) revert InvalidStatusTransition(from, BranchStatus.Deleted);
        _checkReason(reason);
        BranchesStorage storage $ = _b();
        uint64 agentId = br.agentId;
        bool agentDeleted = $.agents.getAgent(agentId).status == IAgentRegistry.AgentStatus.Deleted;
        if (br.isMain && !agentDeleted) revert CannotDeleteMainBranch(branchId);

        delete $.branchByDomainHash[br.domainHash];
        br.domainHash = bytes32(0);
        if (br.isMain) {
            br.isMain = false;
            $.mainBranchOf[agentId] = 0;
        }
        br.status = BranchStatus.Deleted;
        br.updatedAt = uint64(block.timestamp);
        emit BranchStatusChanged(EVENT_VERSION, branchId, from, BranchStatus.Deleted, msg.sender, reason);
        _audit("delete", agentId, branchId, abi.encode(from), abi.encode(BranchStatus.Deleted), reason);
    }

    // ─── Ghi (chủ agent): thuế ──────────────────────────────────────────

    function setAgentTax(uint64 agentId, uint16 service, uint16 bps) external whenNotPaused {
        _onlyAgentOwnerWritable(agentId);
        _checkTax(service, bps);
        BranchesStorage storage $ = _b();
        uint16 old = $.agentTax[agentId][service];
        $.agentTax[agentId][service] = bps;
        emit TaxChanged(EVENT_VERSION, agentId, 0, service, old, bps, true, msg.sender);
        _audit("tax", agentId, 0, abi.encode(service, old), abi.encode(service, bps), "");
    }

    function setBranchTax(uint64 branchId, uint16 service, uint16 bps) external whenNotPaused {
        uint64 agentId = _taxableBranch(branchId);
        _checkTax(service, bps);
        BranchesStorage storage $ = _b();
        uint16 oldPlus = $.branchTaxPlusOne[branchId][service];
        $.branchTaxPlusOne[branchId][service] = bps + 1;
        emit TaxChanged(
            EVENT_VERSION, agentId, branchId, service, _effective(oldPlus, agentId, service), bps, true, msg.sender
        );
        _audit("tax", agentId, branchId, abi.encode(service, oldPlus), abi.encode(service, bps + 1), "");
    }

    function clearBranchTax(uint64 branchId, uint16 service) external whenNotPaused {
        uint64 agentId = _taxableBranch(branchId);
        _checkTax(service, 0);
        BranchesStorage storage $ = _b();
        uint16 oldPlus = $.branchTaxPlusOne[branchId][service];
        delete $.branchTaxPlusOne[branchId][service];
        emit TaxChanged(
            EVENT_VERSION,
            agentId,
            branchId,
            service,
            _effective(oldPlus, agentId, service),
            $.agentTax[agentId][service],
            false,
            msg.sender
        );
        _audit("tax", agentId, branchId, abi.encode(service, oldPlus), abi.encode(service, uint16(0)), "");
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function agentRegistry() external view returns (address) {
        return address(_b().agents);
    }

    function getBranch(uint64 branchId) external view returns (Branch memory) {
        return _existing(branchId);
    }

    function getBranchProfile(uint64 branchId) external view returns (BranchProfileRecord memory) {
        Branch storage br = _existing(branchId);
        return abi.decode(_b().history.get(br.agentId, KIND_BRANCHES(), br.profileDocId), (BranchProfileRecord));
    }

    function branchCount() external view returns (uint64) {
        return _b().branchCount;
    }

    function branchCountOf(uint64 agentId) external view returns (uint32) {
        return _b().branchCountOf[agentId];
    }

    function mainBranchOf(uint64 agentId) external view returns (uint64) {
        return _b().mainBranchOf[agentId];
    }

    function agentOf(uint64 branchId) external view returns (uint64) {
        return _existing(branchId).agentId;
    }

    function branchByDomainHash(bytes32 domainHash) external view returns (uint64) {
        return _b().branchByDomainHash[domainHash];
    }

    function branchByDomain(string calldata domain) external view returns (uint64) {
        return _b().branchByDomainHash[keccak256(bytes(domain))];
    }

    function isServiceEnabled(uint64 branchId, uint16 service) external view returns (bool) {
        return _b().branches[branchId].services & service == service && _isSingleService(service);
    }

    function requireWritable(uint64 branchId, uint16 service) external view {
        Branch storage br = _b().branches[branchId];
        if (br.status != BranchStatus.Active) revert BranchNotActive(branchId);
        if (!_isSingleService(service) || br.services & service == 0) revert ServiceNotEnabled(branchId, service);
        _b().agents.requireAgentWritable(br.agentId); // gồm cả kiểm pause toàn hệ
    }

    function taxOf(uint64 branchId, uint16 service) external view returns (uint16) {
        Branch storage br = _existing(branchId);
        return _effective(_b().branchTaxPlusOne[branchId][service], br.agentId, service);
    }

    function agentTaxOf(uint64 agentId, uint16 service) external view returns (uint16) {
        return _b().agentTax[agentId][service];
    }

    function branchTaxOf(uint64 branchId, uint16 service) external view returns (bool isSet, uint16 bps) {
        uint16 plus = _b().branchTaxPlusOne[branchId][service];
        return plus == 0 ? (false, 0) : (true, plus - 1);
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _existing(uint64 branchId) private view returns (Branch storage br) {
        br = _b().branches[branchId];
        if (br.status == BranchStatus.None) revert BranchNotFound(branchId);
    }

    /// @dev Chi nhánh tồn tại, chưa xoá, agent chưa xoá. Agent Suspended vẫn cho admin cấu hình.
    function _editable(uint64 branchId) private view returns (Branch storage br) {
        br = _existing(branchId);
        if (br.status == BranchStatus.Deleted) revert BranchDeleted(branchId);
        if (_b().agents.getAgent(br.agentId).status == IAgentRegistry.AgentStatus.Deleted) {
            revert AgentDeleted(br.agentId);
        }
    }

    function _transition(
        uint64 branchId,
        BranchStatus expected,
        BranchStatus to,
        string memory action,
        string calldata reason
    ) private {
        Branch storage br = _b().branches[branchId];
        BranchStatus from = br.status;
        if (from != expected) revert InvalidStatusTransition(from, to);
        _checkReason(reason);
        br.status = to;
        br.updatedAt = uint64(block.timestamp);
        emit BranchStatusChanged(EVENT_VERSION, branchId, from, to, msg.sender, reason);
        _audit(action, br.agentId, branchId, abi.encode(from), abi.encode(to), reason);
    }

    function _onlyAgentOwnerWritable(uint64 agentId) private view {
        IAgentRegistry agents = _b().agents;
        agents.requireAgentWritable(agentId);
        if (agents.getAgent(agentId).owner != msg.sender) revert NotAgentOwner(msg.sender, agentId);
    }

    /// @dev Thuế chi nhánh: chủ agent, agent Active, chi nhánh Active (R5).
    function _taxableBranch(uint64 branchId) private view returns (uint64 agentId) {
        Branch storage br = _existing(branchId);
        agentId = br.agentId;
        _onlyAgentOwnerWritable(agentId);
        if (br.status != BranchStatus.Active) revert BranchNotActive(branchId);
    }

    function _effective(uint16 branchPlusOne, uint64 agentId, uint16 service) private view returns (uint16) {
        return branchPlusOne != 0 ? branchPlusOne - 1 : _b().agentTax[agentId][service];
    }

    /// @dev Thuế chỉ cho NET và IQR (Loyalty không có thuế).
    function _checkTax(uint16 service, uint16 bps) private pure {
        if (service != SERVICE_NET && service != SERVICE_IQR) revert InvalidService(service);
        if (bps > MAX_TAX_BPS) revert TaxTooHigh(bps);
    }

    /// @dev R1: khác 0, chỉ các bit đã biết; có LOYALTY thì phải có NET hoặc IQR.
    function _checkServices(uint16 s) private pure {
        if (s == 0 || s & ~SERVICE_ALL != 0) revert InvalidServices(s);
        if (s & SERVICE_LOYALTY != 0 && s & (SERVICE_NET | SERVICE_IQR) == 0) revert InvalidServices(s);
    }

    function _isSingleService(uint16 s) private pure returns (bool) {
        return s == SERVICE_NET || s == SERVICE_IQR || s == SERVICE_LOYALTY;
    }

    function _checkTimezone(int16 tz) private pure {
        if (tz < MIN_TZ || tz > MAX_TZ) revert InvalidTimezone(tz);
    }

    function _checkProfile(BranchProfile calldata p) private pure {
        uint256 n = bytes(p.name).length;
        if (n == 0 || n > MAX_NAME) revert InvalidBranchName();
        if (bytes(p.location).length > MAX_LOCATION || bytes(p.note).length > MAX_NOTE) revert FieldTooLong();
        if (!TextRules.isPhone(p.phone)) revert InvalidPhone();
        if (!TextRules.isLonglat(p.longlat)) revert InvalidLonglat();
    }

    function _checkReason(string calldata reason) private pure {
        uint256 n = bytes(reason).length;
        if (n == 0) revert EmptyReason();
        if (n > MAX_REASON) revert FieldTooLong();
    }

    /// @dev R3: domain hợp lệ và chưa thuộc chi nhánh khác (`self` được phép giữ domain của chính nó).
    function _claimDomain(string calldata domain, uint64 self) private view returns (bytes32 dh) {
        if (!TextRules.isDomain(domain)) revert InvalidDomain();
        dh = keccak256(bytes(domain));
        uint64 holder = _b().branchByDomainHash[dh];
        if (holder != 0 && holder != self) revert DomainTaken(dh, holder);
    }

    function _appendProfile(uint64 agentId, uint64 branchId, string calldata domain, BranchProfile calldata profile)
        private
        returns (uint256)
    {
        IHistoryIndex.Term[] memory terms = new IHistoryIndex.Term[](1);
        terms[0] = IHistoryIndex.Term(P_BRANCH, FullDBCodec.toDecimal(branchId));
        IHistoryIndex.Value[] memory values = new IHistoryIndex.Value[](1);
        values[0] = IHistoryIndex.Value(SLOT_TIME, block.timestamp);
        return _b().history
            .append(agentId, KIND_BRANCHES(), _profileRecord(agentId, branchId, domain, profile), terms, values);
    }

    function _profileRecord(uint64 agentId, uint64 branchId, string memory domain, BranchProfile calldata profile)
        private
        view
        returns (bytes memory)
    {
        return abi.encode(
            BranchProfileRecord({
                version: RECORD_VERSION,
                branchId: branchId,
                agentId: agentId,
                domain: domain,
                profile: profile,
                updatedAt: uint64(block.timestamp)
            })
        );
    }

    function _audit(
        string memory action,
        uint64 agentId,
        uint64 branchId,
        bytes memory before,
        bytes memory after_,
        string memory reason
    ) private {
        _writeAudit(_b().history, string.concat("branch_", action), agentId, branchId, before, after_, reason);
    }
}
