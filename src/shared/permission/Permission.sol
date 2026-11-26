// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../../kernel/access/PlatformAccessed.sol";
import {IPermission} from "../../interfaces/IPermission.sol";
import {IDuty} from "../../interfaces/IDuty.sol";
import {IRegistry} from "../../interfaces/IRegistry.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";
import {IDelegateRegistry} from "../../interfaces/IDelegateRegistry.sol";
import {IAgentAccess} from "../../interfaces/IAgentAccess.sol";

/// @title Permission
/// @notice T2: vị trí theo chi nhánh (mặt nạ quyền theo module) và `can()`. Xem `IPermission`, ADR 0033.
///         Không biết tên module: danh mục quyền đọc từ Registry.
contract Permission is PlatformAccessed, IPermission {
    uint8 public constant EVENT_VERSION = 1;
    uint256 public constant MAX_POSITIONS_PER_BRANCH = 32;
    uint256 public constant MAX_NAME = 50;
    uint256 private constant MAX_MODULES = 17;

    /// @custom:storage-location erc7201:metaplatform.shared.permission
    struct PermissionStorage {
        IBranchRegistry branches;
        IAgentAccess agentAccess;
        IDuty duty;
        uint64 positionCount;
        mapping(uint64 => Position) positions;
        mapping(uint64 => mapping(uint8 => uint64)) masks; // positionId → moduleId → mặt nạ quyền
        mapping(uint64 => uint64[]) positionsOf; // branchId → positionIds (kể cả đã ngừng)
        IDelegateRegistry delegate; // quy ví phiên / địa chỉ đăng nhập về tài khoản (nguyên tắc 7)
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.shared.permission")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant PERMISSION_STORAGE_SLOT =
        0x256d49a630460dcd856e198ccf0672081a1df63d56ebb14fbc031ea99be28900;

    function _s() private pure returns (PermissionStorage storage $) {
        assembly {
            $.slot := PERMISSION_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address branches_, address agentAccess_) external initializer {
        __PlatformAccessed_init(access_);
        if (branches_ == address(0) || agentAccess_ == address(0)) revert ZeroAddress();
        _s().branches = IBranchRegistry(branches_);
        _s().agentAccess = IAgentAccess(agentAccess_);
    }

    /// @notice Nối Duty (deploy sau Permission vì hai contract trỏ nhau). Chỉ PLATFORM_OWNER.
    function setDuty(address duty_) external onlyPlatformOwner {
        if (duty_ == address(0)) revert ZeroAddress();
        _s().duty = IDuty(duty_);
        emit DutySet(EVENT_VERSION, duty_);
    }

    /// @notice Nối DelegateRegistry (quy ví phiên / địa chỉ đăng nhập của Manager về tài khoản). Chỉ owner.
    function setDelegate(address delegate_) external onlyPlatformOwner {
        if (delegate_ == address(0)) revert ZeroAddress();
        _s().delegate = IDelegateRegistry(delegate_);
    }

    function duty() external view returns (address) {
        return address(_s().duty);
    }

    // ─── Ghi (Manager+ của chi nhánh) ───────────────────────────────────

    function createPosition(uint64 branchId, string calldata name, uint8[] calldata moduleIds, uint64[] calldata masks)
        external
        whenNotPaused
        returns (uint64 positionId)
    {
        _requireManager(branchId);
        _checkName(name);
        if (moduleIds.length != masks.length || moduleIds.length > MAX_MODULES) revert LengthMismatch();
        PermissionStorage storage $ = _s();
        uint64[] storage list = $.positionsOf[branchId];
        if (list.length >= MAX_POSITIONS_PER_BRANCH) revert TooManyPositions(branchId);
        positionId = ++$.positionCount;
        $.positions[positionId] = Position({branchId: branchId, active: true, name: name});
        list.push(positionId);
        _emitCreated(branchId, positionId, name);
        for (uint256 i; i < moduleIds.length; ++i) {
            _setMask(positionId, branchId, moduleIds[i], masks[i]);
        }
    }

    function setPositionPerms(uint64 positionId, uint8 moduleId, uint64 mask) external whenNotPaused {
        Position storage p = _editable(positionId);
        _setMask(positionId, p.branchId, moduleId, mask);
    }

    function renamePosition(uint64 positionId, string calldata name) external whenNotPaused {
        Position storage p = _editable(positionId);
        _checkName(name);
        p.name = name;
        emit PositionRenamed(EVENT_VERSION, p.branchId, positionId, name, _me(p.branchId));
    }

    /// @notice Ngừng / dùng lại vị trí. Ngừng thì mọi phiên trực đang dùng vị trí này mất quyền ngay.
    function setPositionActive(uint64 positionId, bool active) external whenNotPaused {
        Position storage p = _existing(positionId);
        _requireManager(p.branchId);
        p.active = active;
        emit PositionActiveSet(EVENT_VERSION, p.branchId, positionId, active, _me(p.branchId));
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function getPosition(uint64 positionId) external view returns (Position memory) {
        return _s().positions[positionId];
    }

    function permsOf(uint64 positionId, uint8 moduleId) external view returns (uint64) {
        return _s().masks[positionId][moduleId];
    }

    function positionsOf(uint64 branchId) external view returns (uint64[] memory) {
        return _s().positionsOf[branchId];
    }

    function positionStatus(uint64 positionId) external view returns (uint64 branchId, bool active) {
        Position storage p = _s().positions[positionId];
        return (p.branchId, p.active);
    }

    /// @notice Xem docs/modules/shared-permission-duty.md mục 2. `account` là tài khoản thật (đã quy ví phiên).
    function can(uint64 branchId, address account, uint8 moduleId, uint8 perm) public view returns (bool) {
        if (perm >= 64) return false;
        PermissionStorage storage $ = _s();
        IRegistry r = IRegistry($.branches.registry());
        IRegistry.Module memory m = r.getModule(moduleId);
        uint64 bit = uint64(1) << perm;
        if (m.status != IRegistry.ModuleStatus.Active || m.permValid & bit == 0) return false;
        if (moduleId != 0 && !$.branches.isServiceEnabled(branchId, r.serviceBit(moduleId))) return false;

        IAgentAccess.Role role = $.agentAccess.effectiveRoleOf(branchId, account);
        if (role >= IAgentAccess.Role.Manager) return true;
        if (role != IAgentAccess.Role.Staff || m.permManagerOnly & bit != 0) return false;

        if (address($.duty) == address(0)) return false;
        (bool onDuty, IDuty.Session memory s) = $.duty.activeSessionOf(branchId, account);
        if (!onDuty) return false;
        Position storage p = $.positions[s.positionId];
        return p.active && p.branchId == branchId && $.masks[s.positionId][moduleId] & bit != 0;
    }

    function requirePermission(uint64 branchId, address account, uint8 moduleId, uint8 perm) external view {
        if (!can(branchId, account, moduleId, perm)) revert NoPermission(branchId, account, moduleId, perm);
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    /// @dev Manager hoặc chủ agent của chi nhánh, chi nhánh đang Active.
    function _requireManager(uint64 branchId) private view {
        PermissionStorage storage $ = _s();
        address me = _me(branchId);
        if ($.agentAccess.effectiveRoleOf(branchId, me) < IAgentAccess.Role.Manager) revert NotManager(branchId, me);
        if ($.branches.getBranch(branchId).status != IBranchRegistry.BranchStatus.Active) {
            revert BranchNotActive(branchId);
        }
    }

    function _emitCreated(uint64 branchId, uint64 positionId, string calldata name) private {
        emit PositionCreated(EVENT_VERSION, branchId, positionId, name, _me(branchId));
    }

    function _me(uint64 branchId) private view returns (address) {
        IDelegateRegistry d = _s().delegate;
        if (address(d) == address(0)) return msg.sender;
        return d.resolve(_s().branches.getBranch(branchId).agentId, msg.sender);
    }

    function _existing(uint64 positionId) private view returns (Position storage p) {
        p = _s().positions[positionId];
        if (p.branchId == 0) revert UnknownPosition(positionId);
    }

    function _editable(uint64 positionId) private view returns (Position storage p) {
        p = _existing(positionId);
        if (!p.active) revert PositionInactive(positionId);
        _requireManager(p.branchId);
    }

    /// @dev Mặt nạ ⊆ quyền hợp lệ của module, không chạm quyền chỉ Manager; module đã đăng ký, chưa Retired.
    function _setMask(uint64 positionId, uint64 branchId, uint8 moduleId, uint64 mask) private {
        IRegistry.Module memory m = IRegistry(_s().branches.registry()).getModule(moduleId);
        if (
            m.status == IRegistry.ModuleStatus.None || m.status == IRegistry.ModuleStatus.Retired
                || mask & ~m.permValid != 0 || mask & m.permManagerOnly != 0
        ) revert InvalidMask(moduleId, mask);
        _s().masks[positionId][moduleId] = mask;
        emit PositionPermsSet(EVENT_VERSION, branchId, positionId, moduleId, mask, _me(branchId));
    }

    function _checkName(string calldata name) private pure {
        uint256 n = bytes(name).length;
        if (n == 0 || n > MAX_NAME) revert InvalidName();
    }
}
