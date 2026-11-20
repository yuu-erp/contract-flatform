import { useAgents } from '@meta-platform/chain'
import { Address, DataTable, StatusBadge } from '@meta-platform/ui'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreateAgentDialog } from '../components/CreateAgentDialog'
import { useBranchCounts } from '../hooks/use-branch-counts'
import { AGENTS_PAGE_SIZE } from '../lib/scopes'
import { filterAndSearchAgents, paginateAgents, type AgentListRow } from '../lib/agent-list'
import { formatAllowedServices } from '../lib/services-label'
import { SERVICE_MASK } from '../lib/validate-create-agent'

export function AgentsPage() {
  const agents = useAgents()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<number | null>(null)
  const [servicesMask, setServicesMask] = useState<number | null>(null)
  const [page, setPage] = useState(1)

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
    ],
    [branchCounts.data],
  )

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Danh sách agent</h1>
        <CreateAgentDialog onCreated={() => agents.refetch()} />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[12rem] flex-1 rounded-md border border-border px-3 py-2 text-sm"
          placeholder="Tìm theo tên, SĐT, id, ví…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
        />
        <select
          className="rounded-md border border-border px-3 py-2 text-sm"
          value={status ?? ''}
          onChange={(e) => {
            setStatus(e.target.value ? Number(e.target.value) : null)
            setPage(1)
          }}
        >
          <option value="">Mọi trạng thái</option>
          <option value="1">Hoạt động</option>
          <option value="2">Tạm dừng</option>
          <option value="3">Đã xoá</option>
        </select>
        <select
          className="rounded-md border border-border px-3 py-2 text-sm"
          value={servicesMask ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setServicesMask(v ? Number(v) : null)
            setPage(1)
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
        Trang {page}/{totalPages} · {total} agent (tìm kiếm phía client, giới hạn ~1000 agent)
      </p>
    </div>
  )
}