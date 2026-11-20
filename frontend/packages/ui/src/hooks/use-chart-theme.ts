import { useEffect, useState } from 'react'

export function useChartDarkMode(): boolean {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const read = () => {
      const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
      const classDark = document.documentElement.classList.contains('dark')
      setDark(classDark || prefers)
    }
    read()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', read)
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      mq.removeEventListener('change', read)
      observer.disconnect()
    }
  }, [])

  return dark
}