import { useIsDarkDisplay } from '../display/display'

/** Theme cho SDK ví — theo cài đặt Hiển thị (nền Mờ / Tối hẳn = tối). */
export function useWalletTheme(): 'light' | 'dark' {
  return useIsDarkDisplay() ? 'dark' : 'light'
}
