import { ArrowRightLeft, MessageCircle, Plus, Power } from 'lucide-react'
import type { Pc } from '../data/types'
import { formatHm, formatXu } from '../data/format'
import { pcDisplayState, remainingRatio } from '../data/pc'
import { useCountdown } from '../data/hooks'
import { Avatar, Button, Card, Chip, RankTag, RingProgress } from '../ui'
import { PC_STATE } from './pcStyle'

/** Chi tiết máy đang chọn: người chơi, vòng giờ còn lại (đếm ngược), ví, thao tác. */
export function PcDetailCard({ pc }: { pc: Pc }) {
  const state = pcDisplayState(pc)
  const meta = PC_STATE[state]
  const s = pc.session
  const left = useCountdown(s?.remainingSec ?? 0)
  return (
    <Card className="p-[18px]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold">Máy {pc.id}</h2>
        <Chip dot={meta.dot}>{meta.label}</Chip>
      </div>
      {s ? (
        <>
          <div className="mt-3.5 flex items-center gap-3">
            <Avatar name={s.member.name} size={48} gradient="linear-gradient(135deg,#f472b6,#a78bfa)" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-base font-extrabold">{s.member.name}</span>
                <RankTag tone={s.member.rank === 'VÀNG' || s.member.rank === 'KIM CƯƠNG' ? 'gold' : 'light'}>{s.member.rank}</RankTag>
              </div>
              <div className="truncate text-xs text-ink-dim">{s.member.phoneMasked} · {s.game}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <RingProgress value={remainingRatio({ ...pc, session: { ...s, remainingSec: left } })} size={112}>
              <div className="text-xl font-extrabold">{formatHm(left)}</div>
              <div className="text-[11px] text-ink-dim">còn lại</div>
            </RingProgress>
            <dl className="flex-1 text-[13px]">
              {[
                ['Bắt đầu', s.startedAt],
                ['Đã chơi', formatHm(s.elapsedSec)],
                ['Ví chính', formatXu(s.member.mainBalance)],
                ['Ví KM', <span key="km" className="text-warn">{formatXu(s.member.bonusBalance)}</span>],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-2 border-b border-edge-soft py-1.5 last:border-b-0">
                  <dt className="whitespace-nowrap text-ink-muted">{k}</dt>
                  <dd className="font-bold whitespace-nowrap">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <Button size="sm" variant="play" icon={<Plus className="size-3.5" />}>Gia hạn giờ</Button>
            <Button size="sm" icon={<ArrowRightLeft className="size-3.5" />}>Chuyển máy</Button>
            <Button size="sm" icon={<MessageCircle className="size-3.5" />}>Nhắn tin</Button>
            <Button size="sm" variant="danger" icon={<Power className="size-3.5" />}>Tắt máy</Button>
          </div>
        </>
      ) : (
        <div className="mt-4 text-[13px] text-ink-muted">
          {state === 'reserved' ? `Máy đã được đặt lúc ${pc.reservedAt}.` : state === 'maintenance' ? 'Máy đang bảo trì.' : 'Máy trống, sẵn sàng mở cho khách.'}
          <Button className="mt-3" block variant="play" size="sm">Mở máy</Button>
        </div>
      )}
    </Card>
  )
}
