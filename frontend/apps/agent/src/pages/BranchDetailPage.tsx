import { useAgent, useBranch, useContracts, useMembers } from '@meta-platform/chain'
import type { AgentAccess } from '@meta-platform/chain'
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
  BranchOverviewPanel,
  BranchSalesSettingsReadonly,
  AuditLogPanel,
  LedgerEntriesPanel,
} from '@meta-platform/ui'
import { useQuery } from '@tanstack/react-query'
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { CopyManagerLinkButton } from '../components/CopyManagerLinkButton'
import { DetailTabs, type DetailTab } from '../components/DetailTabs'
import { withDomain } from '../lib/read-domain'

const TABS: DetailTab[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'info', label: 'Thông tin' },
  { id: 'members', label: 'Thành viên' },
  { id: 'sales', label: 'Thuế & thanh toán' },
  { id: 'transactions', label: 'Giao dịch' },
  { id: 'audit', label: 'Nhật ký' },
]

type Ctx = { access: AgentAccess; domain?: string }

export function BranchDetailPage() {
  const { access, domain } = useOutletContext<Ctx>()
  const { branchId: raw } = useParams()
  const branchId = Number(raw)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'overview'
  const setTab = (id: string) => setSearchParams({ tab: id })

  if (access.kind !== 'owner') {
    return <EmptyState title="Chỉ chủ agent" description="Chi tiết chi nhánh chỉ dành cho ví chủ." />
  }
  if (!Number.isFinite(branchId) || branchId <= 0) {
    return <EmptyState title="Chi nhánh không hợp lệ" />
  }

  const branch = useBranch(branchId)
  const agent = useAgent(branch.data?.agentId ?? null)
  const contracts = useContracts()
  const profileQ = useQuery({
    queryKey: ['branch-profile', branchId],
    enabled: !!contracts && branchId > 0,
    queryFn: () => contracts!.branches.getBranchProfile(branchId),
  })

  if (branch.isLoading || profileQ.isLoading) return <PageLoader message="Đang tải chi nhánh…" />
  if (!branch.data || !profileQ.data) {
    return <EmptyState title="Không tải được chi nhánh" description={branch.error?.message} />
  }
  if (branch.data.agentId !== access.agentId) {
    return <EmptyState title="Chi nhánh khác agent" description="Chi nhánh này không thuộc cửa hàng của bạn." />
  }

  const view = branch.data
  const profileRec = profileQ.data
  const profile = profileRec.profile

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap justify-between gap-2">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Chi nhánh #{view.id}</p>
            <h2 className="text-2xl font-semibold">{profile.name || `Chi nhánh #${view.id}`}</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <StatusBadge kind="branch" value={view.status} />
              {view.isMain ? (
                <span className="rounded-full bg-primary/10 px-2 text-xs text-primary">Chính</span>
              ) : null}
              <span className="text-muted-foreground font-mono text-xs">{profileRec.domain}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link to={withDomain('/branches', domain)} className="text-sm text-primary hover:underline">
              ← Danh sách
            </Link>
            <CopyManagerLinkButton domain={profileRec.domain} />
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {agent.data?.profile.profile.storeName ?? `Agent #${view.agentId}`} · UTC{view.tzOffsetMinutes >= 0 ? '+' : ''}
          {view.tzOffsetMinutes / 60}
        </p>
      </header>

      <DetailTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && <BranchOverviewPanel branchId={branchId} tzMinutes={view.tzOffsetMinutes} />}
      {tab === 'info' && (
        <BranchInfoReadonly domain={profileRec.domain} profile={profile} branchId={view.id} agentId={view.agentId} />
      )}
      {tab === 'members' && <BranchMembersReadonly branchId={branchId} />}
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

function BranchInfoReadonly({
  domain,
  profile,
  branchId,
  agentId,
}: {
  domain: string
  profile: { name: string; location: string; phone: string; note: string }
  branchId: number
  agentId: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin chi nhánh (chỉ đọc)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Admin nền tảng quản lý hồ sơ chi nhánh. Chủ agent chỉ xem.</p>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Agent</dt>
            <dd>#{agentId}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Chi nhánh</dt>
            <dd>#{branchId}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Domain</dt>
            <dd className="font-mono">{domain}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Địa chỉ</dt>
            <dd>{profile.location || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Điện thoại</dt>
            <dd>{profile.phone || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase text-muted-foreground">Ghi chú</dt>
            <dd>{profile.note || '—'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

function BranchMembersReadonly({ branchId }: { branchId: number }) {
  const members = useMembers(branchId, 0)
  const columns = [
    {
      key: 'account',
      header: 'Ví',
      render: (r: { account: string }) => <Address value={r.account} />,
    },
    { key: 'role', header: 'Vai trò', render: (r: { role: number }) => String(r.role) },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thành viên</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          rows={members.data ?? []}
          loading={members.isLoading}
          error={members.error?.message}
          onRetry={() => members.refetch()}
          emptyTitle="Chưa có thành viên"
          page={0}
          pageSize={50}
          total={members.data?.length ?? 0}
          onPageChange={() => {}}
        />
      </CardContent>
    </Card>
  )
}