import {
  filterAgentsByServiceMask,
  filterAgentsByStatus,
  matchAgent,
  type AgentSearchRow,
} from '@meta-platform/chain'

export type AgentListRow = AgentSearchRow & {
  createdAt?: number
  branchCount?: number
}

export type AgentListFilters = {
  q: string
  status: number | null
  servicesMask: number | null
}

export function filterAndSearchAgents(rows: AgentListRow[], filters: AgentListFilters): AgentListRow[] {
  let list = rows
  list = filterAgentsByStatus(list, filters.status)
  list = filterAgentsByServiceMask(list, filters.servicesMask)
  if (filters.q.trim()) {
    list = list.filter((row) => matchAgent(row, filters.q))
  }
  return list
}

export function paginateAgents<T>(rows: T[], page: number, pageSize: number) {
  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    items: rows.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  }
}