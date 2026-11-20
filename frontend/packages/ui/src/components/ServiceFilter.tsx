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
    <div className={cn('inline-flex rounded-md border border-input bg-background p-0.5 shadow-sm', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded px-3 py-1 text-sm transition-colors',
            value === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}