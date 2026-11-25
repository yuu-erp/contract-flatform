import {
  ContractsProvider,
  createMockContracts,
  makeContractsOffline,
  previewRpcDown,
  PREVIEW_WALLETS,
  activeWalletQueryKey,
} from '@meta-platform/chain'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, use, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

export type PreviewRole = 'owner' | 'admin' | 'pending' | 'none'

const walletForRole: Record<PreviewRole, string> = {
  owner: PREVIEW_WALLETS.owner,
  admin: PREVIEW_WALLETS.admin,
  pending: PREVIEW_WALLETS.pending,
  none: PREVIEW_WALLETS.none,
}

type PreviewWalletCtx = {
  role: PreviewRole
  setRole: (role: PreviewRole) => void
  address: string
}

const PreviewWalletContext = createContext<PreviewWalletCtx | null>(null)

export function PreviewBootstrap({ children }: PropsWithChildren) {
  const [role, setRole] = useState<PreviewRole>('owner')
  const address = walletForRole[role]
  const contracts = useMemo(() => {
    const mock = createMockContracts(42, address)
    return previewRpcDown() ? makeContractsOffline(mock) : mock
  }, [address])

  return (
    <PreviewWalletContext value={{ role, setRole, address }}>
      <ContractsProvider value={contracts}>
        <PreviewWalletQuerySync address={address} />
        {children}
      </ContractsProvider>
    </PreviewWalletContext>
  )
}

function PreviewWalletQuerySync({ address }: { address: string }) {
  const queryClient = useQueryClient()
  useEffect(() => {
    queryClient.setQueryData(activeWalletQueryKey, { address, name: `Preview ${address.slice(-4)}` })
  }, [address, queryClient])
  return null
}

export function usePreviewWallet() {
  const ctx = use(PreviewWalletContext)
  if (!ctx) throw new Error('usePreviewWallet chỉ dùng trong VITE_PREVIEW=mock')
  return ctx
}