import { Role } from './roles'

/** Contract: 3 = Deleted */
export const StatusDeleted = 3

export type AgentAccess =
  | { kind: 'login' }
  | { kind: 'owner'; agentId: number; storeName?: string; focusBranchId?: number; focusDomain?: string }
  | {
      kind: 'manager'
      agentId: number
      branchId: number
      domain: string
      branchName?: string
      storeName?: string
    }
  | {
      kind: 'pick-branch'
      branches: { branchId: number; agentId: number; domain: string; name: string; storeName?: string }[]
    }
  | { kind: 'no-access'; domain?: string; message: string }
  | { kind: 'domain-not-found'; domain: string }

export type ResolveAgentAccessInput = {
  connected: boolean
  domain?: string
  ownedAgentId: number
  storeName?: string
  branchIdByDomain: number
  branchStatus?: number
  agentIdOfBranch?: number
  agentStatus?: number
  roleInBranch?: number
  branchName?: string
  managedBranches: {
    branchId: number
    agentId: number
    domain: string
    name: string
    storeName?: string
  }[]
}

export function resolveAgentAccess(input: ResolveAgentAccessInput): AgentAccess {
  if (!input.connected) {
    return { kind: 'login' }
  }

  const { domain, ownedAgentId, managedBranches } = input

  if (!domain) {
    if (ownedAgentId !== 0) {
      return { kind: 'owner', agentId: ownedAgentId, storeName: input.storeName }
    }
    if (managedBranches.length > 0) {
      return { kind: 'pick-branch', branches: managedBranches }
    }
    return { kind: 'no-access', message: 'Ví này không có quyền truy cập app agent.' }
  }

  if (input.branchIdByDomain === 0) {
    return { kind: 'domain-not-found', domain }
  }

  if (input.branchStatus === StatusDeleted || input.agentStatus === StatusDeleted) {
    return { kind: 'domain-not-found', domain }
  }

  const agentId = input.agentIdOfBranch ?? 0

  if (ownedAgentId !== 0 && ownedAgentId === agentId) {
    return {
      kind: 'owner',
      agentId: ownedAgentId,
      storeName: input.storeName,
      focusBranchId: input.branchIdByDomain,
      focusDomain: domain,
    }
  }

  const role = input.roleInBranch ?? Role.None
  if (role === Role.Manager) {
    return {
      kind: 'manager',
      agentId,
      branchId: input.branchIdByDomain,
      domain,
      branchName: input.branchName,
      storeName: input.storeName,
    }
  }

  return {
    kind: 'no-access',
    domain,
    message: `Ví này không phải quản lý của ${domain}`,
  }
}