import { useQuery } from '@tanstack/react-query'
import { useContracts } from '../contracts-context'

export function useBranch(branchId: number | null) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['branch', branchId],
    enabled: !!contracts && branchId != null && branchId > 0,
    queryFn: () => contracts!.branches.getBranch(branchId!),
  })
}