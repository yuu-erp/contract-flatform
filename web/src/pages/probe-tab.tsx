import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useActiveWallet } from '@/hooks/use-active-wallet'
import { useContracts } from '@/hooks/use-contracts'
import { useCreateAgent, useCreateBranch, useGrantRole, useMyRoles, useRenounceRole, useRevokeRole } from '@/hooks/use-platform'
import { explainPlatformError } from '@/lib/errors'
import { isAddress, toAddress } from '@/lib/address'
import {
  callerKindFromRole,
  grantAction,
  predictAccess,
  predictPlatformWrite,
  revokeAction,
  ROLE_MANAGER,
  ROLE_OWNER,
  ROLE_STAFF,
} from '@/lib/roles'
import { servicesFromForm, validateAgentForm, validateBranchForm, type BranchFormValues } from '@/lib/validate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/field'

type ProbeAction = 'grantRole' | 'revokeRole' | 'renounceRole' | 'createAgent' | 'createBranch'

const ACTIONS: ProbeAction[] = ['grantRole', 'revokeRole', 'renounceRole', 'createAgent', 'createBranch']

const EMPTY_BRANCH: BranchFormValues = {
  domain: 'probe-branch',
  name: 'Probe',
  location: '',
  phone: '',
  longlat: '',
  note: '',
  net: true,
  iqr: false,
  loyalty: false,
  tzOffsetMinutes: '420',
}

