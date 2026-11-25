import { Gamepad2, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { CountBadge } from './Badge'
import { cn } from './cn'

export type NavItem = { to: string; label: string; icon: LucideIcon; badge?: number; end?: boolean }
export type NavSection = { title?: string; items: NavItem[] }

export function navItemClass(active: boolean) {
  return cn(
    'flex items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-[11px] text-sm font-bold whitespace-nowrap transition',
    active
      ? 'border-edge-strong bg-white/10 text-white shadow-[0_6px_18px_rgb(0_0_0/0.25)]'
      : 'border-transparent text-white/85 hover:bg-white/5',
  )
}

/** Thương hiệu đầu sidebar. */
export function Brand({ subtitle = 'Cyber game management' }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 px-2 pt-0.5 pb-4">
      <span className="grid size-[38px] place-items-center rounded-xl bg-gradient-to-br from-[#60a5fa] via-[#a78bfa] to-[#f472b6] shadow-[0_6px_20px_rgb(167_139_250/0.45)]">
        <Gamepad2 className="size-5" />
      </span>
      <div>
        <div className="text-[17px] font-extrabold">Meta Net</div>
        <div className="text-[11px] text-ink-dim">{subtitle}</div>
      </div>
    </div>
  )
}

/** Danh sách menu theo nhóm; mục đang mở có viền trắng sáng. */
export function SideNav({ sections, footer }: { sections: NavSection[]; footer?: ReactNode }) {
  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
      {sections.map((sec, k) => (
        <div key={sec.title ?? k} className="flex flex-col gap-1">
          {sec.title ? <div className="caption px-3 pt-3 pb-1">{sec.title}</div> : null}
          {sec.items.map(({ to, label, icon: Icon, badge, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => navItemClass(isActive)}>
              <Icon className="size-5 shrink-0" />
              {label}
              {badge ? <CountBadge count={badge} className="ml-auto" /> : null}
            </NavLink>
          ))}
        </div>
      ))}
      <div className="flex-1" />
      {footer}
    </nav>
  )
}
