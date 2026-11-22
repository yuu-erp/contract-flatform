import { formatWalletAddress } from '@meta-platform/chain'
import { Button } from '@meta-platform/ui'
import { usePreviewWallet, type PreviewRole } from './PreviewBootstrap'

const ROLES: { id: PreviewRole; label: string }[] = [
  { id: 'owner', label: 'Owner' },
  { id: 'admin', label: 'Admin' },
  { id: 'pending', label: 'Pending owner' },
  { id: 'none', label: 'Không quyền' },
]

export function PreviewRoleMenu() {
  const { role, setRole, address } = usePreviewWallet()
  return (
    <div className="space-y-2 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 p-3 text-sm">
      <p className="font-medium text-amber-900 dark:text-amber-100">Chế độ xem trước</p>
      <p className="font-mono text-xs text-muted-foreground">{formatWalletAddress(address)}</p>
      <div className="flex flex-wrap gap-1">
        {ROLES.map((r) => (
          <Button
            key={r.id}
            size="sm"
            variant={role === r.id ? 'default' : 'outline'}
            onClick={() => setRole(r.id)}
          >
            {r.label}
          </Button>
        ))}
      </div>
    </div>
  )
}