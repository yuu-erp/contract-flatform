import { formatWalletAddress, useAgent, useBranch, useContracts, useMembers } from '@meta-platform/chain'
import {
  ColumnHeader,
  EmptyState,
  HashAvatar,
  ListPager,
  ListRow,
  PageLoader,
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
    return (
      <>
        <ColumnHeader title="Chi nhánh" back />
        <EmptyState title="Không tải được chi nhánh" />
      </>
    )
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
      <ColumnHeader title={name} subtitle={`${agentName} · Chi nhánh #${view.id}`} back={`/agents/${view.agentId}?tab=branches`} />
      <div className="h-[120px]" style={{ background: hashCover(`branch-${view.id}`) }} />
      <div className="px-4 pt-3">
        <div className="flex items-start justify-between">
          <div className="-mt-[60px] rounded-full border-4 border-background bg-background">
            <HashAvatar seed={`branch-${view.id}`} label={name} size={96} />
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
        <h2 className="mt-3 flex flex-wrap items-center gap-2 text-xl leading-6 font-extrabold">
          {name}
          <StatusBadge kind="branch" value={view.status} />
          {view.isMain ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">Chi nhánh chính</span>
          ) : null}
        </h2>
        <p className="text-[0.9375rem] text-muted-foreground">{domain}</p>
        {profile.note ? <p className="mt-3 text-[0.9375rem]">{profile.note}</p> : null}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.9375rem] text-muted-foreground">
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
        <p className="mt-3 text-[0.9375rem]">
          Thuộc{' '}
          <Link to={`/agents/${view.agentId}`} className="font-bold hover:underline">
            {agentName}
          </Link>
        </p>
      </div>

      <div className="mt-3 border-b border-border">
        <UnderlineTabs tabs={[...TABS]} value={tab} onChange={setTab} />
      </div>

      {tab === 'overview' && (
        <div className="px-4 py-3">
          <BranchOverviewPanel branchId={branchId} tzMinutes={view.tzOffsetMinutes} />
        </div>
      )}
      {tab === 'members' && <BranchMembersTab branchId={branchId} />}
      {tab === 'sales' && (
        <div className="px-4 py-3">
          <BranchSalesSettingsReadonly agentId={view.agentId} branchId={branchId} branchName={profile.name} />
        </div>
      )}
      {tab === 'transactions' && (
        <div className="px-4 py-3">
          <LedgerEntriesPanel agentId={view.agentId} lockedBranchId={branchId} />
        </div>
      )}
      {tab === 'audit' && (
        <AuditLogPanel locked={{ agentId: view.agentId, branchId }} hideAgent hideBranch variant="list" />
      )}

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
  if (members.isLoading) return <PageLoader message="Đang tải thành viên…" />
  if (rows.length === 0 && page === 0) {
    return <EmptyState title="Chưa có thành viên" description="Chủ agent cấp Quản lý / Nhân viên trong app agent." />
  }
  return (
    <>
      {rows.map((r) => (
        <ListRow
          key={r.account}
          avatar={<HashAvatar seed={r.account} size={40} />}
          title={formatWalletAddress(r.account)}
          subtitle={<span className="font-mono text-[0.8125rem]">{r.account}</span>}
          right={
            <span className="mt-1 rounded-full border border-input px-3 py-1 text-[0.8125rem] font-bold">
              {ROLE_LABEL[r.role] ?? `Vai trò ${r.role}`}
            </span>
          }
        />
      ))}
      <ListPager page={page} pageCount={rows.length < 20 ? page + 1 : page + 2} onPageChange={setPage} />
    </>
  )
}
