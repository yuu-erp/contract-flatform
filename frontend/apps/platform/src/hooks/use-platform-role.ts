import { useContracts, useActiveWallet } from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'

export function usePlatformRole() {
  const contracts = useContracts()
  const { data: wallet } = useActiveWallet()

  const roleQuery = useQuery({
    queryKey: ['platform-role', wallet?.address],
    enabled: !!contracts && !!wallet?.address,
    queryFn: async () => contracts!.access.resolvePlatformRole(wallet!.address),
  })

  const pausedQuery = useQuery({
    queryKey: ['platform-paused'],
    enabled: !!contracts,
    queryFn: () => contracts!.access.paused(),
  })

  return {
    wallet,
    role: roleQuery.data,
    loading: roleQuery.isLoading,
    paused: pausedQuery.data ?? false,
    refetchRole: roleQuery.refetch,
  }
}