import { describe, expect, it } from 'vitest'
import { buildMockState, createMockContracts } from '../src/mock'

describe('createMockContracts', () => {
  it('dữ liệu tất định theo seed', async () => {
    const c = createMockContracts(42)
    expect(await c.agents.agentCount()).toBe(12)
    const state = buildMockState(42)
    expect(state.branches.length).toBe(30)
    expect(state.docs.filter((d) => d.kind === 'ledger').length).toBe(60)
    expect(state.docs.filter((d) => d.kind === 'platform_audit').length).toBe(40)
    expect(state.admins).toHaveLength(3)
    expect(state.poster.mask).toBe(0x7e)
  })

  it('giao dịch giả chờ ~800ms', async () => {
    const c = createMockContracts(1, '0x0000000000000000000000000000000000001001')
    const t0 = Date.now()
    await c.access.unpause()
    expect(Date.now() - t0).toBeGreaterThanOrEqual(750)
  })

  it('địa chỉ 0xdead → lỗi', async () => {
    const c = createMockContracts(1)
    await expect(c.access.addPlatformAdmin('0xdead0000000000000000000000000000000001')).rejects.toThrow()
  })
})