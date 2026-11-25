import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

/** Liên kết quay lại nhỏ phía trên trang chi tiết. */
export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="mb-3 inline-flex items-center gap-2 rounded-full px-2 py-1 -ml-2 text-[15px] font-bold text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
    >
      <ArrowLeft className="size-[18px]" /> {label}
    </Link>
  )
}
