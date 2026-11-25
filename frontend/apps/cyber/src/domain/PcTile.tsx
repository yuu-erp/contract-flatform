import type { Pc } from '../data/types'
import { formatHm } from '../data/format'
import { pcDisplayState, remainingRatio } from '../data/pc'
import { cn, StatusDot } from '../ui'
import { PC_STATE } from './pcStyle'

/** Ô một máy trạm: số máy, chấm trạng thái, người chơi, thời gian còn lại, thanh còn lại. */
export function PcTile({ pc, selected, onSelect }: { pc: Pc; selected?: boolean; onSelect?: (pc: Pc) => void }) {
  const state = pcDisplayState(pc)
  const meta = PC_STATE[state]
  const s = pc.session
  const status =
    state === 'reserved'
      ? `Đặt ${pc.reservedAt ?? ''}`
      : state === 'help'
        ? 'Gọi hỗ trợ'
        : s
          ? `${formatHm(s.remainingSec)} còn`
          : meta.label
  return (
    <button
      type="button"
      onClick={() => onSelect?.(pc)}
      aria-pressed={selected}
      aria-label={`${pc.id} · ${meta.label}`}
      className={cn(
        'relative min-w-0 rounded-[14px] border-[1.5px] px-2.5 pt-2 pb-2.5 text-left transition hover:brightness-125',
        meta.tile,
        selected && 'border-white shadow-[0_0_0_3px_rgb(255_255_255/0.25),0_10px_24px_rgb(0_0_0/0.3)]',
      )}
    >
      <div className="flex items-center justify-between text-[13px] font-extrabold whitespace-nowrap">
        {pc.id}
        <StatusDot color={meta.dot} />
      </div>
      {s ? <div className="mt-px truncate text-[11px] font-bold">{s.member.name}</div> : null}
      <div className="mt-0.5 truncate text-[11.5px] text-ink-muted">{status}</div>
      {s && state !== 'help' ? (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
          <div className={cn('h-full rounded-full', state === 'low' ? 'bg-warn' : 'bg-play')} style={{ width: `${Math.max(4, remainingRatio(pc) * 100)}%` }} />
        </div>
      ) : null}
    </button>
  )
}

/** Lưới máy; số cột cố định để ô không bị bóp. */
export function PcGrid({
  pcs,
  columns,
  selectedId,
  onSelect,
}: {
  pcs: Pc[]
  columns: number
  selectedId?: string
  onSelect?: (pc: Pc) => void
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {pcs.map((pc) => (
        <PcTile key={pc.id} pc={pc} selected={pc.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  )
}
