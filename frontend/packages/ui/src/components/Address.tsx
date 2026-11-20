import { Copy } from 'lucide-react'
import { useState } from 'react'
import { formatWalletAddress } from '@meta-platform/chain'
import { cn } from '../lib/cn'

export function Address({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const short = formatWalletAddress(value)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // bỏ qua
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={cn('inline-flex items-center gap-1 font-mono text-sm hover:underline', className)}
      title={value}
    >
      {short}
      <Copy className="size-3.5 opacity-60" aria-hidden />
      {copied ? <span className="sr-only">Đã copy</span> : null}
    </button>
  )
}