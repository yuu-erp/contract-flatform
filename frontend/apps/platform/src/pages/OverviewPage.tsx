import {
  cash,
  formatWalletAddress,
  revenue,
  sumDays,
  useContracts,
  useRollup,
  wallet,
  type ServiceFilter,
} from '@meta-platform/chain'
import {
  DataTable,
  EmptyState,
  ErrorState,
  HashAvatar,
  KpiTile,
  Money,
  PageHeader,
  PageLoader,
  Panel,
  RangePicker,
  RevenueChart,
  SearchPill,
  ServiceFilter as ServiceFilterControl,
  formatVnd,
  resolveRangeDays,
  type RangePickerValue,
  type ServiceFilterValue,
} from '@meta-platform/ui'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SystemStatusCard, TopAgentsCard } from '../components/OverviewCards'
import {
  DEFAULT_RANK_PAGE_SIZE,
  useAgentRankingsPage,
} from '../hooks/use-agent-rankings'
import { buildDailyChart } from '@meta-platform/ui'
import { PLATFORM_TZ_MINUTES, previousDayRange, SCOPE_PLATFORM } from '../lib/scopes'

export function OverviewPage() {
  const contracts = useContracts()
  const [range, setRange] = useState<RangePickerValue>('7d')
  const [serviceUi, setServiceUi] = useState<ServiceFilterValue>('ALL')
  const service: ServiceFilter = serviceUi
  const [rankQ, setRankQ] = useState('')
  const [rankPage, setRankPage] = useState(0)


  const { fromDay, toDay } = useMemo(
    () => resolveRangeDays(range, PLATFORM_TZ_MINUTES),
    [range],
  )

  useEffect(() => {
    setRankPage(0)
  }, [rankQ, fromDay, toDay, serviceUi])
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

  const rankings = useAgentRankingsPage(
    rankPage,
    DEFAULT_RANK_PAGE_SIZE,
    fromDay,
    toDay,
    service,
    rankQ,
  )

  const currentSum = useMemo(() => sumDays(rollup.data ?? []), [rollup.data])
  const prevSum = useMemo(() => sumDays(prevRollup.data ?? []), [prevRollup.data])
  const rev = revenue(currentSum, service)
  const prevRev = revenue(prevSum, service)
  const cashFlow = cash(currentSum)
  const prevCashFlow = useMemo(() => cash(prevSum), [prevSum])
  const walletFlow = wallet(currentSum)
  const chart = useMemo(
    () => buildDailyChart(rollup.data ?? [], fromDay, toDay, PLATFORM_TZ_MINUTES, service),
    [rollup.data, fromDay, toDay, service],
  )

  const hasData = rollup.data?.some((row) => row.some((v) => v !== 0n))
  const loading = rollup.isLoading
  const trend = trendPercent(rev.net, prevRev.net)

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Doanh thu toàn hệ thống từ Ledger on-chain · ngày kinh doanh UTC+7"
        actions={<ServiceFilterControl value={serviceUi} onChange={setServiceUi} />}
      />
      <div className="mb-5">
        <RangePicker value={range} onChange={setRange} />
      </div>

      {rollup.isError ? <ErrorState message={rollup.error.message} onRetry={() => rollup.refetch()} /> : null}

      {loading ? (
        <PageLoader message="Đang tải số liệu…" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <div className="col-span-2 flex flex-col justify-center rounded-2xl bg-primary px-5 py-4 text-primary-foreground xl:col-span-1 xl:row-span-2">
              <p className="text-[15px] font-bold opacity-85">Doanh thu thuần</p>
              <p className="mt-1 text-[31px] leading-9 font-extrabold tracking-tight whitespace-nowrap tabular-nums">
                {formatVnd(rev.net)}
              </p>
              {trend ? <p className="mt-1 text-[15px] font-bold opacity-90">{trend.text} so kỳ trước</p> : null}
            </div>
            <KpiTile label="Gộp" value={rev.gross} previous={prevRev.gross} />
            <KpiTile label="Tiền mặt thuần" value={cashFlow.net.cash} previous={prevCashFlow.net.cash} />
            <KpiTile label="Thuế thuần" value={rev.taxNet} previous={prevRev.taxNet} />
            <KpiTile label="Chuyển khoản thuần" value={cashFlow.net.transfer} />
            <KpiTile label="Giảm trừ" value={rev.discount} previous={prevRev.discount} />
            <KpiTile label="Hoàn" value={rev.refund} previous={prevRev.refund} />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Panel
              title="Doanh thu theo ngày"
              description="NET / IQR chồng theo ngày kinh doanh"
              className="xl:col-span-2"
            >
              {!hasData ? (
                <EmptyState title="Chưa có giao dịch" description="Không có bút toán trong khoảng ngày đã chọn." />
              ) : (
                <RevenueChart data={chart} />
              )}
            </Panel>
            <div className="grid gap-4">
              <SystemStatusCard />
              <Panel title="Tiền thu & ví" bodyClassName="grid grid-cols-2 gap-x-4 gap-y-3 text-[15px]">
                <MiniStat label="Nạp ví" value={walletFlow.topup} />
                <MiniStat label="Trừ ví" value={walletFlow.spend} />
                <MiniStat label="Thẻ thuần" value={cashFlow.net.card} />
                <MiniStat label="Điều chỉnh (+/−)" value={rev.adjUp - rev.adjDown} />
                <MiniStat label="Điều chỉnh tăng" value={rev.adjUp} />
                <MiniStat label="Điều chỉnh giảm" value={rev.adjDown} />
              </Panel>
            </div>
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-3">
            <Panel
              flush
              className="xl:col-span-2"
              title="Xếp hạng agent"
              description="Theo doanh thu thuần trong khoảng đã chọn"
              actions={
                <SearchPill value={rankQ} onChange={setRankQ} placeholder="Lọc agent…" className="h-10 w-full sm:w-64" />
              }
            >
              <DataTable
                bare
                columns={[
                  {
                    key: 'rank',
                    header: '#',
                    className: 'w-12 text-muted-foreground tabular-nums',
                    render: (row) => rankPage * DEFAULT_RANK_PAGE_SIZE + rankings.data.indexOf(row) + 1,
                  },
                  {
                    key: 'agent',
                    header: 'Agent',
                    render: (row) => (
                      <Link to={`/agents/${row.agentId}`} className="group flex items-center gap-3">
                        <HashAvatar seed={row.owner} label={row.name || String(row.agentId)} size={36} />
                        <span className="min-w-0">
                          <span className="block truncate font-bold group-hover:underline">
                            {row.name || `Agent #${row.agentId}`}
                          </span>
                          <span className="block text-[13px] text-muted-foreground">
                            #{row.agentId} · {formatWalletAddress(row.owner)}
                          </span>
                        </span>
                      </Link>
                    ),
                  },
                  {
                    key: 'gross',
                    header: 'Gộp',
                    className: 'hidden text-right tabular-nums sm:table-cell',
                    render: (row) => <Money value={row.gross} />,
                  },
                  {
                    key: 'net',
                    header: 'Thuần',
                    className: 'text-right font-bold tabular-nums',
                    render: (row) => <Money value={row.net} />,
                  },
                ]}
                rows={rankings.data}
                page={rankPage}
                pageSize={DEFAULT_RANK_PAGE_SIZE}
                total={rankings.total}
                onPageChange={setRankPage}
                loading={rankings.isLoading}
                error={rankings.isError ? rankings.error?.message : null}
                onRetry={() => rankings.refetch()}
                emptyTitle={rankQ.trim() ? 'Không có agent khớp' : 'Chưa có dữ liệu agent'}
              />
            </Panel>
            <TopAgentsCard rows={rankings.data} loading={rankings.isLoading} />
          </div>
        </div>
      )}
    </>
  )
}

function MiniStat({ label, value }: { label: string; value: bigint }) {
  return (
    <div>
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="font-extrabold tabular-nums">
        <Money value={value} />
      </p>
    </div>
  )
}

function trendPercent(current: bigint, previous: bigint): { text: string; up: boolean } | null {
  if (previous <= 0n) return null
  const diff = Number(((current - previous) * 10000n) / previous) / 100
  if (!Number.isFinite(diff)) return null
  return { text: `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`, up: diff >= 0 }
}
