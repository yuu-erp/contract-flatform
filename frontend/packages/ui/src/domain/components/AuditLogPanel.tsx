import { useAuditLog, type AuditFilter, type PlatformAuditRecord } from '@meta-platform/chain'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Address } from '../../components/Address'
import { Button } from '../../components/ui/button'
import { DataTable } from '../../components/DataTable'
import { Input } from '../../components/ui/input'
import { auditRowSummary, formatAuditBytes } from '../lib/audit-display'
import { auditDateRangeFromIso } from '../lib/audit-date-range'
import { isValidEthAddress } from '../lib/address'
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog'
import { HashAvatar } from '../../shell/HashAvatar'
import { ListPager } from '../../shell/ListPager'
import { formatWalletAddress } from '@meta-platform/chain'

export type AuditLogPanelProps = {
  locked?: Partial<AuditFilter>
  hideAgent?: boolean
  hideBranch?: boolean
  /** 'list' = dạng dòng thời gian (cột hẹp kiểu X); mặc định bảng. */
  variant?: 'table' | 'list'
}

type AuditFilterDraft = AuditFilter & { dateFrom?: string; dateTo?: string }

export function AuditLogPanel({ locked, hideAgent, hideBranch, variant = 'table' }: AuditLogPanelProps) {
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
    const actor = draft.actor?.trim()
    if (actor && !isValidEthAddress(actor)) {
      toast.error('Địa chỉ người làm không hợp lệ — cần 0x và 40 chữ hex.')
      return
    }
    const next: AuditFilter = {
      agentId: draft.agentId,
      branchId: draft.branchId,
      action: draft.action?.trim() || undefined,
      actor: actor || undefined,
      ...auditDateRangeFromIso(draft.dateFrom, draft.dateTo),
    }
    setFilter(next)
    setPage(0)
  }

  return (
    <div className={variant === 'list' ? '' : 'space-y-4'}>
      <div
        className={
          variant === 'list'
            ? 'flex flex-wrap gap-2 border-b border-border px-4 py-3 text-sm'
            : 'flex flex-wrap gap-2 rounded-2xl border border-border p-3 text-sm'
        }
      >
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
        <Input
          className="w-36"
          type="date"
          value={draft.dateFrom ?? ''}
          onChange={(e) => setDraft({ ...draft, dateFrom: e.target.value || undefined })}
        />
        <Input
          className="w-36"
          type="date"
          value={draft.dateTo ?? ''}
          onChange={(e) => setDraft({ ...draft, dateTo: e.target.value || undefined })}
        />
        <Button type="button" variant="outline" onClick={applyFilters}>
          Lọc
        </Button>
      </div>

      {variant === 'list' ? (
        <AuditTimeline
          rows={audit.data?.items ?? []}
          loading={audit.isLoading}
          page={page}
          pageCount={Math.max(1, Math.ceil((audit.data?.total ?? 0) / 20))}
          onPageChange={setPage}
          onOpen={setDetailId}
        />
      ) : (
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
      )}

      <Dialog open={detailId != null} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogTitle>Chi tiết nhật ký</DialogTitle>
          {detail ? <AuditDetailBody record={detail.record} /> : null}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setDetailId(null)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
type TimelineRow = { docId: number; record: PlatformAuditRecord }

function AuditTimeline({
  rows,
  loading,
  page,
  pageCount,
  onPageChange,
  onOpen,
}: {
  rows: TimelineRow[]
  loading: boolean
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  onOpen: (docId: number) => void
}) {
  if (loading) return <p className="px-4 py-8 text-center text-[0.9375rem] text-muted-foreground">Đang tải…</p>
  if (rows.length === 0) return <p className="px-4 py-8 text-center text-[0.9375rem] text-muted-foreground">Chưa có nhật ký</p>
  return (
    <>
      {rows.map((row) => {
        const r = row.record
        return (
          <button
            key={row.docId}
            type="button"
            onClick={() => onOpen(row.docId)}
            className="flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-row-hover"
          >
            <HashAvatar seed={r.actor} size={40} />
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-1 text-[0.9375rem] leading-5">
                <span className="truncate font-bold">{formatWalletAddress(r.actor)}</span>
                <span className="shrink-0 text-muted-foreground">
                  · {new Date(r.timestamp * 1000).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                </span>
              </span>
              <span className="mt-0.5 block text-[0.9375rem] leading-5">{auditRowSummary(r)}</span>
              {r.reason ? <span className="mt-0.5 block text-[0.9375rem] leading-5 text-muted-foreground">“{r.reason}”</span> : null}
            </span>
          </button>
        )
      })}
      <ListPager page={page} pageCount={pageCount} onPageChange={onPageChange} />
    </>
  )
}
