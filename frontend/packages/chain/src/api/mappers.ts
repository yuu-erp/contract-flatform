import { toAddress } from '../address'
import {
  asBigInt,
  asBigIntArray32,
  asBool,
  asNumber,
  asRecord,
  asString,
  unwrapNamed,
  unwrapValue,
} from '../normalize'
import type { BranchProfileRecord } from '../decode'
import type {
  AgentProfileRecord,
  AgentView,
  BranchTax,
  BranchView,
  LedgerEntry,
  LedgerLicense,
  LedgerPortionView,
  MemberView,
  TaxQuote,
} from './types'

const AGENT_FIELDS = [
  'id',
  'owner',
  'pendingOwner',
  'status',
  'createdAt',
  'updatedAt',
  'profileDocId',
  'allowedServices',
] as const

const PROFILE_RECORD_FIELDS = ['version', 'agentId', 'owner', 'profile', 'updatedAt'] as const
const PROFILE_FIELDS = ['storeName', 'storeAddress', 'note', 'storePhone'] as const

const BRANCH_FIELDS = [
  'id',
  'agentId',
  'status',
  'services',
  'isMain',
  'tzOffsetMinutes',
  'domainHash',
  'createdAt',
  'updatedAt',
  'profileDocId',
] as const

const MEMBER_FIELDS = ['account', 'role', 'grantedBy', 'grantedAt'] as const

const ENTRY_FIELDS = [
  'kind',
  'method',
  'service',
  'taxBps',
  'branchId',
  'customer',
  'amount',
  'refunded',
] as const

const PORTION_FIELDS = ['branchId', 'amount'] as const

export function mapAgent(value: unknown): AgentView {
  const record = asRecord(value, AGENT_FIELDS)
  return {
    id: asNumber(record.id),
    owner: toAddress(asString(record.owner)),
    pendingOwner: toAddress(asString(record.pendingOwner)),
    status: asNumber(record.status),
    createdAt: asNumber(record.createdAt),
    updatedAt: asNumber(record.updatedAt),
    profileDocId: asBigInt(record.profileDocId),
    allowedServices: asNumber(record.allowedServices),
  }
}

export function mapAgentProfileRecord(value: unknown): AgentProfileRecord {
  const record = asRecord(value, PROFILE_RECORD_FIELDS)
  const profile = asRecord(record.profile, PROFILE_FIELDS)
  return {
    version: asNumber(record.version),
    agentId: asNumber(record.agentId),
    owner: toAddress(asString(record.owner)),
    profile: {
      storeName: asString(profile.storeName),
      storeAddress: asString(profile.storeAddress),
      note: asString(profile.note),
      storePhone: asString(profile.storePhone),
    },
    updatedAt: asNumber(record.updatedAt),
  }
}

const BRANCH_PROFILE_RECORD_FIELDS = ['version', 'branchId', 'agentId', 'domain', 'profile', 'updatedAt'] as const
const BRANCH_PROFILE_FIELDS = ['name', 'location', 'phone', 'longlat', 'note'] as const

export function mapBranchProfileRecord(value: unknown): BranchProfileRecord {
  const record = asRecord(value, BRANCH_PROFILE_RECORD_FIELDS)
  const profile = asRecord(record.profile, BRANCH_PROFILE_FIELDS)
  return {
    version: asNumber(record.version),
    branchId: asNumber(record.branchId),
    agentId: asNumber(record.agentId),
    domain: asString(record.domain),
    profile: {
      name: asString(profile.name),
      location: asString(profile.location),
      phone: asString(profile.phone),
      longlat: asString(profile.longlat),
      note: asString(profile.note),
    },
    updatedAt: asNumber(record.updatedAt),
  }
}

export function mapBranch(value: unknown): BranchView {
  const record = asRecord(value, BRANCH_FIELDS)
  return {
    id: asNumber(record.id),
    agentId: asNumber(record.agentId),
    status: asNumber(record.status),
    services: asNumber(record.services),
    isMain: asBool(record.isMain),
    tzOffsetMinutes: asNumber(record.tzOffsetMinutes),
    domainHash: asString(record.domainHash),
    createdAt: asNumber(record.createdAt),
    updatedAt: asNumber(record.updatedAt),
    profileDocId: asBigInt(record.profileDocId),
  }
}

export function mapMember(value: unknown): MemberView {
  const record = asRecord(value, MEMBER_FIELDS)
  return {
    account: toAddress(asString(record.account)),
    role: asNumber(record.role),
    grantedBy: toAddress(asString(record.grantedBy)),
    grantedAt: asNumber(record.grantedAt),
  }
}

export function mapMembers(value: unknown): MemberView[] {
  const raw = unwrapNamed(unwrapValue(value), 'out')
  if (!Array.isArray(raw)) return []
  return raw.map((item) => mapMember(item))
}

