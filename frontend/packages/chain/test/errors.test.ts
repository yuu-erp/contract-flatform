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

  it('decodes additional access errors by name', () => {
    expect(decodeContractError(new Error('NotAuthorized(0x01,5)'))).toMatch(/quyền trên chi nhánh/)
    expect(decodeContractError(new Error('AccountHasAgentRole'))).toMatch(/admin nền tảng/)
    expect(decodeContractError(new Error('OwnerIsAgentMember'))).toMatch(/thành viên agent/)
  })

  it('đọc selector từ error.data RPC Code 3', () => {
    const selector = `0x${keccak256Hex('InvalidSortSlot()').slice(0, 8)}`
    expect(decodeContractError({ code: 3, message: 'execution reverted', data: selector })).toBe(
      'sortSlot FullDB không hợp lệ (0–15).',
    )
  })

  it('prefers InvalidServices over InvalidService substring', () => {
    expect(decodeContractError(new Error('revert InvalidServices()'))).toBe(
      'Phải có NET hoặc IQR.',
    )
  })
})