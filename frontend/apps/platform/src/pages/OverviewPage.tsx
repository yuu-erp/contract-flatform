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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DashboardToolbar,
  EmptyState,
  Input,
  KpiTile,
  Money,
  PageLoader,
  RangePicker,
  RevenueChart,
  ServiceFilter as ServiceFilterControl,
  resolveRangeDays,
  type RangePickerValue,
  type ServiceFilterValue,
} from '@meta-platform/ui'
import { useMemo, useState } from 'react'
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
  const loading = rollup.isLoading || agentsLoading

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tổng quan nền tảng</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Doanh thu, tiền mặt và xếp hạng agent theo Ledger on-chain. Chọn khoảng ngày và dịch vụ để lọc số liệu.
        </p>
      </div>

      <DashboardToolbar className="shadow-sm">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Khoảng thời gian</span>
          <RangePicker value={range} onChange={setRange} className="min-w-0 flex-1" />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 md:border-t-0 md:pt-0 lg:pl-3 lg:border-l">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dịch vụ</span>
          <ServiceFilterControl value={serviceUi} onChange={setServiceUi} />
        </div>
      </DashboardToolbar>

      {rollup.isError && <EmptyState title="Không tải được số liệu" description={rollup.error.message} />}

      {loading ? (
        <PageLoader message="Đang tải KPI…" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiTile
              className="border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 sm:col-span-2 xl:col-span-1"
              label="Doanh thu thuần"
              value={rev.net}
              previous={prevRev.net}
            />
            <KpiTile label="Gộp" value={rev.gross} previous={revenue(prevSum, service).gross} />
            <KpiTile label="Thuế thuần" value={rev.taxNet} previous={revenue(prevSum, service).taxNet} />
            <KpiTile label="Tiền mặt thuần" value={cashFlow.net.cash} />
            <KpiTile label="Giảm trừ" value={rev.discount} />
            <KpiTile label="Hoàn" value={rev.refund} />
            <KpiTile label="Điều chỉnh (+/−)" value={rev.adjUp - rev.adjDown} />
            <KpiTile label="Chuyển khoản thuần" value={cashFlow.net.transfer} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Doanh thu theo ngày</CardTitle>
                <CardDescription>NET / IQR chồng theo ngày kinh doanh (UTC+7)</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {!hasData ? (
                  <EmptyState title="Chưa có giao dịch trong khoảng này" />
                ) : (
                  <RevenueChart data={chart} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hệ thống</CardTitle>
                <CardDescription>Agent và chi nhánh on-chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Agent hoạt động</span>
                  <span className="font-semibold tabular-nums">{statusCounts.active}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Tạm dừng / Đã xoá</span>
                  <span className="font-semibold tabular-nums">
                    {statusCounts.suspended} / {statusCounts.deleted}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Tổng chi nhánh</span>
                  <span className="font-semibold tabular-nums">
                    {branchTotals.isLoading ? '…' : branchTotals.total}
                  </span>
                </div>
                <Link
                  to="/agents"
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Mở danh sách agent →
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Xếp hạng agent</CardTitle>
                <CardDescription>Theo doanh thu thuần trong khoảng đã chọn</CardDescription>
              </div>
              <Input
                className="w-full max-w-xs"
                placeholder="Tìm agent…"
                value={rankQ}
                onChange={(e) => setRankQ(e.target.value)}
              />
            </CardHeader>
            <CardContent className="pt-0">
              {rankings.isLoading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Đang tải bảng xếp hạng…</p>
              ) : rankings.data?.length === 0 ? (
                <EmptyState title="Chưa có giao dịch trong khoảng này" />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Agent</th>
                        <th className="px-4 py-2.5 text-right">Doanh thu thuần</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings.data?.map((row, index) => (
                        <tr key={row.agentId} className="border-t border-border hover:bg-muted/30">
                          <td className="px-4 py-2.5 text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-2.5">
                            <Link to={`/agents/${row.agentId}`} className="font-medium text-primary hover:underline">
                              {row.name || `Agent #${row.agentId}`}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Money value={row.net} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <details className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
            <summary className="cursor-pointer font-medium">Tiền thu & ví (chi tiết)</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiTile label="Điều chỉnh tăng" value={rev.adjUp} />
              <KpiTile label="Điều chỉnh giảm" value={rev.adjDown} />
              <KpiTile label="Chuyển khoản thuần" value={cashFlow.net.transfer} />
              <KpiTile label="Thẻ thuần" value={cashFlow.net.card} />
              <KpiTile label="Nạp ví" value={walletFlow.topup} />
              <KpiTile label="Trừ ví" value={walletFlow.spend} />
            </div>
          </details>
        </>
      )}
    </div>
  )
}