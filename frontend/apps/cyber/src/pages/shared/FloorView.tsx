import type { ReactNode } from 'react'
import { CalendarClock, Play } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useBranchFloor } from '../../data/hooks'
import { occupancy, pcDisplayState } from '../../data/pc'
import { PcDetailCard, PcLegend, ShiftCard, ZonePanel, type PcFilter } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { Button, SearchInput } from '../../ui'

/** Phòng máy của một chi nhánh: sơ đồ máy theo khu, lọc trạng thái, chi tiết máy, ca đang chạy. Dùng chung Owner / Manager. */
export function FloorView({ branchId, switcher }: { branchId: string; switcher?: ReactNode }) {
  const { zones, pcs, shift } = useBranchFloor(branchId)
  const [filter, setFilter] = useState<PcFilter>('all')
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState('VIP-07')

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return pcs.filter(
      (pc) =>
        (filter === 'all' || pcDisplayState(pc) === filter) &&
        (!needle || pc.id.toLowerCase().includes(needle) || pc.session?.member.name.toLowerCase().includes(needle)),
    )
  }, [pcs, filter, q])
  const selected = pcs.find((p) => p.id === selectedId) ?? pcs[0]

  return (
    <>
      <ContentPanel>
        <PageHead title="Phòng máy" meta={<>{pcs.length} máy · công suất <b className="text-play">{Math.round(occupancy(pcs) * 100)}%</b></>}>
          <SearchInput value={q} onChange={setQ} placeholder="Tìm máy, hội viên…" className="w-[220px]" />
          <Button size="sm" icon={<CalendarClock className="size-3.5" />}>Đặt máy</Button>
          <Button size="sm" variant="play" icon={<Play className="size-3.5" />}>Mở máy</Button>
        </PageHead>
        {switcher}
        <PcLegend pcs={pcs} value={filter} onChange={setFilter} />
        {zones.map((zone) => {
          const zonePcs = visible.filter((p) => p.zoneId === zone.id)
          return zonePcs.length ? (
            <ZonePanel key={zone.id} zone={zone} pcs={zonePcs} selectedId={selected?.id} onSelect={(pc) => setSelectedId(pc.id)} />
          ) : null
        })}
        {visible.length === 0 ? <p className="py-10 text-center text-ink-muted">Không có máy khớp bộ lọc.</p> : null}
      </ContentPanel>
      <SidePanel>
        {selected ? <PcDetailCard pc={selected} /> : null}
        <ShiftCard shift={shift} />
      </SidePanel>
    </>
  )
}
