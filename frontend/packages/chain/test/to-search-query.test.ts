import { describe, expect, it } from 'vitest'
import { toSearchQuery } from '../src/search'

describe('toSearchQuery', () => {
  it('mặc định sortSlot 0, không âm', () => {
    const q = toSearchQuery({})
    expect(q.sortSlot).toBe('0')
    expect(q.ascending).toBe(false)
  })

  it('giữ sortSlot tuỳ chọn', () => {
    expect(toSearchQuery({ sortSlot: 2, ascending: true }).sortSlot).toBe('2')
  })
})