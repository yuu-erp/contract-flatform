import { describe, expect, it } from 'vitest'
import { formatAuditBytes } from '../src/lib/audit-display'

describe('formatAuditBytes', () => {
  it('trống hoặc 0x → gạch ngang', () => {
    expect(formatAuditBytes('0x')).toBe('—')
    expect(formatAuditBytes('')).toBe('—')
  })

  it('hiển thị hex rút gọn khi không giải mã được', () => {
    const hex = `0x${'ab'.repeat(40)}`
    const text = formatAuditBytes(hex)
    expect(text.startsWith('0x')).toBe(true)
    expect(text.length).toBeLessThan(hex.length)
  })
})