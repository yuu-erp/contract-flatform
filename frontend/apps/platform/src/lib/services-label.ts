import { SERVICE_MASK } from './validate-create-agent'

export function formatAllowedServices(mask: number): string {
  const parts: string[] = []
  if (mask & SERVICE_MASK.NET) parts.push('NET')
  if (mask & SERVICE_MASK.IQR) parts.push('IQR')
  if (mask & SERVICE_MASK.LOYALTY) parts.push('LOYALTY')
  return parts.length ? parts.join(', ') : '—'
}