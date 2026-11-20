import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { LedgerApi } from '../src/api'
import { useRollup } from '../src/react/hooks/use-rollup'

describe('useRollup', () => {
  it('chunks 200 days into 3 rollup calls and merges rows', async () => {
    const rollup = vi.fn<LedgerApi['rollup']>()
    rollup.mockImplementation(async (_scope, _id, fromDay, toDay) => {
      const len = toDay - fromDay + 1
      return Array.from({ length: len }, (_, i) => {
        const row = Array.from({ length: 32 }, () => 0n)
        row[0] = BigInt(fromDay + i)
        return row
      })
    })
    const ledger = { rollup } as unknown as LedgerApi

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useRollup({ ledger, scope: 0, id: 0, fromDay: 0, toDay: 199 }), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(rollup).toHaveBeenCalledTimes(3)
    expect(result.current.data?.length).toBe(200)
    expect(result.current.data?.[0][0]).toBe(0n)
    expect(result.current.data?.[199][0]).toBe(199n)
  })
})