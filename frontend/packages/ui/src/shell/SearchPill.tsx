import { Search, X } from 'lucide-react'
import { cn } from '../lib/cn'

/** Ô tìm kiếm bo tròn kiểu X. */
export function SearchPill({
  value,
  onChange,
  placeholder = 'Tìm kiếm',
  onSubmit,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSubmit?: (value: string) => void
  className?: string
}) {
  return (
    <form
      role="search"
      className={cn(
        'group flex h-11 items-center gap-3 rounded-full border border-transparent bg-muted px-4 focus-within:border-primary focus-within:bg-background',
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(value)
      }}
    >
      <Search className="size-[18px] shrink-0 text-muted-foreground group-focus-within:text-primary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
      />
      {value ? (
        <button
          type="button"
          aria-label="Xoá"
          onClick={() => onChange('')}
          className="flex size-[22px] items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <X className="size-3.5" strokeWidth={3} />
        </button>
      ) : null}
    </form>
  )
}
