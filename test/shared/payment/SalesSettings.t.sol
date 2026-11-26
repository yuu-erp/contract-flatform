// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformFixture} from "../../utils/PlatformFixture.sol";
import {ISalesSettings} from "../../../src/interfaces/ISalesSettings.sol";
import {IAgentAccess} from "../../../src/interfaces/IAgentAccess.sol";
import {IHistoryIndex} from "../../../src/interfaces/IHistoryIndex.sol";
import {PlatformAuditRecord} from "../../../src/interfaces/IPlatformAudit.sol";

contract SalesSettingsTest is PlatformFixture {
    uint64 internal a;
    uint64 internal b1;
    uint64 internal b2;

    uint8 internal constant CASH = 1;
    uint8 internal constant TRANSFER = 2;
    uint8 internal constant CARD = 4;
    uint8 internal constant WALLET = 8;

    function setUp() public override {
        super.setUp();
        a = _createAgent(agentOwner, NET | IQR);
        b1 = _createBranch(a, "a.vn", NET | IQR);
        b2 = _createBranch(a, "b.vn", NET | IQR);
    }

    function test_tax_agentDefaultAndBranchOverride() public {
        vm.startPrank(agentOwner);
        sales.setAgentTax(a, IQR, 800);
        sales.setBranchTax(b2, IQR, 1000);
        assertEq(sales.taxOf(b1, IQR), 800);
        assertEq(sales.taxOf(b2, IQR), 1000);
        assertEq(sales.agentTaxOf(a, IQR), 800);
        (bool isSet, uint16 bps) = sales.branchTaxOf(b2, IQR);
        assertTrue(isSet);
        assertEq(bps, 1000);
        sales.clearBranchTax(b2, IQR);
        vm.stopPrank();
        assertEq(sales.taxOf(b2, IQR), 800);
        (isSet,) = sales.branchTaxOf(b2, IQR);
        assertFalse(isSet);
    }

    function test_tax_onlyAgentOwner() public {
        _grantManager();
        address[3] memory who = [platformAdmin, platformOwner, branchManager];
        for (uint256 i; i < who.length; ++i) {
            vm.startPrank(who[i]);
            vm.expectRevert(abi.encodeWithSelector(ISalesSettings.NotAgentOwner.selector, who[i], a));
            sales.setAgentTax(a, IQR, 100);
            vm.expectRevert(abi.encodeWithSelector(ISalesSettings.NotAgentOwner.selector, who[i], a));
            sales.setBranchTax(b1, IQR, 100);
            vm.expectRevert(abi.encodeWithSelector(ISalesSettings.NotAgentOwner.selector, who[i], a));
            sales.clearBranchTax(b1, IQR);
            vm.expectRevert(abi.encodeWithSelector(ISalesSettings.NotAgentOwner.selector, who[i], a));
            sales.setTaxExclusive(a, IQR, true);
            vm.expectRevert(abi.encodeWithSelector(ISalesSettings.NotAgentOwner.selector, who[i], a));
            sales.setAgentPaymentMethods(a, 15);
            vm.expectRevert(abi.encodeWithSelector(ISalesSettings.NotAgentOwner.selector, who[i], a));
            sales.setBranchPaymentMethods(b1, 1);
            vm.stopPrank();
        }
    }

    function _grantManager() internal {
        vm.prank(agentOwner);
        agentAccess.grantRole(b1, branchManager, IAgentAccess.Role.Manager);
    }

    function test_tax_rules() public {
        vm.startPrank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.InvalidService.selector, uint16(4)));
        sales.setAgentTax(a, LOYALTY, 100);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.TaxTooHigh.selector, uint16(10_001)));
        sales.setAgentTax(a, IQR, 10_001);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.TaxTooHigh.selector, uint16(10_001)));
        sales.setBranchTax(b1, IQR, 10_001);
        vm.stopPrank();

        vm.prank(platformAdmin);
        branches.suspendBranch(b1, "x");
        vm.startPrank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.BranchNotActive.selector, b1));
        sales.setBranchTax(b1, IQR, 100);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.BranchNotActive.selector, b1));
        sales.clearBranchTax(b1, IQR);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.BranchNotActive.selector, b1));
        sales.setBranchPaymentMethods(b1, 1);
        vm.stopPrank();
    }

    function test_tax_followsOwnerChange() public {
        vm.prank(platformAdmin);
        registry.proposeAgentOwner(a, coOwner);
        vm.prank(coOwner);
        registry.acceptAgentOwner(a);
        vm.prank(agentOwner);
        vm.expectRevert();
        sales.setAgentTax(a, IQR, 1);
        vm.prank(coOwner);
        sales.setAgentTax(a, IQR, 1);
        assertEq(sales.agentTaxOf(a, IQR), 1);
    }

    /// Audit thuế chi nhánh ghi `(service, isSet, bps)` với bps thật, không phải giá trị cộng 1 nội bộ.
    function test_tax_branchAuditEncoding() public {
        vm.startPrank(agentOwner);
        sales.setBranchTax(b1, IQR, 1000);
        PlatformAuditRecord memory r = _lastAudit("sales_tax");
        (uint16 s0, bool set0, uint16 bps0) = abi.decode(r.before, (uint16, bool, uint16));
        (uint16 s1, bool set1, uint16 bps1) = abi.decode(r.after_, (uint16, bool, uint16));
        assertEq(s0, IQR);
        assertFalse(set0);
        assertEq(bps0, 0);
        assertEq(s1, IQR);
        assertTrue(set1);
        assertEq(bps1, 1000);

        sales.clearBranchTax(b1, IQR);
        vm.stopPrank();
        r = _lastAudit("sales_tax");
        (, set0, bps0) = abi.decode(r.before, (uint16, bool, uint16));
        (, set1, bps1) = abi.decode(r.after_, (uint16, bool, uint16));
        assertTrue(set0);
        assertEq(bps0, 1000);
        assertFalse(set1);
        assertEq(bps1, 0);
    }

    function _lastAudit(string memory action) internal view returns (PlatformAuditRecord memory) {
        IHistoryIndex.Query memory q;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("X", action);
        q.sortSlot = -1;
        q.limit = 100;
        IHistoryIndex.Page memory p = historyIndex.search(0, "platform_audit", q);
        return abi.decode(p.data[p.data.length - 1], (PlatformAuditRecord));
    }

    function test_tax_requiresWritableAgent() public {
        vm.prank(platformAdmin);
        registry.suspendAgent(a, "x");
        vm.prank(agentOwner);
        vm.expectRevert();
        sales.setAgentTax(a, IQR, 100);
    }

    function test_taxMode_netOnlyInclusive() public {
        vm.startPrank(agentOwner);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.TaxModeNotAllowed.selector, NET));
        sales.setTaxExclusive(a, NET, true);
        sales.setTaxExclusive(a, NET, false); // cho phép đặt về đã gồm
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.InvalidService.selector, uint16(4)));
        sales.setTaxExclusive(a, LOYALTY, true);
        assertFalse(sales.isTaxExclusive(a, IQR));
        sales.setTaxExclusive(a, IQR, true);
        vm.stopPrank();
        assertTrue(sales.isTaxExclusive(a, IQR));
    }

    function test_quoteTax() public {
        vm.startPrank(agentOwner);
        sales.setAgentTax(a, IQR, 800);
        (uint16 bps, bool ex, uint128 tax, uint128 total) = sales.quoteTax(b1, IQR, 108_000);
        assertEq(bps, 800);
        assertFalse(ex);
        assertEq(tax, 8000);
        assertEq(total, 108_000);

        sales.setTaxExclusive(a, IQR, true);
        (bps, ex, tax, total) = sales.quoteTax(b1, IQR, 100_000);
        assertEq(bps, 800);
        assertTrue(ex);
        assertEq(tax, 8000);
        assertEq(total, 108_000);

        sales.setTaxExclusive(a, IQR, false);
        sales.setAgentTax(a, IQR, 1000);
        (,, tax, total) = sales.quoteTax(b1, IQR, 100_000);
        assertEq(tax, 9090);
        assertEq(total, 100_000);
        vm.stopPrank();
    }

    function test_methods_defaultCashWallet() public {
        assertEq(sales.paymentMethodsOf(b1), 9);
        assertEq(sales.agentPaymentMethodsOf(a), 9);
        sales.requireMethod(b1, CASH);
        sales.requireMethod(b1, WALLET);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.MethodNotEnabled.selector, b1, TRANSFER));
        sales.requireMethod(b1, TRANSFER);
    }

    function test_methods_branchSubsetOfAgent() public {
        vm.startPrank(agentOwner);
        sales.setAgentPaymentMethods(a, 15);
        sales.setBranchPaymentMethods(b2, CASH);
        assertEq(sales.paymentMethodsOf(b2), 1);
        assertEq(sales.paymentMethodsOf(b1), 15);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.InvalidMethods.selector, uint8(16)));
        sales.setBranchPaymentMethods(b2, 16);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.InvalidMethods.selector, uint8(16)));
        sales.setAgentPaymentMethods(a, 16);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.InvalidMethods.selector, uint8(0)));
        sales.setAgentPaymentMethods(a, 0);

        sales.setAgentPaymentMethods(a, 9);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.MethodsNotAllowed.selector, b2, TRANSFER));
        sales.setBranchPaymentMethods(b2, TRANSFER);
        sales.setBranchPaymentMethods(b2, 0); // theo agent
        vm.stopPrank();
        assertEq(sales.paymentMethodsOf(b2), 9);
    }

    function test_methods_shrinkAgentHidesBranchBits() public {
        vm.startPrank(agentOwner);
        sales.setAgentPaymentMethods(a, 15);
        sales.setBranchPaymentMethods(b2, 3);
        sales.setAgentPaymentMethods(a, 9);
        vm.stopPrank();
        assertEq(sales.paymentMethodsOf(b2), 1);
    }

    function test_requireMethod_rejectsMultiBit() public {
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.MethodNotEnabled.selector, b1, uint8(9)));
        sales.requireMethod(b1, 9);
        vm.expectRevert(abi.encodeWithSelector(ISalesSettings.MethodNotEnabled.selector, b1, uint8(0)));
        sales.requireMethod(b1, 0);
    }

    function test_pausedBlocksWrites() public {
        vm.prank(platformOwner);
        access.pause();
        vm.prank(agentOwner);
        vm.expectRevert();
        sales.setAgentTax(a, IQR, 1);
    }

    function test_emitsAndAudits() public {
        vm.startPrank(agentOwner);
        vm.expectEmit(true, true, false, true, address(sales));
        emit ISalesSettings.TaxChanged(1, a, 0, IQR, 0, 800, true, agentOwner);
        sales.setAgentTax(a, IQR, 800);
        vm.expectEmit(true, false, false, true, address(sales));
        emit ISalesSettings.TaxModeChanged(1, a, IQR, true, agentOwner);
        sales.setTaxExclusive(a, IQR, true);
        vm.expectEmit(true, true, false, true, address(sales));
        emit ISalesSettings.PaymentMethodsChanged(1, a, 0, 0, 15, agentOwner);
        sales.setAgentPaymentMethods(a, 15);
        vm.expectEmit(true, true, false, true, address(sales));
        emit ISalesSettings.PaymentMethodsChanged(1, a, b1, 0, 1, agentOwner);
        sales.setBranchPaymentMethods(b1, 1);
        vm.stopPrank();
        assertEq(_auditCount("sales_tax"), 1);
        assertEq(_auditCount("sales_tax_mode"), 1);
        assertEq(_auditCount("sales_methods"), 2);
    }

    function _auditCount(string memory action) internal view returns (uint256) {
        IHistoryIndex.Query memory q;
        q.filters = new IHistoryIndex.Term[](1);
        q.filters[0] = IHistoryIndex.Term("X", action);
        q.sortSlot = -1;
        q.limit = 100;
        return historyIndex.search(0, "platform_audit", q).data.length;
    }
}
