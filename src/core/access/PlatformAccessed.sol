// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IPlatformAccess} from "../../interfaces/IPlatformAccess.sol";

/// @title PlatformAccessed
/// @notice Lớp cha cho mọi contract core/module: hỏi quyền PLATFORM_OWNER / PLATFORM_ADMIN và trạng thái pause
///         từ một PlatformAccess duy nhất; quyền nâng cấp thuộc PLATFORM_OWNER.
abstract contract PlatformAccessed is Initializable, UUPSUpgradeable {
    /// @custom:storage-location erc7201:metaplatform.core.accessed
    struct AccessedStorage {
        IPlatformAccess access;
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.core.accessed")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ACCESSED_STORAGE_SLOT = 0x447e359e46b77906c5e0663a1bef8ff59903d52da3eb3f70d134f12999d77500;

    function _accessed() private pure returns (AccessedStorage storage $) {
        assembly {
            $.slot := ACCESSED_STORAGE_SLOT
        }
    }

    // forge-lint: disable-next-line(mixed-case-function)
    function __PlatformAccessed_init(address access_) internal onlyInitializing {
        if (access_ == address(0)) revert IPlatformAccess.ZeroAddress();
        _accessed().access = IPlatformAccess(access_);
    }

    function platformAccess() public view returns (IPlatformAccess) {
        return _accessed().access;
    }

    modifier onlyPlatformOwner() {
        if (msg.sender != _accessed().access.owner()) revert IPlatformAccess.NotPlatformOwner(msg.sender);
        _;
    }

    /// @notice Owner hoặc admin nền tảng. Owner là vai cao nhất nên làm được mọi việc của admin
    ///         (tạo/sửa/xoá agent, chi nhánh...). Việc chỉ owner làm (nâng cấp, cấu hình hệ) dùng `onlyPlatformOwner`.
    modifier onlyPlatformAdmin() {
        _requirePlatformAdmin();
        _;
    }

    modifier whenNotPaused() {
        _accessed().access.requireNotPaused();
        _;
    }

    function _requirePlatformAdmin() internal view {
        IPlatformAccess a = _accessed().access;
        if (!a.isPlatformAdmin(msg.sender) && msg.sender != a.owner()) {
            revert IPlatformAccess.NotPlatformAdmin(msg.sender);
        }
    }

    function _isPlatformRole(address account) internal view returns (bool) {
        IPlatformAccess a = _accessed().access;
        return account == a.owner() || account == a.pendingOwner() || a.isPlatformAdmin(account);
    }

    function _authorizeUpgrade(address) internal view override onlyPlatformOwner {}
}
