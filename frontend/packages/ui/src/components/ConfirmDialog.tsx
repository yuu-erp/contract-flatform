import { Dialog } from 'radix-ui'
import { useState } from 'react'
import { Button } from '../primitives/button'
import { cn } from '../lib/cn'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Xác nhận',
  requireReason = false,
  onConfirm,
  pending = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  requireReason?: boolean
  onConfirm: (reason: string) => void | Promise<void>
  pending?: boolean
}) {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const reasonValid = !requireReason || (trimmed.length >= 1 && trimmed.length <= 200)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-5 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          {description ? <Dialog.Description className="mt-2 text-sm text-muted-foreground">{description}</Dialog.Description> : null}
          {requireReason ? (
            <textarea
              className={cn(
                'mt-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm',
                'min-h-20 resize-y',
              )}
              maxLength={200}
              placeholder="Lý do (1–200 ký tự)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Huỷ
            </Button>
            <Button
              disabled={pending || !reasonValid}
              onClick={() => {
                void onConfirm(trimmed)
              }}
            >
              {pending ? 'Đang xử lý…' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}