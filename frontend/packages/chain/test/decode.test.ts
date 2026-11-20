import { describe, expect, it } from 'vitest'
import { encodeAbiParameters, parseAbiParameters } from 'viem'
import { decodeLedgerRecord } from '../src/decode'

const ledgerTuple =
  '(uint8 version, uint8 kind, bytes32 refId, bytes32 originalRefId, uint64 agentId, uint64 branchId, address customer, uint16 service, uint8 method, uint128 amount, uint128 discount, uint128 tax, (uint64 branchId, uint128 amount)[] portions, address actor, uint64 shiftId, string reason, uint64 timestamp)'

describe('decodeLedgerRecord', () => {
  it('round-trips LedgerRecord with two portions', () => {
    const value = {
      version: 1,
      kind: 3,
      refId: `0x${'ab'.repeat(32)}`,
      originalRefId: `0x${'00'.repeat(32)}`,
      agentId: 10n,
      branchId: 20n,
      customer: '0x03EAa08274B9A4155D27652991Fbd9E1cb304027',
      service: 1,
      method: 8,
      amount: 100_000n,
      discount: 5_000n,
      tax: 9_090n,
      portions: [
        { branchId: 20n, amount: 60_000n },
        { branchId: 21n, amount: 40_000n },
      ],
      actor: '0x0000000000000000000000000000000000000001',
      shiftId: 99n,
      reason: 'test reason',
      timestamp: 1_767_000_000n,
    }
    const encoded = encodeAbiParameters(parseAbiParameters(ledgerTuple), [value])
    const decoded = decodeLedgerRecord(encoded)
    expect(decoded.version).toBe(1)
    expect(decoded.kind).toBe(3)
    expect(decoded.agentId).toBe(10)
    expect(decoded.branchId).toBe(20)
    expect(decoded.amount).toBe(100_000n)
    expect(decoded.discount).toBe(5_000n)
    expect(decoded.tax).toBe(9_090n)
    expect(decoded.portions).toHaveLength(2)
    expect(decoded.portions[0].branchId).toBe(20)
    expect(decoded.portions[0].amount).toBe(60_000n)
    expect(decoded.portions[1].branchId).toBe(21)
    expect(decoded.reason).toBe('test reason')
    expect(decoded.timestamp).toBe(1_767_000_000)
  })
})