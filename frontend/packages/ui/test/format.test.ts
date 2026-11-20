import { describe, expect, it } from 'vitest'
import { formatBps, formatVnd } from '../src/lib/format'

describe('format', () => {
  it('formatVnd uses vi-VN grouping and regular space before currency', () => {
    expect(formatVnd(1_234_567n)).toBe('1.234.567 ₫')
  })

  it('formatBps shows percent with two decimals', () => {
    expect(formatBps(800)).toBe('8,00%')
    expect(formatBps(0)).toBe('0,00%')
  })
})