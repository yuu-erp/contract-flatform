/** Kiểu dữ liệu nghiệp vụ NET (phòng máy). Hiện lấy từ dữ liệu giả; sau thay bằng contract/indexer. */

export type Role = 'owner' | 'manager' | 'staff' | 'player'

export type Member = {
  id: string
  name: string
  phoneMasked: string
  rank: MemberRank
  mainBalance: number
  bonusBalance: number
}

export type MemberRank = 'ĐỒNG' | 'BẠC' | 'VÀNG' | 'KIM CƯƠNG'

export type Session = {
  member: Member
  startedAt: string
  /** Giây đã chơi. */
  elapsedSec: number
  /** Giây còn lại theo số dư hiện tại. */
  remainingSec: number
  game: string
}

export type PcStatus = 'idle' | 'in_use' | 'reserved' | 'maintenance'

export type Pc = {
  id: string
  zoneId: string
  status: PcStatus
  session?: Session
  reservedAt?: string
  needsHelp?: boolean
}

/** Trạng thái hiển thị (suy ra từ Pc). */
export type PcDisplayState = 'playing' | 'low' | 'idle' | 'reserved' | 'maintenance' | 'help'

export type Zone = { id: string; name: string; pricePerHour: number }

export type Branch = {
  id: string
  name: string
  pcsInUse: number
  pcsTotal: number
  revenueToday: number
}

export type Shift = {
  name: string
  window: string
  remainingSec: number
  staff: { id: string; name: string }[]
  cash: number
  transfer: number
  topup: number
  hoursSold: number
}

export type CustomerRequest =
  | { id: string; kind: 'help'; pcId: string; note: string; agoMin: number }
  | { id: string; kind: 'topup'; pcId: string; amount: number; method: 'cash' | 'transfer'; ref: string }
  | { id: string; kind: 'order'; pcId: string; items: string; total: number }
  | { id: string; kind: 'low_time'; pcId: string; remainingMin: number; balance: number }

export type Game = {
  id: string
  name: string
  genre: string
  status: 'ready' | 'updating'
  /** Màu nền ô game (khi chưa có icon thật). */
  colors: [string, string]
  icon: GameIcon
  lastPlayed?: string
}

export type GameIcon = 'flame' | 'swords' | 'cloud' | 'crosshair' | 'shield' | 'car' | 'triangle' | 'music' | 'trophy' | 'sprout'

export type FoodItem = { id: string; name: string; note: string; price: number; category: string; soldOut?: boolean; hue: number }

export type WalletTx = { id: string; label: string; at: string; amount: number; balanceBefore: number }

export type Voucher = { id: string; title: string; expires: string; cost?: number; used?: boolean }

export type Alert = { id: string; tone: 'danger' | 'topup' | 'help'; title: string; detail: string }

export type GameShare = { name: string; genre: string; share: number; icon: GameIcon; color: string }
