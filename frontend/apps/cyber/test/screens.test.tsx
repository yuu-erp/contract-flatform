import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { AppRoutes } from '../src/App'

afterEach(cleanup)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('các màn hình chính', () => {
  it('chọn vai trò', () => {
    renderAt('/')
    expect(screen.getByText('Owner')).toBeTruthy()
    expect(screen.getByText('Người chơi')).toBeTruthy()
  })

  it('owner: tổng quan + menu đang mở', () => {
    renderAt('/owner')
    expect(screen.getByText('Tổng quan hệ thống')).toBeTruthy()
    expect(screen.getByText('Cyber Quận 1')).toBeTruthy()
  })

  it('manager: lọc máy theo trạng thái', () => {
    renderAt('/manager')
    expect(screen.getByText('Máy VIP-07')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^Bảo trì/ }))
    const tiles = screen.getAllByRole('button', { name: /· Bảo trì$/ })
    expect(tiles.length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /· Đang chơi$/ })).toBeNull()
  })

  it('staff: hàng đợi yêu cầu', () => {
    renderAt('/staff')
    expect(screen.getByText('Yêu cầu từ khách')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeTruthy()
  })

  it('launcher: thêm món vào giỏ', () => {
    renderAt('/launcher/food')
    fireEvent.click(screen.getByRole('button', { name: 'Thêm Aquafina' }))
    expect(screen.getByText('1 món · 10.000 xu')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Thêm Mì trộn' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('launcher: tìm game', () => {
    renderAt('/launcher')
    fireEvent.change(screen.getByPlaceholderText('Tìm kiếm game…'), { target: { value: 'steam' } })
    const grid = screen.getByRole('button', { name: 'Chơi Steam' })
    expect(within(grid).getByText('Steam')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Chơi Beat Rush' })).toBeNull()
  })
})
