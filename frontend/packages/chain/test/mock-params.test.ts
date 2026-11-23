import { describe, expect, it } from 'vitest'
import { mockBig, mockId } from '../src/mock/mock-params'

describe('mock-params', () => {
  it('mockId chấp nhận string số', () => {
    expect(mockId('42')).toBe(42)
  })

  it('mockBig chấp nhận string và number', () => {
    expect(mockBig('100000')).toBe(100_000n)
    expect(mockBig(100_000n)).toBe(100_000n)
  })
})