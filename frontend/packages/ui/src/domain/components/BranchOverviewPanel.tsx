import {
  revenue,
  servedHere,
  sumDays,
  useContracts,
  useRollup,
  type ServiceFilter,
} from '@meta-platform/chain'
import { useMemo, useState } from 'react'
import { KpiTile } from '../../components/KpiTile'
import { PageLoader } from '../../components/PageLoader'
import { RevenueChart } from '../../components/RevenueChart'
import { resolveRangeDays, type RangePickerValue } from '../../lib/range-picker'
import type { ServiceFilterValue } from '../../components/ServiceFilter'
import { buildDailyChart } from '../lib/chart-data'
import { SCOPE_BRANCH } from '../lib/scopes'
import { OverviewFiltersBar } from './OverviewFiltersBar'

export function BranchOverviewPanel({ branchId, tzMinutes }: { branchId: number; tzMinutes: number }) {
  const contracts = useContracts()
  const [range, setRange] = useState<RangePickerValue>('7d')
  const [serviceUi, setServiceUi] = useState<ServiceFilterValue>('ALL')
  const service: ServiceFilter = serviceUi
  const { fromDay, toDay } = useMemo(() => resolveRangeDays(range, tzMinutes), [range, tzMinutes])
  const rollup = useRollup({ ledger: contracts?.ledger ?? null, scope: SCOPE_BRANCH, id: branchId, fromDay, toDay })
  const sum = useMemo(() => sumDays(rollup.data ?? []), [rollup.data])
  const rev = revenue(sum, service)
  const served = servedHere(sum, service === 'IQR' ? 'IQR' : 'NET')
  const chart = useMemo(
    () => buildDailyChart(rollup.data ?? [], fromDay, toDay, tzMinutes, service),
    [rollup.data, fromDay, toDay, tzMinutes, service],
  )

  return (
    <div className="space-y-4">
      <OverviewFiltersBar range={range} onRangeChange={setRange} service={serviceUi} onServiceChange={setServiceUi} />
      {rollup.isLoading ? (
        <PageLoader />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiTile label="Doanh thu thuần" value={rev.net} />
            <KpiTile label="Gộp" value={rev.gross} />
            <KpiTile label="Phục vụ tại chỗ thuần" value={served} />
          </div>
          <RevenueChart data={chart} />
        </>
      )}
    </div>
  )
}