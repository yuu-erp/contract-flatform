import {
  revenue,
  sumDays,
  useAgent,
  useAgentBranches,
  useContracts,
  useRollup,
  type ServiceFilter,
} from '@meta-platform/chain'
import {
  Address,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  KpiTile,
  Money,
  PageLoader,
  RevenueChart,
  StatusBadge,
  resolveRangeDays,
  type RangePickerValue,
  type ServiceFilterValue,
} from '@meta-platform/ui'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  AgentSalesSettingsReadonly,
  AuditLogPanel,
  CustomerWalletPanel,
  LedgerEntriesPanel,
  OverviewFiltersBar,
  buildDailyChart,
  formatAllowedServices,
  PLATFORM_TZ_MINUTES,
  SCOPE_AGENT,
} from '@meta-platform/ui'
import { AdminOnlyNote } from '../components/AdminOnlyNote'
import { AgentManageDialog, type AgentManageMode } from '../components/AgentManageDialog'
import { CreateBranchDialog } from '../components/CreateBranchDialog'
import { DetailTabs, type DetailTab } from '../components/DetailTabs'
import { ProposeOwnerDialog } from '../components/ProposeOwnerDialog'
import { useBranchRankings } from '../hooks/use-branch-rankings'
import { usePlatformWrite } from '../hooks/use-platform-write'
import type { AgentListRow } from '../lib/agent-list'

const TABS: DetailTab[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'branches', label: 'Chi nhánh' },
  { id: 'profile', label: 'Hồ sơ & cấu hình' },
  { id: 'sales', label: 'Thuế & thanh toán' },
  { id: 'wallets', label: 'Ví khách' },
  { id: 'transactions', label: 'Giao dịch' },
  { id: 'audit', label: 'Nhật ký' },
]

export function AgentDetailPage() {
  const { agentId: raw } = useParams()
  const agentId = Number(raw)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'overview'
  const setTab = (id: string) => setSearchParams({ tab: id })
  const validId = Number.isFinite(agentId) && agentId > 0 ? agentId : null
  const agent = useAgent(validId)
  const branches = useAgentBranches(validId)
  const { adminOnlyHint } = usePlatformWrite()

  const branchList = useMemo(
    () =>
      (branches.data?.rows ?? []).map((b) => ({
        branchId: b.record.branchId,
        name: b.record.profile.name,
        domain: b.record.domain,
      })),
    [branches.data],
  )
  const branchesLoadError =
    branches.isError && branches.error ? branches.error.message : (branches.data?.searchError ?? null)
  const branchesSearchWarning = branches.data?.searchWarning ?? null

  if (!validId) return <EmptyState title="Agent không hợp lệ" />
  if (agent.isLoading) return <PageLoader message="Đang tải agent…" />
  if (agent.isError || !agent.data) {
    return <EmptyState title="Không tải được agent" description={agent.error?.message} />
  }

  const { agent: view, profile } = agent.data
  const listRow: AgentListRow = {
    id: view.id,
    owner: view.owner,
    status: view.status,
    allowedServices: view.allowedServices,
    profileName: profile.profile.storeName,
    storePhone: profile.profile.storePhone,
    storeAddress: profile.profile.storeAddress,
    createdAt: view.createdAt,
  }

  return (
    <div className="space-y-4">
      <AdminOnlyNote hint={adminOnlyHint} />
      <header className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Agent #{view.id}</p>
            <h2 className="text-2xl font-semibold">{profile.profile.storeName || `Agent #${view.id}`}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge kind="agent" value={view.status} />
              <span>{formatAllowedServices(view.allowedServices)}</span>
            </div>
          </div>
          <Link to="/agents" className="text-sm text-primary hover:underline">
            ← Danh sách agent
          </Link>
        </div>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Ví chủ</dt>
            <dd>
              <Address value={view.owner} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ví chủ đang chờ</dt>
            <dd>{view.pendingOwner ? <Address value={view.pendingOwner} /> : '—'}</dd>
          </div>
        </dl>
      </header>

      <DetailTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && <AgentOverviewTab agentId={agentId} branches={branchList} />}
      {tab === 'branches' && (
        <AgentBranchesTab
          agentId={agentId}
          agentAllowedServices={view.allowedServices}
          rows={branchList}
          loading={branches.isLoading}
          error={branchesLoadError}
          warning={branchesSearchWarning}
          onRefetch={() => branches.refetch()}
        />
      )}
      {tab === 'profile' && <AgentProfileTab row={listRow} onRefetch={() => agent.refetch()} />}
      {tab === 'sales' && <AgentSalesSettingsReadonly agentId={agentId} branches={branchList} />}
      {tab === 'wallets' && <CustomerWalletPanel agentId={agentId} branches={branchList} />}
      {tab === 'transactions' && <LedgerEntriesPanel agentId={agentId} branches={branchList} />}
      {tab === 'audit' && <AuditLogPanel locked={{ agentId }} hideAgent />}
    </div>
  )
}

