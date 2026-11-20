import type { AbiItem } from '@metanodejs/system-core'
import platformAccessAbiJson from '../../../../abi/PlatformAccess.json'
import agentRegistryAbiJson from '../../../../abi/AgentRegistry.json'
import branchRegistryAbiJson from '../../../../abi/BranchRegistry.json'
import agentAccessAbiJson from '../../../../abi/AgentAccess.json'
import salesSettingsAbiJson from '../../../../abi/SalesSettings.json'
import ledgerAbiJson from '../../../../abi/Ledger.json'
import historyIndexAbiJson from '../../../../abi/HistoryIndex.json'

export type AbiParam = {
  name?: string
  type?: string
  components?: AbiParam[]
}

export type AbiEntry = {
  type?: string
  name?: string
  inputs?: AbiParam[]
  outputs?: AbiParam[]
  stateMutability?: string
}

function functionMap(abi: AbiEntry[]): Record<string, AbiItem> {
  return abi.reduce(
    (acc, item) => {
      if (item.type === 'function' && item.name) acc[item.name] = item as AbiItem
      return acc
    },
    {} as Record<string, AbiItem>,
  )
}

export const platformAccessAbi = platformAccessAbiJson as AbiEntry[]
export const agentRegistryAbi = agentRegistryAbiJson as AbiEntry[]
export const branchRegistryAbi = branchRegistryAbiJson as AbiEntry[]
export const agentAccessAbi = agentAccessAbiJson as AbiEntry[]
export const salesSettingsAbi = salesSettingsAbiJson as AbiEntry[]
export const ledgerAbi = ledgerAbiJson as AbiEntry[]
export const historyIndexAbi = historyIndexAbiJson as AbiEntry[]

export const platformAccessABI = functionMap(platformAccessAbi)
export const agentRegistryABI = functionMap(agentRegistryAbi)
export const branchRegistryABI = functionMap(branchRegistryAbi)
export const agentAccessABI = functionMap(agentAccessAbi)
export const salesSettingsABI = functionMap(salesSettingsAbi)
export const ledgerABI = functionMap(ledgerAbi)
export const historyIndexABI = functionMap(historyIndexAbi)

export const allAbis: AbiEntry[] = [
  ...platformAccessAbi,
  ...agentRegistryAbi,
  ...branchRegistryAbi,
  ...agentAccessAbi,
  ...salesSettingsAbi,
  ...ledgerAbi,
  ...historyIndexAbi,
]