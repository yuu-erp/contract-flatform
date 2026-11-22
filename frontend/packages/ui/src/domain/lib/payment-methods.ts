const METHOD_BITS = [
  { bit: 1, label: 'Tiền mặt' },
  { bit: 2, label: 'Chuyển khoản' },
  { bit: 4, label: 'Thẻ' },
  { bit: 8, label: 'Ví' },
] as const

export function formatPaymentMethods(mask: number): string {
  if (mask === 0) return 'Theo agent (0)'
  const labels = METHOD_BITS.filter((m) => (mask & m.bit) !== 0).map((m) => m.label)
  return labels.length > 0 ? labels.join(', ') : `Bitmask ${mask}`
}