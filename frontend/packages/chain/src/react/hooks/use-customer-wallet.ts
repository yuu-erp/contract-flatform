import { useQuery } from '@tanstack/react-query'
import { useContracts } from '../contracts-context'

export function useCustomerWallet(agentId: number | null, customer: string | null) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['customer-wallet', agentId, customer],
    enabled: !!contracts && agentId != null && agentId > 0 && !!customer,
    queryFn: async () => {
      const [balance, buckets] = await Promise.all([
        contracts!.ledger.balanceOf(agentId!, customer!),
        contracts!.ledger.bucketsOf(agentId!, customer!),
      ])
      return { balance, buckets }
    },
  })
}