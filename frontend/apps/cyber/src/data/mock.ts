/**
 * Dữ liệu giả cố định (hạt giống cố định) để dựng giao diện khi module NET chưa có contract.
 * Mọi màn hình chỉ đọc qua hook trong `hooks.ts`, sau này thay nguồn dữ liệu ở đó.
 */
import type {
  Alert,
  Branch,
  CustomerRequest,
  FoodItem,
  Game,
  GameShare,
  Member,
  MemberRank,
  Pc,
  Shift,
  Voucher,
  WalletTx,
  Zone,
} from './types'

/** PRNG mulberry32 — cùng hạt giống ra cùng dữ liệu (ảnh chụp, test ổn định). */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NAMES = ['ShadowFox', 'KuroNeko', 'Bơ Sữa', 'Tèo Gaming', 'MinhKhang', 'Zed99', 'LinhCute', 'HảiĐăng', 'NightOwl', 'Quân Pro', 'Bé Na', 'TrầnVũ']
const RANKS: MemberRank[] = ['ĐỒNG', 'BẠC', 'VÀNG', 'KIM CƯƠNG']
const GAMES_PLAYED = ['Neon Arena', 'Sky Raiders', 'Iron Squad', 'Football Online']

export const ZONES: Zone[] = [
  { id: 'STD', name: 'Khu Standard', pricePerHour: 10_000 },
  { id: 'VIP', name: 'Khu VIP', pricePerHour: 15_000 },
]

function member(rand: () => number, name: string, k: number): Member {
  return {
    id: `m${k}`,
    name,
    phoneMasked: `09${Math.floor(rand() * 10)}${Math.floor(rand() * 10)} *** ${100 + Math.floor(rand() * 900)}`,
    rank: RANKS[Math.floor(rand() * RANKS.length)]!,
    mainBalance: Math.round(rand() * 60) * 1000,
    bonusBalance: Math.round(rand() * 20) * 1000,
  }
}

/** Máy của một chi nhánh: phần lớn đang chơi, vài máy trống / đặt trước / bảo trì / gọi hỗ trợ. */
export function buildPcs(seed = 21): Pc[] {
  const rand = seeded(seed)
  const plan: [string, number][] = [
    ['STD', 21],
    ['VIP', 14],
  ]
  const pcs: Pc[] = []
  let k = 0
  for (const [zoneId, count] of plan) {
    for (let n = 1; n <= count; n++) {
      k++
      const id = `${zoneId}-${String(n).padStart(2, '0')}`
      const r = rand()
      if (r < 0.06) {
        pcs.push({ id, zoneId, status: 'maintenance' })
        continue
      }
      if (r < 0.14) {
        pcs.push({ id, zoneId, status: 'reserved', reservedAt: '22:00' })
        continue
      }
      if (r < 0.32) {
        pcs.push({ id, zoneId, status: 'idle' })
        continue
      }
      const low = rand() < 0.12
      pcs.push({
        id,
        zoneId,
        status: 'in_use',
        needsHelp: rand() < 0.07,
        session: {
          member: member(rand, NAMES[k % NAMES.length]!, k),
          startedAt: `${18 + Math.floor(rand() * 4)}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`,
          elapsedSec: Math.floor(600 + rand() * 9000),
          remainingSec: low ? Math.floor(180 + rand() * 360) : Math.floor(900 + rand() * 13000),
          game: GAMES_PLAYED[Math.floor(rand() * GAMES_PLAYED.length)]!,
        },
      })
    }
  }
  // Máy demo được chọn sẵn: VIP-07 của ShadowFox.
  const vip7 = pcs.find((p) => p.id === 'VIP-07')
  if (vip7) {
    vip7.status = 'in_use'
    vip7.needsHelp = false
    vip7.session = {
      member: { id: 'm-sf', name: 'ShadowFox', phoneMasked: '0912 *** 456', rank: 'VÀNG', mainBalance: 26_500, bonusBalance: 12_000 },
      startedAt: '20:12',
      elapsedSec: 2 * 3600 + 14 * 60,
      remainingSec: 1 * 3600 + 46 * 60 + 32,
      game: 'Neon Arena',
    }
  }
  return pcs
}

