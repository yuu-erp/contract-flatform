import { ClipboardCheck } from 'lucide-react'
import type { Shift } from '../data/types'
import { formatHm, formatNumber } from '../data/format'
import { AvatarStack, Button, Card } from '../ui'

/** Tóm tắt ca: nhân viên, tiền mặt, chuyển khoản, nạp ví, giờ bán, nút kết ca. */
export function ShiftCard({ shift }: { shift: Shift }) {
  const stats: [string, string, string?][] = [
    ['Tiền mặt', formatNumber(shift.cash)],
    ['Chuyển khoản', formatNumber(shift.transfer)],
    ['Nạp ví', formatNumber(shift.topup), 'text-warn'],
    ['Giờ bán', `${shift.hoursSold} giờ`, 'text-play'],
  ]
  return (
    <Card className="px-[18px] py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold">Ca hiện tại</h2>
        <span className="text-xs text-ink-dim">còn {formatHm(shift.remainingSec)}</span>
      </div>
      <div className="mt-2.5">
        <AvatarStack names={shift.staff.map((s) => s.name)} extra={`${shift.staff.length} nhân viên trong ca`} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {stats.map(([k, v, cls]) => (
          <div key={k}>
            <div className="text-[11.5px] text-ink-dim">{k}</div>
            <div className={`text-lg font-extrabold ${cls ?? ''}`}>{v}</div>
          </div>
        ))}
      </div>
      <Button className="mt-3" block size="sm" icon={<ClipboardCheck className="size-3.5" />}>
        Đối soát & kết ca
      </Button>
    </Card>
  )
}
