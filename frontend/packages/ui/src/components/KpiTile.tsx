import { cn } from '../lib/cn'
import { formatBps, formatVnd } from '../lib/format'

export type KpiTileProps = {
  label: string
  value: bigint | number
  previous?: bigint | number
  format?: 'vnd' | 'bps' | 'number'
  className?: string
}

function displayValue(value: bigint | number, format: KpiTileProps['format']) {
  if (format === 'bps') return formatBps(Number(value))
  if (format === 'vnd') return formatVnd(typeof value === 'bigint' ? value : BigInt(value))
  return String(value)
}

function compareText(current: bigint, previous: bigint, format: KpiTileProps['format']): string | null {
  if (previous === 0n && current === 0n) return null
  if (previous === 0n) return '—'
  if (previous < 0n) {
    const delta = current - previous
    if (format === 'vnd') return `${formatVnd(delta)} so với kỳ trước`
    return `${displayValue(delta, format)} so với kỳ trước`
  }
  const diff = Number(((current - previous) * 10000n) / previous) / 100
  if (!Number.isFinite(diff)) return null
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff.toFixed(2)}% so với kỳ trước`
}

export function KpiTile({ label, value, previous, format = 'vnd', className }: KpiTileProps) {
  const current = typeof value === 'bigint' ? value : BigInt(Math.trunc(value))
  const prev = previous == null ? undefined : typeof previous === 'bigint' ? previous : BigInt(Math.trunc(previous))
  const trend = prev == null ? null : compareText(current, prev, format)

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{displayValue(current, format)}</p>
      {trend ? <p className="mt-2 text-xs text-muted-foreground">{trend}</p> : null}
    </div>
  )
}