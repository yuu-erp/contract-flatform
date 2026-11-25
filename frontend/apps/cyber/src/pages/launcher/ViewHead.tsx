import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

/** Đầu màn trong cửa sổ launcher: nút quay lại tròn, tiêu đề, phần phải. */
export function ViewHead({ title, back, children }: { title: string; back?: boolean; children?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-3.5">
      {back ? (
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => navigate('/launcher')}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-edge-soft bg-black/30 hover:bg-white/10"
        >
          <ArrowLeft className="size-5" />
        </button>
      ) : null}
      <h1 className="text-xl font-extrabold whitespace-nowrap">{title}</h1>
      {children}
    </div>
  )
}
