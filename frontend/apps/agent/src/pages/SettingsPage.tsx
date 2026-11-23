import { useAgentBranches, type AgentAccess } from '@meta-platform/chain'
import {
  AgentSalesSettingsEditor,
  BranchSalesSettingsReadonly,
  EmptyState,
  PageLoader,
  TaxQuotePreview,
} from '@meta-platform/ui'
import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'

type Ctx = { access: AgentAccess; domain?: string }

export function SettingsPage() {
  const { access } = useOutletContext<Ctx>()
  if (access.kind !== 'owner' && access.kind !== 'manager') {
    return (
      <EmptyState
        title="Không có quyền"
        description="Trang cài đặt chỉ dành cho chủ agent hoặc quản lý chi nhánh."
      />
    )
  }

  if (access.kind === 'manager') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Quản lý chỉ xem cấu hình bán hàng của chi nhánh mình; mọi thay đổi thuế hoặc phương thức do chủ agent thực
          hiện ở app không có <code className="text-xs">?domain=</code> hoặc mở đúng domain với ví chủ.
        </p>
        <BranchSalesSettingsReadonly
          agentId={access.agentId}
          branchId={access.branchId}
          branchName={access.domain}
        />
        <TaxQuotePreview branchId={access.branchId} branchLabel={access.domain} />
      </div>
    )
  }

  return <OwnerSettings agentId={access.agentId} focusBranchId={access.focusBranchId} />
}

function OwnerSettings({ agentId, focusBranchId }: { agentId: number; focusBranchId?: number }) {
  const branches = useAgentBranches(agentId)
  const list = useMemo(
    () =>
      (branches.data?.rows ?? []).map((b) => ({
        branchId: b.record.branchId,
        name: b.record.profile.name,
      })),
    [branches.data],
  )

  if (branches.isLoading) return <PageLoader message="Đang tải chi nhánh…" />
  if (list.length === 0) return <EmptyState title="Chưa có chi nhánh" />

  return <AgentSalesSettingsEditor agentId={agentId} branches={list} focusBranchId={focusBranchId} />
}