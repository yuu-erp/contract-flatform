import {
  formatWalletAddress,
  revenue,
  sumDays,
  useAgent,
  useAgentBranches,
  useContracts,
  useRollup,
  type ServiceFilter,
} from '@meta-platform/chain'
import {
  DataTable,
  EmptyState,
  HashAvatar,
  KpiTile,
  Money,
  PageLoader,
  Panel,
  RevenueChart,
  RowMenu,
  StatusBadge,
  UnderlineTabs,
  hashCover,
  resolveRangeDays,
  type RangePickerValue,
  type RowMenuItem,
  type ServiceFilterValue,
} from '@meta-platform/ui'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock, MapPin, Pause, Phone, Play, Store, Trash2, UserRoundCog } from 'lucide-react'
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
import { BackLink } from '../components/BackLink'
import { AgentManageDialog, type AgentManageMode } from '../components/AgentManageDialog'
import { CreateBranchDialog } from '../components/CreateBranchDialog'
import { ProposeOwnerDialog } from '../components/ProposeOwnerDialog'
import { useBranchRankings } from '../hooks/use-branch-rankings'
import { usePlatformWrite } from '../hooks/use-platform-write'
import type { AgentListRow } from '../lib/agent-list'

const TABS = [
  { value: 'overview', label: 'Tổng quan' },
  { value: 'branches', label: 'Chi nhánh' },
  { value: 'sales', label: 'Thuế & thanh toán' },
  { value: 'wallets', label: 'Ví khách' },
  { value: 'transactions', label: 'Giao dịch' },
  { value: 'audit', label: 'Nhật ký' },
] as const
type TabId = (typeof TABS)[number]['value']

