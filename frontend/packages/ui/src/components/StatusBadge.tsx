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
  if (value === 1) return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
  if (value === 2) return 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100'
  if (value === 3) return 'border-border bg-muted text-muted-foreground'
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
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', tone, className)}>
      {label}
    </span>
  )
}