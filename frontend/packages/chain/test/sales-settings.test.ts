import { describe, expect, it } from 'vitest'
import {
  BRANCH_PAYMENT_FOLLOW_AGENT,
  DEFAULT_AGENT_PAYMENT_METHODS,
  PAYMENT_CASH,
  PAYMENT_WALLET,
  PercentParseError,
  effectiveBranchPaymentMethods,
  parsePercentToBps,
} from '../src/sales-settings'

describe('parsePercentToBps', () => {
  it('parsePercentToBps("8,5") == 850', () => {
    expect(parsePercentToBps('8,5')).toBe(850)
  })

  it('"100" == 10000', () => {
    expect(parsePercentToBps('100')).toBe(10_000)
  })

  it('"100,01" lỗi', () => {
    expect(() => parsePercentToBps('100,01')).toThrow(PercentParseError)
  })
})

describe('payment methods', () => {
  it('CASH|WALLET == 9', () => {
    expect(PAYMENT_CASH | PAYMENT_WALLET).toBe(9)
    expect(DEFAULT_AGENT_PAYMENT_METHODS).toBe(9)
  })

  it('Theo agent = 0', () => {
    expect(BRANCH_PAYMENT_FOLLOW_AGENT).toBe(0)
  })

  it('tập hiệu lực chi nhánh = (chi nhánh || agent) & agent', () => {
    expect(effectiveBranchPaymentMethods(0, 9)).toBe(9)
    expect(effectiveBranchPaymentMethods(8, 9)).toBe(8)
    expect(effectiveBranchPaymentMethods(2, 9)).toBe(0)
    expect(effectiveBranchPaymentMethods(6, 1)).toBe(0)
    expect(effectiveBranchPaymentMethods(0, 1)).toBe(1)
  })
})