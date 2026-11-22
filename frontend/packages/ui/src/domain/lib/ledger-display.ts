/** Khớp `ILedger.EntryKind` (chỉ số enum on-chain). */
export const LEDGER_KIND_ADJUST = 6

const KIND_LABELS: Record<number, string> = {
  0: '—',
  1: 'Nạp ví',
  2: 'Trừ ví',
  3: 'Bán trực tiếp',
  4: 'Hoàn nạp',
  5: 'Hoàn bán',
  6: 'Điều chỉnh',
}

export function formatLedgerKind(kind: number): string {
  return KIND_LABELS[kind] ?? `Loại ${kind}`
}

/** `method` 1 = tăng, 2 = giảm khi `kind` = Adjust; otherwise null. */
export function formatAdjustDirection(kind: number, method: number): string | null {
  if (kind !== LEDGER_KIND_ADJUST) return null
  if (method === 1) return 'Tăng'
  if (method === 2) return 'Giảm'
  return `Hướng ${method}`
}

export function ledgerRowSummary(kind: number, method: number): string {
  const base = formatLedgerKind(kind)
  const dir = formatAdjustDirection(kind, method)
  return dir ? `${base} (${dir})` : base
}