import type { ReactNode } from 'react'
import { Button } from '../primitives/button'
import { cn } from '../lib/cn'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

export type DataTableColumn<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  page,
  pageSize,
  total,
  onPageChange,
  loading,
  error,
  onRetry,
  emptyTitle = 'Không có dữ liệu',
  className,
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyTitle?: string
  className?: string
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (loading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Đang tải…</p>
  }
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} />
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-[15px]">
          <thead className="text-left text-muted-foreground">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 text-[13px] font-medium', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-border transition-colors hover:bg-row-hover">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Trang {page + 1} / {pageCount}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
            Trước
          </Button>
          <Button variant="outline" size="sm" disabled={page + 1 >= pageCount} onClick={() => onPageChange(page + 1)}>
            Sau
          </Button>
        </div>
      </div>
    </div>
  )
}