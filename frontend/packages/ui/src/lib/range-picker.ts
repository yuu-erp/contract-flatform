import { calendarDay, rangeToDays, type Day, type RangePreset } from '@meta-platform/chain'

export const MAX_CUSTOM_RANGE_DAYS = 366

export type CustomRangeValue = {
  mode: 'custom'
  fromDay: Day
  toDay: Day
  fromDate: string
  toDate: string
}

export type RangePickerValue = RangePreset | CustomRangeValue

export function isCustomRange(value: RangePickerValue): value is CustomRangeValue {
  return typeof value === 'object' && value !== null && 'mode' in value && value.mode === 'custom'
}

/** `YYYY-MM-DD` → ngày kinh doanh theo lịch (Y,M,D), không phụ thuộc TZ trình duyệt. */
export function calendarDayFromDateInput(value: string): Day | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  if (!Number.isFinite(year + month + day)) return null
  return calendarDay(year, month, day)
}

export function validateCustomDayRange(fromDay: Day, toDay: Day): string | null {
  if (fromDay > toDay) return 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.'
  const span = toDay - fromDay + 1
  if (span > MAX_CUSTOM_RANGE_DAYS) return `Khoảng tối đa ${MAX_CUSTOM_RANGE_DAYS} ngày.`
  return null
}

export function resolveRangeDays(
  value: RangePickerValue,
  tzMinutes: number,
  now = new Date(),
): { fromDay: Day; toDay: Day } {
  if (isCustomRange(value)) return { fromDay: value.fromDay, toDay: value.toDay }
  return rangeToDays(value, tzMinutes, now)
}
