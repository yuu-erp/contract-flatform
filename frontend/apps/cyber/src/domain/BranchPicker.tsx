import { Store } from 'lucide-react'
import type { Branch } from '../data/types'
import { Tabs } from '../ui'

/** Chọn chi nhánh cho các màn Owner. `withAll` thêm mục "Tất cả". */
export function BranchPicker({
  branches,
  value,
  onChange,
  withAll,
}: {
  branches: Pick<Branch, 'id' | 'name'>[]
  value: string
  onChange: (id: string) => void
  withAll?: boolean
}) {
  const items = [
    ...(withAll ? [{ value: 'all', label: 'Tất cả' }] : []),
    ...branches.map((b) => ({ value: b.id, label: b.name.replace('Cyber ', '') })),
  ]
  return (
    <span className="flex items-center gap-2">
      <Store className="size-4 text-ink-dim" />
      <Tabs items={items} value={value} onChange={onChange} />
    </span>
  )
}
