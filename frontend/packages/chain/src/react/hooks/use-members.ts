import { useQuery } from '@tanstack/react-query'
import { useContracts } from '../contracts-context'

const PAGE_SIZE = 20

export function useMembers(branchId: number | null, page: number) {
  const contracts = useContracts()
  const offset = page * PAGE_SIZE
  return useQuery({
    queryKey: ['members', branchId, page],
    enabled: !!contracts && branchId != null && branchId > 0,
    queryFn: () => contracts!.agentAccess.membersOf(branchId!, offset, PAGE_SIZE),
  })
}