export function ProbeTab() {
  const contracts = useContracts()
  const roles = useMyRoles()
  const { data: wallet } = useActiveWallet()
  const grant = useGrantRole()
  const revoke = useRevokeRole()
  const renounce = useRenounceRole()
  const createAgent = useCreateAgent()
  const createBranch = useCreateBranch()
  const [action, setAction] = useState<ProbeAction>('grantRole')
  const [branchId, setBranchId] = useState('1')
  const [account, setAccount] = useState('')
  const [role, setRole] = useState(String(ROLE_STAFF))
  const [owner, setOwner] = useState('')
  const [storeName, setStoreName] = useState('Probe')
  const [branch, setBranch] = useState(EMPTY_BRANCH)
  const [agentId, setAgentId] = useState('1')

  const accessRead = useQuery({
    queryKey: ['platform', 'probe-access', branchId, account, wallet?.address],
    enabled: Boolean(
      contracts &&
        wallet?.address &&
        (action === 'grantRole' || action === 'revokeRole' || action === 'renounceRole') &&
        Number(branchId) > 0,
    ),
    queryFn: async () => {
      if (!contracts || !wallet?.address) return { callerRole: 0, targetRole: 0 }
      const id = Number(branchId)
      const me = toAddress(wallet.address)
      const callerRole = await contracts.agentAccess.effectiveRoleOf(id, me)
      const targetRole = isAddress(account) ? await contracts.agentAccess.roleOf(id, toAddress(account)) : 0
      return { callerRole, targetRole }
    },
  })

  const prediction = predict()

  function predict(): string {
    const data = roles.data
    if (!data) return 'Dự đoán: đang đọc quyền của ví…'
    if (action === 'createAgent' || action === 'createBranch') {
      return predictPlatformWrite(action, data.isAdmin, data.paused).message
    }
    if (accessRead.isPending) return 'Dự đoán: đang đọc vai trò trên chi nhánh…'
    if (accessRead.isError) return 'Dự đoán: không đọc được vai trò. Gửi thử vẫn chạy.'
    const caller = callerKindFromRole(accessRead.data?.callerRole ?? 0, accessRead.data?.callerRole === ROLE_OWNER)
    if (action === 'renounceRole') return predictAccess('renounceSelf', caller).message
    if (action === 'revokeRole') {
      const matrix = revokeAction(accessRead.data?.targetRole ?? 0)
      if (!matrix) return 'Dự đoán: ví này không phải Staff hay Manager nên không thu được (NotMember).'
      return predictAccess(matrix, caller).message
    }
    const matrix = grantAction(Number(role), accessRead.data?.targetRole ?? 0)
    if (!matrix) return 'Dự đoán: vai trò không đổi hoặc không hợp lệ (RoleUnchanged / InvalidRole).'
    return predictAccess(matrix, caller).message
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      if (action === 'grantRole') {
        await grant.mutateAsync({ branchId: Number(branchId), account, role: Number(role) })
      } else if (action === 'revokeRole') {
        await revoke.mutateAsync({ branchId: Number(branchId), account })
      } else if (action === 'renounceRole') {
        await renounce.mutateAsync(Number(branchId))
      } else if (action === 'createAgent') {
        const errors = validateAgentForm({ owner, storeName, storeAddress: '', storePhone: '', note: '' })
        if (Object.keys(errors).length > 0) {
          toast.error(Object.values(errors)[0] ?? 'Form không hợp lệ.')
          return
        }
        await createAgent.mutateAsync({
          owner,
          profile: { storeName, storeAddress: '', note: '', storePhone: '' },
        })
      } else {
        const errors = validateBranchForm(branch)
        if (Object.keys(errors).length > 0) {
          toast.error(Object.values(errors)[0] ?? 'Form không hợp lệ.')
          return
        }
        await createBranch.mutateAsync({
          agentId: Number(agentId),
          init: {
            domain: branch.domain,
            services: servicesFromForm(branch),
            tzOffsetMinutes: Number(branch.tzOffsetMinutes),
            profile: {
              name: branch.name,
              location: branch.location,
              phone: branch.phone,
              longlat: branch.longlat,
              note: branch.note,
            },
          },
        })
      }
      toast.success('Giao dịch thành công.')
    } catch (error) {
      toast.error(explainPlatformError(error))
    }
  }

  const pending = grant.isPending || revoke.isPending || renounce.isPending || createAgent.isPending || createBranch.isPending

  return (
    <form className="grid max-w-xl gap-3" onSubmit={(event) => void onSubmit(event)}>
      <h2 className="text-lg font-semibold">Thử quyền</h2>
      <p className="text-sm text-muted-foreground">
        Mọi ví đều gửi được, kể cả khi dự đoán là bị từ chối. Kết quả thật hiện ở toast.
      </p>
      <Field label="Thao tác">
        <select className="h-9 rounded-md border bg-background px-2 text-sm" value={action} onChange={(event) => setAction(event.target.value as ProbeAction)}>
          {ACTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </Field>
      {action === 'grantRole' || action === 'revokeRole' || action === 'renounceRole' ? (
        <Field label="Chi nhánh #">
          <Input value={branchId} onChange={(event) => setBranchId(event.target.value)} />
        </Field>
      ) : null}
      {action === 'grantRole' || action === 'revokeRole' ? (
        <Field label="Ví">
          <Input value={account} spellCheck={false} onChange={(event) => setAccount(event.target.value)} />
        </Field>
      ) : null}
      {action === 'grantRole' ? (
        <Field label="Vai trò cấp">
          <select className="h-9 rounded-md border bg-background px-2 text-sm" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value={ROLE_STAFF}>Staff</option>
            <option value={ROLE_MANAGER}>Manager</option>
          </select>
        </Field>
      ) : null}
      {action === 'createAgent' ? (
        <>
          <Field label="Ví chủ"><Input value={owner} spellCheck={false} onChange={(event) => setOwner(event.target.value)} /></Field>
          <Field label="Tên cửa hàng"><Input value={storeName} onChange={(event) => setStoreName(event.target.value)} /></Field>
        </>
      ) : null}
      {action === 'createBranch' ? (
        <>
          <Field label="Agent #"><Input value={agentId} onChange={(event) => setAgentId(event.target.value)} /></Field>
          <Field label="Domain"><Input value={branch.domain} onChange={(event) => setBranch({ ...branch, domain: event.target.value.trim().toLowerCase() })} /></Field>
          <Field label="Tên"><Input value={branch.name} onChange={(event) => setBranch({ ...branch, name: event.target.value })} /></Field>
        </>
      ) : null}
      <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">{prediction}</p>
      <Button type="submit" disabled={pending}>{pending ? 'Đang gửi…' : 'Gửi giao dịch'}</Button>
    </form>
  )
}
