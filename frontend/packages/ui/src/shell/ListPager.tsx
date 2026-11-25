import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Phân trang gọn ở cuối danh sách. */
export function ListPager({
  page,
  pageCount,
  onPageChange,
  summary,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  summary?: React.ReactNode
}) {
  if (pageCount <= 1 && !summary) return null
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-[15px]">
      <span className="text-muted-foreground">{summary ?? `Trang ${page + 1} / ${pageCount}`}</span>
      {pageCount > 1 ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={page <= 0}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-hover disabled:opacity-40"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="min-w-12 text-center tabular-nums">
            {page + 1}/{pageCount}
          </span>
          <button
            type="button"
            aria-label="Trang sau"
            disabled={page + 1 >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-hover disabled:opacity-40"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
