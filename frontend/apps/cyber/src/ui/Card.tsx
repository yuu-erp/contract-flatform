import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

/** Thẻ nội dung nằm trong tấm kính. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-[var(--radius-card)] border border-edge-soft bg-surface', className)} {...rest} />
}

export function CardHeader({ title, extra, className }: { title: ReactNode; extra?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 px-[18px] pt-4 pb-1.5', className)}>
      <h2 className="flex items-center gap-2 text-base font-extrabold">{title}</h2>
      {extra ? <div className="flex shrink-0 items-center gap-2">{extra}</div> : null}
    </div>
  )
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-[18px] pt-2 pb-4', className)} {...rest} />
}
