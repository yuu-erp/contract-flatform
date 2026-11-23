export const PLATFORM_TZ_MINUTES = 420
export const SCOPE_PLATFORM = 0
export const SCOPE_AGENT = 1
export const SCOPE_BRANCH = 2

/** Kỳ ngay trước cùng độ dài với [fromDay, toDay]. */
export function previousDayRange(fromDay: number, toDay: number): { fromDay: number; toDay: number } {
  const span = toDay - fromDay + 1
  return { fromDay: fromDay - span, toDay: fromDay - 1 }
}