import { describe, expect, it } from 'vitest'
import { isReasonBytesValid, utf8Length } from '../src/lib/format'

describe('utf8Length / reason bytes', () => {
  it('counts Vietnamese bytes correctly', () => {
    expect(utf8Length('Quận 1')).toBe(8)
  })

  it('rejects 100 ê chars (300 bytes)', () => {
    const text = 'ệ'.repeat(100)
    expect(utf8Length(text)).toBe(300)
    expect(isReasonBytesValid(text)).toBe(false)
  })

  it('accepts 200 ASCII chars (200 bytes)', () => {
    const text = 'a'.repeat(200)
    expect(isReasonBytesValid(text)).toBe(true)
  })
})