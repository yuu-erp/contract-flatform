import type { BranchView } from '@meta-platform/chain'
import { useContracts } from '@meta-platform/chain'
import { useAppTx } from '../hooks/use-app-tx'
import { Button, Input, utf8Length } from '@meta-platform/ui'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'
import { usePlatformWrite } from '../hooks/use-platform-write'
import { SERVICE_MASK } from '../lib/validate-create-agent'
import {
  isValidBranchDomain,
  validateBranchProfileForm,
  type BranchFormProfile,
} from '../lib/validate-create-branch'
import { validateReason } from '../lib/validate-reason'

export type BranchManageMode = 'edit' | 'suspend' | 'resume' | 'delete' | 'domain' | 'timezone' | 'main'

type Props = {
  branch: BranchView
  domain: string
  profile: BranchFormProfile
  agentAllowedServices: number
  mode: BranchManageMode
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}

export function BranchManageDialog({
  branch,
  domain,
  profile,
  agentAllowedServices,
  mode,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const contracts = useContracts()
  const tx = useAppTx()
  const { canWrite, adminOnlyHint } = usePlatformWrite()
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const [newDomain, setNewDomain] = useState(domain)
  const [tz, setTz] = useState(branch.tzOffsetMinutes)
  const [form, setForm] = useState<BranchFormProfile>(profile)
  const [services, setServices] = useState(branch.services)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      setReason('')
      setReasonError(null)
      setFieldErrors({})
    } else {
      setNewDomain(domain)
      setTz(branch.tzOffsetMinutes)
      setForm(profile)
      setServices(branch.services)
    }
  }, [open, domain, profile, branch.services, branch.tzOffsetMinutes])

  const titles: Record<BranchManageMode, string> = {
    edit: `Sửa hồ sơ chi nhánh #${branch.id}`,
    suspend: `Tạm dừng chi nhánh #${branch.id}`,
    resume: `Mở lại chi nhánh #${branch.id}`,
    delete: `Xoá chi nhánh #${branch.id}`,
    domain: `Đổi domain #${branch.id}`,
    timezone: `Đổi múi giờ #${branch.id}`,
    main: `Đặt chi nhánh chính #${branch.id}`,
  }

  const needsReason = mode === 'suspend' || mode === 'resume' || mode === 'delete'

  const toggleService = (bit: number) => {
    setServices((prev) => (prev & bit ? prev & ~bit : prev | bit))
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[90vh] w-[min(100%,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-background p-5 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">{titles[mode]}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">{adminOnlyHint ?? 'Giao dịch Admin on-chain.'}</Dialog.Description>

          <div className="mt-4 space-y-3 text-sm">
            {mode === 'edit' ? (
              <>
                <label className="block space-y-1">
                  <span>Tên ({utf8Length(form.name.trim())}/100 byte)</span>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  {fieldErrors.name && <p className="text-destructive">{fieldErrors.name}</p>}
                </label>
                <label className="block space-y-1">
                  <span>Địa điểm</span>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </label>
                <fieldset>
                  <legend>Dịch vụ</legend>
                  <div className="flex flex-wrap gap-3">
                    {(
                      [
                        ['NET', SERVICE_MASK.NET],
                        ['IQR', SERVICE_MASK.IQR],
                        ['LOYALTY', SERVICE_MASK.LOYALTY],
                      ] as const
                    ).map(([label, bit]) => (
                      <label key={label} className="flex items-center gap-2">
                        <input type="checkbox" checked={(services & bit) !== 0} onChange={() => toggleService(bit)} />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            ) : null}
            {mode === 'domain' ? (
              <label className="block space-y-1">
                <span>Domain mới (chữ thường)</span>
                <Input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} />
                {fieldErrors.domain && <p className="text-destructive">{fieldErrors.domain}</p>}
              </label>
            ) : null}
            {mode === 'timezone' ? (
              <label className="block space-y-1">
                <span>Múi giờ (phút)</span>
                <Input type="number" value={tz} onChange={(e) => setTz(Number(e.target.value))} />
                {fieldErrors.tzOffsetMinutes && <p className="text-destructive">{fieldErrors.tzOffsetMinutes}</p>}
              </label>
            ) : null}
            {mode === 'main' ? (
              <p className="text-muted-foreground">Chi nhánh này sẽ trở thành chi nhánh chính của agent.</p>
            ) : null}
            {needsReason ? (
              <label className="block space-y-1">
                <span>Lý do (bắt buộc)</span>
                <textarea
                  className="min-h-[4rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                {reasonError && <p className="text-destructive">{reasonError}</p>}
              </label>
            ) : null}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!canWrite || tx.pending}
              onClick={() => {
                void tx.run(
                  async () => {
                    const b = contracts!.branches
                    if (mode === 'edit') {
                      const err = validateBranchProfileForm(
                        {
                          name: form.name,
                          location: form.location,
                          phone: form.phone,
                          longlat: form.longlat,
                          note: form.note,
                          services,
                        },
                        agentAllowedServices,
                      )
                      setFieldErrors(err)
                      if (Object.keys(err).length > 0) throw new Error('invalid')
                      await b.updateBranchProfile(branch.id, {
                        name: form.name.trim(),
                        location: form.location.trim(),
                        phone: form.phone.trim(),
                        longlat: form.longlat.trim(),
                        note: form.note.trim(),
                      })
                      if (services !== branch.services) await b.setBranchServices(branch.id, services)
                    } else if (mode === 'domain') {
                      const d = newDomain.trim().toLowerCase()
                      if (!isValidBranchDomain(d)) {
                        setFieldErrors({ domain: 'Domain không hợp lệ' })
                        throw new Error('invalid')
                      }
                      await b.setBranchDomain(branch.id, d)
                    } else if (mode === 'timezone') {
                      if (tz < -720 || tz > 840) {
                        setFieldErrors({ tzOffsetMinutes: 'Ngoài khoảng −720…840' })
                        throw new Error('invalid')
                      }
                      await b.setBranchTimezone(branch.id, tz)
                    } else if (mode === 'main') {
                      await b.setMainBranch(branch.id)
                    } else {
                      const err = validateReason(reason)
                      setReasonError(err)
                      if (err) throw new Error('invalid')
                      if (mode === 'suspend') await b.suspendBranch(branch.id, reason.trim())
                      else if (mode === 'resume') await b.resumeBranch(branch.id, reason.trim())
                      else await b.deleteBranch(branch.id, reason.trim())
                    }
                  },
                  {
                    invalidate: [['branch', branch.id], ['agent-branches', branch.agentId]],
                    onSuccess: () => {
                      onOpenChange(false)
                      onDone?.()
                    },
                  },
                )
              }}
            >
              {tx.pending ? 'Đang ký…' : 'Xác nhận'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}