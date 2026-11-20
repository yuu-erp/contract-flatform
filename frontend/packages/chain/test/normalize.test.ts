import { describe, expect, it } from 'vitest'
import { asNumber, asRecord, asString, unwrapValue } from '../src/normalize'

describe('normalize', () => {
  it('unwraps {"": value}', () => {
    expect(unwrapValue({ '': 42 })).toBe(42)
    expect(unwrapValue({ '': '0xabc' })).toBe('0xabc')
  })

  it('maps tuple array to record fields', () => {
    const record = asRecord(['1', '0xOwner', 3], ['id', 'owner', 'status'] as const)
    expect(record.id).toBe('1')
    expect(record.owner).toBe('0xOwner')
    expect(record.status).toBe(3)
  })

  it('maps named tuple object', () => {
    const record = asRecord({ id: 7, owner: '0xA', status: 1 }, ['id', 'owner', 'status'] as const)
    expect(asString(record.id)).toBe('7')
    expect(asNumber(record.status)).toBe(1)
  })

  it('fills numeric index keys on hybrid objects', () => {
    const record = asRecord({ 0: 'x', owner: '0xB' }, ['name', 'owner'] as const)
    expect(record.name).toBe('x')
    expect(record.owner).toBe('0xB')
  })
})