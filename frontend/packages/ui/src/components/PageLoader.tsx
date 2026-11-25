import { Loader2 } from 'lucide-react'
import { cn } from '../lib/cn'

export function PageLoader({ message = 'Đang tải…', className }: { message?: string; className?: string }) {
  return (
    <div
      data-page-loader
      className={cn('flex min-h-48 flex-col items-center justify-center gap-3 text-[0.9375rem] text-muted-foreground', className)}
    >
      <Loader2 className="size-7 animate-spin text-primary" strokeWidth={2.4} />
      {message}
    </div>
  )
}