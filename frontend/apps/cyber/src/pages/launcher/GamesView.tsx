import { useMemo, useState } from 'react'
import { useLauncher } from '../../data/hooks'
import { GameTile, RecentGameRow } from '../../domain'
import { AvatarStack, Card, SearchInput, Tabs } from '../../ui'
import { ViewHead } from './ViewHead'

type Genre = 'all' | 'MOBA' | 'FPS' | 'Thể thao'

export function GamesView() {
  const { games } = useLauncher()
  const [genre, setGenre] = useState<Genre>('all')
  const [q, setQ] = useState('')
  const shown = useMemo(
    () => games.filter((g) => (genre === 'all' || g.genre === genre) && g.name.toLowerCase().includes(q.trim().toLowerCase())),
    [games, genre, q],
  )
  const recent = games.filter((g) => g.lastPlayed)
  return (
    <>
      <ViewHead title="Danh sách game">
        <Tabs
          className="ml-2"
          items={[
            { value: 'all', label: 'Tất cả' },
            { value: 'MOBA', label: 'MOBA' },
            { value: 'FPS', label: 'FPS' },
            { value: 'Thể thao', label: 'Thể thao' },
          ]}
          value={genre}
          onChange={setGenre}
        />
        <div className="flex-1" />
        <SearchInput value={q} onChange={setQ} placeholder="Tìm kiếm game…" className="w-[200px]" />
      </ViewHead>
      <div className="mt-4 grid grid-cols-[1fr_300px] gap-[18px]">
        <div className="grid grid-cols-5 content-start gap-x-3.5 gap-y-4">
          {shown.map((g) => (
            <GameTile key={g.id} game={g} />
          ))}
          {shown.length === 0 ? <p className="col-span-5 py-10 text-center text-ink-muted">Không có game khớp.</p> : null}
        </div>
        <div>
          <div className="caption mb-2">Chơi gần đây</div>
          <div className="flex flex-col gap-2">
            {recent.map((g) => (
              <RecentGameRow key={g.id} game={g} />
            ))}
          </div>
          <div className="caption mt-4 mb-2">Đang hot tại quán</div>
          <Card className="bg-[radial-gradient(90%_120%_at_90%_0%,rgb(96_165_250/0.45),transparent_60%)] p-3.5">
            <div className="text-[15px] font-extrabold">Giải MOBA Q.1</div>
            <div className="text-[11.5px] text-ink-dim">Còn 2 ngày · 64/64 đội</div>
            <div className="mt-2.5">
              <AvatarStack names={['Kuro', 'Bơ', 'Tèo', 'Minh']} size={26} extra="+38 người đang chơi" />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
