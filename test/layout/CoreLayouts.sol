// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccess} from "../../src/core/access/PlatformAccess.sol";
import {PlatformAccessed} from "../../src/core/access/PlatformAccessed.sol";
import {HistoryIndex} from "../../src/core/history/HistoryIndex.sol";
import {AgentRegistry} from "../../src/core/tenant/AgentRegistry.sol";
import {BranchRegistry} from "../../src/core/tenant/BranchRegistry.sol";
import {AgentAccess} from "../../src/core/access/AgentAccess.sol";
import {SalesSettings} from "../../src/core/payment/SalesSettings.sol";
import {Ledger} from "../../src/core/ledger/Ledger.sol";
import {ILedger} from "../../src/interfaces/ILedger.sol";
import {IAgentAccess} from "../../src/interfaces/IAgentAccess.sol";
import {IBranchRegistry} from "../../src/interfaces/IBranchRegistry.sol";
import {IAgentRegistry} from "../../src/interfaces/IAgentRegistry.sol";

// Harness chỉ để scripts/storage_layout.py đọc layout của struct namespaced. Không deploy.

contract PlatformAccessLayout {
    PlatformAccess.AccessStorage internal s;
}

contract PlatformAccessedLayout {
    PlatformAccessed.AccessedStorage internal s;
}

contract HistoryIndexLayout {
    HistoryIndex.HistoryStorage internal s;
}

contract AgentRegistryLayout {
    AgentRegistry.AgentsStorage internal s;
    // Agent nằm trong mapping nên phải khai báo riêng để kiểm thứ tự trường
    IAgentRegistry.Agent internal agentRow;
}

contract BranchRegistryLayout {
    BranchRegistry.BranchesStorage internal s;
    // Branch nằm trong mapping nên phải khai báo riêng để kiểm thứ tự trường
    IBranchRegistry.Branch internal branchRow;
}

contract AgentAccessLayout {
    AgentAccess.AgentAccessStorage internal s;
    // Member nằm trong mapping nên phải khai báo riêng để kiểm thứ tự trường
    IAgentAccess.Member internal memberRow;
}

contract SalesSettingsLayout {
    SalesSettings.SettingsStorage internal s;
}

contract LedgerLayout {
    Ledger.LedgerStorage internal s;
    // Entry và Portion nằm trong mapping nên phải khai báo riêng để kiểm thứ tự trường
    ILedger.Entry internal entryRow;
    ILedger.Portion internal portionRow;
}
