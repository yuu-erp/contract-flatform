import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { decodeContractError } from '../../errors'

export type TxRunOptions = {
  invalidate?: QueryKey[]
  onError?: (message: string) => void
  onSuccess?: () => void
}

/** Chạy giao dịch on-chain; trả `true`/`false`, không ném — caller dùng toast qua `onError`. */
export function useTx() {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const run = useCallback(
    async (fn: () => Promise<void>, options?: TxRunOptions): Promise<boolean> => {
      setPending(true)
      setLastError(null)
      try {
        await fn()
        for (const key of options?.invalidate ?? []) {
          await queryClient.invalidateQueries({ queryKey: key })
        }
        options?.onSuccess?.()
        return true
      } catch (error) {
        const message = decodeContractError(error)
        setLastError(message)
        options?.onError?.(message)
        return false
      } finally {
        setPending(false)
      }
    },
    [queryClient],
  )

  return { run, pending, lastError }
}