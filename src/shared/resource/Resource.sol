// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../../kernel/access/PlatformAccessed.sol";
import {IResource} from "../../interfaces/IResource.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";
import {IAgentAccess} from "../../interfaces/IAgentAccess.sol";
import {IDelegateRegistry} from "../../interfaces/IDelegateRegistry.sol";
import {IRegistry} from "../../interfaces/IRegistry.sol";

/// @title Resource
/// @notice Sổ định danh thiết bị dùng chung (ADR 0036). Một thiết bị thuộc một chi nhánh và một module đã đăng ký.
///         Khoá ký (`signer`) là ví của chính thiết bị, duy nhất toàn hệ. Không giữ thuộc tính nghiệp vụ của module.
contract Resource is PlatformAccessed, IResource {
    uint8 public constant EVENT_VERSION = 1;
    uint256 public constant MAX_PER_BRANCH = 512;
    uint256 public constant MAX_LABEL = 32;
    uint256 public constant MAX_PAGE = 100;

    /// @custom:storage-location erc7201:metaplatform.shared.resource
    struct ResourceStorage {
        IBranchRegistry branches;
        IAgentAccess agentAccess;
        IDelegateRegistry delegate;
        IRegistry registry;
        uint64 nextId;
        mapping(uint64 => Device) devices;
        mapping(address => uint64) deviceBySigner;
        mapping(uint64 => uint64[]) devicesOfBranch;
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.shared.resource")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant RESOURCE_STORAGE_SLOT = 0x0f9b9824c6a1be17ad5981d221011e643673183f359a06ff2f5cf702dea7be00;

    function _s() private pure returns (ResourceStorage storage $) {
        assembly {
            $.slot := RESOURCE_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address branches_, address agentAccess_, address delegate_, address registry_)
        external
        initializer
    {
        __PlatformAccessed_init(access_);
        if (branches_ == address(0) || agentAccess_ == address(0) || delegate_ == address(0) || registry_ == address(0))
        {
            revert ZeroAddress();
        }
        ResourceStorage storage $ = _s();
        $.branches = IBranchRegistry(branches_);
        $.agentAccess = IAgentAccess(agentAccess_);
        $.delegate = IDelegateRegistry(delegate_);
        $.registry = IRegistry(registry_);
    }

    // ─── Ghi ────────────────────────────────────────────────────────────

    function registerDevice(uint64 branchId, uint8 moduleId, address signer, string calldata label)
        external
        whenNotPaused
        returns (uint64 deviceId)
    {
        address actor = _requireManager(branchId);
        if (signer == address(0)) revert ZeroAddress();
        _checkLabel(label);
        _requireModule(moduleId);

        ResourceStorage storage $ = _s();
        if ($.deviceBySigner[signer] != 0) revert SignerInUse(signer);
        uint64[] storage list = $.devicesOfBranch[branchId];
        if (list.length >= MAX_PER_BRANCH) revert TooManyDevices(branchId);

        deviceId = ++$.nextId;
        $.devices[deviceId] =
            Device({signer: signer, branchId: branchId, moduleId: moduleId, status: Status.Active, label: label});
        $.deviceBySigner[signer] = deviceId;
        list.push(deviceId);
        emit DeviceRegistered(EVENT_VERSION, deviceId, branchId, moduleId, signer, label, actor);
    }

    function setSigner(uint64 deviceId, address signer) external whenNotPaused {
        if (signer == address(0)) revert ZeroAddress();
        ResourceStorage storage $ = _s();
        Device storage d = _existing($, deviceId);
        address actor = _requireManager(d.branchId);
        address old = d.signer;
        if (old == signer) return;
        if ($.deviceBySigner[signer] != 0) revert SignerInUse(signer);
        delete $.deviceBySigner[old];
        d.signer = signer;
        $.deviceBySigner[signer] = deviceId;
        emit DeviceSignerChanged(EVENT_VERSION, deviceId, old, signer, actor);
    }

    function setDeviceStatus(uint64 deviceId, Status status) external whenNotPaused {
        if (status == Status.None) revert InvalidStatus(status);
        ResourceStorage storage $ = _s();
        Device storage d = _existing($, deviceId);
        address actor = _requireManager(d.branchId);
        Status from = d.status;
        if (from == status) revert StatusUnchanged(deviceId, status);
        d.status = status;
        emit DeviceStatusChanged(EVENT_VERSION, deviceId, from, status, actor);
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function getDevice(uint64 deviceId) external view returns (Device memory) {
        return _s().devices[deviceId];
    }

    function deviceOfSigner(address signer) external view returns (uint64 deviceId) {
        return _s().deviceBySigner[signer];
    }

    function devicesOf(uint64 branchId, uint256 offset, uint256 limit) external view returns (uint64[] memory out) {
        uint64[] storage list = _s().devicesOfBranch[branchId];
        (uint256 start, uint256 end) = _page(list.length, offset, limit);
        out = new uint64[](end - start);
        for (uint256 i; i < out.length; ++i) {
            out[i] = list[start + i];
        }
    }

    function requireActiveDevice(address signer, uint8 moduleId)
        external
        view
        returns (uint64 deviceId, uint64 branchId)
    {
        ResourceStorage storage $ = _s();
        deviceId = $.deviceBySigner[signer];
        if (deviceId == 0) revert UnknownSigner(signer);
        Device storage d = $.devices[deviceId];
        if (d.status != Status.Active) revert DeviceNotActive(deviceId);
        if (d.moduleId != moduleId) revert WrongModule(deviceId, moduleId, d.moduleId);
        branchId = d.branchId;
        if ($.branches.getBranch(branchId).status != IBranchRegistry.BranchStatus.Active) {
            revert BranchNotActive(branchId);
        }
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    /// @dev Chi nhánh đang Active; người gọi (sau resolve) là Manager trở lên.
    function _requireManager(uint64 branchId) private view returns (address actor) {
        ResourceStorage storage $ = _s();
        IBranchRegistry.Branch memory br = $.branches.getBranch(branchId);
        if (br.status != IBranchRegistry.BranchStatus.Active) revert BranchNotActive(branchId);
        actor = $.delegate.resolve(br.agentId, msg.sender);
        if ($.agentAccess.effectiveRoleOf(branchId, actor) < IAgentAccess.Role.Manager) {
            revert NotManager(branchId, actor);
        }
    }

    function _requireModule(uint8 moduleId) private view {
        IRegistry.ModuleStatus status = _s().registry.getModule(moduleId).status;
        if (status == IRegistry.ModuleStatus.None) revert UnknownModule(moduleId);
        if (status == IRegistry.ModuleStatus.Retired) revert ModuleRetired(moduleId);
    }

    function _existing(ResourceStorage storage $, uint64 deviceId) private view returns (Device storage d) {
        d = $.devices[deviceId];
        if (d.branchId == 0) revert UnknownDevice(deviceId);
    }

    function _checkLabel(string calldata label) private pure {
        uint256 n = bytes(label).length;
        if (n == 0 || n > MAX_LABEL) revert InvalidLabel();
    }

    function _page(uint256 len, uint256 offset, uint256 limit) private pure returns (uint256 start, uint256 end) {
        if (limit > MAX_PAGE) limit = MAX_PAGE;
        start = offset > len ? len : offset;
        end = limit > len - start ? len : start + limit;
    }
}
