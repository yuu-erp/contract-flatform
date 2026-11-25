import { Button } from '@meta-platform/ui'
import type { PreviewAgentRole } from './PreviewBootstrap'
import { usePreviewAgentWallet } from './PreviewBootstrap'

const ROLES: { id: PreviewAgentRole; label: string }[] = [
  { id: 'owner1', label: 'Chủ agent 1' },
  { id: 'manager3001', label: 'Manager 3001' },
  { id: 'dual3002', label: 'Chủ + Manager' },
  { id: 'staff', label: 'Staff' },
  { id: 'none', label: 'Không quyền' },
]

/** Công tắc ví giả trong sidebar (thay khối ~140px đầu trang). */
export function AgentPreviewNavUser() {
  const { role, setRole } = usePreviewAgentWallet()
  return (
    <div className="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 p-2">
      <p className="mb-1.5 text-[0.625rem] font-medium uppercase tracking-wide text-amber-900 dark:text-amber-100">
        Xem trước ví
      </p>
      <div className="flex flex-col gap-0.5">
        {ROLES.map((r) => (
          <Button
            key={r.id}
            type="button"
            size="sm"
            variant={role === r.id ? 'default' : 'ghost'}
            className="h-7 justify-start px-2 text-xs"
            onClick={() => setRole(r.id)}
          >
            {r.label}
          </Button>
        ))}
      </div>
    </div>
  )
}