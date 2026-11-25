import type { ReactNode } from 'react'
import { cn } from './cn'

/** Số đếm đỏ (thông báo, yêu cầu). */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null
  return (
    <span className={cn('grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[11px] font-extrabold text-white', className)}>
      {count}
    </span>
  )
}

/** Nhãn hạng / vai trò nền sáng (BẠC, VÀNG, OWNER…). */
export function RankTag({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'gold' }) {
  return (
    <span
      className={cn(
        'rounded-md px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wider',
        tone === 'gold' ? 'bg-amber-200 text-amber-950' : 'bg-white/85 text-[#3b2a3f]',
      )}
    >
      {children}
    </span>
  )
}

/** Chấm trạng thái phát sáng. */
export function StatusDot({ color, className }: { color: string; className?: string }) {
  return <span className={cn('inline-block size-2 shrink-0 rounded-full', className)} style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
}
