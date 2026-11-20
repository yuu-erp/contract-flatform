import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { AgentView } from '../../api/types'
import {
  filterAgentsByServiceMask,
  filterAgentsByStatus,
  matchAgent,
  type AgentSearchRow,
} from '../../search-agents'
import { mapWithConcurrency } from '../concurrency'
import { useContracts } from '../contracts-context'

export type AgentRow = AgentView &
  AgentSearchRow & {
    profileName?: string
    storePhone?: string
    storeAddress?: string
  }

export function useAgents() {
  const contracts = useContracts()
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [servicesMask, setServicesMask] = useState<number | null>(null)

  const query = useQuery({
    queryKey: ['agents', 'all'],
    enabled: !!contracts,
    queryFn: async (): Promise<AgentRow[]> => {
      const count = await contracts!.agents.agentCount()
      const ids = Array.from({ length: count }, (_, i) => count - i)
      return mapWithConcurrency(ids, 8, async (agentId) => {
        const agent = await contracts!.agents.getAgent(agentId)
        let profileName = ''
        let storePhone = ''
        let storeAddress = ''
        if (agent.profileDocId > 0n) {
          try {
            const profile = await contracts!.agents.getAgentProfile(agentId)
            profileName = profile.profile.storeName
            storePhone = profile.profile.storePhone
            storeAddress = profile.profile.storeAddress
          } catch (error) {
            console.warn('getAgentProfile failed', { agentId, error })
            throw error
          }
        }
        return { ...agent, profileName, storePhone, storeAddress }
      })
    },
  })

  const rows = useMemo(() => {
    let list = query.data ?? []
    list = filterAgentsByStatus(list, statusFilter)
    list = filterAgentsByServiceMask(list, servicesMask)
    return list
  }, [query.data, statusFilter, servicesMask])

  const search = (text: string) => rows.filter((row) => matchAgent(row, text))

  return {
    ...query,
    rows,
    search,
    filter: {
      status: statusFilter,
      setStatus: setStatusFilter,
      servicesMask,
      setServicesMask,
    },
  }
}