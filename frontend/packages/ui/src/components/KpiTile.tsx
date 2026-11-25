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
    if (format === 'vnd') return `${formatVnd(delta)} so kỳ trước`
    return `${displayValue(delta, format)} so kỳ trước`
  }
  const diff = Number(((current - previous) * 10000n) / previous) / 100
  if (!Number.isFinite(diff)) return null
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff.toFixed(2)}% so kỳ trước`
}

export function KpiTile({ label, value, previous, format = 'vnd', className }: KpiTileProps) {
  const current = typeof value === 'bigint' ? value : BigInt(Math.trunc(value))
  const prev = previous == null ? undefined : typeof previous === 'bigint' ? previous : BigInt(Math.trunc(previous))
  const trend = prev == null ? null : compareText(current, prev, format)

  return (
    <div className={cn('rounded-2xl border border-border bg-card px-4 py-3 text-card-foreground', className)}>
      <p className="text-[0.8125rem] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[1.1875rem] leading-6 font-extrabold tracking-tight whitespace-nowrap tabular-nums sm:text-[1.4375rem] sm:leading-7">{displayValue(current, format)}</p>
      {trend ? <TrendText text={trend} /> : null}
    </div>
  )
}
function TrendText({ text }: { text: string }) {
  const up = text.startsWith('+')
  const down = text.startsWith('-') || text.startsWith('−')
  return (
    <p className={cn('mt-1 text-[0.8125rem]', up ? 'text-success' : down ? 'text-danger' : 'text-muted-foreground')}>{text}</p>
  )
}
