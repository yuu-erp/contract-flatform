import type { ReactNode } from 'react'

/** Vòng tiến độ (thời gian còn lại). */
export function RingProgress({
  value,
  size = 112,
  stroke = 10,
  color = '#22c55e',
  children,
}: {
  /** 0–1 */
  value: number
  size?: number
  stroke?: number
  color?: string
  children?: ReactNode
}) {
  const r = size / 2 - stroke
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(255 255 255 / 0.12)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">{children}</div>
    </div>
  )
}
