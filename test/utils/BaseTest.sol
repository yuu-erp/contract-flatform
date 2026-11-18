// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MockFullDB} from "./MockFullDB.sol";

/// @notice Lớp test gốc: tạo sẵn các vai trong `README.md` mục "Các bên tham gia"
///         và hàm triển khai contract UUPS sau proxy.
abstract contract BaseTest is Test {
    address internal constant FULLDB_PRECOMPILE = 0x0000000000000000000000000000000000000107;

    // Tầng quản trị hệ thống
    address internal platformOwner;
    address internal platformAdmin;
    address internal platformAdmin2;
    // Tầng agent

    address internal agentOwner;
    address internal coOwner;
    address internal branchManager;
    address internal staff;
    address internal customer;
    address internal customer2;
    address internal stranger;

    function setUp() public virtual {
        platformOwner = makeAddr("platformOwner");
        platformAdmin = makeAddr("platformAdmin");
        platformAdmin2 = makeAddr("platformAdmin2");
        agentOwner = makeAddr("agentOwner");
        coOwner = makeAddr("coOwner");
        branchManager = makeAddr("branchManager");
        staff = makeAddr("staff");
        customer = makeAddr("customer");
        customer2 = makeAddr("customer2");
        stranger = makeAddr("stranger");
        vm.warp(1_767_225_600); // 2026-01-01T00:00:00Z, cố định để test theo ngày ổn định
    }

    /// @dev Triển khai `implementation` sau ERC1967Proxy và gọi `initData` (nếu có).
    function deployProxy(address implementation, bytes memory initData) internal returns (address proxy) {
        proxy = address(new ERC1967Proxy(implementation, initData));
    }

    /// @dev Cài MockFullDB vào đúng địa chỉ precompile, như trên chain MVM.
    function installMockFullDB() internal returns (MockFullDB db) {
        vm.etch(FULLDB_PRECOMPILE, type(MockFullDB).runtimeCode);
        db = MockFullDB(FULLDB_PRECOMPILE);
    }
}
