import { useId } from 'react'

export type ChartSeries = { name: string; color: string; values: number[] }

/**
 * Biểu đồ vùng nhiều chuỗi, tự co theo bề rộng khung (viewBox). Đánh dấu điểm cao nhất của chuỗi đầu.
 */
export function AreaChart({
  series,
  labels,
  height = 220,
  formatPeak,
  peakLabel,
}: {
  series: ChartSeries[]
  /** Nhãn trục X theo vị trí: [chỉ số, nhãn]. */
  labels: [number, string][]
  height?: number
  formatPeak?: (v: number) => string
  peakLabel?: (index: number) => string
}) {
  const id = useId().replace(/:/g, '')
  const W = 700
  const H = height
  const n = series[0]?.values.length ?? 0
  const max = Math.max(1, ...series.flatMap((s) => s.values)) * 1.15
  const x = (i: number) => (n <= 1 ? 0 : (i * W) / (n - 1))
  const y = (v: number) => H - (v / max) * H
  const first = series[0]?.values ?? []
  const peak = first.reduce((best, v, i) => (v > (first[best] ?? -Infinity) ? i : best), 0)

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="h-auto w-full" role="img" aria-label={series.map((s) => s.name).join(', ')}>
      <defs>
        {series.map((s, k) => (
          <linearGradient key={s.name} id={`${id}-g${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={s.color} stopOpacity={0.38} />
            <stop offset="1" stopColor={s.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {[1, 2, 3].map((g) => (
        <line key={g} x1={0} x2={W} y1={(H * g) / 4} y2={(H * g) / 4} stroke="rgb(255 255 255 / 0.07)" />
      ))}
      {series.map((s, k) => {
        const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
        return (
          <g key={s.name}>
            <path d={`${d} L${W},${H} L0,${H} Z`} fill={`url(#${id}-g${k})`} />
            <path d={d} fill="none" stroke={s.color} strokeWidth={2.6} strokeLinejoin="round" />
          </g>
        )
      })}
      {n > 0 && series[0] ? (
        <g>
          <line x1={x(peak)} x2={x(peak)} y1={y(first[peak]!)} y2={H} stroke="rgb(255 255 255 / 0.35)" strokeDasharray="3 3" />
          <circle cx={x(peak)} cy={y(first[peak]!)} r={5} fill="#fff" stroke={series[0].color} strokeWidth={3} />
          <g transform={`translate(${Math.max(0, Math.min(W - 120, x(peak) - 128))},${Math.max(0, y(first[peak]!) - 20)})`}>
            <rect width={116} height={40} rx={10} fill="rgb(20 14 26 / 0.92)" stroke="rgb(255 255 255 / 0.15)" />
            <text x={10} y={16} fill="rgb(246 243 248 / 0.6)" fontSize={10}>
              {peakLabel?.(peak) ?? 'Cao điểm'}
            </text>
            <text x={10} y={32} fill="#fff" fontSize={13} fontWeight={800}>
              {formatPeak ? formatPeak(first[peak]!) : first[peak]}
            </text>
          </g>
        </g>
      ) : null}
      {labels.map(([i, t]) => (
        <text
          key={i}
          x={x(i)}
          y={H + 18}
          fill="rgb(246 243 248 / 0.45)"
          fontSize={11}
          textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
        >
          {t}
        </text>
      ))}
    </svg>
  )
}

/** Chú thích chuỗi (chấm màu + tên). */
export function ChartLegend({ series }: { series: Pick<ChartSeries, 'name' | 'color'>[] }) {
  return (
    <div className="flex gap-3.5 text-xs font-bold">
      {series.map((s) => (
        <span key={s.name} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: s.color }} />
          {s.name}
        </span>
      ))}
    </div>
  )
}
