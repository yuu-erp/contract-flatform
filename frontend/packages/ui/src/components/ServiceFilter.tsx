import { cn } from '../lib/cn'

export type ServiceFilterValue = 'ALL' | 'NET' | 'IQR'

const options: { value: ServiceFilterValue; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'NET', label: 'NET' },
  { value: 'IQR', label: 'IQR' },
]

export function ServiceFilter({
  value,
  onChange,
  className,
}: {
  value: ServiceFilterValue
  onChange: (value: ServiceFilterValue) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex gap-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-8 rounded-full border px-3.5 text-sm font-bold transition-colors',
            value === opt.value
              ? 'border-transparent bg-foreground text-background'
              : 'border-input text-foreground hover:bg-hover',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}