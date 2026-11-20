import { cn } from '../lib/cn'

export function NoAccessScreen({
  title = 'Không có quyền',
  description = 'Ví hiện tại không đủ quyền truy cập ứng dụng này.',
  className,
}: {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn('flex min-h-[50vh] flex-col items-center justify-center gap-3 p-8 text-center', className)}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-lg text-muted-foreground">{description}</p>
    </div>
  )
}