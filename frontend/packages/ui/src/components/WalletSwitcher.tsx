import { formatWalletAddress, useActiveWallet, useConnectWallet } from '@meta-platform/chain'
import { Loader2, Wallet } from 'lucide-react'
import { useWalletTheme } from '../hooks/use-wallet-theme'
import { cn } from '../lib/cn'
import { Button } from '../primitives/button'

export function WalletSwitcher({ className }: { className?: string }) {
  const theme = useWalletTheme()
  const { data: wallet, isPending: isWalletLoading } = useActiveWallet()
  const connect = useConnectWallet(theme)

  const busy = isWalletLoading || connect.isPending
  const label = wallet ? wallet.name?.trim() || formatWalletAddress(wallet.address) : 'Chọn ví'

  return (
    <Button
      type="button"
      variant={wallet ? 'outline' : 'default'}
      size="sm"
      className={cn('max-w-52', className)}
      disabled={busy}
      onClick={() => void connect.mutate()}
      aria-label={wallet ? `Đổi ví ${label}` : 'Chọn ví'}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4 shrink-0" />}
      <span className="truncate">{busy && !wallet ? 'Đang tải…' : label}</span>
    </Button>
  )
}