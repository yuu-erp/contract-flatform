import { formatBps } from '../lib/format'

export function Percent({ bps, className }: { bps: number; className?: string }) {
  return <span className={className}>{formatBps(bps)}</span>
}