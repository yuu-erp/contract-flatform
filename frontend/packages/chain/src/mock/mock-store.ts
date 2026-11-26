import {
  DEFAULT_AGENT_PAYMENT_METHODS,
  MAX_TAX_BPS,
  PAYMENT_CASH,
  SERVICE_IQR,
  SERVICE_NET,
} from '../sales-settings'
import { METRIC } from '../metrics'
import { calendarDay, localCalendarParts } from '../days'
import { normalizeHexAddress } from '../address'
import type { AgentProfileRecord, BranchProfileRecord, PlatformAuditRecord } from '../decode'
import type { AgentView, BranchView, LedgerPortionView, MemberView } from '../api/types'
import type { SearchQuery, SearchTerm } from '../search'
import type { PlatformAddresses } from '../config/loadAddresses'
import { encodeAuditRecord, encodeBranchProfile, encodeLedgerRecord } from './encode'
import { createRng } from './rng'

const AGENT_NAMES = [
  'Cyber Quận 1',
  'Nhà hàng Phở Hà Nội',
  'Spa Sen Vàng',
  'Cafe Sài Gòn',
  'Shop Thời Trang Minh',
  'Bar Ông Bầu',
  'Bánh mì Hội An',
  'Karaoke Sao Biển',
  'Nails & Beauty',
  'Gym Titan',
  'Flower House',
  'Tiệm sách Đông Tây',
] as const

/** Contract: 1 Active, 2 Suspended, 3 Deleted (0 = None). */
const STATUSES = [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3]

function allowsIqr(mask: number): boolean {
  return (mask & SERVICE_IQR) !== 0
}

const SERVED_METRICS = new Set<number>([
  METRIC.netServedHere,
  METRIC.iqrServedHere,
  METRIC.netServedHereRefund,
  METRIC.iqrServedHereRefund,
])

type SearchDoc = {
  docId: number
  agentScope: number
  kind: string
  data: `0x${string}`
  terms: SearchTerm[]
  slot0: bigint
  slot2: bigint
}

export type MockPlatformState = {
  seed: number
  owner: string
  pendingOwner: string
  admins: string[]
  paused: boolean
  poster: { address: string; moduleId: number; mask: number; maxAmount: bigint }
  agents: AgentView[]
  agentProfiles: Map<number, AgentProfileRecord>
  branches: BranchView[]
  branchProfiles: Map<number, BranchProfileRecord>
  members: Map<number, MemberView[]>
  rollups: Map<string, bigint[][]>
  docs: SearchDoc[]
  walletBalance: Map<string, bigint>
  walletBuckets: Map<string, LedgerPortionView[]>
  walletLiability: Map<number, bigint>
  nextDocId: number
  posterWriters: Set<string>
  sales: MockSalesState
}

export type MockSalesState = {
  agentTax: Map<number, Record<number, number>>
  branchTaxPlus: Map<number, Record<number, number>>
  taxExclusive: Map<number, Record<number, boolean>>
  agentMethods: Map<number, number>
  branchMethods: Map<number, number>
}

function agentMethodsEff(state: MockPlatformState, agentId: number): number {
  const raw = state.sales.agentMethods.get(agentId) ?? 0
  return raw === 0 ? DEFAULT_AGENT_PAYMENT_METHODS : raw
}

export function mockAgentTaxOf(state: MockPlatformState, agentId: number, service: number): number {
  return state.sales.agentTax.get(agentId)?.[service] ?? 0
}

export function mockBranchTaxOf(state: MockPlatformState, branchId: number, service: number) {
  const row = state.sales.branchTaxPlus.get(branchId)?.[service]
  if (row == null) return { isSet: false, bps: 0 }
  return { isSet: true, bps: row }
}

export function mockTaxExclusive(state: MockPlatformState, agentId: number, service: number): boolean {
  return state.sales.taxExclusive.get(agentId)?.[service] ?? false
}

