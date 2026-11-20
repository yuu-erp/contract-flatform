import {
  cash,
  revenue,
  sumDays,
  useAgents,
  useContracts,
  useRollup,
  wallet,
  type ServiceFilter,
} from '@meta-platform/chain'
import {
  EmptyState,
  KpiTile,
  Money,
  RangePicker,
  RevenueChart,
  ServiceFilter as ServiceFilterControl,
  resolveRangeDays,
  type RangePickerValue,
  type ServiceFilterValue,
} from '@meta-platform/ui'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAgentRankings } from '../hooks/use-agent-rankings'
import { useTotalBranchCount } from '../hooks/use-branch-counts'
import { buildDailyChart } from '../lib/chart-data'
import { PLATFORM_TZ_MINUTES, previousDayRange, SCOPE_PLATFORM } from '../lib/scopes'

export function OverviewPage() {
  const contracts = useContracts()
  const [range, setRange] = useState<RangePickerValue>('7d')
  const [serviceUi, setServiceUi] = useState<ServiceFilterValue>('ALL')
  const service: ServiceFilter = serviceUi
  const [rankQ, setRankQ] = useState('')

  const { rows: agents, isLoading: agentsLoading } = useAgents()
  const { fromDay, toDay } = useMemo(
    () => resolveRangeDays(range, PLATFORM_TZ_MINUTES),
    [range],
  )
  const prev = useMemo(() => previousDayRange(fromDay, toDay), [fromDay, toDay])

  const rollup = useRollup({
    ledger: contracts?.ledger ?? null,
    scope: SCOPE_PLATFORM,
    id: 0,
    fromDay,
    toDay,
  })
  const prevRollup = useRollup({
    ledger: contracts?.ledger ?? null,
    scope: SCOPE_PLATFORM,
    id: 0,
    fromDay: prev.fromDay,
    toDay: prev.toDay,
    enabled: prev.fromDay <= prev.toDay && prev.toDay >= 0,
  })

  const rankings = useAgentRankings(agents, fromDay, toDay, service, rankQ)
  const branchTotals = useTotalBranchCount(agents.map((a) => a.id))

  const currentSum = useMemo(() => sumDays(rollup.data ?? []), [rollup.data])
  const prevSum = useMemo(() => sumDays(prevRollup.data ?? []), [prevRollup.data])
  const rev = revenue(currentSum, service)
  const prevRev = revenue(prevSum, service)
  const cashFlow = cash(currentSum)
  const walletFlow = wallet(currentSum)
  const chart = useMemo(
    () => buildDailyChart(rollup.data ?? [], fromDay, toDay, PLATFORM_TZ_MINUTES, service),
    [rollup.data, fromDay, toDay, service],
  )

  const statusCounts = useMemo(() => {
    const counts = { active: 0, suspended: 0, deleted: 0 }
    for (const a of agents) {
      if (a.status === 1) counts.active++
      else if (a.status === 2) counts.suspended++
      else if (a.status === 3) counts.deleted++
    }
    return counts
  }, [agents])

  const hasData = rollup.data?.some((row) => row.some((v) => v !== 0n))

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <RangePicker value={range} onChange={setRange} />
        <ServiceFilterControl value={serviceUi} onChange={setServiceUi} />
      </div>

      {rollup.isError && <EmptyState title="Không tải được số liệu" description={rollup.error.message} />}

      <StatsBlock loading={rollup.isLoading || agentsLoading}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Doanh thu thuần" value={rev.net} previous={prevRev.net} />
          <KpiTile label="Gộp" value={rev.gross} previous={revenue(prevSum, service).gross} />
          <KpiTile label="Giảm trừ" value={rev.discount} />
          <KpiTile label="Hoàn" value={rev.refund} />
          <KpiTile label="Điều chỉnh tăng" value={rev.adjUp} />
          <KpiTile label="Điều chỉnh giảm" value={rev.adjDown} />
          <KpiTile label="Thuế thuần" value={rev.taxNet} previous={revenue(prevSum, service).taxNet} />
          <KpiTile label="Tiền mặt thuần" value={cashFlow.net.cash} />
          <KpiTile label="Chuyển khoản thuần" value={cashFlow.net.transfer} />
          <KpiTile label="Thẻ thuần" value={cashFlow.net.card} />
          <KpiTile label="Nạp ví" value={walletFlow.topup} />
          <KpiTile label="Trừ ví" value={walletFlow.spend} />
        </div>
      </StatsBlock>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Doanh thu theo ngày</h2>
          {!rollup.isLoading && !hasData ? (
            <EmptyState title="Chưa có giao dịch trong khoảng này" />
          ) : (
            <RevenueChart data={chart} />
          )}
        </div>
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-semibold">Tổng quan hệ thống</h2>
          <p className="text-sm">
            Agent hoạt động: <strong>{statusCounts.active}</strong> · Tạm dừng:{' '}
            <strong>{statusCounts.suspended}</strong> · Đã xoá: <strong>{statusCounts.deleted}</strong>
          </p>
          <p className="text-sm">
            Tổng chi nhánh: <strong>{branchTotals.isLoading ? '…' : branchTotals.total}</strong>
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Xếp hạng agent</h2>
          <input
            className="rounded-md border border-border px-3 py-1.5 text-sm"
            placeholder="Tìm agent…"
            value={rankQ}
            onChange={(e) => setRankQ(e.target.value)}
          />
        </div>
        {rankings.isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải bảng xếp hạng…</p>
        ) : rankings.data?.length === 0 ? (
          <EmptyState title="Chưa có giao dịch trong khoảng này" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Agent</th>
                  <th className="py-2 pr-2">Doanh thu thuần</th>
                </tr>
              </thead>
              <tbody>
                {rankings.data?.map((row, index) => (
                  <tr key={row.agentId} className="border-t border-border">
                    <td className="py-2 pr-2">{index + 1}</td>
                    <td className="py-2 pr-2">
                      <Link to={`/agents/${row.agentId}`} className="text-primary hover:underline">
                        {row.name || `Agent #${row.agentId}`}
                      </Link>
                    </td>
                    <td className="py-2 pr-2">
                      <Money value={row.net} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function StatsBlock({ loading, children }: { loading: boolean; children: ReactNode }) {
  if (loading) return <p className="text-sm text-muted-foreground">Đang tải KPI…</p>
  return children
}