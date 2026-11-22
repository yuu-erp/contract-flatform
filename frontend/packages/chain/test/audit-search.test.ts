import { describe, expect, it } from 'vitest'
import { buildAuditSearchQuery } from '../src/audit-search'

const SAMPLE = '0x00000000000000000000000000000000000000Ab'

describe('buildAuditSearchQuery', () => {
  it('chuẩn hoá người làm sang hex thường', () => {
    const q = buildAuditSearchQuery({ actor: SAMPLE }, 0)
    expect(q.filters).toEqual([{ prefix: 'R', value: '0x00000000000000000000000000000000000000ab' }])
  })

  it('khoảng ngày một đầu', () => {
    const q = buildAuditSearchQuery({ fromTs: 100 }, 0)
    expect(q.ranges).toEqual([{ slot: 0, min: 100n, max: 4102444800n }])
  })

  it('từ chối địa chỉ người làm không hợp lệ', () => {
    expect(() => buildAuditSearchQuery({ actor: 'not-an-address' }, 0)).toThrow('invalid_audit_actor')
  })
})