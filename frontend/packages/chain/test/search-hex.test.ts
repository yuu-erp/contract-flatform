import { describe, expect, it } from 'vitest'
import { asHexData } from '../src/normalize'
import { termAuditAgent } from '../src/search'

describe('search helpers', () => {
  it('asHexData normalizes Uint8Array and hex string', () => {
    expect(asHexData('0xAbCd')).toBe('0xabcd')
    expect(asHexData(new Uint8Array([0xde, 0xad]))).toBe('0xdead')
    expect(asHexData([255, 0])).toBe('0xff00')
  })

  it('termAuditAgent uses G prefix for audit', () => {
    expect(termAuditAgent(12)).toEqual({ prefix: 'G', value: '12' })
  })
})