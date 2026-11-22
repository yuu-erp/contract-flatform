/** Áp khoảng ngày ISO (input type=date) → timestamp giây; cho phép chỉ từ hoặc chỉ đến. */
export function auditDateRangeFromIso(dateFrom?: string, dateTo?: string): { fromTs?: number; toTs?: number } {
  const fromTs = dateFrom ? dateToStartTs(dateFrom) : undefined
  const toTs = dateTo ? dateToEndTs(dateTo) : undefined
  if (fromTs == null && toTs == null) return {}
  if (fromTs != null && toTs == null) return { fromTs, toTs: Math.floor(Date.now() / 1000) }
  if (fromTs == null && toTs != null) return { fromTs: 0, toTs }
  return { fromTs, toTs }
}

function dateToStartTs(iso: string): number {
  return Math.floor(new Date(`${iso}T00:00:00`).getTime() / 1000)
}

function dateToEndTs(iso: string): number {
  return Math.floor(new Date(`${iso}T23:59:59`).getTime() / 1000)
}