import {
  cash,
  revenue,
  sumDays,
  useContracts,
  useRollup,
  wallet,
  type ServiceFilter,
} from '@meta-platform/chain'
import {
  ColumnHeader,
  ColumnSection,
  EmptyState,
  ErrorState,
  HashAvatar,
  KpiTile,
  ListPager,
  ListRow,
  Money,
  PageLoader,
  RangePicker,
  RevenueChart,
  SearchPill,
  UnderlineTabs,
  formatVnd,
  resolveRangeDays,
  type RangePickerValue,
  type ServiceFilterValue,
} from '@meta-platform/ui'
import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
  const [showMore, setShowMore] = useState(false)
  const rankPageCount = Math.max(1, Math.ceil(rankings.total / DEFAULT_RANK_PAGE_SIZE))
  const trend = trendPercent(rev.net, prevRev.net)

  return (
    <>
      <ColumnHeader title="Tổng quan" subtitle="Toàn hệ thống · số liệu Ledger on-chain">
        <UnderlineTabs
          tabs={[
            { value: 'ALL', label: 'Tất cả dịch vụ' },
            { value: 'NET', label: 'NET' },
            { value: 'IQR', label: 'IQR' },
          ]}
          value={serviceUi}
          onChange={setServiceUi}
        />
      </ColumnHeader>

      <div className="border-b border-border px-4 py-3">
        <RangePicker value={range} onChange={setRange} />
      </div>

      {rollup.isError ? <ErrorState message={rollup.error.message} onRetry={() => rollup.refetch()} /> : null}

      {loading ? (
        <PageLoader message="Đang tải số liệu…" />
      ) : (
        <>
          <ColumnSection>
            <p className="text-[15px] text-muted-foreground">Doanh thu thuần</p>
            <p className="mt-1 text-[40px] leading-[48px] font-extrabold tracking-tight tabular-nums">{formatVnd(rev.net)}</p>
            {trend ? (
              <p className={`mt-1 text-[15px] font-bold ${trend.up ? 'text-success' : 'text-danger'}`}>
                {trend.text} <span className="font-normal text-muted-foreground">so với kỳ trước</span>
              </p>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <KpiTile label="Gộp" value={rev.gross} previous={prevRev.gross} />
              <KpiTile label="Tiền mặt thuần" value={cashFlow.net.cash} previous={prevCashFlow.net.cash} />
              <KpiTile label="Thuế thuần" value={rev.taxNet} previous={prevRev.taxNet} />
              <KpiTile label="Chuyển khoản thuần" value={cashFlow.net.transfer} />
              <KpiTile label="Giảm trừ" value={rev.discount} previous={prevRev.discount} />
              <KpiTile label="Hoàn" value={rev.refund} previous={prevRev.refund} />
            </div>
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="mt-3 inline-flex items-center gap-1 text-[15px] text-primary hover:underline"
            >
              {showMore ? 'Ẩn bớt' : 'Thêm chỉ số tiền thu & ví'}
              <ChevronDown className={`size-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
            </button>
            {showMore ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <KpiTile label="Điều chỉnh tăng" value={rev.adjUp} />
                <KpiTile label="Điều chỉnh giảm" value={rev.adjDown} />
                <KpiTile label="Thẻ thuần" value={cashFlow.net.card} />
                <KpiTile label="Điều chỉnh (+/−)" value={rev.adjUp - rev.adjDown} />
                <KpiTile label="Nạp ví" value={walletFlow.topup} />
                <KpiTile label="Trừ ví" value={walletFlow.spend} />
              </div>
            ) : null}
          </ColumnSection>

          <ColumnSection title="Doanh thu theo ngày" description="NET / IQR theo ngày kinh doanh (UTC+7)">
            {!hasData ? (
              <p className="py-6 text-[15px] text-muted-foreground">Chưa có giao dịch trong khoảng này.</p>
            ) : (
              <RevenueChart data={chart} />
            )}
          </ColumnSection>

          <ColumnSection flush title="Xếp hạng agent" description="Theo doanh thu thuần trong khoảng đã chọn">
            <div className="px-4 pb-3">
              <SearchPill value={rankQ} onChange={setRankQ} placeholder="Lọc agent trong bảng xếp hạng…" />
            </div>
            {rankings.isError ? (
              <ErrorState message={rankings.error?.message ?? 'Lỗi tải xếp hạng'} onRetry={() => rankings.refetch()} />
            ) : rankings.isLoading ? (
              <PageLoader message="Đang xếp hạng…" className="min-h-24" />
            ) : rankings.data.length === 0 ? (
              <EmptyState title={rankQ.trim() ? 'Không có agent khớp' : 'Chưa có dữ liệu agent'} />
            ) : (
              <>
                {rankings.data.map((row, i) => (
                  <ListRow
                    key={row.agentId}
                    to={`/agents/${row.agentId}`}
                    avatar={
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-right text-[15px] font-bold text-muted-foreground tabular-nums">
                          {rankPage * DEFAULT_RANK_PAGE_SIZE + i + 1}
                        </span>
                        <HashAvatar seed={row.owner} label={row.name || String(row.agentId)} size={40} />
                      </div>
                    }
                    title={row.name || `Agent #${row.agentId}`}
                    meta={`· #${row.agentId}`}
                    subtitle={
                      <span>
                        Gộp <Money value={row.gross} />
                      </span>
                    }
                    right={
                      <span className="pt-2.5 text-[15px] font-extrabold tabular-nums">
                        <Money value={row.net} />
                      </span>
                    }
                  />
                ))}
                <ListPager page={rankPage} pageCount={rankPageCount} onPageChange={setRankPage} />
              </>
            )}
          </ColumnSection>
        </>
      )}
    </>
  )
}

function trendPercent(current: bigint, previous: bigint): { text: string; up: boolean } | null {
  if (previous <= 0n) return null
  const diff = Number(((current - previous) * 10000n) / previous) / 100
  if (!Number.isFinite(diff)) return null
  return { text: `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%`, up: diff >= 0 }
}
