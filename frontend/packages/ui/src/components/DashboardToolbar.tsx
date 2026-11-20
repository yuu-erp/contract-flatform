import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Card, CardContent } from './card'

/** Thanh công cụ (bộ lọc, khoảng ngày) trong card — kiểu web-admin. */
export function DashboardToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardContent className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
        {children}
      </CardContent>
    </Card>
  )
}