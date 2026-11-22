import { useQuery } from '@tanstack/react-query'
import { buildAuditSearchQuery, type AuditFilter } from '../../audit-search'
import { decodeAuditRecord } from '../../decode'
import { searchFullDB } from '../../search'
import { useContracts } from '../contracts-context'

export type { AuditFilter } from '../../audit-search'

export function useAuditLog(filter: AuditFilter, page: number) {
  const contracts = useContracts()
  const limit = 20
  const query = buildAuditSearchQuery(filter, page, limit)

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