import type { PcDisplayState } from '../data/types'
import { TONES } from '../ui/tone'

/** Màu chấm + nhãn + lớp nền/viền cho từng trạng thái máy. */
export const PC_STATE: Record<PcDisplayState, { label: string; dot: string; tile: string }> = {
  playing: { label: 'Đang chơi', dot: TONES.play, tile: 'border-play/45 bg-gradient-to-b from-play/20 to-play/5' },
  low: { label: 'Sắp hết giờ', dot: TONES.warn, tile: 'border-warn/50 bg-gradient-to-b from-warn/20 to-warn/5' },
  idle: { label: 'Trống', dot: 'rgb(255 255 255 / 0.3)', tile: 'border-edge-soft bg-white/5' },
  reserved: { label: 'Đặt trước', dot: TONES.reserve, tile: 'border-dashed border-reserve/70 bg-reserve/10' },
  maintenance: {
    label: 'Bảo trì',
    dot: 'rgb(246 243 248 / 0.44)',
    tile: 'border-edge-soft opacity-55 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_6px,transparent_6px_12px)]',
  },
  help: {
    label: 'Gọi hỗ trợ',
    dot: TONES.help,
    tile: 'border-help/85 bg-gradient-to-b from-help/30 to-help/8 shadow-[0_0_22px_rgb(244_114_182/0.35)]',
  },
}
