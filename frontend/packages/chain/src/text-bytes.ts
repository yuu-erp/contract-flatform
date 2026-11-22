export const REASON_MIN_BYTES = 1
export const REASON_MAX_BYTES = 200

export function utf8Length(text: string): number {
  return new TextEncoder().encode(text).length
}

export function isReasonBytesValid(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  const len = utf8Length(trimmed)
  return len >= REASON_MIN_BYTES && len <= REASON_MAX_BYTES
}