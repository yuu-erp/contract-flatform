import { beforeEach, describe, expect, it } from 'vitest'
import { applyDisplay, readDisplay, setDisplay } from '../src/display/display'

describe('display (nền + màu chủ đạo kiểu X)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-bg')
    document.documentElement.removeAttribute('data-accent')
    document.documentElement.className = ''
  })

  it('mặc định xanh dương, nền theo hệ điều hành', () => {
    const d = readDisplay()
    expect(d.accent).toBe('blue')
    expect(['light', 'dark']).toContain(d.background)
  })

  it('đọc khoá cũ meta-platform-theme', () => {
    localStorage.setItem('meta-platform-theme', 'dark')
    expect(readDisplay().background).toBe('dark')
  })

  it('bỏ giá trị lạ trong storage', () => {
    localStorage.setItem('meta-display', JSON.stringify({ background: 'neon', accent: 'gold' }))
    const d = readDisplay()
    expect(['light', 'dark']).toContain(d.background)
    expect(d.accent).toBe('blue')
  })

  it('applyDisplay gắn data-bg, data-accent và lớp dark cho Mờ / Tối hẳn', () => {
    const root = document.documentElement
    applyDisplay({ background: 'dim', accent: 'pink' }, root)
    expect(root.dataset.bg).toBe('dim')
    expect(root.dataset.accent).toBe('pink')
    expect(root.classList.contains('dark')).toBe(true)
    applyDisplay({ background: 'light', accent: 'green' }, root)
    expect(root.classList.contains('dark')).toBe(false)
    expect(root.classList.contains('light')).toBe(true)
  })

  it('setDisplay lưu và áp dụng ngay', () => {
    setDisplay({ background: 'dark', accent: 'purple' })
    expect(JSON.parse(localStorage.getItem('meta-display')!)).toEqual({ background: 'dark', accent: 'purple' })
    expect(document.documentElement.dataset.accent).toBe('purple')
  })
})
