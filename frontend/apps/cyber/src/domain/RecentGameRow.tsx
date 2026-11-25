import type { Game } from '../data/types'
import { ListRow } from '../ui'
import { GameGlyph } from './GameGlyph'

/** Một game người chơi đã chơi gần đây (lịch sử; app webview không mở game). */
export function RecentGameRow({ game }: { game: Game }) {
  return (
    <ListRow
      leading={
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
          style={{ background: `radial-gradient(80% 80% at 30% 20%, ${game.colors[0]}, ${game.colors[1]})` }}
        >
          <GameGlyph icon={game.icon} className="size-5" />
        </span>
      }
      title={game.name}
      subtitle={game.genre}
      trailing={<span className="text-xs text-ink-dim">{game.lastPlayed}</span>}
    />
  )
}
