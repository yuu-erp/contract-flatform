import { NavLink, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Address } from './Address'

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
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar p-4 md:flex md:flex-col">
        <p className="mb-4 text-lg font-semibold">{title}</p>
        <nav className="flex flex-col gap-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
        </nav>
        <div className="mt-auto pt-6">{sidebarFooter}</div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">Chain {chainLabel}</span>
          {walletAddress ? <Address value={walletAddress} /> : <span className="text-sm text-muted-foreground">Chưa kết nối ví</span>}
          {roleBadge}
          {contextOptions && contextOptions.length > 0 ? (
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
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
          <div className="ml-auto">{headerExtra}</div>
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