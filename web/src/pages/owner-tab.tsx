import { useState } from 'react'
import { useBranchesOfAgent, useMyRoles } from '@/hooks/use-platform'
import { MembersPanel } from '@/pages/members-panel'

export function OwnerTab() {
  const roles = useMyRoles()
  const agentId = roles.data?.agentId ?? 0
  const branches = useBranchesOfAgent(agentId, 0)
  const [branchId, setBranchId] = useState(0)
  const selected = branchId || Number(branches.data?.rows[0]?.id ?? 0)

  if (roles.isPending) return <p className="text-sm text-muted-foreground">Đang kiểm tra quyền…</p>
  if (!agentId) {
    return <p className="text-sm text-muted-foreground">Tab Chủ agent chỉ bật khi agentIdOf của ví khác 0. Ví này không phải chủ agent.</p>
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-semibold">Chủ agent #{agentId}</h2>
      {branches.data?.truncated ? (
        <p className="text-xs text-muted-foreground">Chỉ quét 200 chi nhánh đầu. Chi nhánh mới hơn có thể chưa hiện.</p>
      ) : null}
      <label className="grid max-w-md gap-2 text-sm">
        Chi nhánh
        <select className="h-9 rounded-md border bg-background px-2" value={selected || ''} onChange={(event) => setBranchId(Number(event.target.value))}>
          {(branches.data?.rows ?? []).map((row) => (
            <option key={row.id} value={row.id}>#{row.id} {row.name || row.domain}</option>
          ))}
        </select>
      </label>
      {(branches.data?.rows.length ?? 0) === 0 && !branches.isPending ? (
        <p className="text-sm text-muted-foreground">Agent này chưa có chi nhánh trong 200 id đầu.</p>
      ) : null}
      {selected > 0 ? <MembersPanel branchId={selected} mode="owner" /> : null}
    </div>
  )
}
