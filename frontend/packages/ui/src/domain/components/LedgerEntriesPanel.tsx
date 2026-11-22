import { useLedgerEntries } from '@meta-platform/chain'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { DataTable } from '../../components/DataTable'
import { Money } from '../../components/Money'
import { ledgerRowSummary } from '../lib/ledger-display'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

export type LedgerBranchOption = { branchId: number; name: string }

export function LedgerEntriesPanel({
  agentId,
  lockedBranchId,
  branches,
  title = 'Giao dịch sổ',
}: {
  agentId: number
  lockedBranchId?: number
  branches?: LedgerBranchOption[]
  title?: string
}) {
  const [branchId, setBranchId] = useState<number | undefined>(lockedBranchId)
  const [page, setPage] = useState(0)
  const effectiveBranch = lockedBranchId ?? branchId
  const entries = useLedgerEntries(agentId, { branchId: effectiveBranch }, page)
  type TxRow = NonNullable<typeof entries.data>['items'][number]
  const columns = [
    {
      key: 'kind',
      header: 'Loại',
      render: (row: TxRow) => ledgerRowSummary(row.record.kind, row.record.method),
    },
    {
      key: 'branch',
      header: 'Chi nhánh',
      render: (row: TxRow) => (row.record.branchId ? row.record.branchId : '—'),
    },
    {
      key: 'amount',
      header: 'Số tiền',
      render: (row: TxRow) => <Money value={row.record.amount} />,
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center gap-2">
        <CardTitle>{title}</CardTitle>
        {!lockedBranchId && branches && branches.length > 0 ? (
          <Select
            value={branchId != null ? String(branchId) : 'all'}
            onValueChange={(v) => {
              setBranchId(v === 'all' ? undefined : Number(v))
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[min(100%,14rem)]">
              <SelectValue placeholder="Mọi chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi chi nhánh</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.branchId} value={String(b.branchId)}>
                  {b.name || `Chi nhánh #${b.branchId}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          rows={entries.data?.items ?? []}
          loading={entries.isLoading}
          page={page}
          pageSize={20}
          total={entries.data?.total ?? 0}
          onPageChange={setPage}
          emptyTitle="Chưa có bút toán"
        />
      </CardContent>
    </Card>
  )
}