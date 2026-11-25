import { Sparkles } from 'lucide-react'
import type { Voucher } from '../data/types'
import { formatNumber } from '../data/format'
import { Button, Card } from '../ui'

/** Voucher của tôi (có thể đã dùng) hoặc voucher đổi bằng xu thưởng (có giá). */
export function VoucherCard({ voucher, onRedeem }: { voucher: Voucher; onRedeem?: (v: Voucher) => void }) {
  const shop = voucher.cost != null
  return (
    <Card className={`relative flex items-center gap-4 px-5 py-4 ${voucher.used ? 'opacity-60' : ''}`}>
      {shop ? (
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-edge bg-sunken text-warn">
          <Sparkles className="size-5" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-extrabold">{voucher.title}</div>
        <div className="mt-0.5 text-xs text-ink-dim">Hết hạn: {voucher.expires}</div>
      </div>
      <div className="h-12 border-l border-dashed border-edge" />
      {voucher.used ? (
        <span className="-rotate-12 rounded-md border-2 border-white/40 px-2 py-1 text-[11px] font-extrabold tracking-widest text-white/70">ĐÃ DÙNG</span>
      ) : shop ? (
        <Button size="sm" variant="topup" onClick={() => onRedeem?.(voucher)}>
          {formatNumber(voucher.cost!)} xu
        </Button>
      ) : (
        <Button size="sm" variant="play">Dùng ngay</Button>
      )}
    </Card>
  )
}
