import type { AgentAccess } from '@meta-platform/chain'
import { SCOPE_AGENT, SCOPE_BRANCH } from '@meta-platform/ui'

export type OverviewRollupTarget = { scope: typeof SCOPE_AGENT | typeof SCOPE_BRANCH; id: number }

export function overviewRollupTarget(access: AgentAccess): OverviewRollupTarget | null {
  if (access.kind === 'manager') {
    return { scope: SCOPE_BRANCH, id: access.branchId }
  }
  if (access.kind === 'owner') {
    return { scope: SCOPE_AGENT, id: access.agentId }
  }
  return null
}