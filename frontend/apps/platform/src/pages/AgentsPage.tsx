import { useAgents } from '@meta-platform/chain'
import { Address, Card, CardContent, CardDescription, CardHeader, CardTitle, DataTable, Input, StatusBadge } from '@meta-platform/ui'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AgentManageDialog, type AgentManageMode } from '../components/AgentManageDialog'
import { CreateAgentDialog } from '../components/CreateAgentDialog'
import { usePlatformWrite } from '../hooks/use-platform-write'
import { useBranchCounts } from '../hooks/use-branch-counts'
import { AGENTS_PAGE_SIZE } from '../lib/scopes'
import { filterAndSearchAgents, paginateAgents, type AgentListRow } from '../lib/agent-list'
import { formatAllowedServices } from '@meta-platform/ui'
import { SERVICE_MASK } from '../lib/validate-create-agent'

export function AgentsPage() {
  const agents = useAgents()
  const { canWrite, paused, isOperator } = usePlatformWrite()
  const [manage, setManage] = useState<{ row: AgentListRow; mode: AgentManageMode } | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<number | null>(null)
  const [servicesMask, setServicesMask] = useState<number | null>(null)
  const [page, setPage] = useState(0)

  const filtered = useMemo(
    () =>
      filterAndSearchAgents(agents.rows as AgentListRow[], {
        q,
        status,
        servicesMask,
      }),
    [agents.rows, q, status, servicesMask],
  )

  const { items, total, totalPages } = useMemo(
    () => paginateAgents(filtered, page, AGENTS_PAGE_SIZE),
    [filtered, page],
  )

  const branchCounts = useBranchCounts(items.map((i) => i.id))

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        render: (row: AgentListRow) => row.id,
      },
      {
        key: 'name',
        header: 'Tên cửa hàng',
        render: (row: AgentListRow) => (
          <Link to={`/agents/${row.id}`} className="text-primary hover:underline">
            {row.profileName || `Agent #${row.id}`}
          </Link>
        ),
      },
      {
        key: 'owner',
        header: 'Ví chủ',
        render: (row: AgentListRow) => <Address value={row.owner} />,
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
        render: (row: AgentListRow) => branchCounts.data?.get(row.id) ?? '…',
      },
      {
        key: 'created',
        header: 'Ngày tạo',
        render: (row: AgentListRow) =>
          row.createdAt
            ? new Date(row.createdAt * 1000).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
            : '—',
      },
      {
        key: 'actions',
        header: '',
        render: (row: AgentListRow) => (
          <AgentRowActions row={row} canWrite={canWrite} onAction={(mode) => setManage({ row, mode })} />
        ),
      },
    ],
    [branchCounts.data, canWrite],
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Danh sách agent</CardTitle>
            <CardDescription>Tìm, lọc và tạo agent mới (Owner hoặc Admin ghi on-chain)</CardDescription>
          </div>
          <CreateAgentDialog onCreated={() => agents.refetch()} />
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
      {paused ? (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          Hệ đang tạm dừng — sửa/xoá agent bị khoá. Owner hoặc Admin mở lại tại mục Hệ thống.
        </p>
      ) : !isOperator ? (
        <p className="text-sm text-muted-foreground">Chỉ Owner hoặc Admin nền tảng được sửa và đổi trạng thái agent.</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Input
          className="min-w-[12rem] flex-1"
          placeholder="Tìm theo tên, SĐT, id, ví…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(0)
          }}
        />
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          value={status ?? ''}
          onChange={(e) => {
            setStatus(e.target.value ? Number(e.target.value) : null)
            setPage(0)
          }}
        >
          <option value="">Mọi trạng thái</option>
          <option value="1">Hoạt động</option>
          <option value="2">Tạm dừng</option>
          <option value="3">Đã xoá</option>
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          value={servicesMask ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setServicesMask(v ? Number(v) : null)
            setPage(0)
          }}
        >
          <option value="">Mọi dịch vụ</option>
          <option value={String(SERVICE_MASK.NET)}>NET</option>
          <option value={String(SERVICE_MASK.IQR)}>IQR</option>
          <option value={String(SERVICE_MASK.LOYALTY)}>LOYALTY</option>
        </select>
      </div>

      <DataTable
        columns={columns}
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
      <p className="text-xs text-muted-foreground">
        Trang {page + 1}/{totalPages} · {total} agent (tìm kiếm phía client, giới hạn ~1000 agent)
      </p>
        </CardContent>
      </Card>
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
    </div>
  )
}

function AgentRowActions({
  row,
  canWrite,
  onAction,
}: {
  row: AgentListRow
  canWrite: boolean
  onAction: (mode: AgentManageMode) => void
}) {
  if (!canWrite) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <div className="flex flex-wrap justify-end gap-1">
      <button type="button" className="text-xs text-primary hover:underline" onClick={() => onAction('edit')}>
        Sửa
      </button>
      {row.status === 1 ? (
        <button type="button" className="text-xs text-amber-700 hover:underline dark:text-amber-200" onClick={() => onAction('suspend')}>
          Dừng
        </button>
      ) : null}
      {row.status === 2 ? (
        <button type="button" className="text-xs text-primary hover:underline" onClick={() => onAction('resume')}>
          Mở lại
        </button>
      ) : null}
      {row.status !== 3 ? (
        <button type="button" className="text-xs text-destructive hover:underline" onClick={() => onAction('delete')}>
          Xoá
        </button>
      ) : null}
    </div>
  )
}