/** Chuẩn hoá tham số mock giống SDK (string số, BigInt số tiền). */
export function mockId(value: unknown): number {
  return Number(value)
}

export function mockBig(value: unknown): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isFinite(value)) return BigInt(Math.trunc(value))
  return BigInt(String(value))
}