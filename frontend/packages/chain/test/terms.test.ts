import { describe, expect, it } from 'vitest'
import { termAddress } from '../src/search'

describe('search terms', () => {
  it('termAddress uses lowercase hex with 0x', () => {
    expect(termAddress('W', '0xAbCdEf0123456789012345678901234567890ABCD')).toEqual({
      prefix: 'W',
      value: '0xabcdef0123456789012345678901234567890abcd',
    })
  })
})