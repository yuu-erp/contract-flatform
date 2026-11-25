import { Moon, Sun } from 'lucide-react'
import { useDisplay } from '../display/display'
import { cn } from '../lib/cn'
import { Button } from '../primitives/button'

/** Bật nhanh sáng ↔ tối (giữ nền Mờ nếu đang dùng). Đổi đầy đủ ở hộp Hiển thị. */
export function ThemeToggle({ className }: { className?: string }) {
  const [display, setDisplay] = useDisplay()
  const dark = display.background !== 'light'
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('shrink-0', className)}
      aria-label={dark ? 'Giao diện sáng' : 'Giao diện tối'}
      onClick={() => setDisplay({ background: dark ? 'light' : 'dark' })}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
