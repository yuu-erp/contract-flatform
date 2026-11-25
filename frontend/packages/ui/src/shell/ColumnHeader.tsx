import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'
import { useShell } from './shell-context'

/** Header dính đầu cột giữa: nền mờ, tiêu đề đậm, nút quay lại, tab bên dưới. */
export function ColumnHeader({
  title,
  subtitle,
  back,
  right,
  children,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  /** true = quay lại trang trước; chuỗi = đường dẫn cụ thể. */
  back?: boolean | string
  right?: ReactNode
  /** Tab hoặc thanh lọc dưới tiêu đề. */
  children?: ReactNode
  className?: string
}) {
  const navigate = useNavigate()
  const shell = useShell()
  return (
    <div className={cn('sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md', className)}>
      <div className="flex min-h-[53px] items-center gap-4 px-4">
        {back ? (
          <button
            type="button"
            aria-label="Quay lại"
            onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
            className="-ml-2 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-hover"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : shell?.mobileAvatar ? (
          <button
            type="button"
            aria-label="Mở menu"
            onClick={shell.openMobileMenu}
            className="shrink-0 rounded-full sm:hidden [&>*]:!size-8"
          >
            {shell.mobileAvatar}
          </button>
        ) : null}
        <div className="min-w-0 flex-1 py-1.5">
          <h1 className="truncate text-xl leading-6 font-extrabold tracking-tight">{title}</h1>
          {subtitle ? <p className="truncate text-[13px] leading-4 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {right ? <div className="flex shrink-0 items-center gap-1">{right}</div> : null}
      </div>
      {children}
    </div>
  )
}
