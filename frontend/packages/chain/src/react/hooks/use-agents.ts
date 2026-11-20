import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { AgentView } from '../../api/types'
import { mapWithConcurrency } from '../concurrency'
import { useContracts } from '../contracts-context'

export type AgentRow = AgentView & { profileName?: string }

export function useAgents() {
  const contracts = useContracts()
  const [statusFilter, setStatusFilter] = useState<number | null>(null)

  const query = useQuery({
    queryKey: ['agents', 'all'],
    enabled: !!contracts,
    queryFn: async (): Promise<AgentRow[]> => {
      const count = await contracts!.agents.agentCount()
      const ids = Array.from({ length: count }, (_, i) => count - i)
      return mapWithConcurrency(ids, 8, async (agentId) => {
        const agent = await contracts!.agents.getAgent(agentId)
        let profileName = ''
        try {
          const profile = await contracts!.agents.getAgentProfile(agentId)
          profileName = profile.profile.storeName
        } catch {
          // profile có thể chưa có
        }
        return { ...agent, profileName }
      })
    },
  })

  const rows = useMemo(() => {
    let list = query.data ?? []
    if (statusFilter != null) list = list.filter((row) => row.status === statusFilter)
    return list
  }, [query.data, statusFilter])

  const search = (text: string) => {
    const q = text.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => {
      const hay = [
        String(row.id),
        row.owner.toLowerCase(),
        row.profileName?.toLowerCase() ?? '',
      ].join(' ')
      return hay.includes(q)
    })
  }

  return {
    ...query,
    rows,
    search,
    filter: { status: statusFilter, setStatus: setStatusFilter },
  }
}