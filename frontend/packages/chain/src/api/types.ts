import type { AgentProfileRecord } from '../decode'

export type AgentView = {
  id: number
  owner: string
  pendingOwner: string
  status: number
  createdAt: number
  updatedAt: number
  profileDocId: bigint
  allowedServices: number
}

export type { AgentProfileRecord }

export type BranchView = {
  id: number
  agentId: number
  status: number
  services: number
  isMain: boolean
  tzOffsetMinutes: number
  domainHash: string
  createdAt: number
  updatedAt: number
  profileDocId: bigint
}

export type MemberView = {
  account: string
  role: number
  grantedBy: string
  grantedAt: number
}

export type LedgerPortionView = { branchId: number; amount: bigint }

export type LedgerEntry = {
  kind: number
  method: number
  service: number
  taxBps: number
  branchId: number
  customer: string
  amount: bigint
  refunded: bigint
}

export type TaxQuote = {
  bps: number
  exclusive: boolean
  tax: bigint
  total: bigint
}

export type BranchTax = {
  isSet: boolean
  bps: number
}