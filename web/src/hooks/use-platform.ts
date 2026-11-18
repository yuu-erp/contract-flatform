import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toAddress } from '@/lib/address'
import { useActiveWallet } from '@/hooks/use-active-wallet'
import { useContracts } from '@/hooks/use-contracts'
import type { AgentProfileInput, BranchInitInput } from '@/services/contracts'

export const PAGE_SIZE = 20
const SCAN_CAP = 200

export const platformKeys = {
  roles: (account: string) => ['platform', 'roles', account] as const,
  agents: (offset: number) => ['platform', 'agents', offset] as const,
  branches: (offset: number) => ['platform', 'branches', offset] as const,
  agentBranches: (agentId: number, offset: number) => ['platform', 'agent-branches', agentId, offset] as const,
  members: (branchId: number, offset: number) => ['platform', 'members', branchId, offset] as const,
}

export type BranchRole = { branchId: number; role: number }

export type MyRoles = {
  isAdmin: boolean
  isPlatformOwner: boolean
  isPendingOwner: boolean
  paused: boolean
  agentId: number
  branches: BranchRole[]
}

export function useMyRoles() {
  const contracts = useContracts()
  const { data: wallet } = useActiveWallet()
  const account = wallet?.address ? toAddress(wallet.address) : ''
  return useQuery({
    queryKey: platformKeys.roles(account),
    enabled: Boolean(contracts && account),
    queryFn: async (): Promise<MyRoles> => {
      if (!contracts || !account) {
        return { isAdmin: false, isPlatformOwner: false, isPendingOwner: false, paused: false, agentId: 0, branches: [] }
      }
      const [owner, pending, isAdmin, paused, agentId, ids] = await Promise.all([
        contracts.access.owner(),
        contracts.access.pendingOwner(),
        contracts.access.isPlatformAdmin(account),
        contracts.access.paused(),
        contracts.agents.agentIdOf(account),
        contracts.agentAccess.branchesOfAccount(account, 0, PAGE_SIZE),
      ])
      const branches = await Promise.all(
        ids.map(async (branchId) => ({
          branchId,
          role: await contracts.agentAccess.effectiveRoleOf(branchId, account),
        })),
      )
      const lower = account.toLowerCase()
      return {
        isAdmin,
        isPlatformOwner: owner.toLowerCase() === lower,
        isPendingOwner: pending.toLowerCase() === lower && pending !== '0x0000000000000000000000000000000000000000',
        paused,
        agentId,
        branches,
      }
    },
  })
}

export function useAgentPage(offset: number) {
  const contracts = useContracts()
  return useQuery({
    queryKey: platformKeys.agents(offset),
    enabled: Boolean(contracts),
    queryFn: async () => {
      if (!contracts) return { count: 0, rows: [] }
      const count = await contracts.agents.agentCount()
      const ids: number[] = []
      for (let id = count - offset; id >= 1 && ids.length < PAGE_SIZE; id -= 1) ids.push(id)
      const rows = await Promise.all(
        ids.map(async (id) => {
          const [agent, profile] = await Promise.all([
            contracts.agents.getAgent(id),
            contracts.agents.getAgentProfile(id),
          ])
          return { ...agent, storeName: profile.storeName, storePhone: profile.storePhone }
        }),
      )
      return { count, rows }
    },
  })
}

export function useBranchPage(offset: number) {
  const contracts = useContracts()
  return useQuery({
    queryKey: platformKeys.branches(offset),
    enabled: Boolean(contracts),
    queryFn: async () => {
      if (!contracts) return { count: 0, rows: [] }
      const count = await contracts.branches.branchCount()
      const ids: number[] = []
      for (let id = count - offset; id >= 1 && ids.length < PAGE_SIZE; id -= 1) ids.push(id)
      const rows = await Promise.all(ids.map((id) => contracts.branches.getBranch(id)))
      return { count, rows }
    },
  })
}

export function useBranchesOfAgent(agentId: number, offset: number) {
  const contracts = useContracts()
  return useQuery({
    queryKey: platformKeys.agentBranches(agentId, offset),
    enabled: Boolean(contracts && agentId > 0),
    queryFn: async () => {
      if (!contracts || agentId <= 0) return { rows: [], truncated: false }
      const count = await contracts.branches.branchCount()
      const cap = Math.min(count, SCAN_CAP)
      const matched = []
      for (let id = 1; id <= cap; id += 1) {
        const branch = await contracts.branches.getBranch(id)
        if (Number(branch.agentId) !== agentId) continue
        matched.push(branch)
        if (matched.length >= offset + PAGE_SIZE) break
      }
      return { rows: matched.slice(offset, offset + PAGE_SIZE), truncated: count > SCAN_CAP }
    },
  })
}

export function useMembers(branchId: number, offset: number) {
  const contracts = useContracts()
  return useQuery({
    queryKey: platformKeys.members(branchId, offset),
    enabled: Boolean(contracts && branchId > 0),
    queryFn: async () => {
      if (!contracts || branchId <= 0) return { count: 0, rows: [] }
      const [count, rows] = await Promise.all([
        contracts.agentAccess.memberCountOf(branchId),
        contracts.agentAccess.membersOf(branchId, offset, PAGE_SIZE),
      ])
      return { count, rows }
    },
  })
}

function useRefresh() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['platform'] })
  }
}

export function useCreateAgent() {
  const contracts = useContracts()
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: { owner: string; profile: AgentProfileInput }) => {
      if (!contracts) throw new Error('Chưa có ví hoặc địa chỉ contract')
      await contracts.agents.createAgent(toAddress(input.owner), input.profile)
    },
    onSuccess: refresh,
  })
}

export function useCreateBranch() {
  const contracts = useContracts()
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: { agentId: number; init: BranchInitInput }) => {
      if (!contracts) throw new Error('Chưa có ví hoặc địa chỉ contract')
      await contracts.branches.createBranch(input.agentId, input.init)
    },
    onSuccess: refresh,
  })
}

export function useGrantRole() {
  const contracts = useContracts()
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: { branchId: number; account: string; role: number }) => {
      if (!contracts) throw new Error('Chưa có ví hoặc địa chỉ contract')
      await contracts.agentAccess.grantRole(input.branchId, toAddress(input.account), input.role)
    },
    onSuccess: refresh,
  })
}

export function useRevokeRole() {
  const contracts = useContracts()
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (input: { branchId: number; account: string }) => {
      if (!contracts) throw new Error('Chưa có ví hoặc địa chỉ contract')
      await contracts.agentAccess.revokeRole(input.branchId, toAddress(input.account))
    },
    onSuccess: refresh,
  })
}

export function useRenounceRole() {
  const contracts = useContracts()
  const refresh = useRefresh()
  return useMutation({
    mutationFn: async (branchId: number) => {
      if (!contracts) throw new Error('Chưa có ví hoặc địa chỉ contract')
      await contracts.agentAccess.renounceRole(branchId)
    },
    onSuccess: refresh,
  })
}
