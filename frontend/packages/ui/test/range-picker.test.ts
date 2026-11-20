import { describe, expect, it } from 'vitest'
import { calendarDay } from '@meta-platform/chain'
import {
  calendarDayFromDateInput,
  validateCustomDayRange,
} from '../src/lib/range-picker'

describe('RangePicker helpers', () => {
  it('rejects more than 366 days', () => {
    const from = calendarDayFromDateInput('2026-01-01')!
    const to = calendarDayFromDateInput('2027-01-02')!
    expect(validateCustomDayRange(from, to)).toMatch(/366/)
  })

  it('maps November 2026 to calendarDay', () => {
    const from = calendarDayFromDateInput('2026-11-01')!
    const to = calendarDayFromDateInput('2026-11-30')!
    expect(from).toBe(calendarDay(2026, 10, 1))
    expect(to).toBe(calendarDay(2026, 10, 30))
    expect(validateCustomDayRange(from, to)).toBeNull()
  })
})