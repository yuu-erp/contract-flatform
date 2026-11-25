import { cn } from './cn'

export type TabItem<T extends string> = { value: T; label: string; tone?: string }

/** Nhóm tab viên thuốc (Hôm nay / 7 ngày…, Tất cả / MOBA…). */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div role="tablist" className={cn('inline-flex shrink-0 gap-0.5 rounded-[14px] border border-edge-soft bg-sunken p-1', className)}>
      {items.map((it) => {
        const on = it.value === value
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.value)}
            style={!on && it.tone ? { color: it.tone } : undefined}
            className={cn(
              'rounded-[10px] px-3.5 py-1.5 text-xs font-extrabold tracking-wider whitespace-nowrap uppercase transition',
              on ? 'bg-white/15 text-white shadow-[inset_0_-2px_0_rgb(255_255_255/0.6)]' : 'text-ink-muted hover:text-ink',
            )}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
