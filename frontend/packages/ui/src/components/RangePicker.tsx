import type { RangePreset } from '@meta-platform/chain'
import { useEffect, useId, useState } from 'react'
import { cn } from '../lib/cn'
import {
  calendarDayFromDateInput,
  isCustomRange,
  type CustomRangeValue,
  type RangePickerValue,
  validateCustomDayRange,
} from '../lib/range-picker'

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
  value: RangePickerValue
  onChange: (value: RangePickerValue) => void
  className?: string
}) {
  const customOpenId = useId()
  const activePreset = isCustomRange(value) ? null : value
  const [showCustom, setShowCustom] = useState(isCustomRange(value))
  const [fromDate, setFromDate] = useState(isCustomRange(value) ? value.fromDate : '')
  const [toDate, setToDate] = useState(isCustomRange(value) ? value.toDate : '')
  const [customError, setCustomError] = useState<string | null>(null)

  useEffect(() => {
    if (isCustomRange(value)) {
      setFromDate(value.fromDate)
      setToDate(value.toDate)
      setShowCustom(true)
    }
  }, [value])

  const applyCustom = () => {
    const fromDay = calendarDayFromDateInput(fromDate)
    const toDay = calendarDayFromDateInput(toDate)
    if (fromDay == null || toDay == null) {
      setCustomError('Chọn ngày hợp lệ.')
      return
    }
    const err = validateCustomDayRange(fromDay, toDay)
    if (err) {
      setCustomError(err)
      return
    }
    setCustomError(null)
    const next: CustomRangeValue = { mode: 'custom', fromDay, toDay, fromDate, toDate }
    onChange(next)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              setShowCustom(false)
              setCustomError(null)
              onChange(preset.id)
            }}
            className={cn(
              'rounded-md border border-border px-3 py-1.5 text-sm',
              activePreset === preset.id ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60',
            )}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom((open) => !open)}
          className={cn(
            'rounded-md border border-border px-3 py-1.5 text-sm',
            showCustom ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60',
          )}
        >
          Tuỳ chọn
        </button>
      </div>
      {showCustom ? (
        <div className="flex flex-wrap items-end gap-2 rounded-md border border-border p-3">
          <label className="text-xs text-muted-foreground">
            Từ
            <input
              id={`${customOpenId}-from`}
              type="date"
              className="mt-1 block rounded-md border border-border bg-background px-2 py-1 text-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Đến
            <input
              id={`${customOpenId}-to`}
              type="date"
              className="mt-1 block rounded-md border border-border bg-background px-2 py-1 text-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onClick={applyCustom}>
            Áp dụng
          </button>
          {customError ? <p className="w-full text-xs text-destructive">{customError}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

export type { RangePickerValue, CustomRangeValue }
export { resolveRangeDays, isCustomRange } from '../lib/range-picker'