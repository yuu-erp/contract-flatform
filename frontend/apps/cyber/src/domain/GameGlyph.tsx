import { Car, Cloud, Crosshair, Flame, Music, Shield, Sprout, Swords, Triangle, Trophy, type LucideIcon } from 'lucide-react'
import type { GameIcon } from '../data/types'

const ICONS: Record<GameIcon, LucideIcon> = {
  flame: Flame,
  swords: Swords,
  cloud: Cloud,
  crosshair: Crosshair,
  shield: Shield,
  car: Car,
  triangle: Triangle,
  music: Music,
  trophy: Trophy,
  sprout: Sprout,
}

/** Icon minh hoạ cho game khi chưa có icon thật của game cài trên máy. */
export function GameGlyph({ icon, className }: { icon: GameIcon; className?: string }) {
  const Icon = ICONS[icon]
  return <Icon className={className} />
}
