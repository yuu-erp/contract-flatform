import { describe, expect, it } from 'vitest'
import { loadAddresses, parsePlatformDeployments } from '../src/config/loadAddresses'

describe('loadAddresses', () => {
  it('throws naming missing ledgerProxy', () => {
    expect(() =>
      parsePlatformDeployments({
        accessProxy: '0x1',
        agentsProxy: '0x2',
        branchesProxy: '0x3',
        historyProxy: '0x4',
        agentAccessProxy: '0x5',
        salesSettingsProxy: '0x6',
        chainId: 991,
      }),
    ).toThrow(/ledgerProxy/)
  })

  it('maps deployment keys to PlatformAddresses', () => {
    const addresses = parsePlatformDeployments({
      accessProxy: '0xAccess',
      agentsProxy: '0xAgents',
      branchesProxy: '0xBranches',
      historyProxy: '0xHistory',
      agentAccessProxy: '0xAgentAccess',
      salesSettingsProxy: '0xSales',
      ledgerProxy: '0xLedger',
      chainId: 991,
    })
    expect(addresses.ledger).toBe('0xLedger')
    expect(addresses.salesSettings).toBe('0xSales')
    expect(addresses.chainId).toBe(991)
  })

  it('loadAddresses requires deployment data object', () => {
    const data = {
      accessProxy: '0xAccess',
      agentsProxy: '0xAgents',
      branchesProxy: '0xBranches',
      historyProxy: '0xHistory',
      agentAccessProxy: '0xAgentAccess',
      salesSettingsProxy: '0xSales',
      ledgerProxy: '0xLedger',
      chainId: 991,
    }
    expect(loadAddresses(991, data).ledger).toBe('0xLedger')
  })
})