export function AgentDetailPage() {
  const { agentId: raw } = useParams()
  const agentId = Number(raw)
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab') ?? 'overview'
  const tab: TabId = TABS.some((t) => t.value === rawTab) ? (rawTab as TabId) : 'overview'
  const setTab = (id: TabId) => setSearchParams({ tab: id })
  const validId = Number.isFinite(agentId) && agentId > 0 ? agentId : null
  const agent = useAgent(validId)
  const branches = useAgentBranches(validId)
  const { canWrite, tenantWriteBlockedReason } = usePlatformWrite()
  const [manage, setManage] = useState<AgentManageMode | null>(null)
  const [propose, setPropose] = useState(false)

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
  const name = profile.profile.storeName || `Agent #${view.id}`
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
  const hasPending = Boolean(view.pendingOwner && !/^0x0+$/i.test(view.pendingOwner))

  const menu: RowMenuItem[] = canWrite
    ? [
        { label: 'Đề xuất ví chủ mới', icon: UserRoundCog, onSelect: () => setPropose(true) },
        ...(view.status === 1 ? [{ label: 'Tạm dừng agent', icon: Pause, onSelect: () => setManage('suspend') }] : []),
        ...(view.status === 2 ? [{ label: 'Mở lại agent', icon: Play, onSelect: () => setManage('resume') }] : []),
        ...(view.status !== 3
          ? [{ label: 'Xoá agent', icon: Trash2, danger: true, onSelect: () => setManage('delete') }]
          : []),
      ]
    : []

  return (
    <>
      <BackLink to="/agents" label="Danh sách agent" />
      <Panel flush className="mb-4">
        <div className="h-28" style={{ background: hashCover(view.owner) }} />
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-1">
          <div className="flex min-w-0 items-end gap-4">
            <div className="-mt-12 shrink-0 rounded-full border-4 border-card bg-card">
              <HashAvatar seed={view.owner} label={name} size={96} />
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="flex flex-wrap items-center gap-2 text-[26px] leading-8 font-extrabold tracking-tight">
                {name}
                <StatusBadge kind="agent" value={view.status} />
              </h1>
              <p className="text-[15px] text-muted-foreground">
                Agent #{view.id} · ví chủ <span className="font-mono">{formatWalletAddress(view.owner)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <RowMenu items={menu} label="Thêm hành động" />
            <button
              type="button"
              disabled={!canWrite}
              title={tenantWriteBlockedReason ?? undefined}
              onClick={() => setManage('edit')}
              className="h-9 rounded-full border border-input px-4 text-[15px] font-bold transition-colors hover:bg-hover disabled:opacity-50"
            >
              Sửa hồ sơ
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 px-5 text-[15px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Store className="size-[18px]" /> {formatAllowedServices(view.allowedServices)}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-bold text-foreground">{branches.isLoading ? '…' : branchList.length}</span> chi nhánh
          </span>
          {profile.profile.storeAddress ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-[18px]" /> {profile.profile.storeAddress}
            </span>
          ) : null}
          {profile.profile.storePhone ? (
            <span className="inline-flex items-center gap-1">
              <Phone className="size-[18px]" /> {profile.profile.storePhone}
            </span>
          ) : null}
          {view.createdAt ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-[18px]" /> Tạo{' '}
              {new Date(view.createdAt * 1000).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            </span>
          ) : null}
          {hasPending ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-[18px]" /> Chờ ví mới nhận quyền chủ:{' '}
              <span className="font-mono text-foreground">{formatWalletAddress(view.pendingOwner)}</span>
            </span>
          ) : null}
        </div>
        {profile.profile.note ? <p className="mt-2 px-5 text-[15px]">{profile.profile.note}</p> : null}
        <div className="mt-3 border-t border-border">
          <UnderlineTabs className="max-w-[860px]" tabs={[...TABS]} value={tab} onChange={setTab} />
        </div>
      </Panel>

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
      {tab === 'sales' && <AgentSalesSettingsReadonly agentId={agentId} branches={branchList} />}
      {tab === 'wallets' && <CustomerWalletPanel agentId={agentId} branches={branchList} />}
      {tab === 'transactions' && <LedgerEntriesPanel agentId={agentId} branches={branchList} />}
      {tab === 'audit' && <AuditLogPanel locked={{ agentId }} hideAgent />}

      {manage ? (
        <AgentManageDialog
          row={listRow}
          mode={manage}
          open
          onOpenChange={() => setManage(null)}
          onDone={() => agent.refetch()}
        />
      ) : null}
      {propose ? (
        <ProposeOwnerDialog agentId={view.id} open onOpenChange={setPropose} onDone={() => agent.refetch()} />
      ) : null}
    </>
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
      <OverviewFiltersBar range={range} onRangeChange={setRange} service={serviceUi} onServiceChange={setServiceUi} />
      {rollup.isLoading ? (
        <PageLoader message="Đang tải số liệu…" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <KpiTile label="Doanh thu thuần" value={rev.net} />
            <KpiTile label="Gộp" value={rev.gross} />
            <KpiTile label="Dư nợ ví khách" value={liability.data ?? 0n} />
          </div>
          <div className="grid items-start gap-4 xl:grid-cols-3">
            <Panel title="Doanh thu theo ngày" className="xl:col-span-2">
              <RevenueChart data={chart} />
            </Panel>
            <Panel title="So sánh chi nhánh" description="Doanh thu thuần trong khoảng đã chọn">
              {(rankings.data ?? []).length === 0 ? (
                <p className="text-[15px] text-muted-foreground">Chưa có chi nhánh.</p>
              ) : (
                <ul className="space-y-3">
                  {rankings.data!.map((row) => {
                    const max = rankings.data!.reduce((m, r) => (r.net > m ? r.net : m), 0n)
                    const pct = max > 0n ? Number((row.net * 1000n) / max) / 10 : 0
                    return (
                      <li key={row.branchId}>
                        <Link to={`/branches/${row.branchId}`} className="group block">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[15px] font-bold group-hover:underline">
                              {row.name || `Chi nhánh #${row.branchId}`}
                            </span>
                            <span className="shrink-0 text-[13px] font-bold tabular-nums">
                              <Money value={row.net} />
                            </span>
                          </span>
                          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                            <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(pct, 2)}%` }} />
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          </div>
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
  return (
    <Panel
      flush
      title="Chi nhánh"
      description={`${rows.length} chi nhánh`}
      actions={<CreateBranchDialog agentId={agentId} agentAllowedServices={agentAllowedServices} onCreated={onRefetch} />}
    >
      {warning ? <p className="border-y border-border bg-warning/15 px-5 py-2.5 text-[15px]">{warning}</p> : null}
      <DataTable
        bare
        columns={[
          {
            key: 'name',
            header: 'Chi nhánh',
            render: (r: (typeof rows)[0]) => (
              <Link to={`/branches/${r.branchId}`} className="group flex items-center gap-3">
                <HashAvatar seed={`branch-${r.branchId}`} label={r.name || String(r.branchId)} size={36} />
                <span className="font-bold group-hover:underline">{r.name || `Chi nhánh #${r.branchId}`}</span>
              </Link>
            ),
          },
          { key: 'domain', header: 'Domain', className: 'text-muted-foreground', render: (r: (typeof rows)[0]) => r.domain },
          { key: 'id', header: 'ID', className: 'text-right tabular-nums', render: (r: (typeof rows)[0]) => `#${r.branchId}` },
        ]}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={onRefetch}
        emptyTitle="Chưa có chi nhánh"
        page={0}
        pageSize={Math.max(rows.length, 1)}
        total={rows.length}
        onPageChange={() => {}}
      />
    </Panel>
  )
}
