// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ILedger} from "../../interfaces/ILedger.sol";
import {IHistoryIndex} from "../../interfaces/IHistoryIndex.sol";
import {FullDBCodec} from "../../libraries/FullDBCodec.sol";

/// @title LedgerRecorder
/// @notice Library liên kết ngoài của Ledger: mã hoá bản ghi FullDB và phát `Posted`.
///         Gọi bằng DELEGATECALL nên `msg.sender` với HistoryIndex và địa chỉ phát event vẫn là Ledger.
///         Tách ra chỉ để Ledger dưới trần 24 KB (luật L5, nợ N3); không giữ state.
library LedgerRecorder {
    uint8 internal constant EVENT_VERSION = 1;
    string internal constant KIND_LEDGER = "ledger";

    /// @notice Ghi FullDB: terms B<branch>, K<kind>, S<actor>, W<customer>?, C<shift>?; values 0 = ts, 1 = amount, 2 = day.
    function record(IHistoryIndex history, uint64 agentId, uint32 d, ILedger.LedgerRecord memory r) external {
        uint256 n = 3 + (r.customer != address(0) ? 1 : 0) + (r.shiftId != 0 ? 1 : 0);
        IHistoryIndex.Term[] memory terms = new IHistoryIndex.Term[](n);
        uint256 k;
        terms[k++] = IHistoryIndex.Term("B", FullDBCodec.toDecimal(r.branchId));
        terms[k++] = IHistoryIndex.Term("K", FullDBCodec.toDecimal(uint8(r.kind)));
        terms[k++] = IHistoryIndex.Term("S", FullDBCodec.toHex(r.actor));
        if (r.customer != address(0)) terms[k++] = IHistoryIndex.Term("W", FullDBCodec.toHex(r.customer));
        if (r.shiftId != 0) terms[k++] = IHistoryIndex.Term("C", FullDBCodec.toDecimal(r.shiftId));
        IHistoryIndex.Value[] memory values = new IHistoryIndex.Value[](3);
        values[0] = IHistoryIndex.Value(0, r.timestamp);
        values[1] = IHistoryIndex.Value(1, r.amount);
        values[2] = IHistoryIndex.Value(2, d);
        history.append(agentId, KIND_LEDGER, abi.encode(r), terms, values);
        _emitPosted(agentId, r);
    }

    function _emitPosted(uint64 agentId, ILedger.LedgerRecord memory r) private {
        emit ILedger.Posted(
            EVENT_VERSION,
            agentId,
            r.branchId,
            r.refId,
            r.kind,
            r.customer,
            r.service,
            r.method,
            r.amount,
            r.tax,
            r.actor,
            r.shiftId
        );
    }
}
