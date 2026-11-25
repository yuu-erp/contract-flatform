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
import { mockBig, mockId } from './mock-params'

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
  const caller = normalizeHexAddress(from)
  const isOwnerCaller = () => caller === normalizeHexAddress(state.owner)
  /** Giống `onlyPlatformAdmin` trên contract: owner hoặc admin. */
  const requirePlatformAdmin = () => {
    if (!isOwnerCaller() && !state.admins.some((a) => normalizeHexAddress(a) === caller)) {
      throw new Error('NotPlatformAdmin')
    }
  }
  /** Ghi agent/chi nhánh: owner hoặc admin, hệ không pause. */
  const requireTenantWrite = () => {
    requirePlatformAdmin()
    if (state.paused) throw new Error('EnforcedPause')
  }
  /** Việc chỉ owner: thêm/bớt admin, đổi owner, poster. */
  const requirePlatformOwner = () => {
    if (!isOwnerCaller()) throw new Error('NotPlatformOwner')
  }

  const access = {
    async platformAdmins(offset: unknown, limit: unknown) {
      const o = mockId(offset)
      const lim = mockId(limit)
      return { page: state.admins.slice(o, o + lim) }
    },
    async paused() {
      return state.paused
    },
    // Hàm thô giống contract — lớp PlatformAccessApi gọi các hàm này.
    async owner() {
      return state.owner
    },
    async pendingOwner() {
      return state.pendingOwner
    },
    async isPlatformAdmin(account: string) {
      const a = normalizeHexAddress(account)
      return state.admins.some((x) => normalizeHexAddress(x) === a)
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
      requirePlatformAdmin()
      if (state.paused) throw new Error('EnforcedPause')
      await simulateTx(store)
      state.paused = true
    },
    async unpause() {
      requirePlatformAdmin()
      if (!state.paused) throw new Error('ExpectedPause')
      await simulateTx(store)
      state.paused = false
    },
    async addPlatformAdmin(account: string) {
      requirePlatformOwner()
      await simulateTx(store, account)
      state.admins.push(normalizeHexAddress(account))
    },
    async removePlatformAdmin(account: string) {
      requirePlatformOwner()
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
      requirePlatformOwner()
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
    async getAgent(agentId: unknown) {
      const id = mockId(agentId)
      const row = state.agents.find((a) => a.id === id)
      if (!row) throw new Error('AgentNotFound')
      return row
    },
    async getAgentProfile(agentId: unknown) {
      const id = mockId(agentId)
      const profile = state.agentProfiles.get(id)
      if (!profile) throw new Error('AgentNotFound')
      return profile
    },
    async createAgent(owner: string, allowedServices: unknown, profile: AgentProfile) {
      requireTenantWrite()
      const services = mockId(allowedServices)
      await simulateTx(store, owner)
      state.agents.unshift({
        id: state.agents.length + 1,
        owner: normalizeHexAddress(owner),
        pendingOwner: PREVIEW_WALLETS.none,
        status: 0,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        profileDocId: 1n,
        allowedServices: services,
      })
      void profile
    },
    async updateAgentProfile(agentId: unknown, profile: AgentProfile) {
      requireTenantWrite()
      await simulateTx(store)
      const p = state.agentProfiles.get(mockId(agentId))
      if (p) p.profile = profile
    },
    async setAgentServices(agentId: unknown, allowedServices: unknown) {
      requireTenantWrite()
      await simulateTx(store)
      const id = mockId(agentId)
      const a = state.agents.find((x) => x.id === id)
      if (a) a.allowedServices = mockId(allowedServices)
    },
    async suspendAgent(agentId: unknown, _reason: string) {
      requireTenantWrite()
      await simulateTx(store)
      const a = state.agents.find((x) => x.id === mockId(agentId))
      if (a) a.status = 1
    },
    async resumeAgent(agentId: unknown, _reason: string) {
      requireTenantWrite()
      await simulateTx(store)
      const a = state.agents.find((x) => x.id === mockId(agentId))
      if (a) a.status = 0
    },
    async deleteAgent(agentId: unknown, _reason: string) {
      requireTenantWrite()
      await simulateTx(store)
      const a = state.agents.find((x) => x.id === mockId(agentId))
      if (a) a.status = 2
    },
    async proposeAgentOwner(_agentId: unknown, newOwner: string) {
      requireTenantWrite()
      await simulateTx(store, newOwner)
    },
  }

  const branches = {
    async agentOf(branchId: unknown) {
      return state.branches.find((b) => b.id === mockId(branchId))?.agentId ?? 0
    },
    async branchCount() {
      return state.branches.length
    },
    async branchCountOf(agentId: unknown) {
      return state.branches.filter((b) => b.agentId === mockId(agentId)).length
    },
    async getBranch(branchId: unknown) {
      const id = mockId(branchId)
      const row = state.branches.find((b) => b.id === id)
      if (!row) throw new Error('BranchNotFound')
      return row
    },
    async getBranchProfile(branchId: unknown) {
      const row = state.branchProfiles.get(mockId(branchId))
      if (!row) throw new Error('BranchNotFound')
      return row
    },
    async mainBranchOf(agentId: unknown) {
      const id = mockId(agentId)
      return state.branches.find((b) => b.agentId === id && b.isMain)?.id ?? 0
    },
    async branchByDomain(domain: string) {
      const d = domain.trim().toLowerCase()
      for (const profile of state.branchProfiles.values()) {
        if (profile.domain.trim().toLowerCase() === d) return profile.branchId
      }
      return 0
    },
    async createBranch(_agentId: number, _init: unknown) {
      requireTenantWrite()
      await simulateTx(store)
    },
    async updateBranchProfile(branchId: unknown, profile: BranchProfile) {
      requireTenantWrite()
      await simulateTx(store)
      const row = state.branchProfiles.get(mockId(branchId))
      if (row) row.profile = profile
    },
    async setBranchDomain(_branchId: number, _domain: string) {
      requireTenantWrite()
      await simulateTx(store)
    },
    async setBranchServices(_branchId: number, _services: number) {
      requireTenantWrite()
      await simulateTx(store)
    },
    async setBranchTimezone(_branchId: number, _tz: number) {
      requireTenantWrite()
      await simulateTx(store)
    },
    async setMainBranch(_branchId: number) {
      requireTenantWrite()
      await simulateTx(store)
    },
    async suspendBranch(branchId: unknown, _reason: string) {
      requireTenantWrite()
      await simulateTx(store)
      const b = state.branches.find((x) => x.id === mockId(branchId))
      if (b) b.status = 1
    },
    async resumeBranch(branchId: unknown, _reason: string) {
      requireTenantWrite()
      await simulateTx(store)
      const b = state.branches.find((x) => x.id === mockId(branchId))
      if (b) b.status = 0
    },
    async deleteBranch(branchId: unknown, _reason: string) {
      requireTenantWrite()
      await simulateTx(store)
      const b = state.branches.find((x) => x.id === mockId(branchId))
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
    async effectiveRoleOf(branchId: unknown, account: string) {
      const bid = mockId(branchId)
      const a = normalizeHexAddress(account)
      const agent = state.branches.find((b) => b.id === bid)?.agentId
      if (agent != null) {
        const ag = state.agents.find((x) => x.id === agent)
        if (ag && ag.status === 3) return 0
        const owner = ag?.owner
        if (owner && normalizeHexAddress(owner) === a) return 3
      }
      const branch = state.branches.find((b) => b.id === bid)
      if (branch?.status === 3) return 0
      const list = state.members.get(bid) ?? []
      const hit = list.find((m) => normalizeHexAddress(m.account) === a)
      return hit?.role ?? 0
    },
    async membersOf(branchId: unknown, offset: unknown, limit: unknown) {
      const id = mockId(branchId)
      const o = mockId(offset)
      const lim = mockId(limit)
      return { out: (state.members.get(id) ?? []).slice(o, o + lim) }
    },
    async memberCountOf(branchId: unknown) {
      return (state.members.get(mockId(branchId)) ?? []).length
    },
    async roleOf(branchId: unknown, account: string) {
      const a = normalizeHexAddress(account)
      const list = state.members.get(mockId(branchId)) ?? []
      const hit = list.find((m) => normalizeHexAddress(m.account) === a)
      return hit?.role ?? 0
    },
    async branchesOfAccount(account: string, offset: unknown, limit: unknown) {
      const o = mockId(offset)
      const lim = mockId(limit)
      const ids: number[] = []
      for (const b of state.branches) {
        const role = await agentAccess.effectiveRoleOf(b.id, account)
        if (role >= 2) ids.push(b.id)
      }
      return { out: ids.slice(o, o + lim) }
    },
    async grantRole(branchId: unknown, account: string, role: unknown) {
      await simulateTx(store, from)
      if (state.paused) throw new Error('EnforcedPause')
      const bid = mockId(branchId)
      const branch = state.branches.find((b) => b.id === bid)
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
      const list = state.members.get(bid) ?? []
      if (list.length >= 200) throw new Error('TooManyMembers')
      const r = mockId(role)
      const current = list.find((m) => normalizeHexAddress(m.account) === a)
      if (current && current.role === r) throw new Error('RoleUnchanged')
      upsertMember(bid, account, r, from)
    },
    async revokeRole(branchId: unknown, account: string) {
      await simulateTx(store, from)
      if (state.paused) throw new Error('EnforcedPause')
      const bid = mockId(branchId)
      const a = normalizeHexAddress(account)
      const list = state.members.get(bid) ?? []
      if (!list.some((m) => normalizeHexAddress(m.account) === a)) throw new Error('NotMember')
      state.members.set(
        bid,
        list.filter((m) => normalizeHexAddress(m.account) !== a),
      )
    },
    async renounceRole(branchId: unknown) {
      await simulateTx(store, from)
      if (state.paused) throw new Error('EnforcedPause')
      const bid = mockId(branchId)
      const a = normalizeHexAddress(from)
      const list = state.members.get(bid) ?? []
      if (!list.some((m) => normalizeHexAddress(m.account) === a)) throw new Error('NotMember')
      state.members.set(
        bid,
        list.filter((m) => normalizeHexAddress(m.account) !== a),
      )
    },
  }

  const ledger = {
    async rollup(scope: unknown, id: unknown, fromDay: unknown, toDay: unknown) {
      return {
        out: store.sliceRollup(mockId(scope), mockId(id), mockId(fromDay), mockId(toDay)),
      }
    },
    async bucketsOf(agentId: unknown, customer: string) {
      const key = `${mockId(agentId)}:${normalizeHexAddress(customer)}`
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
    async balanceOf(agentId: unknown, customer: string) {
      const key = `${mockId(agentId)}:${normalizeHexAddress(customer)}`
      return { sum: state.walletBalance.get(key) ?? 0n }
    },
    async walletLiability(agentId: unknown) {
      return state.walletLiability.get(mockId(agentId)) ?? 0n
    },
    async posterKinds(poster: string) {
      const a = normalizeHexAddress(poster)
      if (a === normalizeHexAddress(state.poster.address)) return state.poster.mask
      return 0
    },
    async setPoster(poster: string, kindsMask: unknown) {
      requirePlatformOwner()
      await simulateTx(store, poster)
      state.poster = { address: normalizeHexAddress(poster), mask: mockId(kindsMask) }
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
    async quoteTax(branchId: unknown, service: unknown, amount: unknown) {
      return mockQuoteTax(state, state.branches, mockId(branchId), mockId(service), mockBig(amount))
    },
    async branchTaxOf(branchId: unknown, service: unknown) {
      return mockBranchTaxOf(state, mockId(branchId), mockId(service))
    },
    async agentTaxOf(agentId: unknown, service: unknown) {
      return mockAgentTaxOf(state, mockId(agentId), mockId(service))
    },
    async agentPaymentMethodsOf(agentId: unknown) {
      return mockAgentPaymentMethodsOf(state, mockId(agentId))
    },
    async paymentMethodsOf(branchId: unknown) {
      return mockPaymentMethodsOf(state, state.branches, mockId(branchId))
    },
    async isTaxExclusive(agentId: unknown, service: unknown) {
      return mockTaxExclusive(state, mockId(agentId), mockId(service))
    },
    async setAgentTax(agentId: unknown, service: unknown, bps: unknown) {
      await simulateTx(store, from)
      const aid = mockId(agentId)
      assertAgentOwner(aid)
      const s = mockId(service)
      const v = mockId(bps)
      if (v > MAX_TAX_BPS) throw new Error('TaxTooHigh')
      const row = state.sales.agentTax.get(aid) ?? {}
      row[s] = v
      state.sales.agentTax.set(aid, row)
    },
    async setBranchTax(branchId: unknown, service: unknown, bps: unknown) {
      await simulateTx(store, from)
      const bid = mockId(branchId)
      writableBranch(bid)
      const v = mockId(bps)
      if (v > MAX_TAX_BPS) throw new Error('TaxTooHigh')
      const cur = state.sales.branchTaxPlus.get(bid) ?? {}
      cur[mockId(service)] = v
      state.sales.branchTaxPlus.set(bid, cur)
    },
    async clearBranchTax(branchId: unknown, service: unknown) {
      await simulateTx(store, from)
      const bid = mockId(branchId)
      writableBranch(bid)
      const cur = state.sales.branchTaxPlus.get(bid)
      if (!cur) return
      delete cur[mockId(service)]
      state.sales.branchTaxPlus.set(bid, cur)
    },
    async setTaxExclusive(agentId: unknown, service: unknown, exclusive: boolean) {
      await simulateTx(store, from)
      const aid = mockId(agentId)
      assertAgentOwner(aid)
      if (exclusive && mockId(service) === SERVICE_NET) throw new Error('TaxModeNotAllowed')
      const row = state.sales.taxExclusive.get(aid) ?? {}
      row[mockId(service)] = Boolean(exclusive)
      state.sales.taxExclusive.set(aid, row)
    },
    async setAgentPaymentMethods(agentId: unknown, methods: unknown) {
      await simulateTx(store, from)
      const aid = mockId(agentId)
      assertAgentOwner(aid)
      const m = mockId(methods)
      if (m === 0 || (m & ~ALL_PAYMENT_METHODS) !== 0) throw new Error('InvalidMethods')
      state.sales.agentMethods.set(aid, m)
    },
    async setBranchPaymentMethods(branchId: unknown, methods: unknown) {
      await simulateTx(store, from)
      const bid = mockId(branchId)
      const br = writableBranch(bid)
      const m = mockId(methods)
      if ((m & ~ALL_PAYMENT_METHODS) !== 0) throw new Error('InvalidMethods')
      const agentEff = mockAgentPaymentMethodsOf(state, br.agentId)
      if (m !== 0 && (m & ~agentEff) !== 0) throw new Error('MethodsNotAllowed')
      state.sales.branchMethods.set(bid, m)
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