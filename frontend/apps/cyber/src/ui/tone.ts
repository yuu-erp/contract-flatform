/** Màu theo ngữ nghĩa — khớp token trong styles.css. */
export const TONES = {
  play: '#22c55e',
  warn: '#facc15',
  topup: '#fb923c',
  help: '#f472b6',
  reserve: '#60a5fa',
  danger: '#ef4444',
  violet: '#a78bfa',
  neutral: '#f6f3f8',
} as const

export type Tone = keyof typeof TONES

/** Nền / viền / chữ nhạt theo màu tông (dùng cho ô icon, chip trạng thái). */
export function toneSoft(tone: Tone) {
  const c = TONES[tone]
  return { background: `${c}24`, borderColor: `${c}59`, color: c }
}
