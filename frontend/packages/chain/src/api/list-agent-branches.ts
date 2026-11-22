import type { BranchProfileRecord } from '../decode'
import type { BranchRegistryApi } from './index'

export type AgentBranchRow = { docId: number; record: BranchProfileRecord }

/**
 * Liệt kê chi nhánh của agent qua BranchRegistry (không phụ thuộc FullDB search).
 * Quét id 1..max(globalCount, mainId) — đủ cho quy mô hiện tại.
 */
export async function listAgentBranches(branches: BranchRegistryApi, agentId: number): Promise<AgentBranchRow[]> {
  let need = await branches.branchCountOf(agentId)
  const main = await branches.mainBranchOf(agentId)
  if (need <= 0 && main <= 0) return []
  if (need <= 0 && main > 0) need = 1

  const out: AgentBranchRow[] = []
  const seen = new Set<number>()

  const tryAdd = async (branchId: number) => {
    if (branchId <= 0 || seen.has(branchId)) return
    try {
      const branch = await branches.getBranch(branchId)
      if (branch.agentId !== agentId) return
      const record = await branches.getBranchProfile(branchId)
      seen.add(branchId)
      out.push({ docId: Number(branch.profileDocId), record })
    } catch {
      /* id chưa cấp phát */
    }
  }

  if (main > 0) await tryAdd(main)

  const global = await branches.branchCount()
  const scanMax = Math.max(global, main, need, 1)
  for (let id = 1; id <= scanMax && out.length < need; id++) {
    await tryAdd(id)
  }

  return out
}