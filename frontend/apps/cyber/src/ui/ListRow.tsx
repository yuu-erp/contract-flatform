import type { ReactNode } from 'react'
import { cn } from './cn'

/** Hàng danh sách: phần đầu (icon/avatar), tiêu đề, dòng phụ, phần cuối, nội dung thêm. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  children,
  align = 'center',
  className,
}: {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  children?: ReactNode
  align?: 'center' | 'start'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex gap-3 border-b border-edge-soft py-2.5 last:border-b-0',
        align === 'center' ? 'items-center' : 'items-start',
        className,
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">{title}</div>
        {subtitle ? <div className="truncate text-[11.5px] text-ink-dim">{subtitle}</div> : null}
        {children}
      </div>
      {trailing ? <div className="shrink-0 text-right">{trailing}</div> : null}
    </div>
  )
}