export const BRANCHES: Branch[] = [
  { id: 'q1', name: 'Cyber Quận 1', pcsInUse: 58, pcsTotal: 60, revenueToday: 6_120_000 },
  { id: 'td', name: 'Cyber Thủ Đức', pcsInUse: 44, pcsTotal: 52, revenueToday: 4_380_000 },
  { id: 'gv', name: 'Cyber Gò Vấp', pcsInUse: 38, pcsTotal: 48, revenueToday: 3_560_000 },
  { id: 'bt', name: 'Cyber Bình Thạnh', pcsInUse: 29, pcsTotal: 40, revenueToday: 2_410_000 },
  { id: 'q7', name: 'Cyber Quận 7', pcsInUse: 17, pcsTotal: 40, revenueToday: 1_950_000 },
]

/** Doanh thu giờ chơi NET và nạp ví theo giờ (triệu đồng). */
export const HOURLY = {
  net: [3, 2, 1.4, 1, 0.8, 0.7, 0.9, 1.2, 1.6, 2.2, 3, 3.8, 4.6, 5.2, 5.6, 6.1, 6.6, 7.4, 8.6, 9.8, 11.5, 12.6, 12, 9.8],
  topup: [1.4, 0.9, 0.9, 0.4, 0.6, 0.2, 0.5, 0.9, 0.6, 1.4, 1.9, 1.8, 2.6, 3.1, 2.8, 3.4, 3.3, 4.1, 4.6, 5.4, 6.2, 6.1, 6.3, 5.1],
}

export const GAME_SHARES: GameShare[] = [
  { name: 'Neon Arena', genre: 'MOBA', share: 38, icon: 'swords', color: '#60a5fa' },
  { name: 'Sky Raiders', genre: 'Battle royale', share: 27, icon: 'triangle', color: '#fb923c' },
  { name: 'Iron Squad', genre: 'FPS', share: 19, icon: 'crosshair', color: '#22c55e' },
]

export const ALERTS: Alert[] = [
  { id: 'a1', tone: 'danger', title: 'STD-12 · Thủ Đức mất kết nối', detail: '4 phút trước' },
  { id: 'a2', tone: 'topup', title: 'Gò Vấp đạt 95% công suất', detail: 'Gợi ý bật giá cao điểm' },
  { id: 'a3', tone: 'help', title: 'Ca chiều Q.7 lệch quỹ −50.000 ₫', detail: 'Chờ owner duyệt' },
]

export const SHIFT: Shift = {
  name: 'Ca chiều',
  window: '14:00–22:00',
  remainingSec: 2 * 3600 + 18 * 60,
  staff: [
    { id: 's1', name: 'An' },
    { id: 's2', name: 'Bảo Anh' },
    { id: 's3', name: 'Khoa' },
  ],
  cash: 3_240_000,
  transfer: 1_860_000,
  topup: 2_150_000,
  hoursSold: 312,
}

export const REQUESTS: CustomerRequest[] = [
  { id: 'r1', kind: 'help', pcId: 'VIP-01', note: 'Không vào được game', agoMin: 1 },
  { id: 'r2', kind: 'topup', pcId: 'STD-21', amount: 50_000, method: 'transfer', ref: 'NAP-8F2K' },
  { id: 'r3', kind: 'order', pcId: 'STD-08', items: 'Mì xào bò ×1 · Sting ×2', total: 45_000 },
  { id: 'r4', kind: 'low_time', pcId: 'STD-21', remainingMin: 6, balance: 0 },
]

