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
  ColumnHeader,
  ColumnSection,
  EmptyState,
  ErrorState,
  HashAvatar,
  KpiTile,
  ListRow,
  Money,
  PageLoader,
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
import { useParams, useSearchParams } from 'react-router-dom'
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
    return (
      <>
        <ColumnHeader title="Agent" back="/agents" />
        <EmptyState title="Không tải được agent" description={agent.error?.message} />
      </>
    )
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
      <ColumnHeader
        title={name}
        subtitle={`Agent #${view.id} · ${branches.isLoading ? '…' : branchList.length} chi nhánh`}
        back="/agents"
      />

      <div className="h-[150px]" style={{ background: hashCover(view.owner) }} />
      <div className="px-4 pt-3">
        <div className="flex items-start justify-between">
          <div className="-mt-[72px] rounded-full border-4 border-background bg-background">
            <HashAvatar seed={view.owner} label={name} size={112} />
          </div>
          <div className="flex items-center gap-2">
            <RowMenu items={menu} label="Thêm hành động" />
            <button
              type="button"
              disabled={!canWrite}
              title={tenantWriteBlockedReason ?? undefined}
              onClick={() => setManage('edit')}
              className="h-9 rounded-full border border-input px-4 text-[0.9375rem] font-bold transition-colors hover:bg-hover disabled:opacity-50"
            >
              Sửa hồ sơ
            </button>
          </div>
        </div>
        <div className="mt-3">
          <h2 className="flex items-center gap-2 text-xl leading-6 font-extrabold">
            {name}
            <StatusBadge kind="agent" value={view.status} />
          </h2>
          <p className="text-[0.9375rem] text-muted-foreground">{formatWalletAddress(view.owner)} · ví chủ</p>
        </div>
        {profile.profile.note ? <p className="mt-3 text-[0.9375rem]">{profile.profile.note}</p> : null}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.9375rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Store className="size-[18px]" /> {formatAllowedServices(view.allowedServices)}
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
        </div>
        {hasPending ? (
          <p className="mt-2 inline-flex items-center gap-1 text-[0.9375rem] text-muted-foreground">
            <Clock className="size-[18px]" /> Chờ ví mới nhận quyền chủ:{' '}
            <span className="font-bold text-foreground">{formatWalletAddress(view.pendingOwner)}</span>
          </p>
        ) : null}
        <div className="mt-3 flex gap-5 text-[0.9375rem]">
          <span>
            <span className="font-bold">{branches.isLoading ? '…' : branchList.length}</span>{' '}
            <span className="text-muted-foreground">Chi nhánh</span>
          </span>
          <span>
            <span className="font-bold">{view.status === 1 ? 'Đang bán' : view.status === 2 ? 'Tạm dừng' : 'Đã xoá'}</span>{' '}
            <span className="text-muted-foreground">Trạng thái</span>
          </span>
        </div>
      </div>

      <div className="mt-3 border-b border-border">
        <UnderlineTabs tabs={[...TABS]} value={tab} onChange={setTab} />
      </div>

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
      {tab === 'sales' && (
        <div className="px-4 py-3">
          <AgentSalesSettingsReadonly agentId={agentId} branches={branchList} />
        </div>
      )}
      {tab === 'wallets' && (
        <div className="px-4 py-3">
          <CustomerWalletPanel agentId={agentId} branches={branchList} />
        </div>
      )}
      {tab === 'transactions' && (
        <div className="px-4 py-3">
          <LedgerEntriesPanel agentId={agentId} branches={branchList} />
        </div>
      )}
      {tab === 'audit' && (
        <AuditLogPanel locked={{ agentId }} hideAgent variant="list" />
      )}

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
    <>
      <div className="border-b border-border px-4 py-3">
        <OverviewFiltersBar range={range} onRangeChange={setRange} service={serviceUi} onServiceChange={setServiceUi} />
      </div>
      {rollup.isLoading ? (
        <PageLoader message="Đang tải số liệu…" />
      ) : (
        <>
          <ColumnSection>
            <div className="grid grid-cols-2 gap-3">
              <KpiTile label="Doanh thu thuần" value={rev.net} className="col-span-2" />
              <KpiTile label="Gộp" value={rev.gross} />
              <KpiTile label="Dư nợ ví khách" value={liability.data ?? 0n} />
            </div>
          </ColumnSection>
          <ColumnSection title="Doanh thu theo ngày">
            <RevenueChart data={chart} />
          </ColumnSection>
          <ColumnSection flush title="So sánh chi nhánh">
            {(rankings.data ?? []).length === 0 ? (
              <p className="px-4 pb-3 text-[0.9375rem] text-muted-foreground">Chưa có chi nhánh.</p>
            ) : (
              rankings.data!.map((row) => (
                <ListRow
                  key={row.branchId}
                  to={`/branches/${row.branchId}`}
                  avatar={<HashAvatar seed={`branch-${row.branchId}`} label={row.name || String(row.branchId)} size={40} />}
                  title={row.name || `Chi nhánh #${row.branchId}`}
                  meta={`· #${row.branchId}`}
                  subtitle="Doanh thu thuần"
                  right={
                    <span className="pt-2.5 text-[0.9375rem] font-extrabold tabular-nums">
                      <Money value={row.net} />
                    </span>
                  }
                  className="last:border-b-0"
                />
              ))
            )}
          </ColumnSection>
        </>
      )}
    </>
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
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-[0.9375rem] text-muted-foreground">{rows.length} chi nhánh</p>
        <CreateBranchDialog agentId={agentId} agentAllowedServices={agentAllowedServices} onCreated={onRefetch} />
      </div>
      {warning ? (
        <p className="border-b border-border bg-warning/15 px-4 py-2.5 text-[0.9375rem]">{warning}</p>
      ) : null}
      {error ? (
        <ErrorState message={error} onRetry={onRefetch} />
      ) : loading ? (
        <PageLoader message="Đang tải chi nhánh…" />
      ) : rows.length === 0 ? (
        <EmptyState title="Chưa có chi nhánh" description="Tạo chi nhánh đầu tiên để agent bắt đầu bán." />
      ) : (
        rows.map((r) => (
          <ListRow
            key={r.branchId}
            to={`/branches/${r.branchId}`}
            avatar={<HashAvatar seed={`branch-${r.branchId}`} label={r.name || String(r.branchId)} size={40} />}
            title={r.name || `Chi nhánh #${r.branchId}`}
            meta={`· #${r.branchId}`}
            subtitle={r.domain}
          />
        ))
      )}
    </>
  )
}
