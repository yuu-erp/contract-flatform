import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { formatWalletAddress } from '@/hooks/use-active-wallet'
import {
  PAGE_SIZE,
  useAgentPage,
  useBranchPage,
  useCreateAgent,
  useCreateBranch,
  useMyRoles,
} from '@/hooks/use-platform'
import { useContracts } from '@/hooks/use-contracts'
import { explainPlatformError } from '@/lib/errors'
import { toAddress } from '@/lib/address'
import { serviceLabels, servicesFromForm, validateAgentForm, validateBranchForm, type AgentFormValues, type BranchFormValues } from '@/lib/validate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/field'

const EMPTY_AGENT: AgentFormValues = {
  owner: '',
  storeName: '',
  storeAddress: '',
  storePhone: '',
  note: '',
  net: true,
  iqr: true,
  loyalty: true,
}
const EMPTY_BRANCH: BranchFormValues = {
  domain: '',
  name: '',
  location: '',
  phone: '',
  longlat: '',
  note: '',
  net: true,
  iqr: false,
  loyalty: false,
  tzOffsetMinutes: '420',
}

export function AdminTab() {
  const roles = useMyRoles()
  if (roles.isPending) return <p className="text-sm text-muted-foreground">Đang kiểm tra quyền…</p>
  if (!roles.data?.isAdmin) {
    return <p className="text-sm text-muted-foreground">Tab Admin chỉ bật khi ví là PLATFORM_ADMIN. Ví này không phải admin nền tảng.</p>
  }
  return (
    <div className="grid gap-8">
      <CreateAgentForm />
      <CreateBranchForm />
      <AgentList />
      <BranchList />
    </div>
  )
}

function CreateAgentForm() {
  const contracts = useContracts()
  const create = useCreateAgent()
  const [values, setValues] = useState(EMPTY_AGENT)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const formatErrors = validateAgentForm(values)
    if (Object.keys(formatErrors).length > 0 || !contracts) {
      setErrors(formatErrors)
      return
    }
    const owner = toAddress(values.owner)
    try {
      const [agentIdOfOwner, platformOwner, pendingOwner, ownerIsPlatformAdmin] = await Promise.all([
        contracts.agents.agentIdOf(owner),
        contracts.access.owner(),
        contracts.access.pendingOwner(),
        contracts.access.isPlatformAdmin(owner),
      ])
      const chainErrors = validateAgentForm(values, { agentIdOfOwner, platformOwner, pendingOwner, ownerIsPlatformAdmin })
      if (Object.keys(chainErrors).length > 0) {
        setErrors(chainErrors)
        return
      }
      await create.mutateAsync({
        owner,
        allowedServices: servicesFromForm(values),
        profile: {
          storeName: values.storeName,
          storeAddress: values.storeAddress,
          note: values.note,
          storePhone: values.storePhone,
        },
      })
      toast.success('Đã gửi tạo agent.')
      setValues(EMPTY_AGENT)
    } catch (error) {
      toast.error(explainPlatformError(error))
    }
  }

  return (
    <form className="grid max-w-xl gap-3" onSubmit={(event) => void onSubmit(event)}>
      <h2 className="text-lg font-semibold">Tạo agent</h2>
      <Field label="Ví chủ" error={errors.owner}>
        <Input value={values.owner} spellCheck={false} onChange={(event) => setValues({ ...values, owner: event.target.value })} />
      </Field>
      <Field label="Tên cửa hàng" error={errors.storeName}>
        <Input value={values.storeName} onChange={(event) => setValues({ ...values, storeName: event.target.value })} />
      </Field>
      <Field label="Địa chỉ" error={errors.storeAddress}>
        <Input value={values.storeAddress} onChange={(event) => setValues({ ...values, storeAddress: event.target.value })} />
      </Field>
      <Field label="SĐT" error={errors.storePhone}>
        <Input value={values.storePhone} onChange={(event) => setValues({ ...values, storePhone: event.target.value })} />
      </Field>
      <Field label="Ghi chú" error={errors.note}>
        <Textarea value={values.note} onChange={(event) => setValues({ ...values, note: event.target.value })} />
      </Field>
      <Field label="Module được cấp" error={errors.services} hint="Chi nhánh của agent chỉ bật được các module này.">
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={values.net} onChange={(event) => setValues({ ...values, net: event.target.checked })} />NET</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={values.iqr} onChange={(event) => setValues({ ...values, iqr: event.target.checked })} />IQR</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={values.loyalty} onChange={(event) => setValues({ ...values, loyalty: event.target.checked })} />Loyalty</label>
        </div>
      </Field>
      <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Đang gửi…' : 'Tạo agent'}</Button>
    </form>
  )
}

