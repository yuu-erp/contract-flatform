import { Play } from 'lucide-react'
import type { Game } from '../data/types'
import { Button, cn, ListRow, StatusDot, TONES } from '../ui'
import { GameGlyph } from './GameGlyph'

function art(game: Game) {
  return `radial-gradient(80% 80% at 30% 20%, ${game.colors[0]}, ${game.colors[1]})`
}

/** Ô game trong thư viện: ảnh vuông, nút Play khi rê chuột, tên + trạng thái READY / CẬP NHẬT. */
export function GameTile({ game, onPlay }: { game: Game; onPlay?: (g: Game) => void }) {
  const ready = game.status === 'ready'
  return (
    <button type="button" onClick={() => onPlay?.(game)} className="group flex min-w-0 flex-col justify-start self-start text-left" aria-label={`Chơi ${game.name}`}>
      <div
        className="relative grid aspect-square place-items-center rounded-[18px] border border-white/15 text-white shadow-[0_10px_24px_rgb(0_0_0/0.35)] transition group-hover:border-2 group-hover:border-white"
        style={{ background: art(game) }}
      >
        <GameGlyph icon={game.icon} className="size-11 drop-shadow-[0_6px_14px_rgb(0_0_0/0.4)]" />
        <span className="absolute inset-0 hidden place-items-center rounded-[18px] bg-black/35 group-hover:grid">
          <span className="grid size-[52px] place-items-center rounded-full bg-play text-[#04170b] shadow-[0_8px_20px_rgb(34_197_94/0.6)]">
            <Play className="size-6" />
          </span>
        </span>
      </div>
      <div className="mt-2 line-clamp-2 text-[13.5px] leading-tight font-extrabold group-hover:text-green-400">{game.name}</div>
      <div className={cn('flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.14em]', ready ? 'text-ink-dim' : 'text-warn')}>
        <StatusDot color={ready ? TONES.play : TONES.warn} className="size-1.5" />
        {ready ? 'READY' : 'CẬP NHẬT'}
      </div>
    </button>
  )
}

/** Hàng "Chơi gần đây" có nút chơi nhanh. */
export function RecentGameRow({ game, onPlay }: { game: Game; onPlay?: (g: Game) => void }) {
  return (
    <ListRow
      className="rounded-[18px] border border-edge-soft bg-surface px-3 last:border-b"
      leading={
        <span className="grid size-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: art(game) }}>
          <GameGlyph icon={game.icon} className="size-5" />
        </span>
      }
      title={game.name}
      subtitle={game.lastPlayed}
      trailing={
        <Button size="sm" variant="play" icon={<Play className="size-3.5" />} onClick={() => onPlay?.(game)}>
          Chơi
        </Button>
      }
    />
  )
}
