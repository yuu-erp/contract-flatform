import type { Day } from './metrics'

const SECONDS_PER_DAY = 86_400
const MS_PER_DAY = 86_400_000

export function dayOf(ts: number, tzMinutes: number): Day {
  const local = ts + tzMinutes * 60
  if (local < 0) return 0
  return Math.floor(local / SECONDS_PER_DAY)
}

export type RangePreset = 'today' | '7d' | '30d' | 'thisMonth' | 'lastMonth'

export type RangeInput = RangePreset | { from: Date; to: Date }

export function chunkDays(fromDay: Day, toDay: Day, max = 93): [Day, Day][] {
  const chunks: [Day, Day][] = []
  let start = fromDay
  while (start <= toDay) {
    const end = Math.min(start + max - 1, toDay)
    chunks.push([start, end])
    start = end + 1
  }
  return chunks
}

function startOfDayEpoch(day: Day, tzMinutes: number): number {
  return day * SECONDS_PER_DAY - tzMinutes * 60
}

export function dayToDate(day: Day, tzMinutes: number): Date {
  return new Date((startOfDayEpoch(day, tzMinutes) + tzMinutes * 60) * 1000)
}

/** Ngày kinh doanh của lịch (Y, M, D) địa phương = UTC epoch ngày đó / 86 400 000. */
export function calendarDay(year: number, month: number, day: number): Day {
  return Math.floor(Date.UTC(year, month, day) / MS_PER_DAY)
}

export function localCalendarParts(now: Date, tzMinutes: number): { year: number; month: number; date: number } {
  const shifted = new Date(now.getTime() + tzMinutes * 60_000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    date: shifted.getUTCDate(),
  }
}

function monthCalendarRange(year: number, month: number): { fromDay: Day; toDay: Day } {
  const fromDay = calendarDay(year, month, 1)
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const toDay = calendarDay(year, month, daysInMonth)
  return { fromDay, toDay }
}

export function rangeToDays(
  input: RangeInput,
  tzMinutes: number,
  now = new Date(),
): { fromDay: Day; toDay: Day } {
  const nowSec = Math.floor(now.getTime() / 1000)
  const today = dayOf(nowSec, tzMinutes)
  if (typeof input === 'object' && 'from' in input) {
    return {
      fromDay: dayOf(Math.floor(input.from.getTime() / 1000), tzMinutes),
      toDay: dayOf(Math.floor(input.to.getTime() / 1000), tzMinutes),
    }
  }
  switch (input) {
    case 'today':
      return { fromDay: today, toDay: today }
    case '7d':
      return { fromDay: today - 6, toDay: today }
    case '30d':
      return { fromDay: today - 29, toDay: today }
    case 'thisMonth': {
      const { year, month } = localCalendarParts(now, tzMinutes)
      const { fromDay, toDay } = monthCalendarRange(year, month)
      return { fromDay, toDay: Math.min(toDay, today) }
    }
    case 'lastMonth': {
      const { year, month } = localCalendarParts(now, tzMinutes)
      let y = year
      let m = month - 1
      if (m < 0) {
        m = 11
        y -= 1
      }
      return monthCalendarRange(y, m)
    }
    default:
      return { fromDay: today, toDay: today }
  }
}