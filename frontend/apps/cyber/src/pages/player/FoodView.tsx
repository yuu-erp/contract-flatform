import { ClipboardList } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatNumber } from '../../data/format'
import { usePlayer } from '../../data/hooks'
import type { FoodItem } from '../../data/types'
import { FoodCard } from '../../domain'
import { Button, SearchInput, Tabs } from '../../ui'
import { ContentPanel, PageHead } from '../../layout/DashboardLayout'

type Cat = 'all' | 'Mì' | 'Nước' | 'Cơm'

export function FoodView() {
  const { foods } = usePlayer()
  const [cat, setCat] = useState<Cat>('all')
  const [q, setQ] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})
  const shown = useMemo(
    () => foods.filter((f) => (cat === 'all' || f.category === cat) && f.name.toLowerCase().includes(q.trim().toLowerCase())),
    [foods, cat, q],
  )
  const add = (f: FoodItem) => setCart((c) => ({ ...c, [f.id]: (c[f.id] ?? 0) + 1 }))
  const count = Object.values(cart).reduce((a, b) => a + b, 0)
  const total = foods.reduce((sum, f) => sum + (cart[f.id] ?? 0) * f.price, 0)

  return (
    <ContentPanel>
      <PageHead title="Gọi món">
        <SearchInput value={q} onChange={setQ} placeholder="Tìm kiếm món ăn…" className="w-[240px]" />
      </PageHead>
      <div className="mt-4 flex items-center justify-between">
        <Tabs
          items={[
            { value: 'all', label: 'Tất cả' },
            { value: 'Mì', label: 'Mì' },
            { value: 'Nước', label: 'Nước' },
            { value: 'Cơm', label: 'Cơm' },
          ]}
          value={cat}
          onChange={setCat}
        />
        <div className="flex items-center gap-2.5 rounded-[14px] border border-edge bg-black/25 px-3.5 py-1.5">
          <ClipboardList className="size-5" />
          <div className="leading-tight">
            <div className="caption">Giỏ món</div>
            <div className="text-sm font-extrabold">
              {count} món · {formatNumber(total)} xu
            </div>
          </div>
          <Button size="sm" variant="play" disabled={count === 0}>
            Đặt món
          </Button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3.5">
        {shown.map((f) => (
          <FoodCard key={f.id} item={f} onAdd={add} />
        ))}
      </div>
    </ContentPanel>
  )
}
