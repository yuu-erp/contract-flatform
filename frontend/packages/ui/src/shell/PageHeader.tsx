import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/** Tiêu đề trang dashboard: tên lớn, mô tả, hành động bên phải. */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-[15px] text-muted-foreground">{eyebrow}</div> : null}
        <h1 className="text-[26px] leading-8 font-extrabold tracking-tight md:text-[31px] md:leading-9">{title}</h1>
        {description ? <p className="mt-1 text-[15px] text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/** Thẻ khối dashboard: tiêu đề 20px đậm, mô tả, hành động bên phải. */
export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  flush,
  tone,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
  bodyClassName?: string
  /** Bỏ đệm thân (cho bảng / danh sách sát viền). */
  flush?: boolean
  tone?: 'danger'
}) {
  return (
    <section
      className={cn(
        'min-w-0 overflow-hidden rounded-2xl border border-border bg-card',
        tone === 'danger' && 'border-danger/40',
        className,
      )}
    >
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div className="min-w-0">
            {title ? (
              <h2 className={cn('text-xl leading-6 font-extrabold tracking-tight', tone === 'danger' && 'text-danger')}>
                {title}
              </h2>
            ) : null}
            {description ? <p className="mt-0.5 text-[15px] text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn(!flush && 'px-5 pb-5', !title && !actions && !flush && 'pt-5', bodyClassName)}>{children}</div>
    </section>
  )
}
