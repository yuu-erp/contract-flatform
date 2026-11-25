import { Ellipsis } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

export type RowMenuItem = {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
}

/** Nút "…" mở menu hành động của một hàng (kiểu X). */
export function RowMenu({ items, label = 'Thêm' }: { items: RowMenuItem[]; label?: string }) {
  if (items.length === 0) return null
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className="-mr-2 inline-flex size-[34px] items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Ellipsis className="size-5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[220px] overflow-hidden rounded-xl bg-background py-1 text-foreground shadow-[0_0_15px_rgb(101_119_134/0.2),0_0_3px_1px_rgb(101_119_134/0.15)]"
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenu.Item
                key={item.label}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-4 py-3 text-[0.9375rem] font-bold outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-row-hover',
                  item.danger && 'text-danger',
                )}
              >
                {Icon ? <Icon className="size-[18px]" /> : null}
                {item.label}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
