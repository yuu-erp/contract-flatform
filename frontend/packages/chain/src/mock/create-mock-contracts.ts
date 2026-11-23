import { normalizeHexAddress } from '../address'
import type { AgentProfile, BranchProfile } from '../decode'
import type { PlatformRole } from '../roles'
import {
  AgentAccessApi,
  AgentRegistryApi,
  BranchRegistryApi,
  LedgerApi,
  PlatformAccessApi,
  SalesSettingsApi,
} from '../api'
import type { AgentAccessContract } from '../contracts/agent-access.contract'
import type { AgentRegistryContract } from '../contracts/agent-registry.contract'
import type { BranchRegistryContract } from '../contracts/branch-registry.contract'
import type { HistoryIndexContract } from '../contracts/history-index.contract'
import type { LedgerContract } from '../contracts/ledger.contract'
import type { PlatformAccessContract } from '../contracts/platform-access.contract'
import type { SalesSettingsContract } from '../contracts/sales-settings.contract'
import type { PlatformContracts } from '../react/contracts-context'
import {
  buildMockState,
  MOCK_ADDRESSES,
  MockStore,
  mockAgentPaymentMethodsOf,
  mockAgentTaxOf,
  mockBranchTaxOf,
  mockPaymentMethodsOf,
  mockQuoteTax,
  mockTaxExclusive,
  PREVIEW_WALLETS,
  type MockPlatformState,
} from './mock-store'
import { ALL_PAYMENT_METHODS, MAX_TAX_BPS, SERVICE_NET } from '../sales-settings'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function simulateTx(store: MockStore, address?: string) {
  store.assertWritable(address)
  await delay(800)
}

