import type { Pc, PcDisplayState } from '../data/types'
import { countPcStates } from '../data/pc'
import { Chip } from '../ui'
import { PC_STATE } from './pcStyle'

export type PcFilter = 'all' | PcDisplayState

const ORDER: PcDisplayState[] = ['playing', 'low', 'idle', 'reserved', 'help', 'maintenance']

/** Chip lọc theo trạng thái máy, kèm số lượng. */
export function PcLegend({ pcs, value, onChange }: { pcs: Pc[]; value: PcFilter; onChange: (f: PcFilter) => void }) {
  const counts = countPcStates(pcs)
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={value === 'all'} dot="#fff" onClick={() => onChange('all')}>
        Tất cả <b className="text-white">{counts.total}</b>
      </Chip>
      {ORDER.filter((s) => counts[s] > 0).map((s) => (
        <Chip key={s} active={value === s} dot={PC_STATE[s].dot} onClick={() => onChange(s)}>
          {PC_STATE[s].label} <b className="text-white">{counts[s]}</b>
        </Chip>
      ))}
    </div>
  )
}
