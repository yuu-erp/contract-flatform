import { encodeAbiParameters, parseAbiParameters, type Hex } from 'viem'
import type { BranchProfile, PlatformAuditRecord } from '../decode'

const ledgerParams = parseAbiParameters(
  '(uint8 version, uint8 kind, bytes32 refId, bytes32 originalRefId, uint64 agentId, uint64 branchId, address customer, uint16 service, uint8 method, uint128 amount, uint128 discount, uint128 tax, (uint64 branchId, uint128 amount)[] portions, address actor, uint64 shiftId, string reason, uint64 timestamp)',
)

const branchProfileParams = parseAbiParameters(
  '(uint8 version, uint64 branchId, uint64 agentId, string domain, (string name, string location, string phone, string longlat, string note) profile, uint64 updatedAt)',
)

const auditParams = parseAbiParameters(
  '(uint8 version, address actor, string action, uint64 agentId, uint64 branchId, bytes before, bytes after_, string reason, uint64 timestamp)',
)

export function encodeLedgerRecord(input: {
  kind: number
  method: number
  service: number
  agentId: number
  branchId: number
  customer: string
  amount: bigint
  actor: string
  timestamp: number
  day: number
}): Hex {
  const refId = `0x${input.agentId.toString(16).padStart(8, '0')}${input.branchId.toString(16).padStart(8, '0')}${'a'.repeat(48)}` as Hex
  return encodeAbiParameters(ledgerParams, [
    {
      version: 1,
      kind: input.kind,
      refId,
      originalRefId: refId,
      agentId: BigInt(input.agentId),
      branchId: BigInt(input.branchId),
      customer: input.customer as `0x${string}`,
      service: input.service,
      method: input.method,
      amount: input.amount,
      discount: 0n,
      tax: input.amount / 10n,
      portions: [{ branchId: BigInt(input.branchId), amount: input.amount }],
      actor: input.actor as `0x${string}`,
      shiftId: 0n,
      reason: 'mock',
      timestamp: BigInt(input.timestamp),
    },
  ])
}

export function encodeBranchProfile(input: {
  branchId: number
  agentId: number
  domain: string
  profile: BranchProfile
  updatedAt: number
}): Hex {
  return encodeAbiParameters(branchProfileParams, [
    {
      version: 1,
      branchId: BigInt(input.branchId),
      agentId: BigInt(input.agentId),
      domain: input.domain,
      profile: input.profile,
      updatedAt: BigInt(input.updatedAt),
    },
  ])
}

export function encodeAuditRecord(record: PlatformAuditRecord): Hex {
  return encodeAbiParameters(auditParams, [
    {
      version: record.version,
      actor: record.actor as `0x${string}`,
      action: record.action,
      agentId: BigInt(record.agentId),
      branchId: BigInt(record.branchId),
      before: record.before,
      after_: record.after,
      reason: record.reason,
      timestamp: BigInt(record.timestamp),
    },
  ])
}