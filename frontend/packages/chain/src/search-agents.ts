/** Hàng dùng để tìm/lọc agent (dùng chung hook và test Task 4). */
export type AgentSearchRow = {
  id: number
  owner: string
  status: number
  allowedServices: number
  profileName?: string
  storePhone?: string
  storeAddress?: string
}

export function foldText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'd')
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function matchAgent(row: AgentSearchRow, text: string): boolean {
  const q = text.trim()
  if (!q) return true
  if (q === String(row.id)) return true
  const owner = row.owner.toLowerCase()
  if (owner.includes(q.toLowerCase())) return true
  const qFold = foldText(q)
  if (qFold && foldText(row.profileName ?? '').includes(qFold)) return true
  if (foldText(row.storeAddress ?? '').includes(qFold)) return true
  const qDigits = digitsOnly(q)
  if (qDigits.length > 0) {
    const phone = digitsOnly(row.storePhone ?? '')
    if (phone.includes(qDigits)) return true
  }
  return false
}

export function filterAgentsByStatus<T extends AgentSearchRow>(rows: T[], status: number | null): T[] {
  if (status == null) return rows
  return rows.filter((row) => row.status === status)
}

export function filterAgentsByServiceMask<T extends AgentSearchRow>(rows: T[], mask: number | null): T[] {
  if (mask == null || mask === 0) return rows
  return rows.filter((row) => (row.allowedServices & mask) !== 0)
}