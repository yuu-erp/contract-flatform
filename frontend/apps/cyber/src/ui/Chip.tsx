import type { ReactNode } from 'react'
import { cn } from './cn'

export function Chip({
  children,
  active,
  dot,
  onClick,
  className,
}: {
  children: ReactNode
  active?: boolean
  /** Màu chấm tròn đầu chip. */
  dot?: string
  onClick?: () => void
  className?: string
}) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold whitespace-nowrap transition',
        active ? 'border-edge-strong bg-white/15 text-white' : 'border-edge-soft bg-sunken text-ink-muted hover:text-ink',
        className,
      )}
    >
      {dot ? <span className="size-2 rounded-full" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} /> : null}
      {children}
    </Tag>
  )
}

/** Phím tắt nhỏ (F2, F3…). */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-6 items-center rounded-full border border-edge-soft bg-sunken px-2.5 text-[11px] font-bold text-ink-muted">{children}</kbd>
}
