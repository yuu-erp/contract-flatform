import {
  ContractsProvider,
  createMockContracts,
  PREVIEW_WALLETS,
  activeWalletQueryKey,
} from '@meta-platform/chain'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, use, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

export type PreviewAgentRole = 'owner1' | 'manager3001' | 'dual3002' | 'staff' | 'none'

const walletForRole: Record<PreviewAgentRole, string> = {
  owner1: PREVIEW_WALLETS.agentOwner1,
  manager3001: PREVIEW_WALLETS.agentManager,
  dual3002: PREVIEW_WALLETS.agentDual,
  staff: PREVIEW_WALLETS.agentStaff,
  none: PREVIEW_WALLETS.none,
}

type PreviewWalletCtx = {
  role: PreviewAgentRole
  setRole: (role: PreviewAgentRole) => void
  address: string
}

const PreviewWalletContext = createContext<PreviewWalletCtx | null>(null)

function readStoredRole(): PreviewAgentRole {
  if (typeof window === 'undefined') return 'owner1'
  const saved = window.sessionStorage.getItem('agent-preview-role')
  if (saved && saved in walletForRole) return saved as PreviewAgentRole
  return 'owner1'
}

export function PreviewBootstrap({ children }: PropsWithChildren) {
  const [role, setRole] = useState<PreviewAgentRole>(() => readStoredRole())
  const address = walletForRole[role]
  const contracts = useMemo(() => createMockContracts(42, address), [address])

  useEffect(() => {
    window.sessionStorage.setItem('agent-preview-role', role)
  }, [role])

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
    void queryClient.invalidateQueries({ queryKey: ['agentAccess'] })
  }, [address, queryClient])
  return null
}

export function usePreviewAgentWallet() {
  const ctx = use(PreviewWalletContext)
  if (!ctx) throw new Error('usePreviewAgentWallet chỉ dùng trong VITE_PREVIEW=mock')
  return ctx
}