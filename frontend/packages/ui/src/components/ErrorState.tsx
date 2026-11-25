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
    <div className={cn('m-4 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-[15px]', className)}>
      <p className="font-bold text-danger">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Thử lại
        </Button>
      ) : null}
    </div>
  )
}