import { describe, expect, it } from 'vitest'
import { parseHistorySearchPage } from '../src/search'

describe('parseHistorySearchPage', () => {
  it('object phẳng total/docIds/data', () => {
    const page = parseHistorySearchPage({ total: '2', docIds: ['10', '11'], data: ['0xab', '0xcd'] })
    expect(page.total).toBe('2')
    expect(page.docIds).toEqual(['10', '11'])
  })

  it('bọc trong page', () => {
    const page = parseHistorySearchPage({ page: { total: 1, docIds: [3], data: ['0x12'] } })
    expect(page.total).toBe(1)
    expect(page.docIds).toEqual([3])
  })

  it('tuple theo thứ tự ABI', () => {
    const page = parseHistorySearchPage([5, [1, 2], ['0xaa']])
    expect(page.total).toBe(5)
    expect(page.docIds).toEqual([1, 2])
    expect(page.data).toEqual(['0xaa'])
  })
})