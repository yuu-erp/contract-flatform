import { useAgent, useBranch, useContracts, useMembers } from '@meta-platform/chain'
import {
  Address,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  PageLoader,
  StatusBadge,
} from '@meta-platform/ui'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  AuditLogPanel,
  BranchOverviewPanel,
  BranchSalesSettingsReadonly,
  LedgerEntriesPanel,
} from '@meta-platform/ui'
import { AdminOnlyNote } from '../components/AdminOnlyNote'
import { BranchManageDialog, type BranchManageMode } from '../components/BranchManageDialog'
import { DetailTabs, type DetailTab } from '../components/DetailTabs'
import { usePlatformWrite } from '../hooks/use-platform-write'
import type { BranchFormProfile } from '../lib/validate-create-branch'

const TABS: DetailTab[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'info', label: 'Thông tin' },
  { id: 'members', label: 'Thành viên' },
  { id: 'sales', label: 'Thuế & thanh toán' },
  { id: 'transactions', label: 'Giao dịch' },
  { id: 'audit', label: 'Nhật ký' },
]

export function BranchDetailPage() {
  const { branchId: raw } = useParams()
  const branchId = Number(raw)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'overview'
  const setTab = (id: string) => setSearchParams({ tab: id })
  const branch = useBranch(Number.isFinite(branchId) ? branchId : null)
  const agentForBranch = useAgent(branch.data?.agentId ?? null)
  const contracts = useContracts()
  const profileQ = useQuery({
    queryKey: ['branch-profile', branchId],
    enabled: !!contracts && Number.isFinite(branchId),
    queryFn: () => contracts!.branches.getBranchProfile(branchId!),
  })
  const agent = useAgent(branch.data?.agentId ?? null)
  const { adminOnlyHint } = usePlatformWrite()

  if (!Number.isFinite(branchId) || branchId <= 0) return <EmptyState title="Chi nhánh không hợp lệ" />
  if (branch.isLoading || profileQ.isLoading) return <PageLoader message="Đang tải chi nhánh…" />
  if (!branch.data || !profileQ.data) return <EmptyState title="Không tải được chi nhánh" />

  const view = branch.data
  const profileRec = profileQ.data
  const profile: BranchFormProfile = profileRec.profile
  const domain = profileRec.domain

  return (
    <div className="space-y-4">
      <AdminOnlyNote hint={adminOnlyHint} />
      <header className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap justify-between gap-2">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Chi nhánh #{view.id}</p>
            <h2 className="text-2xl font-semibold">{profile.name || `Chi nhánh #${view.id}`}</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <StatusBadge kind="branch" value={view.status} />
              {view.isMain ? <span className="rounded-full bg-primary/10 px-2 text-xs text-primary">Chính</span> : null}
              <span className="text-muted-foreground">Domain: {domain}</span>
            </div>
          </div>
          <Link to={`/agents/${view.agentId}?tab=branches`} className="text-sm text-primary hover:underline">
            ← Agent #{view.agentId}
          </Link>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Agent: {agent.data?.profile?.profile.storeName ?? `#${view.agentId}`} · Múi giờ UTC{view.tzOffsetMinutes >= 0 ? '+' : ''}
          {view.tzOffsetMinutes / 60}
        </p>
      </header>
      <DetailTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'overview' && <BranchOverviewPanel branchId={branchId} tzMinutes={view.tzOffsetMinutes} />}
      {tab === 'info' && (
        <BranchInfoTab
          branch={view}
          domain={domain}
          profile={profile}
          agentAllowedServices={agentForBranch.data?.agent.allowedServices ?? 0}
          onRefetch={() => {
            branch.refetch()
            profileQ.refetch()
          }}
        />
      )}
      {tab === 'members' && <BranchMembersTab branchId={branchId} />}
      {tab === 'sales' && (
        <BranchSalesSettingsReadonly agentId={view.agentId} branchId={branchId} branchName={profile.name} />
      )}
      {tab === 'transactions' && <LedgerEntriesPanel agentId={view.agentId} lockedBranchId={branchId} />}
      {tab === 'audit' && (
        <AuditLogPanel locked={{ agentId: view.agentId, branchId }} hideAgent hideBranch />
      )}
    </div>
  )
}

function BranchInfoTab({
  branch,
  domain,
  profile,
  agentAllowedServices,
  onRefetch,
}: {
  branch: NonNullable<ReturnType<typeof useBranch>['data']>
  domain: string
  profile: BranchFormProfile
  agentAllowedServices: number
  onRefetch: () => void
}) {
  const { canWrite, adminOnlyHint } = usePlatformWrite()
  const [manage, setManage] = useState<{ mode: BranchManageMode } | null>(null)
  const actions: { label: string; mode: BranchManageMode }[] = [
    { label: 'Sửa hồ sơ / dịch vụ', mode: 'edit' },
    { label: 'Đổi domain', mode: 'domain' },
    { label: 'Đổi múi giờ', mode: 'timezone' },
    { label: 'Đặt chi nhánh chính', mode: 'main' },
  ]
  if (branch.status === 1) actions.push({ label: 'Tạm dừng', mode: 'suspend' })
  if (branch.status === 2) actions.push({ label: 'Mở lại', mode: 'resume' })
  if (branch.status !== 3) actions.push({ label: 'Xoá', mode: 'delete' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin chi nhánh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          {profile.location} · {profile.phone}
        </p>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a.mode}
              type="button"
              disabled={!canWrite}
              title={adminOnlyHint ?? undefined}
              className="rounded-md border px-3 py-1.5 disabled:opacity-50"
              onClick={() => setManage({ mode: a.mode })}
            >
              {a.label}
            </button>
          ))}
        </div>
      </CardContent>
      {manage ? (
        <BranchManageDialog
          branch={branch}
          domain={domain}
          profile={profile}
          agentAllowedServices={agentAllowedServices}
          mode={manage.mode}
          open
          onOpenChange={() => setManage(null)}
          onDone={onRefetch}
        />
      ) : null}
    </Card>
  )
}

function BranchMembersTab({ branchId }: { branchId: number }) {
  const [page, setPage] = useState(0)
  const members = useMembers(branchId, page)
  const columns = [
    { key: 'account', header: 'Ví', render: (r: NonNullable<typeof members.data>[0]) => <Address value={r.account} /> },
    { key: 'role', header: 'Vai trò', render: (r: NonNullable<typeof members.data>[0]) => <StatusBadge kind="role" value={r.role} /> },
  ]
  return (
    <DataTable
      columns={columns}
      rows={members.data ?? []}
      loading={members.isLoading}
      page={page}
      pageSize={20}
      total={members.data?.length ?? 0}
      onPageChange={setPage}
      emptyTitle="Chưa có thành viên"
    />
  )
}

