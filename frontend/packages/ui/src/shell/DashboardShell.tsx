import { Menu, Palette, X as Close, type LucideIcon } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { DisplaySettingsDialog } from '../display/DisplaySettingsDialog'
import { cn } from '../lib/cn'

export type DashboardNavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export type DashboardAccount = {
  avatar: ReactNode
  name: ReactNode
  handle: ReactNode
  menu?: ReactNode
}

/**
 * Khung dashboard theo phong cách X: sidebar trái (menu viên thuốc, nút hành động chính, tài khoản),
 * thanh trên dính nền mờ (tìm kiếm, trạng thái, Hiển thị), nội dung rộng dạng lưới.
 */
export function DashboardShell({
  brand,
  brandIcon: BrandIcon,
  nav,
  primaryAction,
  account,
  topbarLeft,
  topbarRight,
  banner,
  children,
}: {
  brand: string
  brandIcon: LucideIcon
  nav: DashboardNavItem[]
  primaryAction?: { label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean; title?: string }
  account?: DashboardAccount
  topbarLeft?: ReactNode
  topbarRight?: ReactNode
  banner?: ReactNode
  children: ReactNode
}) {
  const [displayOpen, setDisplayOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const navList = (expanded: boolean, onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 rounded-full px-3 py-2.5 text-[17px] transition-colors outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-primary',
                isActive ? 'bg-hover font-bold' : 'font-medium text-foreground/90',
                !expanded && 'justify-center xl:justify-start',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-6 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={expanded ? 'inline' : 'hidden xl:inline'}>{item.label}</span>
              </>
            )}
          </NavLink>
        )
      })}
      <button
        type="button"
        title="Hiển thị"
        onClick={() => {
          onNavigate?.()
          setDisplayOpen(true)
        }}
        className={cn(
          'flex items-center gap-4 rounded-full px-3 py-2.5 text-[17px] font-medium transition-colors hover:bg-hover',
          !expanded && 'justify-center xl:justify-start',
        )}
      >
        <Palette className="size-6 shrink-0" strokeWidth={1.8} />
        <span className={expanded ? 'inline' : 'hidden xl:inline'}>Hiển thị</span>
      </button>
    </nav>
  )

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[76px] shrink-0 flex-col border-r border-border px-3 py-3 md:flex xl:w-[264px] xl:px-4">
        <div className="mb-4 flex items-center gap-3 px-1.5 xl:px-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BrandIcon className="size-5" strokeWidth={2.4} />
          </span>
          <span className="hidden text-[19px] font-extrabold tracking-tight xl:inline">{brand}</span>
        </div>
        {navList(false)}
        {primaryAction ? (
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            title={primaryAction.title ?? primaryAction.label}
            className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-[17px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <primaryAction.icon className="size-5" strokeWidth={2.4} />
            <span className="hidden xl:inline">{primaryAction.label}</span>
          </button>
        ) : null}
        <div className="flex-1" />
        {account ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              className="flex w-full items-center justify-center gap-3 rounded-full p-2 text-left transition-colors hover:bg-hover xl:justify-start"
            >
              {account.avatar}
              <span className="hidden min-w-0 flex-1 xl:block">
                <span className="block truncate text-[15px] font-bold">{account.name}</span>
                <span className="block truncate text-[13px] text-muted-foreground">{account.handle}</span>
              </span>
            </button>
            {accountOpen && account.menu ? (
              <>
                <button type="button" aria-label="Đóng" className="fixed inset-0 z-30 cursor-default" onClick={() => setAccountOpen(false)} />
                <div className="absolute bottom-full left-0 z-40 mb-2 w-[280px] overflow-hidden rounded-2xl bg-background py-2 shadow-[0_0_15px_rgb(101_119_134/0.2),0_0_3px_1px_rgb(101_119_134/0.15)]">
                  {account.menu}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </aside>

      {/* Cột nội dung */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6">
          <button
            type="button"
            aria-label="Mở menu"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-hover md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">{topbarLeft}</div>
          <div className="flex shrink-0 items-center gap-2">
            {topbarRight}
            <button
              type="button"
              aria-label="Hiển thị"
              title="Hiển thị"
              onClick={() => setDisplayOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-hover"
            >
              <Palette className="size-5" />
            </button>
          </div>
        </header>
        {banner}
        <main className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>

      {/* Ngăn kéo trên điện thoại */}
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay md:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(85%,300px)] flex-col overflow-y-auto bg-background p-3 shadow-xl outline-none md:hidden">
            <div className="mb-3 flex items-center justify-between px-2">
              <Dialog.Title className="flex items-center gap-2 text-[17px] font-extrabold">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BrandIcon className="size-4" />
                </span>
                {brand}
              </Dialog.Title>
              <button type="button" aria-label="Đóng" className="rounded-full p-2 hover:bg-hover" onClick={() => setMobileOpen(false)}>
                <Close className="size-5" />
              </button>
            </div>
            {navList(true, () => setMobileOpen(false))}
            {primaryAction ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  primaryAction.onClick()
                }}
                disabled={primaryAction.disabled}
                className="mt-4 h-12 rounded-full bg-primary text-[17px] font-bold text-primary-foreground disabled:opacity-50"
              >
                {primaryAction.label}
              </button>
            ) : null}
            {account ? (
              <div className="mt-auto border-t border-border pt-3">
                <div className="flex items-center gap-3 px-2 pb-2">
                  {account.avatar}
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-bold">{account.name}</span>
                    <span className="block truncate text-[13px] text-muted-foreground">{account.handle}</span>
                  </span>
                </div>
                {account.menu}
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <DisplaySettingsDialog open={displayOpen} onOpenChange={setDisplayOpen} brand={brand} />
    </div>
  )
}
