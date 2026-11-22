import { isAddress } from './address'
import { termAddress, termAuditAgent, termBranch, type SearchQuery } from './search'

export type AuditFilter = {
  agentId?: number
  branchId?: number
  action?: string
  actor?: string
  /** Unix timestamp (giây) — slot 0 nhật ký audit. */
  fromTs?: number
  toTs?: number
}

/** Giới hạn trên khi chỉ chọn "đến ngày" hoặc mở đầu khoảng. */
export const AUDIT_TS_MAX = 4_102_444_800

export function buildAuditSearchQuery(filter: AuditFilter, page: number, limit = 20): SearchQuery {
  const query: SearchQuery = {
    offset: page * limit,
    limit,
    sortSlot: 0,
    ascending: false,
    filters: [],
    ranges: [],
  }
  if (filter.agentId != null) query.filters!.push(termAuditAgent(filter.agentId))
  if (filter.branchId != null) query.filters!.push(termBranch(filter.branchId))
  if (filter.action) query.filters!.push({ prefix: 'X', value: filter.action })
  if (filter.actor) {
    if (!isAddress(filter.actor)) {
      throw new Error('invalid_audit_actor')
    }
    query.filters!.push(termAddress('R', filter.actor))
  }
  if (filter.fromTs != null || filter.toTs != null) {
    query.ranges!.push({
      slot: 0,
      min: BigInt(filter.fromTs ?? 0),
      max: BigInt(filter.toTs ?? AUDIT_TS_MAX),
    })
  }
  return query
}