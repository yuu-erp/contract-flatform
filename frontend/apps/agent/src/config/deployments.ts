export const agentChainId = Number(import.meta.env.VITE_CHAIN_ID ?? '991')

const deploymentFiles = import.meta.glob<{ default: Record<string, unknown> }>(
  '../../../../../deployments/platform-*.json',
  { eager: true },
)

const localFiles = import.meta.glob<{ default: Record<string, unknown> }>(
  '../../../../../deployments/platform-*.local.json',
  { eager: true },
)

function pickJson<T>(files: Record<string, T>, id: string, suffix: string): T | undefined {
  const needle = `platform-${id}${suffix}`
  const hit = Object.entries(files).find(([path]) => path.endsWith(needle))
  return hit?.[1]
}

const base = pickJson(deploymentFiles, String(agentChainId), '.json')
if (!base) {
  throw new Error(`Không tìm thấy deployments/platform-${agentChainId}.json`)
}

const localOverlay = pickJson(localFiles, String(agentChainId), '.local.json')?.default ?? {}

export const agentDeployments: Record<string, unknown> = {
  ...(base.default as Record<string, unknown>),
  ...localOverlay,
}