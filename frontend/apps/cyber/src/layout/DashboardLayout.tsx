import { Repeat2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Brand, Glass, SideNav, type NavSection } from '../ui'
import { Backdrop } from './Backdrop'

/** Khung chung cho Owner / Manager / Staff: sidebar kính, thanh trên kính, vùng nội dung. */
export function DashboardLayout({ nav, topbar, children }: { nav: NavSection[]; topbar: ReactNode; children: ReactNode }) {
  return (
    <div className="relative flex h-dvh gap-3.5 p-3.5">
      <Backdrop />
      <Glass className="flex w-[248px] shrink-0 flex-col px-3.5 py-[18px]">
        <Brand />
        <SideNav
          sections={nav}
          footer={
            <Link to="/" className="mt-2 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink-dim hover:bg-white/5 hover:text-ink">
              <Repeat2 className="size-4" /> Đổi vai trò (bản demo)
            </Link>
          }
        />
      </Glass>
      <main className="flex min-w-0 flex-1 flex-col gap-3.5">
        <Glass className="flex h-16 shrink-0 items-center gap-3 pr-3.5 pl-3">{topbar}</Glass>
        <div className="flex min-h-0 flex-1 gap-3.5">{children}</div>
      </main>
    </div>
  )
}

/** Tấm kính nội dung chính (cuộn được bên trong). */
export function ContentPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <Glass className={`flex min-h-0 min-w-0 flex-1 flex-col gap-3.5 overflow-y-auto px-[22px] py-5 ${className}`}>{children}</Glass>
}

/** Cột phải (chi tiết, yêu cầu…). */
export function SidePanel({ children }: { children: ReactNode }) {
  return <Glass className="flex w-[330px] shrink-0 flex-col gap-3.5 overflow-y-auto p-3.5">{children}</Glass>
}

/** Tiêu đề trang trong ContentPanel. */
export function PageHead({ title, meta, children }: { title: ReactNode; meta?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <h1 className="text-[22px] font-extrabold whitespace-nowrap">{title}</h1>
      {meta ? <span className="whitespace-nowrap text-ink-dim">{meta}</span> : null}
      <div className="flex-1" />
      {children}
    </div>
  )
}
