import {
  chunkDays,
  mapWithConcurrency,
  matchAgent,
  revenue,
  sumDays,
  useContracts,
  type AgentSearchRow,
  type ServiceFilter,
} from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { sortAgentRankings, type AgentRankingRow } from '../lib/agent-ranking'
import { SCOPE_AGENT } from '../lib/scopes'

export const DEFAULT_RANK_PAGE_SIZE = 10

async function loadAgentSearchRow(
  contracts: NonNullable<ReturnType<typeof useContracts>>,
  agentId: number,
): Promise<AgentSearchRow> {
  const agent = await contracts.agents.getAgent(agentId)
  let profileName = ''
  let storePhone = ''
  let storeAddress = ''
  if (agent.profileDocId > 0n) {
    const profile = await contracts.agents.getAgentProfile(agentId)
    profileName = profile.profile.storeName
    storePhone = profile.profile.storePhone
    storeAddress = profile.profile.storeAddress
  }
  return {
    id: agent.id,
    owner: agent.owner,
    status: agent.status,
    allowedServices: agent.allowedServices,
    profileName,
    storePhone,
    storeAddress,
  }
}

/** Xếp hạng theo trang: chỉ rollup agent trên trang hiện tại (không tải toàn bộ danh sách trước). */
export function useAgentRankingsPage(
  page: number,
  pageSize: number,
  fromDay: number,
  toDay: number,
  service: ServiceFilter,
  rankSearch: string,
) {
  const contracts = useContracts()
  const search = rankSearch.trim()

  const matchQuery = useQuery({
    queryKey: ['agents', 'rank-match', search],
    enabled: !!contracts && search.length > 0,
    queryFn: async (): Promise<AgentSearchRow[]> => {
      const count = await contracts!.agents.agentCount()
      const ids = Array.from({ length: count }, (_, i) => count - i)
      const matched: AgentSearchRow[] = []
      await mapWithConcurrency(ids, 8, async (agentId) => {
        const row = await loadAgentSearchRow(contracts!, agentId)
        if (matchAgent(row, search)) matched.push(row)
      })
      return matched
    },
  })

  const countQuery = useQuery({
    queryKey: ['agents', 'count'],
    enabled: !!contracts && search.length === 0,
    queryFn: () => contracts!.agents.agentCount(),
  })

  const idsOnPage = useMemo((): number[] | null => {
    if (search.length > 0) {
      if (!matchQuery.data) return null
      const start = page * pageSize
      return matchQuery.data.slice(start, start + pageSize).map((a) => a.id)
    }
    const count = countQuery.data
    if (count == null) return null
    const ids: number[] = []
    for (let i = 0; i < pageSize; i++) {
      const id = count - page * pageSize - i
      if (id >= 1) ids.push(id)
    }
    return ids
  }, [search, matchQuery.data, countQuery.data, page, pageSize])

  const total = useMemo(() => {
    if (search.length > 0) return matchQuery.data?.length ?? 0
    return countQuery.data ?? 0
  }, [search, matchQuery.data, countQuery.data])

  const metaLoading = search.length > 0 ? matchQuery.isLoading : countQuery.isLoading

  const agentsOnPage = useMemo((): AgentSearchRow[] | null => {
    if (idsOnPage == null || idsOnPage.length === 0) return idsOnPage ? [] : null
    if (search.length > 0) {
      const start = page * pageSize
      return (matchQuery.data ?? []).slice(start, start + pageSize)
    }
    return null
  }, [idsOnPage, search, matchQuery.data, page, pageSize])

  const rankingQuery = useQuery({
    queryKey: ['agent-rankings-page', idsOnPage, fromDay, toDay, service, page, search],
    enabled:
      !!contracts?.ledger &&
      fromDay <= toDay &&
      idsOnPage != null &&
      (idsOnPage.length > 0 || (search.length > 0 && matchQuery.isSuccess)),
    queryFn: async (): Promise<AgentRankingRow[]> => {
      const ledger = contracts!.ledger
      const targets: AgentSearchRow[] =
        agentsOnPage ??
        (await mapWithConcurrency(idsOnPage!, 8, (agentId) => loadAgentSearchRow(contracts!, agentId)))
      if (targets.length === 0) return []
      const rows = await mapWithConcurrency(targets, 8, async (agent) => {
        const chunks = chunkDays(fromDay, toDay)
        const daily: bigint[][] = []
        for (const [from, to] of chunks) {
          daily.push(...(await ledger.rollup(SCOPE_AGENT, agent.id, from, to)))
        }
        const summed = sumDays(daily)
        const rev = revenue(summed, service)
        return {
          agentId: agent.id,
          name: agent.profileName,
          owner: agent.owner,
          net: rev.net,
          gross: rev.gross,
        }
      })
      return sortAgentRankings(rows)
    },
  })

  const isLoading = metaLoading || rankingQuery.isLoading

  return {
    ...rankingQuery,
    data: rankingQuery.data ?? [],
    total,
    page,
    pageSize,
    isLoading,
    isError: rankingQuery.isError || matchQuery.isError || countQuery.isError,
    error: rankingQuery.error ?? matchQuery.error ?? countQuery.error,
    refetch: () => {
      void matchQuery.refetch()
      void countQuery.refetch()
      void rankingQuery.refetch()
    },
  }
}