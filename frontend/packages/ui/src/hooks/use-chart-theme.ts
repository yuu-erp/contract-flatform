import { useIsDarkDisplay } from '../display/display'

export function useChartDarkMode(): boolean {
  return useIsDarkDisplay()
}
