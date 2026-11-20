export type Day = number

/** Mirror `LedgerMetrics.sol` positions in `uint256[32]`. */
export const METRIC = {
  cashIn: 0,
  cashOut: 3,
  walletTopup: 6,
  walletSpend: 7,
  walletTopupRefund: 8,
  walletCredit: 9,
  netGross: 10,
  netDiscount: 11,
  netRefund: 12,
  netAdjUp: 13,
  netAdjDown: 14,
  netTax: 15,
  netTaxRefund: 16,
  netServedHere: 17,
  iqrGross: 18,
  iqrDiscount: 19,
  iqrRefund: 20,
  iqrAdjUp: 21,
  iqrAdjDown: 22,
  iqrTax: 23,
  iqrTaxRefund: 24,
  iqrServedHere: 25,
  netServedHereRefund: 26,
  iqrServedHereRefund: 27,
} as const

export type ServiceFilter = 'NET' | 'IQR' | 'ALL'

export type RevenueBreakdown = {
  gross: bigint
  discount: bigint
  refund: bigint
  adjUp: bigint
  adjDown: bigint
  net: bigint
  tax: bigint
  taxNet: bigint
}

function slice(row: bigint[], base: number) {
  return {
    gross: row[base] ?? 0n,
    discount: row[base + 1] ?? 0n,
    refund: row[base + 2] ?? 0n,
    adjUp: row[base + 3] ?? 0n,
    adjDown: row[base + 4] ?? 0n,
    tax: row[base + 5] ?? 0n,
    taxRefund: row[base + 6] ?? 0n,
  }
}

function combine(a: ReturnType<typeof slice>, b: ReturnType<typeof slice>) {
  return {
    gross: a.gross + b.gross,
    discount: a.discount + b.discount,
    refund: a.refund + b.refund,
    adjUp: a.adjUp + b.adjUp,
    adjDown: a.adjDown + b.adjDown,
    tax: a.tax + b.tax,
    taxRefund: a.taxRefund + b.taxRefund,
  }
}

function toRevenue(part: ReturnType<typeof slice>): RevenueBreakdown {
  const net = part.gross - part.refund + part.adjUp - part.adjDown
  const taxNet = part.tax - part.taxRefund
  return { ...part, net, taxNet }
}

export function revenue(row: bigint[], service: ServiceFilter): RevenueBreakdown {
  if (service === 'NET') return toRevenue(slice(row, METRIC.netGross))
  if (service === 'IQR') return toRevenue(slice(row, METRIC.iqrGross))
  const merged = combine(slice(row, METRIC.netGross), slice(row, METRIC.iqrGross))
  return toRevenue(merged)
}

export function sumDays(rows: bigint[][]): bigint[] {
  const out = Array.from({ length: 32 }, () => 0n)
  for (const row of rows) {
    for (let i = 0; i < 32; i++) out[i] += row[i] ?? 0n
  }
  return out
}

export function cash(row: bigint[]) {
  const inCash = row[METRIC.cashIn] ?? 0n
  const inTransfer = row[METRIC.cashIn + 1] ?? 0n
  const inCard = row[METRIC.cashIn + 2] ?? 0n
  const outCash = row[METRIC.cashOut] ?? 0n
  const outTransfer = row[METRIC.cashOut + 1] ?? 0n
  const outCard = row[METRIC.cashOut + 2] ?? 0n
  return {
    in: { cash: inCash, transfer: inTransfer, card: inCard },
    out: { cash: outCash, transfer: outTransfer, card: outCard },
    net: {
      cash: inCash - outCash,
      transfer: inTransfer - outTransfer,
      card: inCard - outCard,
    },
  }
}

export function wallet(row: bigint[]) {
  return {
    topup: row[METRIC.walletTopup] ?? 0n,
    spend: row[METRIC.walletSpend] ?? 0n,
    topupRefund: row[METRIC.walletTopupRefund] ?? 0n,
    credit: row[METRIC.walletCredit] ?? 0n,
  }
}

export function servedHere(row: bigint[], service: 'NET' | 'IQR') {
  const idx = service === 'NET' ? METRIC.netServedHere : METRIC.iqrServedHere
  const refundIdx = service === 'NET' ? METRIC.netServedHereRefund : METRIC.iqrServedHereRefund
  return (row[idx] ?? 0n) - (row[refundIdx] ?? 0n)
}