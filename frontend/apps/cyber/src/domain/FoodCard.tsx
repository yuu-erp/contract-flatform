import { Plus, UtensilsCrossed } from 'lucide-react'
import type { FoodItem } from '../data/types'
import { formatNumber } from '../data/format'
import { Card } from '../ui'

/** Thẻ món: ảnh (minh hoạ màu), tên, mô tả, giá xu, nút thêm; hết hàng thì mờ. */
export function FoodCard({ item, onAdd }: { item: FoodItem; onAdd?: (item: FoodItem) => void }) {
  return (
    <Card className={`overflow-hidden p-2.5 ${item.soldOut ? 'opacity-70' : ''}`}>
      <div
        className="relative grid aspect-[4/3] place-items-center rounded-[14px]"
        style={{ background: `radial-gradient(70% 70% at 50% 40%, hsl(${item.hue} 70% 62%), hsl(${item.hue} 45% 22%))` }}
      >
        <UtensilsCrossed className="size-10 text-white/85" />
        {item.soldOut ? (
          <span className="absolute rounded-full border border-white/20 bg-black/60 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em]">HẾT HÀNG</span>
        ) : null}
      </div>
      <div className="mt-2.5 px-1">
        <div className="truncate text-[15px] font-extrabold">{item.name}</div>
        <div className="truncate text-xs text-ink-dim italic">{item.note}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-extrabold">
            {formatNumber(item.price)} <span className="text-xs">xu</span>
          </span>
          <button
            type="button"
            disabled={item.soldOut}
            onClick={() => onAdd?.(item)}
            aria-label={`Thêm ${item.name}`}
            className="grid size-8 place-items-center rounded-full bg-play text-[#04170b] disabled:bg-white/15 disabled:text-ink-dim"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}
