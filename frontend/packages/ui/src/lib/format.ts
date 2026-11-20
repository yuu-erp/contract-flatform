const NBSP = /\u00a0/g

export function normalizeSpaces(text: string): string {
  return text.replace(NBSP, ' ')
}

export function utf8Length(text: string): number {
  return new TextEncoder().encode(text).length
}

export const REASON_MIN_BYTES = 1
export const REASON_MAX_BYTES = 200

export function isReasonBytesValid(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  const len = utf8Length(trimmed)
  return len >= REASON_MIN_BYTES && len <= REASON_MAX_BYTES
}

export function formatVnd(value: bigint | number): string {
  const amount = typeof value === 'bigint' ? value : BigInt(Math.trunc(value))
  const grouped = new Intl.NumberFormat('vi-VN').format(amount)
  return `${normalizeSpaces(grouped)} ₫`
}

/** Nhãn trục biểu đồ — gọn hơn `formatVnd`. */
export function formatVndCompact(value: bigint | number): string {
  const n = typeof value === 'bigint' ? Number(value) : value
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) {
    const text = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(abs / 1_000_000_000)
    return `${sign}${normalizeSpaces(text)} tỷ`
  }
  if (abs >= 1_000_000) {
    const text = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(abs / 1_000_000)
    return `${sign}${normalizeSpaces(text)} tr`
  }
  if (abs >= 1_000) {
    const text = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(abs / 1_000)
    return `${sign}${normalizeSpaces(text)} n`
  }
  return formatVnd(n)
}

export function formatBps(bps: number): string {
  const pct = bps / 100
  const text = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pct)
  return `${normalizeSpaces(text)}%`
}