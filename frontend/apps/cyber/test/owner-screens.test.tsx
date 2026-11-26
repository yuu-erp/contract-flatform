import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../src/App'

afterEach(cleanup)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('owner: các luồng', () => {
  it.each([
    ['/owner/branches', 'Trần tăng ca'],
    ['/owner/floor', 'Khu Standard'],
    ['/owner/members', 'Ví xu theo chi nhánh nạp'],
    ['/owner/revenue', 'Theo chi nhánh'],
    ['/owner/pricing', 'Gói giờ'],
    ['/owner/vouchers', 'Điểm thưởng'],
    ['/owner/staff', 'Quy tắc quyền'],
    ['/owner/shifts', 'Đối soát két'],
    ['/owner/audit', 'Nhật ký'],
  ])('%s', (path, text) => {
    renderAt(path)
    expect(screen.getAllByText(text).length).toBeGreaterThan(0)
  })

  it('vị trí: quyền chỉ Manager bị khoá, bật/tắt quyền thường', () => {
    renderAt('/owner/staff')
    fireEvent.click(screen.getByRole('tab', { name: 'Vị trí & quyền' }))
    expect((screen.getByRole('button', { name: /Hoàn tiền/ }) as HTMLButtonElement).disabled).toBe(true)
    const reset = screen.getByRole('button', { name: 'Đặt lại mật khẩu' })
    expect(reset.className).not.toContain('text-play')
    fireEvent.click(reset)
    expect(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }).className).toContain('text-play')
  })

  it('ca: duyệt két', () => {
    renderAt('/owner/shifts')
    const before = screen.getAllByRole('button', { name: /Duyệt/ }).length
    fireEvent.click(screen.getAllByRole('button', { name: /Duyệt/ })[0]!)
    expect(screen.getAllByRole('button', { name: /Duyệt/ }).length).toBe(before - 1)
  })

  it('chi nhánh: đổi trần tăng ca bật nút lưu', () => {
    renderAt('/owner/branches')
    const save = screen.getByRole('button', { name: 'Lưu cấu hình' }) as HTMLButtonElement
    expect(save.disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: '2 giờ' }))
    expect(save.disabled).toBe(false)
  })
})
