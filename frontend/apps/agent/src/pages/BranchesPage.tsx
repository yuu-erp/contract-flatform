import {
  useAgentBranches,
  useContracts,
  chunkDays,
  mapWithConcurrency,
  type ServiceFilter,
} from '@meta-platform/chain'
import type { AgentAccess } from '@meta-platform/chain'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  Money,
  StatusBadge,
  resolveRangeDays,
  type RangePickerValue,
  OverviewFiltersBar,
  type ServiceFilterValue,
  SCOPE_BRANCH,
  formatAllowedServices,
} from '@meta-platform/ui'
import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { CopyManagerLinkButton } from '../components/CopyManagerLinkButton'
import { branchMetricsFromDaily } from '../lib/branch-ranking'
import { withDomain } from '../lib/read-domain'
import { useQuery } from '@tanstack/react-query'

type Ctx = { access: AgentAccess; domain?: string }

export function BranchesPage() {
  const { access, domain } = useOutletContext<Ctx>()
  if (access.kind !== 'owner') {
    return <EmptyState title="Chỉ chủ agent" description="Trang chi nhánh chỉ dành cho ví chủ cửa hàng." />
  }
  return <OwnerBranchesTable agentId={access.agentId} domain={domain} />
}

function OwnerBranchesTable({ agentId, domain }: { agentId: number; domain?: string }) {
  const contracts = useContracts()
  const branches = useAgentBranches(agentId)
  const [range, setRange] = useState<RangePickerValue>('7d')
  const [serviceUi, setServiceUi] = useState<ServiceFilterValue>('ALL')
  const service: ServiceFilter = serviceUi
  const { fromDay, toDay } = useMemo(() => resolveRangeDays(range, 420), [range])

  const branchViews = useQuery({
    queryKey: ['agent-branch-views', agentId, branches.data?.rows.map((r) => r.record.branchId)],
    enabled: !!contracts && (branches.data?.rows.length ?? 0) > 0,
    queryFn: async () => {
      const out: {
        branchId: number
        name: string
        domain: string
        status: number
        services: number
        isMain: boolean
      }[] = []
      for (const row of branches.data!.rows) {
        const view = await contracts!.branches.getBranch(row.record.branchId)
        out.push({
          branchId: row.record.branchId,
          name: row.record.profile.name,
          domain: row.record.domain,
          status: view.status,
          services: view.services,
          isMain: view.isMain,
        })
      }
      return out
    },
  })

  const rows = branchViews.data ?? []

  const metrics = useQuery({
    queryKey: ['branch-table-metrics', agentId, fromDay, toDay, service, rows.map((r) => r.branchId)],
    enabled: !!contracts?.ledger && rows.length > 0,
    queryFn: async () => {
      const ledger = contracts!.ledger
      const map = new Map<number, { net: bigint }>()
      await mapWithConcurrency(rows, 8, async (row) => {
        const chunks = chunkDays(fromDay, toDay)
        const daily: bigint[][] = []
        for (const [from, to] of chunks) {
          daily.push(...(await ledger.rollup(SCOPE_BRANCH, row.branchId, from, to)))
        }
        map.set(row.branchId, branchMetricsFromDaily(daily, service))
      })
      return map
    },
  })

  type Row = (typeof rows)[0] & { net: bigint }
  const tableRows: Row[] = rows.map((r) => ({
    ...r,
    net: metrics.data?.get(r.branchId)?.net ?? 0n,
  }))

  const columns = [
    {
      key: 'name',
      header: 'Tên',
      render: (r: Row) => (
        <Link to={withDomain(`/branches/${r.branchId}`, domain)} className="font-medium text-primary hover:underline">
          {r.name || `#${r.branchId}`}
        </Link>
      ),
    },
    { key: 'domain', header: 'Domain', render: (r: Row) => <span className="font-mono text-xs">{r.domain}</span> },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (r: Row) => <StatusBadge kind="branch" value={r.status} />,
    },
    {
      key: 'services',
      header: 'Dịch vụ',
      render: (r: Row) => formatAllowedServices(r.services),
    },
    {
      key: 'main',
      header: 'Chính',
      render: (r: Row) => (r.isMain ? 'Có' : '—'),
    },
    {
      key: 'net',
      header: 'Doanh thu thuần',
      render: (r: Row) => <Money value={r.net} />,
    },
    {
      key: 'link',
      header: '',
      render: (r: Row) => <CopyManagerLinkButton domain={r.domain} />,
    },
  ]

  return (
    <div className="space-y-4">
      <OverviewFiltersBar range={range} onRangeChange={setRange} service={serviceUi} onServiceChange={setServiceUi} />
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chi nhánh</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={tableRows}
            loading={branches.isLoading || branchViews.isLoading || metrics.isLoading}
            error={branches.error?.message ?? branchViews.error?.message}
            onRetry={() => {
              void branches.refetch()
              void branchViews.refetch()
            }}
            emptyTitle="Chưa có chi nhánh"
            page={0}
            pageSize={100}
            total={tableRows.length}
            onPageChange={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  )
}