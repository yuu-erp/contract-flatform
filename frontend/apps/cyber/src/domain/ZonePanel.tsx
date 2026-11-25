import type { Pc, Zone } from '../data/types'
import { formatNumber } from '../data/format'
import { Card } from '../ui'
import { PcGrid } from './PcTile'

/** Một khu máy (Standard, VIP…) với giá giờ và lưới máy. */
export function ZonePanel({
  zone,
  pcs,
  columns = 7,
  selectedId,
  onSelect,
}: {
  zone: Zone
  pcs: Pc[]
  columns?: number
  selectedId?: string
  onSelect?: (pc: Pc) => void
}) {
  return (
    <Card className="px-4 py-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[15px] font-extrabold">{zone.name}</span>
        <span className="text-xs text-ink-dim">
          {pcs.length} máy · <b className="text-white">{formatNumber(zone.pricePerHour)} xu/giờ</b>
        </span>
      </div>
      <PcGrid pcs={pcs} columns={columns} selectedId={selectedId} onSelect={onSelect} />
    </Card>
  )
}
