// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";
import {PlatformAuditRecord} from "../../interfaces/IPlatformAudit.sol";
import {FullDBCodec} from "../../libraries/FullDBCodec.sol";

/// @title PlatformAuditing
/// @notice Ghi một bản audit vào `mp1_platform_audit` qua HistoryIndex (luật R10). Không có storage.
abstract contract PlatformAuditing {
    uint8 internal constant AUDIT_VERSION = 1;
    string internal constant KIND_PLATFORM_AUDIT = "platform_audit";
    string internal constant P_AGENT = "G";
    string internal constant P_BRANCH = "B";
    string internal constant P_ACTION = "X";
    string internal constant P_ACTOR = "R";
    uint8 internal constant SLOT_TIME = 0;

    function _writeAudit(
        IHistoryIndex history,
        string memory action,
        uint64 agentId,
        uint64 branchId,
        bytes memory before,
        bytes memory after_,
        string memory reason
    ) internal {
        IHistoryIndex.Term[] memory terms = new IHistoryIndex.Term[](branchId == 0 ? 3 : 4);
        terms[0] = IHistoryIndex.Term(P_AGENT, FullDBCodec.toDecimal(agentId));
        terms[1] = IHistoryIndex.Term(P_ACTION, action);
        terms[2] = IHistoryIndex.Term(P_ACTOR, FullDBCodec.toHex(msg.sender));
        if (branchId != 0) terms[3] = IHistoryIndex.Term(P_BRANCH, FullDBCodec.toDecimal(branchId));
        IHistoryIndex.Value[] memory values = new IHistoryIndex.Value[](1);
        values[0] = IHistoryIndex.Value(SLOT_TIME, block.timestamp);
        history.append(
            0,
            KIND_PLATFORM_AUDIT,
            abi.encode(
                PlatformAuditRecord({
                    version: AUDIT_VERSION,
                    actor: msg.sender,
                    action: action,
                    agentId: agentId,
                    branchId: branchId,
                    before: before,
                    after_: after_,
                    reason: reason,
                    timestamp: uint64(block.timestamp)
                })
            ),
            terms,
            values
        );
    }
}
