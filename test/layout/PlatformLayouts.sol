// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {PlatformAccess} from "../../src/kernel/access/PlatformAccess.sol";
import {PlatformAccessed} from "../../src/kernel/access/PlatformAccessed.sol";
import {HistoryIndex} from "../../src/kernel/history/HistoryIndex.sol";
import {AgentRegistry} from "../../src/tenant/agent/AgentRegistry.sol";
import {BranchRegistry} from "../../src/tenant/branch/BranchRegistry.sol";
import {AgentAccess} from "../../src/tenant/access/AgentAccess.sol";
import {SalesSettings} from "../../src/shared/payment/SalesSettings.sol";
import {Registry} from "../../src/kernel/registry/Registry.sol";
import {IRegistry} from "../../src/interfaces/IRegistry.sol";
import {Ledger} from "../../src/shared/ledger/Ledger.sol";
import {AgentUserRegistry} from "../../src/tenant/user/AgentUserRegistry.sol";
import {IAgentUserRegistry} from "../../src/interfaces/IAgentUserRegistry.sol";
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
}

/// @dev Struct nằm trong mapping: harness riêng để thêm trường vào storage chính không làm lệch vị trí.
contract AgentRegistryRowsLayout {
    IAgentRegistry.Agent internal agentRow;
}

contract BranchRegistryLayout {
    BranchRegistry.BranchesStorage internal s;
}

/// @dev Struct nằm trong mapping: harness riêng để thêm trường vào storage chính không làm lệch vị trí.
contract BranchRegistryRowsLayout {
    IBranchRegistry.Branch internal branchRow;
}

contract AgentAccessLayout {
    AgentAccess.AgentAccessStorage internal s;
}

/// @dev Struct nằm trong mapping: harness riêng để thêm trường vào storage chính không làm lệch vị trí.
contract AgentAccessRowsLayout {
    IAgentAccess.Member internal memberRow;
}

contract SalesSettingsLayout {
    SalesSettings.SettingsStorage internal s;
}

contract LedgerLayout {
    Ledger.LedgerStorage internal s;
}

/// @dev Struct nằm trong mapping: harness riêng để thêm trường vào storage chính không làm lệch vị trí.
contract LedgerRowsLayout {
    ILedger.Entry internal entryRow;
    ILedger.Portion internal portionRow;
}

contract AgentUserRegistryLayout {
    AgentUserRegistry.UsersStorage internal s;
}

/// @dev Struct nằm trong mapping: harness riêng để thêm trường vào storage chính không làm lệch vị trí.
contract AgentUserRegistryRowsLayout {
    IAgentUserRegistry.User internal userRow;
    IAgentUserRegistry.Otp internal otpRow;
}

contract RegistryLayout {
    Registry.RegistryStorage internal s;
}

contract RegistryRowsLayout {
    IRegistry.Module internal moduleRow;
}
