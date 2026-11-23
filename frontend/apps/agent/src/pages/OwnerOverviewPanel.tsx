import {
  revenue,
  sumDays,
  useAgentBranches,
  useContracts,
  useRollup,
  type ServiceFilter,
} from '@meta-platform/chain'
import type { AgentAccess } from '@meta-platform/chain'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  KpiTile,
  Money,
  PageLoader,
  RevenueChart,
  resolveRangeDays,
  type RangePickerValue,
  type ServiceFilterValue,
  OverviewFiltersBar,
  buildDailyChart,
  PLATFORM_TZ_MINUTES,
  SCOPE_AGENT,
} from '@meta-platform/ui'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBranchRankings } from '../hooks/use-branch-rankings'
import { withDomain } from '../lib/read-domain'
import { cn } from '@meta-platform/ui'

export function OwnerOverviewPanel({
  access,
  domain,
}: {
  access: Extract<AgentAccess, { kind: 'owner' }>
  domain?: string
}) {
  const contracts = useContracts()
  const branches = useAgentBranches(access.agentId)
  const branchList = useMemo(
    () =>
      (branches.data?.rows ?? []).map((b) => ({
        branchId: b.record.branchId,
        name: b.record.profile.name,
        domain: b.record.domain,
      })),
    [branches.data],
  )
  const [range, setRange] = useState<RangePickerValue>('7d')
  const [serviceUi, setServiceUi] = useState<ServiceFilterValue>('ALL')
  const service: ServiceFilter = serviceUi
  const [branchFilter, setBranchFilter] = useState<number | 'all'>(
    access.focusBranchId ?? 'all',
  )
  const { fromDay, toDay } = useMemo(() => resolveRangeDays(range, PLATFORM_TZ_MINUTES), [range])
  const rollup = useRollup({
    ledger: contracts?.ledger ?? null,
    scope: SCOPE_AGENT,
    id: access.agentId,
    fromDay,
    toDay,
  })
  const rankings = useBranchRankings(branchList, fromDay, toDay, service)
  const filteredRankings = useMemo(() => {
    const rows = rankings.data ?? []
    if (branchFilter === 'all') return rows
    return rows.filter((r) => r.branchId === branchFilter)
  }, [rankings.data, branchFilter])

  const sum = useMemo(() => sumDays(rollup.data ?? []), [rollup.data])
  const rev = revenue(sum, service)
  const chart = useMemo(
    () => buildDailyChart(rollup.data ?? [], fromDay, toDay, PLATFORM_TZ_MINUTES, service),
    [rollup.data, fromDay, toDay, service],
  )
  const liability = useQuery({
    queryKey: ['wallet-liability', access.agentId],
    enabled: !!contracts,
    queryFn: () => contracts!.ledger.walletLiability(access.agentId),
  })

  return (
    <div className="space-y-4">
      <OverviewFiltersBar range={range} onRangeChange={setRange} service={serviceUi} onServiceChange={setServiceUi} />
      {branchList.length > 0 ? (
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-2">
          <span className="sr-only">Lọc chi nhánh</span>
          <BranchFilterChip active={branchFilter === 'all'} onClick={() => setBranchFilter('all')}>
            Tất cả
          </BranchFilterChip>
          {branchList.map((b) => (
            <BranchFilterChip
              key={b.branchId}
              active={branchFilter === b.branchId}
              onClick={() => setBranchFilter(b.branchId)}
            >
              {b.name || `#${b.branchId}`}
            </BranchFilterChip>
          ))}
        </div>
      ) : null}
      {rollup.isLoading ? (
        <PageLoader message="Đang tải KPI…" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiTile label="Doanh thu thuần" value={rev.net} />
            <KpiTile label="Gộp" value={rev.gross} />
            <KpiTile label="Dư nợ ví khách" value={liability.data ?? 0n} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu (UTC+7)</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={chart} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>So sánh chi nhánh</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {rankings.isLoading ? (
                <PageLoader message="Đang tải bảng chi nhánh…" />
              ) : filteredRankings.length === 0 ? (
                <EmptyState title="Chưa có chi nhánh" />
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2">Chi nhánh</th>
                      <th className="py-2 text-right">Thuần</th>
                      <th className="py-2 text-right">Phục vụ tại chỗ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRankings.map((row) => (
                      <tr key={row.branchId} className="border-t border-border">
                        <td className="py-2">
                          <Link
                            to={withDomain(`/branches/${row.branchId}`, domain)}
                            className="text-primary hover:underline"
                          >
                            {row.name || `#${row.branchId}`}
                          </Link>
                        </td>
                        <td className="py-2 text-right">
                          <Money value={row.net} />
                        </td>
                        <td className="py-2 text-right">
                          <Money value={row.served} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function BranchFilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}