/**
 * Dữ liệu giả cho các màn Owner. Mô hình bám contract đã chốt:
 * vị trí giữ quyền theo module (Permission), ca lặp theo thứ + phiên trực có tăng ca / giao ca (Duty),
 * doanh thu theo module (Ledger.moduleRollup), túi ví theo chi nhánh nạp.
 */
import { BRANCHES } from './mock'
import type {
  AuditEntry,
  BranchDetail,
  BranchRevenue,
  Campaign,
  CashCloseout,
  MemberRow,
  ModuleKey,
  ModuleRevenue,
  PermissionDef,
  Position,
  PricePlan,
  StaffMember,
  TimePackage,
  WorkShift,
} from './types'

export const MODULE_LABEL: Record<ModuleKey, string> = {
  core: 'Nền tảng',
  net: 'NET',
  iqr: 'IQR',
  loyalty: 'Loyalty',
}

/** Danh mục quyền theo module. Nền tảng khớp `ModuleCatalog` (0x7FF, chỉ Manager 0x700). NET/IQR là bản nháp. */
export const PERMISSION_CATALOG: Record<ModuleKey, PermissionDef[]> = {
  core: [
    { bit: 0, label: 'Đăng ký khách' },
    { bit: 1, label: 'Sửa hồ sơ khách' },
    { bit: 2, label: 'Cấp OTP đăng nhập' },
    { bit: 3, label: 'Đặt lại mật khẩu' },
    { bit: 4, label: 'Nhận tiền mặt nạp ví' },
    { bit: 5, label: 'Xác nhận chuyển khoản' },
    { bit: 6, label: 'Mở / đóng két' },
    { bit: 7, label: 'Xem doanh thu' },
    { bit: 8, label: 'Hoàn tiền', managerOnly: true },
    { bit: 9, label: 'Chặn / mở khách', managerOnly: true },
    { bit: 10, label: 'Điều chỉnh doanh thu', managerOnly: true },
  ],
  net: [
    { bit: 0, label: 'Mở máy' },
    { bit: 1, label: 'Tắt máy' },
    { bit: 2, label: 'Chuyển máy' },
    { bit: 3, label: 'Gia hạn giờ' },
    { bit: 4, label: 'Đặt máy trước' },
    { bit: 5, label: 'Bảo trì máy' },
    { bit: 6, label: 'Sửa giá giờ', managerOnly: true },
  ],
  iqr: [
    { bit: 0, label: 'Nhận đơn' },
    { bit: 1, label: 'Trả món' },
    { bit: 2, label: 'Huỷ món' },
    { bit: 3, label: 'Gộp / tách bàn' },
    { bit: 4, label: 'Sửa thực đơn', managerOnly: true },
  ],
  loyalty: [
    { bit: 0, label: 'Đổi điểm' },
    { bit: 1, label: 'Tặng voucher' },
    { bit: 2, label: 'Sửa quy tắc tích điểm', managerOnly: true },
  ],
}

const ADDR: Record<string, string> = {
  q1: '12 Lê Lợi, Q.1',
  td: '88 Võ Văn Ngân, Thủ Đức',
  gv: '301 Quang Trung, Gò Vấp',
  bt: '45 Xô Viết Nghệ Tĩnh, Bình Thạnh',
  q7: '9 Nguyễn Thị Thập, Q.7',
}

export const BRANCH_DETAILS: BranchDetail[] = BRANCHES.map((b, i) => ({
  ...b,
  address: ADDR[b.id] ?? '',
  status: b.id === 'q7' ? 'suspended' : 'active',
  modules: i < 2 ? ['net', 'iqr', 'loyalty'] : i < 4 ? ['net', 'loyalty'] : ['net'],
  managers: [['Trần Hùng'], ['Lê My'], ['Phạm Đạt'], ['Ngô Vy'], []][i] ?? [],
  staffCount: [9, 7, 6, 5, 3][i] ?? 0,
  overtimeCapMin: i === 0 ? 240 : i === 1 ? 180 : 240,
  taxBps: { net: 0, iqr: i < 2 ? 800 : 0 },
  methods: { cash: true, transfer: true, card: i < 2, wallet: true },
}))

