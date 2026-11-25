import type { ReactNode } from 'react'
import { Avatar } from './Avatar'
import { RankTag } from './Badge'

/** Khối người dùng ở thanh trên: avatar, tên, nhãn hạng/vai trò, dòng phụ. */
export function UserChip({
  name,
  tag,
  subtitle,
  gradient,
  tagTone,
}: {
  name: string
  tag: ReactNode
  subtitle: ReactNode
  gradient?: string
  tagTone?: 'light' | 'gold'
}) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-edge-soft bg-sunken py-1 pr-4 pl-1 whitespace-nowrap">
      <Avatar name={name} size={40} gradient={gradient} />
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-extrabold">{name}</span>
          <RankTag tone={tagTone}>{tag}</RankTag>
        </div>
        <div className="text-[11.5px] text-ink-dim">{subtitle}</div>
      </div>
    </div>
  )
}
