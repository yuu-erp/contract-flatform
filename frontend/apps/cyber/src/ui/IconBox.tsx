import type { ReactNode } from 'react'
import { cn } from './cn'
import { toneSoft, TONES, type Tone } from './tone'

/** Ô vuông bo góc chứa icon, màu theo tông. `solid` = nền đặc (nút thao tác nhanh). */
export function IconBox({
  tone,
  size = 40,
  solid,
  children,
  className,
}: {
  tone: Tone
  size?: number
  solid?: boolean
  children: ReactNode
  className?: string
}) {
  const style = solid
    ? { background: TONES[tone], color: '#111', boxShadow: `0 8px 20px ${TONES[tone]}66` }
    : { ...toneSoft(tone), borderWidth: 1 }
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-xl', className)}
      style={{ width: size, height: size, borderRadius: size >= 44 ? 14 : 12, ...style }}
    >
      {children}
    </span>
  )
}
