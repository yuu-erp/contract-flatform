import {
  BRANCH_PAYMENT_FOLLOW_AGENT,
  PAYMENT_CARD,
  PAYMENT_CASH,
  PAYMENT_TRANSFER,
  PAYMENT_WALLET,
} from '@meta-platform/chain'

export const METHOD_BITS = [
  { bit: PAYMENT_CASH, label: 'Tiền mặt' },
  { bit: PAYMENT_TRANSFER, label: 'Chuyển khoản' },
  { bit: PAYMENT_CARD, label: 'Thẻ' },
  { bit: PAYMENT_WALLET, label: 'Ví' },
] as const

export function formatPaymentMethods(mask: number): string {
  if (mask === BRANCH_PAYMENT_FOLLOW_AGENT) return 'Theo agent (0)'
  const labels = METHOD_BITS.filter((m) => (mask & m.bit) !== 0).map((m) => m.label)
  return labels.length > 0 ? labels.join(', ') : `Bitmask ${mask}`
}