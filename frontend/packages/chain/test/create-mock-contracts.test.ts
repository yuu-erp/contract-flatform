import { describe, expect, it } from 'vitest'
import { METRIC } from '../src/metrics'
import { SERVICE_NET } from '../src/sales-settings'
import { Role } from '../src/roles'
import { buildMockState, createMockContracts, PREVIEW_WALLETS } from '../src/mock'

const SERVED = new Set([
  METRIC.netServedHere,
  METRIC.iqrServedHere,
  METRIC.netServedHereRefund,
  METRIC.iqrServedHereRefund,
])

function sumRows(rows: bigint[][]): bigint[] {
  const acc = Array.from({ length: 32 }, () => 0n)
  for (const row of rows) {
    for (let i = 0; i < 32; i++) acc[i] = (acc[i] ?? 0n) + (row[i] ?? 0n)
  }
  return acc
}

describe('createMockContracts', () => {
  it('dữ liệu tất định theo seed', async () => {
    const c = createMockContracts(42)
    expect(await c.agents.agentCount()).toBe(12)
    const state = buildMockState(42)
    expect(state.branches.length).toBe(30)
    expect(state.docs.filter((d) => d.kind === 'ledger').length).toBe(60)
    expect(state.docs.filter((d) => d.kind === 'platform_audit').length).toBe(40)
    expect(state.admins).toHaveLength(3)
    expect(state.poster.mask).toBe(0x6c)
    expect(state.poster.moduleId).toBe(1)
  })

  it('giao dịch giả chờ ~800ms', async () => {
    const c = createMockContracts(1, '0x0000000000000000000000000000000000001001')
    const t0 = Date.now()
    await c.access.pause()
    expect(Date.now() - t0).toBeGreaterThanOrEqual(750)
  })

  it('địa chỉ 0xdead → lỗi', async () => {
    const c = createMockContracts(1)
    await expect(c.access.addPlatformAdmin('0xdead0000000000000000000000000000000001')).rejects.toThrow()
  })

  it('trạng thái agent hợp lệ (1/2/3)', () => {
    const state = buildMockState(42)
    for (const agent of state.agents) {
      expect([1, 2, 3]).toContain(agent.status)
    }
  })

  it('tổng rollup chi nhánh = rollup agent (trừ served-here)', () => {
    const state = buildMockState(42)
    for (const agent of state.agents) {
      const agentRows = state.rollups.get(`1:${agent.id}`)!
      const agentTotals = sumRows(agentRows)
      const branchIds = state.branches.filter((b) => b.agentId === agent.id).map((b) => b.id)
      const branchTotals = Array.from({ length: 32 }, () => 0n)
      for (const bid of branchIds) {
        const part = sumRows(state.rollups.get(`2:${bid}`)!)
        for (let i = 0; i < 32; i++) branchTotals[i] = (branchTotals[i] ?? 0n) + (part[i] ?? 0n)
      }
      for (let i = 0; i < 32; i++) {
        if (SERVED.has(i)) continue
        expect(branchTotals[i]).toBe(agentTotals[i])
      }
    }
  })

  it('API: mọi chi nhánh getBranch/getBranchProfile với id string', async () => {
    const c = createMockContracts(42)
    const state = buildMockState(42)
    for (const b of state.branches) {
      const id = String(b.id)
      const row = await c.branches.getBranch(id)
      expect(row.id).toBe(b.id)
      const profile = await c.branches.getBranchProfile(id)
      expect(profile.branchId).toBe(b.id)
      expect(profile.domain.length).toBeGreaterThan(0)
    }
  })

  it('API: manager3001 có effectiveRoleOf >= Manager ở chi nhánh 1', async () => {
    const c = createMockContracts(42)
    const role = await c.agentAccess.effectiveRoleOf('1', PREVIEW_WALLETS.agentManager)
    expect(role).toBeGreaterThanOrEqual(Role.Manager)
  })

  it('API: quoteTax branch 1 NET 100.000đ đã gồm 8%', async () => {
    const c = createMockContracts(42, PREVIEW_WALLETS.agentOwner1)
    const q = await c.salesSettings.quoteTax(1, SERVICE_NET, 100_000n)
    expect(q.bps).toBe(800)
    expect(q.exclusive).toBe(false)
    expect(q.tax).toBe(7_407n)
    expect(q.total).toBe(100_000n)
  })

  it('tổng rollup agent = rollup nền tảng (trừ served-here)', () => {
    const state = buildMockState(42)
    const platformTotals = sumRows(state.rollups.get('0:0')!)
    const agentTotals = Array.from({ length: 32 }, () => 0n)
    for (const agent of state.agents) {
      const part = sumRows(state.rollups.get(`1:${agent.id}`)!)
      for (let i = 0; i < 32; i++) agentTotals[i] = (agentTotals[i] ?? 0n) + (part[i] ?? 0n)
    }
    for (let i = 0; i < 32; i++) {
      if (SERVED.has(i)) continue
      expect(platformTotals[i]).toBe(agentTotals[i])
    }
  })
})