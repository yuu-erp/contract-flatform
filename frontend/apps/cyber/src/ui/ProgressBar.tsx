import { cn } from './cn'

const FILLS = {
  violet: 'bg-gradient-to-r from-[#60a5fa] to-[#a78bfa]',
  play: 'bg-gradient-to-r from-[#4ade80] to-[#22c55e]',
  warn: 'bg-warn',
  topup: 'bg-gradient-to-r from-[#fdba74] to-[#f97316]',
} as const

export function ProgressBar({
  value,
  tone = 'violet',
  height = 8,
  className,
  label,
}: {
  /** 0–1 */
  value: number
  tone?: keyof typeof FILLS
  height?: number
  className?: string
  label?: string
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('overflow-hidden rounded-full bg-white/10', className)}
      style={{ height }}
    >
      <div className={cn('h-full rounded-full', FILLS[tone])} style={{ width: `${pct}%` }} />
    </div>
  )
}
