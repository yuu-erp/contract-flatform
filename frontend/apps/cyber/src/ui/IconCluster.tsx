import type { LucideIcon } from 'lucide-react'

export type ClusterItem = { icon: LucideIcon; label: string; dot?: boolean; onClick?: () => void }

/** Cụm nút icon tròn (wifi, giỏ, chat, chuông). */
export function IconCluster({ items }: { items: ClusterItem[] }) {
  return (
    <div className="flex h-[42px] shrink-0 items-center gap-1 rounded-full border border-edge-soft bg-black/20 px-2">
      {items.map(({ icon: Icon, label, dot, onClick }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          title={label}
          onClick={onClick}
          className="relative grid size-[34px] place-items-center rounded-full text-white/90 transition hover:bg-white/10"
        >
          <Icon className="size-4" />
          {dot ? <span className="absolute top-[5px] right-[6px] size-2 rounded-full border-2 border-[#281a2c] bg-danger" /> : null}
        </button>
      ))}
    </div>
  )
}
