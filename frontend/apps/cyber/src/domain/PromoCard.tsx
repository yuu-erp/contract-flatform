import { Button } from '../ui'

/** Thẻ khuyến mãi nổi bật (cam → hồng). */
export function PromoCard({ title, detail, action }: { title: string; detail: string; action: string }) {
  return (
    <div className="rounded-[18px] border border-topup/45 bg-gradient-to-br from-topup/30 to-help/20 p-3.5">
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-0.5 text-[11.5px] text-ink-dim">{detail}</div>
      <Button className="mt-2.5" size="sm" variant="topup" block>
        {action}
      </Button>
    </div>
  )
}
