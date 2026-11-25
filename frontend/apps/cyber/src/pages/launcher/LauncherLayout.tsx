import {
  Bell,
  Bluetooth,
  Gamepad2,
  KeyRound,
  Languages,
  LogOut,
  MessageCircle,
  MonitorCog,
  ShoppingCart,
  Ticket,
  Timer,
  UtensilsCrossed,
  Wallet,
  Wifi,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { formatHms, formatNumber } from '../../data/format'
import { useCountdown, useLauncher } from '../../data/hooks'
import { GameGlyph, PromoCard } from '../../domain'
import { Backdrop } from '../../layout/Backdrop'
import { Button, Glass, IconCluster, InfoPill, navItemClass, UserChip } from '../../ui'

/** Phiên hiện tại của máy (sau lấy từ session wallet / contract NET). */
const PC_NAME = 'PC_100'
const SESSION_LEFT_SEC = 1 * 3600 + 46 * 60 + 32
const SESSION_USED = '2:14:08'

const MENU = [
  { to: '/launcher', label: 'Danh sách trò chơi', icon: Gamepad2, end: true },
  { to: '/launcher/food', label: 'Gọi món', icon: UtensilsCrossed },
  { to: '/launcher/topup', label: 'Nạp tiền', icon: Wallet },
  { to: '/launcher/vouchers', label: 'Voucher của tôi', icon: Ticket },
  { to: '/launcher/device', label: 'Cấu hình thiết bị', icon: MonitorCog },
  { to: '/launcher/password', label: 'Đổi mật khẩu', icon: KeyRound },
  { to: '/launcher/language', label: 'Ngôn ngữ', icon: Languages },
]

export function LauncherLayout() {
  const { player, games } = useLauncher()
  const left = useCountdown(SESSION_LEFT_SEC)
  return (
    <div className="relative h-dvh overflow-hidden">
      <Backdrop />

      {/* Lối tắt game trên màn hình */}
      <div className="absolute top-10 left-14 flex gap-10">
        {games.slice(0, 7).map((g) => (
          <div key={g.id} className="w-[92px] text-center">
            <div
              className="mx-auto grid size-[76px] place-items-center rounded-[18px] border border-white/20 text-white shadow-[0_10px_24px_rgb(0_0_0/0.45)]"
              style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }}
            >
              <GameGlyph icon={g.icon} className="size-8" />
            </div>
            <div className="mt-1.5 truncate text-[11.5px] font-bold [text-shadow:0_1px_4px_#000]">{g.name}</div>
          </div>
        ))}
      </div>

      {/* Khay hệ thống */}
      <div className="absolute top-5 right-6 flex items-center gap-3.5 text-[12.5px] font-semibold">
        <Bluetooth className="size-4" />
        <Wifi className="size-4" />
        <span className="relative">
          <Bell className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 size-[7px] rounded-full bg-danger" />
        </span>
        <span>Thứ 4, 26/11 · 23:42</span>
      </div>

      {/* Khối máy bên phải */}
      <aside className="absolute top-24 right-6 w-[180px] text-right">
        <div className="caption text-white/55">{player.name}</div>
        <div className="text-[28px] font-extrabold [text-shadow:0_2px_10px_#000]">{PC_NAME}</div>
        <Glass className="mt-3.5 rounded-2xl px-3.5 py-3 text-left">
          <div className="caption">Thời gian còn lại</div>
          <div className="text-2xl font-extrabold text-play">{formatHms(left)}</div>
          <div className="caption mt-2">Đã dùng</div>
          <div className="text-base font-extrabold">{SESSION_USED}</div>
        </Glass>
        <Button className="mt-3" variant="topup" block icon={<Wallet className="size-4" />}>
          Yêu cầu nạp tiền
        </Button>
        <Button className="mt-2" variant="danger" block icon={<LogOut className="size-4" />}>
          Đăng xuất
        </Button>
      </aside>

      {/* Cửa sổ chính */}
      <Glass className="absolute top-[188px] left-[70px] flex h-[660px] w-[1150px] overflow-hidden rounded-3xl">
        <nav className="flex w-[250px] shrink-0 flex-col gap-1.5 border-r border-edge-soft bg-black/10 px-3.5 py-5">
          {MENU.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => navItemClass(isActive)}>
              <Icon className="size-5 shrink-0" />
              {label}
            </NavLink>
          ))}
          <div className="flex-1" />
          <PromoCard title="Nạp 100K tặng 20K" detail="Đến hết 30/11 · ví KM" action="Nạp ngay" />
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pt-3.5 pb-4">
          <div className="flex items-center gap-2.5">
            <UserChip name={player.name} tag={player.rank} subtitle={player.phoneMasked} gradient="linear-gradient(135deg,#475569,#1e293b)" />
            <InfoPill
              items={[
                { label: 'Ví chính:', value: formatNumber(player.mainBalance) },
                { label: 'Ví KM:', value: formatNumber(player.bonusBalance), tone: 'warn' },
              ]}
              status="play"
            />
            <InfoPill tone="play" items={[{ icon: <Timer className="size-4" />, value: <span className="text-[15px]">{formatHms(left)}</span>, tone: 'play' }]} />
            <div className="flex-1" />
            <IconCluster
              items={[
                { icon: Wifi, label: 'Mạng' },
                { icon: ShoppingCart, label: 'Giỏ món' },
                { icon: MessageCircle, label: 'Chat với quầy' },
                { icon: Bell, label: 'Thông báo', dot: true },
              ]}
            />
          </div>
          <section className="min-h-0 flex-1 overflow-y-auto rounded-[22px] border border-edge-soft bg-white/[0.04] px-5 py-[18px]">
            <Outlet />
          </section>
        </div>
      </Glass>
    </div>
  )
}