export function mockAgentPaymentMethodsOf(state: MockPlatformState, agentId: number): number {
  return agentMethodsEff(state, agentId)
}

export function mockPaymentMethodsOf(state: MockPlatformState, branches: BranchView[], branchId: number): number {
  const branch = branches.find((b) => b.id === branchId)
  if (!branch) return 0
  const agentEff = agentMethodsEff(state, branch.agentId)
  const stored = state.sales.branchMethods.get(branchId) ?? 0
  return (stored === 0 ? agentEff : stored) & agentEff
}

export function mockQuoteTax(
  state: MockPlatformState,
  branches: BranchView[],
  branchId: number,
  service: number,
  amount: bigint,
) {
  const branch = branches.find((b) => b.id === branchId)
  if (!branch) throw new Error('BranchNotFound')
  const agentId = branch.agentId
  const override = state.sales.branchTaxPlus.get(branchId)?.[service]
  const bps = override != null ? override : (state.sales.agentTax.get(agentId)?.[service] ?? 0)
  const exclusive = mockTaxExclusive(state, agentId, service)
  let tax: bigint
  let total: bigint
  if (exclusive) {
    tax = (amount * BigInt(bps)) / BigInt(MAX_TAX_BPS)
    total = amount + tax
  } else {
    tax = (amount * BigInt(bps)) / (BigInt(MAX_TAX_BPS) + BigInt(bps))
    total = amount
  }
  return { bps, exclusive, tax, total }
}

export const PREVIEW_WALLETS = {
  owner: '0x0000000000000000000000000000000000001001',
  admin: '0x0000000000000000000000000000000000002001',
  pending: '0x0000000000000000000000000000000000003001',
  none: '0x0000000000000000000000000000000000009901',
  /** Chủ agent 1 (mock cố định để xem trước app agent). */
  agentOwner1: '0x0000000000000000000000000000000000004001',
  /** Manager chi nhánh 1 và 4; Staff chi nhánh 2. */
  agentManager: '0x0000000000000000000000000000000000003001',
  /** Chủ agent 2 + Manager chi nhánh đầu của agent 3. */
  agentDual: '0x0000000000000000000000000000000000003002',
  /** Staff (không quản lý). */
  agentStaff: '0x0000000000000000000000000000000000003004',
} as const

function addr(seed: number, slot: number): string {
  const hex = (seed * 997 + slot).toString(16).padStart(40, '0')
  return `0x${hex.slice(-40)}`
}

function emptyMetricRow(): bigint[] {
  return Array.from({ length: 32 }, () => 0n)
}

function addRow(target: bigint[], source: bigint[]) {
  for (let i = 0; i < 32; i++) target[i] = (target[i] ?? 0n) + (source[i] ?? 0n)
}

/** Chia rollup agent cho các chi nhánh; tổng (trừ served-here) khớp agent. */
function splitAgentRollupToBranches(
  rollups: Map<string, bigint[][]>,
  agentDays: bigint[][],
  branchIds: number[],
  weights: number[],
) {
  if (branchIds.length === 0) return
  const totalW = weights.reduce((a, b) => a + b, 0)
  const perBranchDays: bigint[][][] = branchIds.map(() => agentDays.map(() => emptyMetricRow()))

  for (let di = 0; di < agentDays.length; di++) {
    const row = agentDays[di]!
    for (let mi = 0; mi < 32; mi++) {
      const v = row[mi] ?? 0n
      if (SERVED_METRICS.has(mi)) {
        const share = v / BigInt(branchIds.length)
        for (let bi = 0; bi < branchIds.length; bi++) perBranchDays[bi]![di]![mi] = share
        continue
      }
      let assigned = 0n
      for (let bi = 0; bi < branchIds.length - 1; bi++) {
        const part = BigInt(Math.floor((Number(v) * weights[bi]!) / totalW))
        perBranchDays[bi]![di]![mi] = part
        assigned += part
      }
      perBranchDays[branchIds.length - 1]![di]![mi] = v - assigned
    }
  }

  branchIds.forEach((bid, bi) => {
    rollups.set(`2:${bid}`, perBranchDays[bi]!)
  })
}

