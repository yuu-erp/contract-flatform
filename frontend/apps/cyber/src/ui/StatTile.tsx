import type { ReactNode } from 'react'
import { Card } from './Card'
import { IconBox } from './IconBox'
import { TONES, type Tone } from './tone'

/** Ô số liệu: icon màu, nhãn, giá trị lớn, dòng thay đổi. */
export function StatTile({
  icon,
  tone,
  label,
  value,
  delta,
  deltaTone,
}: {
  icon: ReactNode
  tone: Tone
  label: string
  value: ReactNode
  delta?: ReactNode
  deltaTone?: Tone
}) {
  return (
    <Card className="flex min-w-0 items-center gap-3.5 px-[18px] py-4">
      <IconBox tone={tone} size={48}>
        {icon}
      </IconBox>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-ink-muted">{label}</div>
        <div className="text-2xl leading-tight font-extrabold whitespace-nowrap">{value}</div>
        {delta ? (
          <div className="text-xs font-bold" style={{ color: TONES[deltaTone ?? tone] }}>
            {delta}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
