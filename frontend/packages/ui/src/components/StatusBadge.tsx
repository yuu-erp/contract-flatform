import { cn } from '../lib/cn'

const agentLabels: Record<number, string> = {
  0: 'Không có',
  1: 'Active',
  2: 'Suspended',
  3: 'Deleted',
}

const branchLabels = agentLabels

const roleLabels: Record<number, string> = {
  0: 'Không vai trò',
  1: 'Staff',
  2: 'Manager',
  3: 'Chủ agent',
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
  const label =
    kind === 'role' ? roleLabels[value] ?? String(value) : kind === 'branch' ? branchLabels[value] : agentLabels[value]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {label ?? value}
    </span>
  )
}