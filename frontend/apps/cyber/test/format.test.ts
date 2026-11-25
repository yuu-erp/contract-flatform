import { describe, expect, it } from 'vitest'
import { formatDelta, formatHm, formatHms, formatVnd, formatXu } from '../src/data/format'

describe('format', () => {
  it('tiền và xu', () => {
    expect(formatVnd(18_420_000)).toBe('18.420.000 ₫')
    expect(formatXu(26_500)).toBe('26.500 xu')
  })
  it('thời gian', () => {
    expect(formatHm(6392)).toBe('1:46')
    expect(formatHms(6392)).toBe('01:46:32')
    expect(formatHms(-5)).toBe('00:00:00')
  })
  it('phần trăm thay đổi', () => {
    expect(formatDelta(12.4)).toBe('▲ 12,4%')
    expect(formatDelta(-3)).toBe('▼ 3%')
  })
})