export function buildMockState(seed: number): MockPlatformState {
  const rng = createRng(seed)
  const now = new Date()
  const { year, month, date } = localCalendarParts(now, 420)
  const todayDay = calendarDay(year, month, date)
  const dayCount = 90

  const agents: AgentView[] = []
  const agentProfiles = new Map<number, AgentProfileRecord>()
  const branches: BranchView[] = []
  const branchProfiles = new Map<number, BranchProfileRecord>()
  const branchIdsByAgent = new Map<number, number[]>()
  const rollups = new Map<string, bigint[][]>()
  const docs: SearchDoc[] = []
  let docId = 1
  let branchId = 1

  for (let id = 1; id <= 12; id++) {
    const owner = addr(seed, id)
    const status = STATUSES[id - 1]!
    const allowedServices = id % 3 === 0 ? 7 : id % 2 === 0 ? 3 : 1
    const resolvedOwner =
      id === 1 ? PREVIEW_WALLETS.agentOwner1 : id === 2 ? PREVIEW_WALLETS.agentDual : owner
    agents.push({
      id,
      owner: resolvedOwner,
      pendingOwner: '0x0000000000000000000000000000000000000000',
      status,
      createdAt: 1_700_000_000 + id * 10_000,
      updatedAt: 1_700_100_000 + id * 10_000,
      profileDocId: BigInt(id),
      allowedServices,
    })
    agentProfiles.set(id, {
      version: 1,
      agentId: id,
      owner: resolvedOwner,
      profile: {
        storeName: AGENT_NAMES[id - 1] ?? `Agent ${id}`,
        storeAddress: `${id * 11} Nguyễn Huệ, Q.${(id % 5) + 1}, TP.HCM`,
        note: 'Dữ liệu xem trước',
        storePhone: `090${String(1_000_000 + id).slice(-7)}`,
      },
      updatedAt: 1_700_100_000,
    })
    const perAgentDays: bigint[][] = []
    for (let d = 0; d < dayCount; d++) {
      const row = emptyMetricRow()
      if (status === 3) {
        perAgentDays.push(row)
        continue
      }
      const gross = BigInt(rng.int(200_000, 8_000_000))
      if (gross === 0n) {
        perAgentDays.push(row)
        continue
      }
      row[METRIC.netGross] = gross
      row[METRIC.netTax] = gross / 12n
      if (allowsIqr(allowedServices)) {
        row[METRIC.iqrGross] = BigInt(rng.int(0, gross > 2_000_000n ? 2_000_000 : Number(gross)))
      }
      row[METRIC.walletTopup] = BigInt(rng.int(50_000, 500_000))
      row[METRIC.cashIn] = gross / 4n
      if (rng.chance(0.12)) row[METRIC.netRefund] = gross / 8n
      if (rng.chance(0.08)) {
        row[METRIC.netAdjUp] = 120_000n
        row[METRIC.netAdjDown] = 60_000n
      }
      if (rng.chance(0.05)) {
        row[METRIC.walletTopupRefund] = 40_000n
      }
      perAgentDays.push(row)
    }
    rollups.set(`1:${id}`, perAgentDays)
    branchIdsByAgent.set(id, [])
  }

  for (let id = 1; id <= 12 && branchId <= 30; id++) {
    const status = STATUSES[id - 1]!
    const allowedServices = id % 3 === 0 ? 7 : id % 2 === 0 ? 3 : 1
    const perAgentDays = rollups.get(`1:${id}`) ?? []
    const branchCount = id <= 6 ? 2 : 3
    const branchesForAgent: number[] = []
  for (let b = 0; b < branchCount && branchId <= 30; b++) {
      const tz = b % 2 === 0 ? 420 : -300
      const domain = `agent${id}-cn${b + 1}.mock.local`
      branches.push({
        id: branchId,
        agentId: id,
        status: status === 3 ? 3 : status === 2 ? 2 : 1,
        services: allowedServices,
        isMain: b === 0,
        tzOffsetMinutes: tz,
        domainHash: `0x${branchId.toString(16).padStart(64, '0')}`,
        createdAt: 1_700_000_000,
        updatedAt: 1_700_200_000,
        profileDocId: BigInt(branchId),
      })
      const profile: BranchProfileRecord = {
        version: 1,
        branchId,
        agentId: id,
        domain,
        profile: {
          name: `${AGENT_NAMES[id - 1] ?? 'Chi nhánh'} · ${b + 1}`,
          location: tz === 420 ? 'Quận 1, TP.HCM' : 'Austin, TX',
          phone: `0287${String(branchId).padStart(7, '0')}`,
          longlat: '10.77,106.69',
          note: '',
        },
        updatedAt: 1_700_200_000,
      }
      branchProfiles.set(branchId, profile)
      branchIdsByAgent.get(id)!.push(branchId)
      const hex = encodeBranchProfile({
        branchId,
        agentId: id,
        domain,
        profile: profile.profile,
        updatedAt: profile.updatedAt,
      })
      docs.push({
        docId: docId++,
        agentScope: id,
        kind: 'platform_branches',
        data: hex,
        terms: [
          { prefix: 'G', value: String(id) },
          { prefix: 'B', value: String(branchId) },
        ],
        slot0: 0n,
        slot2: 0n,
      })
      branchesForAgent.push(branchId)
      branchId++
    }
    const weights = branchesForAgent.map((_, i) => (i % 2 === 0 ? 3 : 2))
    splitAgentRollupToBranches(rollups, perAgentDays, branchesForAgent, weights)
  }

  const platformDays = Array.from({ length: dayCount }, (_, i) => {
    const total = emptyMetricRow()
    for (const agent of agents) {
      const part = rollups.get(`1:${agent.id}`)?.[i]
      if (part) addRow(total, part)
    }
    return total
  })
  rollups.set('0:0', platformDays)

  const ledgerKinds = [1, 2, 3, 4, 5, 6]
  let ledgerCount = 0
  for (const agent of agents) {
    const agentBranches = branchIdsByAgent.get(agent.id) ?? []
    for (let k = 0; k < 5 && ledgerCount < 60; k++) {
      const kind = ledgerKinds[ledgerCount % ledgerKinds.length]!
      const branch = agentBranches[k % agentBranches.length] ?? agentBranches[0] ?? 1
      const customer = addr(seed, 500 + ledgerCount)
      const ts = 1_720_000_000 + ledgerCount * 3600
      const day = todayDay - rng.int(0, dayCount - 1)
      const data = encodeLedgerRecord({
        kind,
        method: kind === 6 ? (ledgerCount % 2 === 0 ? 1 : 2) : 1,
        service: ledgerCount % 2 === 0 ? 1 : 2,
        agentId: agent.id,
        branchId: branch,
        customer,
        amount: BigInt(rng.int(100_000, 3_000_000)),
        actor: PREVIEW_WALLETS.admin,
        timestamp: ts,
        day,
      })
      docs.push({
        docId: docId++,
        agentScope: agent.id,
        kind: 'ledger',
        data,
        terms: [
          { prefix: 'G', value: String(agent.id) },
          { prefix: 'B', value: String(branch) },
          { prefix: 'K', value: String(kind) },
          { prefix: 'W', value: normalizeHexAddress(customer) },
          { prefix: 'S', value: normalizeHexAddress(PREVIEW_WALLETS.admin) },
        ],
        slot0: BigInt(ts),
        slot2: BigInt(day),
      })
      ledgerCount++
    }
  }

  const auditRecords: PlatformAuditRecord[] = []
  for (let i = 0; i < 40; i++) {
    const agentId = (i % 12) + 1
    const branch = branchIdsByAgent.get(agentId)?.[0] ?? 1
    auditRecords.push({
      version: 1,
      actor: PREVIEW_WALLETS.admin,
      action: i % 3 === 0 ? 'agent_profile' : i % 3 === 1 ? 'branch_profile' : 'agent_services',
      agentId,
      branchId: branch,
      before: '0x',
      after: '0x',
      reason: 'mock audit',
      timestamp: 1_720_000_000 - i * 4000,
    })
  }

  for (const record of auditRecords) {
    const hex = encodeAuditRecord(record)
    docs.push({
      docId: docId++,
      agentScope: 0,
      kind: 'platform_audit',
      data: hex,
      terms: [
        { prefix: 'G', value: String(record.agentId) },
        { prefix: 'B', value: String(record.branchId) },
        { prefix: 'X', value: record.action },
        { prefix: 'R', value: normalizeHexAddress(record.actor) },
      ],
      slot0: BigInt(record.timestamp),
      slot2: 0n,
    })
  }

  const walletBalance = new Map<string, bigint>()
  const walletBuckets = new Map<string, LedgerPortionView[]>()
  const walletLiability = new Map<number, bigint>()
  for (const agent of agents) {
    const customer = addr(seed, 900 + agent.id)
    const key = `${agent.id}:${normalizeHexAddress(customer)}`
    walletBalance.set(key, BigInt(rng.int(100_000, 2_000_000)))
    const buckets = (branchIdsByAgent.get(agent.id) ?? []).map((bid) => ({
      branchId: bid,
      amount: BigInt(rng.int(10_000, 400_000)),
    }))
    walletBuckets.set(key, buckets)
    walletLiability.set(agent.id, buckets.reduce((s, b) => s + b.amount, 0n))
  }

  const members = new Map<number, MemberView[]>()
  for (const b of branches) {
    members.set(b.id, [
      {
        account: addr(seed, 700 + b.id),
        role: 2,
        grantedBy: agents.find((a) => a.id === b.agentId)?.owner ?? PREVIEW_WALLETS.owner,
        grantedAt: 1_700_000_000,
      },
    ])
  }
  const upsertMember = (branchId: number, account: string, role: number, grantedBy?: string) => {
    const branch = branches.find((x) => x.id === branchId)
    const granter = grantedBy ?? agents.find((a) => a.id === branch?.agentId)?.owner ?? PREVIEW_WALLETS.owner
    const a = normalizeHexAddress(account)
    const list = (members.get(branchId) ?? []).filter((m) => normalizeHexAddress(m.account) !== a)
    list.push({ account: a, role, grantedBy: normalizeHexAddress(granter), grantedAt: 1_700_000_100 + list.length })
    members.set(branchId, list)
  }
  upsertMember(1, PREVIEW_WALLETS.agentManager, 2)
  upsertMember(1, PREVIEW_WALLETS.agentStaff, 1)
  upsertMember(1, addr(seed, 701), 1)
  upsertMember(1, addr(seed, 702), 1)
  upsertMember(2, PREVIEW_WALLETS.agentManager, 1)
  upsertMember(2, addr(seed, 703), 1)
  upsertMember(4, PREVIEW_WALLETS.agentManager, 2)
  upsertMember(5, PREVIEW_WALLETS.agentDual, 2)
  upsertMember(6, PREVIEW_WALLETS.agentStaff, 1)

  const sales: MockSalesState = {
    agentTax: new Map([
      [
        1,
        {
          [SERVICE_NET]: 800,
          [SERVICE_IQR]: 1_000,
        },
      ],
    ]),
    branchTaxPlus: new Map([
      [2, { [SERVICE_IQR]: 1_200 }],
    ]),
    taxExclusive: new Map([[1, { [SERVICE_NET]: false, [SERVICE_IQR]: false }]]),
    agentMethods: new Map([[1, PAYMENT_CASH]]),
    branchMethods: new Map([[2, 6]]),
  }

  return {
    seed,
    owner: PREVIEW_WALLETS.owner,
    pendingOwner: PREVIEW_WALLETS.pending,
    admins: [
      PREVIEW_WALLETS.admin,
      '0x0000000000000000000000000000000000002002',
      '0x0000000000000000000000000000000000002003',
    ],
    paused: false,
    poster: { address: '0x0000000000000000000000000000000000000a01', moduleId: 1, mask: 0x6c, maxAmount: 10_000_000n },
    agents,
    agentProfiles,
    branches,
    branchProfiles,
    members,
    rollups,
    docs,
    walletBalance,
    walletBuckets,
    walletLiability,
    nextDocId: docId,
    posterWriters: new Set([normalizeHexAddress('0x0000000000000000000000000000000000000a01')]),
    sales,
  }
}

