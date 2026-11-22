import { describe, expect, it } from 'vitest'
import { pageOffset, paginateAgents } from '../src/lib/pagination'

describe('pageOffset / paginateAgents', () => {
  it('trang 0 → offset 0', () => {
    expect(pageOffset(0, 20)).toBe(0)
    expect(pageOffset(1, 20)).toBe(20)
  })

  it('paginateAgents trang 0 lấy 20 phần tử đầu', () => {
    const rows = Array.from({ length: 30 }, (_, i) => i)
    const { items, page } = paginateAgents(rows, 0, 20)
    expect(page).toBe(0)
    expect(items[0]).toBe(0)
    expect(items).toHaveLength(20)
  })
})