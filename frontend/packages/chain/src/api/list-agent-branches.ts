import type { BranchProfileRecord } from '../decode'
import { mapWithConcurrency } from '../react/concurrency'
import type { BranchRegistryApi } from './index'

export type AgentBranchRow = { docId: number; record: BranchProfileRecord }

/**
 * Dự phòng khi `HistoryIndex.search` lỗi hoặc trả rỗng.
 * Quét id 1..max(globalCount, mainId) song song (concurrency 8), dừng khi đủ `branchCountOf`.
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
  if (out.length >= need) return out

  const global = await branches.branchCount()
  const scanMax = Math.max(global, main, need, 1)
  const ids = Array.from({ length: scanMax }, (_, i) => i + 1).filter((id) => !seen.has(id))

  await mapWithConcurrency(ids, 8, async (branchId) => {
    if (out.length >= need) return
    await tryAdd(branchId)
  })

  return out
}