import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadAddresses, parsePlatformDeployments, type PlatformAddresses } from './loadAddresses'

function repoDeploymentsPath(chainId: number): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(here, '../../../../../deployments', `platform-${chainId}.json`)
}

export function readDeploymentJson(chainId: number): Record<string, unknown> {
  const file = repoDeploymentsPath(chainId)
  const raw = readFileSync(file, 'utf8')
  return JSON.parse(raw) as Record<string, unknown>
}

export function loadAddressesFromRepo(chainId = 991): PlatformAddresses {
  return loadAddresses(chainId, readDeploymentJson(chainId))
}

export { parsePlatformDeployments, loadAddresses }