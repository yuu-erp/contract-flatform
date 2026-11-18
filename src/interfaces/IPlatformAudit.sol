// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @notice Bản ghi audit dùng chung của tầng quản trị, lưu FullDB `mp1_platform_audit`: `abi.encode(PlatformAuditRecord)`.
///         Nhãn tìm kiếm: `G<agentId>`, `B<branchId>` (nếu có), `X<action>`, `R<actor>`; value slot 0 = timestamp.
struct PlatformAuditRecord {
    uint8 version;
    address actor;
    string action; // agent_*: create, update, suspend, resume, delete, owner_propose, owner_accept; branch_*: ...
    uint64 agentId;
    uint64 branchId; // 0 nếu thao tác cấp agent
    bytes before;
    bytes after_;
    string reason;
    uint64 timestamp;
}
