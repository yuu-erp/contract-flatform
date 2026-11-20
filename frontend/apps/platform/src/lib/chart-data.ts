import { dayToDate, revenue, type Day, type ServiceFilter } from '@meta-platform/chain'
import type { RevenueChartPoint } from '@meta-platform/ui'

export function buildDailyChart(
  rows: bigint[][],
  fromDay: Day,
  toDay: Day,
  tzMinutes: number,
  service: ServiceFilter,
): RevenueChartPoint[] {
  const points: RevenueChartPoint[] = []
  for (let i = 0; i < rows.length; i++) {
    const day = fromDay + i
    if (day > toDay) break
    const row = rows[i] ?? []
    const netRev = revenue(row, 'NET')
    const iqrRev = revenue(row, 'IQR')
    const date = dayToDate(day, tzMinutes)
    const label = `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    const useStacked = service === 'ALL'
    points.push({
      label,
      net: Number(useStacked || service === 'NET' ? netRev.net : 0n),
      iqr: Number(useStacked || service === 'IQR' ? iqrRev.net : 0n),
    })
  }
  return points
}