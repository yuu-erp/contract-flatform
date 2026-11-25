import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from './cn'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Tìm kiếm…',
  icon,
  hint,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: ReactNode
  /** Phần bên phải (vd. phím tắt F2). */
  hint?: ReactNode
  className?: string
}) {
  return (
    <label
      className={cn(
        'flex h-10 min-w-0 items-center gap-2.5 rounded-full border border-edge-soft bg-black/30 px-4 text-ink-dim focus-within:border-edge-strong',
        className,
      )}
    >
      <span className="shrink-0">{icon ?? <Search className="size-4" />}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-dim"
      />
      {hint ? <span className="shrink-0">{hint}</span> : null}
    </label>
  )
}