function CreateBranchForm() {
  const create = useCreateBranch()
  const [agentId, setAgentId] = useState('1')
  const [values, setValues] = useState(EMPTY_BRANCH)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validateBranchForm(values)
    const id = Number(agentId)
    if (!Number.isInteger(id) || id <= 0) next.agentId = 'Chọn mã agent lớn hơn 0.'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    try {
      await create.mutateAsync({
        agentId: id,
        init: {
          domain: values.domain,
          services: servicesFromForm(values),
          tzOffsetMinutes: Number(values.tzOffsetMinutes),
          profile: {
            name: values.name,
            location: values.location,
            phone: values.phone,
            longlat: values.longlat,
            note: values.note,
          },
        },
      })
      toast.success('Đã gửi tạo chi nhánh.')
    } catch (error) {
      toast.error(explainPlatformError(error))
    }
  }

  return (
    <form className="grid max-w-xl gap-3" onSubmit={(event) => void onSubmit(event)}>
      <h2 className="text-lg font-semibold">Tạo chi nhánh</h2>
      <Field label="Agent #" error={errors.agentId}>
        <Input value={agentId} inputMode="numeric" onChange={(event) => setAgentId(event.target.value)} />
      </Field>
      <Field label="Domain" error={errors.domain}>
        <Input value={values.domain} spellCheck={false} onChange={(event) => setValues({ ...values, domain: event.target.value.trim().toLowerCase() })} />
      </Field>
      <Field label="Tên" error={errors.name}>
        <Input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
      </Field>
      <Field label="Địa điểm" error={errors.location}>
        <Input value={values.location} onChange={(event) => setValues({ ...values, location: event.target.value })} />
      </Field>
      <Field label="SĐT" error={errors.phone}>
        <Input value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} />
      </Field>
      <Field label="Toạ độ" error={errors.longlat} hint="lat,long hoặc để trống.">
        <Input value={values.longlat} onChange={(event) => setValues({ ...values, longlat: event.target.value })} />
      </Field>
      <Field label="Ghi chú" error={errors.note}>
        <Textarea value={values.note} onChange={(event) => setValues({ ...values, note: event.target.value })} />
      </Field>
      <Field label="Dịch vụ" error={errors.services}>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={values.net} onChange={(event) => setValues({ ...values, net: event.target.checked })} />NET</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={values.iqr} onChange={(event) => setValues({ ...values, iqr: event.target.checked })} />IQR</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={values.loyalty} onChange={(event) => setValues({ ...values, loyalty: event.target.checked })} />Loyalty</label>
        </div>
      </Field>
      <Field label="Múi giờ (phút)" error={errors.tzOffsetMinutes}>
        <Input value={values.tzOffsetMinutes} onChange={(event) => setValues({ ...values, tzOffsetMinutes: event.target.value })} />
      </Field>
      <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Đang gửi…' : 'Tạo chi nhánh'}</Button>
    </form>
  )
}

function AgentList() {
  const [offset, setOffset] = useState(0)
  const page = useAgentPage(offset)
  const count = page.data?.count ?? 0
  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agent ({count})</h2>
        <Pager offset={offset} count={count} onOffset={setOffset} />
      </div>
      {page.isError ? <p className="text-sm text-destructive">{explainPlatformError(page.error)}</p> : null}
      <SimpleTable
        headers={['#', 'Tên', 'Ví chủ', 'SĐT', 'Module']}
        rows={(page.data?.rows ?? []).map((row) => [
          row.id,
          row.storeName || '—',
          formatWalletAddress(row.owner),
          row.storePhone || '—',
          serviceLabels(row.allowedServices) || '—',
        ])}
      />
    </section>
  )
}

function BranchList() {
  const [offset, setOffset] = useState(0)
  const page = useBranchPage(offset)
  const count = page.data?.count ?? 0
  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chi nhánh ({count})</h2>
        <Pager offset={offset} count={count} onOffset={setOffset} />
      </div>
      {page.isError ? <p className="text-sm text-destructive">{explainPlatformError(page.error)}</p> : null}
      <SimpleTable
        headers={['#', 'Agent', 'Tên', 'Domain']}
        rows={(page.data?.rows ?? []).map((row) => [row.id, row.agentId, row.name || '—', row.domain || '—'])}
      />
    </section>
  )
}

function Pager({ offset, count, onOffset }: { offset: number; count: number; onOffset: (value: number) => void }) {
  return (
    <div className="flex gap-2">
      <Button type="button" size="sm" variant="outline" disabled={offset === 0} onClick={() => onOffset(Math.max(0, offset - PAGE_SIZE))}>Trước</Button>
      <Button type="button" size="sm" variant="outline" disabled={offset + PAGE_SIZE >= count} onClick={() => onOffset(offset + PAGE_SIZE)}>Sau</Button>
    </div>
  )
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-2">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('-')} className="border-t">
              {row.map((cell, index) => <td key={`${cell}-${index}`} className="px-3 py-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
