import { createContext, use, type PropsWithChildren } from 'react'
import type { PlatformAddresses } from '../config/loadAddresses'
import type {
  AgentAccessApi,
  AgentRegistryApi,
  BranchRegistryApi,
  LedgerApi,
  PlatformAccessApi,
  SalesSettingsApi,
} from '../api'
import type { HistoryIndexContract } from '../contracts/history-index.contract'

export type PlatformContracts = {
  addresses: PlatformAddresses
  access: PlatformAccessApi
  agents: AgentRegistryApi
  branches: BranchRegistryApi
  agentAccess: AgentAccessApi
  salesSettings: SalesSettingsApi
  ledger: LedgerApi
  history: HistoryIndexContract
  from: string
}

const ContractsContext = createContext<PlatformContracts | null>(null)

export function ContractsProvider({
  value,
  children,
}: PropsWithChildren<{ value: PlatformContracts | null }>) {
  return <ContractsContext value={value}>{children}</ContractsContext>
}

export function useContracts(): PlatformContracts | null {
  return use(ContractsContext)
}