import { useContracts } from '@meta-platform/chain'
import { useAppTx } from '@meta-platform/ui'
import { Button, utf8Length } from '@meta-platform/ui'
import { Dialog } from 'radix-ui'
import { useState } from 'react'
import { usePlatformWrite } from '../hooks/use-platform-write'
import {
  SERVICE_MASK,
  validateCreateAgentForm,
  type CreateAgentForm,
} from '../lib/validate-create-agent'

const emptyForm = (): CreateAgentForm => ({
  owner: '',
  storeName: '',
  storeAddress: '',
  note: '',
  storePhone: '',
  allowedServices: SERVICE_MASK.NET,
})

export function CreateAgentDialog({
  onCreated,
  open: openProp,
  onOpenChange,
  showTrigger = true,
}: {
  onCreated?: () => void
  /** Điều khiển từ ngoài (nút "Tạo agent" ở thanh điều hướng). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}) {
  const contracts = useContracts()
  const { canWrite: canCreate, adminOnlyHint } = usePlatformWrite()
  const tx = useAppTx()
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = (next: boolean) => {
    setOpenState(next)
    onOpenChange?.(next)
  }
  const [form, setForm] = useState<CreateAgentForm>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const toggleService = (bit: number) => {
    setForm((prev) => ({
      ...prev,
      allowedServices: prev.allowedServices & bit ? prev.allowedServices & ~bit : prev.allowedServices | bit,
    }))
  }

  const reset = () => {
    setForm(emptyForm())
    setFieldErrors({})
  }

  return (
    <>
      {showTrigger ? (
      <div className="flex max-w-xs flex-col items-end gap-1 text-right">
        <Button
          disabled={!canCreate}
          title={adminOnlyHint ?? undefined}
          onClick={() => setOpen(true)}
        >
          Tạo agent
        </Button>
        {!canCreate && adminOnlyHint ? <p className="text-xs text-muted-foreground">{adminOnlyHint}</p> : null}
      </div>
      ) : null}
      <Dialog.Root
        open={open}
        onOpenChange={(next: boolean) => {
          setOpen(next)
          if (!next) reset()
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
          <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[90dvh] w-[min(100%-2rem,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto z-50 rounded-2xl bg-background p-6 text-[0.9375rem] shadow-[0_0_15px_rgb(101_119_134/0.2)] outline-none">
            <Dialog.Title className="text-xl leading-6 font-extrabold">Tạo agent</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Ví đăng nhập phải là Admin nền tảng. Ví chủ agent phải là ví merchant khác — không trùng Owner/Admin
              platform.
            </Dialog.Description>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block space-y-1">
                <span>Ví chủ</span>
                <input
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-[0.9375rem] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  placeholder="0x…"
                />
                {fieldErrors.owner && <p className="text-destructive">{fieldErrors.owner}</p>}
              </label>
              <label className="block space-y-1">
                <span>Tên cửa hàng ({utf8Length(form.storeName.trim())}/100 byte)</span>
                <input
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-[0.9375rem] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                />
                {fieldErrors.storeName && <p className="text-destructive">{fieldErrors.storeName}</p>}
              </label>
              <label className="block space-y-1">
                <span>Địa chỉ</span>
                <input
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-[0.9375rem] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={form.storeAddress}
                  onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                />
                {fieldErrors.storeAddress && <p className="text-destructive">{fieldErrors.storeAddress}</p>}
              </label>
              <label className="block space-y-1">
                <span>Số điện thoại</span>
                <input
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-[0.9375rem] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={form.storePhone}
                  onChange={(e) => setForm({ ...form, storePhone: e.target.value })}
                />
                {fieldErrors.storePhone && <p className="text-destructive">{fieldErrors.storePhone}</p>}
              </label>
              <label className="block space-y-1">
                <span>Ghi chú</span>
                <textarea
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-[0.9375rem] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  rows={2}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
                {fieldErrors.note && <p className="text-destructive">{fieldErrors.note}</p>}
              </label>
              <fieldset className="space-y-1">
                <legend>Dịch vụ được cấp</legend>
                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      ['NET', SERVICE_MASK.NET],
                      ['IQR', SERVICE_MASK.IQR],
                      ['LOYALTY', SERVICE_MASK.LOYALTY],
                    ] as const
                  ).map(([label, bit]) => (
                    <label key={label} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(form.allowedServices & bit) !== 0}
                        onChange={() => toggleService(bit)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {fieldErrors.allowedServices && <p className="text-destructive">{fieldErrors.allowedServices}</p>}
              </fieldset>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Huỷ
              </Button>
              <Button
                disabled={tx.pending}
                onClick={() => {
                  void tx.run(
                    async () => {
                      const errors = validateCreateAgentForm(form)
                      const owner = form.owner.trim()
                      const platformRole = await contracts!.access.resolvePlatformRole(owner)
                      if (platformRole.isOwner || platformRole.isAdmin || platformRole.isPendingOwner) {
                        errors.owner =
                          'Ví chủ agent không được là Owner, Admin hoặc pending owner nền tảng — dùng ví merchant riêng.'
                      }
                      setFieldErrors(errors)
                      if (Object.keys(errors).length > 0) throw new Error('invalid')
                      await contracts!.agents.createAgent(owner, form.allowedServices, {
                        storeName: form.storeName.trim(),
                        storeAddress: form.storeAddress.trim(),
                        note: form.note.trim(),
                        storePhone: form.storePhone.trim(),
                      })
                    },
                    {
                      invalidate: [['agents', 'all']],
                      onSuccess: () => {
                        setOpen(false)
                        reset()
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