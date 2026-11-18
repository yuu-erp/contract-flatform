import { describe, expect, it } from 'vitest'
import { explainPlatformError, selectorOf } from './errors'

describe('selector', () => {
  it('NotAuthorized(address,uint64) khớp cast sig', () => {
    expect(selectorOf('NotAuthorized(address,uint64)')).toBe('0x5b4e06c1')
  })

  it('dịch selector trong thông điệp revert', () => {
    const error = new Error('execution reverted: 0x5b4e06c1abcd')
    expect(explainPlatformError(error)).toBe('Không đủ quyền trên chi nhánh này.')
  })
})
