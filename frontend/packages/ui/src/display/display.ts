import { useSyncExternalStore } from 'react'

/** Nền giống X: Mặc định (trắng), Mờ (xanh đêm), Tối hẳn (đen). */
export type DisplayBackground = 'light' | 'dim' | 'dark'
export type DisplayAccent = 'blue' | 'yellow' | 'pink' | 'purple' | 'orange' | 'green'

/** Cỡ chữ 5 nấc như X; đổi cỡ gốc của <html> nên chữ, khoảng cách, nút co giãn cùng nhau. */
export type DisplayFontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type DisplaySettings = {
  background: DisplayBackground
  accent: DisplayAccent
  fontSize: DisplayFontSize
}

/** Cỡ gốc (px) của <html>. Mặc định 15px: nhỏ hơn mặc định trình duyệt (16px) cho gần X. */
export const DISPLAY_FONT_SIZES: { id: DisplayFontSize; label: string; px: number }[] = [
  { id: 'xs', label: 'Rất nhỏ', px: 13 },
  { id: 'sm', label: 'Nhỏ', px: 14 },
  { id: 'md', label: 'Mặc định', px: 15 },
  { id: 'lg', label: 'Lớn', px: 16 },
  { id: 'xl', label: 'Rất lớn', px: 17 },
]
export const DEFAULT_FONT_SIZE: DisplayFontSize = 'md'

export const DISPLAY_ACCENTS: { id: DisplayAccent; label: string; hex: string }[] = [
  { id: 'blue', label: 'Xanh dương', hex: '#1D9BF0' },
  { id: 'yellow', label: 'Vàng', hex: '#FFD400' },
  { id: 'pink', label: 'Hồng', hex: '#F91880' },
  { id: 'purple', label: 'Tím', hex: '#7856FF' },
  { id: 'orange', label: 'Cam', hex: '#FF7A00' },
  { id: 'green', label: 'Xanh lục', hex: '#00BA7C' },
]

export const DISPLAY_BACKGROUNDS: { id: DisplayBackground; label: string; bg: string; fg: string }[] = [
  { id: 'light', label: 'Mặc định', bg: '#FFFFFF', fg: '#0F1419' },
  { id: 'dim', label: 'Mờ', bg: '#15202B', fg: '#F7F9F9' },
  { id: 'dark', label: 'Tối hẳn', bg: '#000000', fg: '#E7E9EA' },
]

const STORAGE_KEY = 'meta-display'
const LEGACY_THEME_KEY = 'meta-platform-theme'

const isBackground = (v: unknown): v is DisplayBackground => v === 'light' || v === 'dim' || v === 'dark'
const isAccent = (v: unknown): v is DisplayAccent => DISPLAY_ACCENTS.some((a) => a.id === v)
const isFontSize = (v: unknown): v is DisplayFontSize => DISPLAY_FONT_SIZES.some((f) => f.id === v)

function systemPrefersDark(): boolean {
  try {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

/** Đọc cài đặt đã lưu; lỗi storage (chế độ riêng tư…) thì dùng mặc định theo hệ điều hành. */
export function readDisplay(): DisplaySettings {
  const fallback: DisplaySettings = {
    background: systemPrefersDark() ? 'dark' : 'light',
    accent: 'blue',
    fontSize: DEFAULT_FONT_SIZE,
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DisplaySettings>
      return {
        background: isBackground(parsed.background) ? parsed.background : fallback.background,
        accent: isAccent(parsed.accent) ? parsed.accent : fallback.accent,
        fontSize: isFontSize(parsed.fontSize) ? parsed.fontSize : fallback.fontSize,
      }
    }
    const legacy = window.localStorage.getItem(LEGACY_THEME_KEY)
    if (legacy === 'dark' || legacy === 'light') return { ...fallback, background: legacy }
  } catch {
    // bỏ qua
  }
  return fallback
}

export function applyDisplay(settings: DisplaySettings, root: HTMLElement = document.documentElement) {
  root.dataset.bg = settings.background
  root.dataset.accent = settings.accent
  root.dataset.fontSize = settings.fontSize
  const px = DISPLAY_FONT_SIZES.find((f) => f.id === settings.fontSize)?.px ?? 15
  root.style.fontSize = `${px}px`
  const dark = settings.background !== 'light'
  root.classList.toggle('dark', dark)
  root.classList.toggle('light', !dark)
}

let current: DisplaySettings | null = null
const listeners = new Set<() => void>()

function snapshot(): DisplaySettings {
  if (!current) current =
      typeof window === 'undefined'
        ? { background: 'light', accent: 'blue', fontSize: DEFAULT_FONT_SIZE }
        : readDisplay()
  return current
}

/** Gọi một lần trước khi render để tránh nháy màu. */
export function initDisplay() {
  applyDisplay(snapshot())
}

export function setDisplay(patch: Partial<DisplaySettings>) {
  current = { ...snapshot(), ...patch }
  applyDisplay(current)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    // bỏ qua
  }
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useDisplay(): [DisplaySettings, (patch: Partial<DisplaySettings>) => void] {
  const value = useSyncExternalStore(subscribe, snapshot, snapshot)
  return [value, setDisplay]
}

/** Dùng cho SDK ví và biểu đồ: nền Mờ / Tối hẳn tính là tối. */
export function useIsDarkDisplay(): boolean {
  return useDisplay()[0].background !== 'light'
}
