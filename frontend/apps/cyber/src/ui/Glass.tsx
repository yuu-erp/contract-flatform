import type { HTMLAttributes } from 'react'
import { cn } from './cn'

/** Tấm kính mờ (cửa sổ, sidebar, thanh trên). */
export function Glass({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass rounded-[var(--radius-glass)]', className)} {...rest} />
}
