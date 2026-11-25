import { createContext, use } from 'react'

export type ShellContextValue = {
  /** Mở ngăn kéo tài khoản / menu trên điện thoại. */
  openMobileMenu: () => void
  /** Mở hộp Tuỳ chỉnh hiển thị. */
  openDisplay: () => void
  /** Ảnh đại diện nhỏ cho header trên điện thoại. */
  mobileAvatar?: React.ReactNode
}

export const ShellContext = createContext<ShellContextValue | null>(null)

export function useShell(): ShellContextValue | null {
  return use(ShellContext)
}
