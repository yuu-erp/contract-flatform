// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {IBranchRegistry} from "../../src/interfaces/IBranchRegistry.sol";

/// @notice Module giả để kiểm luật R5: mọi hàm ghi gọi `requireWritable` trước, view thì không.
contract MockServiceModule {
    IBranchRegistry public immutable branches;
    uint16 public immutable service;
    mapping(uint64 => uint256) public counter;

    constructor(IBranchRegistry branches_, uint16 service_) {
        branches = branches_;
        service = service_;
    }

    function write(uint64 branchId) external {
        branches.requireWritable(branchId, service);
        ++counter[branchId];
    }

    function read(uint64 branchId) external view returns (uint256) {
        return counter[branchId];
    }
}
