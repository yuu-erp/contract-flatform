import { formatWalletAddress, useAgents } from '@meta-platform/chain'
import {
  ColumnHeader,
  EmptyState,
  ErrorState,
  HashAvatar,
  ListPager,
  ListRow,
  PageLoader,
  RowMenu,
  SearchPill,
  StatusBadge,
  UnderlineTabs,
  formatAllowedServices,
  type RowMenuItem,
} from '@meta-platform/ui'
import { Pause, Pencil, Play, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AgentManageDialog, type AgentManageMode } from '../components/AgentManageDialog'
import { useBranchCounts } from '../hooks/use-branch-counts'
import { usePlatformWrite } from '../hooks/use-platform-write'
import { filterAndSearchAgents, paginateAgents, type AgentListRow } from '../lib/agent-list'
import { AGENTS_PAGE_SIZE } from '../lib/scopes'
import { SERVICE_MASK } from '../lib/validate-create-agent'

type StatusTab = 'all' | '1' | '2' | '3'

const SERVICE_CHIPS: { label: string; mask: number | null }[] = [
  { label: 'Mọi dịch vụ', mask: null },
  { label: 'NET', mask: SERVICE_MASK.NET },
  { label: 'IQR', mask: SERVICE_MASK.IQR },
  { label: 'LOYALTY', mask: SERVICE_MASK.LOYALTY },
]

function formatDate(ts: number): string {
  return ts ? new Date(ts * 1000).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—'
}

export function AgentsPage() {
  const agents = useAgents()
  const { canWrite, tenantWriteBlockedReason } = usePlatformWrite()
  const [params, setParams] = useSearchParams()
  const [manage, setManage] = useState<{ row: AgentListRow; mode: AgentManageMode } | null>(null)
  const [q, setQ] = useState(params.get('q') ?? '')
  const [tab, setTab] = useState<StatusTab>('all')
  const [servicesMask, setServicesMask] = useState<number | null>(null)
  const [page, setPage] = useState(0)

  // Ô tìm ở cột phải đổi ?q= → đồng bộ vào ô tìm của trang.
  const urlQ = params.get('q') ?? ''
  useEffect(() => {
    setQ(urlQ)
    setPage(0)
  }, [urlQ])

  const all = agents.rows as AgentListRow[]
  const counts = useMemo(() => {
    const c = { all: all.length, '1': 0, '2': 0, '3': 0 } as Record<StatusTab, number>
    for (const a of all) {
      const k = String(a.status) as StatusTab
      if (k in c) c[k]++
    }
    return c
  }, [all])

  const filtered = useMemo(
    () => filterAndSearchAgents(all, { q, status: tab === 'all' ? null : Number(tab), servicesMask }),
    [all, q, tab, servicesMask],
  )
  const { items, total, totalPages } = useMemo(() => paginateAgents(filtered, page, AGENTS_PAGE_SIZE), [filtered, page])
  const branchCounts = useBranchCounts(items.map((i) => i.id))

  const menuFor = (row: AgentListRow): RowMenuItem[] => {
    if (!canWrite) return []
    const items: RowMenuItem[] = [{ label: 'Sửa hồ sơ', icon: Pencil, onSelect: () => setManage({ row, mode: 'edit' }) }]
    if (row.status === 1) items.push({ label: 'Tạm dừng agent', icon: Pause, onSelect: () => setManage({ row, mode: 'suspend' }) })
    if (row.status === 2) items.push({ label: 'Mở lại agent', icon: Play, onSelect: () => setManage({ row, mode: 'resume' }) })
    if (row.status !== 3) items.push({ label: 'Xoá agent', icon: Trash2, danger: true, onSelect: () => setManage({ row, mode: 'delete' }) })
    return items
  }

  return (
    <>
      <ColumnHeader title="Agent" subtitle={`${counts.all} agent on-chain`}>
        <UnderlineTabs
          tabs={[
            { value: 'all', label: 'Tất cả' },
            { value: '1', label: 'Hoạt động', count: counts['1'] },
            { value: '2', label: 'Tạm dừng', count: counts['2'] },
            { value: '3', label: 'Đã xoá', count: counts['3'] },
          ]}
          value={tab}
          onChange={(v) => {
            setTab(v)
            setPage(0)
          }}
        />
      </ColumnHeader>

      <div className="space-y-3 border-b border-border px-4 py-3">
        <SearchPill
          value={q}
          onChange={(v) => {
            setQ(v)
            setPage(0)
            if (!v && urlQ) setParams({}, { replace: true })
          }}
          placeholder="Tìm theo tên, SĐT, id, ví…"
        />
        <div className="flex flex-wrap gap-2">
          {SERVICE_CHIPS.map((chip) => {
            const active = servicesMask === chip.mask
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setServicesMask(chip.mask)
                  setPage(0)
                }}
                className={
                  active
                    ? 'h-8 rounded-full bg-foreground px-3.5 text-sm font-bold text-background'
                    : 'h-8 rounded-full border border-input px-3.5 text-sm font-bold hover:bg-hover'
                }
              >
                {chip.label}
              </button>
            )
          })}
        </div>
        {tenantWriteBlockedReason ? (
          <p className="text-[13px] text-muted-foreground">{tenantWriteBlockedReason} — chỉ xem.</p>
        ) : null}
      </div>

      {agents.isLoading ? (
        <PageLoader message="Đang tải agent…" />
      ) : agents.error ? (
        <ErrorState message={agents.error.message} onRetry={() => agents.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="Không có agent phù hợp" description="Thử bỏ bớt bộ lọc hoặc đổi từ khoá." />
      ) : (
        <>
          {items.map((row) => {
            const name = row.profileName || `Agent #${row.id}`
            const branches = branchCounts.data?.get(row.id)
            return (
              <ListRow
                key={row.id}
                to={`/agents/${row.id}`}
                avatar={<HashAvatar seed={row.owner} label={name} size={44} />}
                title={name}
                meta={`· #${row.id}`}
                subtitle={formatWalletAddress(row.owner)}
                right={<RowMenu items={menuFor(row)} label={`Hành động cho ${name}`} />}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                  <StatusBadge kind="agent" value={row.status} />
                  <span>{formatAllowedServices(row.allowedServices)}</span>
                  <span>
                    <span className="font-bold text-foreground">{branches ?? '…'}</span> chi nhánh
                  </span>
                  <span>Tạo {formatDate(row.createdAt ?? 0)}</span>
                </div>
              </ListRow>
            )
          })}
          <ListPager page={page} pageCount={totalPages} onPageChange={setPage} summary={`${total} agent`} />
        </>
      )}

      {manage ? (
        <AgentManageDialog
          row={manage.row}
          mode={manage.mode}
          open
          onOpenChange={(open) => {
            if (!open) setManage(null)
          }}
          onDone={() => agents.refetch()}
        />
      ) : null}
    </>
  )
}
