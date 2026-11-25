import { useContracts } from '@meta-platform/chain'
import { useAppTx } from '@meta-platform/ui'
import { Button, Input } from '@meta-platform/ui'
import { Dialog } from 'radix-ui'
import { useState } from 'react'
import { usePlatformWrite } from '../hooks/use-platform-write'
type Props = {
  agentId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}

export function ProposeOwnerDialog({ agentId, open, onOpenChange, onDone }: Props) {
  const contracts = useContracts()
  const tx = useAppTx()
  const { canWrite, adminOnlyHint } = usePlatformWrite()
  const [newOwner, setNewOwner] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl bg-background p-6 text-[15px] shadow-[0_0_15px_rgb(101_119_134/0.2)] outline-none">
          <Dialog.Title className="text-xl leading-6 font-extrabold">Đề xuất ví chủ mới</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {adminOnlyHint ?? 'Ví mới phải accept on-chain sau khi đề xuất.'}
          </Dialog.Description>
          <label className="mt-4 block space-y-1 text-sm">
            <span>Địa chỉ ví chủ mới</span>
            <Input value={newOwner} onChange={(e) => setNewOwner(e.target.value)} placeholder="0x…" />
            {error && <p className="text-destructive">{error}</p>}
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button
              disabled={!canWrite || tx.pending}
              onClick={() => {
                void tx.run(
                  async () => {
                    const trimmed = newOwner.trim()
                    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
                      setError('Địa chỉ ví không hợp lệ')
                      throw new Error('invalid')
                    }
                    await contracts!.agents.proposeAgentOwner(agentId, trimmed)
                  },
                  {
                    invalidate: [['agent', agentId]],
                    onSuccess: () => {
                      onOpenChange(false)
                      onDone?.()
                    },
                  },
                )
              }}
            >
              {tx.pending ? 'Đang ký…' : 'Đề xuất'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}