import { useAuditLog, type AuditFilter, type PlatformAuditRecord } from '@meta-platform/chain'
import { Address, Button, DataTable, Input } from '@meta-platform/ui'
import { Dialog } from 'radix-ui'
import { useMemo, useState } from 'react'
import { auditRowSummary, formatAuditBytes } from '../lib/audit-display'

export type AuditLogPanelProps = {
  locked?: Partial<AuditFilter>
  hideAgent?: boolean
  hideBranch?: boolean
}

type AuditFilterDraft = AuditFilter & { dateFrom?: string; dateTo?: string }

function dateToStartTs(iso: string): number {
  return Math.floor(new Date(`${iso}T00:00:00`).getTime() / 1000)
}

function dateToEndTs(iso: string): number {
  return Math.floor(new Date(`${iso}T23:59:59`).getTime() / 1000)
}

export function AuditLogPanel({ locked, hideAgent, hideBranch }: AuditLogPanelProps) {
  const [draft, setDraft] = useState<AuditFilterDraft>({})
  const [filter, setFilter] = useState<AuditFilter>({})
  const [page, setPage] = useState(0)
  const [detailId, setDetailId] = useState<number | null>(null)

  const merged = useMemo(() => ({ ...filter, ...locked }), [filter, locked])
  const audit = useAuditLog(merged, page)

  type Row = NonNullable<typeof audit.data>['items'][number]
  const detail = audit.data?.items.find((i) => i.docId === detailId)

  const columns = [
    {
      key: 'action',
      header: 'Hành động',
      render: (row: Row) => (
        <button type="button" className="text-left text-primary hover:underline" onClick={() => setDetailId(row.docId)}>
          {auditRowSummary(row.record)}
        </button>
      ),
    },
    {
      key: 'actor',
      header: 'Người làm',
      render: (row: Row) => <Address value={row.record.actor} />,
    },
    {
      key: 'branch',
      header: 'Chi nhánh',
      render: (row: Row) => (row.record.branchId ? row.record.branchId : '—'),
    },
    {
      key: 'time',
      header: 'Thời gian',
      render: (row: Row) => new Date(row.record.timestamp * 1000).toLocaleString('vi-VN'),
    },
  ]

  const applyFilters = () => {
    const next: AuditFilter = {
      agentId: draft.agentId,
      branchId: draft.branchId,
      action: draft.action?.trim() || undefined,
      actor: draft.actor?.trim() || undefined,
    }
    if (draft.dateFrom && draft.dateTo) {
      next.fromTs = dateToStartTs(draft.dateFrom)
      next.toTs = dateToEndTs(draft.dateTo)
    }
    setFilter(next)
    setPage(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3 text-sm">
        {!hideAgent ? (
          <Input
            className="w-28"
            type="number"
            placeholder="Agent id"
            value={draft.agentId ?? ''}
            onChange={(e) => setDraft({ ...draft, agentId: e.target.value ? Number(e.target.value) : undefined })}
          />
        ) : null}
        {!hideBranch ? (
          <Input
            className="w-28"
            type="number"
            placeholder="Chi nhánh id"
            value={draft.branchId ?? ''}
            onChange={(e) => setDraft({ ...draft, branchId: e.target.value ? Number(e.target.value) : undefined })}
          />
        ) : null}
        <Input
          className="min-w-[8rem] flex-1"
          placeholder="Hành động"
          value={draft.action ?? ''}
          onChange={(e) => setDraft({ ...draft, action: e.target.value })}
        />
        <Input
          className="min-w-[10rem] flex-1"
          placeholder="Ví người làm"
          value={draft.actor ?? ''}
          onChange={(e) => setDraft({ ...draft, actor: e.target.value })}
        />
        <Input className="w-36" type="date" onChange={(e) => setDraft({ ...draft, dateFrom: e.target.value })} />
        <Input className="w-36" type="date" onChange={(e) => setDraft({ ...draft, dateTo: e.target.value })} />
        <Button type="button" variant="outline" onClick={applyFilters}>
          Lọc
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={audit.data?.items ?? []}
        loading={audit.isLoading}
        page={page}
        pageSize={20}
        total={audit.data?.total ?? 0}
        onPageChange={setPage}
        emptyTitle="Chưa có nhật ký"
      />

      <Dialog.Root open={detailId != null} onOpenChange={(open) => !open && setDetailId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[min(100%,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-background p-5 shadow-lg">
            <Dialog.Title className="text-lg font-semibold">Chi tiết nhật ký</Dialog.Title>
            {detail ? <AuditDetailBody record={detail.record} /> : null}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setDetailId(null)}>
                Đóng
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

function AuditDetailBody({ record }: { record: PlatformAuditRecord }) {
  return (
    <div className="mt-4 space-y-3 text-sm">
      <p>
        <span className="text-muted-foreground">Lý do:</span> {record.reason || '—'}
      </p>
      <AuditPayload label="Trước" hex={record.before} />
      <AuditPayload label="Sau" hex={record.after} />
    </div>
  )
}

function AuditPayload({ label, hex }: { label: string; hex: `0x${string}` }) {
  return (
    <div>
      <p className="font-medium">{label}</p>
      <pre className="mt-1 max-h-40 overflow-auto rounded-md border border-border bg-muted/40 p-2 text-xs whitespace-pre-wrap break-all">
        {formatAuditBytes(hex)}
      </pre>
    </div>
  )
}