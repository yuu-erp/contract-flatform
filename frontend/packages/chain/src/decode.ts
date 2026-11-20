import { decodeAbiParameters, parseAbiParameters, type Hex } from 'viem'
import { asString } from './normalize'
import { toAddress } from './address'

const ledgerParams = parseAbiParameters(
  '(uint8 version, uint8 kind, bytes32 refId, bytes32 originalRefId, uint64 agentId, uint64 branchId, address customer, uint16 service, uint8 method, uint128 amount, uint128 discount, uint128 tax, (uint64 branchId, uint128 amount)[] portions, address actor, uint64 shiftId, string reason, uint64 timestamp)',
)

const branchProfileRecordParams = parseAbiParameters(
  '(uint8 version, uint64 branchId, uint64 agentId, string domain, (string name, string location, string phone, string longlat, string note) profile, uint64 updatedAt)',
)

const agentProfileRecordParams = parseAbiParameters(
  '(uint8 version, uint64 agentId, address owner, (string storeName, string storeAddress, string note, string storePhone) profile, uint64 updatedAt)',
)

const auditRecordParams = parseAbiParameters(
  '(uint8 version, address actor, string action, uint64 agentId, uint64 branchId, bytes before, bytes after_, string reason, uint64 timestamp)',
)

export type LedgerPortion = { branchId: number; amount: bigint }
export type LedgerRecord = {
  version: number
  kind: number
  refId: Hex
  originalRefId: Hex
  agentId: number
  branchId: number
  customer: string
  service: number
  method: number
  amount: bigint
  discount: bigint
  tax: bigint
  portions: LedgerPortion[]
  actor: string
  shiftId: number
  reason: string
  timestamp: number
}

export type BranchProfile = {
  name: string
  location: string
  phone: string
  longlat: string
  note: string
}

export type BranchProfileRecord = {
  version: number
  branchId: number
  agentId: number
  domain: string
  profile: BranchProfile
  updatedAt: number
}

export type AgentProfile = {
  storeName: string
  storeAddress: string
  note: string
  storePhone: string
}

export type AgentProfileRecord = {
  version: number
  agentId: number
  owner: string
  profile: AgentProfile
  updatedAt: number
}

export type PlatformAuditRecord = {
  version: number
  actor: string
  action: string
  agentId: number
  branchId: number
  before: Hex
  after: Hex
  reason: string
  timestamp: number
}

function bytesToHex(data: Hex | Uint8Array): Hex {
  if (typeof data === 'string') return data as Hex
  const hex = [...data].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `0x${hex}` as Hex
}

export function decodeLedgerRecord(data: Hex | Uint8Array): LedgerRecord {
  const hex = bytesToHex(data)
  const [tuple] = decodeAbiParameters(ledgerParams, hex)
  return {
    version: Number(tuple.version),
    kind: Number(tuple.kind),
    refId: tuple.refId,
    originalRefId: tuple.originalRefId,
    agentId: Number(tuple.agentId),
    branchId: Number(tuple.branchId),
    customer: toAddress(tuple.customer),
    service: Number(tuple.service),
    method: Number(tuple.method),
    amount: tuple.amount,
    discount: tuple.discount,
    tax: tuple.tax,
    portions: tuple.portions.map((p) => ({ branchId: Number(p.branchId), amount: p.amount })),
    actor: toAddress(tuple.actor),
    shiftId: Number(tuple.shiftId),
    reason: tuple.reason,
    timestamp: Number(tuple.timestamp),
  }
}

export function decodeBranchProfileRecord(data: Hex | Uint8Array): BranchProfileRecord {
  const hex = bytesToHex(data)
  const [tuple] = decodeAbiParameters(branchProfileRecordParams, hex)
  return {
    version: Number(tuple.version),
    branchId: Number(tuple.branchId),
    agentId: Number(tuple.agentId),
    domain: tuple.domain,
    profile: {
      name: tuple.profile.name,
      location: tuple.profile.location,
      phone: tuple.profile.phone,
      longlat: tuple.profile.longlat,
      note: tuple.profile.note,
    },
    updatedAt: Number(tuple.updatedAt),
  }
}

export function decodeAgentProfileRecord(data: Hex | Uint8Array): AgentProfileRecord {
  const hex = bytesToHex(data)
  const [tuple] = decodeAbiParameters(agentProfileRecordParams, hex)
  return {
    version: Number(tuple.version),
    agentId: Number(tuple.agentId),
    owner: toAddress(tuple.owner),
    profile: {
      storeName: tuple.profile.storeName,
      storeAddress: tuple.profile.storeAddress,
      note: tuple.profile.note,
      storePhone: tuple.profile.storePhone,
    },
    updatedAt: Number(tuple.updatedAt),
  }
}

export function decodeAuditRecord(data: Hex | Uint8Array): PlatformAuditRecord {
  const hex = bytesToHex(data)
  const [tuple] = decodeAbiParameters(auditRecordParams, hex)
  return {
    version: Number(tuple.version),
    actor: toAddress(tuple.actor),
    action: tuple.action,
    agentId: Number(tuple.agentId),
    branchId: Number(tuple.branchId),
    before: tuple.before,
    after: tuple.after_,
    reason: tuple.reason,
    timestamp: Number(tuple.timestamp),
  }
}

export function decodeOptionalHex(value: unknown): Hex | null {
  const text = asString(value)
  return text.startsWith('0x') ? (text as Hex) : null
}