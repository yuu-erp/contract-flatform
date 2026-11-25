import { Fragment, type ReactNode } from 'react'
import { cn } from './cn'
import { StatusDot } from './Badge'
import { TONES, type Tone } from './tone'

export type InfoPillItem = { label?: ReactNode; value: ReactNode; tone?: Tone; icon?: ReactNode }

/** Viên thuốc thông tin (Ví chính | Ví KM, doanh thu ca…). */
export function InfoPill({
  items,
  status,
  tone,
  className,
}: {
  items: InfoPillItem[]
  /** Chấm trạng thái cuối viên. */
  status?: Tone
  /** Tô nền viên theo tông (vd. đếm giờ màu xanh). */
  tone?: Tone
  className?: string
}) {
  const style = tone ? { background: `${TONES[tone]}24`, borderColor: `${TONES[tone]}73` } : undefined
  return (
    <div
      style={style}
      className={cn('flex h-10 shrink-0 items-center gap-3 rounded-full border border-edge-soft bg-black/30 px-4 text-[13px] whitespace-nowrap', className)}
    >
      {items.map((it, k) => (
        <Fragment key={k}>
          {k > 0 ? <span className="h-4 w-px bg-edge" /> : null}
          <span className="flex items-center gap-2">
            {it.icon}
            {it.label ? <span className="text-ink-muted">{it.label}</span> : null}
            <span className="font-extrabold" style={it.tone ? { color: TONES[it.tone] } : undefined}>
              {it.value}
            </span>
          </span>
        </Fragment>
      ))}
      {status ? <StatusDot color={TONES[status]} /> : null}
    </div>
  )
}
