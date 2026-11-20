import { NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Address } from './Address'
import { Button } from '../primitives/button'

export type AppMenuItem = {
  to: string
  label: string
  end?: boolean
}

export type AgentContextOption = {
  key: string
  label: string
}

export function AppShell({
  title,
  menu,
  chainLabel,
  walletAddress,
  roleBadge,
  paused = false,
  contextOptions,
  contextValue,
  onContextChange,
  headerExtra,
  sidebarFooter,
}: {
  title: string
  menu: AppMenuItem[]
  chainLabel: string
  walletAddress?: string
  roleBadge?: ReactNode
  paused?: boolean
  contextOptions?: AgentContextOption[]
  contextValue?: string
  onContextChange?: (key: string) => void
  headerExtra?: ReactNode
  sidebarFooter?: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = (
    <>
      {menu.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-2 text-sm',
              isActive ? 'bg-sidebar-accent font-medium' : 'text-muted-foreground hover:bg-sidebar-accent/70',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar p-4 md:flex md:flex-col">
        <p className="mb-4 text-lg font-semibold">{title}</p>
        <nav className="flex flex-col gap-1">{navLinks}</nav>
        <div className="mt-auto pt-6">{sidebarFooter}</div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              aria-label="Mở menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 md:hidden" />
              <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(85%,16rem)] border-r border-border bg-sidebar p-4 shadow-lg md:hidden">
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
                  <button type="button" aria-label="Đóng" onClick={() => setMobileOpen(false)}>
                    <X className="size-5" />
                  </button>
                </div>
                <nav className="flex flex-col gap-1">{navLinks}</nav>
                <div className="mt-6">{sidebarFooter}</div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">Chain {chainLabel}</span>
          {walletAddress ? (
            <Address value={walletAddress} className="max-w-[40vw] truncate sm:max-w-none" />
          ) : (
            <span className="text-sm text-muted-foreground">Chưa kết nối ví</span>
          )}
          {roleBadge}
          {contextOptions && contextOptions.length > 0 ? (
            <select
              className="max-w-[45vw] rounded-md border border-border bg-background px-2 py-1 text-sm sm:max-w-none"
              value={contextValue}
              onChange={(e) => onContextChange?.(e.target.value)}
            >
              {contextOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : null}
          <div className="w-full sm:ml-auto sm:w-auto">{headerExtra}</div>
        </header>
        {paused ? (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-900 dark:text-amber-100">
            Hệ đang tạm dừng — các thao tác ghi on-chain bị khoá.
          </div>
        ) : null}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}