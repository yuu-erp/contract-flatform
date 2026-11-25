import { cn } from '../lib/cn'

export type UnderlineTab<T extends string> = { value: T; label: string; count?: number }

/** Tab kiểu X: chữ đậm khi chọn, gạch dưới 4px màu chủ đạo. */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: UnderlineTab<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div role="tablist" className={cn('flex overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className="flex min-w-[56px] flex-auto shrink-0 justify-center px-3 transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-none"
          >
            <span
              className={cn(
                'relative flex h-[53px] items-center text-[15px] whitespace-nowrap',
                active ? 'font-bold text-foreground' : 'font-medium text-muted-foreground',
              )}
            >
              {tab.label}
              {tab.count != null ? <span className="ml-1 text-muted-foreground">({tab.count})</span> : null}
              {active ? <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-primary" /> : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
