import { Hand, Timer, Utensils, Wallet } from 'lucide-react'
import type { CustomerRequest } from '../data/types'
import { formatNumber, formatXu } from '../data/format'
import { Button, IconBox, ListRow, type Tone } from '../ui'

function describe(r: CustomerRequest): { tone: Tone; icon: React.ReactNode; title: string; detail: string } {
  switch (r.kind) {
    case 'help':
      return { tone: 'help', icon: <Hand className="size-4" />, title: `${r.pcId} gọi hỗ trợ`, detail: `${r.note} · ${r.agoMin} phút trước` }
    case 'topup':
      return {
        tone: 'topup',
        icon: <Wallet className="size-4" />,
        title: `${r.pcId} yêu cầu nạp ${formatNumber(r.amount)} ₫`,
        detail: `${r.method === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'} · mã ${r.ref}`,
      }
    case 'order':
      return { tone: 'reserve', icon: <Utensils className="size-4" />, title: `${r.pcId} gọi món · ${formatXu(r.total)}`, detail: r.items }
    case 'low_time':
      return { tone: 'warn', icon: <Timer className="size-4" />, title: `${r.pcId} sắp hết giờ`, detail: `Còn ${r.remainingMin} phút · ví chính ${formatXu(r.balance)}` }
  }
}

/** Một yêu cầu từ khách kèm nút xử lý phù hợp loại yêu cầu. */
export function RequestItem({ request, onAction }: { request: CustomerRequest; onAction?: (id: string, action: string) => void }) {
  const d = describe(request)
  const act = (a: string) => () => onAction?.(request.id, a)
  return (
    <ListRow
      align="start"
      className="py-3"
      leading={<IconBox tone={d.tone} size={36}>{d.icon}</IconBox>}
      title={d.title}
      subtitle={d.detail}
    >
      <div className="mt-2 flex gap-1.5">
        {request.kind === 'help' ? <Button size="sm" variant="help" onClick={act('go')}>Tới máy</Button> : null}
        {request.kind === 'topup' ? (
          <>
            <Button size="sm" variant="play" onClick={act('confirm')}>Xác nhận</Button>
            <Button size="sm" variant="danger" onClick={act('reject')}>Từ chối</Button>
          </>
        ) : null}
        {request.kind === 'order' ? <Button size="sm" onClick={act('accept')}>Nhận đơn</Button> : null}
        {request.kind === 'low_time' ? <Button size="sm" onClick={act('remind')}>Nhắc nạp</Button> : null}
      </div>
    </ListRow>
  )
}
