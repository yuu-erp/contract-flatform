/** Khớp `ILedger.EntryKind` — bit trong `posterKinds` là `1 << kind`. */
export const LEDGER_POSTER_BITS = {
  Topup: 1,
  WalletSpend: 2,
  DirectSale: 3,
  TopupRefund: 4,
  SaleRefund: 5,
  Adjust: 6,
} as const

const LABELS: Record<number, string> = {
  [LEDGER_POSTER_BITS.Topup]: 'Topup',
  [LEDGER_POSTER_BITS.WalletSpend]: 'Trừ ví',
  [LEDGER_POSTER_BITS.DirectSale]: 'Bán trực tiếp',
  [LEDGER_POSTER_BITS.TopupRefund]: 'Hoàn nạp',
  [LEDGER_POSTER_BITS.SaleRefund]: 'Hoàn bán',
  [LEDGER_POSTER_BITS.Adjust]: 'Điều chỉnh',
}

export function ledgerKindsMaskFromBits(kinds: number[]): number {
  let mask = 0
  for (const kind of kinds) mask |= 1 << kind
  return mask
}

export function ledgerKindsMaskLabels(mask: number): string[] {
  const labels: string[] = []
  for (const [kind, label] of Object.entries(LABELS)) {
    const bit = 1 << Number(kind)
    if ((mask & bit) !== 0) labels.push(label)
  }
  return labels
}

export const LEDGER_KIND_CHECKBOXES = Object.entries(LABELS).map(([kind, label]) => ({
  kind: Number(kind),
  label,
}))