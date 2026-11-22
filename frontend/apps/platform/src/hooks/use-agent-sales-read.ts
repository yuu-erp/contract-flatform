import { useContracts } from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'

const SERVICE_NET = 1
const SERVICE_IQR = 2

export function useAgentSalesRead(agentId: number | null, branchIds: number[]) {
  const contracts = useContracts()
  return useQuery({
    queryKey: ['agent-sales-read', agentId, branchIds],
    enabled: !!contracts && agentId != null && agentId > 0,
    queryFn: async () => {
      const s = contracts!.salesSettings
      const [taxNet, taxIqr, methods, exNet, exIqr] = await Promise.all([
        s.agentTaxOf(agentId!, SERVICE_NET),
        s.agentTaxOf(agentId!, SERVICE_IQR),
        s.agentPaymentMethodsOf(agentId!),
        s.isTaxExclusive(agentId!, SERVICE_NET),
        s.isTaxExclusive(agentId!, SERVICE_IQR),
      ])
      const branchTaxes: Record<number, { net: Awaited<ReturnType<typeof s.branchTaxOf>>; iqr: Awaited<ReturnType<typeof s.branchTaxOf>>; methods: number }> =
        {}
      for (const branchId of branchIds) {
        branchTaxes[branchId] = {
          net: await s.branchTaxOf(branchId, SERVICE_NET),
          iqr: await s.branchTaxOf(branchId, SERVICE_IQR),
          methods: await s.paymentMethodsOf(branchId),
        }
      }
      return { taxNet, taxIqr, methods, exNet, exIqr, branchTaxes }
    },
  })
}