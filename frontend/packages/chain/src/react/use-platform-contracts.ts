import { useMemo } from 'react'
import { toAddress } from '../address'
import {
  AgentAccessApi,
  AgentRegistryApi,
  BranchRegistryApi,
  LedgerApi,
  PlatformAccessApi,
  SalesSettingsApi,
} from '../api'
import { loadAddresses, type PlatformAddresses } from '../config/loadAddresses'
import { AgentAccessContract } from '../contracts/agent-access.contract'
import { AgentRegistryContract } from '../contracts/agent-registry.contract'
import { BranchRegistryContract } from '../contracts/branch-registry.contract'
import { HistoryIndexContract } from '../contracts/history-index.contract'
import { LedgerContract } from '../contracts/ledger.contract'
import { PlatformAccessContract } from '../contracts/platform-access.contract'
import { SalesSettingsContract } from '../contracts/sales-settings.contract'
import { type PlatformContracts } from './contracts-context'
import { useActiveWallet } from './use-active-wallet'

/**
 * Từ ví đang chọn + JSON deployments (Vite import), dựng `PlatformContracts` cho `ContractsProvider`.
 */
export function usePlatformContracts(
  chainId: number,
  deployments: Record<string, unknown>,
): PlatformContracts | null {
  const { data: wallet } = useActiveWallet()
  const addresses: PlatformAddresses = useMemo(
    () => loadAddresses(chainId, deployments),
    [chainId, deployments],
  )
  const from = wallet?.address ? toAddress(wallet.address) : ''

  return useMemo(() => {
    if (!from) return null
    return {
      addresses,
      from,
      access: new PlatformAccessApi(new PlatformAccessContract(from, addresses.access)),
      agents: new AgentRegistryApi(new AgentRegistryContract(from, addresses.agents)),
      branches: new BranchRegistryApi(new BranchRegistryContract(from, addresses.branches)),
      agentAccess: new AgentAccessApi(new AgentAccessContract(from, addresses.agentAccess)),
      salesSettings: new SalesSettingsApi(new SalesSettingsContract(from, addresses.salesSettings)),
      ledger: new LedgerApi(new LedgerContract(from, addresses.ledger)),
      history: new HistoryIndexContract(from, addresses.history),
    }
  }, [from, addresses])
}