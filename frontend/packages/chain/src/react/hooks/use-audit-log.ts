import { useQuery } from '@tanstack/react-query'
import { decodeAuditRecord } from '../../decode'
import { searchFullDB, termAuditAgent, termBranch, type SearchQuery } from '../../search'
import { useContracts } from '../contracts-context'

export type AuditFilter = {
  agentId?: number
  branchId?: number
  action?: string
  actor?: string
  /** Unix timestamp (giây) — slot 0 nhật ký audit. */
  fromTs?: number
  toTs?: number
}

export function useAuditLog(filter: AuditFilter, page: number) {
  const contracts = useContracts()
  const limit = 20
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
  if (filter.actor) query.filters!.push({ prefix: 'R', value: filter.actor })
  if (filter.fromTs != null && filter.toTs != null) {
    query.ranges!.push({ slot: 0, min: BigInt(filter.fromTs), max: BigInt(filter.toTs) })
  }

  return useQuery({
    queryKey: ['audit', filter, page],
    enabled: !!contracts,
    queryFn: async () => {
      const pageResult = await searchFullDB(contracts!.history, 0, 'platform_audit', query)
      return {
        total: pageResult.total,
        items: pageResult.items.map((hit) => ({
          docId: hit.docId,
          record: decodeAuditRecord(hit.data),
        })),
      }
    },
  })
}