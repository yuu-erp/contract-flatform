import { describe, expect, it, vi } from 'vitest'
import { isConnectivityError, RpcTimeoutError, withTimeout } from '../src/network'

describe('network', () => {
  it('withTimeout trả kết quả khi kịp', async () => {
    await expect(withTimeout(Promise.resolve(7), 1000)).resolves.toBe(7)
  })

  it('withTimeout ném RpcTimeoutError khi treo', async () => {
    vi.useFakeTimers()
    const p = withTimeout(new Promise(() => {}), 5000, 'Kiểm tra quyền')
    vi.advanceTimersByTime(5000)
    await expect(p).rejects.toBeInstanceOf(RpcTimeoutError)
    vi.useRealTimers()
  })

  it('nhận diện lỗi kết nối', () => {
    expect(isConnectivityError(new TypeError('Failed to fetch'))).toBe(true)
    expect(isConnectivityError(new Error('connect ECONNREFUSED 127.0.0.1:8545'))).toBe(true)
    expect(isConnectivityError({ error: { message: 'HTTP 503 Service Unavailable' } })).toBe(true)
    expect(isConnectivityError(new RpcTimeoutError('x', 1000))).toBe(true)
    expect(isConnectivityError(new Error('execution reverted: NotPlatformAdmin'))).toBe(false)
  })
})
