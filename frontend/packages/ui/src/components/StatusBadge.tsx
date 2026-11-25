import { cn } from '../lib/cn'

const statusLabels: Record<number, string> = {
  0: 'Không có',
  1: 'Hoạt động',
  2: 'Tạm dừng',
  3: 'Đã xoá',
}

const roleLabels: Record<number, string> = {
  0: 'Không vai trò',
  1: 'Nhân viên',
  2: 'Quản lý',
  3: 'Chủ agent',
}

function statusTone(value: number): string {
  if (value === 1) return 'border-transparent bg-success/15 text-success'
  if (value === 2) return 'border-transparent bg-warning/20 text-amber-700 dark:text-warning'
  if (value === 3) return 'border-transparent bg-danger/10 text-danger'
  return 'border-border bg-background text-muted-foreground'
}

export function StatusBadge({
  kind,
  value,
  className,
}: {
  kind: 'agent' | 'branch' | 'role'
  value: number
  className?: string
}) {
  const label = kind === 'role' ? roleLabels[value] ?? String(value) : statusLabels[value] ?? String(value)
  const tone = kind === 'role' ? 'border-border bg-muted text-foreground' : statusTone(value)
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold', tone, className)}>
      {label}
    </span>
  )
}