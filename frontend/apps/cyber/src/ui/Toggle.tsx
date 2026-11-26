import { cn } from './cn'

/** Công tắc bật/tắt (cấu hình). */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange?: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-play/60 bg-play/40' : 'border-edge-soft bg-sunken',
      )}
    >
      <span className={cn('absolute top-0.5 size-[18px] rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )
}
