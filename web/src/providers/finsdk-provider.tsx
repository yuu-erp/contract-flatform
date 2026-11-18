import { useEffect, useState, type PropsWithChildren } from 'react'
import { FiaiSDK } from '@metanodejs/fiai-sdk'
import { Loader2 } from 'lucide-react'

export function FinsdkProvider({ children }: PropsWithChildren) {
  const [loadingSdk, setLoadingSdk] = useState(true)

  useEffect(() => {
    let alive = true
    void FiaiSDK.init({ basePath: '/platform-test' })
      .catch((error: unknown) => {
        console.error(error)
      })
      .finally(() => {
        if (alive) setLoadingSdk(false)
      })
    return () => {
      alive = false
    }
  }, [])

  if (loadingSdk) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang khởi tạo SDK…
      </div>
    )
  }
  return children
}
