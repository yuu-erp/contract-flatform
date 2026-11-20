import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Menu, X, type LucideIcon } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Address } from './Address'
import { Button } from '../primitives/button'

export type AppMenuItem = {
  to: string
  label: string
  end?: boolean
  icon?: LucideIcon
}

export type AgentContextOption = {
  key: string
  label: string
}

export function AppShell({
  title,
  subtitle = 'Dashboard on-chain',
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
  headerWallet,
  topbarTitle,
  main,
}: {
  title: string
  subtitle?: string
  menu: AppMenuItem[]
  chainLabel: string
  walletAddress?: string
  roleBadge?: ReactNode
  paused?: boolean
  headerWallet?: ReactNode
  topbarTitle?: ReactNode
  main?: ReactNode
  contextOptions?: AgentContextOption[]
  contextValue?: string
  onContextChange?: (key: string) => void
  headerExtra?: ReactNode
  sidebarFooter?: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = (
    <>
      {menu.map((item) => {
        const Icon = item.icon ?? LayoutDashboard
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                isActive
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
              )
            }
          >
            <Icon className="size-4 shrink-0 opacity-80" />
            {item.label}
          </NavLink>
        )
      })}
    </>
  )

  return (
    <div className="flex h-full min-h-dvh bg-background">
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">{navLinks}</nav>
        <div className="border-t border-sidebar-border p-2">{sidebarFooter}</div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/50 px-4 backdrop-blur-sm sm:gap-3">
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
              <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(85%,16rem)] flex-col border-r border-sidebar-border bg-sidebar p-3 shadow-lg md:hidden">
                <div className="mb-3 flex items-center justify-between">
                  <Dialog.Title className="text-sm font-semibold">{title}</Dialog.Title>
                  <button type="button" aria-label="Đóng" onClick={() => setMobileOpen(false)}>
                    <X className="size-5" />
                  </button>
                </div>
                <nav className="flex flex-col gap-0.5">{navLinks}</nav>
                <div className="mt-auto pt-4">{sidebarFooter}</div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <div className="min-w-0 flex-1 text-sm font-medium tracking-tight">{topbarTitle}</div>

          <span className="hidden rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium sm:inline">
            Chain {chainLabel}
          </span>
          {headerWallet ?? (
            walletAddress ? (
              <Address value={walletAddress} className="max-w-[40vw] truncate sm:max-w-none" />
            ) : (
              <span className="text-sm text-muted-foreground">Chưa kết nối ví</span>
            )
          )}
          {roleBadge}
          {contextOptions && contextOptions.length > 0 ? (
            <select
              className="h-9 max-w-[45vw] rounded-md border border-input bg-background px-2 text-sm sm:max-w-none"
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
          {headerExtra}
        </header>

        {paused ? (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-950 dark:text-amber-100">
            Hệ đang tạm dừng — các thao tác ghi on-chain bị khoá.
          </div>
        ) : null}

        <main className="min-h-0 flex-1 overflow-auto bg-muted/35 p-4 md:p-6">{main ?? <Outlet />}</main>
      </div>
    </div>
  )
}