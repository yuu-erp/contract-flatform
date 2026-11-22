import { useContracts } from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'

export function useGlobalBranchCount() {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['branches', 'global-count'],
    enabled: !!contracts,
    queryFn: () => contracts!.branches.branchCount(),
  })
}