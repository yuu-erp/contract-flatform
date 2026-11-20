import { describe, expect, it } from 'vitest'
import {
  mapAgent,
  mapBranch,
  mapBranchTax,
  mapEntry,
  mapMembers,
  mapRollup,
  mapTaxQuote,
} from '../src/api/mappers'

describe('api mappers', () => {
  it('mapAgent accepts ABI array and named object', () => {
    const array = [
      5,
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
      1,
      100,
      200,
      '999',
      3,
    ]
    const object = {
      id: 5,
      owner: '0x0000000000000000000000000000000000000001',
      pendingOwner: '0x0000000000000000000000000000000000000002',
      status: 1,
      createdAt: 100,
      updatedAt: 200,
      profileDocId: 999n,
      allowedServices: 3,
    }
    const fromArray = mapAgent(array)
    const fromObject = mapAgent(object)
    expect(fromArray).toEqual(fromObject)
    expect(fromArray.profileDocId).toBe(999n)
    expect(fromArray.id).toBe(5)
  })

  it('mapBranch accepts both SDK shapes', () => {
    const fields = [7, 2, 1, 3, true, 420, '0xabc', 1, 2, '42']
    expect(mapBranch(fields).id).toBe(7)
    expect(
      mapBranch({
        id: 7,
        agentId: 2,
        status: 1,
        services: 3,
        isMain: true,
        tzOffsetMinutes: 420,
        domainHash: '0xabc',
        createdAt: 1,
        updatedAt: 2,
        profileDocId: 42n,
      }).profileDocId,
    ).toBe(42n)
  })

  it('mapMembers maps member tuples', () => {
    const members = mapMembers([
      {
        account: '0x00000000000000000000000000000000000000aa',
        role: 2,
        grantedBy: '0x00000000000000000000000000000000000000bb',
        grantedAt: 123,
      },
    ])
    expect(members).toHaveLength(1)
    expect(members[0].role).toBe(2)
    expect(members[0].grantedAt).toBe(123)
  })

  it('mapRollup keeps bigint precision for 2**100', () => {
    const day = Array.from({ length: 32 }, () => 0n)
    day[0] = 2n ** 100n
    const rolled = mapRollup([day])
    expect(rolled[0][0]).toBe(2n ** 100n)
    const sparseDay: Record<string, bigint> = { 0: 2n ** 100n }
    for (let i = 1; i < 32; i++) sparseDay[String(i)] = 0n
    expect(mapRollup([sparseDay])[0][0]).toBe(2n ** 100n)
  })

  it('mapEntry and mapTaxQuote accept array/object', () => {
    const entryArray = [4, 1, 2, 800, 3, '0x00000000000000000000000000000000000000cc', 50_000n, 0n]
    expect(mapEntry(entryArray).kind).toBe(4)
    expect(mapEntry({ kind: 4, method: 1, service: 2, taxBps: 800, branchId: 3, customer: '0xcc', amount: 50_000n, refunded: 0n }).amount).toBe(
      50_000n,
    )
    expect(mapTaxQuote([850, true, 10_000n, 110_000n])).toEqual({
      bps: 850,
      exclusive: true,
      tax: 10_000n,
      total: 110_000n,
    })
    expect(mapBranchTax([true, 800])).toEqual({ isSet: true, bps: 800 })
  })
})