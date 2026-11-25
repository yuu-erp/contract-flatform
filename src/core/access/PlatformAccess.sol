// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IPlatformAccess} from "../../interfaces/IPlatformAccess.sol";
import {IAgentRoleSource} from "../../interfaces/IAgentRoleSource.sol";

/// @title PlatformAccess
/// @notice Tầng quản trị hệ thống. Chỉ có hai vai trò:
///         - PLATFORM_OWNER: owner của OZ `Ownable2StepUpgradeable` (đổi hai bước, không cho renounce);
///           thêm/bớt admin, pause toàn hệ, nâng cấp contract.
///         - PLATFORM_ADMIN: nhiều ví (tối đa MAX_ADMINS); vận hành agent và chi nhánh.
///         Một ví không giữ cả hai vai. Vai trò của agent nằm ở tầng agent, không ở đây; trước khi cấp vai nền tảng,
///         contract hỏi các `agentRoleSources` (AgentRegistry, AgentAccess) để ví đang giữ vai agent bị từ chối.
///         Owner và pause lưu trong namespace ERC-7201 của OZ; danh sách admin ở `metaplatform.core.access`.
contract PlatformAccess is UUPSUpgradeable, Ownable2StepUpgradeable, PausableUpgradeable, IPlatformAccess {
    uint8 public constant EVENT_VERSION = 1;
    uint256 public constant MAX_ADMINS = 50;
    uint256 public constant MAX_ROLE_SOURCES = 4;

    /// @custom:storage-location erc7201:metaplatform.core.access
    struct AccessStorage {
        address[] admins;
        mapping(address => uint256) adminIndexPlusOne; // 0 = không phải admin
        IAgentRoleSource[] agentRoleSources; // hỏi trước khi cấp vai nền tảng
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.core.access")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ACCESS_STORAGE_SLOT = 0xd4aaa022baf93b96e4fc5f84e533ae777e62245fe878d12c4f5867a85aef9000;

    function _s() private pure returns (AccessStorage storage $) {
        assembly {
            $.slot := ACCESS_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner_) external initializer {
        __Ownable_init(owner_); // revert OwnableInvalidOwner(0) nếu owner_ = 0
        __Ownable2Step_init();
        __Pausable_init();
    }

    // ─── Owner (OZ, thêm luật "không giữ hai vai") ──────────────────────

    function owner() public view override(OwnableUpgradeable, IPlatformAccess) returns (address) {
        return super.owner();
    }

    function pendingOwner() public view override(Ownable2StepUpgradeable, IPlatformAccess) returns (address) {
        return super.pendingOwner();
    }

    function transferOwnership(address newOwner) public override(Ownable2StepUpgradeable, IPlatformAccess) onlyOwner {
        if (newOwner != address(0)) {
            if (_s().adminIndexPlusOne[newOwner] != 0) revert OwnerCannotBeAdmin();
            _requireNoAgentRole(newOwner);
        }
        super.transferOwnership(newOwner);
    }

    function acceptOwnership() public override(Ownable2StepUpgradeable, IPlatformAccess) {
        // Kiểm lại lúc nhận: từ lúc đề xuất, ví có thể đã nhận vai trò admin hoặc vai trò agent.
        if (_s().adminIndexPlusOne[msg.sender] != 0) revert OwnerCannotBeAdmin();
        _requireNoAgentRole(msg.sender);
        super.acceptOwnership();
    }

    /// @notice Tắt renounce: hệ không owner thì không nâng cấp, không gỡ pause, không quản admin được nữa.
    function renounceOwnership() public view override onlyOwner {
        revert RenounceDisabled();
    }

    // ─── Admin ──────────────────────────────────────────────────────────

    function addPlatformAdmin(address account) external onlyOwner {
        AccessStorage storage $ = _s();
        if (account == address(0)) revert ZeroAddress();
        if (account == owner() || account == pendingOwner()) revert OwnerCannotBeAdmin();
        if ($.adminIndexPlusOne[account] != 0) revert AlreadyAdmin(account);
        if ($.admins.length >= MAX_ADMINS) revert TooManyAdmins(MAX_ADMINS);
        _requireNoAgentRole(account);
        $.admins.push(account);
        $.adminIndexPlusOne[account] = $.admins.length;
        emit PlatformAdminAdded(EVENT_VERSION, account, msg.sender);
    }

    function removePlatformAdmin(address account) external onlyOwner {
        AccessStorage storage $ = _s();
        uint256 idx = $.adminIndexPlusOne[account];
        if (idx == 0) revert NotAdmin(account);
        uint256 last = $.admins.length;
        if (idx != last) {
            address moved = $.admins[last - 1];
            $.admins[idx - 1] = moved;
            $.adminIndexPlusOne[moved] = idx;
        }
        $.admins.pop();
        delete $.adminIndexPlusOne[account];
        emit PlatformAdminRemoved(EVENT_VERSION, account, msg.sender);
    }

    function isPlatformAdmin(address account) external view returns (bool) {
        return _s().adminIndexPlusOne[account] != 0;
    }

    function platformAdminCount() external view returns (uint256) {
        return _s().admins.length;
    }

    function platformAdmins(uint256 offset, uint256 limit) external view returns (address[] memory page) {
        address[] storage all = _s().admins;
        uint256 len = all.length;
        if (offset >= len) return new address[](0);
        uint256 end = limit > len - offset ? len : offset + limit;
        page = new address[](end - offset);
        for (uint256 i = offset; i < end; ++i) {
            page[i - offset] = all[i];
        }
    }

    // ─── Nguồn vai trò agent ────────────────────────────────────────────

    /// @notice Thay toàn bộ danh sách nguồn (tối đa MAX_ROLE_SOURCES). Chỉ owner. Không kiểm lại ví đã cấp trước đó.
    function setAgentRoleSources(address[] calldata sources) external onlyOwner {
        if (sources.length > MAX_ROLE_SOURCES) revert TooManyRoleSources(MAX_ROLE_SOURCES);
        IAgentRoleSource[] storage list = _s().agentRoleSources;
        while (list.length > 0) list.pop(); // ≤ MAX_ROLE_SOURCES
        for (uint256 i; i < sources.length; ++i) {
            if (sources[i] == address(0)) revert ZeroAddress();
            list.push(IAgentRoleSource(sources[i]));
        }
        emit AgentRoleSourcesSet(EVENT_VERSION, sources, msg.sender);
    }

    function agentRoleSources() external view returns (address[] memory out) {
        IAgentRoleSource[] storage list = _s().agentRoleSources;
        out = new address[](list.length);
        for (uint256 i; i < list.length; ++i) {
            out[i] = address(list[i]);
        }
    }

    function _requireNoAgentRole(address account) private view {
        IAgentRoleSource[] storage list = _s().agentRoleSources;
        for (uint256 i; i < list.length; ++i) {
            if (list[i].holdsAgentRole(account)) revert AccountHasAgentRole(account);
        }
    }

    // ─── Pause (OZ) ─────────────────────────────────────────────────────

    /// @notice Owner hoặc admin. Dừng khẩn cấp là việc vận hành nên admin cũng làm được.
    function pause() external {
        _requireOwnerOrAdmin();
        _pause(); // revert EnforcedPause nếu đã dừng
    }

    /// @notice Owner hoặc admin.
    function unpause() external {
        _requireOwnerOrAdmin();
        _unpause(); // revert ExpectedPause nếu đang chạy
    }

    function _requireOwnerOrAdmin() private view {
        if (msg.sender != owner() && _s().adminIndexPlusOne[msg.sender] == 0) revert NotPlatformAdmin(msg.sender);
    }

    function paused() public view override(PausableUpgradeable, IPlatformAccess) returns (bool) {
        return super.paused();
    }

    function requireNotPaused() external view {
        _requireNotPaused();
    }

    // ─── Upgrade ────────────────────────────────────────────────────────

    function _authorizeUpgrade(address) internal view override onlyOwner {}
}
