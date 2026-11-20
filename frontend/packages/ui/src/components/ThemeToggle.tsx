import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../lib/cn'
import { Button } from '../primitives/button'

const STORAGE_KEY = 'meta-platform-theme'

function applyTheme(mode: 'light' | 'dark') {
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null
    const initial =
      saved ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  applyTheme(initial)
    setDark(initial === 'dark')
  }, [])

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn('size-9 shrink-0 px-0', className)}
      aria-label={dark ? 'Giao diện sáng' : 'Giao diện tối'}
      onClick={() => {
        const next = dark ? 'light' : 'dark'
        applyTheme(next)
        localStorage.setItem(STORAGE_KEY, next)
        setDark(!dark)
      }}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}