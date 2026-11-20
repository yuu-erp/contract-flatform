import { FiaiSDK } from '@metanodejs/fiai-sdk'
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react'

interface FinsdkContextType {
  loadingSdk: boolean
}

const FinsdkContext = createContext<FinsdkContextType | null>(null)

export function FinsdkProvider({
  basePath,
  children,
}: PropsWithChildren<{ basePath: string }>) {
  const [loadingSdk, setLoadingSdk] = useState(true)

  useEffect(() => {
    void FiaiSDK.init({ basePath })
      .catch(console.error)
      .finally(() => setLoadingSdk(false))
  }, [basePath])

  if (loadingSdk) {
    return <p className="p-6 text-sm text-muted-foreground">Đang khởi tạo ví…</p>
  }

  return <FinsdkContext value={{ loadingSdk }}>{children}</FinsdkContext>
}

export function useFinsdkContext() {
  const ctx = use(FinsdkContext)
  if (!ctx) throw new Error('useFinsdkContext must be used within FinsdkProvider')
  return ctx
}