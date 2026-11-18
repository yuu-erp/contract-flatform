import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { formatWalletAddress } from '@/hooks/use-active-wallet'
import { PAGE_SIZE, useGrantRole, useMembers, useRevokeRole } from '@/hooks/use-platform'
import { explainPlatformError } from '@/lib/errors'
import { isAddress, toAddress } from '@/lib/address'
import { ROLE_LABEL, ROLE_MANAGER, ROLE_STAFF } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/field'

export function MembersPanel({ branchId, mode }: { branchId: number; mode: 'owner' | 'manager' | 'readonly' }) {
  const [offset, setOffset] = useState(0)
  const [account, setAccount] = useState('')
  const [role, setRole] = useState(String(ROLE_STAFF))
  const members = useMembers(branchId, offset)
  const grant = useGrantRole()
  const revoke = useRevokeRole()
  const count = members.data?.count ?? 0

  async function onGrant(event: FormEvent) {
    event.preventDefault()
    if (!isAddress(account)) {
      toast.error('Ví nhận phải là địa chỉ hợp lệ.')
      return
    }
    try {
      await grant.mutateAsync({ branchId, account: toAddress(account), role: Number(role) })
      toast.success('Đã gửi cấp vai trò.')
      setAccount('')
    } catch (error) {
      toast.error(explainPlatformError(error))
    }
  }

  async function change(target: string, next: number) {
    try {
      await grant.mutateAsync({ branchId, account: target, role: next })
      toast.success('Đã gửi đổi vai trò.')
    } catch (error) {
      toast.error(explainPlatformError(error))
    }
  }

  async function remove(target: string) {
    try {
      await revoke.mutateAsync({ branchId, account: target })
      toast.success('Đã gửi thu vai trò.')
    } catch (error) {
      toast.error(explainPlatformError(error))
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{count} thành viên</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}>
            Trước
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={offset + PAGE_SIZE >= count} onClick={() => setOffset((value) => value + PAGE_SIZE)}>
            Sau
          </Button>
        </div>
      </div>
      {members.isError ? <p className="text-sm text-destructive">{explainPlatformError(members.error)}</p> : null}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Ví</th>
              <th className="px-3 py-2">Vai trò</th>
              <th className="px-3 py-2">Người cấp</th>
              <th className="px-3 py-2">Thời gian</th>
              {mode !== 'readonly' ? <th className="px-3 py-2">Thao tác</th> : null}
            </tr>
          </thead>
          <tbody>
            {(members.data?.rows ?? []).map((row) => (
              <tr key={row.account} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">{formatWalletAddress(row.account)}</td>
                <td className="px-3 py-2">{ROLE_LABEL[row.role] ?? row.role}</td>
                <td className="px-3 py-2 font-mono text-xs">{formatWalletAddress(row.grantedBy)}</td>
                <td className="px-3 py-2">{row.grantedAt ? new Date(row.grantedAt * 1000).toLocaleString('vi-VN') : '—'}</td>
                {mode === 'owner' ? (
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {row.role === ROLE_STAFF ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => void change(row.account, ROLE_MANAGER)}>
                          Đổi thành quản lý
                        </Button>
                      ) : null}
                      {row.role === ROLE_MANAGER ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => void change(row.account, ROLE_STAFF)}>
                          Đổi thành nhân viên
                        </Button>
                      ) : null}
                      <Button type="button" size="sm" variant="outline" onClick={() => void remove(row.account)}>
                        Thu
                      </Button>
                    </div>
                  </td>
                ) : null}
                {mode === 'manager' ? (
                  <td className="px-3 py-2">
                    {row.role === ROLE_STAFF ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => void remove(row.account)}>
                        Thu
                      </Button>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mode !== 'readonly' ? (
        <form className="grid max-w-md gap-3" onSubmit={(event) => void onGrant(event)}>
          <Field label="Ví nhận">
            <Input value={account} spellCheck={false} placeholder="0x…" onChange={(event) => setAccount(event.target.value)} />
          </Field>
          {mode === 'owner' ? (
            <Field label="Vai trò">
              <select className="h-9 rounded-md border bg-background px-2 text-sm" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value={ROLE_MANAGER}>Quản lý</option>
                <option value={ROLE_STAFF}>Nhân viên</option>
              </select>
            </Field>
          ) : (
            <p className="text-xs text-muted-foreground">Quản lý chỉ cấp được nhân viên cho ví chưa có vai trò.</p>
          )}
          <Button type="submit" disabled={grant.isPending}>
            {grant.isPending ? 'Đang gửi…' : mode === 'owner' ? 'Cấp vai trò' : 'Cấp nhân viên'}
          </Button>
        </form>
      ) : null}
    </div>
  )
}
