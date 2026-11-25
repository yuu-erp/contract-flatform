import { cn } from './cn'

/** Sắc độ ổn định từ chuỗi (FNV-1a). */
export function hueOf(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0) % 360
}

export function Avatar({
  name,
  size = 40,
  shape = 'circle',
  gradient,
  className,
}: {
  name: string
  size?: number
  shape?: 'circle' | 'rounded'
  /** Ghi đè nền (vd. màu theo vai trò). */
  gradient?: string
  className?: string
}) {
  const hue = hueOf(name)
  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center font-extrabold text-white select-none', shape === 'circle' ? 'rounded-full' : 'rounded-xl', className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: gradient ?? `linear-gradient(135deg, hsl(${hue} 70% 58%), hsl(${(hue + 40) % 360} 65% 42%))`,
      }}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  )
}

/** Chồng avatar nhỏ (nhân viên trong ca, bạn bè). */
export function AvatarStack({ names, size = 30, extra }: { names: string[]; size?: number; extra?: string }) {
  return (
    <div className="flex items-center">
      {names.map((n, k) => (
        <span key={n} className="rounded-full border-2 border-[#2a1d30]" style={{ marginLeft: k ? -8 : 0 }}>
          <Avatar name={n} size={size} />
        </span>
      ))}
      {extra ? <span className="ml-2.5 text-[12.5px] text-ink-muted">{extra}</span> : null}
    </div>
  )
}
