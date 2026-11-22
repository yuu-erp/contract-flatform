import {
  decodeAgentProfileRecord,
  decodeBranchProfileRecord,
  decodeOptionalHex,
  type PlatformAuditRecord,
} from '@meta-platform/chain'

const EMPTY = /^0x0*$/i

export function formatAuditBytes(hex: `0x${string}` | string | Uint8Array): string {
  const h = typeof hex === 'string' ? hex : decodeOptionalHex(hex)
  if (!h || EMPTY.test(h)) return '—'
  const text = h.startsWith('0x') ? tryDecodeAuditPayload(h as `0x${string}`) : null
  if (text) return text
  return h.length > 42 ? `${h.slice(0, 42)}…` : h
}

function tryDecodeAuditPayload(hex: `0x${string}`): string | null {
  try {
    const agent = decodeAgentProfileRecord(hex)
    if (agent.profile.storeName) return `Agent: ${agent.profile.storeName}`
  } catch {
    /* not agent profile */
  }
  try {
    const branch = decodeBranchProfileRecord(hex)
    if (branch.profile.name) return `Chi nhánh: ${branch.profile.name} · ${branch.domain}`
  } catch {
    /* not branch profile */
  }
  return null
}

export function auditRowSummary(row: PlatformAuditRecord): string {
  const parts = [row.action]
  if (row.agentId) parts.push(`agent ${row.agentId}`)
  if (row.branchId) parts.push(`cn ${row.branchId}`)
  return parts.join(' · ')
}