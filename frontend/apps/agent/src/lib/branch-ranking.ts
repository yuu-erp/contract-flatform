import { revenue, servedHere, sumDays, type ServiceFilter } from '@meta-platform/chain'

export type BranchRankingRow = {
  branchId: number
  name: string
  net: bigint
  served: bigint
}

export function sumRankingNet(rows: Pick<BranchRankingRow, 'net'>[]): bigint {
  return rows.reduce((acc, row) => acc + row.net, 0n)
}

export function branchMetricsFromDaily(daily: bigint[][], service: ServiceFilter): Pick<BranchRankingRow, 'net' | 'served'> {
  const sum = sumDays(daily)
  const rev = revenue(sum, service)
  const served = servedHere(sum, service === 'IQR' ? 'IQR' : 'NET')
  return { net: rev.net, served }
}