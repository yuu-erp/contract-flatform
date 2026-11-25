import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'
import { Button } from '../primitives/button'
import { cn } from '../lib/cn'
import { isReasonBytesValid, REASON_MAX_BYTES, utf8Length } from '../lib/format'

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
  const reasonValid = !requireReason || isReasonBytesValid(trimmed)
  const byteCount = utf8Length(trimmed)

  useEffect(() => {
    if (!open) setReason('')
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl bg-background p-6 text-[0.9375rem] shadow-[0_0_15px_rgb(101_119_134/0.2)] outline-none">
          <Dialog.Title className="text-xl leading-6 font-extrabold">{title}</Dialog.Title>
          {description ? <Dialog.Description className="mt-2 text-sm text-muted-foreground">{description}</Dialog.Description> : null}
          {requireReason ? (
            <div className="mt-4 space-y-1">
              <textarea
                className={cn(
                  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm',
                  'min-h-20 resize-y',
                )}
                placeholder="Lý do (1–200 byte UTF-8)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className={cn('text-xs', byteCount > REASON_MAX_BYTES ? 'text-destructive' : 'text-muted-foreground')}>
                {byteCount}/{REASON_MAX_BYTES} byte
              </p>
            </div>
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