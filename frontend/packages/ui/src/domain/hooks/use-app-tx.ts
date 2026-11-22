import { useTx, type TxRunOptions } from '@meta-platform/chain'
import { useCallback } from 'react'
import { toast } from 'sonner'

/** `useTx` + toast mặc định cho dashboard agent/platform. */
export function useAppTx() {
  const tx = useTx()

  const run = useCallback(
    async (fn: () => Promise<void>, options?: TxRunOptions): Promise<boolean> => {
      const toastId = toast.loading('Đang chờ ký…')
      const ok = await tx.run(fn, {
        ...options,
        onSuccess: () => {
          toast.success('Thành công', { id: toastId })
          options?.onSuccess?.()
        },
        onError: (message) => {
          toast.error(message, { id: toastId })
          options?.onError?.(message)
        },
      })
      return ok
    },
    [tx],
  )

  return { run, pending: tx.pending, lastError: tx.lastError }
}