import { useContracts } from '@meta-platform/chain'
import { useAppTx } from '@meta-platform/ui'
import { Button, Input, utf8Length } from '@meta-platform/ui'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'
import type { AgentListRow } from '../lib/agent-list'
import { usePlatformWrite } from '../hooks/use-platform-write'
import { SERVICE_MASK, validateCreateAgentForm, type CreateAgentForm } from '../lib/validate-create-agent'
import { validateReason } from '../lib/validate-reason'

export type AgentManageMode = 'edit' | 'suspend' | 'resume' | 'delete'

type Props = {
  row: AgentListRow
  mode: AgentManageMode
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}

export function AgentManageDialog({ row, mode, open, onOpenChange, onDone }: Props) {
  const contracts = useContracts()
  const { canWrite, paused } = usePlatformWrite()
  const tx = useAppTx()

  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const [form, setForm] = useState<CreateAgentForm>({
    owner: row.owner,
    storeName: row.profileName ?? '',
    storeAddress: row.storeAddress ?? '',
    note: '',
    storePhone: row.storePhone ?? '',
    allowedServices: row.allowedServices,
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    if (!open || mode !== 'edit' || !contracts) return
    setLoadingProfile(true)
    void contracts.agents
      .getAgentProfile(row.id)
      .then((rec) => {
        setForm((prev) => ({
          ...prev,
          storeName: rec.profile.storeName,
          storeAddress: rec.profile.storeAddress,
          note: rec.profile.note,
          storePhone: rec.profile.storePhone,
          allowedServices: row.allowedServices,
        }))
      })
      .finally(() => setLoadingProfile(false))
  }, [open, mode, contracts, row.id, row.allowedServices])

  useEffect(() => {
    if (!open) {
      setReason('')
      setReasonError(null)
      setFieldErrors({})
    }
  }, [open])

  const titles: Record<AgentManageMode, string> = {
    edit: `Sửa hồ sơ agent #${row.id}`,
    suspend: `Tạm dừng agent #${row.id}`,
    resume: `Mở lại agent #${row.id}`,
    delete: `Xoá agent #${row.id}`,
  }

  const toggleService = (bit: number) => {
    setForm((prev) => ({
      ...prev,
      allowedServices: prev.allowedServices & bit ? prev.allowedServices & ~bit : prev.allowedServices | bit,
    }))
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[90dvh] w-[min(100%-2rem,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto z-50 rounded-2xl bg-background p-6 text-[15px] shadow-[0_0_15px_rgb(101_119_134/0.2)] outline-none">
          <Dialog.Title className="text-xl leading-6 font-extrabold">{titles[mode]}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {canWrite
              ? 'Giao dịch ghi on-chain bằng ví Owner hoặc Admin nền tảng.'
              : paused
                ? 'Hệ đang tạm dừng. Mở lại ở mục Hệ thống trước khi ghi.'
                : 'Chỉ Owner hoặc Admin nền tảng được ghi.'}
          </Dialog.Description>

          <div className="mt-4 space-y-3 text-sm">
            {mode === 'edit' ? (
              loadingProfile ? (
                <p className="text-muted-foreground">Đang tải hồ sơ…</p>
              ) : (
                <>
                  <label className="block space-y-1">
                    <span>Tên cửa hàng ({utf8Length(form.storeName.trim())}/100 byte)</span>
                    <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                    {fieldErrors.storeName && <p className="text-destructive">{fieldErrors.storeName}</p>}
                  </label>
                  <label className="block space-y-1">
                    <span>Địa chỉ</span>
                    <Input value={form.storeAddress} onChange={(e) => setForm({ ...form, storeAddress: e.target.value })} />
                    {fieldErrors.storeAddress && <p className="text-destructive">{fieldErrors.storeAddress}</p>}
                  </label>
                  <label className="block space-y-1">
                    <span>Ghi chú</span>
                    <textarea
                      className="min-h-[4rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                    />
                    {fieldErrors.note && <p className="text-destructive">{fieldErrors.note}</p>}
                  </label>
                  <label className="block space-y-1">
                    <span>SĐT</span>
                    <Input value={form.storePhone} onChange={(e) => setForm({ ...form, storePhone: e.target.value })} />
                    {fieldErrors.storePhone && <p className="text-destructive">{fieldErrors.storePhone}</p>}
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
                </>
              )
            ) : (
              <label className="block space-y-1">
                <span>Lý do (bắt buộc)</span>
                <textarea
                  className="min-h-[4rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Mô tả ngắn gọn lý do thay đổi trạng thái"
                />
                {reasonError && <p className="text-destructive">{reasonError}</p>}
              </label>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!canWrite || tx.pending || (mode === 'edit' && loadingProfile)}
              onClick={() => {
                void tx.run(
                  async () => {
                    if (mode === 'edit') {
                      const errors = validateCreateAgentForm({ ...form, owner: row.owner })
                      delete errors.owner
                      setFieldErrors(errors)
                      if (Object.keys(errors).length > 0) throw new Error('invalid')
                      const profile = {
                        storeName: form.storeName.trim(),
                        storeAddress: form.storeAddress.trim(),
                        note: form.note.trim(),
                        storePhone: form.storePhone.trim(),
                      }
                      await contracts!.agents.updateAgentProfile(row.id, profile)
                      if (form.allowedServices !== row.allowedServices) {
                        await contracts!.agents.setAgentServices(row.id, form.allowedServices)
                      }
                    } else {
                      const err = validateReason(reason)
                      setReasonError(err)
                      if (err) throw new Error('invalid')
                      if (mode === 'suspend') await contracts!.agents.suspendAgent(row.id, reason.trim())
                      else if (mode === 'resume') await contracts!.agents.resumeAgent(row.id, reason.trim())
                      else await contracts!.agents.deleteAgent(row.id, reason.trim())
                    }
                  },
                  {
                    invalidate: [['agents', 'all']],
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