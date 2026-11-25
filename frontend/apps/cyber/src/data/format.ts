const vnd = new Intl.NumberFormat('vi-VN')

/** 18420000 → "18.420.000" */
export function formatNumber(n: number): string {
  return vnd.format(Math.round(n))
}

export function formatVnd(n: number): string {
  return `${formatNumber(n)} ₫`
}

export function formatXu(n: number): string {
  return `${formatNumber(n)} xu`
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 6392 → "1:46" (giờ:phút, dùng trên ô máy). */
export function formatHm(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}`
}

/** 6392 → "01:46:32" (đồng hồ đếm ngược). */
export function formatHms(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

/** Phần trăm có dấu, 12.4 → "▲ 12,4%". */
export function formatDelta(pct: number): string {
  const arrow = pct >= 0 ? '▲' : '▼'
  return `${arrow} ${Math.abs(pct).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
}
