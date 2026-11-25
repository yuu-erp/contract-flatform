import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SystemErrorScreen } from '../src/components/SystemErrorScreen'

describe('SystemErrorScreen', () => {
  afterEach(() => vi.useRealTimers())

  it('hiện thông báo, chi tiết và gọi Thử lại', () => {
    const onRetry = vi.fn()
    render(<SystemErrorScreen detail="TypeError: Failed to fetch" onRetry={onRetry} autoRetrySeconds={0} />)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Không kết nối được hệ thống')).toBeTruthy()
    expect(screen.getByText('TypeError: Failed to fetch')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Thử lại/ }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('tự thử lại sau khi đếm ngược', () => {
    vi.useFakeTimers()
    const onRetry = vi.fn()
    render(<SystemErrorScreen onRetry={onRetry} autoRetrySeconds={3} />)
    expect(screen.getByText('Tự thử lại sau 3 giây.')).toBeTruthy()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('đang thử lại thì khoá nút', () => {
    render(<SystemErrorScreen onRetry={() => {}} retrying />)
    expect((screen.getByRole('button', { name: /Đang thử lại/ }) as HTMLButtonElement).disabled).toBe(true)
  })
})