export const MOCK_ADDRESSES: PlatformAddresses = {
  chainId: 991,
  access: '0x0000000000000000000000000000000000000100',
  agents: '0x0000000000000000000000000000000000000101',
  branches: '0x0000000000000000000000000000000000000102',
  agentAccess: '0x0000000000000000000000000000000000000103',
  salesSettings: '0x0000000000000000000000000000000000000104',
  ledger: '0x0000000000000000000000000000000000000105',
  history: '0x0000000000000000000000000000000000000106',
}

function termMatch(docTerms: SearchTerm[], filter: SearchTerm): boolean {
  const want = filter.value.toLowerCase()
  return docTerms.some((t) => t.prefix === filter.prefix && t.value.toLowerCase() === want)
}

function applySearch(docs: SearchDoc[], agentScope: number, kind: string, query: SearchQuery) {
  let list = docs.filter((d) => d.agentScope === agentScope && d.kind === kind)
  for (const f of query.filters ?? []) {
    list = list.filter((d) => termMatch(d.terms, f))
  }
  for (const r of query.ranges ?? []) {
    list = list.filter((d) => {
      const v = r.slot === 0 ? d.slot0 : r.slot === 2 ? d.slot2 : 0n
      return v >= r.min && v <= r.max
    })
  }
  const sortSlot = query.sortSlot ?? 0
  if (sortSlot === 0) {
    list = [...list].sort((a, b) => (query.ascending ? 1 : -1) * (Number(a.slot0) - Number(b.slot0)))
  }
  const total = list.length
  const offset = query.offset ?? 0
  const limit = query.limit ?? 20
  const page = list.slice(offset, offset + limit)
  return {
    total,
    docIds: page.map((d) => d.docId),
    data: page.map((d) => d.data),
  }
}

