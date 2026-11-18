import { useMemo } from 'react'
import { loadAddresses, type PlatformAddresses } from '@/config'
import { toAddress } from '@/lib/address'
import { useActiveWallet } from '@/hooks/use-active-wallet'
import {
  AgentAccessContract,
  AgentRegistryContract,
  BranchRegistryContract,
  PlatformAccessContract,
} from '@/services/contracts'

export function readDeployment(): { addresses: PlatformAddresses } | { error: string } {
  try {
    return { addresses: loadAddresses() }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Không đọc được địa chỉ deploy.' }
  }
}

export function useContracts() {
  const { data: wallet } = useActiveWallet()
  const from = wallet?.address ? toAddress(wallet.address) : ''

  return useMemo(() => {
    if (!from) return null
    let addresses: PlatformAddresses
    try {
      addresses = loadAddresses()
    } catch {
      return null
    }
    return {
      addresses,
      access: new PlatformAccessContract(from, addresses.access),
      agents: new AgentRegistryContract(from, addresses.agents),
      branches: new BranchRegistryContract(from, addresses.branches),
      agentAccess: new AgentAccessContract(from, addresses.agentAccess),
    }
  }, [from])
}
