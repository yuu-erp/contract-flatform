import { Button } from '../primitives/button'
import { cn } from '../lib/cn'

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm', className)}>
      <p className="font-medium text-destructive">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Thử lại
        </Button>
      ) : null}
    </div>
  )
}