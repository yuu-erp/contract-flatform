const SERVICE_MASK = { NET: 1, IQR: 2, LOYALTY: 4 } as const

export function formatAllowedServices(mask: number): string {
  const parts: string[] = []
  if (mask & SERVICE_MASK.NET) parts.push('NET')
  if (mask & SERVICE_MASK.IQR) parts.push('IQR')
  if (mask & SERVICE_MASK.LOYALTY) parts.push('LOYALTY')
  return parts.length ? parts.join(', ') : '—'
}