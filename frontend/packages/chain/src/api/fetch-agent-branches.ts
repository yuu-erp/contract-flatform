import { decodeBranchProfileRecord } from '../decode'
import type { HistoryIndexContract } from '../contracts/history-index.contract'
import { searchFullDB } from '../search'
import type { AgentBranchRow } from './list-agent-branches'
import { listAgentBranches } from './list-agent-branches'
import type { BranchRegistryApi } from './index'

export type AgentBranchesResult = {
  rows: AgentBranchRow[]
  /** Cảnh báo khi search/decode lỗi nhưng vẫn có dữ liệu dự phòng (hoặc một phần). */
  searchWarning?: string
  /** Lỗi nghiêm trọng (không tải được danh sách). */
  searchError?: string
}

/**
 * Ưu tiên FullDB search; chỉ quét registry khi search lỗi hoặc total=0 nhưng on-chain còn chi nhánh.
 */
export async function fetchAgentBranches(
  history: HistoryIndexContract,
  branches: BranchRegistryApi,
  agentId: number,
): Promise<AgentBranchesResult> {
  const expected = await branches.branchCountOf(agentId)
  const main = await branches.mainBranchOf(agentId)
  if (expected <= 0 && main <= 0) return { rows: [] }

  try {
    const page = await searchFullDB(history, agentId, 'platform_branches', {
      limit: 100,
      offset: 0,
    })

    if (page.items.length === 0 && (expected > 0 || main > 0)) {
      const fallback = await listAgentBranches(branches, agentId)
      return {
        rows: fallback,
        searchWarning: 'FullDB search trả rỗng — đang dùng danh sách dự phòng từ BranchRegistry.',
      }
    }

    const rows: AgentBranchRow[] = []
    const decodeErrors: string[] = []
    for (const item of page.items) {
      try {
        rows.push({ docId: item.docId, record: decodeBranchProfileRecord(item.data) })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        decodeErrors.push(`doc #${item.docId}: ${msg}`)
      }
    }

    if (decodeErrors.length > 0 && rows.length === 0) {
      const fallback = await listAgentBranches(branches, agentId)
      return {
        rows: fallback,
        searchError: `Giải mã FullDB thất bại (${decodeErrors.join('; ')}). Đang hiển thị bản dự phòng.`,
      }
    }

    if (decodeErrors.length > 0) {
      return {
        rows,
        searchWarning: `Một số dòng không giải mã được: ${decodeErrors.join('; ')}`,
      }
    }

    return { rows }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const fallback = await listAgentBranches(branches, agentId)
    return {
      rows: fallback,
      searchError: `Lỗi search FullDB: ${msg}. Đang hiển thị bản dự phòng.`,
    }
  }
}