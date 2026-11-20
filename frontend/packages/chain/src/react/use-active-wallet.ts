import { connectWallet, getActiveWallet, type Wallet } from '@metanodejs/system-core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export const activeWalletQueryKey = ['activeWallet'] as const

export type ActiveWallet = Pick<Wallet, 'address' | 'name'>

function parseActiveWallet(data: unknown): ActiveWallet | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  if (record.success === false) return null
  const address = typeof record.address === 'string' ? record.address.trim() : ''
  if (!address) return null
  return {
    address,
    name: typeof record.name === 'string' ? record.name : '',
  }
}

export function formatWalletAddress(address: string): string {
  const value = address.startsWith('0x') ? address : `0x${address}`
  if (value.length <= 12) return value
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

export function useActiveWallet() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sdk = typeof window !== 'undefined' ? window.fiaiSDK : undefined
    if (!sdk) return
    return sdk.on('onSetActiveWallet', () => {
      void queryClient.invalidateQueries({ queryKey: activeWalletQueryKey })
    })
  }, [queryClient])

  return useQuery({
    queryKey: activeWalletQueryKey,
    queryFn: async (): Promise<ActiveWallet | null> => {
      try {
        const wallet = await getActiveWallet()
        return parseActiveWallet(wallet)
      } catch (error) {
        console.error(error)
        return null
      }
    },
  })
}

export function useConnectWallet(theme?: 'light' | 'dark') {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => connectWallet(theme),
    onSuccess: (result) => {
      if (result && typeof result === 'object' && 'success' in result && result.success === false) {
        return
      }
      void queryClient.invalidateQueries({ queryKey: activeWalletQueryKey })
    },
  })
}

type WalletSdk = { on(event: 'onSetActiveWallet', cb: () => void): () => void }

declare global {
  interface Window {
    fiaiSDK?: WalletSdk
  }
}