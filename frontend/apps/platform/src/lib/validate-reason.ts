const MAX_REASON = 200

export function validateReason(reason: string): string | null {
  const r = reason.trim()
  if (!r) return 'Bắt buộc nhập lý do.'
  if (r.length > MAX_REASON) return `Lý do tối đa ${MAX_REASON} ký tự.`
  return null
}