// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccessed} from "../../kernel/access/PlatformAccessed.sol";
import {PlatformAuditing} from "../../kernel/history/PlatformAuditing.sol";
import {ISalesSettings} from "../../interfaces/ISalesSettings.sol";
import {IAgentRegistry} from "../../interfaces/IAgentRegistry.sol";
import {IBranchRegistry} from "../../interfaces/IBranchRegistry.sol";
import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";

/// @title SalesSettings
/// @notice Cài đặt bán hàng của agent: thuế (mức, kiểu giá) và phương thức thanh toán. Chỉ chủ agent sửa
///         (admin nền tảng không), agent và chi nhánh phải Active. Đặc tả: docs/modules/core-sales-settings.md.
contract SalesSettings is PlatformAccessed, PlatformAuditing, ISalesSettings {
    uint8 public constant EVENT_VERSION = 1;
    uint16 public constant SERVICE_NET = 1;
    uint16 public constant SERVICE_IQR = 2;
    uint8 public constant CASH = 1;
    uint8 public constant TRANSFER = 2;
    uint8 public constant CARD = 4;
    uint8 public constant WALLET = 8;
    uint8 public constant ALL_METHODS = 15;
    uint8 public constant DEFAULT_METHODS = 9; // CASH | WALLET
    uint16 public constant MAX_TAX_BPS = 10_000;

    /// @custom:storage-location erc7201:metaplatform.core.payment.settings
    struct SettingsStorage {
        IAgentRegistry agents;
        IBranchRegistry branches;
        IHistoryIndex history;
        mapping(uint64 => mapping(uint16 => uint16)) agentTax; // agentId → service → bps
        mapping(uint64 => mapping(uint16 => uint16)) branchTaxPlusOne; // branchId → service → bps + 1; 0 = chưa đặt
        mapping(uint64 => mapping(uint16 => bool)) taxExclusive; // agentId → service → chưa gồm thuế
        mapping(uint64 => uint8) agentMethods; // agentId → bitmask; 0 = mặc định
        mapping(uint64 => uint8) branchMethods; // branchId → bitmask; 0 = theo agent
    }

    // keccak256(abi.encode(uint256(keccak256("metaplatform.core.payment.settings")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant SETTINGS_STORAGE_SLOT = 0xf21d65ad9b718804ea0ddd2cb3d0d7fd991e5998cfa9e3c64d79d21a0f655700;

    function _s() private pure returns (SettingsStorage storage $) {
        assembly {
            $.slot := SETTINGS_STORAGE_SLOT
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address access_, address agents_, address branches_, address history_) external initializer {
        __PlatformAccessed_init(access_);
        if (agents_ == address(0) || branches_ == address(0) || history_ == address(0)) revert ZeroAddress();
        SettingsStorage storage $ = _s();
        $.agents = IAgentRegistry(agents_);
        $.branches = IBranchRegistry(branches_);
        $.history = IHistoryIndex(history_);
    }

    // ─── Ghi (chủ agent): thuế ──────────────────────────────────────────

    /// @notice Set the agent-level default tax rate (bps) for NET or IQR. Agent owner only.
    function setAgentTax(uint64 agentId, uint16 service, uint16 bps) external whenNotPaused {
        _onlyAgentOwnerWritable(agentId);
        _checkTax(service, bps);
        SettingsStorage storage $ = _s();
        uint16 old = $.agentTax[agentId][service];
        $.agentTax[agentId][service] = bps;
        emit TaxChanged(EVENT_VERSION, agentId, 0, service, old, bps, true, msg.sender);
        _audit("tax", agentId, 0, abi.encode(service, old), abi.encode(service, bps));
    }

    /// @notice Override the tax rate for one branch. Agent owner only; branch must be Active.
    function setBranchTax(uint64 branchId, uint16 service, uint16 bps) external whenNotPaused {
        uint64 agentId = _writableBranch(branchId);
        _checkTax(service, bps);
        SettingsStorage storage $ = _s();
        uint16 oldPlus = $.branchTaxPlusOne[branchId][service];
        $.branchTaxPlusOne[branchId][service] = bps + 1;
        emit TaxChanged(
            EVENT_VERSION, agentId, branchId, service, _effective(oldPlus, agentId, service), bps, true, msg.sender
        );
        _audit("tax", agentId, branchId, _branchTaxState(service, oldPlus), _branchTaxState(service, bps + 1));
    }

    /// @notice Remove the branch override so the branch follows the agent rate again.
    function clearBranchTax(uint64 branchId, uint16 service) external whenNotPaused {
        uint64 agentId = _writableBranch(branchId);
        _checkTax(service, 0);
        SettingsStorage storage $ = _s();
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
        _audit("tax", agentId, branchId, _branchTaxState(service, oldPlus), _branchTaxState(service, 0));
    }

    /// @notice Choose tax-exclusive (true) or tax-inclusive (false) pricing. NET is always inclusive.
    function setTaxExclusive(uint64 agentId, uint16 service, bool exclusive) external whenNotPaused {
        _onlyAgentOwnerWritable(agentId);
        _checkService(service);
        if (exclusive && service == SERVICE_NET) revert TaxModeNotAllowed(service);
        SettingsStorage storage $ = _s();
        bool old = $.taxExclusive[agentId][service];
        $.taxExclusive[agentId][service] = exclusive;
        emit TaxModeChanged(EVENT_VERSION, agentId, service, exclusive, msg.sender);
        _audit("tax_mode", agentId, 0, abi.encode(service, old), abi.encode(service, exclusive));
    }

    // ─── Ghi (chủ agent): phương thức thanh toán ────────────────────────

    /// @notice Set the payment methods bitmask of the agent (non-zero, subset of ALL_METHODS).
    function setAgentPaymentMethods(uint64 agentId, uint8 methods) external whenNotPaused {
        _onlyAgentOwnerWritable(agentId);
        if (methods == 0 || (methods & ~ALL_METHODS) != 0) revert InvalidMethods(methods);
        SettingsStorage storage $ = _s();
        uint8 old = $.agentMethods[agentId];
        $.agentMethods[agentId] = methods;
        emit PaymentMethodsChanged(EVENT_VERSION, agentId, 0, old, methods, msg.sender);
        _audit("methods", agentId, 0, abi.encode(old), abi.encode(methods));
    }

    /// @notice Set the branch subset of the agent methods; 0 = follow the agent.
    function setBranchPaymentMethods(uint64 branchId, uint8 methods) external whenNotPaused {
        uint64 agentId = _writableBranch(branchId);
        if ((methods & ~ALL_METHODS) != 0) revert InvalidMethods(methods);
        SettingsStorage storage $ = _s();
        if ((methods & ~_agentEff(agentId)) != 0) revert MethodsNotAllowed(branchId, methods);
        uint8 old = $.branchMethods[branchId];
        $.branchMethods[branchId] = methods;
        emit PaymentMethodsChanged(EVENT_VERSION, agentId, branchId, old, methods, msg.sender);
        _audit("methods", agentId, branchId, abi.encode(old), abi.encode(methods));
    }

    // ─── Đọc ────────────────────────────────────────────────────────────

    function taxOf(uint64 branchId, uint16 service) external view returns (uint16) {
        uint64 agentId = _agentOf(branchId);
        return _effective(_s().branchTaxPlusOne[branchId][service], agentId, service);
    }

    function agentTaxOf(uint64 agentId, uint16 service) external view returns (uint16) {
        return _s().agentTax[agentId][service];
    }

    function branchTaxOf(uint64 branchId, uint16 service) external view returns (bool isSet, uint16 bps) {
        uint16 plus = _s().branchTaxPlusOne[branchId][service];
        return plus == 0 ? (false, 0) : (true, plus - 1);
    }

    function isTaxExclusive(uint64 agentId, uint16 service) external view returns (bool) {
        return _s().taxExclusive[agentId][service];
    }

    /// @notice Tax for `amount`. Inclusive: tax = amount·bps/(10000+bps), total = amount. Exclusive: tax =
    ///         amount·bps/10000, total = amount + tax. Rounded down to 1 đồng.
    function quoteTax(uint64 branchId, uint16 service, uint128 amount)
        external
        view
        returns (uint16 bps, bool exclusive, uint128 tax, uint128 total)
    {
        uint64 agentId = _agentOf(branchId);
        SettingsStorage storage $ = _s();
        bps = _effective($.branchTaxPlusOne[branchId][service], agentId, service);
        exclusive = $.taxExclusive[agentId][service];
        if (exclusive) {
            tax = uint128((uint256(amount) * bps) / MAX_TAX_BPS);
            total = amount + tax;
        } else {
            tax = uint128((uint256(amount) * bps) / (MAX_TAX_BPS + uint256(bps)));
            total = amount;
        }
    }

    function agentPaymentMethodsOf(uint64 agentId) external view returns (uint8) {
        return _agentEff(agentId);
    }

    function paymentMethodsOf(uint64 branchId) public view returns (uint8) {
        uint8 agentEff = _agentEff(_agentOf(branchId));
        uint8 b = _s().branchMethods[branchId];
        return (b == 0 ? agentEff : b) & agentEff;
    }

    /// @notice Reverts unless `method` is exactly one bit and enabled at the branch.
    function requireMethod(uint64 branchId, uint8 method) external view {
        if (method == 0 || (method & (method - 1)) != 0 || (paymentMethodsOf(branchId) & method) == 0) {
            revert MethodNotEnabled(branchId, method);
        }
    }

    // ─── Nội bộ ─────────────────────────────────────────────────────────

    function _agentOf(uint64 branchId) private view returns (uint64) {
        return _s().branches.getBranch(branchId).agentId;
    }

    function _agentEff(uint64 agentId) private view returns (uint8) {
        uint8 m = _s().agentMethods[agentId];
        return m == 0 ? DEFAULT_METHODS : m;
    }

    function _onlyAgentOwnerWritable(uint64 agentId) private view {
        IAgentRegistry agents = _s().agents;
        agents.requireAgentWritable(agentId);
        if (agents.getAgent(agentId).owner != msg.sender) revert NotAgentOwner(msg.sender, agentId);
    }

    /// @dev Cấp chi nhánh: chủ agent, agent Active, chi nhánh Active.
    function _writableBranch(uint64 branchId) private view returns (uint64 agentId) {
        IBranchRegistry.Branch memory br = _s().branches.getBranch(branchId);
        agentId = br.agentId;
        _onlyAgentOwnerWritable(agentId);
        if (br.status != IBranchRegistry.BranchStatus.Active) revert BranchNotActive(branchId);
    }

    function _effective(uint16 branchPlusOne, uint64 agentId, uint16 service) private view returns (uint16) {
        return branchPlusOne != 0 ? branchPlusOne - 1 : _s().agentTax[agentId][service];
    }

    /// @dev Audit thuế chi nhánh: `(service, isSet, bps)` với bps thật (không cộng 1).
    function _branchTaxState(uint16 service, uint16 plusOne) private pure returns (bytes memory) {
        return plusOne == 0 ? abi.encode(service, false, uint16(0)) : abi.encode(service, true, plusOne - 1);
    }

    function _checkService(uint16 service) private pure {
        if (service != SERVICE_NET && service != SERVICE_IQR) revert InvalidService(service);
    }

    function _checkTax(uint16 service, uint16 bps) private pure {
        _checkService(service);
        if (bps > MAX_TAX_BPS) revert TaxTooHigh(bps);
    }

    function _audit(string memory action, uint64 agentId, uint64 branchId, bytes memory before, bytes memory after_)
        private
    {
        _writeAudit(_s().history, string.concat("sales_", action), agentId, branchId, before, after_, "");
    }
}
