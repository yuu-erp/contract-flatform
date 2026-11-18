import type { AbiItem } from '@metanodejs/system-core'
import agentAccessAbiJson from '@abi/AgentAccess.json'
import agentRegistryAbiJson from '@abi/AgentRegistry.json'
import branchRegistryAbiJson from '@abi/BranchRegistry.json'
import platformAccessAbiJson from '@abi/PlatformAccess.json'

export type PlatformAbiParam = {
  name?: string
  type?: string
  components?: PlatformAbiParam[]
}

export type PlatformAbiEntry = {
  type?: string
  name?: string
  inputs?: PlatformAbiParam[]
  outputs?: PlatformAbiParam[]
  stateMutability?: string
}

function functionMap(abi: PlatformAbiEntry[]): Record<string, AbiItem> {
  return abi.reduce(
    (acc, item) => {
      if (item.type === 'function' && item.name) acc[item.name] = item as AbiItem
      return acc
    },
    {} as Record<string, AbiItem>,
  )
}

export const agentAccessAbi = agentAccessAbiJson as PlatformAbiEntry[]
export const agentRegistryAbi = agentRegistryAbiJson as PlatformAbiEntry[]
export const branchRegistryAbi = branchRegistryAbiJson as PlatformAbiEntry[]
export const platformAccessAbi = platformAccessAbiJson as PlatformAbiEntry[]

export const agentAccessABI = functionMap(agentAccessAbi)
export const agentRegistryABI = functionMap(agentRegistryAbi)
export const branchRegistryABI = functionMap(branchRegistryAbi)
export const platformAccessABI = functionMap(platformAccessAbi)

export const platformErrorAbi = [
  ...agentAccessAbi,
  ...agentRegistryAbi,
  ...branchRegistryAbi,
  ...platformAccessAbi,
]
