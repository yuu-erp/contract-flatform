import { formatWalletAddress, useAgent, useBranch, useContracts, useMembers } from '@meta-platform/chain'
import {
  DataTable,
  EmptyState,
  HashAvatar,
  PageLoader,
  Panel,
  RowMenu,
  StatusBadge,
  UnderlineTabs,
  hashCover,
  type RowMenuItem,
} from '@meta-platform/ui'
import { Clock, Globe, MapPin, Pause, Phone, Play, Star, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  AuditLogPanel,
  BranchOverviewPanel,
  BranchSalesSettingsReadonly,
  LedgerEntriesPanel,
} from '@meta-platform/ui'
import { BackLink } from '../components/BackLink'
import { BranchManageDialog, type BranchManageMode } from '../components/BranchManageDialog'
import { usePlatformWrite } from '../hooks/use-platform-write'
import type { BranchFormProfile } from '../lib/validate-create-branch'

const TABS = [
  { value: 'overview', label: 'Tổng quan' },
  { value: 'members', label: 'Thành viên' },
  { value: 'sales', label: 'Thuế & thanh toán' },
  { value: 'transactions', label: 'Giao dịch' },
  { value: 'audit', label: 'Nhật ký' },
] as const
type TabId = (typeof TABS)[number]['value']

export function BranchDetailPage() {
  const { branchId: raw } = useParams()
  const branchId = Number(raw)
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab') ?? 'overview'
  const tab: TabId = TABS.some((t) => t.value === rawTab) ? (rawTab as TabId) : 'overview'
  const setTab = (id: TabId) => setSearchParams({ tab: id })
  const branch = useBranch(Number.isFinite(branchId) ? branchId : null)
  const contracts = useContracts()
  const profileQ = useQuery({
    queryKey: ['branch-profile', branchId],
    enabled: !!contracts && Number.isFinite(branchId),
    queryFn: () => contracts!.branches.getBranchProfile(branchId!),
  })
  const agent = useAgent(branch.data?.agentId ?? null)
  const { canWrite, tenantWriteBlockedReason } = usePlatformWrite()
  const [manage, setManage] = useState<BranchManageMode | null>(null)

  if (!Number.isFinite(branchId) || branchId <= 0) return <EmptyState title="Chi nhánh không hợp lệ" />
  if (branch.isLoading || profileQ.isLoading) return <PageLoader message="Đang tải chi nhánh…" />
  if (!branch.data || !profileQ.data) {
    return <EmptyState title="Không tải được chi nhánh" />
  }

  const view = branch.data
  const profileRec = profileQ.data
  const profile: BranchFormProfile = profileRec.profile
  const domain = profileRec.domain
  const name = profile.name || `Chi nhánh #${view.id}`
  const agentName = agent.data?.profile?.profile.storeName || `Agent #${view.agentId}`
  const tz = `UTC${view.tzOffsetMinutes >= 0 ? '+' : ''}${view.tzOffsetMinutes / 60}`

  const menu: RowMenuItem[] = canWrite
    ? [
        { label: 'Đổi domain', icon: Globe, onSelect: () => setManage('domain') },
        { label: 'Đổi múi giờ', icon: Clock, onSelect: () => setManage('timezone') },
        ...(!view.isMain ? [{ label: 'Đặt làm chi nhánh chính', icon: Star, onSelect: () => setManage('main') }] : []),
        ...(view.status === 1 ? [{ label: 'Tạm dừng chi nhánh', icon: Pause, onSelect: () => setManage('suspend') }] : []),
        ...(view.status === 2 ? [{ label: 'Mở lại chi nhánh', icon: Play, onSelect: () => setManage('resume') }] : []),
        ...(view.status !== 3
          ? [{ label: 'Xoá chi nhánh', icon: Trash2, danger: true, onSelect: () => setManage('delete') }]
          : []),
      ]
    : []

  return (
    <>
      <BackLink to={`/agents/${view.agentId}?tab=branches`} label={agentName} />
      <Panel flush className="mb-4">
        <div className="h-24" style={{ background: hashCover(`branch-${view.id}`) }} />
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-1">
          <div className="flex min-w-0 items-end gap-4">
            <div className="-mt-10 shrink-0 rounded-full border-4 border-card bg-card">
              <HashAvatar seed={`branch-${view.id}`} label={name} size={80} />
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="flex flex-wrap items-center gap-2 text-[26px] leading-8 font-extrabold tracking-tight">
                {name}
                <StatusBadge kind="branch" value={view.status} />
                {view.isMain ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">Chi nhánh chính</span>
                ) : null}
              </h1>
              <p className="text-[15px] text-muted-foreground">
                Chi nhánh #{view.id} · {domain}
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
          <span>
            Thuộc{' '}
            <Link to={`/agents/${view.agentId}`} className="font-bold text-foreground hover:underline">
              {agentName}
            </Link>
          </span>
          {profile.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-[18px]" /> {profile.location}
            </span>
          ) : null}
          {profile.phone ? (
            <span className="inline-flex items-center gap-1">
              <Phone className="size-[18px]" /> {profile.phone}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="size-[18px]" /> {tz}
          </span>
        </div>
        {profile.note ? <p className="mt-2 px-5 text-[15px]">{profile.note}</p> : null}
        <div className="mt-3 border-t border-border">
          <UnderlineTabs className="max-w-[720px]" tabs={[...TABS]} value={tab} onChange={setTab} />
        </div>
      </Panel>

      {tab === 'overview' && <BranchOverviewPanel branchId={branchId} tzMinutes={view.tzOffsetMinutes} />}
      {tab === 'members' && <BranchMembersTab branchId={branchId} />}
      {tab === 'sales' && (
        <BranchSalesSettingsReadonly agentId={view.agentId} branchId={branchId} branchName={profile.name} />
      )}
      {tab === 'transactions' && <LedgerEntriesPanel agentId={view.agentId} lockedBranchId={branchId} />}
      {tab === 'audit' && <AuditLogPanel locked={{ agentId: view.agentId, branchId }} hideAgent hideBranch />}

      {manage ? (
        <BranchManageDialog
          branch={view}
          domain={domain}
          profile={profile}
          agentAllowedServices={agent.data?.agent.allowedServices ?? 0}
          mode={manage}
          open
          onOpenChange={() => setManage(null)}
          onDone={() => {
            branch.refetch()
            profileQ.refetch()
          }}
        />
      ) : null}
    </>
  )
}

