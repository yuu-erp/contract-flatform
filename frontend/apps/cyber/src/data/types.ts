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

/** Phiên chơi hiện tại của người chơi (máy đang ngồi). */
export type PlayerSession = {
  pcId: string
  zoneName: string
  pricePerHour: number
  startedAt: string
  usedSec: number
  remainingSec: number
}

export type FoodItem = { id: string; name: string; note: string; price: number; category: string; soldOut?: boolean; hue: number }

export type WalletTx = { id: string; label: string; at: string; amount: number; balanceBefore: number }

export type Voucher = { id: string; title: string; expires: string; cost?: number; used?: boolean }

export type Alert = { id: string; tone: 'danger' | 'topup' | 'help'; title: string; detail: string }

export type GameShare = { name: string; genre: string; share: number; icon: GameIcon; color: string }

// ─── Owner: chi nhánh, nhân sự, ca, tiền, hội viên, cấu hình ───────────

/** Module dịch vụ (khớp Registry: 1 NET, 2 IQR, 3 Loyalty). 0 = quyền nền tảng. */
export type ModuleKey = 'core' | 'net' | 'iqr' | 'loyalty'

export type BranchDetail = Branch & {
  address: string
  status: 'active' | 'suspended'
  modules: ModuleKey[]
  managers: string[]
  staffCount: number
  overtimeCapMin: number
  taxBps: { net: number; iqr: number }
  methods: { cash: boolean; transfer: boolean; card: boolean; wallet: boolean }
}

export type PermissionDef = { bit: number; label: string; managerOnly?: boolean }

export type Position = {
  id: string
  branchId: string
  name: string
  active: boolean
  /** Quyền theo module: danh sách bit. */
  perms: Partial<Record<ModuleKey, number[]>>
}

export type StaffRole = 'manager' | 'staff'

export type StaffMember = {
  id: string
  name: string
  username: string
  role: StaffRole
  branchId: string
  /** Phân công (ca, vị trí). Manager không cần. */
  assignments: { shiftId: string; positionId: string }[]
  onDuty?: { shiftId: string; positionId: string; since: string; overtimeMin: number; handoverTo?: string }
}

export type WorkShift = {
  id: string
  branchId: string
  name: string
  start: string
  end: string
  /** 0 = Thứ 2 … 6 = Chủ nhật */
  weekdays: number[]
  active: boolean
}

export type CashCloseout = {
  id: string
  branchId: string
  staff: string
  shift: string
  date: string
  expected: number
  counted: number
  receivedBy?: string
  status: 'pending' | 'approved'
}

export type MemberRow = Member & {
  points: number
  lastVisit: string
  homeBranch: string
  blocked?: boolean
  buckets: { branchId: string; amount: number }[]
}

export type ModuleRevenue = { module: 'net' | 'iqr'; gross: number; discount: number; refund: number; tax: number }

export type BranchRevenue = {
  branchId: string
  net: number
  iqr: number
  topup: number
  servedHere: number
  cash: number
  transfer: number
  card: number
}

export type PricePlan = { zoneId: string; branchId: string; pricePerHour: number; nightPrice: number }

export type TimePackage = { id: string; name: string; hours: number; price: number; zone: string; window: string; active: boolean }

export type Campaign = {
  id: string
  name: string
  kind: 'cashback' | 'voucher' | 'happy_hour' | 'bonus_topup'
  detail: string
  period: string
  branches: string
  status: 'running' | 'scheduled' | 'ended'
  used: number
}

export type AuditEntry = {
  id: string
  at: string
  actor: string
  role: 'owner' | 'manager' | 'staff' | 'system'
  branch: string
  kind: 'money' | 'staff' | 'config' | 'member'
  action: string
  detail: string
}
