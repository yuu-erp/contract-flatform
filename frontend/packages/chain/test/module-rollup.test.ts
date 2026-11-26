import { describe, expect, it } from 'vitest'
import { mergeModuleRollups } from '../src/api/mappers'

describe('mergeModuleRollups (ADR 0031)', () => {
  it('ghép bộ đếm NET, IQR về hàng 32 ô cũ', () => {
    const base = [Array.from({ length: 32 }, (_, i) => (i < 10 ? BigInt(i + 1) : 0n))]
    const net = [[100n, 101n, 102n, 103n, 104n, 105n, 106n, 107n, 108n]]
    const iqr = [[200n, 201n, 202n, 203n, 204n, 205n, 206n, 207n, 208n]]
    const [row] = mergeModuleRollups(base, net, iqr)
    expect(row!.slice(0, 10)).toEqual(base[0]!.slice(0, 10))
    expect(row![10]).toBe(100n) // NET gross
    expect(row![17]).toBe(107n) // NET served here
    expect(row![18]).toBe(200n) // IQR gross
    expect(row![25]).toBe(207n)
    expect(row![26]).toBe(108n) // NET served-here refund
    expect(row![27]).toBe(208n)
  })
})