export function createMockContracts(seed: number, from: string = PREVIEW_WALLETS.owner): PlatformContracts {
  const state = buildMockState(seed)
  const store = new MockStore(state)

  const access = {
    async platformAdmins(offset: number, limit: number) {
      return { page: state.admins.slice(offset, offset + limit) }
    },
    async paused() {
      return state.paused
    },
    async resolvePlatformRole(account: string): Promise<PlatformRole> {
      const a = normalizeHexAddress(account)
      return {
        isOwner: a === normalizeHexAddress(state.owner),
        isAdmin: state.admins.map(normalizeHexAddress).includes(a),
        isPendingOwner: a === normalizeHexAddress(state.pendingOwner),
      }
    },
    async ownerAddress() {
      return state.owner
    },
    async pendingOwnerAddress() {
      return state.pendingOwner
    },
    async pause() {
      await simulateTx(store)
      state.paused = true
    },
    async unpause() {
      await simulateTx(store)
      state.paused = false
    },
    async addPlatformAdmin(account: string) {
      await simulateTx(store, account)
      state.admins.push(normalizeHexAddress(account))
    },
    async removePlatformAdmin(account: string) {
      await simulateTx(store, account)
      const a = normalizeHexAddress(account)
      state.admins = state.admins.filter((x) => normalizeHexAddress(x) !== a)
    },
    async acceptOwnership() {
      await simulateTx(store)
      state.owner = from
      state.pendingOwner = PREVIEW_WALLETS.none
    },
    async transferOwnership(newOwner: string) {
      await simulateTx(store, newOwner)
      state.pendingOwner = normalizeHexAddress(newOwner)
    },
    async platformAdminCount() {
      return state.admins.length
    },
    async agentRoleSources() {
      return { out: [state.agents[0]!.owner, state.agents[1]!.owner] }
    },
  }

  const agents = {
    async agentCount() {
      return state.agents.length
    },
    async agentIdOf(owner: string) {
      const a = normalizeHexAddress(owner)
      const row = state.agents.find((x) => normalizeHexAddress(x.owner) === a)
      return row?.id ?? 0
    },
    async getAgent(agentId: number) {
      const row = state.agents.find((a) => a.id === agentId)
      if (!row) throw new Error('AgentNotFound')
      return row
    },
    async getAgentProfile(agentId: number) {
      const profile = state.agentProfiles.get(agentId)
      if (!profile) throw new Error('AgentNotFound')
      return profile
    },
    async createAgent(owner: string, allowedServices: number, profile: AgentProfile) {
      await simulateTx(store, owner)
      state.agents.unshift({
        id: state.agents.length + 1,
        owner: normalizeHexAddress(owner),
        pendingOwner: PREVIEW_WALLETS.none,
        status: 0,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        profileDocId: 1n,
        allowedServices,
      })
      void profile
    },
    async updateAgentProfile(agentId: number, profile: AgentProfile) {
      await simulateTx(store)
      const p = state.agentProfiles.get(agentId)
      if (p) p.profile = profile
    },
    async setAgentServices(agentId: number, allowedServices: number) {
      await simulateTx(store)
      const a = state.agents.find((x) => x.id === agentId)
      if (a) a.allowedServices = allowedServices
    },
    async suspendAgent(agentId: number, _reason: string) {
      await simulateTx(store)
      const a = state.agents.find((x) => x.id === agentId)
      if (a) a.status = 1
    },
    async resumeAgent(agentId: number, _reason: string) {
      await simulateTx(store)
      const a = state.agents.find((x) => x.id === agentId)
      if (a) a.status = 0
    },
    async deleteAgent(agentId: number, _reason: string) {
      await simulateTx(store)
      const a = state.agents.find((x) => x.id === agentId)
      if (a) a.status = 2
    },
    async proposeAgentOwner(_agentId: number, newOwner: string) {
      await simulateTx(store, newOwner)
    },
  }

  const branches = {
    async agentOf(branchId: number) {
      return state.branches.find((b) => b.id === branchId)?.agentId ?? 0
    },
    async branchCountOf(agentId: number) {
      return state.branches.filter((b) => b.agentId === agentId).length
    },
    async getBranch(branchId: number) {
      const row = state.branches.find((b) => b.id === branchId)
      if (!row) throw new Error('BranchNotFound')
      return row
    },
    async getBranchProfile(branchId: number) {
      const row = state.branchProfiles.get(branchId)
      if (!row) throw new Error('BranchNotFound')
      return row
    },
    async mainBranchOf(agentId: number) {
      return state.branches.find((b) => b.agentId === agentId && b.isMain)?.id ?? 0
    },
    async branchByDomain(domain: string) {
      const d = domain.trim().toLowerCase()
      for (const profile of state.branchProfiles.values()) {
        if (profile.domain.trim().toLowerCase() === d) return profile.branchId
      }
      return 0
    },
    async createBranch(_agentId: number, _init: unknown) {
      await simulateTx(store)
    },
    async updateBranchProfile(branchId: number, profile: BranchProfile) {
      await simulateTx(store)
      const row = state.branchProfiles.get(branchId)
      if (row) row.profile = profile
    },
    async setBranchDomain(_branchId: number, _domain: string) {
      await simulateTx(store)
    },
    async setBranchServices(_branchId: number, _services: number) {
      await simulateTx(store)
    },
    async setBranchTimezone(_branchId: number, _tz: number) {
      await simulateTx(store)
    },
    async setMainBranch(_branchId: number) {
      await simulateTx(store)
    },
    async suspendBranch(branchId: number, _reason: string) {
      await simulateTx(store)
      const b = state.branches.find((x) => x.id === branchId)
      if (b) b.status = 1
    },
    async resumeBranch(branchId: number, _reason: string) {
      await simulateTx(store)
      const b = state.branches.find((x) => x.id === branchId)
      if (b) b.status = 0
    },
    async deleteBranch(branchId: number, _reason: string) {
      await simulateTx(store)
      const b = state.branches.find((x) => x.id === branchId)
      if (b) b.status = 2
    },
  }

  const upsertMember = (branchId: number, account: string, role: number, grantedBy: string) => {
    const a = normalizeHexAddress(account)
    const list = (state.members.get(branchId) ?? []).filter((m) => normalizeHexAddress(m.account) !== a)
    list.push({
      account: a,
      role,
      grantedBy: normalizeHexAddress(grantedBy),
      grantedAt: Math.floor(Date.now() / 1000),
    })
    state.members.set(branchId, list)
  }

  const agentAccess = {
    async effectiveRoleOf(branchId: number, account: string) {
      const a = normalizeHexAddress(account)
      const agent = state.branches.find((b) => b.id === branchId)?.agentId
      if (agent != null) {
        const ag = state.agents.find((x) => x.id === agent)
        if (ag && ag.status === 3) return 0
        const owner = ag?.owner
        if (owner && normalizeHexAddress(owner) === a) return 3
      }
      const branch = state.branches.find((b) => b.id === branchId)
      if (branch?.status === 3) return 0
      const list = state.members.get(branchId) ?? []
      const hit = list.find((m) => normalizeHexAddress(m.account) === a)
      return hit?.role ?? 0
    },
    async membersOf(branchId: number, offset: number, limit: number) {
      return { out: (state.members.get(branchId) ?? []).slice(offset, offset + limit) }
    },
    async memberCountOf(branchId: number) {
      return (state.members.get(branchId) ?? []).length
    },
    async roleOf(branchId: number, account: string) {
      const a = normalizeHexAddress(account)
      const list = state.members.get(branchId) ?? []
      const hit = list.find((m) => normalizeHexAddress(m.account) === a)
      return hit?.role ?? 0
    },
    async branchesOfAccount(account: string, offset: number, limit: number) {
      const ids: number[] = []
      for (const b of state.branches) {
        const role = await agentAccess.effectiveRoleOf(b.id, account)
        if (role >= 2) ids.push(b.id)
      }
      return { out: ids.slice(offset, offset + limit) }
    },
    async grantRole(branchId: number, account: string, role: number) {
      await simulateTx(store, from)
      if (state.paused) throw new Error('EnforcedPause')
      const branch = state.branches.find((b) => b.id === branchId)
      if (!branch) throw new Error('BranchNotFound')
      if (branch.status !== 1) throw new Error('BranchNotActive')
      const agent = state.agents.find((a) => a.id === branch.agentId)
      if (!agent || agent.status !== 1) throw new Error('AgentNotActive')
      const a = normalizeHexAddress(account)
      if (a === '0x0000000000000000000000000000000000000000') throw new Error('ZeroAddress')
      if (normalizeHexAddress(agent.owner) === a) throw new Error('AccountIsAgentOwner')
      const platformOwner = normalizeHexAddress(state.owner)
      if (a === platformOwner || a === normalizeHexAddress(state.pendingOwner)) throw new Error('AccountIsPlatformRole')
      if (state.admins.map(normalizeHexAddress).includes(a)) throw new Error('AccountIsPlatformRole')
      const list = state.members.get(branchId) ?? []
      if (list.length >= 200) throw new Error('TooManyMembers')
      const current = list.find((m) => normalizeHexAddress(m.account) === a)
      if (current && current.role === role) throw new Error('RoleUnchanged')
      upsertMember(branchId, account, role, from)
    },
    async revokeRole(branchId: number, account: string) {
      await simulateTx(store, from)
      if (state.paused) throw new Error('EnforcedPause')
      const a = normalizeHexAddress(account)
      const list = state.members.get(branchId) ?? []
      if (!list.some((m) => normalizeHexAddress(m.account) === a)) throw new Error('NotMember')
      state.members.set(
        branchId,
        list.filter((m) => normalizeHexAddress(m.account) !== a),
      )
    },
    async renounceRole(branchId: number) {
      await simulateTx(store, from)
      if (state.paused) throw new Error('EnforcedPause')
      const a = normalizeHexAddress(from)
      const list = state.members.get(branchId) ?? []
      if (!list.some((m) => normalizeHexAddress(m.account) === a)) throw new Error('NotMember')
      state.members.set(
        branchId,
        list.filter((m) => normalizeHexAddress(m.account) !== a),
      )
    },
  }

  const ledger = {
    async rollup(scope: number, id: number, fromDay: number, toDay: number) {
      return { out: store.sliceRollup(scope, id, fromDay, toDay) }
    },
    async bucketsOf(agentId: number, customer: string) {
      const key = `${agentId}:${normalizeHexAddress(customer)}`
      return state.walletBuckets.get(key) ?? []
    },
    async portionsOf(_refId: string) {
      return [] as { branchId: number; amount: bigint }[]
    },
    async entryOf(_refId: string) {
      return {
        kind: 3,
        method: 1,
        service: 1,
        taxBps: 800,
        branchId: 1,
        customer: PREVIEW_WALLETS.none,
        amount: 1_000_000n,
        refunded: 0n,
      }
    },
    async balanceOf(agentId: number, customer: string) {
      const key = `${agentId}:${normalizeHexAddress(customer)}`
      return { sum: state.walletBalance.get(key) ?? 0n }
    },
    async walletLiability(agentId: number) {
      return state.walletLiability.get(agentId) ?? 0n
    },
    async posterKinds(poster: string) {
      const a = normalizeHexAddress(poster)
      if (a === normalizeHexAddress(state.poster.address)) return state.poster.mask
      return 0
    },
    async setPoster(poster: string, kindsMask: number) {
      await simulateTx(store, poster)
      state.poster = { address: normalizeHexAddress(poster), mask: kindsMask }
    },
  }

  const assertAgentOwner = (agentId: number) => {
    const row = state.agents.find((a) => a.id === agentId)
    if (!row) throw new Error('AgentNotFound')
    if (normalizeHexAddress(row.owner) !== normalizeHexAddress(from)) throw new Error('NotAgentOwner')
    if (row.status !== 1) throw new Error('AgentNotActive')
  }

  const writableBranch = (branchId: number) => {
    const br = state.branches.find((b) => b.id === branchId)
    if (!br) throw new Error('BranchNotFound')
    assertAgentOwner(br.agentId)
    if (br.status !== 1) throw new Error('BranchNotActive')
    return br
  }

  const salesSettings = {
    async quoteTax(branchId: number, service: number, amount: bigint) {
      return mockQuoteTax(state, state.branches, Number(branchId), Number(service), amount)
    },
    async branchTaxOf(branchId: number, service: number) {
      return mockBranchTaxOf(state, Number(branchId), Number(service))
    },
    async agentTaxOf(agentId: number, service: number) {
      return mockAgentTaxOf(state, Number(agentId), Number(service))
    },
    async agentPaymentMethodsOf(agentId: number) {
      return mockAgentPaymentMethodsOf(state, Number(agentId))
    },
    async paymentMethodsOf(branchId: number) {
      return mockPaymentMethodsOf(state, state.branches, Number(branchId))
    },
    async isTaxExclusive(agentId: number, service: number) {
      return mockTaxExclusive(state, Number(agentId), Number(service))
    },
    async setAgentTax(agentId: number, service: number, bps: number) {
      await simulateTx(store, from)
      assertAgentOwner(Number(agentId))
      const s = Number(service)
      const v = Number(bps)
      if (v > MAX_TAX_BPS) throw new Error('TaxTooHigh')
      const row = state.sales.agentTax.get(Number(agentId)) ?? {}
      row[s] = v
      state.sales.agentTax.set(Number(agentId), row)
    },
    async setBranchTax(branchId: number, service: number, bps: number) {
      await simulateTx(store, from)
      writableBranch(Number(branchId))
      const v = Number(bps)
      if (v > MAX_TAX_BPS) throw new Error('TaxTooHigh')
      const cur = state.sales.branchTaxPlus.get(Number(branchId)) ?? {}
      cur[Number(service)] = v
      state.sales.branchTaxPlus.set(Number(branchId), cur)
    },
    async clearBranchTax(branchId: number, service: number) {
      await simulateTx(store, from)
      writableBranch(Number(branchId))
      const cur = state.sales.branchTaxPlus.get(Number(branchId))
      if (!cur) return
      delete cur[Number(service)]
      state.sales.branchTaxPlus.set(Number(branchId), cur)
    },
    async setTaxExclusive(agentId: number, service: number, exclusive: boolean) {
      await simulateTx(store, from)
      assertAgentOwner(Number(agentId))
      if (exclusive && Number(service) === SERVICE_NET) throw new Error('TaxModeNotAllowed')
      const row = state.sales.taxExclusive.get(Number(agentId)) ?? {}
      row[Number(service)] = Boolean(exclusive)
      state.sales.taxExclusive.set(Number(agentId), row)
    },
    async setAgentPaymentMethods(agentId: number, methods: number) {
      await simulateTx(store, from)
      assertAgentOwner(Number(agentId))
      const m = Number(methods)
      if (m === 0 || (m & ~ALL_PAYMENT_METHODS) !== 0) throw new Error('InvalidMethods')
      state.sales.agentMethods.set(Number(agentId), m)
    },
    async setBranchPaymentMethods(branchId: number, methods: number) {
      await simulateTx(store, from)
      const br = writableBranch(Number(branchId))
      const m = Number(methods)
      if ((m & ~ALL_PAYMENT_METHODS) !== 0) throw new Error('InvalidMethods')
      const agentEff = mockAgentPaymentMethodsOf(state, br.agentId)
      if (m !== 0 && (m & ~agentEff) !== 0) throw new Error('MethodsNotAllowed')
      state.sales.branchMethods.set(Number(branchId), m)
    },
  }

  const history = {
    async search(agentId: unknown, kind: unknown, q: unknown) {
      return { page: store.search(Number(agentId), String(kind), q) }
    },
    async canWrite(writer: unknown, kind: unknown) {
      const w = normalizeHexAddress(String(writer))
      return state.posterWriters.has(w) || kind === 'platform_audit'
    },
  } as unknown as HistoryIndexContract

  return {
    addresses: MOCK_ADDRESSES,
    from: normalizeHexAddress(from),
    access: new PlatformAccessApi(access as unknown as PlatformAccessContract),
    agents: new AgentRegistryApi(agents as unknown as AgentRegistryContract),
    branches: new BranchRegistryApi(branches as unknown as BranchRegistryContract),
    agentAccess: new AgentAccessApi(agentAccess as unknown as AgentAccessContract),
    salesSettings: new SalesSettingsApi(salesSettings as unknown as SalesSettingsContract),
    ledger: new LedgerApi(ledger as unknown as LedgerContract),
    history,
  }
}

export type { MockPlatformState }
export { PREVIEW_WALLETS, buildMockState }