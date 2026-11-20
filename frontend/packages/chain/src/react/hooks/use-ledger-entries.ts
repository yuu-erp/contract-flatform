import { useQuery } from '@tanstack/react-query'
import { decodeLedgerRecord } from '../../decode'
import { searchFullDB, termAddress, termBranch, termKind, type SearchQuery } from '../../search'
import { useContracts } from '../contracts-context'

export type LedgerFilter = {
  branchId?: number
  kind?: number
  customer?: string
  actor?: string
  shiftId?: number
  fromDay?: number
  toDay?: number
}

export function useLedgerEntries(agentId: number | null, filter: LedgerFilter, page: number) {
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
  if (filter.branchId != null) query.filters!.push(termBranch(filter.branchId))
  if (filter.kind != null) query.filters!.push(termKind(filter.kind))
  if (filter.customer) query.filters!.push(termAddress('W', filter.customer))
  if (filter.actor) query.filters!.push(termAddress('S', filter.actor))
  if (filter.shiftId != null) query.filters!.push({ prefix: 'C', value: String(filter.shiftId) })
  if (filter.fromDay != null && filter.toDay != null) {
    query.ranges!.push({ slot: 2, min: BigInt(filter.fromDay), max: BigInt(filter.toDay) })
  }

  return useQuery({
    queryKey: ['ledger-entries', agentId, filter, page],
    enabled: !!contracts && agentId != null && agentId > 0,
    queryFn: async () => {
      const pageResult = await searchFullDB(contracts!.history, agentId!, 'ledger', query)
      return {
        total: pageResult.total,
        items: pageResult.items.map((hit) => ({
          docId: hit.docId,
          record: decodeLedgerRecord(hit.data),
        })),
      }
    },
  })
}