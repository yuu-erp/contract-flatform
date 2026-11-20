import type { RangePreset } from '@meta-platform/chain'
import { cn } from '../lib/cn'

const presets: { id: RangePreset; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
  { id: 'thisMonth', label: 'Tháng này' },
  { id: 'lastMonth', label: 'Tháng trước' },
]

export function RangePicker({
  value,
  onChange,
  className,
}: {
  value: RangePreset
  onChange: (value: RangePreset) => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onChange(preset.id)}
          className={cn(
            'rounded-md border border-border px-3 py-1.5 text-sm',
            value === preset.id ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60',
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}