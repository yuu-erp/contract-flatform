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

/** Trả thông báo thiếu khóa; `null` nếu hợp lệ (dùng trước khi render app). */
export function deploymentsError(data: Record<string, unknown>): string | null {
  try {
    parsePlatformDeployments(data)
    return null
  } catch (error) {
    return error instanceof Error ? error.message : 'Lỗi cấu hình deployments'
  }
}

/** App Vite import JSON deployments rồi gọi hàm này (không đọc `fs` trong bundle trình duyệt). */
export function loadAddresses(chainId: number, data: Record<string, unknown>): PlatformAddresses {
  const parsed = parsePlatformDeployments(data)
  if (parsed.chainId !== chainId && parsed.chainId !== 0) {
    // Cho phép file không có chainId khớp nếu caller truyền đúng chain đích.
    return { ...parsed, chainId }
  }
  return { ...parsed, chainId: parsed.chainId || chainId }
}