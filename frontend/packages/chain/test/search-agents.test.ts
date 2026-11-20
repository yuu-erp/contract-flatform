import { describe, expect, it } from 'vitest'
import { filterAgentsByServiceMask, matchAgent } from '../src/search-agents'

const sample = {
  id: 12,
  owner: '0xAbC000000000000000000000000000000000dEf',
  status: 1,
  allowedServices: 3,
  profileName: 'Cyber Quận 1',
  storePhone: '028 3822 0000',
  storeAddress: '123 Nguyễn Huệ',
}

describe('matchAgent', () => {
  it('matches folded name, phone digits, owner case, and id', () => {
    expect(matchAgent(sample, 'cyber quan 1')).toBe(true)
    expect(matchAgent(sample, '0283822')).toBe(true)
    expect(matchAgent(sample, '0xabc')).toBe(true)
    expect(matchAgent(sample, '12')).toBe(true)
    expect(matchAgent(sample, '99')).toBe(false)
  })

  it('filters by service mask', () => {
    const rows = [
      { ...sample, id: 1, allowedServices: 1 },
      { ...sample, id: 2, allowedServices: 2 },
    ]
    expect(filterAgentsByServiceMask(rows, 2)).toHaveLength(1)
    expect(filterAgentsByServiceMask(rows, 1)[0].id).toBe(1)
  })
})