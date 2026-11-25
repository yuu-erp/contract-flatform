import type { ReactNode } from 'react'
import { Card, IconBox, Kbd, TONES, type Tone } from '../ui'

/** Nút thao tác nhanh lớn ở quầy (Mở máy, Nạp tiền…), có phím tắt. */
export function QuickAction({
  icon,
  title,
  detail,
  tone,
  shortcut,
  onClick,
}: {
  icon: ReactNode
  title: string
  detail: string
  tone: Tone
  shortcut: string
  onClick?: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="min-w-0 text-left transition hover:brightness-110">
      <Card className="px-4 py-3.5" style={{ background: `linear-gradient(135deg, ${TONES[tone]}30, rgb(255 255 255 / 0.04))`, borderColor: `${TONES[tone]}55` }}>
        <div className="flex items-start justify-between">
          <IconBox tone={tone} size={44} solid>
            {icon}
          </IconBox>
          <Kbd>{shortcut}</Kbd>
        </div>
        <div className="mt-2.5 text-base font-extrabold whitespace-nowrap">{title}</div>
        <div className="truncate text-[11.5px] text-ink-dim">{detail}</div>
      </Card>
    </button>
  )
}
