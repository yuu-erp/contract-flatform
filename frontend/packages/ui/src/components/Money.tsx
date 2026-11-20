import { formatVnd } from '../lib/format'

export function Money({ value, className }: { value: bigint | number; className?: string }) {
  return <span className={className}>{formatVnd(value)}</span>
}