export class MockStore {
  constructor(public readonly state: MockPlatformState) {}

  search(agentId: number, kind: string, rawQuery: unknown) {
    const q = rawQuery as SearchQuery & {
      ranges?: { slot: number; min: string; max: string }[]
    }
    const query: SearchQuery = {
      ...q,
      ranges: (q.ranges ?? []).map((r) => ({ slot: r.slot, min: BigInt(r.min), max: BigInt(r.max) })),
    }
    return applySearch(this.state.docs, agentId, kind, query)
  }

  sliceRollup(scope: number, id: number, fromDay: number, toDay: number): bigint[][] {
    const key = `${scope}:${id}`
    const rows = this.state.rollups.get(key)
    if (!rows) return []
    const { year, month, date } = localCalendarParts(new Date(), 420)
    const todayDay = calendarDay(year, month, date)
    const startIndex = todayDay - (rows.length - 1)
    const out: bigint[][] = []
    for (let day = fromDay; day <= toDay; day++) {
      const idx = day - startIndex
      out.push(idx >= 0 && idx < rows.length ? rows[idx]! : emptyMetricRow())
    }
    return out
  }

  assertWritable(address?: string) {
    if (address && normalizeHexAddress(address).startsWith('0xdead')) {
      throw new Error('execution reverted: OwnableUnauthorizedAccount')
    }
  }
}