export function mapBranchIdList(value: unknown): number[] {
  const raw = unwrapNamed(unwrapValue(value), 'out')
  if (!Array.isArray(raw)) return []
  return raw.map((id) => asNumber(id))
}

export const MODULE_NET = 1
export const MODULE_IQR = 2
/** Vị trí đầu của bộ đếm module trong hàng 32 ô cũ (`METRIC`), và ô SERVED_HERE_REFUND riêng. */
const LEGACY_MODULE_BASE: Record<number, number> = { [MODULE_NET]: 10, [MODULE_IQR]: 18 }
const LEGACY_SERVED_REFUND: Record<number, number> = { [MODULE_NET]: 26, [MODULE_IQR]: 27 }

export function mapModuleRollup(value: unknown): bigint[][] {
  const raw = unwrapNamed(unwrapValue(value), 'out')
  if (!Array.isArray(raw)) return []
  return raw.map((row) => asBigIntArray32(row).slice(0, 9))
}

/** Ghép `rollup` (ô 0..9) với `moduleRollup` NET, IQR thành hàng 32 ô như trước ADR 0031. */
export function mergeModuleRollups(base: bigint[][], net: bigint[][], iqr: bigint[][]): bigint[][] {
  return base.map((row, d) => {
    const out = row.slice(0, 32)
    while (out.length < 32) out.push(0n)
    for (const [moduleId, rows] of [
      [MODULE_NET, net],
      [MODULE_IQR, iqr],
    ] as const) {
      const m = rows[d]
      if (!m) continue
      const b = LEGACY_MODULE_BASE[moduleId]!
      for (let i = 0; i < 8; i++) out[b + i] = m[i] ?? 0n
      out[LEGACY_SERVED_REFUND[moduleId]!] = m[8] ?? 0n
    }
    return out
  })
}

export function mapLicense(value: unknown): LedgerLicense {
  const r = asRecord(value, ['moduleId', 'kindsMask', 'maxAmount'])
  return { moduleId: asNumber(r.moduleId), kindsMask: asNumber(r.kindsMask), maxAmount: asBigInt(r.maxAmount) }
}

export function mapRollup(value: unknown): bigint[][] {
  const raw = unwrapNamed(unwrapValue(value), 'out')
  if (!Array.isArray(raw)) return []
  return raw.map((row) => asBigIntArray32(row))
}

export function mapPortions(value: unknown): LedgerPortionView[] {
  const raw = unwrapValue(value)
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const record = asRecord(item, PORTION_FIELDS)
    return { branchId: asNumber(record.branchId), amount: asBigInt(record.amount) }
  })
}

export function mapEntry(value: unknown): LedgerEntry {
  const record = asRecord(value, ENTRY_FIELDS)
  return {
    kind: asNumber(record.kind),
    method: asNumber(record.method),
    service: asNumber(record.service),
    taxBps: asNumber(record.taxBps),
    branchId: asNumber(record.branchId),
    customer: toAddress(asString(record.customer)),
    amount: asBigInt(record.amount),
    refunded: asBigInt(record.refunded),
  }
}

export function mapTaxQuote(value: unknown): TaxQuote {
  const raw = unwrapValue(value)
  if (Array.isArray(raw)) {
    return {
      bps: asNumber(raw[0]),
      exclusive: asBool(raw[1]),
      tax: asBigInt(raw[2]),
      total: asBigInt(raw[3]),
    }
  }
  const record = asRecord(raw, ['bps', 'exclusive', 'tax', 'total'])
  return {
    bps: asNumber(record.bps),
    exclusive: asBool(record.exclusive),
    tax: asBigInt(record.tax),
    total: asBigInt(record.total),
  }
}

export function mapAgentTaxBps(value: unknown): number {
  return asNumber(unwrapValue(value))
}

export function mapBranchTax(value: unknown): BranchTax {
  const raw = unwrapValue(value)
  if (Array.isArray(raw)) {
    return { isSet: asBool(raw[0]), bps: asNumber(raw[1]) }
  }
  const record = asRecord(raw, ['isSet', 'bps'])
  return { isSet: asBool(record.isSet), bps: asNumber(record.bps) }
}

export function mapAddressList(value: unknown): string[] {
  const raw = unwrapNamed(unwrapValue(value), 'out')
  if (!Array.isArray(raw)) return []
  return raw.map((addr) => toAddress(asString(addr)))
}

export function mapAddressPage(value: unknown): string[] {
  const raw = unwrapNamed(unwrapValue(value), 'page')
  if (!Array.isArray(raw)) return []
  return raw.map((addr) => toAddress(asString(addr)))
}