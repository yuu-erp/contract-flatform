import { describe, expect, it } from 'vitest'
import {
  formatAdjustDirection,
  formatLedgerKind,
  LEDGER_KIND_ADJUST,
} from '../src/domain/lib/ledger-display'

describe('formatLedgerKind / adjust direction', () => {
  it('map loại bút toán sang nhãn tiếng Việt', () => {
    expect(formatLedgerKind(1)).toBe('Nạp ví')
    expect(formatLedgerKind(3)).toBe('Bán trực tiếp')
    expect(formatLedgerKind(LEDGER_KIND_ADJUST)).toBe('Điều chỉnh')
  })

  it('method 1 = tăng, 2 = giảm khi kind = Adjust', () => {
    expect(formatAdjustDirection(LEDGER_KIND_ADJUST, 1)).toBe('Tăng')
    expect(formatAdjustDirection(LEDGER_KIND_ADJUST, 2)).toBe('Giảm')
    expect(formatAdjustDirection(3, 1)).toBeNull()
  })
})