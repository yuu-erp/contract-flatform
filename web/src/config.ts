const REQUIRED = {
  access: 'accessProxy',
  agents: 'agentsProxy',
  branches: 'branchesProxy',
  history: 'historyProxy',
  agentAccess: 'agentAccessProxy',
} as const

export type PlatformAddresses = {
  chainId: string
  access: string
  agents: string
  branches: string
  history: string
  agentAccess: string
}

const deploymentModules = import.meta.glob('../../deployments/platform-*.json', { eager: true })

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && 'default' in value) {
    const inner = (value as { default: unknown }).default
    if (inner && typeof inner === 'object') return inner as Record<string, unknown>
  }
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return {}
}

export function chainIdFromEnv(raw = import.meta.env.VITE_CHAIN_ID): string {
  const id = (raw ?? '991').trim()
  return id || '991'
}

export function loadAddresses(chainId = chainIdFromEnv()): PlatformAddresses {
  const fileName = `platform-${chainId}.json`
  const match = Object.entries(deploymentModules).find(([path]) => path.endsWith(fileName))
  if (!match) {
    throw new Error(`Không có deployments/${fileName}. Đặt VITE_CHAIN_ID đúng chain đã deploy.`)
  }
  const data = asRecord(match[1])
  const missing = Object.values(REQUIRED).filter((key) => typeof data[key] !== 'string' || !String(data[key]).trim())
  if (missing.length > 0) {
    throw new Error(`deployments/${fileName} thiếu khoá: ${missing.join(', ')}.`)
  }
  return {
    chainId,
    access: String(data[REQUIRED.access]),
    agents: String(data[REQUIRED.agents]),
    branches: String(data[REQUIRED.branches]),
    history: String(data[REQUIRED.history]),
    agentAccess: String(data[REQUIRED.agentAccess]),
  }
}
