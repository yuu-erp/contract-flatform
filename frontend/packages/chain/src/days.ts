import type { Day } from './metrics'

const SECONDS_PER_DAY = 86_400

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

function monthRange(year: number, month: number, tzMinutes: number): { fromDay: Day; toDay: Day } {
  const from = new Date(Date.UTC(year, month, 1))
  const to = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59))
  return {
    fromDay: dayOf(Math.floor(from.getTime() / 1000), tzMinutes),
    toDay: dayOf(Math.floor(to.getTime() / 1000), tzMinutes),
  }
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
      const y = now.getUTCFullYear()
      const m = now.getUTCMonth()
      const { fromDay, toDay } = monthRange(y, m, tzMinutes)
      return { fromDay, toDay: Math.min(toDay, today) }
    }
    case 'lastMonth': {
      const y = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear()
      const m = now.getUTCMonth() === 0 ? 11 : now.getUTCMonth() - 1
      return monthRange(y, m, tzMinutes)
    }
    default:
      return { fromDay: today, toDay: today }
  }
}