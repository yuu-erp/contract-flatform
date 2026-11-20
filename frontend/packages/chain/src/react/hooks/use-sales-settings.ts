import { useQuery } from '@tanstack/react-query'
import { useContracts } from '../contracts-context'

const SERVICE_NET = 1
const SERVICE_IQR = 2

export function useSalesSettings(agentId: number | null, branchIds: number[]) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['sales-settings', agentId, branchIds],
    enabled: !!contracts && agentId != null,
    queryFn: async () => {
      const settings = contracts!.salesSettings
      const branchTaxes: Record<number, { net: Awaited<ReturnType<typeof settings.branchTaxOf>>; iqr: Awaited<ReturnType<typeof settings.branchTaxOf>> }> = {}
      for (const branchId of branchIds) {
        branchTaxes[branchId] = {
          net: await settings.branchTaxOf(branchId, SERVICE_NET),
          iqr: await settings.branchTaxOf(branchId, SERVICE_IQR),
        }
      }
      return { branchTaxes }
    },
  })
}