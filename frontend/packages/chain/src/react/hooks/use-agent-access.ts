import { useQuery } from '@tanstack/react-query'
import { resolveAgentAccess, type AgentAccess, type ResolveAgentAccessInput } from '../../agent-access'
import { readDomainParam } from '../../read-domain'
import { Role } from '../../roles'
import { type PlatformContracts, useContracts } from '../contracts-context'
import { useActiveWallet } from '../use-active-wallet'
import { withTimeout } from '../../network'

export type { AgentAccess }

function currentDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return readDomainParam(window.location.search)
}

async function loadManagedBranches(
  contracts: PlatformContracts,
  account: string,
): Promise<ResolveAgentAccessInput['managedBranches']> {
  const out: ResolveAgentAccessInput['managedBranches'] = []
  let offset = 0
  const limit = 50
  for (;;) {
    const ids = await contracts.agentAccess.branchesOfAccount(account, offset, limit)
    if (ids.length === 0) break
    for (const branchId of ids) {
      const role = await contracts.agentAccess.effectiveRoleOf(branchId, account)
      if (role < Role.Manager) continue
      const branch = await contracts.branches.getBranch(branchId)
      const profile = await contracts.branches.getBranchProfile(branchId)
      const agentProfile = await contracts.agents.getAgentProfile(branch.agentId)
      out.push({
        branchId,
        agentId: branch.agentId,
        domain: profile.domain.trim().toLowerCase(),
        name: profile.profile.name,
        storeName: agentProfile.profile.storeName,
      })
    }
    offset += ids.length
    if (ids.length < limit) break
  }
  return out
}

async function buildResolveInput(
  contracts: PlatformContracts,
  account: string,
  domain: string | undefined,
): Promise<ResolveAgentAccessInput> {
  const connected = true
  const ownedAgentId = await contracts.agents.agentIdOf(account)
  let storeName: string | undefined
  if (ownedAgentId !== 0) {
    const ap = await contracts.agents.getAgentProfile(ownedAgentId)
    storeName = ap.profile.storeName
  }

  const managedBranches = domain ? [] : await loadManagedBranches(contracts, account)

  if (!domain) {
    return {
      connected,
      domain,
      ownedAgentId,
      storeName,
      branchIdByDomain: 0,
      managedBranches,
    }
  }

  const branchIdByDomain = await contracts.branches.branchByDomain(domain)
  if (branchIdByDomain === 0) {
    return {
      connected,
      domain,
      ownedAgentId,
      storeName,
      branchIdByDomain: 0,
      managedBranches: [],
    }
  }

  const branch = await contracts.branches.getBranch(branchIdByDomain)
  const agentIdOfBranch = await contracts.branches.agentOf(branchIdByDomain)
  const agent = await contracts.agents.getAgent(agentIdOfBranch)
  const roleInBranch = await contracts.agentAccess.effectiveRoleOf(branchIdByDomain, account)
  const branchProfile = await contracts.branches.getBranchProfile(branchIdByDomain)
  let branchStoreName = storeName
  if (ownedAgentId !== agentIdOfBranch) {
    const ap = await contracts.agents.getAgentProfile(agentIdOfBranch)
    branchStoreName = ap.profile.storeName
  }

  return {
    connected,
    domain,
    ownedAgentId,
    storeName: branchStoreName,
    branchIdByDomain,
    branchStatus: branch.status,
    agentIdOfBranch,
    agentStatus: agent.status,
    roleInBranch,
    branchName: branchProfile.profile.name,
    managedBranches: [],
  }
}

export function useAgentAccess() {
  const contracts = useContracts()
  const { data: wallet, isLoading: walletLoading } = useActiveWallet()
  const domain = currentDomain()
  const account = wallet?.address ?? ''

  return useQuery({
    queryKey: ['agentAccess', account, domain, contracts?.from],
    enabled: Boolean(contracts) && !walletLoading,
    queryFn: async (): Promise<AgentAccess> => {
      if (!contracts) {
        return { kind: 'login' }
      }
      if (!account) {
        return resolveAgentAccess({
          connected: false,
          ownedAgentId: 0,
          branchIdByDomain: 0,
          managedBranches: [],
        })
      }
      // RPC chết thì SDK có thể treo: chặn bằng thời hạn để app hiện màn "Lỗi hệ thống".
      const input = await withTimeout(buildResolveInput(contracts, account, domain), 20_000, 'Xác định vai trò')
      return resolveAgentAccess(input)
    },
  })
}