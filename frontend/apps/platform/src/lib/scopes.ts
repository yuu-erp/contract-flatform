export {
  PLATFORM_TZ_MINUTES,
  SCOPE_PLATFORM,
  SCOPE_AGENT,
  SCOPE_BRANCH,
} from '@meta-platform/ui'

export const AGENTS_PAGE_SIZE = 20

export function previousDayRange(fromDay: number, toDay: number): { fromDay: number; toDay: number } {
  const span = toDay - fromDay + 1
  return { fromDay: fromDay - span, toDay: fromDay - 1 }
}