// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../access/PlatformAccessed.sol";
import {IRegistry} from "../../interfaces/IRegistry.sol";
import {IPlatformAccess} from "../../interfaces/IPlatformAccess.sol";

/// @title Registry
/// @notice T0: danh sách module + cầu dao từng module + sổ địa chỉ. Xem `IRegistry`, ADR 0030, 0031.
///         Không biết tên hay nghiệp vụ của module nào: mọi thông tin do module khai báo khi đăng ký.
contract Registry is PlatformAccessed, IRegistry {
    uint8 public constant EVENT_VERSION = 1;
    uint8 public constant MAX_MODULE_ID = 16;
    uint16 public constant FLAG_TAX_INCLUSIVE_ONLY = 1;
    uint16 public constant FLAG_SALES = 2;
    uint256 public constant MAX_NAME = 32;
    uint256 public constant MAX_REASON = 200;

    /// @custom:storage-location erc7201:metaplatform.kernel.registry
    struct RegistryStorage {
        mapping(uint8 => Module) modules;
        uint8[] ids; // thứ tự đăng ký, tối đa 17 phần tử
        mapping(address => uint16) contractModule; // contract → id + 1 (0 = không thuộc module nào)
        mapping(bytes32 => address) addresses;
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.kernel.registry")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REGISTRY_STORAGE_SLOT = 0xa66945989c7fbe7e3bbc86ac2559bbfaf9f28629844894ec0b7365fe43646e00;

    function _r() private pure returns (RegistryStorage storage $) {
        assembly {
            $.slot := REGISTRY_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_) external initializer {
        __PlatformAccessed_init(access_);
    }

    // ─── Ghi ────────────────────────────────────────────────────────────

    function registerModule(
        uint8 id,
        string calldata name,
        uint16 requiresAny,
        uint16 flags,
        uint64 permValid,
        uint64 permManagerOnly
    ) external onlyPlatformOwner whenNotPaused {
        if (id > MAX_MODULE_ID) revert InvalidModuleId(id);
        Module storage m = _r().modules[id];
        if (m.status != ModuleStatus.None) revert ModuleExists(id);
        uint256 n = bytes(name).length;
        if (n == 0 || n > MAX_NAME) revert InvalidModuleName();
        _checkDeclaration(id, requiresAny, permValid, permManagerOnly);
        m.status = ModuleStatus.Active;
        m.requiresAny = requiresAny;
        m.flags = flags;
        m.version = 1;
        m.permValid = permValid;
        m.permManagerOnly = permManagerOnly;
        m.name = name;
        _r().ids.push(id);
        emit ModuleRegistered(EVENT_VERSION, id, name, requiresAny, flags);
        emit ModuleUpdated(EVENT_VERSION, id, 1, requiresAny, flags, permValid, permManagerOnly);
    }

    function updateModule(uint8 id, uint16 requiresAny, uint16 flags, uint64 permValid, uint64 permManagerOnly)
        external
        onlyPlatformOwner
        whenNotPaused
    {
        Module storage m = _known(id);
        if (m.status == ModuleStatus.Retired) revert ModuleIsRetired(id);
        _checkDeclaration(id, requiresAny, permValid, permManagerOnly);
        m.requiresAny = requiresAny;
        m.flags = flags;
        m.permValid = permValid;
        m.permManagerOnly = permManagerOnly;
        uint32 v = ++m.version;
        emit ModuleUpdated(EVENT_VERSION, id, v, requiresAny, flags, permValid, permManagerOnly);
    }

    /// @dev Không gắn `whenNotPaused`: khi sự cố toàn hệ vẫn phải dừng / ngừng được từng module.
    function setModuleStatus(uint8 id, ModuleStatus status, string calldata reason) external {
        Module storage m = _known(id);
        ModuleStatus from = m.status;
        uint256 n = bytes(reason).length;
        if (n == 0 || n > MAX_REASON) revert InvalidReason();
        if (status == ModuleStatus.Retired) {
            if (msg.sender != platformAccess().owner()) revert IPlatformAccess.NotPlatformOwner(msg.sender);
            if (from == ModuleStatus.Retired) revert InvalidModuleStatus(from, status);
        } else if (
            (from == ModuleStatus.Active && status == ModuleStatus.Paused)
                || (from == ModuleStatus.Paused && status == ModuleStatus.Active)
        ) {
            _requirePlatformAdmin();
        } else {
            revert InvalidModuleStatus(from, status);
        }
        m.status = status;
        emit ModuleStatusChanged(EVENT_VERSION, id, from, status, msg.sender, reason);
    }

    function setModuleContract(address contractAddr, uint8 id, bool allowed) external onlyPlatformOwner {
        if (contractAddr == address(0)) revert ZeroAddress();
        _known(id);
        _r().contractModule[contractAddr] = allowed ? uint16(id) + 1 : 0;
        emit ModuleContractSet(EVENT_VERSION, contractAddr, id, allowed);
    }

    function setAddress(bytes32 key, address addr) external onlyPlatformOwner {
        _r().addresses[key] = addr;
        emit AddressSet(EVENT_VERSION, key, addr);
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function getModule(uint8 id) external view returns (Module memory) {
        return _r().modules[id];
    }

    function moduleIds() external view returns (uint8[] memory) {
        return _r().ids;
    }

    function isActive(uint8 id) public view returns (bool) {
        return _r().modules[id].status == ModuleStatus.Active;
    }

    function requireActive(uint8 id) public view {
        ModuleStatus s = _r().modules[id].status;
        if (s != ModuleStatus.Active) revert ModuleNotActive(id, s);
    }

    function moduleOf(address contractAddr) public view returns (bool known, uint8 id) {
        uint16 v = _r().contractModule[contractAddr];
        if (v == 0) return (false, 0);
        return (true, uint8(v - 1));
    }

    function requireActiveModuleOf(address contractAddr) external view returns (uint8 id) {
        bool known;
        (known, id) = moduleOf(contractAddr);
        if (!known) revert ModuleNotActive(0, ModuleStatus.None);
        requireActive(id);
    }

    function serviceBit(uint8 id) public pure returns (uint16) {
        if (id == 0 || id > MAX_MODULE_ID) revert InvalidModuleId(id);
        return uint16(1) << (id - 1);
    }

    function checkServices(uint16 services) external view {
        _checkServices(services, 0);
    }

    function checkServicesChange(uint16 services, uint16 previous) external view {
        _checkServices(services, previous);
    }

    function addressOf(bytes32 key) external view returns (address) {
        return _r().addresses[key];
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _known(uint8 id) private view returns (Module storage m) {
        m = _r().modules[id];
        if (m.status == ModuleStatus.None) revert UnknownModule(id);
    }

    /// @dev `requiresAny` chỉ gồm bit dịch vụ, không gồm chính nó; module 0 (nền tảng) không có phụ thuộc.
    ///      Quyền chỉ Manager phải nằm trong quyền hợp lệ.
    function _checkDeclaration(uint8 id, uint16 requiresAny, uint64 permValid, uint64 permManagerOnly) private pure {
        if (id == 0 && requiresAny != 0) revert InvalidRequires(requiresAny);
        if (id != 0 && (requiresAny & serviceBit(id)) != 0) revert InvalidRequires(requiresAny);
        if (permManagerOnly & ~permValid != 0) revert InvalidPermissions();
    }

    /// @dev Mọi bit bật phải là module đã đăng ký và chưa Retired (trừ bit đã có sẵn trong `previous`);
    ///      phụ thuộc `requiresAny` của từng module phải được thoả. Tối đa 16 vòng.
    function _checkServices(uint16 services, uint16 previous) private view {
        if (services == 0) revert InvalidServices(services);
        RegistryStorage storage $ = _r();
        for (uint8 id = 1; id <= MAX_MODULE_ID; ++id) {
            uint16 bit = uint16(1) << (id - 1);
            if (services & bit == 0) continue;
            Module storage m = $.modules[id];
            if (m.status == ModuleStatus.None) revert InvalidServices(services);
            if (m.status == ModuleStatus.Retired && previous & bit == 0) revert InvalidServices(services);
            if (m.requiresAny != 0 && services & m.requiresAny == 0) revert InvalidServices(services);
        }
    }
}
