import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

/** Khối ở cột phải kiểu "Chuyện gì đang xảy ra": bo 16px, tiêu đề 20px đậm. */
export function RailCard({
  title,
  children,
  footerLink,
  className,
}: {
  title: ReactNode
  children: ReactNode
  footerLink?: { to: string; label: string }
  className?: string
}) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-border', className)}>
      <h2 className="px-4 pt-3 pb-1 text-xl leading-6 font-extrabold tracking-tight">{title}</h2>
      <div className="flex flex-col">{children}</div>
      {footerLink ? (
        <Link to={footerLink.to} className="block px-4 py-3 text-[0.9375rem] text-primary transition-colors hover:bg-row-hover">
          {footerLink.label}
        </Link>
      ) : null}
    </section>
  )
}

/** Một dòng trong RailCard hoặc danh sách: hover tối nhẹ. */
export function RailRow({
  children,
  to,
  className,
}: {
  children: ReactNode
  to?: string
  className?: string
}) {
  const cls = cn('block px-4 py-3 transition-colors hover:bg-row-hover', className)
  return to ? (
    <Link to={to} className={cls}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  )
}
