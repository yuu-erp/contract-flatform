import type { Pc, PcDisplayState } from './types'

/** Còn dưới ngưỡng này (giây) thì máy hiện "sắp hết giờ". */
export const LOW_TIME_SEC = 10 * 60

/** Suy ra trạng thái hiển thị của một máy. Gọi hỗ trợ ưu tiên cao nhất. */
export function pcDisplayState(pc: Pc): PcDisplayState {
  if (pc.needsHelp) return 'help'
  if (pc.status === 'maintenance') return 'maintenance'
  if (pc.status === 'reserved') return 'reserved'
  if (pc.status === 'in_use' && pc.session) {
    return pc.session.remainingSec <= LOW_TIME_SEC ? 'low' : 'playing'
  }
  return 'idle'
}

export type PcCounts = Record<PcDisplayState, number> & { total: number }

export function countPcStates(pcs: Pc[]): PcCounts {
  const counts: PcCounts = { total: pcs.length, playing: 0, low: 0, idle: 0, reserved: 0, maintenance: 0, help: 0 }
  for (const pc of pcs) counts[pcDisplayState(pc)]++
  return counts
}

/** Tỉ lệ máy đang có khách (chơi, sắp hết giờ, gọi hỗ trợ khi đang chơi). */
export function occupancy(pcs: Pc[]): number {
  if (pcs.length === 0) return 0
  return pcs.filter((p) => p.status === 'in_use').length / pcs.length
}

/** Phần thời gian còn lại của phiên, 0–1 (thanh trên ô máy). */
export function remainingRatio(pc: Pc): number {
  const s = pc.session
  if (!s) return 0
  const total = s.elapsedSec + s.remainingSec
  return total === 0 ? 0 : s.remainingSec / total
}
