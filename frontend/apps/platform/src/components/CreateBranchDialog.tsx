import { useContracts } from '@meta-platform/chain'
import { useAppTx } from '@meta-platform/ui'
import { Button, Input, utf8Length } from '@meta-platform/ui'
import { Dialog } from 'radix-ui'
import { useState } from 'react'
import { usePlatformWrite } from '../hooks/use-platform-write'
import { SERVICE_MASK } from '../lib/validate-create-agent'
import { validateCreateBranchForm, type CreateBranchForm } from '../lib/validate-create-branch'

type Props = {
  agentId: number
  agentAllowedServices: number
  onCreated?: () => void
}

export function CreateBranchDialog({ agentId, agentAllowedServices, onCreated }: Props) {
  const contracts = useContracts()
  const tx = useAppTx()
  const { canWrite, adminOnlyHint } = usePlatformWrite()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CreateBranchForm>({
    domain: '',
    services: SERVICE_MASK.NET | SERVICE_MASK.IQR,
    tzOffsetMinutes: 420,
    name: '',
    location: '',
    phone: '',
    longlat: '',
    note: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleService = (bit: number) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services & bit ? prev.services & ~bit : prev.services | bit,
    }))
  }

  return (
    <>
      <Button disabled={!canWrite} title={adminOnlyHint ?? undefined} onClick={() => setOpen(true)}>
        Tạo chi nhánh
      </Button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
          <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[90dvh] w-[min(100%-2rem,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto z-50 rounded-2xl bg-background p-6 text-[0.9375rem] shadow-[0_0_15px_rgb(101_119_134/0.2)] outline-none">
            <Dialog.Title className="text-xl leading-6 font-extrabold">Tạo chi nhánh</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              {adminOnlyHint ?? 'Domain viết thường, duy nhất toàn hệ.'}
            </Dialog.Description>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block space-y-1">
                <span>Domain</span>
                <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
                {errors.domain && <p className="text-destructive">{errors.domain}</p>}
              </label>
              <label className="block space-y-1">
                <span>Tên ({utf8Length(form.name.trim())}/100 byte)</span>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-destructive">{errors.name}</p>}
              </label>
              <label className="block space-y-1">
                <span>Địa điểm</span>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </label>
              <label className="block space-y-1">
                <span>SĐT</span>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label className="block space-y-1">
                <span>Múi giờ (phút, UTC+7 = 420)</span>
                <Input
                  type="number"
                  value={form.tzOffsetMinutes}
                  onChange={(e) => setForm({ ...form, tzOffsetMinutes: Number(e.target.value) })}
                />
                {errors.tzOffsetMinutes && <p className="text-destructive">{errors.tzOffsetMinutes}</p>}
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
                      <input type="checkbox" checked={(form.services & bit) !== 0} onChange={() => toggleService(bit)} />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Huỷ
              </Button>
              <Button
                disabled={!canWrite || tx.pending}
                onClick={() => {
                  void tx.run(
                    async () => {
                      const err = validateCreateBranchForm(form, agentAllowedServices)
                      setErrors(err)
                      if (Object.keys(err).length > 0) throw new Error('invalid')
                      const init = {
                        domain: form.domain.trim().toLowerCase(),
                        services: form.services,
                        tzOffsetMinutes: form.tzOffsetMinutes,
                        profile: {
                          name: form.name.trim(),
                          location: form.location.trim(),
                          phone: form.phone.trim(),
                          longlat: form.longlat.trim(),
                          note: form.note.trim(),
                        },
                      }
                      await contracts!.branches.createBranch(agentId, init)
                    },
                    {
                      invalidate: [['agent-branches', agentId]],
                      onSuccess: () => {
                        setOpen(false)
                        onCreated?.()
                      },
                    },
                  )
                }}
              >
                {tx.pending ? 'Đang ký…' : 'Tạo'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}