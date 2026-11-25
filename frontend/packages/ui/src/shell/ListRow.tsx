import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

/** Hàng danh sách kiểu "người để theo dõi": avatar, tên đậm, dòng phụ, nội dung, hành động bên phải. */
export function ListRow({
  avatar,
  title,
  meta,
  subtitle,
  children,
  right,
  to,
  className,
}: {
  avatar?: ReactNode
  title: ReactNode
  /** Phần mờ cạnh tên (vd. "· #12"). */
  meta?: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
  right?: ReactNode
  to?: string
  className?: string
}) {
  const body = (
    <>
      {avatar ? <div className="shrink-0">{avatar}</div> : null}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1 text-[0.9375rem] leading-5">
          <span className="truncate font-bold">{title}</span>
          {meta ? <span className="shrink-0 truncate text-muted-foreground">{meta}</span> : null}
        </div>
        {subtitle ? <div className="truncate text-[0.9375rem] leading-5 text-muted-foreground">{subtitle}</div> : null}
        {children ? <div className="mt-1 text-[0.9375rem] leading-5">{children}</div> : null}
      </div>
    </>
  )
  return (
    <div className={cn('relative flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-row-hover', className)}>
      {to ? (
        <Link to={to} className="flex min-w-0 flex-1 gap-3 outline-none after:absolute after:inset-0 focus-visible:underline">
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 gap-3">{body}</div>
      )}
      {right ? <div className="relative z-10 flex shrink-0 items-start gap-1">{right}</div> : null}
    </div>
  )
}

/** Khối nội dung trong cột giữa, cách nhau bằng đường kẻ. */
export function ColumnSection({
  title,
  description,
  right,
  children,
  className,
  flush,
}: {
  title?: ReactNode
  description?: ReactNode
  right?: ReactNode
  children?: ReactNode
  className?: string
  /** Không đệm hai bên (cho danh sách ListRow). */
  flush?: boolean
}) {
  return (
    <section className={cn('border-b border-border', !flush && 'px-4 py-3', className)}>
      {title || right ? (
        <div className={cn('mb-3 flex items-start justify-between gap-3', flush && 'px-4 pt-3')}>
          <div className="min-w-0">
            {title ? <h2 className="text-xl leading-6 font-extrabold tracking-tight">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-[0.9375rem] text-muted-foreground">{description}</p> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