export const SHIFTS: WorkShift[] = [
  { id: 'sh1', branchId: 'q1', name: 'Ca sáng', start: '06:00', end: '14:00', weekdays: [0, 1, 2, 3, 4, 5, 6], active: true },
  { id: 'sh2', branchId: 'q1', name: 'Ca chiều', start: '14:00', end: '22:00', weekdays: [0, 1, 2, 3, 4, 5, 6], active: true },
  { id: 'sh3', branchId: 'q1', name: 'Ca đêm', start: '22:00', end: '06:00', weekdays: [4, 5], active: true },
  { id: 'sh4', branchId: 'td', name: 'Ca ngày', start: '08:00', end: '18:00', weekdays: [0, 1, 2, 3, 4, 5, 6], active: true },
  { id: 'sh5', branchId: 'td', name: 'Ca tối', start: '18:00', end: '02:00', weekdays: [0, 1, 2, 3, 4, 5, 6], active: true },
  { id: 'sh6', branchId: 'gv', name: 'Ca hành chính', start: '09:00', end: '21:00', weekdays: [0, 1, 2, 3, 4, 5], active: true },
]

export const POSITIONS: Position[] = [
  { id: 'p1', branchId: 'q1', name: 'Thu ngân', active: true, perms: { core: [0, 1, 2, 4, 5, 6], net: [0, 3], iqr: [] } },
  { id: 'p2', branchId: 'q1', name: 'Phục vụ', active: true, perms: { core: [], net: [], iqr: [0, 1, 3] } },
  { id: 'p3', branchId: 'q1', name: 'Kỹ thuật', active: true, perms: { core: [], net: [0, 1, 2, 5] } },
  { id: 'p4', branchId: 'q1', name: 'Trưởng ca', active: true, perms: { core: [0, 1, 2, 3, 4, 5, 6, 7], net: [0, 1, 2, 3, 4, 5], iqr: [0, 1, 2, 3] } },
  { id: 'p5', branchId: 'td', name: 'Thu ngân', active: true, perms: { core: [0, 2, 4, 5, 6], net: [0, 3] } },
  { id: 'p6', branchId: 'td', name: 'Bếp', active: true, perms: { iqr: [0, 1] } },
  { id: 'p7', branchId: 'q1', name: 'Bảo vệ (cũ)', active: false, perms: {} },
]

export const STAFF: StaffMember[] = [
  { id: 'u1', name: 'Trần Hùng', username: 'hung.tran', role: 'manager', branchId: 'q1', assignments: [] },
  { id: 'u2', name: 'Nguyễn Lan', username: 'lan.nguyen', role: 'staff', branchId: 'q1', assignments: [{ shiftId: 'sh1', positionId: 'p1' }, { shiftId: 'sh2', positionId: 'p2' }], onDuty: { shiftId: 'sh1', positionId: 'p1', since: '05:52', overtimeMin: 38, handoverTo: 'Lê Minh' } },
  { id: 'u3', name: 'Lê Minh', username: 'minh.le', role: 'staff', branchId: 'q1', assignments: [{ shiftId: 'sh2', positionId: 'p1' }], onDuty: { shiftId: 'sh2', positionId: 'p1', since: '14:40', overtimeMin: 0 } },
  { id: 'u4', name: 'Đỗ Khoa', username: 'khoa.do', role: 'staff', branchId: 'q1', assignments: [{ shiftId: 'sh1', positionId: 'p3' }, { shiftId: 'sh2', positionId: 'p3' }], onDuty: { shiftId: 'sh2', positionId: 'p3', since: '13:50', overtimeMin: 0 } },
  { id: 'u5', name: 'Vũ Bảo Anh', username: 'baoanh', role: 'staff', branchId: 'q1', assignments: [{ shiftId: 'sh2', positionId: 'p2' }], onDuty: { shiftId: 'sh2', positionId: 'p2', since: '14:05', overtimeMin: 0 } },
  { id: 'u6', name: 'Hồ An', username: 'an.ho', role: 'staff', branchId: 'q1', assignments: [{ shiftId: 'sh3', positionId: 'p4' }] },
  { id: 'u7', name: 'Lê My', username: 'my.le', role: 'manager', branchId: 'td', assignments: [] },
  { id: 'u8', name: 'Phan Tú', username: 'tu.phan', role: 'staff', branchId: 'td', assignments: [{ shiftId: 'sh4', positionId: 'p5' }], onDuty: { shiftId: 'sh4', positionId: 'p5', since: '07:55', overtimeMin: 0 } },
  { id: 'u9', name: 'Mai Bếp', username: 'mai.bep', role: 'staff', branchId: 'td', assignments: [{ shiftId: 'sh4', positionId: 'p6' }] },
  { id: 'u10', name: 'Tạ Quang', username: 'quang.ta', role: 'staff', branchId: 'gv', assignments: [] },
]

