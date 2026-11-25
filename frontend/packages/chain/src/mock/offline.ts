import type { PlatformContracts } from '../react/contracts-context'

/** Bọc contracts để mọi lời gọi lỗi như khi RPC chết (xem trước màn "Lỗi hệ thống"). */
export function makeContractsOffline(contracts: PlatformContracts): PlatformContracts {
  const fail = () =>
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TypeError('Failed to fetch (RPC chain 991 không kết nối được — giả lập)')), 300),
    )
  const wrap = <T extends object>(target: T): T =>
    new Proxy(target, {
      get(obj, key) {
        const value = (obj as Record<string | symbol, unknown>)[key]
        return typeof value === 'function' ? () => fail() : value
      },
    })
  return {
    ...contracts,
    access: wrap(contracts.access),
    agents: wrap(contracts.agents),
    branches: wrap(contracts.branches),
    agentAccess: wrap(contracts.agentAccess),
    salesSettings: wrap(contracts.salesSettings),
    ledger: wrap(contracts.ledger),
    history: wrap(contracts.history),
  }
}

/** `?rpc=down` trên URL xem trước → giả lập RPC chết. */
export function previewRpcDown(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('rpc') === 'down'
}