export const GAMES: Game[] = [
  { id: 'g1', name: 'Game Center', genre: 'Launcher', status: 'ready', colors: ['#ef4444', '#3f0d0d'], icon: 'flame' },
  { id: 'g2', name: 'Riot Client', genre: 'MOBA', status: 'ready', colors: ['#f43f5e', '#4c0519'], icon: 'swords', lastPlayed: 'Chơi 2 giờ trước' },
  { id: 'g3', name: 'Steam', genre: 'Launcher', status: 'ready', colors: ['#3b82f6', '#172554'], icon: 'cloud' },
  { id: 'g4', name: 'Counter Ops 2', genre: 'FPS', status: 'ready', colors: ['#f59e0b', '#1e3a8a'], icon: 'crosshair', lastPlayed: 'Hôm qua · 3h12' },
  { id: 'g5', name: 'Ancient Wars 2', genre: 'MOBA', status: 'ready', colors: ['#dc2626', '#450a0a'], icon: 'shield' },
  { id: 'g6', name: 'Speed Kart', genre: 'Đua xe', status: 'updating', colors: ['#facc15', '#713f12'], icon: 'car' },
  { id: 'g7', name: 'Battle Royale', genre: 'FPS', status: 'ready', colors: ['#22c55e', '#052e16'], icon: 'triangle' },
  { id: 'g8', name: 'Beat Rush', genre: 'Âm nhạc', status: 'ready', colors: ['#ec4899', '#500724'], icon: 'music' },
  { id: 'g9', name: 'Football Online', genre: 'Thể thao', status: 'ready', colors: ['#4ade80', '#14532d'], icon: 'trophy', lastPlayed: '3 ngày trước' },
  { id: 'g10', name: 'Pixel Farm', genre: 'Thể thao', status: 'ready', colors: ['#a3e635', '#1a2e05'], icon: 'sprout' },
]

export const FOODS: FoodItem[] = [
  { id: 'f1', name: 'Mì trộn', note: 'Mì trộn trứng', price: 30_000, category: 'Mì', soldOut: true, hue: 30 },
  { id: 'f2', name: 'Aquafina', note: 'Nước suối 500ml', price: 10_000, category: 'Nước', hue: 200 },
  { id: 'f3', name: 'Cơm chiên dương châu', note: 'Kèm trứng ốp la', price: 35_000, category: 'Cơm', hue: 40 },
  { id: 'f4', name: 'Cơm tấm', note: 'Sườn nướng', price: 30_000, category: 'Cơm', hue: 18 },
  { id: 'f5', name: 'Sting dâu', note: 'Lon 330ml', price: 15_000, category: 'Nước', hue: 350 },
  { id: 'f6', name: 'Mì xào bò', note: 'Bò tái, rau cải', price: 35_000, category: 'Mì', hue: 20 },
  { id: 'f7', name: 'Cà phê sữa đá', note: 'Pha phin', price: 20_000, category: 'Nước', hue: 28 },
  { id: 'f8', name: 'Combo cơm gà', note: 'Kèm nước ngọt', price: 45_000, category: 'Cơm', hue: 45 },
]

export const WALLET_TX: WalletTx[] = [
  { id: 't1', label: 'Nạp tiền qua tiền mặt', at: '18/11/2026 · 18:17', amount: 10_000, balanceBefore: 5_132_163 },
  { id: 't2', label: 'Nạp tiền qua tiền mặt', at: '14/11/2026 · 12:05', amount: 10_000, balanceBefore: 5_184_247 },
  { id: 't3', label: 'Nạp tiền qua tiền mặt', at: '14/11/2026 · 12:04', amount: 5_000_000, balanceBefore: 184_247 },
  { id: 't4', label: 'Nạp tiền qua ngân hàng', at: '10/11/2026 · 14:33', amount: 20_000, balanceBefore: 327_191 },
  { id: 't5', label: 'Nạp tiền qua ngân hàng', at: '10/11/2026 · 14:37', amount: 10_000, balanceBefore: 317_191 },
]

export const VOUCHERS: Voucher[] = [
  { id: 'v1', title: 'Dùng 1.000 xu thưởng đổi 10.000 xu chính', expires: '30/11/2026', used: true },
  { id: 'v2', title: 'Giảm 20% gói đêm (22:00–06:00)', expires: '15/12/2026' },
]

export const VOUCHER_SHOP: Voucher[] = [
  { id: 'vs1', title: 'Đổi 2.000 xu thưởng lấy 1 giờ chơi VIP', expires: '31/12/2026', cost: 2_000 },
  { id: 'vs2', title: 'Đổi 1.000 xu thưởng lấy 10.000 xu chính', expires: '31/12/2026', cost: 1_000 },
  { id: 'vs3', title: 'Đổi 5.000 xu thưởng lấy combo cơm gà', expires: '31/12/2026', cost: 5_000 },
]

export const PLAYER: Member = {
  id: 'm-yuu',
  name: 'yuu',
  phoneMasked: '04102e…4ccd',
  rank: 'BẠC',
  mainBalance: 5_056_507,
  bonusBalance: 42_000,
}
