import type { AgentAccess } from '@meta-platform/chain'
import { useBranch } from '@meta-platform/chain'
import { BranchOverviewPanel, EmptyState } from '@meta-platform/ui'
import { useOutletContext } from 'react-router-dom'
import { OwnerOverviewPanel } from './OwnerOverviewPanel'

type Ctx = { access: AgentAccess; domain?: string }

export function OverviewPage() {
  const { access, domain } = useOutletContext<Ctx>()
  if (access.kind === 'manager') {
    return <ManagerOverview access={access} />
  }
  if (access.kind === 'owner') {
    return <OwnerOverviewPanel access={access} domain={domain} />
  }
  return <EmptyState title="Không có dữ liệu" />
}

function ManagerOverview({ access }: { access: Extract<AgentAccess, { kind: 'manager' }> }) {
  const branch = useBranch(access.branchId)
  const tz = branch.data?.tzOffsetMinutes ?? 420
  return <BranchOverviewPanel branchId={access.branchId} tzMinutes={tz} />
}