export const CLOSEOUTS: CashCloseout[] = [
  { id: 'c1', branchId: 'q1', staff: 'Nguyễn Lan', shift: 'Ca sáng', date: 'Hôm nay', expected: 3_240_000, counted: 3_240_000, receivedBy: 'Lê Minh', status: 'pending' },
  { id: 'c2', branchId: 'td', staff: 'Phan Tú', shift: 'Ca tối', date: 'Hôm qua', expected: 2_180_000, counted: 2_150_000, receivedBy: 'Phan Tú', status: 'pending' },
  { id: 'c3', branchId: 'q1', staff: 'Đỗ Khoa', shift: 'Ca chiều', date: 'Hôm qua', expected: 4_020_000, counted: 4_020_000, receivedBy: 'Hồ An', status: 'approved' },
  { id: 'c4', branchId: 'gv', staff: 'Tạ Quang', shift: 'Ca hành chính', date: 'Hôm qua', expected: 1_760_000, counted: 1_790_000, receivedBy: 'Phạm Đạt', status: 'approved' },
]

const MEMBER_NAMES = ['ShadowFox', 'KuroNeko', 'Bơ Sữa', 'Tèo Gaming', 'MinhKhang', 'Zed99', 'LinhCute', 'HảiĐăng', 'NightOwl', 'Quân Pro', 'Bé Na', 'TrầnVũ']
const RANKS = ['ĐỒNG', 'BẠC', 'VÀNG', 'KIM CƯƠNG'] as const

export const MEMBERS: MemberRow[] = MEMBER_NAMES.map((name, i) => {
  const home = BRANCHES[i % BRANCHES.length]!.id
  const main = ((i * 37) % 90) * 1000 + 5000
  const second = i % 3 === 0 ? ((i * 13) % 40) * 1000 : 0
  return {
    id: `m${i + 1}`,
    name,
    phoneMasked: `09${(i * 7) % 10}${(i * 3) % 10} *** ${100 + ((i * 97) % 900)}`,
    rank: RANKS[(i * 5) % 4]!,
    mainBalance: main + second,
    bonusBalance: ((i * 11) % 25) * 1000,
    points: (i * 173) % 2400,
    lastVisit: i < 4 ? 'Hôm nay' : i < 8 ? `${i - 2} ngày trước` : `${i} ngày trước`,
    homeBranch: home,
    blocked: i === 9,
    buckets: [{ branchId: home, amount: main }, ...(second ? [{ branchId: 'td', amount: second }] : [])],
  }
})

export const MODULE_REVENUE: ModuleRevenue[] = [
  { module: 'net', gross: 18_420_000, discount: 620_000, refund: 140_000, tax: 0 },
  { module: 'iqr', gross: 6_980_000, discount: 310_000, refund: 85_000, tax: 517_000 },
]

export const BRANCH_REVENUE: BranchRevenue[] = BRANCHES.map((b, i) => ({
  branchId: b.id,
  net: b.revenueToday,
  iqr: i < 2 ? [4_120_000, 2_860_000][i]! : 0,
  topup: [3_480_000, 2_510_000, 1_840_000, 1_220_000, 810_000][i] ?? 0,
  servedHere: [420_000, 610_000, 180_000, 90_000, 0][i] ?? 0,
  cash: [2_900_000, 2_100_000, 1_500_000, 1_000_000, 700_000][i] ?? 0,
  transfer: [3_400_000, 2_600_000, 1_700_000, 1_100_000, 900_000][i] ?? 0,
  card: i < 2 ? [1_200_000, 700_000][i]! : 0,
}))

/** Tổng xu đang nợ khách (ví trả trước) — Ledger.walletLiability. */
export const WALLET_LIABILITY = 42_760_000

export const PRICE_PLANS: PricePlan[] = BRANCHES.flatMap((b, i) => [
  { zoneId: 'STD', branchId: b.id, pricePerHour: 10_000 - (i > 2 ? 1_000 : 0), nightPrice: 8_000 },
  { zoneId: 'VIP', branchId: b.id, pricePerHour: 15_000 - (i > 2 ? 2_000 : 0), nightPrice: 12_000 },
])

