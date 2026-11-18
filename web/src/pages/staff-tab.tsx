import { useState } from 'react'
import { toast } from 'sonner'
import { useMyRoles, useRenounceRole } from '@/hooks/use-platform'
import { explainPlatformError } from '@/lib/errors'
import { ROLE_STAFF } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { MembersPanel } from '@/pages/members-panel'

export function StaffTab() {
  const roles = useMyRoles()
  const staffed = (roles.data?.branches ?? []).filter((branch) => branch.role === ROLE_STAFF)
  const [branchId, setBranchId] = useState(0)
  const [confirm, setConfirm] = useState(false)
  const renounce = useRenounceRole()
  const selected = branchId || staffed[0]?.branchId || 0

  if (roles.isPending) return <p className="text-sm text-muted-foreground">Đang kiểm tra quyền…</p>
  if (staffed.length === 0) {
    return <p className="text-sm text-muted-foreground">Tab Nhân viên chỉ bật khi ví có vai trò Staff trên ít nhất một chi nhánh.</p>
  }

  async function leave() {
    if (!confirm || selected <= 0) return
    try {
      await renounce.mutateAsync(selected)
      toast.success('Đã gửi yêu cầu rời chi nhánh.')
      setConfirm(false)
    } catch (error) {
      toast.error(explainPlatformError(error))
    }
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-semibold">Nhân viên</h2>
      <label className="grid max-w-md gap-2 text-sm">
        Chi nhánh của tôi
        <select className="h-9 rounded-md border bg-background px-2" value={selected} onChange={(event) => { setBranchId(Number(event.target.value)); setConfirm(false) }}>
          {staffed.map((branch) => (
            <option key={branch.branchId} value={branch.branchId}>#{branch.branchId}</option>
          ))}
        </select>
      </label>
      {selected > 0 ? <MembersPanel branchId={selected} mode="readonly" /> : null}
      <div className="grid max-w-md gap-2 rounded-md border p-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={confirm} onChange={(event) => setConfirm(event.target.checked)} />
          Tôi xác nhận rời chi nhánh #{selected}
        </label>
        <Button type="button" variant="outline" disabled={!confirm || renounce.isPending} onClick={() => void leave()}>
          {renounce.isPending ? 'Đang gửi…' : 'Rời chi nhánh'}
        </Button>
      </div>
    </div>
  )
}
