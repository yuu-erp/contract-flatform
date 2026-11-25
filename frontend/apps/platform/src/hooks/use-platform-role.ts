import { useActiveWallet, useContracts, withTimeout } from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'

export function usePlatformRole() {
  const contracts = useContracts()
  const { data: wallet } = useActiveWallet()

  const roleQuery = useQuery({
    queryKey: ['platform-role', wallet?.address],
    enabled: !!contracts && !!wallet?.address,
    // RPC chết thì SDK có thể treo: chặn bằng thời hạn để hiện màn "Lỗi hệ thống".
    queryFn: () => withTimeout(contracts!.access.resolvePlatformRole(wallet!.address), undefined, 'Kiểm tra quyền'),
  })

  const pausedQuery = useQuery({
    queryKey: ['platform-paused'],
    enabled: !!contracts,
    queryFn: () => withTimeout(contracts!.access.paused(), undefined, 'Đọc trạng thái hệ thống'),
  })

  return {
    wallet,
    role: roleQuery.data,
    loading: roleQuery.isLoading,
    paused: pausedQuery.data ?? false,
    refetchRole: roleQuery.refetch,
    /** Lỗi đọc chain khi kiểm tra quyền (RPC chết, hết thời gian…). */
    error: roleQuery.isError ? roleQuery.error : null,
    retrying: roleQuery.isFetching,
    retry: () => {
      void roleQuery.refetch()
      void pausedQuery.refetch()
    },
  }
}
