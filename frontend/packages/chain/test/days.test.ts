import { describe, expect, it } from 'vitest'
import { calendarDay, chunkDays, dayOf, rangeToDays } from '../src/days'

describe('days', () => {
  it('dayOf matches LedgerMetrics.t.sol', () => {
    expect(dayOf(1_767_200_399, 420)).toBe(20_453)
    expect(dayOf(1_767_200_400, 420)).toBe(20_454)
    expect(dayOf(90_000, -60)).toBe(1)
  })

  it('chunkDays splits beyond 93-day rollup limit', () => {
    expect(chunkDays(0, 199)).toEqual([
      [0, 92],
      [93, 185],
      [186, 199],
    ])
  })

  it('rangeToDays thisMonth/lastMonth with UTC+7 at month boundary', () => {
    const tz = 420
    const now = new Date('2026-11-30T17:30:00.000Z')
    const dec1 = calendarDay(2026, 11, 1)
    const nov1 = calendarDay(2026, 10, 1)
    const nov30 = calendarDay(2026, 10, 30)
    expect(rangeToDays('today', tz, now)).toEqual({
      fromDay: dayOf(Math.floor(now.getTime() / 1000), tz),
      toDay: dayOf(Math.floor(now.getTime() / 1000), tz),
    })
    expect(rangeToDays('thisMonth', tz, now)).toEqual({ fromDay: dec1, toDay: dec1 })
    expect(rangeToDays('lastMonth', tz, now)).toEqual({ fromDay: nov1, toDay: nov30 })
    const week = rangeToDays('7d', tz, now)
    expect(week.toDay - week.fromDay).toBe(6)
  })

  it('rangeToDays thisMonth with negative tz before UTC midnight', () => {
    const tz = -300
    const now = new Date('2026-12-01T03:00:00.000Z')
    const nov1 = calendarDay(2026, 10, 1)
    const nov30 = calendarDay(2026, 10, 30)
    expect(rangeToDays('thisMonth', tz, now)).toEqual({
      fromDay: nov1,
      toDay: nov30,
    })
  })

  it('custom date range preserves dayOf on both ends', () => {
    const tz = 420
    const from = new Date('2026-06-01T00:00:00.000Z')
    const to = new Date('2026-06-15T12:00:00.000Z')
    const range = rangeToDays({ from, to }, tz)
    expect(range.fromDay).toBe(dayOf(Math.floor(from.getTime() / 1000), tz))
    expect(range.toDay).toBe(dayOf(Math.floor(to.getTime() / 1000), tz))
  })
})