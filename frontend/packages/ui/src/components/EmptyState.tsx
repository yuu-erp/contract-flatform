import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto flex max-w-[400px] flex-col items-start justify-center gap-2 px-8 py-10 text-left', className)}>
      <p className="text-[1.9375rem] leading-9 font-extrabold tracking-tight">{title}</p>
      {description ? <p className="text-[0.9375rem] text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  )
}