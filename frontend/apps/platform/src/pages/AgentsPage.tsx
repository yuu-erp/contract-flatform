import { formatWalletAddress, useAgents } from '@meta-platform/chain'
import {
  DataTable,
  HashAvatar,
  PageHeader,
  Panel,
  RowMenu,
  SearchPill,
  StatusBadge,
  UnderlineTabs,
  formatAllowedServices,
  type RowMenuItem,
} from '@meta-platform/ui'
import { Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CreateAgentDialog } from '../components/CreateAgentDialog'
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
  const [createOpen, setCreateOpen] = useState(false)
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
  const { items, total } = useMemo(() => paginateAgents(filtered, page, AGENTS_PAGE_SIZE), [filtered, page])
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
      <PageHeader
        title="Agent"
        description={`${counts.all} agent on-chain · tìm kiếm phía client (tối đa ~1000 agent)`}
        actions={
          <button
            type="button"
            disabled={!canWrite}
            title={tenantWriteBlockedReason ?? undefined}
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="size-5" strokeWidth={2.6} /> Tạo agent
          </button>
        }
      />

      <Panel flush>
        <div className="border-b border-border">
          <UnderlineTabs
            className="max-w-[640px]"
            tabs={[
              { value: 'all', label: 'Tất cả', count: counts.all },
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
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
          <SearchPill
            value={q}
            onChange={(v) => {
              setQ(v)
              setPage(0)
              if (!v && urlQ) setParams({}, { replace: true })
            }}
            placeholder="Tìm theo tên, SĐT, id, ví…"
            className="h-10 w-full max-w-[360px]"
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
            <span className="ml-auto text-[13px] text-muted-foreground">{tenantWriteBlockedReason} — chỉ xem</span>
          ) : null}
        </div>
        <DataTable
          bare
          columns={[
            {
              key: 'agent',
              header: 'Agent',
              render: (row: AgentListRow) => {
                const name = row.profileName || `Agent #${row.id}`
                return (
                  <Link to={`/agents/${row.id}`} className="group flex items-center gap-3">
                    <HashAvatar seed={row.owner} label={name} size={40} />
                    <span className="min-w-0">
                      <span className="block truncate font-bold group-hover:underline">{name}</span>
                      <span className="block text-[13px] text-muted-foreground">
                        #{row.id}
                        {row.storePhone ? ` · ${row.storePhone}` : ''}
                      </span>
                    </span>
                  </Link>
                )
              },
            },
            {
              key: 'owner',
              header: 'Ví chủ',
              className: 'font-mono text-[13px] text-muted-foreground',
              render: (row: AgentListRow) => formatWalletAddress(row.owner),
            },
            {
              key: 'status',
              header: 'Trạng thái',
              render: (row: AgentListRow) => <StatusBadge kind="agent" value={row.status} />,
            },
            {
              key: 'services',
              header: 'Dịch vụ',
              render: (row: AgentListRow) => formatAllowedServices(row.allowedServices),
            },
            {
              key: 'branches',
              header: 'Chi nhánh',
              className: 'text-right tabular-nums',
              render: (row: AgentListRow) => branchCounts.data?.get(row.id) ?? '…',
            },
            {
              key: 'created',
              header: 'Ngày tạo',
              className: 'text-muted-foreground tabular-nums',
              render: (row: AgentListRow) => formatDate(row.createdAt ?? 0),
            },
            {
              key: 'actions',
              header: '',
              className: 'w-12 text-right',
              render: (row: AgentListRow) => (
                <RowMenu items={menuFor(row)} label={`Hành động cho ${row.profileName || row.id}`} />
              ),
            },
          ]}
          rows={items}
          page={page}
          pageSize={AGENTS_PAGE_SIZE}
          total={total}
          onPageChange={setPage}
          loading={agents.isLoading}
          error={agents.error ? agents.error.message : null}
          onRetry={() => agents.refetch()}
          emptyTitle="Không có agent phù hợp"
        />
      </Panel>

      <CreateAgentDialog
        showTrigger={false}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => agents.refetch()}
      />
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
