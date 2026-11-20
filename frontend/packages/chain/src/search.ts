import { normalizeHexAddress } from './address'
import type { HistoryIndexContract } from './contracts/history-index.contract'
import { asHexData, asNumber, unwrapValue } from './normalize'

export type SearchTerm = { prefix: string; value: string }
export type SearchRange = { slot: number; min: bigint; max: bigint }
export type SearchQuery = {
  filters?: SearchTerm[]
  ranges?: SearchRange[]
  sortSlot?: number
  ascending?: boolean
  offset?: number
  limit?: number
}

export type SearchHit = { docId: number; data: `0x${string}` }
export type SearchResult = { total: number; items: SearchHit[] }

/**
 * Nhãn audit FullDB (`G<agentId>`), không phải term tự động `A` của HistoryIndex.
 * Dùng cho `platform_audit` và lọc nhật ký; tra cứu ledger dùng `termKind`, `termBranch`, …
 */
export function termAuditAgent(agentId: number | bigint): SearchTerm {
  return { prefix: 'G', value: String(agentId) }
}

/** @deprecated Dùng `termAuditAgent`. */
export const termAgent = termAuditAgent

export function termBranch(branchId: number | bigint): SearchTerm {
  return { prefix: 'B', value: String(branchId) }
}

export function termKind(kind: string | number): SearchTerm {
  return { prefix: 'K', value: String(kind) }
}

export function termAddress(prefix: string, address: string): SearchTerm {
  return { prefix, value: normalizeHexAddress(address) }
}

function toSearchQuery(q: SearchQuery) {
  const limit = q.limit ?? 100
  return {
    filters: q.filters ?? [],
    ranges: (q.ranges ?? []).map((r) => ({
      slot: r.slot,
      min: r.min.toString(),
      max: r.max.toString(),
    })),
    sortSlot: String(q.sortSlot ?? -1),
    ascending: q.ascending ?? false,
    offset: String(q.offset ?? 0),
    limit: String(Math.min(Math.max(limit, 1), 100)),
  }
}

export async function searchFullDB(
  history: HistoryIndexContract,
  agentId: number,
  kind: string,
  query: SearchQuery,
): Promise<SearchResult> {
  const result = await history.search(agentId, kind, toSearchQuery(query))
  const raw = unwrapValue(result) as Record<string, unknown>
  const total = asNumber(raw.total)
  const docIds = Array.isArray(raw.docIds) ? raw.docIds.map((id) => asNumber(id)) : []
  const data = Array.isArray(raw.data) ? raw.data.map((row) => asHexData(row)) : []
  const items: SearchHit[] = docIds.map((docId, index) => ({
    docId,
    data: data[index] ?? '0x',
  }))
  return { total, items }
}