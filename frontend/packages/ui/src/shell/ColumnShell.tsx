import { Ellipsis, LayoutDashboard, Palette, X as Close, type LucideIcon } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useMemo, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { DisplaySettingsDialog } from '../display/DisplaySettingsDialog'
import { cn } from '../lib/cn'
import { ShellContext } from './shell-context'

export type ShellNavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export type ShellAccount = {
  avatar: ReactNode
  name: ReactNode
  handle: ReactNode
  /** Nội dung khi bấm vào tài khoản (đổi ví, đăng xuất…). */
  menu?: ReactNode
}

/**
 * Bố cục 3 cột theo kiểu X: điều hướng trái, cột nội dung 600px viền hai bên, cột phải 350px.
 * Điện thoại: thanh tab dưới đáy + nút hành động nổi.
 */
export function ColumnShell({
  brand,
  brandIcon: BrandIcon = LayoutDashboard,
  nav,
  primaryAction,
  account,
  rightRail,
  banner,
  children,
}: {
  brand: string
  brandIcon?: LucideIcon
  nav: ShellNavItem[]
  /** Nút lớn dưới menu (vd. "Tạo agent"); `icon` hiện khi thu gọn. */
  primaryAction?: { label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean; title?: string }
  account?: ShellAccount
  rightRail?: ReactNode
  /** Dải thông báo trên cùng cột giữa (vd. hệ đang tạm dừng). */
  banner?: ReactNode
  children: ReactNode
}) {
  const [displayOpen, setDisplayOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const ctx = useMemo(
    () => ({
      openMobileMenu: () => setMobileOpen(true),
      openDisplay: () => setDisplayOpen(true),
      mobileAvatar: account?.avatar,
    }),
    [account?.avatar],
  )

  const navItem = (item: ShellNavItem, drawer: boolean, onClick?: () => void) => {
    const Icon = item.icon
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onClick}
        title={item.label}
        className="group flex w-full outline-none"
      >
        {({ isActive }) => (
          <span
            className={cn(
              'inline-flex items-center gap-5 rounded-full p-3 text-xl leading-6 transition-colors group-hover:bg-hover group-focus-visible:ring-2 group-focus-visible:ring-primary',
              isActive ? 'font-bold' : 'font-normal',
              drawer ? 'pr-6' : 'xl:pr-6',
            )}
          >
            <Icon className="size-[26px] shrink-0" strokeWidth={isActive ? 2.6 : 1.8} />
            <span className={drawer ? 'inline' : 'hidden xl:inline'}>{item.label}</span>
          </span>
        )}
      </NavLink>
    )
  }

  return (
    <ShellContext value={ctx}>
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex w-full justify-center sm:px-0">
          {/* Điều hướng trái */}
          <header className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col items-center px-2 sm:flex xl:w-[275px] xl:items-stretch xl:px-3">
            <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-1 xl:items-stretch">
              <NavLink
                to="/"
                aria-label={brand}
                className="mb-1 inline-flex size-[52px] items-center justify-center rounded-full transition-colors hover:bg-hover"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <BrandIcon className="size-5" strokeWidth={2.4} />
                </span>
              </NavLink>
              <nav className="flex w-full flex-col items-center gap-1 xl:items-stretch">
                {nav.map((item) => navItem(item, false))}
                <button type="button" onClick={() => setDisplayOpen(true)} className="group flex w-full outline-none" title="Hiển thị">
                  <span className="inline-flex items-center gap-5 rounded-full p-3 text-xl leading-6 transition-colors group-hover:bg-hover group-focus-visible:ring-2 group-focus-visible:ring-primary xl:pr-6">
                    <Palette className="size-[26px] shrink-0" strokeWidth={1.8} />
                    <span className="hidden xl:inline">Hiển thị</span>
                  </span>
                </button>
              </nav>
              {primaryAction ? (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  title={primaryAction.title ?? primaryAction.label}
                  className="mt-4 inline-flex size-[52px] items-center justify-center rounded-full bg-primary text-[17px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 xl:h-[52px] xl:w-[90%] xl:self-start"
                >
                  <primaryAction.icon className="size-6 xl:hidden" strokeWidth={2.4} />
                  <span className="hidden xl:inline">{primaryAction.label}</span>
                </button>
              ) : null}
            </div>
            {account ? (
              <div className="relative my-3 w-full">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex w-full items-center justify-center gap-3 rounded-full p-3 text-left transition-colors hover:bg-hover xl:justify-start"
                >
                  {account.avatar}
                  <span className="hidden min-w-0 flex-1 xl:block">
                    <span className="block truncate text-[15px] font-bold">{account.name}</span>
                    <span className="block truncate text-[15px] text-muted-foreground">{account.handle}</span>
                  </span>
                  <Ellipsis className="hidden size-5 xl:block" />
                </button>
                {accountOpen && account.menu ? (
                  <>
                    <button
                      type="button"
                      aria-label="Đóng"
                      className="fixed inset-0 z-30 cursor-default"
                      onClick={() => setAccountOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 z-40 mb-2 w-[300px] overflow-hidden rounded-2xl bg-background py-3 shadow-[0_0_15px_rgb(101_119_134/0.2),0_0_3px_1px_rgb(101_119_134/0.15)]">
                      {account.menu}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </header>

          {/* Cột nội dung */}
          <main className="min-h-dvh w-full max-w-[600px] min-w-0 border-border pb-16 sm:border-x sm:pb-0">
            {banner}
            {children}
          </main>

          {/* Cột phải */}
          {rightRail ? (
            <aside className="hidden w-[290px] shrink-0 pl-6 lg:block xl:w-[350px] xl:pl-8">
              <div className="sticky top-0 flex max-h-dvh flex-col gap-4 overflow-y-auto pt-1.5 pb-16">{rightRail}</div>
            </aside>
          ) : null}
        </div>

        {/* Điện thoại: thanh tab dưới */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[53px] items-center justify-around border-t border-border bg-background/90 backdrop-blur-md sm:hidden">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-label={item.label}
                className="flex flex-1 justify-center py-2"
              >
                {({ isActive }) => <Icon className="size-[26px]" strokeWidth={isActive ? 2.6 : 1.8} />}
              </NavLink>
            )
          })}
        </nav>
        {primaryAction ? (
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            aria-label={primaryAction.label}
            className="fixed right-4 bottom-[72px] z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg disabled:opacity-50 sm:hidden"
          >
            <primaryAction.icon className="size-6" strokeWidth={2.4} />
          </button>
        ) : null}

        {/* Điện thoại: ngăn kéo tài khoản */}
        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay sm:hidden" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(85%,300px)] flex-col overflow-y-auto bg-background shadow-xl outline-none sm:hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <Dialog.Title className="text-[17px] font-bold">{brand}</Dialog.Title>
                <button type="button" aria-label="Đóng" className="rounded-full p-1.5 hover:bg-hover" onClick={() => setMobileOpen(false)}>
                  <Close className="size-5" />
                </button>
              </div>
              {account ? (
                <div className="px-4 pb-3">
                  {account.avatar}
                  <p className="mt-2 text-[17px] font-bold">{account.name}</p>
                  <p className="text-[15px] text-muted-foreground">{account.handle}</p>
                </div>
              ) : null}
              <div className="border-t border-border py-2">
                {nav.map((item) => (
                  <div key={item.to} className="px-2">
                    {navItem(item, true, () => setMobileOpen(false))}
                  </div>
                ))}
                <button
                  type="button"
                  className="flex w-full items-center gap-5 px-5 py-3 text-xl hover:bg-hover"
                  onClick={() => {
                    setMobileOpen(false)
                    setDisplayOpen(true)
                  }}
                >
                  <Palette className="size-[26px]" strokeWidth={1.8} /> Hiển thị
                </button>
              </div>
              {account?.menu ? <div className="mt-auto border-t border-border py-2">{account.menu}</div> : null}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <DisplaySettingsDialog open={displayOpen} onOpenChange={setDisplayOpen} brand={brand} />
      </div>
    </ShellContext>
  )
}
