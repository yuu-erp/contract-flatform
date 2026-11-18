import { useState } from 'react'
import { useMyRoles } from '@/hooks/use-platform'
import { ROLE_MANAGER } from '@/lib/roles'
import { MembersPanel } from '@/pages/members-panel'

export function ManagerTab() {
  const roles = useMyRoles()
  const managed = (roles.data?.branches ?? []).filter((branch) => branch.role === ROLE_MANAGER)
  const [branchId, setBranchId] = useState(0)
  const selected = branchId || managed[0]?.branchId || 0

  if (roles.isPending) return <p className="text-sm text-muted-foreground">Đang kiểm tra quyền…</p>
  if (managed.length === 0) {
    return <p className="text-sm text-muted-foreground">Tab Quản lý chỉ bật khi ví có vai trò Manager trên ít nhất một chi nhánh.</p>
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-semibold">Quản lý</h2>
      <label className="grid max-w-md gap-2 text-sm">
        Chi nhánh
        <select className="h-9 rounded-md border bg-background px-2" value={selected} onChange={(event) => setBranchId(Number(event.target.value))}>
          {managed.map((branch) => (
            <option key={branch.branchId} value={branch.branchId}>#{branch.branchId}</option>
          ))}
        </select>
      </label>
      {selected > 0 ? <MembersPanel branchId={selected} mode="manager" /> : null}
    </div>
  )
}