function AgentOverviewTab({
  agentId,
  branches,
}: {
  agentId: number
  branches: { branchId: number; name: string }[]
}) {
  const contracts = useContracts()
  const [range, setRange] = useState<RangePickerValue>('7d')
  const [serviceUi, setServiceUi] = useState<ServiceFilterValue>('ALL')
  const service: ServiceFilter = serviceUi
  const { fromDay, toDay } = useMemo(() => resolveRangeDays(range, PLATFORM_TZ_MINUTES as number), [range])
  const rollup = useRollup({ ledger: contracts?.ledger ?? null, scope: SCOPE_AGENT, id: agentId, fromDay, toDay })
  const rankings = useBranchRankings(branches, fromDay, toDay, service)
  const sum = useMemo(() => sumDays(rollup.data ?? []), [rollup.data])
  const rev = revenue(sum, service)
  const chart = useMemo(
    () => buildDailyChart(rollup.data ?? [], fromDay, toDay, PLATFORM_TZ_MINUTES, service),
    [rollup.data, fromDay, toDay, service],
  )
  const liability = useQuery({
    queryKey: ['wallet-liability', agentId],
    enabled: !!contracts,
    queryFn: () => contracts!.ledger.walletLiability(agentId),
  })

  return (
    <div className="space-y-4">
      <OverviewFiltersBar
        range={range}
        onRangeChange={setRange}
        service={serviceUi}
        onServiceChange={setServiceUi}
      />
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
              <CardTitle>Biểu đồ agent</CardTitle>
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
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">Chi nhánh</th>
                    <th className="py-2 text-right">Thuần</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.data?.map((row) => (
                    <tr key={row.branchId} className="border-t border-border">
                      <td className="py-2">
                        <Link to={`/branches/${row.branchId}`} className="text-primary hover:underline">
                          {row.name || `#${row.branchId}`}
                        </Link>
                      </td>
                      <td className="py-2 text-right">
                        <Money value={row.net} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function AgentBranchesTab({
  agentId,
  agentAllowedServices,
  rows,
  loading,
  error,
  warning,
  onRefetch,
}: {
  agentId: number
  agentAllowedServices: number
  rows: { branchId: number; name: string; domain: string }[]
  loading: boolean
  error?: string | null
  warning?: string | null
  onRefetch: () => void
}) {
  const columns = [
    { key: 'id', header: 'ID', render: (r: (typeof rows)[0]) => r.branchId },
    {
      key: 'name',
      header: 'Tên',
      render: (r: (typeof rows)[0]) => (
        <Link to={`/branches/${r.branchId}`} className="text-primary hover:underline">
          {r.name || `Chi nhánh #${r.branchId}`}
        </Link>
      ),
    },
    { key: 'domain', header: 'Domain', render: (r: (typeof rows)[0]) => r.domain },
  ]
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Chi nhánh</CardTitle>
        <CreateBranchDialog agentId={agentId} agentAllowedServices={agentAllowedServices} onCreated={onRefetch} />
      </CardHeader>
      <CardContent className="space-y-2">
        {warning ? (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
            {warning}
          </p>
        ) : null}
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={onRefetch}
          emptyTitle="Chưa có chi nhánh"
          page={1}
          pageSize={100}
          total={rows.length}
          onPageChange={() => {}}
        />
      </CardContent>
    </Card>
  )
}

function AgentProfileTab({ row, onRefetch }: { row: AgentListRow; onRefetch: () => void }) {
  const { canWrite, adminOnlyHint } = usePlatformWrite()
  const [manage, setManage] = useState<{ mode: AgentManageMode } | null>(null)
  const [propose, setPropose] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hồ sơ & cấu hình</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Dialog quản lý agent tái sử dụng từ commit <code>867643e</code> (`AgentManageDialog`).
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canWrite}
            title={adminOnlyHint ?? undefined}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => setManage({ mode: 'edit' })}
          >
            Sửa hồ sơ / dịch vụ
          </button>
          <button type="button" disabled={!canWrite} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50" onClick={() => setPropose(true)}>
            Đề xuất ví chủ mới
          </button>
          {row.status === 1 ? (
            <button type="button" disabled={!canWrite} className="rounded-md border px-3 py-1.5 text-sm" onClick={() => setManage({ mode: 'suspend' })}>
              Tạm dừng
            </button>
          ) : null}
          {row.status === 2 ? (
            <button type="button" disabled={!canWrite} className="rounded-md border px-3 py-1.5 text-sm" onClick={() => setManage({ mode: 'resume' })}>
              Mở lại
            </button>
          ) : null}
          {row.status !== 3 ? (
            <button type="button" disabled={!canWrite} className="rounded-md border px-3 py-1.5 text-sm text-destructive" onClick={() => setManage({ mode: 'delete' })}>
              Xoá agent
            </button>
          ) : null}
        </div>
      </CardContent>
      {manage ? (
        <AgentManageDialog row={row} mode={manage.mode} open onOpenChange={() => setManage(null)} onDone={onRefetch} />
      ) : null}
      {propose ? <ProposeOwnerDialog agentId={row.id} open onOpenChange={setPropose} onDone={onRefetch} /> : null}
    </Card>
  )
}
