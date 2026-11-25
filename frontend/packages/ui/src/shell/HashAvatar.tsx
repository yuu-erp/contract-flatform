import { cn } from '../lib/cn'

/** FNV-1a → sắc độ 0–359: hai chuỗi gần giống (ví khác vài ký tự cuối) vẫn ra màu khác hẳn. */
export function hashHue(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0) % 360
}

/** Ảnh nền dải màu cho ảnh bìa trang hồ sơ. */
export function hashCover(seed: string): string {
  const hue = hashHue(seed)
  return `linear-gradient(120deg, hsl(${hue} 65% 45%), hsl(${(hue + 50) % 360} 70% 35%))`
}

/** Ảnh đại diện tròn sinh màu từ chuỗi (ví, tên). */
export function HashAvatar({
  seed,
  label,
  size = 40,
  className,
}: {
  seed: string
  label?: string
  size?: number
  className?: string
}) {
  const hue = hashHue(seed)
  const text = label
    ? label.trim().slice(0, 1).toUpperCase() || '?'
    : /^0x/i.test(seed)
      ? seed.slice(-2).toUpperCase()
      : seed.trim().slice(0, 1).toUpperCase() || '?'
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none', className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 70% 42%))`,
      }}
    >
      {text}
    </span>
  )
}
