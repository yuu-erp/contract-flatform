export const PLATFORM_TZ_MINUTES = 420
export const SCOPE_PLATFORM = 0
export const SCOPE_AGENT = 1
export const AGENTS_PAGE_SIZE = 20

export function previousDayRange(fromDay: number, toDay: number): { fromDay: number; toDay: number } {
  const span = toDay - fromDay + 1
  return { fromDay: fromDay - span, toDay: fromDay - 1 }
}