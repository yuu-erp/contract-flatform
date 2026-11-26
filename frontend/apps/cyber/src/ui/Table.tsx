import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from './cn'

/** Bảng dữ liệu trong thẻ kính: tiêu đề nhỏ in hoa, hàng kẻ mảnh, cuộn ngang khi hẹp. */
export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('min-w-0 overflow-x-auto', className)}>
      <table className="w-full border-collapse text-[13px] tabular-nums">{children}</table>
    </div>
  )
}

export function Th({ className, align = 'left', ...rest }: ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  return (
    <th
      className={cn(
        'border-b border-edge-soft px-3 py-2 text-[11px] font-extrabold tracking-wider whitespace-nowrap text-ink-dim uppercase',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className,
      )}
      {...rest}
    />
  )
}

export function Td({ className, align = 'left', ...rest }: TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  return (
    <td
      className={cn(
        'border-b border-edge-soft px-3 py-2.5 align-middle',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className,
      )}
      {...rest}
    />
  )
}

export function Tr({ className, active, ...rest }: HTMLAttributes<HTMLTableRowElement> & { active?: boolean }) {
  return <tr className={cn('transition last:[&>td]:border-b-0', rest.onClick && 'cursor-pointer hover:bg-white/5', active && 'bg-white/10', className)} {...rest} />
}
