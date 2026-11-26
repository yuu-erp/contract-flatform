import { Lock } from 'lucide-react'
import { MODULE_LABEL } from '../data/mock-owner'
import type { ModuleKey, PermissionDef } from '../data/types'
import { cn, TONES } from '../ui'
import { MODULE_TONE } from './ModuleChip'

/**
 * Quyền của một vị trí, nhóm theo module. Chỉ hiện module chi nhánh có bật (ADR 0033).
 * Quyền "chỉ Manager" luôn khoá — vị trí của nhân viên không giữ được (contract từ chối).
 */
export function PermissionMatrix({
  modules,
  catalog,
  value,
  onToggle,
  readOnly,
}: {
  modules: ModuleKey[]
  catalog: Record<ModuleKey, PermissionDef[]>
  value: Partial<Record<ModuleKey, number[]>>
  onToggle?: (module: ModuleKey, bit: number) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      {modules.map((m) => {
        const on = new Set(value[m] ?? [])
        return (
          <div key={m}>
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-extrabold tracking-wider uppercase" style={{ color: TONES[MODULE_TONE[m]] }}>
              {MODULE_LABEL[m]}
              <span className="text-ink-dim normal-case">· {on.size} quyền</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {catalog[m].map((p) => {
                const checked = on.has(p.bit)
                const locked = p.managerOnly
                return (
                  <button
                    key={p.bit}
                    type="button"
                    disabled={readOnly || locked}
                    onClick={() => onToggle?.(m, p.bit)}
                    title={locked ? 'Chỉ Manager / chủ agent — không gán cho vị trí' : undefined}
                    className={cn(
                      'inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition',
                      locked
                        ? 'cursor-not-allowed border-dashed border-edge-soft text-ink-dim'
                        : checked
                          ? 'border-play/60 bg-play/15 text-play'
                          : 'border-edge-soft bg-sunken text-ink-muted hover:text-ink',
                      readOnly && !locked && 'cursor-default',
                    )}
                  >
                    {locked ? <Lock className="size-3" /> : null}
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
