import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { toAddress } from '../address'

export type PlatformAddresses = {
  chainId: number
  access: string
  agents: string
  branches: string
  history: string
  agentAccess: string
  salesSettings: string
  ledger: string
}

const REQUIRED_KEYS = [
  'accessProxy',
  'agentsProxy',
  'branchesProxy',
  'historyProxy',
  'agentAccessProxy',
  'salesSettingsProxy',
  'ledgerProxy',
] as const

function repoDeploymentsPath(chainId: number): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(here, '../../../../../deployments', `platform-${chainId}.json`)
}

function readDeployment(chainId: number): Record<string, unknown> {
  const file = repoDeploymentsPath(chainId)
  const raw = readFileSync(file, 'utf8')
  return JSON.parse(raw) as Record<string, unknown>
}

function requireAddress(value: unknown, key: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Thiếu khóa địa chỉ: ${key}`)
  }
  return toAddress(value.trim())
}

export function parsePlatformDeployments(data: Record<string, unknown>): PlatformAddresses {
  for (const key of REQUIRED_KEYS) {
    if (!(key in data) || typeof data[key] !== 'string' || !(data[key] as string).trim()) {
      throw new Error(`Thiếu khóa địa chỉ: ${key}`)
    }
  }
  const chainId = typeof data.chainId === 'number' ? data.chainId : Number(data.chainId ?? 0)
  return {
    chainId,
    access: requireAddress(data.accessProxy, 'accessProxy'),
    agents: requireAddress(data.agentsProxy, 'agentsProxy'),
    branches: requireAddress(data.branchesProxy, 'branchesProxy'),
    history: requireAddress(data.historyProxy, 'historyProxy'),
    agentAccess: requireAddress(data.agentAccessProxy, 'agentAccessProxy'),
    salesSettings: requireAddress(data.salesSettingsProxy, 'salesSettingsProxy'),
    ledger: requireAddress(data.ledgerProxy, 'ledgerProxy'),
  }
}

/** Đọc `deployments/platform-<chainId>.json`; có thể truyền `data` khi bundle Vite đã import JSON. */
export function loadAddresses(chainId = 991, data?: Record<string, unknown>): PlatformAddresses {
  const raw = data ?? readDeployment(chainId)
  return parsePlatformDeployments(raw)
}