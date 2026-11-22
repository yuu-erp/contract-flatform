import { toAddress } from '../address'
import {
  asBigInt,
  asBigIntArray32,
  asBool,
  asNumber,
  asRecord,
  asString,
  unwrapValue,
} from '../normalize'
import type { BranchProfileRecord } from '../decode'
import type {
  AgentProfileRecord,
  AgentView,
  BranchTax,
  BranchView,
  LedgerEntry,
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
  const raw = unwrapValue(value)
  if (!Array.isArray(raw)) return []
  return raw.map((item) => mapMember(item))
}

export function mapBranchIdList(value: unknown): number[] {
  const raw = unwrapValue(value)
  const list = Array.isArray(raw) ? raw : (asRecord(raw, ['out']).out as unknown)
  if (!Array.isArray(list)) return []
  return list.map((id) => asNumber(id))
}

export function mapRollup(value: unknown): bigint[][] {
  const raw = unwrapValue(value)
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

export function mapAddressPage(value: unknown): string[] {
  const raw = unwrapValue(value)
  if (Array.isArray(raw)) {
    return raw.map((addr) => toAddress(asString(addr)))
  }
  const record = asRecord(raw, ['page'])
  const page = record.page
  if (!Array.isArray(page)) return []
  return page.map((addr) => toAddress(asString(addr)))
}