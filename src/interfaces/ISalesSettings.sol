// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title ISalesSettings
/// @notice Cài đặt bán hàng của agent: mức thuế, kiểu giá và phương thức thanh toán. Chỉ chủ agent sửa.
///         Đặc tả: docs/modules/core-sales-settings.md.
interface ISalesSettings {
    // Phương thức thanh toán (bitmask).
    function CASH() external view returns (uint8);
    function TRANSFER() external view returns (uint8);
    function CARD() external view returns (uint8);
    function WALLET() external view returns (uint8);
    function ALL_METHODS() external view returns (uint8);
    function DEFAULT_METHODS() external view returns (uint8);
    function MAX_TAX_BPS() external view returns (uint16);

    error ZeroAddress();
    error NotAgentOwner(address caller, uint64 agentId);
    error BranchNotActive(uint64 branchId);
    error InvalidService(uint16 service);
    error TaxTooHigh(uint16 bps);
    error TaxModeNotAllowed(uint16 service);
    error InvalidMethods(uint8 methods);
    error MethodsNotAllowed(uint64 branchId, uint8 methods);
    error MethodNotEnabled(uint64 branchId, uint8 method);

    /// @notice branchId = 0: mức mặc định của agent. isSet = false: mức riêng chi nhánh bị xoá (về mặc định).
    event TaxChanged(
        uint8 version,
        uint64 indexed agentId,
        uint64 indexed branchId,
        uint16 service,
        uint16 oldBps,
        uint16 newBps,
        bool isSet,
        address by
    );
    event TaxModeChanged(uint8 version, uint64 indexed agentId, uint16 service, bool exclusive, address by);
    /// @notice branchId = 0: tập của agent. Ở chi nhánh, 0 = theo agent.
    event PaymentMethodsChanged(
        uint8 version, uint64 indexed agentId, uint64 indexed branchId, uint8 oldMethods, uint8 newMethods, address by
    );

    function setAgentTax(uint64 agentId, uint16 service, uint16 bps) external;
    function setBranchTax(uint64 branchId, uint16 service, uint16 bps) external;
    function clearBranchTax(uint64 branchId, uint16 service) external;
    function setTaxExclusive(uint64 agentId, uint16 service, bool exclusive) external;
    function setAgentPaymentMethods(uint64 agentId, uint8 methods) external;
    function setBranchPaymentMethods(uint64 branchId, uint8 methods) external;

    function taxOf(uint64 branchId, uint16 service) external view returns (uint16 bps);
    function agentTaxOf(uint64 agentId, uint16 service) external view returns (uint16 bps);
    function branchTaxOf(uint64 branchId, uint16 service) external view returns (bool isSet, uint16 bps);
    function isTaxExclusive(uint64 agentId, uint16 service) external view returns (bool);
    function quoteTax(uint64 branchId, uint16 service, uint128 amount)
        external
        view
        returns (uint16 bps, bool exclusive, uint128 tax, uint128 total);
    function agentPaymentMethodsOf(uint64 agentId) external view returns (uint8);
    function paymentMethodsOf(uint64 branchId) external view returns (uint8);
    function requireMethod(uint64 branchId, uint8 method) external view;
}