const ROLE_LABEL: Record<number, string> = { 1: 'Nhân viên', 2: 'Quản lý', 3: 'Chủ agent' }

function BranchMembersTab({ branchId }: { branchId: number }) {
  const [page, setPage] = useState(0)
  const members = useMembers(branchId, page)
  const rows = members.data ?? []
  return (
    <Panel flush title="Thành viên" description="Chủ agent cấp Quản lý / Nhân viên trong app agent">
      <DataTable
        bare
        columns={[
          {
            key: 'account',
            header: 'Ví',
            render: (r: (typeof rows)[0]) => (
              <span className="flex items-center gap-3">
                <HashAvatar seed={r.account} size={36} />
                <span className="min-w-0">
                  <span className="block font-bold">{formatWalletAddress(r.account)}</span>
                  <span className="block truncate font-mono text-[13px] text-muted-foreground">{r.account}</span>
                </span>
              </span>
            ),
          },
          {
            key: 'role',
            header: 'Vai trò',
            className: 'text-right',
            render: (r: (typeof rows)[0]) => (
              <span className="rounded-full border border-input px-3 py-1 text-[13px] font-bold">
                {ROLE_LABEL[r.role] ?? `Vai trò ${r.role}`}
              </span>
            ),
          },
        ]}
        rows={rows}
        loading={members.isLoading}
        page={page}
        pageSize={20}
        total={rows.length < 20 ? page * 20 + rows.length : (page + 2) * 20}
        onPageChange={setPage}
        emptyTitle="Chưa có thành viên"
      />
    </Panel>
  )
}
