export function toAddress(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
}

export function normalizeHexAddress(value: string): string {
  return toAddress(value).toLowerCase()
}

export function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(toAddress(value))
}