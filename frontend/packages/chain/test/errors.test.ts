import { describe, expect, it } from 'vitest'
import { decodeContractError } from '../src/errors'
import { keccak256Hex } from '../src/keccak256'

describe('decodeContractError', () => {
  it('decodes InsufficientBalance by selector', () => {
    const selector = `0x${keccak256Hex('InsufficientBalance(uint128,uint128)').slice(0, 8)}`
    expect(decodeContractError({ message: `reverted ${selector}` })).toMatch(/số dư|InsufficientBalance/i)
  })

  it('decodes MethodNotEnabled by name fallback', () => {
    expect(decodeContractError(new Error('MethodNotEnabled(7,2)'))).toMatch(/phương thức|MethodNotEnabled/i)
  })
})