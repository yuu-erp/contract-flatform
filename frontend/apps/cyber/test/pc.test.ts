import { describe, expect, it } from 'vitest'
import { buildPcs } from '../src/data/mock'
import { countPcStates, LOW_TIME_SEC, occupancy, pcDisplayState, remainingRatio } from '../src/data/pc'
import type { Pc } from '../src/data/types'

const member = { id: 'm', name: 'A', phoneMasked: '', rank: 'BẠC' as const, mainBalance: 0, bonusBalance: 0 }
const playing = (remainingSec: number, extra: Partial<Pc> = {}): Pc => ({
  id: 'STD-01',
  zoneId: 'STD',
  status: 'in_use',
  session: { member, startedAt: '20:00', elapsedSec: 600, remainingSec, game: 'x' },
  ...extra,
})

describe('trạng thái máy', () => {
  it('suy ra trạng thái hiển thị', () => {
    expect(pcDisplayState(playing(LOW_TIME_SEC + 1))).toBe('playing')
    expect(pcDisplayState(playing(LOW_TIME_SEC))).toBe('low')
    expect(pcDisplayState(playing(5000, { needsHelp: true }))).toBe('help')
    expect(pcDisplayState({ id: 'a', zoneId: 'STD', status: 'reserved' })).toBe('reserved')
    expect(pcDisplayState({ id: 'a', zoneId: 'STD', status: 'maintenance' })).toBe('maintenance')
    expect(pcDisplayState({ id: 'a', zoneId: 'STD', status: 'idle' })).toBe('idle')
  })

  it('tỉ lệ còn lại của phiên', () => {
    expect(remainingRatio(playing(600))).toBe(0.5)
    expect(remainingRatio({ id: 'a', zoneId: 'STD', status: 'idle' })).toBe(0)
  })

  it('đếm trạng thái khớp tổng số máy, dữ liệu giả ổn định', () => {
    const pcs = buildPcs(21)
    const c = countPcStates(pcs)
    expect(c.total).toBe(35)
    expect(c.playing + c.low + c.idle + c.reserved + c.maintenance + c.help).toBe(c.total)
    expect(buildPcs(21)).toEqual(pcs)
    expect(occupancy(pcs)).toBeGreaterThan(0.5)
    expect(pcs.find((p) => p.id === 'VIP-07')?.session?.member.name).toBe('ShadowFox')
  })
})
