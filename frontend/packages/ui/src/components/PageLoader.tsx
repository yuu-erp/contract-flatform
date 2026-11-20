import { Loader2 } from 'lucide-react'
import { cn } from '../lib/cn'

export function PageLoader({ message = 'Đang tải…', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground', className)}>
      <Loader2 className="size-4 animate-spin" />
      {message}
    </div>
  )
}