export const TIME_PACKAGES: TimePackage[] = [
  { id: 'tp1', name: 'Combo 3 giờ', hours: 3, price: 27_000, zone: 'Standard', window: 'Cả ngày', active: true },
  { id: 'tp2', name: 'Combo 5 giờ', hours: 5, price: 42_000, zone: 'Standard', window: 'Cả ngày', active: true },
  { id: 'tp3', name: 'Qua đêm', hours: 8, price: 60_000, zone: 'Standard', window: '22:00–06:00', active: true },
  { id: 'tp4', name: 'VIP 3 giờ', hours: 3, price: 40_000, zone: 'VIP', window: 'Cả ngày', active: true },
  { id: 'tp5', name: 'Sinh viên sáng', hours: 4, price: 28_000, zone: 'Standard', window: '08:00–12:00', active: false },
]

export const CAMPAIGNS: Campaign[] = [
  { id: 'cp1', name: 'Hoàn 10% giờ chơi', kind: 'cashback', detail: '10% chi tiêu ví → điểm thưởng', period: '01/11 – 31/12', branches: 'Mọi chi nhánh', status: 'running', used: 1_284 },
  { id: 'cp2', name: 'Nạp 200k tặng 20k', kind: 'bonus_topup', detail: 'Tặng xu thưởng hạn 30 ngày', period: '15/11 – 15/12', branches: 'Q1, Thủ Đức', status: 'running', used: 312 },
  { id: 'cp3', name: 'Giờ vàng 9h–11h', kind: 'happy_hour', detail: 'Giảm 30% giá giờ khu Standard', period: 'T2–T6', branches: 'Gò Vấp, Bình Thạnh', status: 'running', used: 845 },
  { id: 'cp4', name: 'Voucher mì 5k', kind: 'voucher', detail: 'Đổi 50 điểm, dùng khi gọi món', period: '01/12 – 31/12', branches: 'Q1, Thủ Đức', status: 'scheduled', used: 0 },
  { id: 'cp5', name: 'Khai trương Q7', kind: 'bonus_topup', detail: 'Nạp 100k tặng 30k', period: '01/10 – 31/10', branches: 'Quận 7', status: 'ended', used: 204 },
]

export const AUDIT: AuditEntry[] = [
  { id: 'a1', at: '14:46', actor: 'Lê Minh', role: 'staff', branch: 'q1', kind: 'staff', action: 'Nhận giao ca', detail: 'Nhận ca từ Nguyễn Lan · két 3.240.000đ khớp' },
  { id: 'a2', at: '14:40', actor: 'Lê Minh', role: 'staff', branch: 'q1', kind: 'staff', action: 'Vào ca', detail: 'Ca chiều · Thu ngân · máy quầy 1' },
  { id: 'a3', at: '14:12', actor: 'Trần Hùng', role: 'manager', branch: 'q1', kind: 'money', action: 'Hoàn tiền', detail: 'Hoàn 20.000đ cho Tèo Gaming · máy VIP-03 lỗi' },
  { id: 'a4', at: '13:58', actor: 'Nguyễn Lan', role: 'staff', branch: 'q1', kind: 'member', action: 'Cấp OTP', detail: 'Cấp OTP cho KuroNeko · hạn 10 phút' },
  { id: 'a5', at: '11:20', actor: 'Hoàng Long', role: 'owner', branch: 'td', kind: 'config', action: 'Đổi trần tăng ca', detail: 'Thủ Đức: 240 → 180 phút' },
  { id: 'a6', at: '10:05', actor: 'Trần Hùng', role: 'manager', branch: 'q1', kind: 'staff', action: 'Sửa vị trí', detail: 'Thu ngân: thêm quyền NET · Gia hạn giờ' },
  { id: 'a7', at: '09:31', actor: 'Nguyễn Lan', role: 'staff', branch: 'q1', kind: 'money', action: 'Nạp ví', detail: 'Tèo Gaming nạp 100.000đ tiền mặt' },
  { id: 'a8', at: '08:00', actor: 'Hệ thống', role: 'system', branch: 'td', kind: 'staff', action: 'Phiên hết hạn', detail: 'Phan Tú quên ra ca — chạm trần tăng ca, tự đóng' },
  { id: 'a9', at: 'Hôm qua', actor: 'Ngô Vy', role: 'manager', branch: 'bt', kind: 'member', action: 'Chặn khách', detail: 'Quân Pro · gian lận tài khoản' },
]
