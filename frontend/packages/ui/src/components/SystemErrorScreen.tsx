import { CloudOff, Loader2, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../lib/cn'

/**
 * Màn "Lỗi hệ thống": RPC / chain không kết nối được. Có nút Thử lại và tự thử lại theo chu kỳ.
 */
export function SystemErrorScreen({
  title = 'Không kết nối được hệ thống',
  description = 'Chain hoặc RPC đang tạm ngưng nên chưa đọc được dữ liệu. Vui lòng thử lại sau ít phút.',
  detail,
  onRetry,
  retrying = false,
  autoRetrySeconds = 30,
  className,
}: {
  title?: string
  description?: string
  /** Thông báo kỹ thuật (ẩn trong mục "Chi tiết"). */
  detail?: string
  onRetry?: () => void
  retrying?: boolean
  /** 0 = tắt tự thử lại. */
  autoRetrySeconds?: number
  className?: string
}) {
  const [left, setLeft] = useState(autoRetrySeconds)

  useEffect(() => {
    if (!onRetry || autoRetrySeconds <= 0 || retrying) return
    setLeft(autoRetrySeconds)
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          onRetry()
          return autoRetrySeconds
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [onRetry, autoRetrySeconds, retrying])

  return (
    <div role="alert" className={cn('mx-auto flex max-w-[440px] flex-col items-start px-8 py-12', className)}>
      <span className="flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <CloudOff className="size-7" strokeWidth={2.2} />
      </span>
      <h2 className="mt-5 text-[31px] leading-9 font-extrabold tracking-tight">{title}</h2>
      <p className="mt-2 text-[15px] text-muted-foreground">{description}</p>
      {onRetry ? (
        <>
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {retrying ? <Loader2 className="size-[18px] animate-spin" /> : <RotateCw className="size-[18px]" />}
            {retrying ? 'Đang thử lại…' : 'Thử lại'}
          </button>
          {autoRetrySeconds > 0 && !retrying ? (
            <p className="mt-3 text-[13px] text-muted-foreground">Tự thử lại sau {left} giây.</p>
          ) : null}
        </>
      ) : null}
      {detail ? (
        <details className="mt-6 w-full text-[13px] text-muted-foreground">
          <summary className="cursor-pointer select-none hover:text-foreground">Chi tiết kỹ thuật</summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-border bg-muted p-3 font-mono text-xs whitespace-pre-wrap break-all">
            {detail}
          </pre>
        </details>
      ) : null}
    </div>
  )
}
