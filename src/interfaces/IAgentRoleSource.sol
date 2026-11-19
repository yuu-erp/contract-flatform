// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

/// @title IAgentRoleSource
/// @notice Contract giữ vai trò cấp agent (chủ agent, thành viên chi nhánh). `PlatformAccess` hỏi trước khi cấp
///         vai trò nền tảng, để luật "một ví không giữ cả vai nền tảng lẫn vai agent" được kiểm cả hai chiều.
interface IAgentRoleSource {
    /// @notice `true` nếu ví đang giữ một vai trò cấp agent bất kỳ do contract này quản lý.
    function holdsAgentRole(address account) external view returns (bool);
}
