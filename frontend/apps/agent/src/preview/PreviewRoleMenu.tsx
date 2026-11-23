import { formatWalletAddress } from '@meta-platform/chain'
import { Button } from '@meta-platform/ui'
import type { PreviewAgentRole } from './PreviewBootstrap'
import { usePreviewAgentWallet } from './PreviewBootstrap'

const ROLES: { id: PreviewAgentRole; label: string }[] = [
  { id: 'owner1', label: 'Chủ agent 1' },
  { id: 'manager3001', label: 'Manager 0x…3001' },
  { id: 'dual3002', label: 'Chủ + Manager 0x…3002' },
  { id: 'staff', label: 'Staff' },
  { id: 'none', label: 'Không quyền' },
]

export function PreviewRoleMenu() {
  const { role, setRole, address } = usePreviewAgentWallet()
  return (
    <div className="space-y-2 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 p-3 text-sm">
      <p className="font-medium text-amber-900 dark:text-amber-100">Chế độ xem trước</p>
      <p className="text-xs text-muted-foreground">
        Đổi ví giả — vai trò theo chain giả và <code className="font-mono">?domain=</code> trên URL.
      </p>
      <p className="font-mono text-xs text-muted-foreground">{formatWalletAddress(address)}</p>
      <div className="flex flex-wrap gap-1">
        {ROLES.map((r) => (
          <Button key={r.id} size="sm" variant={role === r.id ? 'default' : 'outline'} onClick={() => setRole(r.id)}>
            {r.label}
          </Button>
        ))}
      </div>
    </div>
  )
}