const NBSP = /\u00a0/g

export function normalizeSpaces(text: string): string {
  return text.replace(NBSP, ' ')
}

export function formatVnd(value: bigint | number): string {
  const amount = typeof value === 'bigint' ? value : BigInt(Math.trunc(value))
  const grouped = new Intl.NumberFormat('vi-VN').format(amount)
  return `${normalizeSpaces(grouped)} ₫`
}

export function formatBps(bps: number): string {
  const pct = bps / 100
  const text = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pct)
  return `${normalizeSpaces(text)}%`
}