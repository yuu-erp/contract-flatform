import { MODULE_LABEL } from '../data/mock-owner'
import type { ModuleKey } from '../data/types'
import { toneSoft, type Tone } from '../ui'

export const MODULE_TONE: Record<ModuleKey, Tone> = { core: 'neutral', net: 'reserve', iqr: 'topup', loyalty: 'violet' }

/** Nhãn module (NET / IQR / Loyalty / Nền tảng). */
export function ModuleChip({ module, off }: { module: ModuleKey; off?: boolean }) {
  return (
    <span
      className="inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-extrabold whitespace-nowrap"
      style={off ? { borderColor: 'rgb(255 255 255 / 0.12)', color: 'rgb(255 255 255 / 0.35)' } : toneSoft(MODULE_TONE[module])}
    >
      {MODULE_LABEL[module]}
    </span>
  )
}

/** Nhãn trạng thái ngắn có màu. */
export function StatePill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-extrabold whitespace-nowrap" style={toneSoft(tone)}>
      {children}
    </span>
  )
}
