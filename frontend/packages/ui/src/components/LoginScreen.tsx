import { Button } from '../primitives/button'
import { cn } from '../lib/cn'

export function LoginScreen({
  title = 'Kết nối ví',
  description = 'Dashboard cần ví Meta để đọc dữ liệu on-chain.',
  onConnect,
  pending = false,
  className,
}: {
  title?: string
  description?: string
  onConnect: () => void
  pending?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center', className)}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="max-w-md text-muted-foreground">{description}</p>
      <Button onClick={onConnect} disabled={pending}>
        {pending ? 'Đang mở ví…' : 'Kết nối ví'}
      </Button>
    </div>
  )
}