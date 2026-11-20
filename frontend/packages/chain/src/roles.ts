import { normalizeHexAddress, toAddress } from './address'
import type { AgentAccessApi, AgentRegistryApi, BranchRegistryApi } from './api'
import type { PlatformAccessContract } from './contracts/platform-access.contract'
import { asString, unwrapValue } from './normalize'

export const Role = {
  None: 0,
  Staff: 1,
  Manager: 2,
  Owner: 3,
} as const

export type AgentContext =
  | { type: 'owner'; agentId: number }
  | { type: 'manager'; agentId: number; branchIds: number[] }

export type PlatformRole = {
  isOwner: boolean
  isAdmin: boolean
  isPendingOwner: boolean
}

export type AgentMembership = {
  branchId: number
  agentId: number
  role: number
}

export function buildAgentContexts(
  _account: string,
  input: { ownedAgentId: number; branches: AgentMembership[] },
): AgentContext[] {
  const contexts: AgentContext[] = []
  if (input.ownedAgentId > 0) {
    contexts.push({ type: 'owner', agentId: input.ownedAgentId })
  }
  const byAgent = new Map<number, number[]>()
  for (const row of input.branches) {
    if (row.role < Role.Manager) continue
    const list = byAgent.get(row.agentId) ?? []
    list.push(row.branchId)
    byAgent.set(row.agentId, list)
  }
  for (const [agentId, branchIds] of byAgent) {
    branchIds.sort((a, b) => a - b)
    contexts.push({ type: 'manager', agentId, branchIds })
  }
  return contexts
}

export async function resolvePlatformRole(
  access: PlatformAccessContract,
  account: string,
): Promise<PlatformRole> {
  const addr = normalizeHexAddress(account)
  const [owner, pending, admin] = await Promise.all([
    access.owner(),
    access.pendingOwner(),
    access.isPlatformAdmin(account),
  ])
  const ownerAddr = toAddress(asString(unwrapValue(owner)))
  const pendingAddr = toAddress(asString(unwrapValue(pending)))
  const isAdmin = Boolean(unwrapValue(admin))
  return {
    isOwner: ownerAddr.toLowerCase() === addr,
    isAdmin: isAdmin,
    isPendingOwner: pendingAddr.toLowerCase() === addr,
  }
}

export async function resolveAgentContexts(
  account: string,
  deps: {
    agents: AgentRegistryApi
    branches: BranchRegistryApi
    agentAccess: AgentAccessApi
  },
): Promise<AgentContext[]> {
  const owned = await deps.agents.agentIdOf(account)
  const branchIds = await deps.agentAccess.branchesOfAccount(account, 0, 100)
  const memberships: AgentMembership[] = []
  for (const branchId of branchIds) {
    const agentId = await deps.branches.agentOf(branchId)
    const role = await deps.agentAccess.effectiveRoleOf(branchId, account)
    memberships.push({ branchId, agentId, role })
  }
  return buildAgentContexts(account, { ownedAgentId: owned, branches: memberships })
}