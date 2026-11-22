import { describe, expect, it } from 'vitest'
import { auditDateRangeFromIso } from '../src/domain/lib/audit-date-range'

describe('auditDateRangeFromIso', () => {
  it('chỉ từ ngày → đến hiện tại', () => {
    const r = auditDateRangeFromIso('2024-01-01', undefined)
    expect(r.fromTs).toBe(Math.floor(new Date('2024-01-01T00:00:00').getTime() / 1000))
    expect(r.toTs).toBeGreaterThan(r.fromTs!)
  })

  it('chỉ đến ngày → từ 0', () => {
    const r = auditDateRangeFromIso(undefined, '2024-06-01')
    expect(r.fromTs).toBe(0)
    expect(r.toTs).toBe(Math.floor(new Date('2024-06-01T23:59:59').getTime() / 1000))
  })
})